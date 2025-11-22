/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude swagger-ui-react and its problematic dependencies from server-side bundle
    if (isServer) {
      config.externals = config.externals || [];
      if (!Array.isArray(config.externals)) {
        config.externals = [config.externals];
      }
      // Exclude swagger-ui-react and its dependencies that use next/document
      config.externals.push(
        'swagger-ui-react',
        'react-immutable-proptypes',
        'react-immutable-pure-component',
        'redux-immutable'
      );
    }
    
    return config;
  },
};

module.exports = nextConfig;

