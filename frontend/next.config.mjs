/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ["image/avif", "image/webp"],
    // Add remotePatterns with exact hostnames when using CDN thumbnails (e.g. d123.cloudfront.net).
  },

  // Optional: add packages with many named exports for tree-shaking (e.g. "lucide-react")
  // experimental: { optimizePackageImports: [] },
};

export default nextConfig;
