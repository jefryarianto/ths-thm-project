"use client";

import { forwardRef, type HTMLAttributes } from "react";
import type { FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldWrapperProps {
  label?: string;
  error?: FieldError;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormFieldWrapper({ label, error, required, children, className }: FormFieldWrapperProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-sm font-medium text-destructive">{error.message}</p>
      )}
    </div>
  );
}

export const FormMessage = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null;
    return (
      <p ref={ref} className={cn("text-sm font-medium text-destructive", className)} {...props}>
        {children}
      </p>
    );
  }
);
FormMessage.displayName = "FormMessage";
