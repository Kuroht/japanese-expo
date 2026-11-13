// Babel config. Expo does this by default, but Jest needs the file to exist
// so it can compile TypeScript in both the app tests and the pipeline tests.
module.exports = function (api) {
  api.cache(true);
  // babel-preset-expo is installed inside expo's own node_modules (not hoisted),
  // so plain "babel-preset-expo" cannot be found from the Jest scripts project.
  const presetPath = require.resolve("babel-preset-expo", {
    paths: [require.resolve("expo")],
  });
  return { presets: [presetPath] };
};
