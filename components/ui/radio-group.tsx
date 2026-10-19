"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const KeyboardSelectionContext = React.createContext<React.RefObject<boolean> | null>(null)

function RadioGroup({
  className,
  onKeyDownCapture,
  onPointerDownCapture,
  onBlurCapture,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  // Keep selection intent until focus arrives. Radix moves focus asynchronously,
  // so a quick key release can otherwise move focus without selecting the radio.
  const keyboardSelectionRef = React.useRef(false)
  return (
    <KeyboardSelectionContext.Provider value={keyboardSelectionRef}><RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
      onKeyDownCapture={event => {
        onKeyDownCapture?.(event)
        keyboardSelectionRef.current = !event.defaultPrevented && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)
      }}
      onPointerDownCapture={event => { keyboardSelectionRef.current = false; onPointerDownCapture?.(event) }}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) keyboardSelectionRef.current = false
        onBlurCapture?.(event)
      }}
    /></KeyboardSelectionContext.Provider>
  )
}

function RadioGroupItem({
  className,
  onFocus,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  const keyboardSelectionRef = React.useContext(KeyboardSelectionContext)
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "ui-choice ui-radio",
        className
      )}
      {...props}
      onFocus={event => {
        onFocus?.(event)
        if (!event.defaultPrevented && keyboardSelectionRef?.current) {
          keyboardSelectionRef.current = false
          event.currentTarget.click()
          event.preventDefault()
        }
      }}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        forceMount
        className="ui-choice-indicator"
      />
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
