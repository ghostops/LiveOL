const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const defaultResolver = getDefaultConfig(__dirname).resolver;

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */

const config = {
  resolver: {
    ...defaultResolver,
    sourceExts: [...defaultResolver.sourceExts, 'cjs'],
  },
  transformer: {
    babelTransformerPath: require.resolve(
      'react-native-typescript-transformer',
    ),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);