module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // react-native-worklets/plugin must be LAST (replaces deprecated reanimated/plugin in v4)
      'react-native-worklets/plugin',
    ],
  };
};
