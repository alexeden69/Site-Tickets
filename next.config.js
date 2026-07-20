/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: process.env.GITHUB_ACTIONS ? '/Site-Tickets' : '',
  assetPrefix: process.env.GITHUB_ACTIONS ? '/Site-Tickets/' : '',
};

module.exports = nextConfig;
