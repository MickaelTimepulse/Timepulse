import { useState } from 'react';
import { Search, MapPin, Calendar } from 'lucide-react';

export default function Hero() {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const sports = [
    'Running', 'Trail', 'Triathlon', 'Swimrun', 'Cyclisme', 'Marche',
    'Natation', 'Duathlon', 'Raid', 'Canicross'
  ];

  const regions = [
    'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne',
    'Centre-Val de Loire', 'Corse', 'Grand Est', 'Hauts-de-France',
    'Île-de-France', 'Normandie', 'Nouvelle-Aquitaine', 'Occitanie',
    'Pays de la Loire', "Provence-Alpes-Côte d'Azur"
  ];

  return (
    <div className="relative bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight animate-title" style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", letterSpacing: '-0.02em' }}>
            {'Trouvez votre prochain défi!'.split('').map((char, index) => (
              <span
                key={index}
                className="inline-block animate-wave"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  display: char === ' ' ? 'inline' : 'inline-block'
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Mois
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="">Tous les mois</option>
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-2" />
                  Sport
                </label>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="">Tous les sports</option>
                  {sports.map((sport) => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Région
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="">Toutes les régions</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>

            <button className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg flex items-center justify-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Rechercher</span>
            </button>
          </div>

          <div className="text-center mt-8">
            <p className="text-white/90 text-lg sm:text-xl font-medium tracking-wide">
              Timepulse, solution de billetterie et chronométrage sportif
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
