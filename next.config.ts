
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
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
    ],
  },
  experimental: {
    // This is required to allow the Next.js dev server to accept requests from the browser
    // In some Next.js versions, this is a top-level property.
  },
  allowedDevOrigins: [
    'https://*.cloudworkstations.dev',
  ],
  env: {
    NEXT_PUBLIC_PLATFORM_BANK: process.env.PLATFORM_BANK,
    NEXT_PUBLIC_PLATFORM_AGENCY: process.env.PLATFORM_AGENCY,
    NEXT_PUBLIC_PLATFORM_ACCOUNT: process.env.PLATFORM_ACCOUNT,
    NEXT_PUBLIC_PLATFORM_ACCOUNT_TYPE: process.env.PLATFORM_ACCOUNT_TYPE,
    NEXT_PUBLIC_PLATFORM_PIX_KEY: process.env.PLATFORM_PIX_KEY,
    NEXT_PUBLIC_PLATFORM_HOLDER: process.env.PLATFORM_HOLDER,
    NEXT_PUBLIC_PLATFORM_CPF: process.env.PLATFORM_CPF,
  }
};

export default nextConfig;
