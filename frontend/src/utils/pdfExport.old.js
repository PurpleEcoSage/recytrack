import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Constantes de design pour assurer la cohérence
const DESIGN = {
  // Palette de couleurs
  colors: {
    primary: [34, 197, 94],        // Vert principal
    secondary: [59, 130, 246],     // Bleu
    accent: [16, 185, 129],        // Vert émeraude
    warning: [245, 158, 11],       // Orange
    danger: [239, 68, 76],         // Rouge
    success: [34, 197, 94],        // Vert
    neutral: {
      100: [245, 245, 245],
      200: [230, 230, 230],
      300: [200, 200, 200],
      400: [156, 163, 175],
      500: [100, 100, 100],
      600: [75, 85, 99],
      700: [17, 24, 39]
    },
    white: [255, 255, 255],
    background: [250, 250, 250]
  },
  
  // Typographie
  fonts: {
    sizes: {
      xs: 8,
      sm: 9,
      base: 10,
      md: 11,
      lg: 12,
      xl: 14,
      '2xl': 16,
      '3xl': 18,
      '4xl': 20,
      '5xl': 24,
      '6xl': 28,
      '7xl': 36,
      '8xl': 48
    }
  },
  
  // Espacements
  spacing: {
    xs: 5,
    sm: 8,
    md: 10,
    lg: 15,
    xl: 20,
    '2xl': 25,
    '3xl': 30,
    '4xl': 40
  },
  
  // Marges de page
  margins: {
    top: 25,
    bottom: 25,
    left: 20,
    right: 20
  },
  
  // Hauteurs standards
  heights: {
    header: 50,
    footer: 30,
    sectionTitle: 30,
    card: 35,
    tableRow: 10
  }
};

// Classe utilitaire pour gérer le layout
class PDFLayoutManager {
  constructor(pdf) {
    this.pdf = pdf;
    this.pageWidth = pdf.internal.pageSize.getWidth();
    this.pageHeight = pdf.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - DESIGN.margins.left - DESIGN.margins.right;
    this.currentY = DESIGN.margins.top;
    this.pageNumber = 1;
  }
  
  // Vérifier et ajouter une nouvelle page si nécessaire
  checkNewPage(requiredSpace) {
    const availableSpace = this.pageHeight - this.currentY - DESIGN.margins.bottom;
    if (availableSpace < requiredSpace) {
      this.addNewPage();
    }
  }
  
  // Ajouter une nouvelle page
  addNewPage() {
    this.pdf.addPage();
    this.currentY = DESIGN.margins.top;
    this.pageNumber++;
  }
  
  // Ajouter de l'espace vertical
  addSpace(space = DESIGN.spacing.md) {
    this.currentY += space;
  }
  
  // Obtenir la position X centrée pour un élément
  getCenterX(width) {
    return (this.pageWidth - width) / 2;
  }
  
  // Dessiner l'en-tête de page
  drawHeader(title, subtitle, color = DESIGN.colors.primary) {
    // Bannière colorée
    this.pdf.setFillColor(...color);
    this.pdf.rect(0, 0, this.pageWidth, DESIGN.heights.header, 'F');
    
    // Titre principal
    this.pdf.setFontSize(DESIGN.fonts.sizes['6xl']);
    this.pdf.setTextColor(...DESIGN.colors.white);
    this.pdf.setFont(undefined, 'bold');
    this.pdf.text(title, this.pageWidth / 2, 20, { align: 'center' });
    
    // Sous-titre
    if (subtitle) {
      this.pdf.setFontSize(DESIGN.fonts.sizes.xl);
      this.pdf.setFont(undefined, 'normal');
      this.pdf.text(subtitle, this.pageWidth / 2, 32, { align: 'center' });
    }
    
    // Badge de date
    const dateX = this.pageWidth - 60;
    const dateY = DESIGN.heights.header + 10;
    this.pdf.setFillColor(...DESIGN.colors.neutral[100]);
    this.pdf.roundedRect(dateX, dateY, 50, 10, 2, 2, 'F');
    this.pdf.setFontSize(DESIGN.fonts.sizes.sm);
    this.pdf.setTextColor(...DESIGN.colors.neutral[500]);
    this.pdf.text(new Date().toLocaleDateString('fr-FR'), dateX + 25, dateY + 6, { align: 'center' });
    
    this.currentY = DESIGN.heights.header + 20;
  }
  
  // Dessiner un titre de section
  drawSectionTitle(title, icon = null) {
    this.checkNewPage(DESIGN.heights.sectionTitle);
    
    // Indicateur de section
    this.pdf.setFillColor(...DESIGN.colors.primary);
    this.pdf.circle(DESIGN.margins.left, this.currentY - 2, 2, 'F');
    
    // Titre
    this.pdf.setFontSize(DESIGN.fonts.sizes['3xl']);
    this.pdf.setTextColor(...DESIGN.colors.neutral[700]);
    this.pdf.setFont(undefined, 'bold');
    
    const titleX = DESIGN.margins.left + 8;
    if (icon) {
      this.pdf.text(icon + ' ' + title, titleX, this.currentY);
    } else {
      this.pdf.text(title, titleX, this.currentY);
    }
    
    this.currentY += DESIGN.spacing.lg;
  }
  
  // Dessiner une carte de statistique
  drawStatCard(stat, x, y, width = 85, height = 32) {
    // Fond de carte avec ombre
    this.pdf.setFillColor(...DESIGN.colors.white);
    this.pdf.setDrawColor(...DESIGN.colors.neutral[200]);
    this.pdf.setLineWidth(0.1);
    this.pdf.roundedRect(x, y, width, height, 3, 3, 'FD');
    
    // Accent coloré à gauche
    if (stat.color) {
      this.pdf.setFillColor(...stat.color);
      this.pdf.roundedRect(x, y, 3, height, 1.5, 1.5, 'F');
    }
    
    // Icône dans un cercle
    if (stat.icon) {
      this.pdf.setFillColor(...(stat.color || DESIGN.colors.primary));
      this.pdf.setGState(new this.pdf.GState({ opacity: 0.1 }));
      this.pdf.circle(x + 15, y + height/2, 10, 'F');
      this.pdf.setGState(new this.pdf.GState({ opacity: 1 }));
      
      this.pdf.setFontSize(DESIGN.fonts.sizes.lg);
      this.pdf.text(stat.icon, x + 15, y + height/2 + 2, { align: 'center' });
    }
    
    // Textes
    const textX = stat.icon ? x + 30 : x + 10;
    
    // Label
    this.pdf.setFontSize(DESIGN.fonts.sizes.sm);
    this.pdf.setTextColor(...DESIGN.colors.neutral[500]);
    this.pdf.setFont(undefined, 'normal');
    this.pdf.text(stat.label, textX, y + 10);
    
    // Valeur
    this.pdf.setFontSize(DESIGN.fonts.sizes.xl);
    this.pdf.setTextColor(...DESIGN.colors.neutral[700]);
    this.pdf.setFont(undefined, 'bold');
    this.pdf.text(stat.value, textX, y + 20);
    
    // Tendance
    if (stat.trend) {
      const trendColor = stat.trend.startsWith('+') ? DESIGN.colors.success : DESIGN.colors.danger;
      const arrow = stat.trend.startsWith('+') ? '↑' : '↓';
      
      this.pdf.setFontSize(DESIGN.fonts.sizes.base);
      this.pdf.setTextColor(...trendColor);
      this.pdf.setFont(undefined, 'normal');
      this.pdf.text(`${arrow} ${stat.trend}`, x + width - 20, y + height - 5);
    }
  }
  
