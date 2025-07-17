import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      type: 'info',
      title: 'Nouvelle déclaration', 
      message: 'Sophie Durand a ajouté une déclaration', 
      time: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      actions: []
    },
    { 
      id: 2, 
      type: 'success',
      title: 'Rapport mensuel', 
      message: 'Votre rapport de juin est prêt', 
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      actions: [{ label: 'Télécharger', action: 'download_report' }]
    },
    { 
      id: 3, 
      type: 'success',
      title: 'Objectif atteint', 
      message: 'Taux de recyclage > 70% !', 
      time: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      actions: []
    },
    {
      id: 4,
      type: 'warning',
      title: 'Capacité de stockage',
      message: 'Le stockage de bois atteint 85% de sa capacité',
      time: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      actions: [{ label: 'Voir détails', action: 'view_storage' }]
    },
    {
      id: 5,
      type: 'error',
      title: 'Collecte en retard',
      message: 'La collecte prévue ce matin n\'a pas eu lieu',
      time: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: false,
      actions: [{ label: 'Contacter prestataire', action: 'contact_provider' }]
    }
  ]);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      time: new Date(),
      read: false,
      actions: [],
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else if (diffInDays === 1) {
      return 'Hier';
    } else {
      return `Il y a ${diffInDays} jours`;
    }
  };

  return (
    <NotificationContext.Provider 
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        getUnreadCount,
        getTimeAgo
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};