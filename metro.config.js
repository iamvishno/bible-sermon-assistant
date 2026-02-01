const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for SQLite database files
config.resolver.assetExts.push('db');

// Handle Node.js core modules that don't exist in React Native
// This prevents axios from trying to load Node.js crypto module
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Return empty module for Node.js built-ins that React Native doesn't support
  if (moduleName === 'crypto' || moduleName === 'stream' || moduleName === 'http' || moduleName === 'https' || moduleName === 'zlib') {
    return {
      type: 'empty',
    };
  }
  // Let Metro handle everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
