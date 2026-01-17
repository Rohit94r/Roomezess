/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ysicwtkdhvpvilsxhekp.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.resolve.symlinks = false;
      config.watchOptions = {
        ignored: /node_modules/,
      };
    }
    return config;
  },
}

module.exports = nextConfig
