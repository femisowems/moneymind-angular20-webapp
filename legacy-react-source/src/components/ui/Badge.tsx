import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "danger" | "neutral" | "primary";
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "bg-gray-100 text-gray-800": variant === "neutral",
          "bg-blue-100 text-blue-800": variant === "info",
          "bg-success/10 text-success": variant === "success",
          "bg-warning/10 text-warning": variant === "warning",
          "bg-danger/10 text-danger": variant === "danger",
          "bg-primary/10 text-primary": variant === "primary",
        },
        className
      )}
      {...props}
    />
  );
}
