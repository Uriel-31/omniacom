/**
 * Utilitaires d'export Excel et PDF.
 * Fonctions async pour éviter les problèmes de bundle SSR avec Next.js.
 */

import { formatMontant, isBcSolde } from "@/lib/utils";

/** Export en fichier Excel (.xlsx) — sans style. */
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

/** Export Excel stylisé pour le tracker EPI. */
export async function exportEpiExcel(
  rows: {
    nom: string;
    prenom: string;
    dateDerniereVerif: string;
    dateDemande: string;
    dateEnvoie: string;
    joursRetard: string | number;
    prochaineDate: string;
  }[],
  filename: string,
) {
  const ExcelJS = (await import("exceljs")).default ?? (await import("exceljs"));
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Suivi EPI");

  const COLS = [
    { header: "Noms",                              key: "nom",               width: 22 },
    { header: "Prénoms",                           key: "prenom",            width: 18 },
    { header: "Date dernière vérification",        key: "dateDerniereVerif", width: 28 },
    { header: "Date de demande des évidences",     key: "dateDemande",       width: 30 },
    { header: "Date d'envoi de la ressource",      key: "dateEnvoie",        width: 28 },
    { header: "Nombre de jours de retard",         key: "joursRetard",       width: 25 },
    { header: "Date de prochaine vérification",    key: "prochaineDate",     width: 30 },
  ];

  sheet.columns = COLS.map(({ header, key, width }) => ({ header, key, width }));

  // Style en-tête
  const headerRow = sheet.getRow(1);
  headerRow.height = 42;
  headerRow.eachCell((cell) => {
    cell.fill   = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD0453A" } };
    cell.font   = { bold: true, color: { argb: "FFFFFFFF" }, size: 10, name: "Calibri" };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top:    { style: "thin", color: { argb: "FF000000" } },
      left:   { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      right:  { style: "thin", color: { argb: "FF000000" } },
    };
  });

  // Lignes de données
  rows.forEach((r) => {
    const row = sheet.addRow({
      nom:               r.nom,
      prenom:            r.prenom,
      dateDerniereVerif: r.dateDerniereVerif,
      dateDemande:       r.dateDemande,
      dateEnvoie:        r.dateEnvoie,
      joursRetard:       r.joursRetard,
      prochaineDate:     r.prochaineDate,
    });
    row.height = 18;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { vertical: "middle" };
      cell.border = {
        top:    { style: "thin", color: { argb: "FFD3D3D3" } },
        left:   { style: "thin", color: { argb: "FFD3D3D3" } },
        bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
        right:  { style: "thin", color: { argb: "FFD3D3D3" } },
      };
    });
  });

  // Téléchargement côté navigateur
  const buffer = await workbook.xlsx.writeBuffer();
  const blob   = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a");
  a.href       = url;
  a.download   = `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
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
    montantPo: number | string;
    montantFacture: number | string;
    montantRestant: number | string;
  },
  lignes: {
    description?: string;
    montantHt: number | string;
    dateFacture?: string;
    statutPaiement: string;
  }[],
) {
  const { default: jsPDF }     = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

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
    ["Montant PO",      formatMontant(bc.montantPo)],
    ["Montant facturé", formatMontant(bc.montantFacture)],
    ["Montant restant", formatMontant(bc.montantRestant)],
    ["Statut",          isBcSolde(bc.montantRestant) ? "Soldé" : "En cours"],
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
      formatMontant(l.montantHt),
      fmtDate(l.dateFacture),
      statutLabel(l.statutPaiement),
    ]),
    startY: y + 53,
    styles:     { fontSize: 9 },
    headStyles: { fillColor: [226, 52, 43], textColor: 255 },
  });

  doc.save(`BC-${bc.numeroBc}.pdf`);
}
