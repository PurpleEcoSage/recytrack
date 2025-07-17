import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Save, Mail, Phone, Building, MapPin, CreditCard, FileText, Moon, Sun, Monitor, Download } from 'lucide-react';
import { useAuth } from '../App';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    company: {
      name: 'EcoEntreprise SAS',
      address: '123 Rue de la République',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      siret: '123 456 789 00012',
      tva: 'FR12345678901'
    },
    notifications: {
      email: true,
      sms: false,
      monthlyReport: true,
      lowStock: true,
      newDeclaration: false
    },
    preferences: {
      language: 'fr',
      currency: 'EUR',
      dateFormat: 'DD/MM/YYYY',
      theme: theme
    }
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'general', name: 'Général', icon: Building },
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Sécurité', icon: Shield },
    { id: 'preferences', name: 'Préférences', icon: Palette },
    { id: 'billing', name: 'Facturation', icon: CreditCard }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Informations de l'entreprise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.company.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      company: { ...formData.company, name: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={formData.company.siret}
                    onChange={(e) => setFormData({
                      ...formData,
                      company: { ...formData.company, siret: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.company.address}
                    onChange={(e) => setFormData({
                      ...formData,
                      company: { ...formData.company, address: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Numéro TVA
                  </label>
                  <input
                    type="text"
                    value={formData.company.tva}
                    onChange={(e) => setFormData({
                      ...formData,
                      company: { ...formData.company, tva: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={formData.company.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        company: { ...formData.company, city: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={formData.company.postalCode}
                      onChange={(e) => setFormData({
                        ...formData,
                        company: { ...formData.company, postalCode: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={formData.company.country}
                    onChange={(e) => setFormData({
                      ...formData,
                      company: { ...formData.company, country: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Informations personnelles</h3>
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="ml-4">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                    Changer la photo
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG ou GIF. Max 5MB.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.firstName}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.lastName}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    defaultValue="+33 6 12 34 56 78"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Préférences de notifications</h3>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Notifications par email', description: 'Recevoir les notifications importantes par email' },
                  { key: 'sms', label: 'Notifications par SMS', description: 'Recevoir les alertes urgentes par SMS' },
                  { key: 'monthlyReport', label: 'Rapport mensuel', description: 'Recevoir un rapport mensuel de vos activités' },
                  { key: 'lowStock', label: 'Alertes de stock', description: 'Être alerté en cas de stock faible' },
                  { key: 'newDeclaration', label: 'Nouvelles déclarations', description: 'Être notifié lors de nouvelles déclarations' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        notifications: {
                          ...formData.notifications,
                          [item.key]: !formData.notifications[item.key]
                        }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.notifications[item.key] ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'preferences':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Préférences d'affichage</h3>
              
              {/* Thème */}
              <div className="mb-8">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Thème de l'application</h4>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      if (theme !== 'light') toggleTheme();
                    }}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      theme === 'light' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Clair</p>
                  </button>
                  <button
                    onClick={() => {
                      if (theme !== 'dark') toggleTheme();
                    }}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      theme === 'dark' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Moon className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Sombre</p>
                  </button>
                  <button
                    disabled
                    className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                  >
                    <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Système</p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Langue
                  </label>
                  <select
                    value={formData.preferences.language}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, language: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Devise
                  </label>
                  <select
                    value={formData.preferences.currency}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, currency: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">Dollar ($)</option>
                    <option value="GBP">Livre (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Format de date
                  </label>
                  <select
                    value={formData.preferences.dateFormat}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, dateFormat: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="DD/MM/YYYY">JJ/MM/AAAA</option>
                    <option value="MM/DD/YYYY">MM/JJ/AAAA</option>
                    <option value="YYYY-MM-DD">AAAA-MM-JJ</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'security':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Sécurité du compte</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Changer le mot de passe</h4>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Mot de passe actuel"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="password"
                      placeholder="Nouveau mot de passe"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="password"
                      placeholder="Confirmer le nouveau mot de passe"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Authentification à deux facteurs</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Ajoutez une couche de sécurité supplémentaire à votre compte en activant l'authentification à deux facteurs.
                  </p>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Activer 2FA
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'billing':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Plan d'abonnement</h3>
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-6 text-white mb-6">
                <h4 className="text-xl font-bold mb-2">Plan Premium</h4>
                <p className="mb-4">Accès illimité à toutes les fonctionnalités</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">49€<span className="text-lg">/mois</span></span>
                  <button className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100">
                    Changer de plan
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Historique de facturation</h4>
                <div className="space-y-3">
                  {[
                    { date: '01/07/2025', amount: '49€', status: 'Payée' },
                    { date: '01/06/2025', amount: '49€', status: 'Payée' },
                    { date: '01/05/2025', amount: '49€', status: 'Payée' }
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Facture du {invoice.date}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.status}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{invoice.amount}</span>
                        <button className="text-green-600 hover:text-green-700">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Modifications enregistrées
          </motion.div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1">
          {renderContent()}
          
          {/* Bouton sauvegarder */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;