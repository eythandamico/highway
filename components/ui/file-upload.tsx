"use client";
import type { ComponentProps, ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FileInputProps = Omit<ComponentProps<"input">, "type" | "children" | "className">;
/** The real file input remains focusable; label clicks and keyboard activation
 * share native file selection, accept filters, and disabled behavior. */
export function FileUpload({ inputProps, children, className, variant = "secondary", presentation = "button", ...props }: Omit<ComponentProps<typeof Label>, "children"> & {
  inputProps: FileInputProps;
  children: ReactNode;
  variant?: "default" | "secondary";
  presentation?: "button" | "dropzone";
}) {
  return <Label {...props} data-slot="file-upload" data-variant={variant} aria-disabled={inputProps.disabled || undefined}
    className={cn(presentation === "button" && buttonVariants({ variant }), "file-upload", className)}>
    {children}<input {...inputProps} type="file" />
  </Label>;
}
