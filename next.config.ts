import type { NextConfig } from "next";

// CORS headers for all /api/* proxy routes.
const CORS_HEADERS = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
  { key: "Access-Control-Allow-Headers", value: "Authorization,Content-Type,X-Requested-With" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply CORS to every Next.js API proxy route
        source: "/api/:path*",
        headers: CORS_HEADERS,
      },
      {
        // Cache static assets for 1 year (immutable)
        source: "/:all*(svg|jpg|jpeg|png|webp|gif|ico|woff|woff2|ttf|eot)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Security headers for all routes
        source: "/:path*",
        headers: [
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Enable XSS protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Content Security Policy for XSS prevention (UPDATED FOR WEB WORKERS)
          {
            key: "Content-Security-Policy",
            value: `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval'
      https://www.googletagmanager.com
      https://www.google-analytics.com
      https://static.cloudflareinsights.com
      https://unpkg.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: https:;
    font-src 'self' data:;
    connect-src 'self' https: ws: wss:;
    media-src 'self' https:;
    frame-src 'self' https:;
    worker-src 'self' blob:;
    object-src 'none';
  `.replace(/\n/g, " "),
          },
          // Referrer policy for privacy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Enable HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
      {
        // Cache HTML pages for revalidation
        source: "/:path*",
        has: [
          {
            type: "header",
            key: "content-type",
            value: "text/html",
          },
        ],
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=3600",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudflare.com",
      },
      {
        // Cloudflare R2 public bucket (pub-*.r2.dev)
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        // Cloudflare R2 path-style endpoint
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24h cache for optimized images
  },
};

export default nextConfig;