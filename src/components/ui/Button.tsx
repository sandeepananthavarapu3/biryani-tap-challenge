"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, onClick, type, ...rest }, ref) => {
    const variants = {
      primary: "bg-gradient-to-b from-amber-300 to-orange-400 text-[#351a0c] shadow-[0_4px_0_#9a451c] hover:brightness-110 border border-transparent",
      secondary: "bg-transparent text-amber-500 border border-amber-500 hover:bg-amber-500/10",
      danger: "bg-red-500 text-white hover:bg-red-600 border border-transparent",
      ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-gray-800",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4",
      lg: "h-12 px-6 text-lg",
    };

    return (
      <button
        ref={ref}
        {...rest}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        onClick={onClick}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
          variants[variant],
          sizes[size],
          className
        )}
      >
        {loading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {loading ? <span>Loading…</span> : children}
      </button>
    );
  }
);
Button.displayName = "Button";
