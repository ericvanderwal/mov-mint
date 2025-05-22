/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = config;