/** @type {import('next').NextConfig} */
const nextConfig = {
  // No special webpack config needed - swagger-ui-react has been removed
  // Exclude the old Vite source directory from compilation
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/Hospital Dashboard MVP Design/**'],
    };
    return config;
  },
};

module.exports = nextConfig;

