"use client"

import * as React from "react"
import { CheckIcon, MinusIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "../../lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "ui-choice ui-checkbox",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        forceMount
        className="ui-choice-indicator"
      >
        <CheckIcon className="ui-checkbox-check size-3.5" aria-hidden="true" />
        <MinusIcon className="ui-checkbox-mixed size-3.5" aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
