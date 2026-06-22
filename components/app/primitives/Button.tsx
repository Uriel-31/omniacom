import { Button as ShadButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size    = "sm" | "md";

const variantMap: Record<Variant, React.ComponentProps<typeof ShadButton>["variant"]> = {
  primary: "default",
  outline: "outline",
  ghost:   "ghost",
  danger:  "destructive",
};

const sizeMap: Record<Size, React.ComponentProps<typeof ShadButton>["size"]> = {
  sm: "sm",
  md: "default",
};

interface Props extends Omit<ComponentPropsWithoutRef<typeof ShadButton>, "variant" | "size"> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: Props) {
  return (
    <ShadButton
      variant={variantMap[variant]}
      size={sizeMap[size]}
      className={cn("[&>svg]:size-4", className)}
      {...props}
    />
  );
}