  // Dessiner le pied de page
  drawFooter(text = 'RecyTrack - Plateforme de gestion environnementale') {
    const y = this.pageHeight - DESIGN.margins.bottom;
    
    // Ligne de séparation
    this.pdf.setDrawColor(...DESIGN.colors.neutral[200]);
    this.pdf.setLineWidth(0.1);
    this.pdf.line(DESIGN.margins.left, y - 5, this.pageWidth - DESIGN.margins.right, y - 5);
    
    // Texte du pied de page
    this.pdf.setFontSize(DESIGN.fonts.sizes.sm);
    this.pdf.setTextColor(...DESIGN.colors.neutral[400]);
    this.pdf.text(text, DESIGN.margins.left, y);
    
    // Numéro de page
    this.pdf.text(`Page ${this.pageNumber}`, this.pageWidth - DESIGN.margins.right, y, { align: 'right' });
  }
  
  // Dessiner un encadré d'information
  drawInfoBox(content, type = 'info') {
    const colors = {
      info: { bg: [236, 253, 245], border: DESIGN.colors.accent, text: DESIGN.colors.neutral[600] },
      warning: { bg: [254, 243, 199], border: DESIGN.colors.warning, text: [146, 64, 14] },
      success: { bg: [236, 253, 245], border: DESIGN.colors.success, text: DESIGN.colors.neutral[600] }
    };
    
    const config = colors[type] || colors.info;
    const boxHeight = 35;
    
    this.checkNewPage(boxHeight);
    
    this.pdf.setFillColor(...config.bg);
    this.pdf.setDrawColor(...config.border);
    this.pdf.setLineWidth(0.5);
    this.pdf.roundedRect(DESIGN.margins.left, this.currentY, this.contentWidth, boxHeight, 3, 3, 'FD');
    
    this.pdf.setFontSize(DESIGN.fonts.sizes.base);
    this.pdf.setTextColor(...config.text);
    
    const lines = this.pdf.splitTextToSize(content, this.contentWidth - 20);
    lines.forEach((line, index) => {
      this.pdf.text(line, DESIGN.margins.left + 10, this.currentY + 12 + (index * 6));
    });
    
    this.currentY += boxHeight + DESIGN.spacing.md;
  }
}

