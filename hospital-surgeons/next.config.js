/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude swagger-ui-react from server-side bundle to prevent Html import errors
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('swagger-ui-react');
      } else {
        config.externals = [config.externals, 'swagger-ui-react'];
      }
    }
    return config;
  },
};

module.exports = nextConfig;

