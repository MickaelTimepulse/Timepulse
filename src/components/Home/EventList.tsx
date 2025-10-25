import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Event {
  id: string;
  name: string;
  slug: string;
  city: string;
  start_date: string;
  image_url: string | null;
  event_type: string;
}

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getDaysUntilEvent = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getBlurClass = (index: number) => {
    if (index === 0) return '';
    if (index === 1) return 'blur-[1px]';
    if (index === 2) return 'blur-[2px]';
    return 'blur-[3px]';
  };

  const getSportColor = (sportType: string) => {
    const colors: { [key: string]: string } = {
      'running': 'bg-blue-500',
      'trail': 'bg-green-600',
      'triathlon': 'bg-purple-600',
      'cycling': 'bg-yellow-500',
      'swimming': 'bg-cyan-500',
      'obstacle': 'bg-red-600',
      'walking': 'bg-teal-500',
      'other': 'bg-gray-600'
    };
    return colors[sportType] || colors['other'];
  };

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, slug, city, start_date, image_url, event_type')
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(10);

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <section id="events" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Événements à venir</h2>
            <p className="mt-4 text-lg text-gray-600">Chargement...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Événements à venir</h2>
          <p className="mt-4 text-lg text-gray-600">
            Découvrez les prochaines courses et événements sportifs
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-12"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {events.map((event, index) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all overflow-hidden border border-gray-200 flex-shrink-0 w-80"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${getBlurClass(index)}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className={`absolute top-4 left-4 px-3 py-1.5 ${getSportColor(event.event_type)} rounded-lg text-xs font-bold text-white uppercase tracking-wide shadow-lg`}>
                  {event.event_type}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors line-clamp-2">
                  {event.name}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-pink-500" />
                    <span>{formatDate(event.start_date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-cyan-500" />
                    <span>{event.city}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-pink-600 font-semibold text-sm">
                  <span>Voir l'événement</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
          </div>
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun événement disponible pour le moment</p>
          </div>
        )}
      </div>
    </section>
  );
}
