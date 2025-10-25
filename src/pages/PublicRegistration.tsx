import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PublicRegistrationForm from '../components/PublicRegistrationForm';
import { CreditCard, Check, AlertCircle, Facebook, MessageCircle, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PublicRegistration() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRaceId = searchParams.get('race');
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [eventData, setEventData] = useState<any>(null);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    if (!eventId) return;

    const { data } = await supabase
      .from('events')
      .select('name, event_date, location_city')
      .eq('id', eventId)
      .single();

    if (data) {
      setEventData(data);
    }
  };

  const handleRegistrationComplete = (data: any) => {
    setRegistrationData(data);
  };

  const handlePayment = async (method: 'card' | 'apple_pay' | 'google_pay') => {
    if (!registrationData) return;

    setProcessing(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { supabase } = await import('../lib/supabase');

      const athleteData = {
        first_name: registrationData.athlete_data.first_name,
        last_name: registrationData.athlete_data.last_name,
        birthdate: registrationData.athlete_data.birthdate,
        gender: registrationData.athlete_data.gender,
        email: registrationData.athlete_data.email,
        phone: registrationData.athlete_data.phone,
        address_line1: registrationData.athlete_data.address_line1,
        city: registrationData.athlete_data.city,
        postal_code: registrationData.athlete_data.postal_code,
        country_code: registrationData.athlete_data.country || 'FR',
        license_type: registrationData.athlete_data.license_type,
        license_id: registrationData.athlete_data.license_number,
        license_club: registrationData.athlete_data.license_club,
        consent_data_processing: registrationData.athlete_data.consent_data_processing,
        consent_marketing: registrationData.athlete_data.consent_marketing,
      };

      const { data: athlete, error: athleteError } = await supabase
        .from('athletes')
        .insert(athleteData)
        .select()
        .single();

      if (athleteError) throw athleteError;

      const { data: organizerData } = await supabase
        .from('organizers')
        .select('admin_user_id')
        .eq('id', registrationData.organizer_id)
        .single();

      const entryData = {
        athlete_id: athlete.id,
        event_id: registrationData.event_id,
        race_id: registrationData.race_id,
        organizer_id: registrationData.organizer_id,
        category: registrationData.category,
        source: 'online',
        status: 'confirmed',
        created_by: organizerData?.admin_user_id,
        created_by_type: 'organizer',
      };

      const { data: entry, error: entryError } = await supabase
        .from('entries')
        .insert(entryData)
        .select()
        .single();

      if (entryError) throw entryError;

      const paymentData = {
        entry_id: entry.id,
        payment_status: 'paid',
        amount_paid: (registrationData.total_price_cents + registrationData.commission_cents) / 100,
        paid_at: new Date().toISOString(),
        payment_method: method,
      };

      const { error: paymentError } = await supabase
        .from('entry_payments')
        .insert(paymentData);

      if (paymentError) throw paymentError;

      if (registrationData.selected_options && Object.keys(registrationData.selected_options).length > 0) {
        const optionsToInsert = Object.entries(registrationData.selected_options).map(([optionId, selection]: [string, any]) => ({
          entry_id: entry.id,
          option_id: optionId,
          choice_id: selection.choice_id || null,
          value: selection.value || null,
          quantity: selection.quantity || 1,
          price_paid_cents: 0,
        }));

        const { error: optionsError } = await supabase
          .from('registration_options')
          .insert(optionsToInsert);

        if (optionsError) throw optionsError;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Erreur lors de l\'inscription:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    const eventUrl = eventData?.slug
      ? `${window.location.origin}/events/${eventData.slug}`
      : window.location.origin;
    const shareText = eventData
      ? `Je viens de m'inscrire à ${eventData.name} ! Rejoins-moi pour cette aventure sportive 🏃‍♂️`
      : "Je viens de m'inscrire à un événement sportif ! Rejoins-moi !";

    const handleFacebookShare = () => {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
        '_blank',
        'width=600,height=400'
      );
    };

    const handleWhatsAppShare = () => {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + eventUrl)}`,
        '_blank'
      );
    };

    const handleSnapchatShare = () => {
      window.open(
        `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(eventUrl)}`,
        '_blank'
      );
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Check className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Félicitations ! 🎉
            </h2>

            <p className="text-xl text-gray-700 mb-2">
              Votre inscription est confirmée
            </p>

            <p className="text-gray-600 mb-8">
              Merci pour votre confiance ! Vous allez recevoir un email de confirmation avec tous les détails de votre inscription.
            </p>

            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                Partagez avec vos amis !
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Invitez vos amis à vous rejoindre pour vivre cette aventure ensemble
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleFacebookShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Facebook className="w-5 h-5" />
                  <span className="font-medium">Facebook</span>
                </button>

                <button
                  onClick={handleWhatsAppShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">WhatsApp</span>
                </button>

                <button
                  onClick={handleSnapchatShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">Snap</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate(`/events/${eventId}`)}
              className="w-full py-4 px-6 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 font-semibold text-lg transition"
            >
              Retour à l'événement
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!registrationData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <PublicRegistrationForm
          eventId={eventId || ''}
          organizerId=""
          onComplete={handleRegistrationComplete}
          preselectedRaceId={preselectedRaceId || undefined}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Paiement sécurisé</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Récapitulatif</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Montant de l'inscription:</span>
                <span className="font-medium">
                  {(registrationData.total_price_cents / 100).toFixed(2)}€
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frais de service:</span>
                <span className="font-medium">
                  {(registrationData.commission_cents / 100).toFixed(2)}€
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-xl font-bold text-pink-600">
                  <span>Total à payer:</span>
                  <span>
                    {((registrationData.total_price_cents + registrationData.commission_cents) / 100).toFixed(2)}€
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg mb-4">Choisissez votre méthode de paiement</h3>

            <button
              onClick={() => handlePayment('card')}
              disabled={processing}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-pink-600 hover:bg-pink-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <CreditCard className="w-6 h-6 text-gray-600" />
              <span className="font-medium">Carte bancaire</span>
            </button>

            <button
              onClick={() => handlePayment('apple_pay')}
              disabled={processing}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-pink-600 hover:bg-pink-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white text-xs font-bold">

              </div>
              <span className="font-medium">Apple Pay</span>
            </button>

            <button
              onClick={() => handlePayment('google_pay')}
              disabled={processing}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-pink-600 hover:bg-pink-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600">G</span>
              </div>
              <span className="font-medium">Google Pay</span>
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Paiement sécurisé par Stripe</p>
            <p className="mt-1">Vos informations bancaires sont protégées</p>
          </div>

          {processing && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-pink-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600">Traitement du paiement en cours...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
