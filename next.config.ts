
import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // This is required to allow the Next.js dev server to accept requests from the browser
    // In some Next.js versions, this is a top-level property.
  },
  // This is required to allow the Next.js dev server to accept requests from the browser
  // In some Next.js versions, this is a top-level property.
  allowedDevOrigins: [
    "https://3000-firebase-studio-1756897439170.cluster-j6d3cbsvdbe5uxnhqrfzzeyj7i.cloudworkstations.dev",
    "https://*.cloudworkstations.dev",
  ],
  env: {
    NEXT_PUBLIC_PLATFORM_BANK: process.env.PLATFORM_BANK,
    NEXT_PUBLIC_PLATFORM_AGENCY: process.env.PLATFORM_AGENCY,
    NEXT_PUBLIC_PLATFORM_ACCOUNT: process.env.PLATFORM_ACCOUNT,
    NEXT_PUBLIC_PLATFORM_PIX_KEY: process.env.PLATFORM_PIX_KEY,
    NEXT_PUBLIC_PLATFORM_HOLDER: process.env.PLATFORM_HOLDER,
    NEXT_PUBLIC_PLATFORM_CNPJ: process.env.PLATFORM_CNPJ,
    NEXT_PUBLIC_PLATFORM_ACCOUNT_TYPE: process.env.PLATFORM_ACCOUNT_TYPE,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
};

export default nextConfig;
