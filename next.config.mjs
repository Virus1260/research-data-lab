/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ['msedge-tts'],
  // Add configuration to handle static assets properly
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
