export type BadgeVariant = "default" | "outline" | "accent";

export interface BadgeProps {
  variant?: BadgeVariant;
  label: string;
}
