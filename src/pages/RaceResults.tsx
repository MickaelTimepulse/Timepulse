import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, Download, Trophy, Clock, User, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Result {
  id: string;
  bib_number: number;
  athlete_name: string;
  gender: string;
  category: string;
  finish_time: string;
  overall_rank: number;
  gender_rank: number;
  category_rank: number;
  status: string;
}

interface Race {
  id: string;
  name: string;
  distance: number;
  event: {
    id: string;
    name: string;
  };
}

export default function RaceResults() {
  const { raceId } = useParams<{ raceId: string }>();
  const [race, setRace] = useState<Race | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'M' | 'F'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (raceId) {
      loadResults();
    }
  }, [raceId]);

  useEffect(() => {
    filterResults();
  }, [results, searchTerm, genderFilter, categoryFilter]);

  const loadResults = async () => {
    try {
      setLoading(true);

      // Charger la course
      const { data: raceData, error: raceError } = await supabase
        .from('races')
        .select('id, name, distance, event:events(id, name)')
        .eq('id', raceId)
        .single();

      if (raceError) throw raceError;
      setRace(raceData);

      // Charger les résultats
      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select('*')
        .eq('race_id', raceId)
        .eq('status', 'finished')
        .order('overall_rank', { ascending: true });

      if (resultsError) throw resultsError;

      setResults(resultsData || []);

      // Extraire les catégories uniques
      const uniqueCategories = [...new Set(
        resultsData?.map(r => r.category).filter(Boolean) || []
      )].sort();
      setCategories(uniqueCategories);

    } catch (error) {
      console.error('Erreur chargement résultats:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = [...results];

    // Filtre recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        r => r.athlete_name.toLowerCase().includes(term) ||
             r.bib_number.toString().includes(term)
      );
    }

    // Filtre genre
    if (genderFilter !== 'all') {
      filtered = filtered.filter(r => r.gender === genderFilter);
    }

    // Filtre catégorie
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }

    setFilteredResults(filtered);
  };

  const formatTime = (interval: string) => {
    if (!interval) return '-';
    // Format PostgreSQL interval: "HH:MM:SS" ou "days HH:MM:SS"
    const match = interval.match(/(\d+):(\d+):(\d+)/);
    if (match) {
      return `${match[1]}:${match[2]}:${match[3]}`;
    }
    return interval;
  };

  const exportToCSV = () => {
    const headers = ['Classement', 'Dossard', 'Nom', 'Sexe', 'Catégorie', 'Temps', 'Cls Genre', 'Cls Catégorie'];
    const rows = filteredResults.map(r => [
      r.overall_rank,
      r.bib_number,
      r.athlete_name,
      r.gender,
      r.category,
      formatTime(r.finish_time),
      r.gender_rank,
      r.category_rank,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `resultats-${race?.name || 'course'}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Course non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to={`/events/${race.event.id}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'événement
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{race.name}</h1>
              <p className="text-gray-600 mt-1">
                {race.distance} km • {results.length} participant{results.length > 1 ? 's' : ''}
              </p>
            </div>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Download className="w-5 h-5" />
              Exporter CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Podium */}
        {results.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[1, 0, 2].map((offset, idx) => {
              const result = results[offset];
              if (!result) return null;

              const heights = ['h-32', 'h-40', 'h-24'];
              const positions = ['2ème', '1er', '3ème'];
              const colors = ['bg-gray-300', 'bg-yellow-400', 'bg-orange-300'];

              return (
                <div key={result.id} className="text-center">
                  <div className={`${heights[idx]} ${colors[idx]} rounded-lg flex items-end justify-center pb-4 mb-3`}>
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900">{positions[idx]}</p>
                  <p className="text-sm text-gray-600">{result.athlete_name}</p>
                  <p className="text-sm font-mono text-gray-900">{formatTime(result.finish_time)}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom ou dossard..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtre genre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous</option>
                <option value="M">Hommes</option>
                <option value="F">Femmes</option>
              </select>
            </div>

            {/* Filtre catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Toutes</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {filteredResults.length} résultat{filteredResults.length > 1 ? 's' : ''}
            {searchTerm || genderFilter !== 'all' || categoryFilter !== 'all' ? ` (filtré${filteredResults.length > 1 ? 's' : ''})` : ''}
          </div>
        </div>

        {/* Tableau des résultats */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cls
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dossard
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Athlète
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sexe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temps
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cls Genre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cls Cat
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                        result.overall_rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        result.overall_rank === 2 ? 'bg-gray-100 text-gray-800' :
                        result.overall_rank === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-white text-gray-700'
                      }`}>
                        {result.overall_rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.bib_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {result.athlete_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {result.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {result.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-mono font-semibold text-gray-900">
                          {formatTime(result.finish_time)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {result.gender_rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {result.category_rank}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredResults.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun résultat trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
