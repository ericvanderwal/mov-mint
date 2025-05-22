/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone', // Required for Cloudflare Pages with next-on-pages
  images: {
    unoptimized: true, // Avoid using Image Optimization on Pages (unless using R2 or custom loader)
  },
  experimental: {
    appDir: true, // Enable App Router if you're using it
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = config;
