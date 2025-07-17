import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download, Calendar, TrendingUp, TrendingDown, FileText, Filter, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { exportDetailedReportToPDF } from '../utils/pdfExport';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  // Données pour les graphiques
  const wasteEvolution = [
    { month: 'Jan', total: 18500, recycled: 11100, cost: 2800 },
    { month: 'Fév', total: 21200, recycled: 14840, cost: 3200 },
    { month: 'Mar', total: 19800, recycled: 12870, cost: 2950 },
    { month: 'Avr', total: 23400, recycled: 16380, cost: 3500 },
    { month: 'Mai', total: 25400, recycled: 17272, cost: 3800 },
    { month: 'Juin', total: 22100, recycled: 15470, cost: 3300 },
    { month: 'Juil', total: 24300, recycled: 17496, cost: 3600 },
  ];

  const wasteByCategory = [
    { name: 'Papier/Carton', value: 35, color: '#3B82F6' },
    { name: 'Plastique', value: 29, color: '#EF4444' },
    { name: 'Bois', value: 21, color: '#F59E0B' },
    { name: 'Verre', value: 15, color: '#10B981' },
  ];

  const providerPerformance = [
    { name: 'Véolia', performance: 92, cost: 8500, volume: 12000 },
    { name: 'Suez', performance: 88, cost: 7200, volume: 9500 },
    { name: 'Paprec', performance: 95, cost: 9100, volume: 13200 },
    { name: 'Eco-Déchets', performance: 85, cost: 6800, volume: 8700 },
  ];

  const kpis = [
    { 
      title: 'Tonnage total', 
      value: '156.7', 
      unit: 't', 
      trend: '+12.3%',
      trendUp: true,
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    { 
      title: 'Taux de recyclage', 
      value: '72', 
      unit: '%', 
      trend: '+5.2%',
      trendUp: true,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    { 
      title: 'Coût total', 
      value: '23.1', 
      unit: 'k€', 
      trend: '-3.1%',
      trendUp: false,
      icon: TrendingDown,
      color: 'bg-purple-500'
    },
    { 
      title: 'Émissions évitées', 
      value: '89.4', 
      unit: 'tCO₂', 
      trend: '+8.7%',
      trendUp: true,
      icon: TrendingUp,
      color: 'bg-emerald-500'
    }
  ];

  const reports = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: Eye },
    { id: 'detailed', name: 'Rapport détaillé', icon: FileText },
    { id: 'providers', name: 'Performance prestataires', icon: TrendingUp },
    { id: 'environmental', name: 'Impact environnemental', icon: TrendingUp },
  ];

  const renderReport = () => {
    switch (selectedReport) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((kpi, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${kpi.color} bg-opacity-10`}>
                      <kpi.icon className={`w-6 h-6 text-white`} />
                    </div>
                    <span className={`text-sm font-medium ${kpi.trendUp ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                      {kpi.trendUp ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      {kpi.trend}
                    </span>
                  </div>
                  <h3 className="text-sm text-gray-600 dark:text-gray-400">{kpi.title}</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {kpi.value}<span className="text-lg ml-1">{kpi.unit}</span>
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Évolution des déchets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Évolution mensuelle</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={wasteEvolution}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRecycled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
                  <YAxis className="text-gray-600 dark:text-gray-400" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    name="Total (kg)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="recycled" 
                    stroke="#10B981" 
                    fillOpacity={1} 
                    fill="url(#colorRecycled)" 
                    name="Recyclé (kg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Répartition par catégorie */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Répartition par type</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={wasteByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {wasteByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {wasteByCategory.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{category.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{category.value}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Coûts mensuels</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={wasteEvolution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
                    <YAxis className="text-gray-600 dark:text-gray-400" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="cost" fill="#8B5CF6" radius={[8, 8, 0, 0]} name="Coût (€)" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </div>
        );

      case 'providers':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Performance des prestataires</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Prestataire</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Performance</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Volume traité</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Coût total</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Coût/tonne</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providerPerformance.map((provider, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">{provider.name}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${provider.performance}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{provider.performance}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{(provider.volume / 1000).toFixed(1)} t</td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{provider.cost.toLocaleString()} €</td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{(provider.cost / (provider.volume / 1000)).toFixed(0)} €/t</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Comparaison des performances</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={providerPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="name" className="text-gray-600 dark:text-gray-400" />
                  <YAxis className="text-gray-600 dark:text-gray-400" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="performance" fill="#10B981" radius={[8, 8, 0, 0]} name="Performance (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        );

      case 'detailed':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* En-tête du rapport détaillé */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Rapport Détaillé</h3>
              <p className="text-gray-600 dark:text-gray-300">Vue d'ensemble complète de vos performances environnementales avec analyses approfondies et recommandations personnalisées.</p>
            </div>

            {/* Résumé exécutif */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                Résumé Exécutif
              </h4>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Au cours de la période analysée, votre entreprise a traité <strong>156.7 tonnes</strong> de déchets avec un taux de recyclage global de <strong>72%</strong>, 
                  dépassant la moyenne du secteur de 12 points. Cette performance représente une amélioration de 5.2% par rapport à la période précédente.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-400 font-semibold">Points forts</p>
                    <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
                      <li>• Taux de recyclage du verre : 100%</li>
                      <li>• Réduction des coûts de 3.1%</li>
                      <li>• 89.4 tCO₂ évitées</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <p className="text-yellow-800 dark:text-yellow-400 font-semibold">Axes d'amélioration</p>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                      <li>• Tri du plastique (68%)</li>
                      <li>• Formation du personnel</li>
                      <li>• Points de collecte</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-blue-800 dark:text-blue-400 font-semibold">Objectifs</p>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                      <li>• 75% de recyclage d'ici Q4</li>
                      <li>• ISO 14001 en 2025</li>
                      <li>• -15% de coûts annuels</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Analyse détaillée par flux */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analyse par Flux de Déchets</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Type de déchet</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Volume</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Part</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Recyclage</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Valorisation</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Coût/tonne</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Papier/Carton</td>
                      <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-400">54.8 t</td>
                      <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-400">35%</td>
                      <td className="py-4 px-4 text-sm text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          95%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-400">52.1 t</td>
                      <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-400">85 €</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Plastique</td>
                      <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-400">45.4 t</td>
                      <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-400">29%</td>
                      <td className="py-4 px-4 text-sm text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          68%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-400">30.9 t</td>
                      <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-400">120 €</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Bois</td>
                      <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-400">32.9 t</td>
                      <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-400">21%</td>
                      <td className="py-4 px-4 text-sm text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          82%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-400">27.0 t</td>
                      <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-400">95 €</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">Verre</td>
                      <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-400">23.5 t</td>
                      <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-400">15%</td>
                      <td className="py-4 px-4 text-sm text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          100%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-400">23.5 t</td>
                      <td className="py-4 px-4 text-sm text-center text-gray-600 dark:text-gray-400">65 €</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommandations prioritaires */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plan d'Action Prioritaire</h4>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-3 flex-1">
                      <h5 className="text-sm font-semibold text-red-800 dark:text-red-300">Priorité haute - Amélioration du tri plastique</h5>
                      <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                        Avec seulement 68% de recyclage, le plastique représente votre plus grand potentiel d'amélioration. 
                        Recommandation : Formation immédiate du personnel et révision des procédures de tri.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Filter className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="ml-3 flex-1">
                      <h5 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Priorité moyenne - Infrastructure de collecte</h5>
                      <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                        Installation de 5 nouveaux points de tri sélectif dans les zones à fort passage pour faciliter le tri à la source.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-3 flex-1">
                      <h5 className="text-sm font-semibold text-green-800 dark:text-green-300">Priorité normale - Certification ISO 14001</h5>
                      <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                        Préparer la documentation nécessaire pour la certification environnementale. Échéance : Q2 2025.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'environmental':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Vue d'ensemble de l'impact environnemental */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Impact Environnemental</h3>
              <p className="text-gray-600 dark:text-gray-300">Mesurez et réduisez votre empreinte carbone grâce à une gestion optimisée de vos déchets.</p>
            </div>

            {/* Métriques environnementales clés */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                    <TrendingDown className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">-45%</span>
                </div>
                <h3 className="text-sm text-gray-600 dark:text-gray-400">CO₂ évité</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">89.4<span className="text-lg ml-1">tCO₂e</span></p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Équivalent à 178 vols Paris-NY</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">+12%</span>
                </div>
                <h3 className="text-sm text-gray-600 dark:text-gray-400">Arbres équivalents</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">4,470<span className="text-lg ml-1">arbres</span></p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Compensation annuelle</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">+8%</span>
                </div>
                <h3 className="text-sm text-gray-600 dark:text-gray-400">Eau préservée</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">125k<span className="text-lg ml-1">litres</span></p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">50 piscines olympiques</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">+15%</span>
                </div>
                <h3 className="text-sm text-gray-600 dark:text-gray-400">Énergie économisée</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">456<span className="text-lg ml-1">MWh</span></p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">152 foyers/an</p>
              </motion.div>
            </div>

            {/* Graphique d'impact par type de déchet */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Impact CO₂ par Type de Déchet</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Papier/Carton', impact: 28.5, evite: 26.1, color: '#3B82F6' },
                  { name: 'Plastique', impact: 36.2, evite: 24.6, color: '#EF4444' },
                  { name: 'Bois', impact: 18.9, evite: 15.5, color: '#F59E0B' },
                  { name: 'Verre', impact: 15.2, evite: 15.2, color: '#10B981' },
                  { name: 'Métaux', impact: 12.4, evite: 8.0, color: '#8B5CF6' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="name" className="text-gray-600 dark:text-gray-400" />
                  <YAxis className="text-gray-600 dark:text-gray-400" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="impact" fill="#EF4444" name="Impact potentiel (tCO₂e)" />
                  <Bar dataKey="evite" fill="#10B981" name="Émissions évitées (tCO₂e)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Comparaison avec les objectifs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progression vs Objectifs</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Réduction CO₂</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">89%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '89%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Objectif : 100 tCO₂e d'ici fin d'année</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Taux de valorisation</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">72%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Objectif : 75% d'ici Q4</p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Économie circulaire</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Objectif : 80% de matières réintégrées</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Certifications & Labels</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">ISO 14001</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">En cours de préparation</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">Q2 2025</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Label Économie Circulaire</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Niveau 2 obtenu</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Actif</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-200 dark:bg-purple-800 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Bilan Carbone®</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Prochaine évaluation</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Sept 2024</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions recommandées */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions pour Réduire votre Impact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-800 dark:text-green-200">1</span>
                  </div>
                  <div className="ml-3">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Optimiser le tri à la source</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Potentiel : -15 tCO₂e/an supplémentaires</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-800 dark:text-green-200">2</span>
                  </div>
                  <div className="ml-3">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Réduire les emballages</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Potentiel : -8 tCO₂e/an et -5k€/an</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-800 dark:text-green-200">3</span>
                  </div>
                  <div className="ml-3">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Favoriser les filières locales</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Potentiel : -12 tCO₂e/an (transport)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-800 dark:text-green-200">4</span>
                  </div>
                  <div className="ml-3">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white">Sensibiliser les équipes</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Impact estimé : +10% de tri correct</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">Sélectionnez un rapport pour commencer</p>
          </div>
        );
    }
  };

  const handleExportReport = async () => {
    const reportData = {
      period: selectedPeriod === 'month' ? 'Ce mois' : 
              selectedPeriod === 'quarter' ? 'Ce trimestre' : 
              selectedPeriod === 'year' ? 'Cette année' : 'Cette semaine',
      company: 'EcoEntreprise SAS',
      totalWaste: '156.7 tonnes',
      recyclingRate: '72%',
      totalCost: '23,100 €',
      co2Saved: '89.4 tonnes',
      wasteByType: wasteByCategory.map(cat => [
        cat.name,
        `${cat.value}%`,
        `${(156.7 * cat.value / 100).toFixed(1)} t`,
        cat.name === 'Verre' ? '100%' : cat.name === 'Papier/Carton' ? '95%' : cat.name === 'Bois' ? '82%' : '68%'
      ]),
      monthlyEvolution: wasteEvolution.map(month => [
        month.month,
        `${(month.total / 1000).toFixed(1)} t`,
        `${(month.recycled / 1000).toFixed(1)} t`,
        `${Math.round(month.recycled / month.total * 100)}%`,
        `${month.cost.toLocaleString()} €`
      ]),
      recommendations: [
        '1. Améliorer le tri du plastique pour augmenter le taux de recyclage',
        '2. Négocier de meilleurs tarifs avec les prestataires pour le bois',
        '3. Mettre en place une formation sur le tri sélectif',
        '4. Installer des bacs de tri supplémentaires dans le bâtiment B',
        '5. Viser un objectif de 75% de recyclage pour le prochain trimestre'
      ],
      reportType: selectedReport,
      // Données supplémentaires pour le rapport environnemental
      environmentalMetrics: {
        co2Avoided: '89.4',
        treesEquivalent: '4,470',
        waterPreserved: '125,000',
        energySaved: '456',
        co2Progress: 89,
        recyclingProgress: 72,
        circularEconomyProgress: 65,
        certifications: [
          { name: 'ISO 14001', status: 'En préparation', date: 'Q2 2025' },
          { name: 'Label Économie Circulaire', status: 'Niveau 2', date: 'Actif' },
          { name: 'Bilan Carbone®', status: 'Évaluation prévue', date: 'Sept 2024' }
        ]
      }
    };
    
    await exportDetailedReportToPDF(reportData);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Rapports et Analyses</h1>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center text-gray-700 dark:text-gray-300">
            <Filter className="w-5 h-5 mr-2" />
            Filtrer
          </button>
          <button 
            onClick={handleExportReport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Tabs de navigation */}
      <div className="flex space-x-1 mb-6 overflow-x-auto">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              selectedReport === report.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <report.icon className="w-4 h-4 inline mr-2" />
            {report.name}
          </button>
        ))}
      </div>

      {/* Contenu du rapport */}
      {renderReport()}
    </div>
  );
};

export default Reports;