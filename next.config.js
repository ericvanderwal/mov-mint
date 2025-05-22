/** @type {import('next').NextConfig} */
const config = {
    reactStrictMode: true,
    output: 'export', // ⚠️ required for next export
    images: {unoptimized: true}
};

module.exports = config;
