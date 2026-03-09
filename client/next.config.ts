import type { NextConfig } from "next";

// Bundle analyzer (only when ANALYZE=true)
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "kaam-ai.s3.us-east-1.amazonaws.com",
      },
    ],
    minimumCacheTTL: 31536000,
  },

  experimental: {
    // Tree-shake these packages to reduce bundle size
    optimizePackageImports: [
      "lucide-react",
      "firebase-admin",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
    ],
    webpackMemoryOptimizations: true,
  },

  compiler: {
    // Strip console.log/debug statements in production, but keep error/warn for monitoring
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  productionBrowserSourceMaps: false,
  compress: true,
  output: "standalone" as const,

  async headers() {
    const isDev = process.env.NODE_ENV === "development";

    const cspDirectives = [
      `default-src 'self'`,
      `script-src 'self' ${isDev ? "'unsafe-eval'" : ""} 'unsafe-inline'`,
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data: blob: https://images.unsplash.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://*.google.com https://*.gstatic.com`,
      `font-src 'self' data:`,
      `connect-src 'self' ${process.env.NEXT_PUBLIC_BACKEND_URL} http://localhost:5000 https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com`,
      `frame-src 'self'`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `frame-ancestors 'none'`,
    ];

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: cspDirectives.join("; "),
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
