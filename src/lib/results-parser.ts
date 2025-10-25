/**
 * Service de parsing des fichiers de résultats
 * Supporte: Elogica, Excel, CSV
 */

export interface ParsedResult {
  bibNumber: number;
  athleteName: string;
  gender?: 'M' | 'F' | 'X';
  category?: string;
  finishTime?: string;
  gunTime?: string;
  netTime?: string;
  status: 'finished' | 'dnf' | 'dns' | 'dsq';
  splitTimes?: Array<{
    pointName: string;
    time: string;
    distance?: number;
  }>;
}

export interface ParseResult {
  results: ParsedResult[];
  errors: Array<{
    row: number;
    error: string;
  }>;
}

/**
 * Parse un fichier CSV standard
 * Format attendu: Dossard,Nom,Prénom,Sexe,Catégorie,Temps,Statut
 */
export function parseCSV(content: string): ParseResult {
  const lines = content.split('\n').filter(line => line.trim());
  const results: ParsedResult[] = [];
  const errors: Array<{ row: number; error: string }> = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    try {
      const parts = lines[i].split(/[,;]/);

      if (parts.length < 3) {
        errors.push({ row: i + 1, error: 'Ligne invalide: pas assez de colonnes' });
        continue;
      }

      const bibNumber = parseInt(parts[0]?.trim() || '0');
      if (!bibNumber || bibNumber <= 0) {
        errors.push({ row: i + 1, error: 'Numéro de dossard invalide' });
        continue;
      }

      const lastName = parts[1]?.trim() || '';
      const firstName = parts[2]?.trim() || '';
      const athleteName = `${firstName} ${lastName}`.trim();

      if (!athleteName) {
        errors.push({ row: i + 1, error: 'Nom athlète manquant' });
        continue;
      }

      const gender = parts[3]?.trim()?.toUpperCase();
      const category = parts[4]?.trim();
      const finishTime = parts[5]?.trim();
      const statusStr = parts[6]?.trim()?.toLowerCase();

      let status: ParsedResult['status'] = 'finished';
      if (statusStr === 'dnf' || statusStr === 'abandon') status = 'dnf';
      else if (statusStr === 'dns' || statusStr === 'absent') status = 'dns';
      else if (statusStr === 'dsq' || statusStr === 'disqualifié') status = 'dsq';

      results.push({
        bibNumber,
        athleteName,
        gender: gender === 'M' || gender === 'F' ? gender : undefined,
        category: category || undefined,
        finishTime: finishTime || undefined,
        status,
      });
    } catch (error) {
      errors.push({
        row: i + 1,
        error: `Erreur de parsing: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
    }
  }

  return { results, errors };
}

/**
 * Parse un export Elogica (format spécifique XML ou CSV enrichi)
 * Elogica produit généralement un CSV avec colonnes supplémentaires
 */
export function parseElogica(content: string): ParseResult {
  const lines = content.split('\n').filter(line => line.trim());
  const results: ParsedResult[] = [];
  const errors: Array<{ row: number; error: string }> = [];

  // Détecter le format (CSV ou XML)
  if (content.trim().startsWith('<?xml')) {
    return parseElogicaXML(content);
  }

  // Format CSV Elogica
  // Colonnes typiques: Dossard;Nom;Prénom;Sexe;Cat;Club;TpsGun;TpsNet;ClsScr;ClsSexe;ClsCat
  for (let i = 1; i < lines.length; i++) {
    try {
      const parts = lines[i].split(';');

      if (parts.length < 7) {
        errors.push({ row: i + 1, error: 'Format Elogica invalide' });
        continue;
      }

      const bibNumber = parseInt(parts[0]?.trim() || '0');
      if (!bibNumber || bibNumber <= 0) {
        errors.push({ row: i + 1, error: 'Numéro de dossard invalide' });
        continue;
      }

      const lastName = parts[1]?.trim() || '';
      const firstName = parts[2]?.trim() || '';
      const athleteName = `${firstName} ${lastName}`.trim();

      if (!athleteName) {
        errors.push({ row: i + 1, error: 'Nom athlète manquant' });
        continue;
      }

      const gender = parts[3]?.trim()?.toUpperCase();
      const category = parts[4]?.trim();
      const gunTime = parts[6]?.trim(); // Temps pistolet
      const netTime = parts[7]?.trim(); // Temps net

      results.push({
        bibNumber,
        athleteName,
        gender: gender === 'M' || gender === 'F' ? gender : undefined,
        category: category || undefined,
        gunTime: gunTime || undefined,
        netTime: netTime || undefined,
        finishTime: netTime || gunTime || undefined,
        status: 'finished',
      });
    } catch (error) {
      errors.push({
        row: i + 1,
        error: `Erreur de parsing: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
    }
  }

  return { results, errors };
}

/**
 * Parse un export Elogica XML
 */
function parseElogicaXML(content: string): ParseResult {
  const results: ParsedResult[] = [];
  const errors: Array<{ row: number; error: string }> = [];

  try {
    // Simple parsing XML sans dépendance externe
    const resultMatches = content.matchAll(/<result>(.*?)<\/result>/gs);

    let rowIndex = 1;
    for (const match of resultMatches) {
      try {
        const resultXML = match[1];

        const bibNumber = parseInt(extractXMLTag(resultXML, 'bib') || '0');
        const firstName = extractXMLTag(resultXML, 'firstname') || '';
        const lastName = extractXMLTag(resultXML, 'lastname') || '';
        const athleteName = `${firstName} ${lastName}`.trim();
        const gender = extractXMLTag(resultXML, 'gender')?.toUpperCase();
        const category = extractXMLTag(resultXML, 'category');
        const finishTime = extractXMLTag(resultXML, 'time');

        if (!bibNumber || !athleteName) {
          errors.push({ row: rowIndex, error: 'Données incomplètes' });
          rowIndex++;
          continue;
        }

        results.push({
          bibNumber,
          athleteName,
          gender: gender === 'M' || gender === 'F' ? gender : undefined,
          category: category || undefined,
          finishTime: finishTime || undefined,
          status: 'finished',
        });
        rowIndex++;
      } catch (error) {
        errors.push({
          row: rowIndex,
          error: `Erreur XML: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        });
        rowIndex++;
      }
    }
  } catch (error) {
    errors.push({
      row: 0,
      error: `Erreur parsing XML: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    });
  }

  return { results, errors };
}

/**
 * Extrait le contenu d'un tag XML simple
 */
function extractXMLTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Parse un fichier Excel (converti en CSV côté client avant upload)
 * Ou utilise la lib xlsx si besoin
 */
export function parseExcel(content: string): ParseResult {
  // Pour l'instant, on assume que Excel est converti en CSV côté client
  // Si besoin d'un vrai parsing Excel, utiliser la lib 'xlsx'
  return parseCSV(content);
}

/**
 * Détecte automatiquement le format du fichier
 */
export function detectFormat(filename: string, content: string): 'elogica' | 'excel' | 'csv' {
  const lower = filename.toLowerCase();

  if (content.trim().startsWith('<?xml')) {
    return 'elogica';
  }

  if (lower.includes('elogica') || lower.includes('elog')) {
    return 'elogica';
  }

  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    return 'excel';
  }

  return 'csv';
}

/**
 * Parse automatiquement selon le format détecté
 */
export function parseResults(filename: string, content: string): ParseResult {
  const format = detectFormat(filename, content);

  switch (format) {
    case 'elogica':
      return parseElogica(content);
    case 'excel':
      return parseExcel(content);
    case 'csv':
    default:
      return parseCSV(content);
  }
}

/**
 * Valide un temps au format HH:MM:SS ou MM:SS
 */
export function validateTimeFormat(time: string): boolean {
  return /^\d{1,2}:\d{2}(:\d{2})?$/.test(time);
}

/**
 * Convertit un temps en secondes
 */
export function timeToSeconds(time: string): number | null {
  if (!validateTimeFormat(time)) return null;

  const parts = time.split(':').map(p => parseInt(p, 10));

  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  }

  return null;
}

/**
 * Formate un nombre de secondes en HH:MM:SS
 */
export function secondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
}
