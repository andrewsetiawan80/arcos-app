const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable better error reporting and logging
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Enable source maps for better error tracking
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Enable better error reporting
config.transformer.unstable_allowRequireContext = true;

// Enable logging for bundling issues
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Log bundling requests
      if (req.url.includes('/bundle')) {
        console.log(`📦 Bundling request: ${req.url}`);
      }
      
      // Log any errors
      res.on('error', (error) => {
        console.error('🚨 Metro bundling error:', error);
      });
      
      return middleware(req, res, next);
    };
  },
};

module.exports = config;







