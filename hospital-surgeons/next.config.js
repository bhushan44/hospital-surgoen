/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude design folder from compilation
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/Doctor Dashboard Design/**'],
    };
    return config;
  },
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

