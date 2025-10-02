
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
    PAYMENT_BANK: process.env.PAYMENT_BANK,
    PAYMENT_AGENCY: process.env.PAYMENT_AGENCY,
    PAYMENT_ACCOUNT: process.env.PAYMENT_ACCOUNT,
    PAYMENT_PIX_KEY: process.env.PAYMENT_PIX_KEY,
    PAYMENT_HOLDER: process.env.PAYMENT_HOLDER,
    PAYMENT_CNPJ: process.env.PAYMENT_CNPJ,
    PAYMENT_ACCOUNT_TYPE: process.env.PAYMENT_ACCOUNT_TYPE,
  }
};

export default nextConfig;

    