// Fonction pour exporter le tableau de bord en PDF
export const exportDashboardToPDF = async (dashboardData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const layout = new PDFLayoutManager(pdf);
  
  // En-tête
  layout.drawHeader('RecyTrack', 'Tableau de bord environnemental');
  
  // Section KPI
  layout.drawSectionTitle('Indicateurs clés de performance');
  
  // Préparer les données des statistiques
  const stats = dashboardData?.stats ? [
    { 
      label: 'Total déchets', 
      value: `${dashboardData.stats.totalWeight} tonnes`, 
      trend: dashboardData.stats.trends?.weight || '+12.3%', 
      icon: '📊', 
      color: DESIGN.colors.secondary 
    },
    { 
      label: 'Taux de recyclage', 
      value: `${dashboardData.stats.recyclingRate}%`, 
      trend: dashboardData.stats.trends?.rate || '+5.2%', 
      icon: '♻️', 
      color: DESIGN.colors.success 
    },
    { 
      label: 'Coût total', 
      value: `${dashboardData.stats.totalCost.toLocaleString()} €`, 
      trend: dashboardData.stats.trends?.cost || '-3.1%', 
      icon: '💰', 
      color: [139, 92, 246] 
    },
    { 
      label: 'CO₂ économisé', 
      value: `${dashboardData.stats.co2Saved} tonnes`, 
      trend: '+8.7%', 
      icon: '🌱', 
      color: DESIGN.colors.accent 
    }
  ] : [
    { label: 'Total déchets', value: '24.3 tonnes', trend: '+12.3%', icon: '📊', color: DESIGN.colors.secondary },
    { label: 'Taux de recyclage', value: '68%', trend: '+5.2%', icon: '♻️', color: DESIGN.colors.success },
    { label: 'Coût total', value: '3,650 €', trend: '-3.1%', icon: '💰', color: [139, 92, 246] },
    { label: 'CO₂ économisé', value: '45.2 tonnes', trend: '+8.7%', icon: '🌱', color: DESIGN.colors.accent }
  ];
  
  // Afficher les cartes de statistiques en grille 2x2
  const cardWidth = 85;
  const cardHeight = 32;
  const cardSpacing = 10;
  
  stats.forEach((stat, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const x = DESIGN.margins.left + col * (cardWidth + cardSpacing);
    const y = layout.currentY + row * (cardHeight + cardSpacing);
    
    layout.drawStatCard(stat, x, y, cardWidth, cardHeight);
  });
  
  layout.currentY += 2 * (cardHeight + cardSpacing) + DESIGN.spacing.lg;
  
  // Section déclarations
  layout.drawSectionTitle('Dernières déclarations');
  
  // Préparer les données du tableau
  const declarations = dashboardData?.lastDeclarations || [];
  const tableData = declarations.length > 0 ? 
    declarations.map(dec => [
      dec.id,
      dec.type,
      `${dec.quantity} kg`,
      new Date(dec.date).toLocaleDateString('fr-FR'),
      dec.status
    ]) : [
      ['DEC-001', 'Papier/Carton', '450 kg', '15/07/2024', 'Collecté'],
      ['DEC-002', 'Plastique', '280 kg', '16/07/2024', 'En traitement'],
      ['DEC-003', 'Bois', '1200 kg', '20/07/2024', 'Programmé'],
      ['DEC-004', 'Métaux', '180 kg', '18/07/2024', 'En attente']
    ];
  
  // Tableau avec design cohérent
  autoTable(pdf, {
    startY: layout.currentY,
    head: [['ID', 'Type', 'Quantité', 'Date', 'Statut']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: DESIGN.colors.primary,
      textColor: DESIGN.colors.white,
      fontSize: DESIGN.fonts.sizes.md,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 5
    },
    bodyStyles: {
      fontSize: DESIGN.fonts.sizes.base,
      cellPadding: 4,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: DESIGN.colors.background
    },
    styles: { 
      lineColor: DESIGN.colors.neutral[200],
      lineWidth: 0.1
    },
    margin: { left: DESIGN.margins.left, right: DESIGN.margins.right },
    columnStyles: {
      0: { cellWidth: 30, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 35, halign: 'center' },
      4: { cellWidth: 35, halign: 'center' }
    },
    didDrawCell: (data) => {
      // Badge de statut avec design cohérent
      if (data.column.index === 4 && data.cell.section === 'body') {
        const status = data.cell.text[0];
        let bgColor = DESIGN.colors.neutral[400];
        let textColor = DESIGN.colors.white;
        
        if (status === 'Collecté') {
          bgColor = DESIGN.colors.success;
        } else if (status === 'En traitement') {
          bgColor = DESIGN.colors.secondary;
        } else if (status === 'Programmé') {
          bgColor = DESIGN.colors.warning;
        } else if (status === 'En attente') {
          bgColor = DESIGN.colors.neutral[400];
        }
        
        const cellX = data.cell.x;
        const cellY = data.cell.y;
        const cellWidth = data.cell.width;
        const cellHeight = data.cell.height;
        
        // Badge centré
        const badgeWidth = cellWidth - 10;
        const badgeHeight = 6;
        const badgeX = cellX + (cellWidth - badgeWidth) / 2;
        const badgeY = cellY + (cellHeight - badgeHeight) / 2;
        
        pdf.setFillColor(...bgColor);
        pdf.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, 'F');
        
        pdf.setTextColor(...textColor);
        pdf.setFontSize(DESIGN.fonts.sizes.xs);
        pdf.setFont(undefined, 'bold');
        pdf.text(status, cellX + cellWidth / 2, cellY + cellHeight / 2 + 1, { align: 'center' });
      }
    }
  });
  
  layout.currentY = pdf.lastAutoTable.finalY + DESIGN.spacing.lg;
  
  // Zone d'impact environnemental
  const impactContent = dashboardData?.stats ? 
    `🌍 Impact environnemental positif\n\nGrâce à vos efforts, vous avez économisé ${dashboardData.stats.co2Saved} tonnes de CO₂ ce mois-ci, soit l'équivalent de 312 arbres plantés ou 125 000 litres d'eau préservés.` :
    '🌍 Impact environnemental positif\n\nGrâce à vos efforts, vous avez économisé 45.2 tonnes de CO₂ ce mois-ci, soit l\'équivalent de 312 arbres plantés ou 125 000 litres d\'eau préservés.';
  
  layout.drawInfoBox(impactContent, 'success');
  
  // Pied de page
  layout.drawFooter();
  
  // Sauvegarder le PDF
  pdf.save(`recytrack_dashboard_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Fonction pour exporter les déclarations en PDF
export const exportDeclarationsToPDF = (declarations) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const layout = new PDFLayoutManager(pdf);
  
  // En-tête
  layout.drawHeader('RecyTrack', 'Liste des déclarations de déchets', DESIGN.colors.secondary);
  
  // Carte de résumé
  const totalKg = declarations.reduce((sum, dec) => sum + (dec.quantity || 0), 0);
  const recycledCount = declarations.filter(dec => dec.status === 'collected' || dec.status === 'processing').length;
  const recyclingRate = declarations.length > 0 ? Math.round(recycledCount / declarations.length * 100) : 0;
  
  // Statistiques résumées
  const summaryStats = [
    { icon: '📄', value: `${declarations.length}`, label: 'déclarations' },
    { icon: '⚖️', value: `${totalKg.toLocaleString()}`, label: 'kg total' },
    { icon: '✅', value: `${recyclingRate}%`, label: 'traités' }
  ];
  
  // Afficher les statistiques en ligne
  const statWidth = 60;
  summaryStats.forEach((stat, index) => {
    const x = DESIGN.margins.left + index * statWidth;
    
    // Carte de stat simplifiée
    pdf.setFillColor(...DESIGN.colors.neutral[100]);
    pdf.roundedRect(x, layout.currentY, statWidth - 5, 25, 3, 3, 'F');
    
    // Icône
    pdf.setFontSize(DESIGN.fonts.sizes.xl);
    pdf.text(stat.icon, x + 8, layout.currentY + 10);
    
    // Valeur
    pdf.setFontSize(DESIGN.fonts.sizes.lg);
    pdf.setTextColor(...DESIGN.colors.neutral[700]);
    pdf.setFont(undefined, 'bold');
    pdf.text(stat.value, x + 20, layout.currentY + 10);
    
    // Label
    pdf.setFontSize(DESIGN.fonts.sizes.sm);
    pdf.setTextColor(...DESIGN.colors.neutral[500]);
    pdf.setFont(undefined, 'normal');
    pdf.text(stat.label, x + 20, layout.currentY + 17);
  });
  
  layout.currentY += 35;
  
  // Section détail des déclarations
  layout.drawSectionTitle('Détail des déclarations');
  
  // Préparer les données du tableau
  const tableData = declarations.map(dec => [
    dec.id,
    dec.wasteType,
    `${dec.quantity} kg`,
    new Date(dec.date).toLocaleDateString('fr-FR'),
    dec.provider || '-',
    dec.status === 'pending' ? 'En attente' : 
    dec.status === 'collected' ? 'Collecté' : 
    dec.status === 'processing' ? 'En traitement' : dec.status
  ]);
  
  // Tableau avec design cohérent
  autoTable(pdf, {
    startY: layout.currentY,
    head: [['ID', 'Type de déchet', 'Quantité', 'Date', 'Prestataire', 'Statut']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: DESIGN.colors.secondary,
      textColor: DESIGN.colors.white,
      fontSize: DESIGN.fonts.sizes.base,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: DESIGN.fonts.sizes.sm,
      cellPadding: 3,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    styles: { 
      lineColor: DESIGN.colors.neutral[200],
      lineWidth: 0.1
    },
    margin: { left: DESIGN.margins.left, right: DESIGN.margins.right },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 35 },
      5: { cellWidth: 25, halign: 'center' }
    },
    didDrawCell: (data) => {
      // Badges colorés pour les statuts
      if (data.column.index === 5 && data.cell.section === 'body') {
        const status = data.cell.text[0];
        let bgColor = DESIGN.colors.neutral[400];
        
        if (status === 'Collecté') {
          bgColor = DESIGN.colors.success;
        } else if (status === 'En traitement') {
          bgColor = DESIGN.colors.secondary;
        } else if (status === 'En attente') {
          bgColor = DESIGN.colors.warning;
        }
        
        const cellX = data.cell.x;
        const cellY = data.cell.y;
        const cellWidth = data.cell.width;
        const cellHeight = data.cell.height;
        
        // Badge centré
        const badgeWidth = cellWidth - 6;
        const badgeHeight = 5;
        const badgeX = cellX + (cellWidth - badgeWidth) / 2;
        const badgeY = cellY + (cellHeight - badgeHeight) / 2;
        
        pdf.setFillColor(...bgColor);
        pdf.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, 'F');
        
        pdf.setTextColor(...DESIGN.colors.white);
        pdf.setFontSize(DESIGN.fonts.sizes.xs);
        pdf.setFont(undefined, 'bold');
        pdf.text(status, cellX + cellWidth / 2, cellY + cellHeight / 2 + 0.5, { align: 'center' });
      }
      
      // Icônes pour les types de déchets
      if (data.column.index === 1 && data.cell.section === 'body') {
        const type = data.cell.text[0];
        let icon = '📦';
        if (type.includes('Papier')) icon = '📄';
        else if (type.includes('Plastique')) icon = '🥤';
        else if (type.includes('Verre')) icon = '🍶';
        else if (type.includes('Bois')) icon = '🪵';
        else if (type.includes('Métal')) icon = '🔧';
        
        pdf.setFontSize(DESIGN.fonts.sizes.base);
        pdf.text(icon + ' ', data.cell.x + 2, data.cell.y + data.cell.height / 2 + 1);
      }
    }
  });
  
  layout.currentY = pdf.lastAutoTable.finalY + DESIGN.spacing.lg;
  
  // Note informative
  if (layout.currentY < layout.pageHeight - 60) {
    const noteContent = '⚠️ Note: Les déclarations en attente doivent être traitées dans les 30 jours. Contactez votre prestataire pour accélérer le traitement si nécessaire.';
    layout.drawInfoBox(noteContent, 'warning');
  }
  
  // Pied de page
  layout.drawFooter(`RecyTrack - Total: ${declarations.length} déclarations`);
  
  pdf.save(`recytrack_declarations_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Fonction pour exporter un rapport détaillé en PDF
export const exportDetailedReportToPDF = async (reportData) => {
  // Rediriger vers la fonction appropriée selon le type de rapport
  if (reportData.reportType === 'environmental') {
    return exportEnvironmentalReportToPDF(reportData);
  }
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const layout = new PDFLayoutManager(pdf);
  
  // Page de garde
  createCoverPage(pdf, 'Rapport Environnemental Détaillé', reportData);
  
  // Table des matières
  pdf.addPage();
  layout.currentY = DESIGN.margins.top;
  layout.drawSectionTitle('Sommaire');
  
  const sections = [
    { num: '1', title: 'Résumé exécutif', page: '3' },
    { num: '2', title: 'Indicateurs clés', page: '3' },
    { num: '3', title: 'Performance par type', page: '4' },
    { num: '4', title: 'Évolution mensuelle', page: '5' },
    { num: '5', title: 'Recommandations', page: '6' }
  ];
  
  sections.forEach((section, index) => {
    const y = layout.currentY + index * 8;
    pdf.setFontSize(DESIGN.fonts.sizes.lg);
    pdf.setTextColor(...DESIGN.colors.secondary);
    pdf.text(section.num + '.', DESIGN.margins.left + 5, y);
    pdf.setTextColor(...DESIGN.colors.neutral[700]);
    pdf.text(section.title, DESIGN.margins.left + 15, y);
    pdf.setTextColor(...DESIGN.colors.neutral[400]);
    
    // Points de suite
    const dotsWidth = 120;
    const dotsX = DESIGN.margins.left + 15 + pdf.getTextWidth(section.title) + 5;
    pdf.text('.'.repeat(Math.floor((dotsWidth - pdf.getTextWidth(section.title)) / 2)), dotsX, y);
    
    pdf.text(section.page, layout.pageWidth - DESIGN.margins.right - 10, y);
  });
  
  // Contenu du rapport
  pdf.addPage();
  layout.currentY = DESIGN.margins.top;
  layout.pageNumber = 3;
  
  // 1. Résumé exécutif
  layout.drawSectionTitle('1. Résumé Exécutif');
  
  // KPIs principaux
  const kpis = [
    { 
      icon: '📦', 
      label: 'Volume total', 
      value: reportData.totalWaste || '156.7 tonnes',
      color: DESIGN.colors.secondary,
      trend: '+12.3%'
    },
    { 
      icon: '♻️', 
      label: 'Taux de recyclage', 
      value: reportData.recyclingRate || '72%',
      color: DESIGN.colors.success,
      trend: '+5.2%'
    },
    { 
      icon: '💰', 
      label: 'Coût total', 
      value: reportData.totalCost || '23,100 €',
      color: [139, 92, 246],
      trend: '-3.1%'
    },
    { 
      icon: '🌱', 
      label: 'CO₂ évité', 
      value: reportData.co2Saved || '89.4 tonnes',
      color: DESIGN.colors.accent,
      trend: '+8.7%'
    }
  ];
  
  // Affichage en grille 2x2
  const cardWidth = 85;
  const cardHeight = 35;
  const cardSpacing = 10;
  
  kpis.forEach((kpi, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const x = DESIGN.margins.left + col * (cardWidth + cardSpacing);
    const y = layout.currentY + row * (cardHeight + cardSpacing);
    
    layout.drawStatCard(kpi, x, y, cardWidth, cardHeight);
  });
  
  layout.currentY += 2 * (cardHeight + cardSpacing) + DESIGN.spacing.xl;
  
  // 2. Performance par type
  layout.drawSectionTitle('2. Performance par Type de Déchet');
  
  const wasteTypes = reportData.wasteByType || [
    ['Papier/Carton', '35%', '54.8 t', '95%'],
    ['Plastique', '29%', '45.4 t', '68%'],
    ['Bois', '21%', '32.9 t', '82%'],
    ['Verre', '15%', '23.5 t', '100%']
  ];
  
  autoTable(pdf, {
    startY: layout.currentY,
    head: [['Type', 'Part du total', 'Volume', 'Taux de recyclage']],
    body: wasteTypes,
    theme: 'grid',
    headStyles: { 
      fillColor: DESIGN.colors.primary,
      textColor: DESIGN.colors.white,
      fontSize: DESIGN.fonts.sizes.md,
      fontStyle: 'bold',
      cellPadding: 5
    },
    bodyStyles: {
      fontSize: DESIGN.fonts.sizes.base,
      cellPadding: 5,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: DESIGN.colors.background
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 40, halign: 'center' }
    },
    didDrawCell: (data) => {
      // Barres de progression pour le taux de recyclage
      if (data.column.index === 3 && data.cell.section === 'body') {
        const value = parseInt(data.cell.text[0]);
        const cellX = data.cell.x;
        const cellY = data.cell.y;
        const cellHeight = data.cell.height;
        
        // Barre de fond
        pdf.setFillColor(...DESIGN.colors.neutral[200]);
        pdf.roundedRect(cellX + 5, cellY + cellHeight - 8, 30, 4, 1, 1, 'F');
        
        // Barre de progression
        const color = value >= 80 ? DESIGN.colors.success : 
                     value >= 60 ? DESIGN.colors.warning : 
                     DESIGN.colors.danger;
        pdf.setFillColor(...color);
        pdf.roundedRect(cellX + 5, cellY + cellHeight - 8, 30 * value / 100, 4, 1, 1, 'F');
      }
    }
  });
  
  layout.currentY = pdf.lastAutoTable.finalY + DESIGN.spacing.xl;
  
  // Nouvelle page pour l'évolution mensuelle
  layout.checkNewPage(150);
  layout.drawSectionTitle('3. Évolution Mensuelle');
  
  const monthlyData = reportData.monthlyEvolution || [
    ['Janvier', '18.5 t', '11.1 t', '60%', '2,800 €'],
    ['Février', '21.2 t', '14.8 t', '70%', '3,200 €'],
    ['Mars', '19.8 t', '12.9 t', '65%', '2,950 €'],
    ['Avril', '23.4 t', '16.4 t', '70%', '3,500 €'],
    ['Mai', '25.4 t', '17.3 t', '68%', '3,800 €'],
    ['Juin', '22.1 t', '15.5 t', '70%', '3,300 €'],
    ['Juillet', '24.3 t', '17.5 t', '72%', '3,600 €']
  ];
  
  autoTable(pdf, {
    startY: layout.currentY,
    head: [['Mois', 'Total', 'Recyclé', 'Taux', 'Coût']],
    body: monthlyData,
    theme: 'grid',
    headStyles: { 
      fillColor: DESIGN.colors.secondary,
      textColor: DESIGN.colors.white,
      fontSize: DESIGN.fonts.sizes.md,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 4
    },
    bodyStyles: {
      fontSize: DESIGN.fonts.sizes.base,
      cellPadding: 4,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 30, halign: 'right' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 35, halign: 'right' }
    },
    didDrawCell: (data) => {
      // Coloration du taux selon la performance
      if (data.column.index === 3 && data.cell.section === 'body') {
        const value = parseInt(data.cell.text[0]);
        let color = DESIGN.colors.neutral[600];
        if (value >= 70) color = DESIGN.colors.success;
        else if (value >= 60) color = DESIGN.colors.warning;
        else color = DESIGN.colors.danger;
        
        pdf.setTextColor(...color);
        pdf.setFont(undefined, 'bold');
        pdf.text(data.cell.text[0], data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' });
      }
    }
  });
  
  layout.currentY = pdf.lastAutoTable.finalY + DESIGN.spacing.lg;
  
  // Tendance
  const trendContent = '📈 Tendance positive\n\nLe taux de recyclage a augmenté de 12% sur les 6 derniers mois.\nObjectif annuel: Atteindre 75% de taux de recyclage d\'ici décembre.';
  layout.drawInfoBox(trendContent, 'success');
  
  // Recommandations
  layout.checkNewPage(200);
  layout.drawSectionTitle('4. Recommandations Stratégiques');
  
  const recommendations = reportData.recommendations || [
    { priority: 'haute', icon: '🔴', title: 'Améliorer le tri du plastique', desc: 'Le taux de recyclage du plastique est inférieur à 70%. Formation du personnel recommandée.' },
    { priority: 'haute', icon: '🔴', title: 'Optimiser les coûts', desc: 'Renégocier les contrats avec les prestataires pour réduire les coûts de 10%.' },
    { priority: 'moyenne', icon: '🟡', title: 'Formation continue', desc: 'Organiser des sessions trimestrielles sur les bonnes pratiques de tri.' },
    { priority: 'moyenne', icon: '🟡', title: 'Infrastructure', desc: 'Installer 5 nouveaux points de collecte dans les zones à fort trafic.' },
    { priority: 'basse', icon: '🟢', title: 'Certification', desc: 'Préparer la certification ISO 14001 pour le prochain audit.' }
  ];
  
  recommendations.forEach((rec, index) => {
    layout.checkNewPage(35);
    const cardY = layout.currentY;
    
    // Carte de recommandation
    pdf.setFillColor(...DESIGN.colors.white);
    pdf.setDrawColor(...DESIGN.colors.neutral[200]);
    pdf.roundedRect(DESIGN.margins.left, cardY, layout.contentWidth, 30, 3, 3, 'FD');
    
    // Indicateur de priorité
    let priorityColor = DESIGN.colors.success;
    if (rec.priority === 'haute') priorityColor = DESIGN.colors.danger;
    else if (rec.priority === 'moyenne') priorityColor = DESIGN.colors.warning;
    
    pdf.setFillColor(...priorityColor);
    pdf.roundedRect(DESIGN.margins.left, cardY, 3, 30, 1.5, 1.5, 'F');
    
    // Contenu
    pdf.setFontSize(DESIGN.fonts.sizes.lg);
    pdf.text(rec.icon, DESIGN.margins.left + 8, cardY + 10);
    
    pdf.setFontSize(DESIGN.fonts.sizes.md);
    pdf.setTextColor(...DESIGN.colors.neutral[700]);
    pdf.setFont(undefined, 'bold');
    pdf.text(`${index + 1}. ${rec.title}`, DESIGN.margins.left + 20, cardY + 10);
    
    // Description
    pdf.setFontSize(DESIGN.fonts.sizes.sm);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(...DESIGN.colors.neutral[600]);
    const descLines = pdf.splitTextToSize(rec.desc, layout.contentWidth - 30);
    descLines.forEach((line, lineIndex) => {
      pdf.text(line, DESIGN.margins.left + 20, cardY + 18 + lineIndex * 5);
    });
    
    // Badge de priorité
    const badgeX = layout.pageWidth - DESIGN.margins.right - 40;
    pdf.setFillColor(...priorityColor);
    pdf.setGState(new pdf.GState({ opacity: 0.1 }));
    pdf.roundedRect(badgeX, cardY + 5, 35, 8, 2, 2, 'F');
    pdf.setGState(new pdf.GState({ opacity: 1 }));
    
    pdf.setTextColor(...priorityColor);
    pdf.setFontSize(DESIGN.fonts.sizes.xs);
    pdf.text(`Priorité ${rec.priority}`, badgeX + 17.5, cardY + 10, { align: 'center' });
    
    layout.currentY += 35;
  });
  
  // Conclusion
  layout.currentY += DESIGN.spacing.md;
  const conclusionContent = '🎉 Conclusion\n\nVotre entreprise montre une progression constante dans sa gestion des déchets.\nContinuez vos efforts pour atteindre l\'objectif de 75% de recyclage!';
  layout.drawInfoBox(conclusionContent, 'success');
  
  // Ajouter les pieds de page sur toutes les pages
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    if (i > 1) { // Pas de pied de page sur la page de garde
      const pageLayout = new PDFLayoutManager(pdf);
      pageLayout.pageNumber = i - 1;
      pageLayout.drawFooter('RecyTrack - Rapport Environnemental');
    }
  }
  
  pdf.save(`recytrack_rapport_detaille_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Fonction pour créer une page de garde
function createCoverPage(pdf, title, reportData) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Fond dégradé
  pdf.setFillColor(...DESIGN.colors.primary);
  pdf.rect(0, 0, pageWidth, pageHeight/2, 'F');
  
  // Motif géométrique subtil
  pdf.setDrawColor(...DESIGN.colors.white);
  pdf.setGState(new pdf.GState({ opacity: 0.1 }));
  for(let i = 0; i < 5; i++) {
    pdf.circle(pageWidth - 30 - i*20, 50 + i*15, 40 - i*5, 'S');
  }
  pdf.setGState(new pdf.GState({ opacity: 1 }));
  
  // Logo et titre
  const yPosition = pageHeight/4;
  pdf.setFontSize(DESIGN.fonts.sizes['8xl']);
  pdf.setTextColor(...DESIGN.colors.white);
  pdf.setFont(undefined, 'bold');
  pdf.text('RecyTrack', pageWidth / 2, yPosition, { align: 'center' });
  
  // Ligne de séparation
  pdf.setDrawColor(...DESIGN.colors.white);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth/2 - 40, yPosition + 10, pageWidth/2 + 40, yPosition + 10);
  
  // Sous-titre
  pdf.setFontSize(DESIGN.fonts.sizes['5xl']);
  pdf.setFont(undefined, 'normal');
  const titleLines = pdf.splitTextToSize(title, 140);
  titleLines.forEach((line, index) => {
    pdf.text(line, pageWidth / 2, yPosition + 25 + index * 10, { align: 'center' });
  });
  
  // Informations du rapport
  const infoY = pageHeight/2 + 40;
  pdf.setFillColor(...DESIGN.colors.neutral[100]);
  pdf.roundedRect(30, infoY - 15, pageWidth - 60, 50, 5, 5, 'F');
  
  pdf.setFontSize(DESIGN.fonts.sizes['2xl']);
  pdf.setTextColor(...DESIGN.colors.neutral[700]);
  pdf.setFont(undefined, 'bold');
  pdf.text(reportData.period || 'Juillet 2024', pageWidth / 2, infoY, { align: 'center' });
  
  pdf.setFontSize(DESIGN.fonts.sizes.xl);
  pdf.setFont(undefined, 'normal');
  pdf.setTextColor(...DESIGN.colors.neutral[600]);
  pdf.text(reportData.company || 'EcoEntreprise SAS', pageWidth / 2, infoY + 12, { align: 'center' });
  
  pdf.setFontSize(DESIGN.fonts.sizes.md);
  pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, infoY + 24, { align: 'center' });
}

// Fonction pour capturer et exporter un graphique en PDF
export const exportChartToPDF = async (chartElementId, title) => {
  const element = document.getElementById(chartElementId);
  if (!element) {
    console.error(`Element with id ${chartElementId} not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const pdf = new jsPDF('l', 'mm', 'a4'); // Paysage pour les graphiques
    const layout = new PDFLayoutManager(pdf);
    
    // En-tête simple
    pdf.setFontSize(DESIGN.fonts.sizes['3xl']);
    pdf.setTextColor(...DESIGN.colors.primary);
    pdf.setFont(undefined, 'bold');
    pdf.text(title || 'Graphique RecyTrack', layout.pageWidth / 2, 20, { align: 'center' });
    
    // Date
    pdf.setFontSize(DESIGN.fonts.sizes.lg);
    pdf.setTextColor(...DESIGN.colors.neutral[600]);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, layout.pageWidth / 2, 30, { align: 'center' });
    
    // Image du graphique
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = layout.pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const xPosition = (layout.pageWidth - imgWidth) / 2;
    const yPosition = 40;
    
    pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
    
    // Pied de page
    layout.currentY = layout.pageHeight - DESIGN.margins.bottom;
    layout.drawFooter();
    
    pdf.save(`recytrack_${title?.toLowerCase().replace(/ /g, '_') || 'graphique'}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Erreur lors de l\'export du graphique:', error);
  }
};

// Fonction pour exporter le rapport environnemental en PDF
export const exportEnvironmentalReportToPDF = async (reportData) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const layout = new PDFLayoutManager(pdf);
  
  // Page de garde environnementale
  createEnvironmentalCoverPage(pdf, reportData);
  
  // Table des matières
  pdf.addPage();
  layout.currentY = DESIGN.margins.top;
  layout.drawSectionTitle('Sommaire');
  
  const sections = [
    { num: '1', title: 'Impact carbone global', page: '3' },
    { num: '2', title: 'Métriques environnementales', page: '3' },
    { num: '3', title: 'Progression vers les objectifs', page: '4' },
    { num: '4', title: 'Certifications et labels', page: '5' },
    { num: '5', title: 'Plan d\'action écologique', page: '6' }
  ];
  
  sections.forEach((section, index) => {
    const y = layout.currentY + index * 8;
    pdf.setFontSize(DESIGN.fonts.sizes.lg);
    pdf.setTextColor(...DESIGN.colors.accent);
    pdf.text(section.num + '.', DESIGN.margins.left + 5, y);
    pdf.setTextColor(...DESIGN.colors.neutral[700]);
    pdf.text(section.title, DESIGN.margins.left + 15, y);
    pdf.setTextColor(...DESIGN.colors.neutral[400]);
    
    // Points de suite
    const dotsWidth = 120;
    const dotsX = DESIGN.margins.left + 15 + pdf.getTextWidth(section.title) + 5;
    pdf.text('.'.repeat(Math.floor((dotsWidth - pdf.getTextWidth(section.title)) / 2)), dotsX, y);
    
    pdf.text(section.page, layout.pageWidth - DESIGN.margins.right - 10, y);
  });
  
  // Contenu du rapport
  pdf.addPage();
  layout.currentY = DESIGN.margins.top;
  layout.pageNumber = 3;
  
  // 1. Impact carbone global
  layout.drawSectionTitle('1. Impact Carbone Global');
  
  // Métriques environnementales
  const envMetrics = reportData.environmentalMetrics || {};
  const metrics = [
    { 
      icon: '🌍', 
      label: 'CO₂ évité', 
      value: envMetrics.co2Avoided + ' tCO₂e' || '89.4 tCO₂e',
      color: DESIGN.colors.accent,
      desc: 'Équivalent à 178 vols Paris-NY'
    },
    { 
      icon: '🌳', 
      label: 'Arbres équivalents', 
      value: envMetrics.treesEquivalent + ' arbres' || '4,470 arbres',
      color: DESIGN.colors.success,
      desc: 'Compensation annuelle'
    },
    { 
      icon: '💧', 
      label: 'Eau préservée', 
      value: envMetrics.waterPreserved + ' L' || '125,000 L',
      color: DESIGN.colors.secondary,
      desc: '50 piscines olympiques'
    },
    { 
      icon: '⚡', 
      label: 'Énergie économisée', 
      value: envMetrics.energySaved + ' MWh' || '456 MWh',
      color: [139, 92, 246],
      desc: '152 foyers/an'
    }
  ];
  
  // Affichage en grille 2x2
  const cardWidth = 85;
  const cardHeight = 40;
  const cardSpacing = 10;
  
  metrics.forEach((metric, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const x = DESIGN.margins.left + col * (cardWidth + cardSpacing);
    const y = layout.currentY + row * (cardHeight + cardSpacing);
    
    // Carte avec design cohérent
    pdf.setFillColor(...DESIGN.colors.white);
    pdf.setDrawColor(...DESIGN.colors.neutral[200]);
    pdf.roundedRect(x, y, cardWidth, cardHeight, 4, 4, 'FD');
    
    // Bande colorée à gauche
    pdf.setFillColor(...metric.color);
    pdf.roundedRect(x, y, 3, cardHeight, 1.5, 1.5, 'F');
    
    // Icône
    pdf.setFontSize(DESIGN.fonts.sizes['4xl']);
    pdf.text(metric.icon, x + 10, y + 15);
    
    // Textes
    pdf.setFontSize(DESIGN.fonts.sizes.sm);
    pdf.setTextColor(...DESIGN.colors.neutral[500]);
    pdf.text(metric.label, x + 25, y + 10);
    
    pdf.setFontSize(DESIGN.fonts.sizes.xl);
    pdf.setTextColor(...DESIGN.colors.neutral[700]);
    pdf.setFont(undefined, 'bold');
    pdf.text(metric.value, x + 25, y + 20);
    
    // Description
    pdf.setFontSize(DESIGN.fonts.sizes.xs);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(...DESIGN.colors.neutral[500]);
    pdf.text(metric.desc, x + 25, y + 30);
  });
  
  layout.currentY += 2 * (cardHeight + cardSpacing) + DESIGN.spacing.xl;
  
  // 2. Impact par type de déchet
  layout.drawSectionTitle('2. Impact CO₂ par Type de Déchet');
  
  const wasteImpact = [
    ['Papier/Carton', '28.5 tCO₂e', '26.1 tCO₂e', '91.6%'],
    ['Plastique', '36.2 tCO₂e', '24.6 tCO₂e', '68.0%'],
    ['Bois', '18.9 tCO₂e', '15.5 tCO₂e', '82.0%'],
    ['Verre', '15.2 tCO₂e', '15.2 tCO₂e', '100%'],
    ['Métaux', '12.4 tCO₂e', '8.0 tCO₂e', '64.5%']
  ];
  
  autoTable(pdf, {
    startY: layout.currentY,
    head: [['Type', 'Impact potentiel', 'Émissions évitées', 'Taux d\'évitement']],
    body: wasteImpact,
    theme: 'grid',
    headStyles: { 
      fillColor: DESIGN.colors.accent,
      textColor: DESIGN.colors.white,
      fontSize: DESIGN.fonts.sizes.md,
      fontStyle: 'bold',
      cellPadding: 5
    },
    bodyStyles: {
      fontSize: DESIGN.fonts.sizes.base,
      cellPadding: 5,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: DESIGN.colors.background
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 35, halign: 'center' }
    }
  });
  
  layout.currentY = pdf.lastAutoTable.finalY + DESIGN.spacing.xl;
  
  // 3. Progression vers les objectifs
  layout.checkNewPage(120);
  layout.drawSectionTitle('3. Progression vers les Objectifs');
  
  const objectives = [
    { name: 'Réduction CO₂', current: envMetrics.co2Progress || 89, target: 100, unit: 'tCO₂e' },
    { name: 'Taux de valorisation', current: envMetrics.recyclingProgress || 72, target: 75, unit: '%' },
    { name: 'Économie circulaire', current: envMetrics.circularEconomyProgress || 65, target: 80, unit: '%' }
  ];
  
  objectives.forEach((obj, index) => {
    const y = layout.currentY + index * 35;
    
    pdf.setFontSize(DESIGN.fonts.sizes.lg);
    pdf.setTextColor(...DESIGN.colors.neutral[700]);
    pdf.setFont(undefined, 'bold');
    pdf.text(obj.name, DESIGN.margins.left, y);
    
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(DESIGN.fonts.sizes.base);
    pdf.setTextColor(...DESIGN.colors.neutral[500]);
    pdf.text(`${obj.current}${obj.unit} / ${obj.target}${obj.unit}`, DESIGN.margins.left, y + 8);
    
    // Barre de progression
    const barWidth = 150;
    const barHeight = 8;
    const barX = DESIGN.margins.left;
    const barY = y + 12;
    
    // Fond
    pdf.setFillColor(...DESIGN.colors.neutral[200]);
    pdf.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');
    
    // Progression
    const progress = Math.min(obj.current / obj.target, 1);
    const progressColor = progress >= 1 ? DESIGN.colors.success : 
                         progress >= 0.8 ? DESIGN.colors.warning : 
                         DESIGN.colors.danger;
    pdf.setFillColor(...progressColor);
    pdf.roundedRect(barX, barY, barWidth * progress, barHeight, 2, 2, 'F');
    
    // Pourcentage
    pdf.setFontSize(DESIGN.fonts.sizes.md);
    pdf.setTextColor(...progressColor);
    pdf.setFont(undefined, 'bold');
    pdf.text(`${Math.round(progress * 100)}%`, barX + barWidth + 5, barY + 6);
  });
  
  layout.currentY += objectives.length * 35 + DESIGN.spacing.xl;
  
  // 4. Certifications
  layout.checkNewPage(100);
  layout.drawSectionTitle('4. Certifications et Labels');
  
  const certifications = envMetrics.certifications || [
    { name: 'ISO 14001', status: 'Actif - Renouvelé', date: '2024' },
    { name: 'Label Eco-Entreprise', status: 'Actif', date: '2023' },
    { name: 'Certification Carbone Neutre', status: 'En préparation', date: '2025' }
  ];
  
  certifications.forEach((cert, index) => {
    const y = layout.currentY + index * 25;
    
    // Carte de certification
    pdf.setFillColor(...DESIGN.colors.white);
    pdf.setDrawColor(...DESIGN.colors.neutral[300]);
    pdf.roundedRect(DESIGN.margins.left, y, layout.contentWidth, 20, 3, 3, 'FD');
    
    // Statut indicator
    const statusColor = cert.status.includes('Actif') ? DESIGN.colors.success : 
                       cert.status.includes('préparation') ? DESIGN.colors.warning : 
                       DESIGN.colors.secondary;
    pdf.setFillColor(...statusColor);
    pdf.circle(DESIGN.margins.left + 10, y + 10, 3, 'F');
    
    // Texte
    pdf.setFontSize(DESIGN.fonts.sizes.md);
    pdf.setTextColor(...DESIGN.colors.neutral[700]);
    pdf.setFont(undefined, 'bold');
    pdf.text(cert.name, DESIGN.margins.left + 20, y + 8);
    
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(DESIGN.fonts.sizes.sm);
    pdf.setTextColor(...DESIGN.colors.neutral[500]);
    pdf.text(cert.status, DESIGN.margins.left + 20, y + 14);
    
    pdf.setTextColor(...statusColor);
    pdf.text(cert.date, layout.pageWidth - DESIGN.margins.right - 10, y + 10, { align: 'right' });
  });
  
  layout.currentY += certifications.length * 25 + DESIGN.spacing.xl;
  
  // 5. Plan d'action
  layout.checkNewPage(200);
  layout.drawSectionTitle('5. Plan d\'Action Écologique');
  
  const actions = [
    { priority: 'haute', title: 'Optimiser le tri à la source', impact: '-15 tCO₂e/an', desc: 'Formation du personnel et amélioration de la signalétique' },
    { priority: 'haute', title: 'Réduire les emballages', impact: '-8 tCO₂e/an', desc: 'Partenariat avec fournisseurs pour réduction à la source' },
    { priority: 'moyenne', title: 'Favoriser les filières locales', impact: '-12 tCO₂e/an', desc: 'Réduction des émissions liées au transport' },
    { priority: 'moyenne', title: 'Sensibiliser les équipes', impact: '+10% tri', desc: 'Campagnes de communication et challenges écologiques' }
  ];
  
  actions.forEach((action, index) => {
    layout.checkNewPage(40);
    const cardY = layout.currentY;
    
    // Carte d'action
    pdf.setFillColor(...DESIGN.colors.white);
    pdf.setDrawColor(...DESIGN.colors.neutral[200]);
    pdf.roundedRect(DESIGN.margins.left, cardY, layout.contentWidth, 35, 3, 3, 'FD');
    
    // Indicateur de priorité
    let priorityColor = DESIGN.colors.success;
    if (action.priority === 'haute') priorityColor = DESIGN.colors.danger;
    else if (action.priority === 'moyenne') priorityColor = DESIGN.colors.warning;
    
    pdf.setFillColor(...priorityColor);
    pdf.roundedRect(DESIGN.margins.left, cardY, 3, 35, 1.5, 1.5, 'F');
    
    // Numéro
    pdf.setFontSize(DESIGN.fonts.sizes.xl);
    pdf.setTextColor(...priorityColor);
    pdf.setFont(undefined, 'bold');
    pdf.text(`${index + 1}`, DESIGN.margins.left + 8, cardY + 10);
    
    // Titre
    pdf.setFontSize(DESIGN.fonts.sizes.md);
    pdf.setTextColor(...DESIGN.colors.neutral[700]);
    pdf.text(action.title, DESIGN.margins.left + 18, cardY + 10);
    
    // Impact
    const impactX = layout.pageWidth - DESIGN.margins.right - 50;
    pdf.setFillColor(...priorityColor);
    pdf.setGState(new pdf.GState({ opacity: 0.1 }));
    pdf.roundedRect(impactX, cardY + 5, 45, 10, 2, 2, 'F');
    pdf.setGState(new pdf.GState({ opacity: 1 }));
    
    pdf.setTextColor(...priorityColor);
    pdf.setFontSize(DESIGN.fonts.sizes.sm);
    pdf.setFont(undefined, 'bold');
    pdf.text(action.impact, impactX + 22.5, cardY + 11, { align: 'center' });
    
    // Description
    pdf.setFontSize(DESIGN.fonts.sizes.sm);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(...DESIGN.colors.neutral[600]);
    const descLines = pdf.splitTextToSize(action.desc, layout.contentWidth - 30);
    descLines.forEach((line, lineIndex) => {
      pdf.text(line, DESIGN.margins.left + 18, cardY + 20 + lineIndex * 5);
    });
    
    layout.currentY += 40;
  });
  
  // Conclusion
  layout.currentY += DESIGN.spacing.md;
  const conclusionContent = '🌱 Conclusion\n\nVotre engagement environnemental porte ses fruits avec 89.4 tonnes de CO₂ évitées.\nEn maintenant cette trajectoire, vous atteindrez la neutralité carbone sur vos déchets d\'ici 2026.\nContinuez vos efforts pour un avenir plus durable!';
  layout.drawInfoBox(conclusionContent, 'success');
  
  // Ajouter les pieds de page sur toutes les pages
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    if (i > 1) { // Pas de pied de page sur la page de garde
      const pageLayout = new PDFLayoutManager(pdf);
      pageLayout.pageNumber = i - 1;
      pageLayout.drawFooter('RecyTrack - Rapport d\'Impact Environnemental');
    }
  }
  
  pdf.save(`recytrack_rapport_environnemental_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Fonction pour créer une page de garde environnementale
function createEnvironmentalCoverPage(pdf, reportData) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Fond dégradé vert
  pdf.setFillColor(...DESIGN.colors.accent);
  pdf.rect(0, 0, pageWidth, pageHeight/2, 'F');
  
  // Motif de feuilles
  pdf.setDrawColor(...DESIGN.colors.white);
  pdf.setGState(new pdf.GState({ opacity: 0.1 }));
  for(let i = 0; i < 6; i++) {
    const x = 20 + (i % 3) * 60;
    const y = 30 + Math.floor(i / 3) * 40;
    // Forme de feuille simplifiée
    pdf.ellipse(x, y, 15, 8, 'S');
  }
  pdf.setGState(new pdf.GState({ opacity: 1 }));
  
  // Logo et titre
  const yPosition = pageHeight/4;
  pdf.setFontSize(DESIGN.fonts.sizes['8xl']);
  pdf.setTextColor(...DESIGN.colors.white);
  pdf.setFont(undefined, 'bold');
  pdf.text('RecyTrack', pageWidth / 2, yPosition, { align: 'center' });
  
  // Ligne de séparation
  pdf.setDrawColor(...DESIGN.colors.white);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth/2 - 40, yPosition + 10, pageWidth/2 + 40, yPosition + 10);
  
  // Sous-titre
  pdf.setFontSize(DESIGN.fonts.sizes['5xl']);
  pdf.setFont(undefined, 'normal');
  pdf.text('Rapport d\'Impact', pageWidth / 2, yPosition + 25, { align: 'center' });
  pdf.text('Environnemental', pageWidth / 2, yPosition + 35, { align: 'center' });
  
  // Icône environnementale
  pdf.setFontSize(DESIGN.fonts.sizes['7xl']);
  pdf.text('🌱', pageWidth / 2, yPosition + 55, { align: 'center' });
  
  // Informations du rapport
  const infoY = pageHeight/2 + 40;
  pdf.setFillColor(...DESIGN.colors.neutral[100]);
  pdf.roundedRect(30, infoY - 15, pageWidth - 60, 50, 5, 5, 'F');
  
  pdf.setFontSize(DESIGN.fonts.sizes['2xl']);
  pdf.setTextColor(...DESIGN.colors.neutral[700]);
  pdf.setFont(undefined, 'bold');
  pdf.text(reportData.period || 'Juillet 2024', pageWidth / 2, infoY, { align: 'center' });
  
  pdf.setFontSize(DESIGN.fonts.sizes.xl);
  pdf.setFont(undefined, 'normal');
  pdf.setTextColor(...DESIGN.colors.neutral[600]);
  pdf.text(reportData.company || 'EcoEntreprise SAS', pageWidth / 2, infoY + 12, { align: 'center' });
  
  pdf.setFontSize(DESIGN.fonts.sizes.md);
  pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, infoY + 24, { align: 'center' });
}