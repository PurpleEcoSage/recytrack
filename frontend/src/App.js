import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Package, Euro, TrendingUp, Plus, Download, Users as UsersIcon, Settings as SettingsIcon, LogOut, Menu, X, FileText, Trash2, Edit, Search, CheckCircle, XCircle, Moon, Sun, Bell, Activity, Target, Trees, Cloud, Zap, Info, ArrowUp, ArrowDown } from 'lucide-react';
import LeafLogo from './components/LeafLogo';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import NotificationPanel from './components/NotificationPanel';
import Reports from './components/Reports';
import Users from './components/Users';
import Settings from './components/Settings';
import WasteManagement from './components/WasteManagement';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { exportDashboardToPDF, exportDeclarationsToPDF } from './utils/pdfExport';

// Context pour l'authentification
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Vérifier le token et récupérer les infos utilisateur
      fetchUserInfo();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchUserInfo = async () => {
    try {
      // Simuler la récupération des infos utilisateur
      const mockUser = {
        id: 1,
        email: 'kevin.martin@entreprise.fr',
        firstName: 'Kevin',
        lastName: 'Martin',
        role: 'admin',
        companyId: 1,
        company: {
          name: 'EcoEntreprise SAS',
          logoUrl: null,
          subscriptionPlan: 'premium'
        }
      };
      setUser(mockUser);
    } catch (error) {
      console.error('Erreur récupération user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      // Simuler l'appel API
      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('token', mockToken);
      setToken(mockToken);
      await fetchUserInfo();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, token }}>
      {children}
    </AuthContext.Provider>
  );
};

// Composant de connexion
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Erreur de connexion');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">RecyTrack</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Connectez-vous à votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="vous@entreprise.fr"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            <div className="text-center text-sm">
              <button type="button" className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                Mot de passe oublié ?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Formulaire de déclaration de déchet
const WasteDeclarationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    wasteTypeId: '',
    quantityKg: '',
    declarationDate: new Date().toISOString().split('T')[0],
    providerId: '',
    isRecycled: true,
    cost: '',
    comments: '',
    siteName: '',
    proofFile: null
  });

  const wasteTypes = [
    { id: 1, name: 'Papier / Carton', icon: '📄' },
    { id: 2, name: 'Plastique', icon: '🥤' },
    { id: 3, name: 'Verre', icon: '🍾' },
    { id: 4, name: 'Bois', icon: '🪵' },
    { id: 5, name: 'Métal', icon: '🔧' },
    { id: 6, name: 'Plâtre', icon: '🧱' },
    { id: 7, name: 'Déchets inertes', icon: '🪨' }
  ];

  const providers = [
    { id: 1, name: 'Véolia Recyclage' },
    { id: 2, name: 'Suez Environnement' },
    { id: 3, name: 'Paprec Group' },
    { id: 4, name: 'Eco-Déchets Services' }
  ];

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const navigate = useNavigate();
  
  const handleSubmit = async () => {
    console.log('Soumission:', formData);
    // Simuler l'envoi
    setTimeout(() => {
      alert('Déclaration enregistrée avec succès !');
      navigate('/');
    }, 1000);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Type de déchet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wasteTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFormData({ ...formData, wasteTypeId: type.id })}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    formData.wasteTypeId === type.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{type.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{type.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Quantité</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantité en kilogrammes
                </label>
                <input
                  type="number"
                  value={formData.quantityKg}
                  onChange={(e) => setFormData({ ...formData, quantityKg: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 250"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de déclaration
                </label>
                <input
                  type="date"
                  value={formData.declarationDate}
                  onChange={(e) => setFormData({ ...formData, declarationDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isRecycled}
                    onChange={(e) => setFormData({ ...formData, isRecycled: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Déchet destiné au recyclage
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Preuve</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="proof-upload"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setFormData({ ...formData, proofFile: e.target.files[0] })}
                />
                <label htmlFor="proof-upload" className="cursor-pointer">
                  <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cliquez pour ajouter un fichier
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    PDF, DOC, DOCX ou image (max 10MB)
                  </p>
                </label>
                {formData.proofFile && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-3">
                    ✓ {formData.proofFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Prestataire</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sélectionner le prestataire
                </label>
                <select
                  value={formData.providerId}
                  onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">-- Choisir un prestataire --</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Coût (optionnel)
                </label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 150.50"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Commentaires (optionnel)
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Informations complémentaires..."
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Validation</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Type de déchet :</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {wasteTypes.find(t => t.id === formData.wasteTypeId)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Quantité :</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{formData.quantityKg} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Date :</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(formData.declarationDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Recyclable :</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formData.isRecycled ? 'Oui' : 'Non'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Prestataire :</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {providers.find(p => p.id === parseInt(formData.providerId))?.name || '-'}
                </span>
              </div>
              {formData.cost && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Coût :</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formData.cost} €</span>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Déclarer un déchet</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Progress steps */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step <= currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 5 && (
                  <div
                    className={`w-full h-1 mx-2 ${
                      step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStep()}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Enregistrer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Liste des déclarations
const DeclarationsList = () => {
  const [declarations] = useState([
    {
      id: 1,
      wasteTypeName: 'Papier / Carton',
      wasteTypeColor: '#2563eb',
      quantityKg: 250,
      declarationDate: '2025-07-10',
      providerName: 'Véolia Recyclage',
      isRecycled: true,
      cost: 45.50,
      declaredBy: 'Kevin Martin',
      status: 'declared'
    },
    {
      id: 2,
      wasteTypeName: 'Plastique',
      wasteTypeColor: '#ef4444',
      quantityKg: 180,
      declarationDate: '2025-07-09',
      providerName: 'Suez Environnement',
      isRecycled: true,
      cost: 38.20,
      declaredBy: 'Sophie Durand',
      status: 'declared'
    },
    {
      id: 3,
      wasteTypeName: 'Bois',
      wasteTypeColor: '#92400e',
      quantityKg: 420,
      declarationDate: '2025-07-08',
      providerName: 'Paprec Group',
      isRecycled: false,
      cost: 65.00,
      declaredBy: 'Kevin Martin',
      status: 'declared'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  const handleExportDeclarations = () => {
    const exportData = declarations.map(dec => ({
      id: `DEC-${dec.id.toString().padStart(3, '0')}`,
      wasteType: dec.wasteTypeName,
      quantity: dec.quantityKg,
      date: dec.declarationDate,
      provider: dec.providerName,
      status: dec.status
    }));
    exportDeclarationsToPDF(exportData);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Déclarations</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExportDeclarations}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center text-gray-700 dark:text-gray-300 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Exporter PDF
          </button>
          <Link
            to="/declare"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle déclaration
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tous les types</option>
            <option value="1">Papier / Carton</option>
            <option value="2">Plastique</option>
            <option value="3">Verre</option>
            <option value="4">Bois</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center text-gray-700 dark:text-gray-300">
            <Calendar className="w-5 h-5 mr-2" />
            Période
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Prestataire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recyclé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Coût
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Déclaré par
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {declarations.map((declaration) => (
                <tr key={declaration.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: declaration.wasteTypeColor }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {declaration.wasteTypeName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {declaration.quantityKg} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(declaration.declarationDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {declaration.providerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {declaration.isRecycled ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {declaration.cost ? `${declaration.cost.toFixed(2)} €` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {declaration.declaredBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              Précédent
            </button>
            <button className="ml-3 px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de <span className="font-medium">1</span> à{' '}
                <span className="font-medium">3</span> sur{' '}
                <span className="font-medium">3</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Précédent
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-green-50 dark:bg-green-900/20 text-sm font-medium text-green-600 dark:text-green-400">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Application principale
export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement initial
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LeafLogo className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </Router>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LeafLogo className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
      <Route path="/declare" element={<MainLayout><WasteDeclarationForm /></MainLayout>} />
      <Route path="/declarations" element={<MainLayout><DeclarationsList /></MainLayout>} />
      <Route path="/waste-management" element={<MainLayout><WasteManagement /></MainLayout>} />
      <Route path="/reports" element={<MainLayout><Reports /></MainLayout>} />
      <Route path="/users" element={<MainLayout><Users /></MainLayout>} />
      <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
    </Routes>
  );
}

// Layout principal avec navigation
const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { getUnreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Tableau de bord', href: '/', icon: TrendingUp },
    { name: 'Déclarer un déchet', href: '/declare', icon: Plus },
    { name: 'Déclarations', href: '/declarations', icon: FileText },
    { name: 'Gestion des déchets', href: '/waste-management', icon: Package },
    { name: 'Rapports', href: '/reports', icon: Download },
    { name: 'Utilisateurs', href: '/users', icon: UsersIcon },
    { name: 'Paramètres', href: '/settings', icon: SettingsIcon },
  ];

  const unreadCount = getUnreadCount();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar desktop */}
      <motion.div 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ${sidebarOpen ? 'md:w-64' : 'md:w-16'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl`}
      >
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <LeafLogo className="w-10 h-10" />
              {sidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-3 text-gray-900 dark:text-white font-bold text-lg"
                >
                  RecyTrack
                </motion.span>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${!sidebarOpen ? 'mx-auto' : ''}`} />
                  {sidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="ml-3"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {sidebarOpen && user && (
              <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className={`w-5 h-5 ${!sidebarOpen ? 'mx-auto' : ''}`} />
              {sidebarOpen && <span className="ml-3">Déconnexion</span>}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Header mobile */}
      <div className="md:hidden">
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center">
            <LeafLogo className="w-10 h-10" />
            <span className="ml-3 text-gray-900 dark:text-white font-bold text-lg">RecyTrack</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
            </button>
            <button
              onClick={() => setShowNotificationPanel(true)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 dark:text-gray-300 p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="bg-gray-800 px-2 py-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-3 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 mt-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 border-t border-gray-700"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Déconnexion</span>
            </button>
          </div>
        )}
      </div>

      {/* Header desktop */}
      <div className={`hidden md:block fixed top-0 right-0 left-0 ${sidebarOpen ? 'md:left-64' : 'md:left-16'} transition-all duration-300 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10`}>
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {navigation.find(nav => nav.href === location.pathname)?.name || 'RecyTrack'}
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
            </button>
            <button
              onClick={() => setShowNotificationPanel(true)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className={`${sidebarOpen ? 'md:pl-64' : 'md:pl-16'} transition-all duration-300 pt-0 md:pt-16`}>
        <main className="p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotificationPanel} 
        onClose={() => setShowNotificationPanel(false)} 
      />
    </div>
  );
};

// Dashboard
const Dashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [stats] = useState({
    currentMonth: {
      totalWeight: 25.4,
      recyclingRate: 68,
      totalCost: 3200,
      declarationCount: 42,
      previousMonthWeight: 22.1,
      previousMonthRate: 62.8,
      previousMonthCost: 3310,
      previousMonthDeclarations: 38
    },
    distribution: [
      { name: 'Papier/Carton', percentage: 35, color: '#2563eb', total_kg: 8890 },
      { name: 'Plastique', percentage: 29, color: '#ef4444', total_kg: 7366 },
      { name: 'Bois', percentage: 21, color: '#92400e', total_kg: 5334 },
      { name: 'Verre', percentage: 15, color: '#10b981', total_kg: 3810 }
    ],
    monthlyTrends: [
      { month: 'Jan', totalWaste: 18.5, recycled: 11.1, recyclageRate: 60, cost: 2850 },
      { month: 'Fév', totalWaste: 21.2, recycled: 14.8, recyclageRate: 70, cost: 3100 },
      { month: 'Mar', totalWaste: 19.8, recycled: 12.9, recyclageRate: 65, cost: 2950 },
      { month: 'Avr', totalWaste: 23.4, recycled: 16.4, recyclageRate: 70, cost: 3200 },
      { month: 'Mai', totalWaste: 25.4, recycled: 17.3, recyclageRate: 68, cost: 3310 },
      { month: 'Juin', totalWaste: 22.1, recycled: 15.5, recyclageRate: 70, cost: 3050 },
      { month: 'Juil', totalWaste: 25.4, recycled: 17.3, recyclageRate: 68, cost: 3200 }
    ],
    recyclingByMonth: [
      { month: 'Jan', papier: 6.5, plastique: 5.3, bois: 3.9, verre: 2.8 },
      { month: 'Fév', papier: 7.4, plastique: 6.1, bois: 4.4, verre: 3.3 },
      { month: 'Mar', papier: 6.9, plastique: 5.7, bois: 4.1, verre: 3.1 },
      { month: 'Avr', papier: 8.2, plastique: 6.8, bois: 4.9, verre: 3.5 },
      { month: 'Mai', papier: 8.9, plastique: 7.4, bois: 5.3, verre: 3.8 },
      { month: 'Juin', papier: 7.7, plastique: 6.4, bois: 4.6, verre: 3.4 },
      { month: 'Juil', papier: 8.9, plastique: 7.4, bois: 5.3, verre: 3.8 }
    ],
    recentActivities: [
      { id: 1, type: 'declaration', title: 'Nouvelle déclaration', description: 'Sophie Durand a déclaré 250kg de Papier/Carton', time: 'Il y a 5 min', icon: FileText, color: 'blue' },
      { id: 2, type: 'alert', title: 'Seuil atteint', description: 'Le taux de recyclage a dépassé 70%', time: 'Il y a 2h', icon: Target, color: 'green' },
      { id: 3, type: 'report', title: 'Rapport généré', description: 'Rapport mensuel de juin disponible', time: 'Il y a 1 jour', icon: Download, color: 'purple' },
      { id: 4, type: 'update', title: 'Mise à jour', description: 'Les données de coût ont été actualisées', time: 'Il y a 2 jours', icon: Euro, color: 'orange' }
    ],
    environmentalImpact: {
      co2Saved: 45.2,
      treesSaved: 312,
      waterSaved: 125000,
      energySaved: 18500
    },
    history: [
      { monthLabel: 'Fév', totalKg: 18500, recycledKg: 11100 },
      { monthLabel: 'Mar', totalKg: 21200, recycledKg: 14840 },
      { monthLabel: 'Avr', totalKg: 19800, recycledKg: 12870 },
      { monthLabel: 'Mai', totalKg: 23400, recycledKg: 16380 },
      { monthLabel: 'Juin', totalKg: 25400, recycledKg: 17272 },
      { monthLabel: 'Juil', totalKg: 22100, recycledKg: 15470 }
    ]
  });

  const StatCard = ({ title, value, unit, icon: Icon, color, trend, trendValue, subtitle, progress }) => (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <span className={`text-sm font-medium flex items-center ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend === 'up' ? <ArrowUp className="w-4 h-4 mr-1" /> : trend === 'down' ? <ArrowDown className="w-4 h-4 mr-1" /> : '→'}
            {trendValue}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
          {value}<span className="text-lg ml-1 text-gray-600 dark:text-gray-400">{unit}</span>
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
        {progress && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div 
                className={`h-2 rounded-full ${color}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  const calculateGrowthRate = (current, previous) => {
    const rate = ((current - previous) / previous * 100).toFixed(1);
    return rate > 0 ? `+${rate}%` : `${rate}%`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)} {entry.unit || 't'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900 dark:text-white"
            >
              Bienvenue {user?.firstName} 👋
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center mt-2 space-x-4"
            >
              <p className="text-gray-600 dark:text-gray-400">
                Voici le résumé de vos données
              </p>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
            </motion.div>
          </div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => {
              const dashboardData = {
                stats: {
                  totalWeight: stats.currentMonth.totalWeight,
                  recyclingRate: stats.currentMonth.recyclingRate,
                  totalCost: stats.currentMonth.totalCost,
                  co2Saved: stats.environmentalImpact.co2Saved,
                  trends: {
                    weight: calculateGrowthRate(stats.currentMonth.totalWeight, stats.currentMonth.previousMonthWeight),
                    rate: calculateGrowthRate(stats.currentMonth.recyclingRate, stats.currentMonth.previousMonthRate),
                    cost: calculateGrowthRate(stats.currentMonth.totalCost, stats.currentMonth.previousMonthCost)
                  }
                },
                lastDeclarations: [
                  { id: 'DEC-001', type: 'Papier/Carton', quantity: 450, date: new Date().toISOString(), status: 'Collecté' },
                  { id: 'DEC-002', type: 'Plastique', quantity: 280, date: new Date().toISOString(), status: 'En traitement' },
                  { id: 'DEC-003', type: 'Bois', quantity: 1200, date: new Date().toISOString(), status: 'Programmé' },
                  { id: 'DEC-004', type: 'Métaux', quantity: 180, date: new Date().toISOString(), status: 'En attente' }
                ]
              };
              exportDashboardToPDF(dashboardData);
            }}
            className="mt-4 sm:mt-0 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Exporter PDF
          </motion.button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tonnes triées"
          value={stats.currentMonth.totalWeight}
          unit="t"
          icon={Trash2}
          color="bg-blue-500"
          trend={stats.currentMonth.totalWeight > stats.currentMonth.previousMonthWeight ? "up" : "down"}
          trendValue={calculateGrowthRate(stats.currentMonth.totalWeight, stats.currentMonth.previousMonthWeight)}
          subtitle="vs mois dernier"
          progress={75}
        />
        <StatCard
          title="Taux de recyclage"
          value={stats.currentMonth.recyclingRate}
          unit="%"
          icon={TrendingUp}
          color="bg-green-500"
          trend={stats.currentMonth.recyclingRate > stats.currentMonth.previousMonthRate ? "up" : "down"}
          trendValue={calculateGrowthRate(stats.currentMonth.recyclingRate, stats.currentMonth.previousMonthRate)}
          subtitle="Objectif: 75%"
          progress={stats.currentMonth.recyclingRate}
        />
        <StatCard
          title="Coût total"
          value={stats.currentMonth.totalCost.toLocaleString()}
          unit="€"
          icon={Euro}
          color="bg-purple-500"
          trend={stats.currentMonth.totalCost < stats.currentMonth.previousMonthCost ? "down" : "up"}
          trendValue={calculateGrowthRate(stats.currentMonth.totalCost, stats.currentMonth.previousMonthCost)}
          subtitle="Budget: 4000€"
          progress={(stats.currentMonth.totalCost / 4000) * 100}
        />
        <StatCard
          title="Déclarations"
          value={stats.currentMonth.declarationCount}
          unit=""
          icon={FileText}
          color="bg-orange-500"
          trend={stats.currentMonth.declarationCount > stats.currentMonth.previousMonthDeclarations ? "up" : "down"}
          trendValue={`+${stats.currentMonth.declarationCount - stats.currentMonth.previousMonthDeclarations}`}
          subtitle="Ce mois-ci"
        />
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tendances mensuelles */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Évolution des déchets
            </h3>
            <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <Info className="w-4 h-4" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.monthlyTrends}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorRecycled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="totalWaste" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                name="Total (t)"
              />
              <Area 
                type="monotone" 
                dataKey="recycled" 
                stroke="#10B981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRecycled)" 
                name="Recyclé (t)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Répartition des déchets par catégorie */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Répartition par type
            </h3>
            <select className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Ce mois</option>
              <option>3 derniers mois</option>
              <option>Cette année</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="percentage"
              >
                {stats.distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {stats.distribution.map((item) => (
              <div key={item.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.name}: {(item.total_kg / 1000).toFixed(1)}t
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Graphiques secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Taux de recyclage par mois */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Taux de recyclage mensuel
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="recyclageRate" fill="#10B981" radius={[8, 8, 0, 0]}>
                {stats.monthlyTrends.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.recyclageRate >= 70 ? '#10B981' : '#F59E0B'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2" />
              <span className="text-gray-600 dark:text-gray-400">≥ 70% (Objectif)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded mr-2" />
              <span className="text-gray-600 dark:text-gray-400">&lt; 70%</span>
            </div>
          </div>
        </motion.div>

        {/* Évolution des coûts */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Évolution des coûts
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={{ fill: '#8B5CF6', r: 6 }}
                activeDot={{ r: 8 }}
                name="Coût (€)"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Moyenne</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">3 094€</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Min</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">2 850€</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Max</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">3 310€</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Impact environnemental */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl shadow-lg p-6 border border-green-200 dark:border-green-800 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Impact environnemental positif
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="w-16 h-16 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
            >
              <Cloud className="w-8 h-8 text-green-600 dark:text-green-400" />
            </motion.div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.environmentalImpact.co2Saved}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tonnes CO₂ économisées</p>
          </div>
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="w-16 h-16 mx-auto mb-2 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
            >
              <Trees className="w-8 h-8 text-green-600 dark:text-green-400" />
            </motion.div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.environmentalImpact.treesSaved}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Arbres sauvés</p>
          </div>
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="w-16 h-16 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
            >
              <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats.environmentalImpact.waterSaved / 1000).toFixed(0)}k</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Litres d'eau économisés</p>
          </div>
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="w-16 h-16 mx-auto mb-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center"
            >
              <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </motion.div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats.environmentalImpact.energySaved / 1000).toFixed(1)}k</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">kWh économisés</p>
          </div>
        </div>
      </motion.div>

      {/* Recyclage par type et par mois */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recyclage par type de déchet
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.recyclingByMonth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="papier" stackId="a" fill="#2563eb" name="Papier/Carton" />
            <Bar dataKey="plastique" stackId="a" fill="#ef4444" name="Plastique" />
            <Bar dataKey="bois" stackId="a" fill="#92400e" name="Bois" />
            <Bar dataKey="verre" stackId="a" fill="#10b981" name="Verre" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Activités récentes et performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activités récentes */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activités récentes
          </h3>
          <div className="space-y-4">
            {stats.recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div 
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className={`p-2 rounded-lg ${
                    activity.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    activity.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                    activity.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                    'bg-orange-100 dark:bg-orange-900/30'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      activity.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      activity.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      activity.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      'text-orange-600 dark:text-orange-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <button className="mt-4 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
            Voir tout l'historique →
          </button>
        </motion.div>

        {/* Indicateurs de performance */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Indicateurs de performance
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Objectif recyclage</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">68% / 75%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div 
                  className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-400"
                  initial={{ width: 0 }}
                  animate={{ width: '91%' }}
                  transition={{ duration: 1, delay: 1 }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conformité déclarations</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">93%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div 
                  className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                  initial={{ width: 0 }}
                  animate={{ width: '93%' }}
                  transition={{ duration: 1, delay: 1.1 }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Réduction des coûts</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">-3.1%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div 
                  className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-400"
                  initial={{ width: 0 }}
                  animate={{ width: '31%' }}
                  transition={{ duration: 1, delay: 1.2 }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Engagement équipe</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">87%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div 
                  className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-400"
                  initial={{ width: 0 }}
                  animate={{ width: '87%' }}
                  transition={{ duration: 1, delay: 1.3 }}
                />
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">Conseil:</span> Augmentez le taux de recyclage du plastique pour atteindre votre objectif mensuel.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Actions rapides */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Link to="/declare">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-br from-green-500 to-blue-500 text-white rounded-xl p-6 text-center cursor-pointer shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Nouvelle déclaration</p>
          </motion.div>
        </Link>
        <Link to="/reports">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-6 text-center cursor-pointer shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Télécharger rapport</p>
          </motion.div>
        </Link>
        <Link to="/declarations">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl p-6 text-center cursor-pointer shadow-lg hover:shadow-xl transition-all"
          >
            <FileText className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Voir déclarations</p>
          </motion.div>
        </Link>
        <Link to="/settings">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-xl p-6 text-center cursor-pointer shadow-lg hover:shadow-xl transition-all"
          >
            <SettingsIcon className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Paramètres</p>
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
};