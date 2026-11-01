import "./visual-effects.css";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";
/** Quiet surface gradients from Playground, not a new decorative palette. */
export function GradientSurface({variant="onboarding",className,...props}:ComponentProps<"div">&{variant?:"onboarding"|"profile"|"upload"|"stage"}) {return <div {...props} className={cn("fx-gradient-surface",className)} data-gradient={variant}/>;}
