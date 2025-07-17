import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users as UsersIcon, Plus, Search, Edit, Trash2, Mail, Phone, Shield, Check, X, UserPlus, Filter, MoreVertical } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      firstName: 'Kevin',
      lastName: 'Martin',
      email: 'kevin.martin@entreprise.fr',
      phone: '+33 6 12 34 56 78',
      role: 'admin',
      status: 'active',
      lastLogin: '2025-07-10T10:30:00',
      createdAt: '2024-01-15',
      avatar: null,
      declarations: 45
    },
    {
      id: 2,
      firstName: 'Sophie',
      lastName: 'Durand',
      email: 'sophie.durand@entreprise.fr',
      phone: '+33 6 98 76 54 32',
      role: 'user',
      status: 'active',
      lastLogin: '2025-07-09T14:20:00',
      createdAt: '2024-02-20',
      avatar: null,
      declarations: 32
    },
    {
      id: 3,
      firstName: 'Pierre',
      lastName: 'Dubois',
      email: 'pierre.dubois@entreprise.fr',
      phone: '+33 6 45 67 89 01',
      role: 'user',
      status: 'inactive',
      lastLogin: '2025-06-15T09:15:00',
      createdAt: '2024-03-10',
      avatar: null,
      declarations: 18
    },
    {
      id: 4,
      firstName: 'Marie',
      lastName: 'Leclerc',
      email: 'marie.leclerc@entreprise.fr',
      phone: '+33 6 23 45 67 89',
      role: 'viewer',
      status: 'active',
      lastLogin: '2025-07-10T08:45:00',
      createdAt: '2024-04-05',
      avatar: null,
      declarations: 0
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const roles = {
    admin: { label: 'Administrateur', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    user: { label: 'Utilisateur', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    viewer: { label: 'Observateur', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'all' || user.role === filterRole;
    const matchStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const handleAddUser = (newUser) => {
    setUsers([...users, { ...newUser, id: users.length + 1, createdAt: new Date().toISOString().split('T')[0], declarations: 0 }]);
    setShowAddModal(false);
  };

  const handleEditUser = (updatedUser) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const UserModal = ({ user, onSave, onClose }) => {
    const [formData, setFormData] = useState(user || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
        >
          <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
            {user ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rôle
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="admin">Administrateur</option>
                <option value="user">Utilisateur</option>
                <option value="viewer">Observateur</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {user ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Gestion des Utilisateurs</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un utilisateur..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateurs</option>
            <option value="user">Utilisateurs</option>
            <option value="viewer">Observateurs</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Déclarations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {user.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roles[user.role].color}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {roles[user.role].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.status === 'active' ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <Check className="w-3 h-3 mr-1" />
                          Actif
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <X className="w-3 h-3 mr-1" />
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.lastLogin).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-center">
                      {user.declarations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <UserModal
            onSave={handleAddUser}
            onClose={() => setShowAddModal(false)}
          />
        )}
        {showEditModal && selectedUser && (
          <UserModal
            user={selectedUser}
            onSave={handleEditUser}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;