/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    // Exclude swagger-ui-react from server-side bundle to prevent Html import errors
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({
          'swagger-ui-react': 'commonjs swagger-ui-react',
        });
      } else if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = [
          originalExternals,
          { 'swagger-ui-react': 'commonjs swagger-ui-react' },
        ];
      } else {
        config.externals = [
          config.externals,
          { 'swagger-ui-react': 'commonjs swagger-ui-react' },
        ];
      }
    }
    
    // Ignore swagger-ui-react during module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      'swagger-ui-react': false,
    };
    
    return config;
  },
};

module.exports = nextConfig;

