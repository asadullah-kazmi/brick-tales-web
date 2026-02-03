/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Add remotePatterns with exact hostnames when using CDN thumbnails (e.g. d123.cloudfront.net).
  },
};

export default nextConfig;
