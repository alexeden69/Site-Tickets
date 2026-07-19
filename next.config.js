/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/Site-Tickets',
  assetPrefix: '/Site-Tickets/',
};

module.exports = nextConfig;
