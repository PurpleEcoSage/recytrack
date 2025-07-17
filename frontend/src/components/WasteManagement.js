import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trash2, Package, Truck, CheckCircle, AlertCircle, Clock, 
  MapPin, Calendar, Filter, Search, Plus, Eye, Edit, 
  Download, TrendingUp, Users, Building
} from 'lucide-react';

const WasteManagement = () => {
  const [activeTab, setActiveTab] = useState('tracking');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Données simulées pour le suivi des déchets
  const wasteTracking = [
    {
      id: 'TRACK-001',
      type: 'Papier/Carton',
      quantity: '450 kg',
      status: 'collected',
      location: 'Bâtiment A - Étage 2',
      collectionDate: '2024-07-15',
      provider: 'Véolia',
      destination: 'Centre de recyclage Nord',
      certificate: 'CERT-2024-0712',
      history: [
        { date: '2024-07-15 08:00', event: 'Déclaration créée', user: 'Sophie Martin' },
        { date: '2024-07-15 14:30', event: 'Collecte programmée', user: 'System' },
        { date: '2024-07-16 09:15', event: 'Collecté', user: 'Véolia' },
        { date: '2024-07-17 11:00', event: 'Arrivé au centre', user: 'Centre Nord' },
        { date: '2024-07-18 15:00', event: 'Traité', user: 'Centre Nord' }
      ]
    },
    {
      id: 'TRACK-002',
      type: 'Plastique',
      quantity: '280 kg',
      status: 'processing',
      location: 'Bâtiment B - RDC',
      collectionDate: '2024-07-16',
      provider: 'Suez',
      destination: 'Centre de tri Est',
      certificate: null,
      history: [
        { date: '2024-07-16 10:00', event: 'Déclaration créée', user: 'Marc Dubois' },
        { date: '2024-07-16 16:00', event: 'Collecté', user: 'Suez' },
        { date: '2024-07-17 08:00', event: 'En cours de traitement', user: 'Centre Est' }
      ]
    },
    {
      id: 'TRACK-003',
      type: 'Bois',
      quantity: '1200 kg',
      status: 'scheduled',
      location: 'Zone de stockage extérieure',
      collectionDate: '2024-07-20',
      provider: 'Paprec',
      destination: 'Centre de valorisation',
      certificate: null,
      history: [
        { date: '2024-07-14 11:00', event: 'Déclaration créée', user: 'Julie Perrin' },
        { date: '2024-07-14 11:30', event: 'Collecte programmée', user: 'System' }
      ]
    },
    {
      id: 'TRACK-004',
      type: 'Métaux',
      quantity: '180 kg',
      status: 'pending',
      location: 'Atelier mécanique',
      collectionDate: null,
      provider: null,
      destination: null,
      certificate: null,
      history: [
        { date: '2024-07-18 09:00', event: 'Déclaration créée', user: 'Thomas Laurent' }
      ]
    }
  ];

  // Statistiques par site
  const siteStatistics = [
    {
      site: 'Site principal - Paris',
      totalWaste: '12.5 t',
      recyclingRate: '76%',
      lastCollection: 'Il y a 2 jours',
      nextCollection: 'Dans 5 jours',
      trend: '+5%'
    },
    {
      site: 'Entrepôt - Lyon',
      totalWaste: '8.3 t',
      recyclingRate: '68%',
      lastCollection: 'Il y a 4 jours',
      nextCollection: 'Dans 3 jours',
      trend: '+2%'
    },
    {
      site: 'Bureau - Marseille',
      totalWaste: '3.2 t',
      recyclingRate: '82%',
      lastCollection: 'Il y a 1 jour',
      nextCollection: 'Dans 6 jours',
      trend: '+8%'
    }
  ];

  // Alertes et notifications
  const alerts = [
    {
      type: 'warning',
      message: 'Capacité de stockage bois à 85% - Site principal',
      time: 'Il y a 30 min'
    },
    {
      type: 'info',
      message: 'Collecte programmée demain - Plastiques Bâtiment B',
      time: 'Il y a 2h'
    },
    {
      type: 'success',
      message: 'Certificat de valorisation reçu - CERT-2024-0712',
      time: 'Il y a 5h'
    },
    {
      type: 'error',
      message: 'Retard de collecte - Métaux Atelier',
      time: 'Il y a 1 jour'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'collected': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'scheduled': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'collected': return 'Collecté';
      case 'processing': return 'En traitement';
      case 'scheduled': return 'Programmé';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'info': return <Clock className="w-5 h-5 text-blue-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredTracking = wasteTracking.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const tabs = [
    { id: 'tracking', name: 'Suivi des déchets', icon: Truck },
    { id: 'sites', name: 'Gestion par site', icon: Building },
    { id: 'alerts', name: 'Alertes', icon: AlertCircle }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          Gestion avancée des déchets
        </h1>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle déclaration
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4 inline mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'tracking' && (
        <div className="space-y-4">
          {/* Barre de recherche et filtres */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par ID, type ou localisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="scheduled">Programmé</option>
              <option value="processing">En traitement</option>
              <option value="collected">Collecté</option>
            </select>
          </div>

          {/* Liste des déchets en suivi */}
          <div className="grid gap-4">
            {filteredTracking.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {item.id}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        {item.type} - {item.quantity}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {item.location}
                      </span>
                      {item.collectionDate && (
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(item.collectionDate).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4 lg:mt-0">
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Edit className="w-5 h-5" />
                    </button>
                    {item.certificate && (
                      <button className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg">
                        <Download className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Historique de suivi
                  </h4>
                  <div className="space-y-2">
                    {item.history.slice(0, 3).map((event, idx) => (
                      <div key={idx} className="flex items-start space-x-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white">{event.event}</p>
                          <p className="text-gray-500 dark:text-gray-400">
                            {event.date} - {event.user}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Informations additionnelles */}
                {item.provider && (
                  <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Prestataire:</span>
                      <span className="ml-2 text-gray-900 dark:text-white font-medium">{item.provider}</span>
                    </div>
                    {item.destination && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Destination:</span>
                        <span className="ml-2 text-gray-900 dark:text-white font-medium">{item.destination}</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sites' && (
        <div className="grid gap-4">
          {siteStatistics.map((site, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                <div className="mb-4 lg:mb-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {site.site}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Volume total</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{site.totalWaste}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Taux de recyclage</p>
                      <p className="text-xl font-bold text-green-600">{site.recyclingRate}</p>
                    </div>
                  </div>
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Dernière collecte: {site.lastCollection}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Prochaine collecte: {site.nextCollection}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 font-medium">
                      {site.trend} vs mois dernier
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow flex items-start space-x-3"
            >
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white">{alert.message}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{alert.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WasteManagement;