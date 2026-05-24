const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add custom configuration if needed
config.resolver.sourceExts.push('mjs');

module.exports = config;
