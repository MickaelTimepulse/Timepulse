import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

export default function Stats() {
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [chronometeredEvents, setChronometeredEvents] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Calculate years of experience since 2009
  const calculateYearsOfExperience = () => {
    const foundingYear = 2009;
    const currentYear = new Date().getFullYear();
    return currentYear - foundingYear;
  };

  // Fetch total number of races (épreuves) from database
  const fetchTotalRaces = async () => {
    try {
      const { count, error } = await supabase
        .from('races')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return (count || 0) + 4888; // Base number + current races
    } catch (err) {
      console.error('Error fetching races:', err);
      return 4888;
    }
  };

  // Fetch total number of registrations
  const fetchTotalRegistrations = async () => {
    try {
      const { count, error } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return (count || 0) + 1600000; // Base number + current registrations
    } catch (err) {
      console.error('Error fetching registrations:', err);
      return 1600000;
    }
  };

  // Easing function for smooth deceleration
  const easeOutQuad = (t: number): number => {
    return t * (2 - t);
  };

  // Animate counter with easing
  const animateValue = (
    start: number,
    end: number,
    duration: number,
    setter: (value: number) => void,
    isDecimal: boolean = false
  ) => {
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuad(progress);

      const current = start + (end - start) * easedProgress;

      if (isDecimal) {
        setter(Math.round(current * 10) / 10);
      } else {
        setter(Math.floor(current));
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setter(end);
      }
    };

    requestAnimationFrame(animate);
  };

  // Intersection Observer to trigger animation when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);

            // Start animations
            const years = calculateYearsOfExperience();
            animateValue(0, years, 2000, setYearsOfExperience);

            // Fetch and animate dynamic values
            fetchTotalRaces().then((total) => {
              animateValue(0, total, 2500, setChronometeredEvents);
            });

            fetchTotalRegistrations().then((total) => {
              animateValue(0, total, 2500, setTotalParticipants);
            });

            animateValue(0, 99.9, 2000, setSatisfaction, true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [hasAnimated]);

  const formatNumber = (num: number, forceFullNumber: boolean = false): string => {
    if (forceFullNumber) {
      return num.toLocaleString('fr-FR');
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${Math.floor(num / 1000)}K+`;
    }
    return num.toString();
  };

  const stats = [
    {
      value: yearsOfExperience > 0 ? `${yearsOfExperience}` : '0',
      label: 'Années d\'expérience',
      suffix: ''
    },
    {
      value: chronometeredEvents > 0 ? formatNumber(chronometeredEvents, true) : '0',
      label: 'Événements chronométrés',
      suffix: ''
    },
    {
      value: totalParticipants > 0 ? formatNumber(totalParticipants) : '0',
      label: 'Participants inscrits',
      suffix: ''
    },
    {
      value: satisfaction > 0 ? satisfaction.toFixed(1) : '0',
      label: 'Satisfaction client',
      suffix: '%'
    },
  ];

  return (
    <section ref={sectionRef} className="py-16 bg-gradient-to-r from-pink-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-pink-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
