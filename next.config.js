/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  output: 'standalone', // REQUIRED for next-on-pages
  experimental: {
    outputFileTracingRoot: './',
  },
};

module.exports = nextConfig;
