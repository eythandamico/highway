import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "ui-button [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "ui-button-primary",
        secondary: "ui-button-secondary",
        ghost: "ui-button-ghost",
        outline: "ui-button-secondary",
        destructive: "ui-button-destructive",
        link: "ui-button-ghost",
      },
      size: {
        default: "ui-button-default",
        inline: "ui-button-inline",
        xs: "ui-button-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "ui-button-sm",
        lg: "ui-button-lg",
        icon: "ui-button-icon",
        "icon-xs": "ui-button-icon ui-button-xs [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "ui-button-icon ui-button-sm",
        "icon-lg": "ui-button-icon ui-button-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  static: isStatic = false,
  iconPosition,
  loading = false,
  disabled,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    asChild?: boolean;
    static?: boolean;
    iconPosition?: "start" | "end";
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-variant={
        variant === "outline"
          ? "secondary"
          : variant === "link"
            ? "ghost"
            : variant
      }
      data-size={size}
      data-static={isStatic || undefined}
      data-icon-position={iconPosition}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
