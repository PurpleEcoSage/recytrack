# RecyTrack - Solution de Gestion des Déchets pour Entreprises

<p align="center">
  <img src="frontend/public/logo192.png" alt="RecyTrack Logo" width="120" height="120">
</p>

<p align="center">
  <strong>Gérez, suivez et optimisez votre gestion des déchets en toute simplicité</strong>
</p>

<p align="center">
  <a href="#fonctionnalités">Fonctionnalités</a> •
  <a href="#installation">Installation</a> •
  <a href="#utilisation">Utilisation</a> •
  <a href="#api">API</a> •
  <a href="#support">Support</a>
</p>

---

## 🌟 Pourquoi RecyTrack ?

RecyTrack est une solution complète de gestion des déchets conçue pour les entreprises soucieuses de leur impact environnemental et de leur conformité réglementaire.

### Avantages clés :

- **📊 Tableaux de bord intuitifs** : Visualisez vos données en temps réel
- **♻️ Suivi du recyclage** : Mesurez et améliorez votre taux de recyclage
- **📈 Rapports détaillés** : Exportez vos données pour vos audits
- **🌍 Impact environnemental** : Calculez votre empreinte carbone évitée
- **💰 Gestion des coûts** : Optimisez vos dépenses de traitement
- **📱 Accessible partout** : Interface responsive pour mobile et desktop

## 🚀 Fonctionnalités

### Gestion des déclarations
- ✅ Déclaration simple et rapide des déchets
- ✅ Suivi par type, quantité et destination
- ✅ Upload de documents justificatifs
- ✅ Génération automatique de BSD (Bordereau de Suivi des Déchets)

### Analyse et rapports
- ✅ Dashboard temps réel avec KPIs
- ✅ Graphiques d'évolution mensuelle
- ✅ Export PDF personnalisé
- ✅ Calcul automatique de l'impact environnemental

### Gestion multi-utilisateurs
- ✅ Rôles et permissions (Admin, Manager, Utilisateur)
- ✅ Gestion par entreprise
- ✅ Historique des actions

### Conformité réglementaire
- ✅ Respect des normes de déclaration
- ✅ Archivage sécurisé des documents
- ✅ Traçabilité complète

## 💻 Installation

### Prérequis
- Node.js 14+
- MongoDB 4.4+
- NPM ou Yarn

### Installation rapide

```bash
# Cloner le repository
git clone https://github.com/recytrack/recytrack.git
cd recytrack

# Installer et démarrer
./start.sh
```

L'application sera accessible à : http://localhost:3000

### Installation manuelle

Voir le [Guide d'installation complet](INSTALLATION.md)

## 📖 Utilisation

### Premier démarrage

1. **Inscription** : Créez votre compte entreprise
2. **Configuration** : Personnalisez vos catégories de déchets
3. **Utilisateurs** : Invitez votre équipe
4. **Déclarations** : Commencez à déclarer vos déchets

### Workflow typique

1. **Déclarer** : Saisissez vos déchets au fur et à mesure
2. **Suivre** : Visualisez vos statistiques en temps réel
3. **Analyser** : Identifiez les axes d'amélioration
4. **Rapporter** : Exportez vos rapports mensuels

## 🔌 API

RecyTrack propose une API REST complète pour l'intégration avec vos systèmes existants.

### Endpoints principaux

```bash
# Authentification
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/logout

# Déclarations
GET    /api/declarations
POST   /api/declarations
PUT    /api/declarations/:id
DELETE /api/declarations/:id

# Rapports
GET    /api/reports/dashboard
GET    /api/reports/environmental
GET    /api/reports/export/:type
```

### Exemple d'utilisation

```javascript
// Authentification
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@company.com',
    password: 'password'
  })
});

const { token } = await response.json();

// Créer une déclaration
const declaration = await fetch('http://localhost:5000/api/declarations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    wasteType: {
      name: 'Papier/Carton',
      code: 'PAP',
      category: 'Non-dangereux'
    },
    quantity: {
      value: 250,
      unit: 'kg'
    },
    collectionDate: '2024-01-15',
    provider: 'provider-id',
    destination: 'Recyclage'
  })
});
```

## 🏢 Plans tarifaires

### Basic (Gratuit)
- Jusqu'à 5 utilisateurs
- 100 déclarations/mois
- Rapports standards
- Support communautaire

### Professional (49€/mois)
- Jusqu'à 20 utilisateurs
- Déclarations illimitées
- Rapports avancés
- Support prioritaire
- API access

### Enterprise (Sur devis)
- Utilisateurs illimités
- Fonctionnalités sur mesure
- SLA garantie
- Formation incluse

## 🔐 Sécurité

- ✅ Authentification JWT
- ✅ Chiffrement des données sensibles
- ✅ HTTPS obligatoire en production
- ✅ Sauvegarde automatique quotidienne
- ✅ Conformité RGPD

## 🤝 Support

### Documentation
- [Guide utilisateur](https://docs.recytrack.com/user-guide)
- [Documentation API](https://docs.recytrack.com/api)
- [FAQ](https://docs.recytrack.com/faq)

### Contact
- 📧 Email : support@recytrack.com
- 💬 Chat : Disponible dans l'application
- 📞 Téléphone : +33 1 23 45 67 89 (9h-18h)

### Communauté
- [Forum](https://community.recytrack.com)
- [GitHub Issues](https://github.com/recytrack/recytrack/issues)
- [Twitter](https://twitter.com/recytrack)

## 🚧 Roadmap

### Version 1.1 (Q1 2024)
- [ ] Application mobile native
- [ ] Intégration avec les ERP majeurs
- [ ] Module de prédiction IA

### Version 1.2 (Q2 2024)
- [ ] Marketplace de prestataires
- [ ] Certifications automatiques
- [ ] Module de formation intégré

## 📄 Licence

RecyTrack est disponible sous licence commerciale. Voir [LICENSE](LICENSE) pour plus de détails.

---

<p align="center">
  Fait avec ❤️ pour un monde plus propre 🌍
</p>