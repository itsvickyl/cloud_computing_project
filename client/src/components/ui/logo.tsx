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
      {/* Modern TalentScope Icon */}
      <div className={cn("relative", sizes.icon)}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
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

          {/* Rounded square background */}
          <rect x="2" y="2" width="96" height="96" rx="22" fill="url(#logoGradient)" />

          {/* "T" letter */}
          <rect x="18" y="28" width="30" height="6" rx="2" fill="white" />
          <rect x="30" y="28" width="6" height="44" rx="2" fill="white" />

          {/* "S" letter with accent gradient */}
          <path
            d="M72 34c0-4.5-4-8-10-8s-10 3.5-10 8c0 4.5 4.5 6.5 10 8.5s10 4 10 8.5c0 4.5-4 8-10 8s-10-3.5-10-8"
            stroke="url(#accentGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Subtle inner border for depth */}
          <rect
            x="5"
            y="5"
            width="90"
            height="90"
            rx="19"
            fill="none"
            stroke="white"
            strokeWidth="1"
            opacity="0.15"
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