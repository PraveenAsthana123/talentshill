/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['better-sqlite3'],
};
module.exports = nextConfig;
