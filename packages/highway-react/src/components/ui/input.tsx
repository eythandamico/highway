"use client"
import * as React from "react"

import { DateInput } from "./date-input"
import { cn } from "../../lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const Component = type === "date" ? DateInput : "input";
  return (
    <Component
      type={type}
      data-slot="input"
      className={cn("ui-input", className)}
      {...props}
    />
  )
}

export { Input }
