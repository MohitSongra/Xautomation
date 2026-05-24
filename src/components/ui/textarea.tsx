"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxCharacters?: number;
  showCount?: boolean;
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      maxCharacters = 280,
      showCount = false,
      autoResize = false,
      value,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null);
    const charCount = typeof value === "string" ? value.length : 0;
    const isOver = maxCharacters > 0 && charCount > maxCharacters;

    // Merge refs
    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      },
      [ref]
    );

    // Auto-resize logic
    React.useEffect(() => {
      if (autoResize && internalRef.current) {
        const el = internalRef.current;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }
    }, [value, autoResize]);

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
          <textarea
            ref={setRefs}
            id={inputId}
            value={value}
            onChange={onChange}
            className={cn(
              "flex w-full min-h-[100px] rounded-[var(--radius-md)]",
              "bg-bg-tertiary/60 border border-border-default",
              "px-3 py-2.5 text-sm text-text-primary leading-relaxed",
              "placeholder:text-text-tertiary",
              "transition-all duration-200 ease-out",
              "hover:border-border-hover",
              "focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "resize-none",
              autoResize && "overflow-hidden",
              error &&
                "border-accent-rose/50 focus:border-accent-rose focus:ring-accent-rose/30",
              className
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error
                ? `${inputId}-error`
                : showCount
                  ? `${inputId}-count`
                  : undefined
            }
            {...props}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          {error ? (
            <p
              id={`${inputId}-error`}
              className="text-xs text-accent-rose flex items-center gap-1"
            >
              <span className="inline-block h-1 w-1 rounded-full bg-accent-rose" />
              {error}
            </p>
          ) : (
            <span />
          )}

          {showCount && (
            <p
              id={`${inputId}-count`}
              className={cn(
                "text-xs tabular-nums transition-colors duration-200",
                isOver ? "text-accent-rose" : "text-text-tertiary"
              )}
            >
              {charCount}
              {maxCharacters > 0 && ` / ${maxCharacters}`}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
