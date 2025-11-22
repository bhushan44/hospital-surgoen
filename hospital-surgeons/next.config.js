/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    // Aggressively exclude swagger-ui-react from ALL builds (server and client)
    const problematicPackages = [
      'swagger-ui-react',
      'react-immutable-proptypes',
      'react-immutable-pure-component',
      'redux-immutable',
    ];

    // Add to externals for server-side
    if (isServer) {
      config.externals = config.externals || [];
      if (!Array.isArray(config.externals)) {
        config.externals = [config.externals];
      }
      problematicPackages.forEach(pkg => {
        config.externals.push(pkg);
      });
    }

    // Prevent resolution of these packages entirely
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
    };
    
    problematicPackages.forEach(pkg => {
      config.resolve.alias[pkg] = false;
    });

    // Ignore these packages in module resolution
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(swagger-ui-react|react-immutable-proptypes|react-immutable-pure-component|redux-immutable)$/,
      })
    );
    
    return config;
  },
};

module.exports = nextConfig;

