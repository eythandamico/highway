"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { ContentTransition } from "./content-transition";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "ui-button [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
        xs: "ui-button-xs",
        sm: "ui-button-sm",
        lg: "ui-button-lg",
        icon: "ui-button-icon",
        "icon-xs": "ui-button-icon ui-button-xs",
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
  animateLabel = false,
  reserveLabels,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    animateLabel?: boolean;
    reserveLabels?: string[];
    asChild?: boolean;
    static?: boolean;
    iconPosition?: "start" | "end";
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      disabled={disabled}
      aria-disabled={disabled || loading || undefined}
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
      onClickCapture={event => { if (disabled || loading) { event.preventDefault(); event.stopPropagation(); return; } props.onClickCapture?.(event); }}
      onClick={event => { if (disabled || loading) { event.preventDefault(); event.stopPropagation(); return; } props.onClick?.(event); }}
    >{asChild ? children : <>{loading && <svg className="ui-spinner ui-button-spinner" aria-hidden="true" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" opacity=".25"/><path d="M10 3a7 7 0 0 1 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}{loading ? <span className="ui-button-pending-label"><ContentTransition reserve={reserveLabels}>{children}</ContentTransition></span> : animateLabel || reserveLabels ? <ContentTransition reserve={reserveLabels} animate={animateLabel}>{children}</ContentTransition> : children}</>}</Comp>
  );
}

export { Button, buttonVariants };
