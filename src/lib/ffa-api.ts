/**
 * Service d'intégration API FFA (Fédération Française d'Athlétisme)
 *
 * IMPORTANT: Ce service nécessite un compte API FFA
 * Contact: https://www.athle.fr ou informatique@athle.fr
 *
 * Documentation API: https://api.athle.fr/docs (si disponible)
 */

import { supabase } from './supabase';

interface FFALicenseResponse {
  valid: boolean;
  licenseNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: 'M' | 'F';
  category: string; // SEM, V1M, ESF, etc.
  club: string;
  expirationDate: string;
  hasPPS: boolean;
  ppsExpirationDate?: string;
  medicalCertificateDate?: string;
  errorMessage?: string;
}

interface FFAVerificationCache {
  licenseNumber: string;
  data: FFALicenseResponse;
  cachedAt: string;
  expiresAt: string;
}

/**
 * Vérifie une licence FFA via l'API officielle
 */
export async function verifyFFALicense(
  licenseNumber: string,
  useCache: boolean = true
): Promise<FFALicenseResponse> {
  try {
    // Nettoyer le numéro de licence (enlever espaces, tirets)
    const cleanLicense = licenseNumber.replace(/[\s-]/g, '');

    // Vérifier le format (exemple: 1234567890 ou 1234-567890)
    if (!isValidFFALicenseFormat(cleanLicense)) {
      return {
        valid: false,
        licenseNumber: cleanLicense,
        firstName: '',
        lastName: '',
        birthDate: '',
        gender: 'M',
        category: '',
        club: '',
        expirationDate: '',
        hasPPS: false,
        errorMessage: 'Format de licence invalide',
      };
    }

    // Chercher dans le cache si autorisé
    if (useCache) {
      const cached = await getFFACachedVerification(cleanLicense);
      if (cached) {
        console.log('FFA verification: using cache');
        return cached;
      }
    }

    // Appeler l'API FFA
    const apiKey = import.meta.env.VITE_FFA_API_KEY;
    if (!apiKey) {
      console.warn('FFA_API_KEY not configured, using mock data');
      return await mockFFAVerification(cleanLicense);
    }

    // VRAI APPEL API FFA
    const response = await fetch(`https://api.athle.fr/v1/license/${cleanLicense}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`FFA API error: ${response.status}`);
    }

    const data = await response.json();

    // Mapper la réponse API FFA vers notre format
    const result: FFALicenseResponse = {
      valid: data.valid === true,
      licenseNumber: data.numero_licence || cleanLicense,
      firstName: data.prenom || '',
      lastName: data.nom || '',
      birthDate: data.date_naissance || '',
      gender: data.sexe === 'M' || data.sexe === 'F' ? data.sexe : 'M',
      category: data.categorie || calculateFFACategory(data.date_naissance, data.sexe),
      club: data.club || '',
      expirationDate: data.date_fin_validite || '',
      hasPPS: data.pps === true,
      ppsExpirationDate: data.pps_date_fin || undefined,
      medicalCertificateDate: data.certificat_medical_date || undefined,
    };

    // Sauvegarder dans le cache (valide 24h)
    await saveFFAVerificationToCache(cleanLicense, result);

    // Logger dans la base
    await logFFAVerification(result, null);

    return result;

  } catch (error) {
    console.error('Error verifying FFA license:', error);

    const errorResult: FFALicenseResponse = {
      valid: false,
      licenseNumber,
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: 'M',
      category: '',
      club: '',
      expirationDate: '',
      hasPPS: false,
      errorMessage: error instanceof Error ? error.message : 'Erreur inconnue',
    };

    await logFFAVerification(errorResult, error instanceof Error ? error.message : null);

    return errorResult;
  }
}

/**
 * Vérifie si une licence FFA est valide (sans appel API, juste vérif DB)
 */
export async function checkFFALicenseValidity(athleteId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('check_ffa_license_validity', { p_athlete_id: athleteId });

  if (error) {
    console.error('Error checking FFA license validity:', error);
    return false;
  }

  return data === true;
}

/**
 * Vérifie si le PPS est requis pour une course donnée
 */
export async function requirePPSForRace(raceId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('require_pps_for_race', { p_race_id: raceId });

  if (error) {
    console.error('Error checking PPS requirement:', error);
    return false;
  }

  return data === true;
}

/**
 * Met à jour les informations FFA d'un athlète
 */
export async function updateAthletFFAInfo(
  athleteId: string,
  ffaData: Partial<FFALicenseResponse>
): Promise<void> {
  const { error } = await supabase
    .from('athletes')
    .update({
      ffa_license_number: ffaData.licenseNumber,
      ffa_license_valid_until: ffaData.expirationDate,
      has_pps: ffaData.hasPPS,
      pps_expiration_date: ffaData.ppsExpirationDate,
      medical_certificate_date: ffaData.medicalCertificateDate,
      ffa_category: ffaData.category,
      ffa_verified_at: new Date().toISOString(),
    })
    .eq('id', athleteId);

  if (error) {
    throw new Error(`Failed to update FFA info: ${error.message}`);
  }
}

/**
 * Récupère les licences FFA expirant bientôt
 */
export async function getExpiringFFALicenses() {
  const { data, error } = await supabase
    .from('ffa_licenses_expiring_soon')
    .select('*');

  if (error) {
    console.error('Error fetching expiring licenses:', error);
    return [];
  }

  return data;
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Valide le format d'un numéro de licence FFA
 */
function isValidFFALicenseFormat(license: string): boolean {
  // Format FFA typique: 10 chiffres ou format avec tiret
  // Exemple: 1234567890 ou 1234-567890
  return /^\d{10}$/.test(license) || /^\d{4}-\d{6}$/.test(license);
}

/**
 * Calcule la catégorie FFA selon la date de naissance
 */
function calculateFFACategory(birthDate: string, gender: 'M' | 'F'): string {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();

  const suffix = gender === 'M' ? 'M' : 'F';

  if (age < 10) return 'EA' + suffix; // Enfants
  if (age < 12) return 'PO' + suffix; // Poussins
  if (age < 14) return 'BE' + suffix; // Benjamins
  if (age < 16) return 'MI' + suffix; // Minimes
  if (age < 18) return 'CA' + suffix; // Cadets
  if (age < 20) return 'JU' + suffix; // Juniors
  if (age < 23) return 'ES' + suffix; // Espoirs
  if (age < 40) return 'SE' + suffix; // Seniors
  if (age < 50) return 'V1' + suffix; // Vétérans 1
  if (age < 60) return 'V2' + suffix; // Vétérans 2
  if (age < 70) return 'V3' + suffix; // Vétérans 3
  return 'V4' + suffix; // Vétérans 4
}

/**
 * Récupère une vérification FFA depuis le cache
 */
async function getFFACachedVerification(licenseNumber: string): Promise<FFALicenseResponse | null> {
  const { data, error } = await supabase
    .rpc('get_ffa_cached_verification', {
      p_license_number: licenseNumber,
      p_verification_type: 'license',
    });

  if (error || !data) {
    return null;
  }

  return data as FFALicenseResponse;
}

/**
 * Sauvegarde une vérification FFA dans le cache
 */
async function saveFFAVerificationToCache(
  licenseNumber: string,
  result: FFALicenseResponse
): Promise<void> {
  const cacheUntil = new Date();
  cacheUntil.setHours(cacheUntil.getHours() + 24); // Cache 24h

  await supabase.from('ffa_verification_logs').insert({
    license_number: licenseNumber,
    verification_type: 'license',
    api_response: result,
    is_valid: result.valid,
    verified_data: result,
    cache_until: cacheUntil.toISOString(),
  });
}

/**
 * Log une vérification FFA dans la base
 */
async function logFFAVerification(
  result: FFALicenseResponse,
  errorMessage: string | null
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from('ffa_verification_logs').insert({
    license_number: result.licenseNumber,
    verification_type: 'license',
    api_response: result,
    is_valid: result.valid,
    error_message: errorMessage,
    verified_data: result,
    verified_by: user?.id,
  });
}

/**
 * Données de test en développement (quand pas d'API key)
 */
async function mockFFAVerification(licenseNumber: string): Promise<FFALicenseResponse> {
  console.warn('Using mock FFA verification - configure VITE_FFA_API_KEY for production');

  // Simuler un délai API
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    valid: true,
    licenseNumber,
    firstName: 'Jean',
    lastName: 'Dupont',
    birthDate: '1990-05-15',
    gender: 'M',
    category: 'SEM',
    club: 'AC Exemple',
    expirationDate: '2025-12-31',
    hasPPS: true,
    ppsExpirationDate: '2025-12-31',
    medicalCertificateDate: '2024-09-01',
  };
}

/**
 * Exporte les statistiques de vérification FFA
 */
export async function getFFAVerificationStats() {
  const { data, error } = await supabase
    .from('ffa_verification_stats')
    .select('*')
    .limit(30);

  if (error) {
    console.error('Error fetching FFA stats:', error);
    return [];
  }

  return data;
}

/**
 * Formate un numéro de licence FFA pour affichage
 */
export function formatFFALicense(license: string): string {
  const clean = license.replace(/[\s-]/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }
  return license;
}
