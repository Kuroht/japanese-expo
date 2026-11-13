// ESLint flat config: Expo's recommended rules, with Prettier handling formatting.
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierConfig = require("eslint-config-prettier");

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ["dist/*", "scripts/.cache/*", "node_modules/*"],
  },
]);
