
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
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // This is required to allow the Next.js dev server to accept requests from the browser
  // In some Next.js versions, this is a top-level property.
  allowedDevOrigins: [
    "https://3000-firebase-studio-1756897439170.cluster-j6d3cbsvdbe5uxnhqrfzzeyj7i.cloudworkstations.dev",
    "https://*.cloudworkstations.dev",
  ],
};

export default nextConfig;
