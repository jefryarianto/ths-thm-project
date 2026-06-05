import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  env: {
    // Fallback production URL — overridable via NEXT_PUBLIC_API_URL build arg
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || 'https://api.ths-thm.cloud/api/v1',
  },
};

export default nextConfig;
