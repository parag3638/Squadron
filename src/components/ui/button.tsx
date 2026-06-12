import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 ease-[var(--ease-out-soft)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-accent)] text-[var(--color-accent-ink)] font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_6px_20px_-10px_var(--color-accent-soft)] hover:brightness-[1.06]",
        contrast:
          "bg-[var(--color-fg)] text-[var(--color-bg)] font-semibold hover:bg-white",
        secondary:
          "bg-[var(--color-surface-2)] text-[var(--color-fg)] border border-[var(--color-line)] hover:border-[var(--color-line-2)] hover:bg-[var(--color-surface-3)]",
        ghost:
          "text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)]",
        outline:
          "border border-[var(--color-line-2)] text-[var(--color-fg)] hover:border-[var(--color-accent-line)] hover:text-[var(--color-accent)]",
      },
      size: {
        sm: "h-8 px-3.5 text-[13px]",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(button({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = "Button";
