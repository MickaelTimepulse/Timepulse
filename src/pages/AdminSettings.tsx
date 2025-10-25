import { useState, useEffect } from 'react';
import AdminLayout from '../components/Admin/AdminLayout';
import { Settings as SettingsIcon, Lock, User, Save, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updatePassword } from '../lib/auth';
import { supabase } from '../lib/supabase';

export default function AdminSettings() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [apiKeyMessage, setApiKeyMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'openai_api_key')
        .single();

      if (data?.value) {
        setOpenaiApiKey(data.value);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async function handleSaveApiKey() {
    setSavingApiKey(true);
    setApiKeyMessage(null);

    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: openaiApiKey })
        .eq('key', 'openai_api_key');

      if (error) throw error;

      setApiKeyMessage({ type: 'success', text: 'Clé API enregistrée avec succès' });
    } catch (error) {
      console.error('Error saving API key:', error);
      setApiKeyMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement de la clé API' });
    } finally {
      setSavingApiKey(false);
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères' });
      return;
    }

    setLoading(true);

    try {
      if (user?.id) {
        const success = await updatePassword(user.id, newPassword);

        if (success) {
          setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' });
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setMessage({ type: 'error', text: 'Erreur lors de la modification du mot de passe' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Une erreur est survenue' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Paramètres">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-1">Gérez vos paramètres et votre compte</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{user?.name || 'Admin'}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                  {user?.role === 'super_admin' ? 'Super Admin' : user?.role}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Configuration OpenAI</h3>
                  <p className="text-sm text-gray-600">Clé API pour la génération de contenu IA</p>
                </div>
              </div>

              {apiKeyMessage && (
                <div className={`mb-4 p-4 rounded-lg ${
                  apiKeyMessage.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {apiKeyMessage.text}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="openai-api-key" className="block text-sm font-medium text-gray-700 mb-2">
                    Clé API OpenAI
                  </label>
                  <div className="relative">
                    <input
                      id="openai-api-key"
                      type={showApiKey ? 'text' : 'password'}
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="sk-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Votre clé API ChatGPT Pro.
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 ml-1"
                    >
                      Obtenir une clé →
                    </a>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  disabled={savingApiKey || !openaiApiKey}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingApiKey ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-purple-900 mb-2">
                    💡 À propos de la clé API
                  </h4>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>• Utilisée pour générer automatiquement des titres et descriptions SEO optimisés</li>
                    <li>• Génération de contenu pour les pages de service avec l'IA</li>
                    <li>• Votre clé est stockée de manière sécurisée dans la base de données</li>
                    <li>• Vous pouvez la modifier à tout moment</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Changer le mot de passe</h3>
                  <p className="text-sm text-gray-600">Modifiez votre mot de passe de connexion</p>
                </div>
              </div>

              {message && (
                <div className={`mb-4 p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                    minLength={8}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
