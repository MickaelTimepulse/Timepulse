import AdminLayout from '../components/Admin/AdminLayout';
import { FileText, Download, Filter } from 'lucide-react';

export default function AdminEntries() {
  return (
    <AdminLayout title="Inscriptions">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inscriptions</h1>
            <p className="text-gray-600 mt-1">Gérez toutes les inscriptions aux événements</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700">
            <Download className="w-5 h-5" />
            <span>Exporter</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Module en construction</h3>
          <p className="text-gray-600">La gestion des inscriptions sera bientôt disponible.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
