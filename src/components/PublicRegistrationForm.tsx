import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Calendar, Mail, Phone, MapPin, Home, CreditCard, FileText, AlertCircle } from 'lucide-react';
import { loadCountries, type Country } from '../lib/countries';
import { checkCategoryRestriction } from '../lib/category-calculator';

interface Race {
  id: string;
  name: string;
  distance: string;
  elevation_gain: number;
  max_participants: number;
  current_participants: number;
}

interface RaceOption {
  id: string;
  type: string;
  label: string;
  description: string;
  image_url?: string;
  is_required: boolean;
  is_question: boolean;
  price_cents: number;
  choices: Array<{
    id: string;
    label: string;
    description: string;
    price_modifier_cents: number;
    has_quantity_limit: boolean;
    max_quantity: number;
    current_quantity: number;
  }>;
}

interface LicenseType {
  id: string;
  name: string;
  code: string;
}

interface PricingPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface RacePricing {
  id: string;
  license_type_id: string;
  pricing_period_id: string;
  price_cents: number;
  license_types: LicenseType;
}

interface PublicRegistrationFormProps {
  eventId: string;
  organizerId: string;
  onComplete: (data: any) => void;
  preselectedRaceId?: string;
}

export default function PublicRegistrationForm({ eventId, organizerId, onComplete, preselectedRaceId }: PublicRegistrationFormProps) {
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string>(preselectedRaceId || '');
  const [raceOptions, setRaceOptions] = useState<RaceOption[]>([]);
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
  const [pricingPeriods, setPricingPeriods] = useState<PricingPeriod[]>([]);
  const [racePricing, setRacePricing] = useState<RacePricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    birthdate: '',
    gender: 'M',
    email: '',
    phone: '',
    address_line1: '',
    city: '',
    postal_code: '',
    country_code: 'FR',
    license_type: '',
    license_id: '',
    license_club: '',
    consent_data_processing: false,
    consent_marketing: false,
    organizer_id: '',
    nationality: 'FRA',
    is_anonymous: false,
  });

  const [selectedOptions, setSelectedOptions] = useState<Record<string, { choice_id?: string; value?: string; quantity: number }>>({});
  const [categoryError, setCategoryError] = useState<string>('');
  const [eventDate, setEventDate] = useState<Date>(new Date());

  useEffect(() => {
    loadCountriesData();
    loadRaces();
    loadLicenseTypes();
    loadPricingPeriods();
    loadEventOrganizer();
  }, [eventId]);

  const loadEventOrganizer = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single();

    if (!error && data) {
      setFormData(prev => ({ ...prev, organizer_id: data.organizer_id }));
    }
  };

  useEffect(() => {
    if (selectedRaceId) {
      loadRaceOptions();
      loadRacePricing();
    }
  }, [selectedRaceId]);

  const loadCountriesData = async () => {
    const countriesData = await loadCountries();
    setCountries(countriesData);
  };

  const loadRaces = async () => {
    const [racesRes, eventRes] = await Promise.all([
      supabase
        .from('races')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', 'active')
        .order('distance'),
      supabase
        .from('events')
        .select('start_date')
        .eq('id', eventId)
        .single()
    ]);

    if (!racesRes.error && racesRes.data) {
      setRaces(racesRes.data);
    }

    if (!eventRes.error && eventRes.data) {
      setEventDate(new Date(eventRes.data.start_date));
    }
  };

  const loadRaceOptions = async () => {
    const { data, error } = await supabase
      .from('race_options')
      .select(`
        *,
        race_option_choices (*)
      `)
      .eq('race_id', selectedRaceId)
      .eq('active', true)
      .order('display_order');

    if (!error && data) {
      const options = data.map((opt: any) => ({
        ...opt,
        choices: (opt.race_option_choices || []).sort((a: any, b: any) => a.display_order - b.display_order)
      }));
      console.log('Loaded race options:', options);
      setRaceOptions(options);
    } else if (error) {
      console.error('Error loading race options:', error);
    }
  };

  const loadLicenseTypes = async () => {
    const { data, error } = await supabase
      .from('license_types')
      .select('*')
      .order('name');

    if (!error && data) {
      setLicenseTypes(data);
    }
  };

  const loadPricingPeriods = async () => {
    const { data, error } = await supabase
      .from('pricing_periods')
      .select('*')
      .order('start_date');

    if (!error && data) {
      setPricingPeriods(data);
    }
  };

  const loadRacePricing = async () => {
    const { data, error } = await supabase
      .from('race_pricing')
      .select('*, license_types (*)')
      .eq('race_id', selectedRaceId)
      .eq('active', true);

    if (!error && data) {
      setRacePricing(data);
    }
  };

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const determineCategory = () => {
    if (!formData.birthdate) return 'Adulte';
    const age = calculateAge(formData.birthdate);
    const gender = formData.gender;

    if (age < 18) return 'Junior';
    if (age < 23) return 'Espoir';
    if (age < 40) return gender === 'M' ? 'Senior H' : 'Senior F';
    if (age < 50) return gender === 'M' ? 'V1 H' : 'V1 F';
    if (age < 60) return gender === 'M' ? 'V2 H' : 'V2 F';
    return gender === 'M' ? 'V3 H' : 'V3 F';
  };

  const calculateTotalPrice = () => {
    let total = 0;

    const activePeriod = pricingPeriods.find(p => p.is_active);
    if (activePeriod && formData.license_type) {
      const pricing = racePricing.find(
        p => p.license_type_id === formData.license_type && p.pricing_period_id === activePeriod.id
      );
      if (pricing) {
        total += pricing.price_cents;
      }
    }

    Object.entries(selectedOptions).forEach(([optionId, selection]) => {
      const option = raceOptions.find(o => o.id === optionId);
      if (option) {
        if (selection.choice_id) {
          const choice = option.choices.find(c => c.id === selection.choice_id);
          if (choice) {
            total += option.price_cents + choice.price_modifier_cents;
          }
        } else {
          total += option.price_cents * selection.quantity;
        }
      }
    });

    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCategoryError('');

    try {
      if (!formData.birthdate) {
        alert('Veuillez saisir votre date de naissance');
        setLoading(false);
        return;
      }

      const categoryCheck = await checkCategoryRestriction(
        selectedRaceId,
        formData.birthdate,
        eventDate
      );

      if (!categoryCheck.allowed) {
        setCategoryError(categoryCheck.message || 'Catégorie non autorisée');
        setLoading(false);
        return;
      }

      const sessionToken = crypto.randomUUID();
      const category = determineCategory();
      const totalPriceCents = calculateTotalPrice();

      const { data: activeCommission } = await supabase.rpc('get_active_commission');
      const commissionCents = activeCommission || 99;

      const registrationData = {
        event_id: eventId,
        race_id: selectedRaceId,
        organizer_id: formData.organizer_id || organizerId,
        athlete_data: { ...formData, age_category: categoryCheck.category },
        category,
        session_token: sessionToken,
      };

      onComplete({
        ...registrationData,
        total_price_cents: totalPriceCents,
        commission_cents: commissionCents,
        selected_options: selectedOptions,
        race_options: raceOptions,
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'inscription:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Inscription à l'événement</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {!preselectedRaceId && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Choix de l'épreuve</h2>

            <div className="space-y-4">
              {races.map((race) => (
                <label
                  key={race.id}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                    selectedRaceId === race.id
                      ? 'border-pink-600 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="race"
                    value={race.id}
                    checked={selectedRaceId === race.id}
                    onChange={(e) => setSelectedRaceId(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{race.name}</h3>
                      <p className="text-gray-600">
                        {race.distance} • D+ {race.elevation_gain}m
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {race.current_participants}/{race.max_participants} inscrits
                      </p>
                      {(() => {
                        const activePeriod = pricingPeriods.find(p => p.is_active);
                        if (activePeriod && formData.license_type) {
                          const pricing = racePricing.find(
                            p => p.license_type_id === formData.license_type &&
                                 p.pricing_period_id === activePeriod.id
                          );
                          if (pricing) {
                            return (
                              <p className="text-lg font-semibold text-pink-600 mt-1">
                                {(pricing.price_cents / 100).toFixed(2)}€
                              </p>
                            );
                          }
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Informations personnelles</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date de naissance *
                </label>
                <input
                  type="date"
                  required
                  value={formData.birthdate}
                  onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Genre *
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="M">Homme</option>
                  <option value="F">Femme</option>
                  <option value="X">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationalité
                </label>
                <select
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Sélectionnez un pays</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Code pays à 3 lettres (ex: FRA, BEL, CHE)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Home className="w-4 h-4 inline mr-2" />
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Type de licence
                </label>
                <select
                  value={formData.license_type}
                  onChange={(e) => setFormData({ ...formData, license_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Sans licence</option>
                  {licenseTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.license_type && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de licence
                    </label>
                    <input
                      type="text"
                      value={formData.license_id}
                      onChange={(e) => setFormData({ ...formData, license_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Club
                    </label>
                    <input
                      type="text"
                      value={formData.license_club}
                      onChange={(e) => setFormData({ ...formData, license_club: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  required
                  checked={formData.consent_data_processing}
                  onChange={(e) => setFormData({ ...formData, consent_data_processing: e.target.checked })}
                  className="mt-1 mr-3"
                />
                <span className="text-sm text-gray-700">
                  J'accepte le traitement de mes données personnelles conformément au RGPD *
                </span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.consent_marketing}
                  onChange={(e) => setFormData({ ...formData, consent_marketing: e.target.checked })}
                  className="mt-1 mr-3"
                />
                <span className="text-sm text-gray-700">
                  J'accepte de recevoir des communications marketing de la part de l'organisateur
                </span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.is_anonymous}
                  onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                  className="mt-1 mr-3"
                />
                <span className="text-sm text-gray-700">
                  Je souhaite que mon nom reste anonyme dans la liste publique des inscrits
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="border-t pt-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Options et récapitulatif</h2>

            {raceOptions.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Options disponibles</h3>
                {raceOptions.map((option) => (
                  <div key={option.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex gap-4 items-start mb-3">
                      {option.image_url && (
                        <img
                          src={option.image_url}
                          alt={option.label}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              {option.label}
                              {option.is_required && <span className="text-red-600 ml-1">*</span>}
                            </h4>
                            {option.description && (
                              <p className="text-sm text-gray-600">{option.description}</p>
                            )}
                          </div>
                          {option.price_cents > 0 && (
                            <span className="text-pink-600 font-medium">
                              +{(option.price_cents / 100).toFixed(2)}€
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {option.is_question && option.choices.length > 0 ? (
                      <select
                        required={option.is_required}
                        value={selectedOptions[option.id]?.choice_id || ''}
                        onChange={(e) =>
                          setSelectedOptions({
                            ...selectedOptions,
                            [option.id]: { choice_id: e.target.value, quantity: 1 },
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="">Sélectionner...</option>
                        {option.choices.map((choice) => (
                          <option key={choice.id} value={choice.id}>
                            {choice.label}
                            {choice.price_modifier_cents !== 0 &&
                              ` (${choice.price_modifier_cents > 0 ? '+' : ''}${(
                                choice.price_modifier_cents / 100
                              ).toFixed(2)}€)`}
                            {choice.has_quantity_limit && choice.current_quantity >= choice.max_quantity && ' (Complet)'}
                          </option>
                        ))}
                      </select>
                    ) : option.type === 'reference_time' || option.type === 'custom' ? (
                      <input
                        type="text"
                        required={option.is_required}
                        value={selectedOptions[option.id]?.value || ''}
                        onChange={(e) =>
                          setSelectedOptions({
                            ...selectedOptions,
                            [option.id]: { value: e.target.value, quantity: 1 },
                          })
                        }
                        placeholder={option.type === 'reference_time' ? 'Ex: 00:45:30' : 'Votre réponse'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      />
                    ) : (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!!selectedOptions[option.id]}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOptions({
                                ...selectedOptions,
                                [option.id]: { quantity: 1 },
                              });
                            } else {
                              const newOptions = { ...selectedOptions };
                              delete newOptions[option.id];
                              setSelectedOptions(newOptions);
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">Oui, je souhaite cette option</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Récapitulatif</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Épreuve:</span>
                  <span className="font-medium">{races.find(r => r.id === selectedRaceId)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Participant:</span>
                  <span className="font-medium">{formData.first_name} {formData.last_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Catégorie:</span>
                  <span className="font-medium">{determineCategory()}</span>
                </div>

                <div className="border-t pt-3 mt-3 space-y-2">
                  <div className="flex justify-between">
                    <span>Tarif de base:</span>
                    <span className="font-medium">{(() => {
                      const activePeriod = pricingPeriods.find(p => p.is_active);
                      if (activePeriod && formData.license_type) {
                        const pricing = racePricing.find(
                          p => p.license_type_id === formData.license_type && p.pricing_period_id === activePeriod.id
                        );
                        if (pricing) {
                          return (pricing.price_cents / 100).toFixed(2) + '€';
                        }
                      }
                      return '0,00€';
                    })()}</span>
                  </div>

                  {Object.entries(selectedOptions).map(([optionId, selection]) => {
                    const option = raceOptions.find(o => o.id === optionId);
                    if (!option) return null;

                    let optionPrice = 0;
                    let label = option.label;

                    if (selection.choice_id) {
                      const choice = option.choices.find(c => c.id === selection.choice_id);
                      if (choice) {
                        optionPrice = option.price_cents + choice.price_modifier_cents;
                        label += ` - ${choice.label}`;
                      }
                    } else {
                      optionPrice = option.price_cents * selection.quantity;
                    }

                    if (optionPrice === 0) return null;

                    return (
                      <div key={optionId} className="flex justify-between text-xs">
                        <span className="text-gray-600">+ {label}</span>
                        <span className="font-medium">+{(optionPrice / 100).toFixed(2)}€</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Sous-total:</span>
                    <span>{(calculateTotalPrice() / 100).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Frais de service Timepulse:</span>
                    <span>0,99€</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-pink-600 mt-2 pt-2 border-t">
                    <span>Total à payer:</span>
                    <span>{((calculateTotalPrice() + 99) / 100).toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {categoryError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Restriction de catégorie</h4>
              <p className="text-sm text-red-700">{categoryError}</p>
            </div>
          </div>
        )}

        <div className="border-t pt-8">
          <button
            type="submit"
            disabled={loading || !selectedRaceId}
            className="w-full py-4 px-6 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold"
          >
            <CreditCard className="w-6 h-6" />
            {loading ? 'Traitement en cours...' : 'Procéder au paiement'}
          </button>
        </div>
      </form>
    </div>
  );
}
