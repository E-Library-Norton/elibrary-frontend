import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: "default" | "secondary" | "outline" | "success";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-[#20659C]/10 text-[#20659C] border-[#20659C]/20",
    secondary: "bg-[#DF900A]/10 text-[#DF900A] border-[#DF900A]/20",
    outline: "border border-[#E2E8F0] text-[#5E5E5E]",
    success: "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
