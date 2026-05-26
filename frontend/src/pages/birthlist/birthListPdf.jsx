import jsPDF from 'jspdf';

/**
 * Génère un PDF type catalogue de la liste de naissance
 * Inclut UNIQUEMENT les favoris de l'utilisatrice, groupés par catégorie.
 */
export function exportBirthListToPDF(myListItems, userName = '') {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  let y = 22;

  // === En-tête rose MamanDouce ===
  doc.setFillColor(244, 114, 182);
  doc.rect(0, 0, pageWidth, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MamanDouce — Liste de Naissance', margin, 9);

  // === Titre ===
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(22);
  doc.text('Ma liste de naissance', margin, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const sub = `Édité le ${today}${userName ? ` — ${userName}` : ''}`;
  doc.text(sub, margin, y);
  y += 4;

  // Compteur total
  const total = myListItems.reduce((acc, cat) => acc + cat.items.length, 0);
  const essentialCount = myListItems.reduce(
    (acc, cat) => acc + cat.items.filter((i) => i.essential).length,
    0
  );
  doc.setTextColor(244, 114, 182);
  doc.setFont('helvetica', 'bold');
  doc.text(`${total} articles · ${essentialCount} essentiels`, margin, y);
  y += 10;

  // === Catégories avec couleurs cyclées (Jaune → Bleu → Rouge → Vert → Violet) ===
  const colors = [
    [251, 191, 36],  // Jaune
    [96, 165, 250],  // Bleu
    [244, 63, 94],   // Rouge
    [52, 211, 153],  // Vert
    [168, 85, 247],  // Violet
  ];

  myListItems.forEach((cat, catIdx) => {
    const color = colors[catIdx % colors.length];

    // Vérifier l'espace, sauter page si besoin
    if (y > pageHeight - 30) {
      doc.addPage();
      y = 22;
    }

    // Header catégorie (pastille colorée + nom)
    doc.setFillColor(...color);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 9, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${cat.icon}  ${cat.category}`, margin + 3, y + 6.3);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`${cat.items.length} article${cat.items.length > 1 ? 's' : ''}`, pageWidth - margin - 3, y + 6.3, { align: 'right' });
    y += 12;

    // Items en grille 2 colonnes
    const itemW = (pageWidth - margin * 2 - 4) / 2;
    let col = 0;
    let rowY = y;
    cat.items.forEach((item, idx) => {
      const x = margin + col * (itemW + 4);
      const itemH = 10;

      // Saut de page si bas de page atteint
      if (rowY + itemH > pageHeight - 18) {
        doc.addPage();
        rowY = 22;
        col = 0;
      }

      // Cadre item
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, rowY, itemW, itemH, 1.5, 1.5, 'FD');

      // Coeur rouge à gauche
      doc.setFillColor(244, 63, 94);
      doc.setFontSize(10);
      doc.text('♥', x + 2.5, rowY + 6.5);

      // Nom item
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const maxNameW = itemW - 18;
      const lines = doc.splitTextToSize(item.name, maxNameW);
      doc.text(lines[0], x + 7, rowY + 5);

      // Badge "Essentiel"
      if (item.essential) {
        doc.setFillColor(...color, 0.18);
        doc.setTextColor(...color);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('★', x + itemW - 4, rowY + 6.5, { align: 'right' });
      }

      col = (col + 1) % 2;
      if (col === 0) rowY += itemH + 2;
    });
    if (col !== 0) rowY += 12;
    y = rowY + 4;
  });

  // === Pied de page sur chaque page ===
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Catalogue généré par MamanDouce — Partagez votre liste avec votre famille',
      pageWidth / 2,
      pageHeight - 9,
      { align: 'center' }
    );
    doc.text(`Page ${i} / ${pageCount} · mamandouce.com`, pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`mamandouce-liste-naissance-${dateStr}.pdf`);
}
