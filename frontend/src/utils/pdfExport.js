import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Design system épuré et moderne
const DESIGN = {
  colors: {
    primary: '#22C55E',      // Vert principal
    secondary: '#3B82F6',    // Bleu
    accent: '#10B981',       // Vert émeraude
    warning: '#F59E0B',      // Orange
    danger: '#EF4444',       // Rouge
    dark: '#111827',         // Noir profond
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    }
  },
  
  fonts: {
    base: 10,
    small: 8,
    medium: 11,
    large: 14,
    xlarge: 18,
    xxlarge: 24,
    title: 32
  },
  
  spacing: {
    xs: 5,
    sm: 10,
    md: 15,
    lg: 20,
    xl: 30
  },
  
  page: {
    margin: 20,
    headerHeight: 60,
    footerHeight: 25
  }
};

// Convertir hex en RGB pour jsPDF
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
};

// Classe pour gérer le layout du PDF
class PDFDesigner {
  constructor(pdf) {
    this.pdf = pdf;
    this.pageWidth = pdf.internal.pageSize.getWidth();
    this.pageHeight = pdf.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - (2 * DESIGN.page.margin);
    this.y = DESIGN.page.margin;
    this.pageCount = 1;
  }

  // Vérifier l'espace disponible et ajouter une page si nécessaire
  checkSpace(requiredSpace) {
    const availableSpace = this.pageHeight - this.y - DESIGN.page.footerHeight - DESIGN.spacing.md;
    if (availableSpace < requiredSpace) {
      this.newPage();
    }
  }

  // Adapter la taille de police selon l'espace disponible
  getAdaptiveFontSize(text, maxWidth, baseFontSize) {
    this.pdf.setFontSize(baseFontSize);
    let textWidth = this.pdf.getTextWidth(text);
    if (textWidth > maxWidth) {
      const scale = maxWidth / textWidth;
      return Math.max(baseFontSize * scale, DESIGN.fonts.small);
    }
    return baseFontSize;
  }

  // Nouvelle page
  newPage() {
    this.pdf.addPage();
    this.y = DESIGN.page.margin;
    this.pageCount++;
  }

  // Ajouter un espace vertical
  addSpace(space = DESIGN.spacing.md) {
    this.y += space;
  }

  // Dessiner un header de section
  drawSectionHeader(title, icon = null) {
    this.checkSpace(40);
    
    // Ligne décorative
    this.pdf.setDrawColor(...hexToRgb(DESIGN.colors.primary));
    this.pdf.setLineWidth(2);
    this.pdf.line(DESIGN.page.margin, this.y, DESIGN.page.margin + 5, this.y);
    
    // Titre
    this.pdf.setFontSize(DESIGN.fonts.xlarge);
    this.pdf.setTextColor(...hexToRgb(DESIGN.colors.dark));
    this.pdf.setFont(undefined, 'bold');
    this.pdf.text(title, DESIGN.page.margin + 10, this.y + 5);
    
    this.y += 15;
    this.pdf.setFont(undefined, 'normal');
  }

  // Dessiner une carte KPI
  drawKPICard(x, y, width, height, kpi) {
    // Fond de la carte
    this.pdf.setFillColor(...hexToRgb(DESIGN.colors.gray[50]));
    this.pdf.roundedRect(x, y, width, height, 3, 3, 'F');
    
    // Bordure gauche colorée
    this.pdf.setFillColor(...hexToRgb(kpi.color || DESIGN.colors.primary));
    this.pdf.roundedRect(x, y, 3, height, 1.5, 1.5, 'F');
    
    const leftMargin = kpi.icon ? 25 : 8;
    const contentWidth = width - leftMargin - 25; // Espace pour le trend
    
    // Icône
    if (kpi.icon) {
      this.pdf.setFontSize(DESIGN.fonts.xlarge);
      this.pdf.text(kpi.icon, x + 8, y + 12);
    }
    
    // Label - avec taille adaptative
    const labelFontSize = this.getAdaptiveFontSize(kpi.label, contentWidth, DESIGN.fonts.small);
    this.pdf.setFontSize(labelFontSize);
    this.pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[600]));
    this.pdf.text(kpi.label, x + leftMargin, y + 8);
    
    // Valeur - avec taille adaptative
    const valueFontSize = this.getAdaptiveFontSize(kpi.value, contentWidth * 0.7, DESIGN.fonts.xlarge);
    this.pdf.setFontSize(valueFontSize);
    this.pdf.setTextColor(...hexToRgb(DESIGN.colors.dark));
    this.pdf.setFont(undefined, 'bold');
    this.pdf.text(kpi.value, x + leftMargin, y + 20);
    this.pdf.setFont(undefined, 'normal');
    
    // Tendance
    if (kpi.trend) {
      const trendColor = kpi.trend.startsWith('+') ? DESIGN.colors.accent : DESIGN.colors.danger;
      this.pdf.setTextColor(...hexToRgb(trendColor));
      this.pdf.setFontSize(DESIGN.fonts.small);
      this.pdf.text(kpi.trend, x + width - 20, y + 8);
    }
    
    // Description - avec taille adaptative et gestion du débordement
    if (kpi.description) {
      const descFontSize = this.getAdaptiveFontSize(kpi.description, contentWidth, DESIGN.fonts.small);
      this.pdf.setFontSize(descFontSize);
      this.pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[500]));
      
      // Vérifier si le texte dépasse et le tronquer si nécessaire
      let displayText = kpi.description;
      if (this.pdf.getTextWidth(displayText) > contentWidth) {
        const lines = this.pdf.splitTextToSize(displayText, contentWidth);
        displayText = lines[0];
        if (lines.length > 1) {
          displayText = displayText.slice(0, -3) + '...';
        }
      }
      this.pdf.text(displayText, x + leftMargin, y + 28);
    }
  }

  // Dessiner une barre de progression
  drawProgressBar(x, y, width, label, value, target, unit = '%') {
    const percentage = Math.min((value / target) * 100, 100);
    const color = percentage >= 100 ? DESIGN.colors.accent : 
                  percentage >= 75 ? DESIGN.colors.warning : DESIGN.colors.danger;
    
    // Label
    this.pdf.setFontSize(DESIGN.fonts.medium);
    this.pdf.setTextColor(...hexToRgb(DESIGN.colors.dark));
    this.pdf.setFont(undefined, 'bold');
    this.pdf.text(label, x, y);
    
    // Valeur et cible
    this.pdf.setFont(undefined, 'normal');
    this.pdf.setFontSize(DESIGN.fonts.small);
    this.pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[600]));
    this.pdf.text(`${value}${unit} / ${target}${unit}`, x, y + 6);
    
    // Barre de fond
    const barY = y + 10;
    this.pdf.setFillColor(...hexToRgb(DESIGN.colors.gray[200]));
    this.pdf.roundedRect(x, barY, width, 6, 3, 3, 'F');
    
    // Barre de progression
    this.pdf.setFillColor(...hexToRgb(color));
    this.pdf.roundedRect(x, barY, width * (percentage / 100), 6, 3, 3, 'F');
    
    // Pourcentage
    this.pdf.setTextColor(...hexToRgb(color));
    this.pdf.setFontSize(DESIGN.fonts.medium);
    this.pdf.text(`${Math.round(percentage)}%`, x + width + 5, barY + 5);
  }

  // Ajouter un pied de page
  addFooter(title) {
    const y = this.pageHeight - DESIGN.page.footerHeight;
    
    // Ligne de séparation
    this.pdf.setDrawColor(...hexToRgb(DESIGN.colors.gray[200]));
    this.pdf.setLineWidth(0.5);
    this.pdf.line(DESIGN.page.margin, y, this.pageWidth - DESIGN.page.margin, y);
    
    // Texte du pied de page
    this.pdf.setFontSize(DESIGN.fonts.small);
    this.pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[500]));
    this.pdf.text(`RecyTrack - ${title}`, DESIGN.page.margin, y + 10);
    this.pdf.text(`Page ${this.pageCount}`, this.pageWidth - DESIGN.page.margin, y + 10, { align: 'right' });
    this.pdf.text(new Date().toLocaleDateString('fr-FR'), this.pageWidth / 2, y + 10, { align: 'center' });
  }

  // Page de garde moderne
  createCoverPage(title, subtitle, company, period) {
    // Fond avec gradient simulé
    this.pdf.setFillColor(...hexToRgb(DESIGN.colors.primary));
    this.pdf.rect(0, 0, this.pageWidth, this.pageHeight * 0.6, 'F');
    
    // Pattern géométrique
    this.pdf.setDrawColor(255, 255, 255);
    this.pdf.setLineWidth(0.5);
    for (let i = 0; i < 5; i++) {
      const x = this.pageWidth - 40 - i * 25;
      const y = 30 + i * 20;
      const size = 50 - i * 8;
      this.pdf.circle(x, y, size, 'S');
    }
    
    // Logo RecyTrack
    const centerY = this.pageHeight * 0.25;
    this.pdf.setFontSize(DESIGN.fonts.title + 16);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFont(undefined, 'bold');
    this.pdf.text('RecyTrack', this.pageWidth / 2, centerY, { align: 'center' });
    
    // Trait de séparation
    this.pdf.setLineWidth(1);
    this.pdf.line(this.pageWidth / 2 - 40, centerY + 10, this.pageWidth / 2 + 40, centerY + 10);
    
    // Titre du rapport
    this.pdf.setFontSize(DESIGN.fonts.xxlarge);
    this.pdf.setFont(undefined, 'normal');
    this.pdf.text(title, this.pageWidth / 2, centerY + 30, { align: 'center' });
    if (subtitle) {
      this.pdf.setFontSize(DESIGN.fonts.xlarge);
      this.pdf.text(subtitle, this.pageWidth / 2, centerY + 45, { align: 'center' });
    }
    
    // Informations dans un cadre
    const infoY = this.pageHeight * 0.65;
    this.pdf.setFillColor(...hexToRgb(DESIGN.colors.gray[50]));
    this.pdf.roundedRect(30, infoY, this.pageWidth - 60, 60, 5, 5, 'F');
    
    // Période
    this.pdf.setFontSize(DESIGN.fonts.large);
    this.pdf.setTextColor(...hexToRgb(DESIGN.colors.dark));
    this.pdf.setFont(undefined, 'bold');
    this.pdf.text(period, this.pageWidth / 2, infoY + 20, { align: 'center' });
    
    // Entreprise
    this.pdf.setFontSize(DESIGN.fonts.medium);
    this.pdf.setFont(undefined, 'normal');
    this.pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[600]));
    this.pdf.text(company, this.pageWidth / 2, infoY + 35, { align: 'center' });
    
    // Date de génération
    this.pdf.setFontSize(DESIGN.fonts.small);
    this.pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, this.pageWidth / 2, infoY + 48, { align: 'center' });
  }
}

