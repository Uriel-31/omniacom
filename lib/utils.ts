import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Fusionne des classes Tailwind sans conflit. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Initiales à partir d'un nom complet (ex : "Jean Planning" -> "JP"). */
export function initiales(...parts: string[]) {
  return parts
    .filter(Boolean)
    .map((p) => p.trim()[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

/** Date lisible en français : 24 mai 2024. */
export function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Date courte : 24/05/2024. */
export function formatDateShort(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR");
}

/** Temps relatif approximatif : "il y a 10 min", "Hier", "il y a 3 jours". */
export function relativeTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const min = Math.round(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.round(h / 24);
  if (j === 1) return "hier";
  return `il y a ${j} jours`;
}

/** Convertit un montant Prisma Decimal (souvent une chaîne JSON) en nombre. */
export function toAmount(value: unknown): number {
  if (value == null || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Somme des montants d'une liste (évite la concaténation de chaînes). */
export function sumAmounts<T>(items: T[], pick: (item: T) => unknown): number {
  return items.reduce((sum, item) => sum + toAmount(pick(item)), 0);
}

/** BC soldé lorsque le montant restant est nul. */
export function isBcSolde(montantRestant: unknown): boolean {
  return toAmount(montantRestant) === 0;
}

/** Montant en FCFA (XAF) : 1 250 000 FCFA. */
export function formatMontant(n: number | string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(toAmount(n)) + " FCFA";
}

/** Jours de retard EPI = date d'envoi − date de demande. */
export function calcJoursRetard(dateDemande: string, dateEnvoi: string) {
  const a = new Date(dateDemande).getTime();
  const b = new Date(dateEnvoi).getTime();
  if (isNaN(a) || isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86400000));
}

/** Prochaine vérification = dernière vérif + 30 jours. */
export function calcProchaineVerif(dateDerniereVerif: string) {
  const d = new Date(dateDerniereVerif);
  if (isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

/** Écart en jours d'une étape PMO (réel − planifié). */
export function calcEcart(planifie?: string, reel?: string) {
  if (!planifie || !reel) return undefined;
  const a = new Date(planifie).getTime();
  const b = new Date(reel).getTime();
  if (isNaN(a) || isNaN(b)) return undefined;
  return Math.round((b - a) / 86400000);
}
