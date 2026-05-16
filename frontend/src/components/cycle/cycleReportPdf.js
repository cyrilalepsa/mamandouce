import jsPDF from 'jspdf';

/**
 * Génère un PDF du bilan de cycle (à partager avec un professionnel de santé)
 */
export function exportCycleReportToPDF(cycleReport, userName = '') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 25;

  // === En-tête ===
  doc.setFillColor(244, 114, 182); // rose MamanDouce
  doc.rect(0, 0, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('MamanDouce — Bilan de cycle menstruel', margin, 8);

  // === Titre ===
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(20);
  doc.text('Bilan de votre cycle', margin, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(`Édité le ${today}${userName ? ` — ${userName}` : ''}`, margin, y);
  y += 10;

  // === Statut ===
  doc.setDrawColor(220, 252, 231);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 3, 3, 'FD');
  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${cycleReport.status_emoji || ''}  ${cycleReport.status_message || 'Bilan'}`, margin + 5, y + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Score de régularité : ${cycleReport.regularity_score}%`, margin + 5, y + 17);
  y += 30;

  // === Statistiques principales (2 boîtes côte à côte) ===
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Statistiques principales', margin, y);
  y += 5;

  const boxWidth = (pageWidth - margin * 2 - 5) / 2;
  // Box 1: average
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, boxWidth, 22, 3, 3, 'F');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text(`${cycleReport.average_length}`, margin + boxWidth / 2, y + 12, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('jours en moyenne', margin + boxWidth / 2, y + 18, { align: 'center' });

  // Box 2: variation
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + boxWidth + 5, y, boxWidth, 22, 3, 3, 'F');
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`±${cycleReport.variation_days}`, margin + boxWidth + 5 + boxWidth / 2, y + 12, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('jours de variation', margin + boxWidth + 5 + boxWidth / 2, y + 18, { align: 'center' });
  y += 30;

  // === Évolution ===
  if (cycleReport.improvement_message) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Évolution', margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const evolColor = (cycleReport.improvement_percentage || 0) >= 0 ? [5, 150, 105] : [217, 119, 6];
    doc.setTextColor(...evolColor);
    const lines = doc.splitTextToSize(cycleReport.improvement_message, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 5;
  }

  // === Recommandation ===
  if (cycleReport.recommendation) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Recommandation personnalisée', margin, y);
    y += 6;
    doc.setFillColor(250, 245, 255);
    const recoLines = doc.splitTextToSize(cycleReport.recommendation, pageWidth - margin * 2 - 8);
    const recoHeight = recoLines.length * 5 + 8;
    doc.roundedRect(margin, y, pageWidth - margin * 2, recoHeight, 3, 3, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(88, 28, 135);
    doc.text(recoLines, margin + 4, y + 6);
    y += recoHeight + 8;
  }

  // === Pied de page ===
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Document généré par MamanDouce — Ce bilan est indicatif et ne remplace pas un avis médical.',
    pageWidth / 2,
    pageHeight - 13,
    { align: 'center' }
  );
  doc.text('mamandouce.com', pageWidth / 2, pageHeight - 8, { align: 'center' });

  // Téléchargement
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`mamandouce-bilan-cycle-${dateStr}.pdf`);
}
