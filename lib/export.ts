/**
 * Utilitaires d'export Excel et PDF.
 * Fonctions async pour éviter les problèmes de bundle SSR avec Next.js.
 */

/** Export en fichier Excel (.xlsx). */
export async function exportExcel(
  rows: Record<string, string | number>[],
  filename: string,
) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Export");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/** Export en PDF — tableau générique. */
export async function exportPdf(
  title: string,
  head: string[],
  body: (string | number)[][],
  filename: string,
) {
  const { default: jsPDF }     = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(16);
  doc.setTextColor(226, 52, 43);
  doc.text("OMNIACOM", 14, 14);

  doc.setFontSize(11);
  doc.setTextColor(40);
  doc.text(title, 14, 21);

  doc.setFontSize(8);
  doc.setTextColor(130);
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, 27);

  autoTable(doc, {
    head: [head],
    body,
    startY: 32,
    styles:         { fontSize: 8, cellPadding: 3 },
    headStyles:     { fillColor: [226, 52, 43], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  doc.save(`${filename}.pdf`);
}

/** Génère un rapport PDF complet pour un Bon de Commande. */
export async function generateBcPdf(
  bc: {
    numeroBc: string;
    projetAssocie?: string;
    montantPo: number;
    montantFacture: number;
    montantRestant: number;
  },
  lignes: {
    description?: string;
    montantHt: number;
    dateFacture?: string;
    statutPaiement: string;
  }[],
) {
  const { default: jsPDF }     = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
  const fmtDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("fr-FR") : "—";
  const statutLabel = (s: string) =>
    s === "PAYE" ? "Payé" : s === "EN_ATTENTE" ? "En attente" : "Annulé";

  const doc = new jsPDF();

  // En-tête
  doc.setFontSize(20);
  doc.setTextColor(226, 52, 43);
  doc.text("OMNIACOM", 14, 16);

  doc.setFontSize(13);
  doc.setTextColor(30);
  doc.text(`Bon de Commande — ${bc.numeroBc}`, 14, 25);

  doc.setFontSize(8);
  doc.setTextColor(130);
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, 31);

  // Fiche BC
  doc.setFontSize(10);
  doc.setTextColor(50);
  const y = 42;
  [
    ["Projet associé",  bc.projetAssocie ?? "—"],
    ["Montant PO",      fmt(bc.montantPo)],
    ["Montant facturé", fmt(bc.montantFacture)],
    ["Montant restant", fmt(bc.montantRestant)],
    ["Statut",          bc.montantRestant === 0 ? "Soldé" : "En cours"],
  ].forEach(([label, value], i) => {
    doc.setTextColor(120);
    doc.text(`${label} :`, 14, y + i * 8);
    doc.setTextColor(30);
    doc.text(value, 55, y + i * 8);
  });

  // Lignes de facturation
  doc.setFontSize(11);
  doc.setTextColor(30);
  doc.text("Lignes de facturation", 14, y + 47);

  autoTable(doc, {
    head: [["Description", "Montant HT", "Date facture", "Paiement"]],
    body: lignes.map((l) => [
      l.description ?? "—",
      fmt(l.montantHt),
      fmtDate(l.dateFacture),
      statutLabel(l.statutPaiement),
    ]),
    startY: y + 53,
    styles:     { fontSize: 9 },
    headStyles: { fillColor: [226, 52, 43], textColor: 255 },
  });

  doc.save(`BC-${bc.numeroBc}.pdf`);
}
