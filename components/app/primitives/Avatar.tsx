import {
  Avatar as ShadAvatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const palette = [
  "bg-[#fdeceb] text-[#cb2820]",
  "bg-[#eaf0fe] text-[#2563eb]",
  "bg-[#e9f7ee] text-[#16a34a]",
  "bg-[#fdf2e3] text-[#d97706]",
  "bg-[#eef1f5] text-[#64748b]",
];

export function Avatar({
  initials,
  photoUrl,
  size = 36,
  className,
}: {
  initials: string;
  photoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const idx = (initials.charCodeAt(0) || 0) % palette.length;
  return (
    <ShadAvatar
      className={cn("shrink-0", !photoUrl && palette[idx], className)}
      style={{ width: size, height: size }}
    >
      {photoUrl ? <AvatarImage src={photoUrl} alt={initials} /> : null}
      <AvatarFallback
        className={cn("text-inherit bg-inherit font-semibold")}
        style={{ fontSize: size * 0.36 }}
      >
        {initials}
      </AvatarFallback>
    </ShadAvatar>
  );
}
