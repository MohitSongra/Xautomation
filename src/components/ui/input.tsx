"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, type = "text", ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary [&>svg]:h-4 [&>svg]:w-4 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              "flex w-full rounded-[var(--radius-md)]",
              "bg-bg-tertiary/60 border border-border-default",
              "px-3 py-2.5 text-sm text-text-primary",
              "placeholder:text-text-tertiary",
              "transition-all duration-200 ease-out",
              "hover:border-border-hover",
              "focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon && "pl-10",
              error &&
                "border-accent-rose/50 focus:border-accent-rose focus:ring-accent-rose/30",
              className
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-accent-rose flex items-center gap-1"
          >
            <span className="inline-block h-1 w-1 rounded-full bg-accent-rose" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
