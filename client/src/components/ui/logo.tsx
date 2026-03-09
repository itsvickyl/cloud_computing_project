import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
}

const sizeClasses = {
  sm: {
    icon: "size-8",
    text: "text-lg",
    gap: "gap-2",
  },
  md: {
    icon: "size-10",
    text: "text-2xl",
    gap: "gap-2.5",
  },
  lg: {
    icon: "size-12",
    text: "text-3xl",
    gap: "gap-3",
  },
  xl: {
    icon: "size-16",
    text: "text-4xl",
    gap: "gap-3",
  },
};

export function Logo({
  className,
  showText = true,
  size = "md",
  href = "/"
}: LogoProps) {
  const sizes = sizeClasses[size];

  const logoContent = (
    <div className={cn("flex items-center", sizes.gap, className)}>
      {/* Modern Geometric Icon */}
      <div className={cn("relative", sizes.icon)}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background gradient circle */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="[stop-color:hsl(var(--primary))]" />
              <stop offset="100%" className="[stop-color:hsl(var(--primary)/0.6)]" />
            </linearGradient>
            <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
          </defs>

          {/* Main background circle */}
          <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />

          {/* Abstract "K" shape with geometric design */}
          <g transform="translate(50, 50)">
            {/* Vertical line of K */}
            <rect x="-20" y="-25" width="8" height="50" fill="white" rx="2" />

            {/* Upper diagonal of K - representing upward growth */}
            <path
              d="M -12 0 L 12 -25 L 20 -20 L -4 5 Z"
              fill="white"
            />

            {/* Lower diagonal of K - with AI accent */}
            <path
              d="M -12 0 L 12 25 L 20 20 L -4 -5 Z"
              fill="url(#accentGradient)"
            />

            {/* Small accent dot representing AI */}
            <circle cx="18" cy="22" r="3" fill="white" opacity="0.9" />
          </g>

          {/* Subtle outer ring for depth */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="white"
            strokeWidth="1"
            opacity="0.2"
          />
        </svg>
      </div>

      {showText && (
        <h1 className={cn("font-bold tracking-tight", sizes.text)}>
          <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Talent
          </span>
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent font-extrabold">
            Scope
          </span>
        </h1>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center transition-opacity hover:opacity-80">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

export default Logo;