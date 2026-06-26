import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Anneau OMNIACOM SVG — utilisé UNIQUEMENT pour le loader animé.
 * Partout ailleurs, on utilise le fichier /logo.png.
 */
export function OmniRing({
  size = 28,
  className,
  spinning = false,
}: {
  size?: number;
  className?: string;
  spinning?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={cn(spinning && "animate-omni-spin", className)}
      aria-hidden
    >
      {/* Anneau gris (300°, ouverture à 7 h-9 h, côté gauche) */}
      <circle
        cx="24"
        cy="24"
        r="17"
        stroke="#7d8187"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="89 18"
        transform="rotate(180 24 24)"
      />
      {/* Arc rouge accent (~70°, sommet 11 h-1 h) */}
      <circle
        cx="24"
        cy="24"
        r="17"
        stroke="#e2342b"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="21 86"
        transform="rotate(240 24 24)"
      />
    </svg>
  );
}

/** Logo complet : image PNG + mot-symbole optionnel. */
export function Logo({
  size = 32,
  withWordmark = true,
  className,
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/logo-.png"
        alt="OMNIACOM"
        width={size}
        height={size}
        className="shrink-0 object-contain"
        style={{ width: "auto", height: "auto" }}
      />
      {withWordmark && (
        <span
          className="font-display font-extrabold tracking-tight text-ink"
          style={{ fontSize: Math.round(size * 0.6) }}
        >
          OMNIACOM
        </span>
      )}
    </span>
  );
}

/** Chargeur plein écran ou inline. */
export function Loader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
      <OmniRing size={40} spinning />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
