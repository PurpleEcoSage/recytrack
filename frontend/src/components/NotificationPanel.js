import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, X, Check, CheckCheck, Trash2, AlertCircle, 
  CheckCircle, Info, AlertTriangle, Download, Eye, Phone 
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll,
    getUnreadCount,
    getTimeAgo 
  } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type, read) => {
    if (read) return 'bg-white dark:bg-gray-800';
    
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const handleAction = (action) => {
    switch (action) {
      case 'download_report':
        // Simuler le téléchargement
        console.log('Téléchargement du rapport...');
        break;
      case 'view_storage':
        // Naviguer vers la page de stockage
        console.log('Navigation vers le stockage...');
        break;
      case 'contact_provider':
        // Ouvrir modal de contact
        console.log('Contact du prestataire...');
        break;
      default:
        break;
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'download_report':
        return <Download className="w-4 h-4" />;
      case 'view_storage':
        return <Eye className="w-4 h-4" />;
      case 'contact_provider':
        return <Phone className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const unreadCount = getUnreadCount();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Actions bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                disabled={unreadCount === 0}
              >
                <CheckCheck className="w-4 h-4" />
                <span>Tout marquer comme lu</span>
              </button>
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
                disabled={notifications.length === 0}
              >
                <Trash2 className="w-4 h-4" />
                <span>Tout effacer</span>
              </button>
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Aucune notification pour le moment
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${getBgColor(notification.type, notification.read)}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {getTimeAgo(notification.time)}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2" />
                            )}
                          </div>
                          
                          {/* Actions */}
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="flex items-center space-x-2 mt-2">
                              {notification.actions.map((action, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAction(action.action);
                                  }}
                                  className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                  {getActionIcon(action.action)}
                                  <span>{action.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;