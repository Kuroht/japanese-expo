// Babel config. Expo does this by default, but Jest needs the file to exist
// so it can compile TypeScript in both the app tests and the pipeline tests.
module.exports = function (api) {
  api.cache(true);
  return { presets: ["babel-preset-expo"] };
};