// Export du tableau de bord en PDF
export const exportDashboardToPDF = async (dashboardData) => {
  const pdf = new jsPDF('p', 'mm', 'a4', true); // true pour compression
  const designer = new PDFDesigner(pdf);
  
  // Page de garde
  designer.createCoverPage(
    'Tableau de Bord',
    'Vue d\'ensemble',
    dashboardData.company || 'EcoEntreprise SAS',
    dashboardData.period || 'Juillet 2024'
  );
  
  // Nouvelle page pour le contenu
  designer.newPage();
  
  // En-tête de section - KPIs
  designer.drawSectionHeader('Indicateurs Clés de Performance');
  
  // KPIs en grille 2x2
  const kpis = [
    {
      icon: '📦',
      label: 'Déchets traités',
      value: dashboardData.totalWaste || '45.2 t',
      trend: '+12%',
      color: DESIGN.colors.primary,
      description: 'Ce mois'
    },
    {
      icon: '♻️',
      label: 'Taux de recyclage',
      value: dashboardData.recyclingRate || '68%',
      trend: '+5%',
      color: DESIGN.colors.accent,
      description: 'Objectif: 75%'
    },
    {
      icon: '💰',
      label: 'Coûts totaux',
      value: dashboardData.totalCost || '12.3k€',
      trend: '-3%',
      color: DESIGN.colors.secondary,
      description: 'Économies: 1.2k€'
    },
    {
      icon: '🌱',
      label: 'CO₂ évité',
      value: dashboardData.co2Saved || '28.4 t',
      trend: '+8%',
      color: DESIGN.colors.warning,
      description: '142 arbres'
    }
  ];
  
  let kpiY = designer.y;
  const spacing = 5;
  const cardWidth = (designer.contentWidth - spacing) / 2;
  const cardHeight = 40;
  
  kpis.forEach((kpi, index) => {
    const x = DESIGN.page.margin + (index % 2) * (cardWidth + spacing);
    const y = kpiY + Math.floor(index / 2) * (cardHeight + spacing);
    designer.drawKPICard(x, y, cardWidth, cardHeight, kpi);
  });
  
  designer.y = kpiY + 2 * cardHeight + spacing + 10;
  
  // Répartition par type
  designer.drawSectionHeader('Répartition des Déchets');
  
  // Tableau de répartition
  autoTable(pdf, {
    startY: designer.y,
    head: [['Type de déchet', 'Volume', 'Part', 'Recyclé', 'Taux']],
    body: dashboardData.wasteDistribution || [
      ['Papier/Carton', '15.8 t', '35%', '15.0 t', '95%'],
      ['Plastique', '13.1 t', '29%', '8.9 t', '68%'],
      ['Bois', '9.5 t', '21%', '7.8 t', '82%'],
      ['Verre', '6.8 t', '15%', '6.8 t', '100%']
    ],
    theme: 'plain',
    styles: {
      fontSize: DESIGN.fonts.base,
      cellPadding: 5,
      textColor: hexToRgb(DESIGN.colors.dark),
      lineColor: hexToRgb(DESIGN.colors.gray[200]),
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: hexToRgb(DESIGN.colors.gray[100]),
      textColor: hexToRgb(DESIGN.colors.dark),
      fontStyle: 'bold',
      fontSize: DESIGN.fonts.medium
    },
    alternateRowStyles: {
      fillColor: hexToRgb(DESIGN.colors.gray[50])
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto', halign: 'right' },
      2: { cellWidth: 'auto', halign: 'center' },
      3: { cellWidth: 'auto', halign: 'right' },
      4: { 
        cellWidth: 'auto', 
        halign: 'center',
        fontStyle: 'bold'
      }
    },
    didDrawCell: (data) => {
      // Colorer le taux de recyclage
      if (data.column.index === 4 && data.cell.section === 'body') {
        const value = parseInt(data.cell.text[0]);
        let color = DESIGN.colors.danger;
        if (value >= 90) color = DESIGN.colors.accent;
        else if (value >= 70) color = DESIGN.colors.warning;
        
        pdf.setTextColor(...hexToRgb(color));
        pdf.text(data.cell.text[0], data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' });
      }
    }
  });
  
  designer.y = pdf.lastAutoTable.finalY + DESIGN.spacing.lg;
  
  // Évolution mensuelle
  designer.checkSpace(80);
  designer.drawSectionHeader('Évolution Mensuelle');
  
  // Graphique simplifié avec barres
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
  const values = [38, 42, 45, 41, 48, 45];
  const maxValue = Math.max(...values);
  const chartHeight = 50;
  const chartMargin = 10;
  const chartWidth = designer.contentWidth - 2 * chartMargin;
  const numBars = months.length;
  const totalBarSpace = chartWidth * 0.6; // 60% pour les barres
  const barWidth = totalBarSpace / numBars;
  const barSpacing = (chartWidth - totalBarSpace) / (numBars - 1);
  
  // Axes
  pdf.setDrawColor(...hexToRgb(DESIGN.colors.gray[300]));
  pdf.setLineWidth(0.5);
  pdf.line(DESIGN.page.margin + chartMargin, designer.y + chartHeight, DESIGN.page.margin + chartMargin + chartWidth, designer.y + chartHeight);
  
  // Barres
  months.forEach((month, index) => {
    const x = DESIGN.page.margin + chartMargin + index * (barWidth + barSpacing);
    const barHeight = (values[index] / maxValue) * chartHeight;
    const y = designer.y + chartHeight - barHeight;
    
    // Barre
    pdf.setFillColor(...hexToRgb(DESIGN.colors.primary));
    pdf.roundedRect(x, y, barWidth, barHeight, 2, 2, 'F');
    
    // Valeur - avec taille adaptative
    const valueFontSize = designer.getAdaptiveFontSize(`${values[index]}t`, barWidth, DESIGN.fonts.small);
    pdf.setFontSize(valueFontSize);
    pdf.setTextColor(...hexToRgb(DESIGN.colors.dark));
    pdf.text(`${values[index]}t`, x + barWidth / 2, y - 3, { align: 'center' });
    
    // Mois - avec taille adaptative
    const monthFontSize = designer.getAdaptiveFontSize(month, barWidth + barSpacing * 0.8, DESIGN.fonts.small);
    pdf.setFontSize(monthFontSize);
    pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[600]));
    pdf.text(month, x + barWidth / 2, designer.y + chartHeight + 8, { align: 'center' });
  });
  
  designer.y += chartHeight + DESIGN.spacing.xl;
  
  // Points d'attention
  designer.checkSpace(60);
  designer.drawSectionHeader('Points d\'Attention');
  
  const alerts = [
    { type: 'warning', message: 'Le taux de recyclage du plastique (68%) est en dessous de l\'objectif' },
    { type: 'info', message: 'Nouvelle réglementation sur les biodéchets à partir de janvier 2025' },
    { type: 'success', message: 'Excellente performance sur le verre avec 100% de recyclage' }
  ];
  
  alerts.forEach((alert, index) => {
    const y = designer.y + index * 20;
    const color = alert.type === 'warning' ? DESIGN.colors.warning :
                  alert.type === 'success' ? DESIGN.colors.accent : DESIGN.colors.secondary;
    
    // Fond coloré
    pdf.setFillColor(...hexToRgb(color));
    pdf.setGState(new pdf.GState({ opacity: 0.1 }));
    pdf.roundedRect(DESIGN.page.margin, y, designer.contentWidth, 15, 3, 3, 'F');
    pdf.setGState(new pdf.GState({ opacity: 1 }));
    
    // Bordure gauche
    pdf.setFillColor(...hexToRgb(color));
    pdf.roundedRect(DESIGN.page.margin, y, 3, 15, 1.5, 1.5, 'F');
    
    // Texte
    pdf.setFontSize(DESIGN.fonts.base);
    pdf.setTextColor(...hexToRgb(DESIGN.colors.dark));
    pdf.text(alert.message, DESIGN.page.margin + 8, y + 9);
  });
  
  // Ajouter les pieds de page à toutes les pages
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) {
    pdf.setPage(i);
    designer.addFooter('Tableau de Bord');
  }
  
  pdf.save(`recytrack_dashboard_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export des déclarations en PDF
export const exportDeclarationsToPDF = (declarations) => {
  const pdf = new jsPDF('p', 'mm', 'a4', true); // true pour compression
  const designer = new PDFDesigner(pdf);
  
  // Page de garde
  designer.createCoverPage(
    'Registre des Déclarations',
    'Suivi détaillé',
    'EcoEntreprise SAS',
    `${declarations.length} déclarations`
  );
  
  // Nouvelle page pour le contenu
  designer.newPage();
  
  // En-tête
  designer.drawSectionHeader('Liste des Déclarations');
  
  // Statistiques rapides
  const stats = {
    total: declarations.length,
    enCours: declarations.filter(d => d.statut === 'En cours').length,
    traitees: declarations.filter(d => d.statut === 'Traité').length,
    volumes: declarations.reduce((acc, d) => acc + parseFloat(d.quantite || 0), 0)
  };
  
  // Cartes de stats
  const statsCards = [
    { label: 'Total', value: stats.total.toString(), icon: '📋', color: DESIGN.colors.primary },
    { label: 'En cours', value: stats.enCours.toString(), icon: '⏳', color: DESIGN.colors.warning },
    { label: 'Traitées', value: stats.traitees.toString(), icon: '✅', color: DESIGN.colors.accent },
    { label: 'Volume total', value: `${stats.volumes.toFixed(1)} kg`, icon: '⚖️', color: DESIGN.colors.secondary }
  ];
  
  let statsY = designer.y;
  statsCards.forEach((stat, index) => {
    const x = DESIGN.page.margin + (index % 4) * (designer.contentWidth / 4 + 5);
    designer.drawKPICard(x, statsY, designer.contentWidth / 4 - 5, 35, stat);
  });
  
  designer.y = statsY + 45;
  
  // Tableau des déclarations
  designer.drawSectionHeader('Détail des Déclarations');
  
  const tableData = declarations.map(d => [
    d.date || '-',
    d.type || '-',
    `${d.quantite || 0} kg`,
    d.traitementPrevu || '-',
    d.responsable || '-',
    d.statut || 'En attente'
  ]);
  
  autoTable(pdf, {
    startY: designer.y,
    head: [['Date', 'Type', 'Quantité', 'Traitement', 'Responsable', 'Statut']],
    body: tableData,
    theme: 'plain',
    styles: {
      fontSize: DESIGN.fonts.small,
      cellPadding: 4,
      textColor: hexToRgb(DESIGN.colors.dark),
      lineColor: hexToRgb(DESIGN.colors.gray[200]),
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: hexToRgb(DESIGN.colors.gray[100]),
      textColor: hexToRgb(DESIGN.colors.dark),
      fontStyle: 'bold',
      fontSize: DESIGN.fonts.base
    },
    alternateRowStyles: {
      fillColor: hexToRgb(DESIGN.colors.gray[50])
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 'auto', halign: 'right' },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 'auto' },
      5: { cellWidth: 'auto', halign: 'center' }
    },
    didDrawCell: (data) => {
      // Badge de statut
      if (data.column.index === 5 && data.cell.section === 'body') {
        const status = data.cell.text[0];
        let bgColor = DESIGN.colors.gray[200];
        let textColor = DESIGN.colors.gray[700];
        
        if (status === 'Traité') {
          bgColor = DESIGN.colors.accent;
          textColor = DESIGN.colors.gray[50];
        } else if (status === 'En cours') {
          bgColor = DESIGN.colors.warning;
          textColor = DESIGN.colors.gray[50];
        }
        
        // Fond du badge
        pdf.setFillColor(...hexToRgb(bgColor));
        const badgeWidth = 20;
        const badgeX = data.cell.x + (data.cell.width - badgeWidth) / 2;
        pdf.roundedRect(badgeX, data.cell.y + 2, badgeWidth, 6, 3, 3, 'F');
        
        // Texte du badge
        pdf.setFontSize(7);
        pdf.setTextColor(...hexToRgb(textColor));
        pdf.text(status, data.cell.x + data.cell.width / 2, data.cell.y + 6, { align: 'center' });
      }
    },
    didDrawPage: (data) => {
      designer.pageCount++;
      designer.addFooter('Registre des Déclarations');
    }
  });
  
  pdf.save(`recytrack_declarations_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export du rapport détaillé en PDF
export const exportDetailedReportToPDF = async (reportData) => {
  // Rediriger vers le rapport environnemental si nécessaire
  if (reportData.reportType === 'environmental') {
    return exportEnvironmentalReportToPDF(reportData);
  }
  
  const pdf = new jsPDF('p', 'mm', 'a4', true); // true pour compression
  const designer = new PDFDesigner(pdf);
  
  // Page de garde
  designer.createCoverPage(
    'Rapport Détaillé',
    'Analyse Complète',
    reportData.company || 'EcoEntreprise SAS',
    reportData.period || 'Juillet 2024'
  );
  
  // Table des matières
  designer.newPage();
  designer.drawSectionHeader('Sommaire');
  
  const toc = [
    { num: '1', title: 'Résumé Exécutif', page: '3' },
    { num: '2', title: 'Indicateurs de Performance', page: '4' },
    { num: '3', title: 'Analyse par Type de Déchet', page: '5' },
    { num: '4', title: 'Évolution Temporelle', page: '6' },
    { num: '5', title: 'Recommandations', page: '7' }
  ];
  
  toc.forEach((item, index) => {
    const y = designer.y + index * 12;
    
    // Numéro
    pdf.setFontSize(DESIGN.fonts.medium);
    pdf.setTextColor(...hexToRgb(DESIGN.colors.primary));
    pdf.text(item.num + '.', DESIGN.page.margin, y);
    
    // Titre
    pdf.setTextColor(...hexToRgb(DESIGN.colors.dark));
    pdf.text(item.title, DESIGN.page.margin + 10, y);
    
    // Points de suite
    pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[300]));
    let dots = '';
    for (let i = 0; i < 50; i++) dots += '.';
    pdf.text(dots, DESIGN.page.margin + 70, y);
    
    // Page
    pdf.setTextColor(...hexToRgb(DESIGN.colors.dark));
    pdf.text(item.page, designer.pageWidth - DESIGN.page.margin - 10, y);
  });
  
  // Résumé exécutif
  designer.newPage();
  designer.drawSectionHeader('1. Résumé Exécutif');
  
  // Texte du résumé
  pdf.setFontSize(DESIGN.fonts.base);
  pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[700]));
  const summary = `Au cours de la période analysée, votre entreprise a traité ${reportData.totalWaste || '156.7 tonnes'} de déchets avec un taux de recyclage de ${reportData.recyclingRate || '72%'}. Cette performance représente une amélioration significative par rapport à la période précédente, avec une réduction des coûts de 3.1% et ${reportData.co2Saved || '89.4 tonnes'} de CO₂ évitées.`;
  
  const summaryLines = pdf.splitTextToSize(summary, designer.contentWidth);
  summaryLines.forEach((line, index) => {
    pdf.text(line, DESIGN.page.margin, designer.y + index * 6);
  });
  
  designer.y += summaryLines.length * 6 + DESIGN.spacing.lg;
  
  // Points clés en colonnes
  const keyPoints = {
    forces: [
      'Taux de recyclage du verre : 100%',
      'Réduction des coûts opérationnels',
      'Forte progression sur le papier/carton'
    ],
    faiblesses: [
      'Recyclage du plastique sous l\'objectif',
      'Volume de déchets en augmentation',
      'Manque de tri à la source'
    ],
    opportunites: [
      'Certification ISO 14001',
      'Nouveaux partenariats possibles',
      'Optimisation des collectes'
    ]
  };
  
  const columnWidth = (designer.contentWidth - DESIGN.spacing.md * 2) / 3;
  
  ['forces', 'faiblesses', 'opportunites'].forEach((type, colIndex) => {
    const x = DESIGN.page.margin + colIndex * (columnWidth + DESIGN.spacing.md);
    const title = type.charAt(0).toUpperCase() + type.slice(1);
    const color = type === 'forces' ? DESIGN.colors.accent : 
                  type === 'faiblesses' ? DESIGN.colors.danger : DESIGN.colors.secondary;
    
    // Titre de colonne
    pdf.setFillColor(...hexToRgb(color));
    pdf.roundedRect(x, designer.y, columnWidth, 8, 2, 2, 'F');
    
    pdf.setFontSize(DESIGN.fonts.medium);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont(undefined, 'bold');
    pdf.text(title, x + columnWidth / 2, designer.y + 5.5, { align: 'center' });
    
    // Points
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(DESIGN.fonts.small);
    pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[700]));
    
    keyPoints[type].forEach((point, index) => {
      const pointY = designer.y + 15 + index * 8;
      pdf.text('• ' + point, x + 2, pointY);
    });
  });
  
  designer.y += 50;
  
  // KPIs détaillés
  designer.newPage();
  designer.drawSectionHeader('2. Indicateurs de Performance');
  
  const detailedKPIs = [
    {
      icon: '📊',
      label: 'Volume total traité',
      value: reportData.totalWaste || '156.7 t',
      trend: '+12.3%',
      description: 'vs période précédente',
      color: DESIGN.colors.primary
    },
    {
      icon: '♻️',
      label: 'Taux de valorisation',
      value: reportData.recyclingRate || '72%',
      trend: '+5.2%',
      description: 'Objectif: 75%',
      color: DESIGN.colors.accent
    },
    {
      icon: '💶',
      label: 'Coût par tonne',
      value: '147 €/t',
      trend: '-8.1%',
      description: 'Optimisation réussie',
      color: DESIGN.colors.secondary
    },
    {
      icon: '🌍',
      label: 'Impact carbone',
      value: reportData.co2Saved || '89.4 tCO₂',
      trend: '+15.6%',
      description: '= 4,470 arbres',
      color: DESIGN.colors.warning
    },
    {
      icon: '🏭',
      label: 'Conformité réglementaire',
      value: '98%',
      trend: '+2%',
      description: '2 non-conformités mineures',
      color: DESIGN.colors.accent
    },
    {
      icon: '👥',
      label: 'Engagement équipes',
      value: '85%',
      trend: '+10%',
      description: 'Formation efficace',
      color: DESIGN.colors.primary
    }
  ];
  
  let kpiY = designer.y;
  detailedKPIs.forEach((kpi, index) => {
    const x = DESIGN.page.margin + (index % 2) * (designer.contentWidth / 2 + 5);
    const y = kpiY + Math.floor(index / 2) * 50;
    designer.drawKPICard(x, y, designer.contentWidth / 2 - 5, 45, kpi);
  });
  
  designer.y = kpiY + 155;
  
  // Analyse par type
  designer.newPage();
  designer.drawSectionHeader('3. Analyse par Type de Déchet');
  
  // Tableau détaillé
  autoTable(pdf, {
    startY: designer.y,
    head: [['Type', 'Volume', 'Part', 'Recyclé', 'Taux', 'Coût/t', 'Évolution']],
    body: reportData.wasteByType || [
      ['Papier/Carton', '54.8 t', '35%', '52.1 t', '95%', '85 €', '+8%'],
      ['Plastique', '45.4 t', '29%', '30.9 t', '68%', '120 €', '+12%'],
      ['Bois', '32.9 t', '21%', '27.0 t', '82%', '95 €', '-5%'],
      ['Verre', '23.5 t', '15%', '23.5 t', '100%', '65 €', '+3%']
    ],
    theme: 'plain',
    styles: {
      fontSize: DESIGN.fonts.base,
      cellPadding: 5,
      textColor: hexToRgb(DESIGN.colors.dark),
      lineColor: hexToRgb(DESIGN.colors.gray[200]),
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: hexToRgb(DESIGN.colors.primary),
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: DESIGN.fonts.medium
    },
    alternateRowStyles: {
      fillColor: hexToRgb(DESIGN.colors.gray[50])
    },
    columnStyles: {
      0: { cellWidth: 'auto', fontStyle: 'bold' },
      1: { cellWidth: 'auto', halign: 'right' },
      2: { cellWidth: 'auto', halign: 'center' },
      3: { cellWidth: 'auto', halign: 'right' },
      4: { cellWidth: 'auto', halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 'auto', halign: 'right' },
      6: { cellWidth: 'auto', halign: 'center' }
    },
    didDrawCell: (data) => {
      // Coloration du taux de recyclage
      if (data.column.index === 4 && data.cell.section === 'body') {
        const value = parseInt(data.cell.text[0]);
        let color = DESIGN.colors.danger;
        if (value >= 90) color = DESIGN.colors.accent;
        else if (value >= 75) color = DESIGN.colors.warning;
        
        pdf.setTextColor(...hexToRgb(color));
        pdf.text(data.cell.text[0], data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' });
      }
      
      // Indicateur d'évolution
      if (data.column.index === 6 && data.cell.section === 'body') {
        const trend = data.cell.text[0];
        const color = trend.startsWith('+') ? DESIGN.colors.accent : DESIGN.colors.danger;
        pdf.setTextColor(...hexToRgb(color));
        pdf.text(trend, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' });
      }
    }
  });
  
  designer.y = pdf.lastAutoTable.finalY + DESIGN.spacing.lg;
  
  // Message d'analyse
  designer.checkSpace(40);
  pdf.setFillColor(...hexToRgb(DESIGN.colors.secondary));
  pdf.setGState(new pdf.GState({ opacity: 0.1 }));
  pdf.roundedRect(DESIGN.page.margin, designer.y, designer.contentWidth, 30, 3, 3, 'F');
  pdf.setGState(new pdf.GState({ opacity: 1 }));
  
  pdf.setFillColor(...hexToRgb(DESIGN.colors.secondary));
  pdf.roundedRect(DESIGN.page.margin, designer.y, 3, 30, 1.5, 1.5, 'F');
  
  pdf.setFontSize(DESIGN.fonts.base);
  pdf.setTextColor(...hexToRgb(DESIGN.colors.dark));
  const analysis = 'Le plastique représente votre principal axe d\'amélioration avec seulement 68% de recyclage. Une optimisation du tri à la source pourrait augmenter ce taux de 10 à 15 points.';
  const analysisLines = pdf.splitTextToSize(analysis, designer.contentWidth - 10);
  analysisLines.forEach((line, index) => {
    pdf.text(line, DESIGN.page.margin + 8, designer.y + 10 + index * 6);
  });
  
  // Évolution temporelle
  designer.newPage();
  designer.drawSectionHeader('4. Évolution Temporelle');
  
  // Tableau mensuel
  autoTable(pdf, {
    startY: designer.y,
    head: [['Mois', 'Total (t)', 'Recyclé (t)', 'Taux', 'Coût (€)', 'CO₂ évité (t)']],
    body: reportData.monthlyEvolution || [
      ['Janvier', '18.5', '11.1', '60%', '2,800', '8.2'],
      ['Février', '21.2', '14.8', '70%', '3,200', '10.5'],
      ['Mars', '19.8', '12.9', '65%', '2,950', '9.1'],
      ['Avril', '23.4', '16.4', '70%', '3,500', '11.6'],
      ['Mai', '25.4', '17.3', '68%', '3,800', '12.2'],
      ['Juin', '22.1', '15.5', '70%', '3,300', '10.9'],
      ['Juillet', '24.3', '17.5', '72%', '3,600', '12.3']
    ],
    theme: 'plain',
    styles: {
      fontSize: DESIGN.fonts.base,
      cellPadding: 4,
      textColor: hexToRgb(DESIGN.colors.dark),
      lineColor: hexToRgb(DESIGN.colors.gray[200]),
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: hexToRgb(DESIGN.colors.gray[100]),
      textColor: hexToRgb(DESIGN.colors.dark),
      fontStyle: 'bold',
      fontSize: DESIGN.fonts.medium
    },
    alternateRowStyles: {
      fillColor: hexToRgb(DESIGN.colors.gray[50])
    },
    columnStyles: {
      0: { cellWidth: 'auto', fontStyle: 'bold' },
      1: { cellWidth: 'auto', halign: 'right' },
      2: { cellWidth: 'auto', halign: 'right' },
      3: { cellWidth: 'auto', halign: 'center' },
      4: { cellWidth: 'auto', halign: 'right' },
      5: { cellWidth: 'auto', halign: 'right' }
    }
  });
  
  designer.y = pdf.lastAutoTable.finalY + DESIGN.spacing.lg;
  
  // Objectifs de progression
  designer.checkSpace(60);
  designer.drawSectionHeader('Progression vers les Objectifs');
  
  const objectives = [
    { label: 'Taux de recyclage global', value: 72, target: 75, unit: '%' },
    { label: 'Réduction des coûts', value: 12, target: 15, unit: '%' },
    { label: 'Neutralité carbone', value: 65, target: 100, unit: '%' }
  ];
  
  objectives.forEach((obj, index) => {
    designer.drawProgressBar(
      DESIGN.page.margin,
      designer.y + index * 25,
      designer.contentWidth - 40,
      obj.label,
      obj.value,
      obj.target,
      obj.unit
    );
  });
  
  designer.y += objectives.length * 25 + DESIGN.spacing.md;
  
  // Recommandations
  designer.newPage();
  designer.drawSectionHeader('5. Recommandations Stratégiques');
  
  const recommendations = [
    {
      priority: 'Haute',
      title: 'Améliorer le tri du plastique',
      description: 'Mettre en place une formation spécifique et installer des bacs de tri dédiés',
      impact: 'Potentiel : +15% de taux de recyclage',
      color: DESIGN.colors.danger
    },
    {
      priority: 'Haute',
      title: 'Optimiser les collectes',
      description: 'Regrouper les enlèvements pour réduire les coûts de transport',
      impact: 'Économie estimée : 2,000€/an',
      color: DESIGN.colors.danger
    },
    {
      priority: 'Moyenne',
      title: 'Certification ISO 14001',
      description: 'Préparer la certification environnementale pour valoriser les efforts',
      impact: 'Avantage concurrentiel significatif',
      color: DESIGN.colors.warning
    },
    {
      priority: 'Moyenne',
      title: 'Partenariats locaux',
      description: 'Développer des filières de valorisation de proximité',
      impact: 'Réduction CO₂ : -20% sur le transport',
      color: DESIGN.colors.warning
    },
    {
      priority: 'Normale',
      title: 'Communication interne',
      description: 'Renforcer la sensibilisation des équipes aux enjeux environnementaux',
      impact: 'Engagement : +15% participation',
      color: DESIGN.colors.secondary
    }
  ];
  
  recommendations.forEach((rec, index) => {
    const y = designer.y + index * 35;
    
    // Carte de recommandation
    pdf.setFillColor(...hexToRgb(DESIGN.colors.gray[50]));
    pdf.roundedRect(DESIGN.page.margin, y, designer.contentWidth, 30, 3, 3, 'F');
    
    // Indicateur de priorité
    pdf.setFillColor(...hexToRgb(rec.color));
    pdf.roundedRect(DESIGN.page.margin, y, 3, 30, 1.5, 1.5, 'F');
    
    // Badge de priorité
    pdf.setFillColor(...hexToRgb(rec.color));
    pdf.setGState(new pdf.GState({ opacity: 0.2 }));
    pdf.roundedRect(designer.pageWidth - DESIGN.page.margin - 35, y + 3, 30, 10, 5, 5, 'F');
    pdf.setGState(new pdf.GState({ opacity: 1 }));
    
    pdf.setFontSize(DESIGN.fonts.small);
    pdf.setTextColor(...hexToRgb(rec.color));
    pdf.text(rec.priority, designer.pageWidth - DESIGN.page.margin - 20, y + 9, { align: 'center' });
    
    // Titre
    pdf.setFontSize(DESIGN.fonts.medium);
    pdf.setTextColor(...hexToRgb(DESIGN.colors.dark));
    pdf.setFont(undefined, 'bold');
    pdf.text(`${index + 1}. ${rec.title}`, DESIGN.page.margin + 8, y + 8);
    
    // Description
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(DESIGN.fonts.small);
    pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[600]));
    pdf.text(rec.description, DESIGN.page.margin + 8, y + 15);
    
    // Impact
    pdf.setFontSize(DESIGN.fonts.small);
    pdf.setTextColor(...hexToRgb(rec.color));
    pdf.text(rec.impact, DESIGN.page.margin + 8, y + 22);
  });
  
  // Conclusion
  designer.y += recommendations.length * 35 + DESIGN.spacing.lg;
  designer.checkSpace(50);
  
  pdf.setFillColor(...hexToRgb(DESIGN.colors.accent));
  pdf.setGState(new pdf.GState({ opacity: 0.1 }));
  pdf.roundedRect(DESIGN.page.margin, designer.y, designer.contentWidth, 40, 3, 3, 'F');
  pdf.setGState(new pdf.GState({ opacity: 1 }));
  
  pdf.setFillColor(...hexToRgb(DESIGN.colors.accent));
  pdf.roundedRect(DESIGN.page.margin, designer.y, 3, 40, 1.5, 1.5, 'F');
  
  pdf.setFontSize(DESIGN.fonts.medium);
  pdf.setTextColor(...hexToRgb(DESIGN.colors.accent));
  pdf.setFont(undefined, 'bold');
  pdf.text('Conclusion', DESIGN.page.margin + 8, designer.y + 10);
  
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(DESIGN.fonts.base);
  pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[700]));
  const conclusion = 'Votre entreprise démontre un engagement solide en matière de gestion des déchets. En suivant les recommandations prioritaires, vous pourrez atteindre vos objectifs de 75% de recyclage et renforcer votre position de leader environnemental.';
  const conclusionLines = pdf.splitTextToSize(conclusion, designer.contentWidth - 15);
  conclusionLines.forEach((line, index) => {
    pdf.text(line, DESIGN.page.margin + 8, designer.y + 18 + index * 6);
  });
  
  // Ajouter les pieds de page
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) {
    pdf.setPage(i);
    designer.addFooter('Rapport Détaillé');
  }
  
  pdf.save(`recytrack_rapport_detaille_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export du rapport environnemental
export const exportEnvironmentalReportToPDF = async (reportData) => {
  const pdf = new jsPDF('p', 'mm', 'a4', true); // true pour compression
  const designer = new PDFDesigner(pdf);
  
  // Page de garde verte
  designer.createCoverPage(
    'Rapport d\'Impact',
    'Environnemental',
    reportData.company || 'EcoEntreprise SAS',
    reportData.period || 'Juillet 2024'
  );
  
  // Table des matières
  designer.newPage();
  designer.drawSectionHeader('Sommaire');
  
  const toc = [
    { num: '1', title: 'Vue d\'ensemble environnementale', page: '3' },
    { num: '2', title: 'Métriques d\'impact', page: '4' },
    { num: '3', title: 'Analyse carbone détaillée', page: '5' },
    { num: '4', title: 'Objectifs et progression', page: '6' },
    { num: '5', title: 'Plan d\'action écologique', page: '7' }
  ];
  
  toc.forEach((item, index) => {
    const y = designer.y + index * 12;
    
    pdf.setFontSize(DESIGN.fonts.medium);
    pdf.setTextColor(...hexToRgb(DESIGN.colors.accent));
    pdf.text(item.num + '.', DESIGN.page.margin, y);
    
    pdf.setTextColor(...hexToRgb(DESIGN.colors.dark));
    pdf.text(item.title, DESIGN.page.margin + 10, y);
    
    pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[300]));
    let dots = '';
    for (let i = 0; i < 50; i++) dots += '.';
    pdf.text(dots, DESIGN.page.margin + 85, y);
    
    pdf.setTextColor(...hexToRgb(DESIGN.colors.dark));
    pdf.text(item.page, designer.pageWidth - DESIGN.page.margin - 10, y);
  });
  
  // Vue d'ensemble
  designer.newPage();
  designer.drawSectionHeader('1. Vue d\'ensemble environnementale');
  
  const envMetrics = reportData.environmentalMetrics || {};
  
  // Message d'introduction
  pdf.setFontSize(DESIGN.fonts.base);
  pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[700]));
  const intro = `Votre engagement environnemental a permis d'éviter l'émission de ${envMetrics.co2Avoided || '89.4'} tonnes de CO₂, équivalent à ${envMetrics.treesEquivalent || '4,470'} arbres plantés. Cette performance témoigne de l'efficacité de votre stratégie de gestion des déchets et de votre contribution à la lutte contre le changement climatique.`;
  
  const introLines = pdf.splitTextToSize(intro, designer.contentWidth);
  introLines.forEach((line, index) => {
    pdf.text(line, DESIGN.page.margin, designer.y + index * 6);
  });
  
  designer.y += introLines.length * 6 + DESIGN.spacing.xl;
  
  // Métriques clés environnementales
  designer.drawSectionHeader('2. Métriques d\'impact');
  
  const envKPIs = [
    {
      icon: '🌍',
      label: 'CO₂ évité',
      value: `${envMetrics.co2Avoided || '89.4'} tCO₂e`,
      description: 'Équivalent à 178 vols Paris-NY',
      color: DESIGN.colors.accent
    },
    {
      icon: '🌳',
      label: 'Arbres équivalents',
      value: `${envMetrics.treesEquivalent || '4,470'}`,
      description: 'Compensation carbone annuelle',
      color: DESIGN.colors.primary
    },
    {
      icon: '💧',
      label: 'Eau préservée',
      value: `${envMetrics.waterPreserved || '125,000'} L`,
      description: '50 piscines olympiques',
      color: DESIGN.colors.secondary
    },
    {
      icon: '⚡',
      label: 'Énergie économisée',
      value: `${envMetrics.energySaved || '456'} MWh`,
      description: 'Consommation de 152 foyers/an',
      color: DESIGN.colors.warning
    }
  ];
  
  let envKpiY = designer.y;
  envKPIs.forEach((kpi, index) => {
    const x = DESIGN.page.margin + (index % 2) * (designer.contentWidth / 2 + 5);
    const y = envKpiY + Math.floor(index / 2) * 50;
    designer.drawKPICard(x, y, designer.contentWidth / 2 - 5, 45, kpi);
  });
  
  designer.y = envKpiY + 105;
  
  // Impact par type de déchet
  designer.newPage();
  designer.drawSectionHeader('3. Analyse carbone détaillée');
  
  // Tableau d'impact CO₂
  autoTable(pdf, {
    startY: designer.y,
    head: [['Type de déchet', 'Impact potentiel', 'Émissions évitées', 'Taux d\'évitement', 'Performance']],
    body: [
      ['Papier/Carton', '28.5 tCO₂e', '26.1 tCO₂e', '91.6%', 'Excellent'],
      ['Plastique', '36.2 tCO₂e', '24.6 tCO₂e', '68.0%', 'À améliorer'],
      ['Bois', '18.9 tCO₂e', '15.5 tCO₂e', '82.0%', 'Bon'],
      ['Verre', '15.2 tCO₂e', '15.2 tCO₂e', '100%', 'Optimal'],
      ['Métaux', '12.4 tCO₂e', '8.0 tCO₂e', '64.5%', 'Moyen']
    ],
    theme: 'plain',
    styles: {
      fontSize: DESIGN.fonts.base,
      cellPadding: 5,
      textColor: hexToRgb(DESIGN.colors.dark),
      lineColor: hexToRgb(DESIGN.colors.gray[200]),
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: hexToRgb(DESIGN.colors.accent),
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: DESIGN.fonts.medium
    },
    alternateRowStyles: {
      fillColor: hexToRgb(DESIGN.colors.gray[50])
    },
    columnStyles: {
      0: { cellWidth: 'auto', fontStyle: 'bold' },
      1: { cellWidth: 'auto', halign: 'center' },
      2: { cellWidth: 'auto', halign: 'center' },
      3: { cellWidth: 'auto', halign: 'center' },
      4: { cellWidth: 'auto', halign: 'center' }
    },
    didDrawCell: (data) => {
      // Badge de performance
      if (data.column.index === 4 && data.cell.section === 'body') {
        const perf = data.cell.text[0];
        let bgColor = DESIGN.colors.gray[300];
        let textColor = DESIGN.colors.gray[700];
        
        if (perf === 'Optimal' || perf === 'Excellent') {
          bgColor = DESIGN.colors.accent;
          textColor = '#FFFFFF';
        } else if (perf === 'Bon') {
          bgColor = DESIGN.colors.secondary;
          textColor = '#FFFFFF';
        } else if (perf === 'À améliorer') {
          bgColor = DESIGN.colors.warning;
          textColor = '#FFFFFF';
        } else if (perf === 'Moyen') {
          bgColor = DESIGN.colors.danger;
          textColor = '#FFFFFF';
        }
        
        const badgeWidth = 25;
        const badgeX = data.cell.x + (data.cell.width - badgeWidth) / 2;
        
        pdf.setFillColor(...hexToRgb(bgColor));
        pdf.roundedRect(badgeX, data.cell.y + 2, badgeWidth, 6, 3, 3, 'F');
        
        pdf.setFontSize(7);
        pdf.setTextColor(...hexToRgb(textColor));
        pdf.text(perf, data.cell.x + data.cell.width / 2, data.cell.y + 6, { align: 'center' });
      }
    }
  });
  
  designer.y = pdf.lastAutoTable.finalY + DESIGN.spacing.lg;
  
  // Équivalences visuelles
  designer.checkSpace(60);
  designer.drawSectionHeader('Équivalences environnementales');
  
  const equivalences = [
    { icon: '✈️', value: '178', label: 'vols Paris-New York évités' },
    { icon: '🚗', value: '445,000', label: 'km en voiture économisés' },
    { icon: '🏠', value: '152', label: 'foyers alimentés pendant 1 an' },
    { icon: '🌊', value: '50', label: 'piscines olympiques préservées' }
  ];
  
  equivalences.forEach((eq, index) => {
    const x = DESIGN.page.margin + (index % 2) * (designer.contentWidth / 2);
    const y = designer.y + Math.floor(index / 2) * 25;
    
    // Icône
    pdf.setFontSize(DESIGN.fonts.xlarge);
    pdf.text(eq.icon, x, y + 5);
    
    // Valeur
    pdf.setFontSize(DESIGN.fonts.large);
    pdf.setTextColor(...hexToRgb(DESIGN.colors.accent));
    pdf.setFont(undefined, 'bold');
    pdf.text(eq.value, x + 15, y + 5);
    
    // Label
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(DESIGN.fonts.small);
    pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[600]));
    pdf.text(eq.label, x + 15, y + 11);
  });
  
  designer.y += 60;
  
  // Objectifs et progression
  designer.newPage();
  designer.drawSectionHeader('4. Objectifs et progression');
  
  const ecoObjectives = [
    { label: 'Réduction CO₂ (-100 tCO₂e/an)', value: envMetrics.co2Progress || 89, target: 100 },
    { label: 'Taux de valorisation matière', value: envMetrics.recyclingProgress || 72, target: 75 },
    { label: 'Économie circulaire', value: envMetrics.circularEconomyProgress || 65, target: 80 },
    { label: 'Biodiversité (actions)', value: 40, target: 100 }
  ];
  
  ecoObjectives.forEach((obj, index) => {
    designer.drawProgressBar(
      DESIGN.page.margin,
      designer.y + index * 30,
      designer.contentWidth - 50,
      obj.label,
      obj.value,
      obj.target
    );
  });
  
  designer.y += ecoObjectives.length * 30 + DESIGN.spacing.lg;
  
  // Certifications
  designer.checkSpace(80);
  designer.drawSectionHeader('Certifications et Labels');
  
  const certifications = envMetrics.certifications || [
    { name: 'ISO 14001', status: 'En préparation', date: 'Q2 2025' },
    { name: 'Label Économie Circulaire', status: 'Niveau 2 obtenu', date: 'Actif' },
    { name: 'Bilan Carbone®', status: 'Évaluation prévue', date: 'Sept 2024' }
  ];
  
  certifications.forEach((cert, index) => {
    const y = designer.y + index * 25;
    
    // Carte de certification
    pdf.setFillColor(...hexToRgb(DESIGN.colors.gray[50]));
    pdf.roundedRect(DESIGN.page.margin, y, designer.contentWidth, 20, 3, 3, 'F');
    
    // Indicateur de statut
    const statusColor = cert.status.includes('obtenu') || cert.status.includes('Actif') ? DESIGN.colors.accent :
                       cert.status.includes('préparation') ? DESIGN.colors.warning : DESIGN.colors.secondary;
    
    pdf.setFillColor(...hexToRgb(statusColor));
    pdf.circle(DESIGN.page.margin + 8, y + 10, 3, 'F');
    
    // Nom
    pdf.setFontSize(DESIGN.fonts.medium);
    pdf.setTextColor(...hexToRgb(DESIGN.colors.dark));
    pdf.setFont(undefined, 'bold');
    pdf.text(cert.name, DESIGN.page.margin + 15, y + 8);
    
    // Statut
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(DESIGN.fonts.small);
    pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[600]));
    pdf.text(cert.status, DESIGN.page.margin + 15, y + 14);
    
    // Date
    pdf.setTextColor(...hexToRgb(statusColor));
    pdf.text(cert.date, designer.pageWidth - DESIGN.page.margin - 20, y + 11);
  });
  
  // Plan d'action écologique
  designer.newPage();
  designer.drawSectionHeader('5. Plan d\'action écologique');
  
  const ecoActions = [
    {
      priority: 'Haute',
      title: 'Optimiser le tri à la source',
      impact: '-15 tCO₂e/an',
      description: 'Formation du personnel et amélioration de la signalétique',
      color: DESIGN.colors.danger
    },
    {
      priority: 'Haute',
      title: 'Réduire les emballages',
      impact: '-8 tCO₂e/an',
      description: 'Partenariat avec fournisseurs pour réduction à la source',
      color: DESIGN.colors.danger
    },
    {
      priority: 'Moyenne',
      title: 'Favoriser les filières locales',
      impact: '-12 tCO₂e/an',
      description: 'Réduction des émissions liées au transport',
      color: DESIGN.colors.warning
    },
    {
      priority: 'Normale',
      title: 'Biodiversité sur site',
      impact: '+500 m² espaces verts',
      description: 'Création de zones végétalisées et hôtels à insectes',
      color: DESIGN.colors.secondary
    }
  ];
  
  ecoActions.forEach((action, index) => {
    const y = designer.y + index * 40;
    
    // Carte d'action
    pdf.setFillColor(...hexToRgb(DESIGN.colors.gray[50]));
    pdf.roundedRect(DESIGN.page.margin, y, designer.contentWidth, 35, 3, 3, 'F');
    
    // Indicateur de priorité
    pdf.setFillColor(...hexToRgb(action.color));
    pdf.roundedRect(DESIGN.page.margin, y, 3, 35, 1.5, 1.5, 'F');
    
    // Numéro
    pdf.setFontSize(DESIGN.fonts.large);
    pdf.setTextColor(...hexToRgb(action.color));
    pdf.setFont(undefined, 'bold');
    pdf.text(`${index + 1}`, DESIGN.page.margin + 8, y + 10);
    
    // Titre
    pdf.setFontSize(DESIGN.fonts.medium);
    pdf.setTextColor(...hexToRgb(DESIGN.colors.dark));
    pdf.text(action.title, DESIGN.page.margin + 18, y + 10);
    
    // Impact
    pdf.setFillColor(...hexToRgb(action.color));
    pdf.setGState(new pdf.GState({ opacity: 0.2 }));
    pdf.roundedRect(designer.pageWidth - DESIGN.page.margin - 50, y + 5, 45, 10, 5, 5, 'F');
    pdf.setGState(new pdf.GState({ opacity: 1 }));
    
    pdf.setFontSize(DESIGN.fonts.small);
    pdf.setTextColor(...hexToRgb(action.color));
    pdf.setFont(undefined, 'bold');
    pdf.text(action.impact, designer.pageWidth - DESIGN.page.margin - 27.5, y + 11, { align: 'center' });
    
    // Description
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(DESIGN.fonts.small);
    pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[600]));
    const descLines = pdf.splitTextToSize(action.description, designer.contentWidth - 30);
    descLines.forEach((line, lineIdx) => {
      pdf.text(line, DESIGN.page.margin + 8, y + 20 + lineIdx * 5);
    });
  });
  
  // Conclusion environnementale
  designer.y += ecoActions.length * 40 + DESIGN.spacing.lg;
  designer.checkSpace(50);
  
  pdf.setFillColor(...hexToRgb(DESIGN.colors.accent));
  pdf.setGState(new pdf.GState({ opacity: 0.1 }));
  pdf.roundedRect(DESIGN.page.margin, designer.y, designer.contentWidth, 45, 3, 3, 'F');
  pdf.setGState(new pdf.GState({ opacity: 1 }));
  
  pdf.setFillColor(...hexToRgb(DESIGN.colors.accent));
  pdf.roundedRect(DESIGN.page.margin, designer.y, 3, 45, 1.5, 1.5, 'F');
  
  pdf.setFontSize(DESIGN.fonts.medium);
  pdf.setTextColor(...hexToRgb(DESIGN.colors.accent));
  pdf.setFont(undefined, 'bold');
  pdf.text('🌱 Engagement pour l\'avenir', DESIGN.page.margin + 8, designer.y + 10);
  
  pdf.setFont(undefined, 'normal');
  pdf.setFontSize(DESIGN.fonts.base);
  pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[700]));
  const envConclusion = `Avec ${envMetrics.co2Avoided || '89.4'} tonnes de CO₂ évitées cette année, vous démontrez qu'économie et écologie peuvent aller de pair. En maintenant cette trajectoire et en appliquant le plan d'action proposé, vous atteindrez la neutralité carbone sur vos déchets d'ici 2026.`;
  
  const envConclusionLines = pdf.splitTextToSize(envConclusion, designer.contentWidth - 15);
  envConclusionLines.forEach((line, index) => {
    pdf.text(line, DESIGN.page.margin + 8, designer.y + 18 + index * 6);
  });
  
  // Ajouter les pieds de page
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) {
    pdf.setPage(i);
    designer.addFooter('Rapport d\'Impact Environnemental');
  }
  
  pdf.save(`recytrack_rapport_environnemental_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export de graphiques individuels
export const exportChartToPDF = async (chartElementId, title) => {
  const element = document.getElementById(chartElementId);
  if (!element) {
    console.error(`Element with id ${chartElementId} not found`);
    return;
  }

  try {
    // Configuration optimisée pour html2canvas
    const canvas = await html2canvas(element, {
      scale: 3, // Augmenter l'échelle pour une meilleure qualité
      logging: false,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // S'assurer que tous les éléments sont visibles dans le clone
        const clonedElement = clonedDoc.getElementById(chartElementId);
        if (clonedElement) {
          clonedElement.style.transform = 'none';
          clonedElement.style.position = 'relative';
        }
      }
    });

    const pdf = new jsPDF('l', 'mm', 'a4');
    const designer = new PDFDesigner(pdf);
    
    // Titre centré - avec taille adaptative
    const titleFontSize = designer.getAdaptiveFontSize(title || 'Graphique RecyTrack', designer.pageWidth - 40, DESIGN.fonts.xxlarge);
    pdf.setFontSize(titleFontSize);
    pdf.setTextColor(...hexToRgb(DESIGN.colors.primary));
    pdf.setFont(undefined, 'bold');
    pdf.text(title || 'Graphique RecyTrack', designer.pageWidth / 2, 20, { align: 'center' });
    
    // Date
    pdf.setFontSize(DESIGN.fonts.medium);
    pdf.setTextColor(...hexToRgb(DESIGN.colors.gray[600]));
    pdf.setFont(undefined, 'normal');
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, designer.pageWidth / 2, 30, { align: 'center' });
    
    // Calcul optimisé des dimensions de l'image
    const margin = 20;
    const maxWidth = designer.pageWidth - 2 * margin;
    const maxHeight = designer.pageHeight - 60; // Header + footer space
    
    // Ratio d'aspect de l'image
    const aspectRatio = canvas.width / canvas.height;
    
    let finalWidth, finalHeight;
    
    // Ajuster les dimensions en gardant le ratio d'aspect
    if (aspectRatio > maxWidth / maxHeight) {
      // L'image est plus large que haute
      finalWidth = maxWidth;
      finalHeight = maxWidth / aspectRatio;
    } else {
      // L'image est plus haute que large
      finalHeight = maxHeight;
      finalWidth = maxHeight * aspectRatio;
    }
    
    // Centrer l'image
    const xPosition = (designer.pageWidth - finalWidth) / 2;
    const yPosition = 40;
    
    // Bordure avec coins arrondis
    pdf.setDrawColor(...hexToRgb(DESIGN.colors.gray[200]));
    pdf.setLineWidth(0.5);
    pdf.roundedRect(xPosition - 2, yPosition - 2, finalWidth + 4, finalHeight + 4, 2, 2);
    
    // Ajouter l'image avec compression JPEG pour réduire la taille
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', xPosition, yPosition, finalWidth, finalHeight);
    
    // Pied de page
    designer.addFooter(title || 'Graphique');
    
    pdf.save(`recytrack_${title?.toLowerCase().replace(/ /g, '_') || 'graphique'}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Erreur lors de l\'export du graphique:', error);
  }
};