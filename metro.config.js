// Metro bundler config.
// We add "db" so the prebuilt content database in assets/ can be bundled with require().
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push("db");

module.exports = config;
