/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // This is required to prevent "firebase-admin" and "stripe" from being
    // bundled on the client.
    serverComponentsExternalPackages: ['firebase-admin', 'stripe'],
  },
};

module.exports = nextConfig;
