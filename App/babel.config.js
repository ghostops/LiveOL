module.exports = {
  presets: [['module:@react-native/babel-preset'], {}],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '~/lib': './src/lib',
          '~/store': './src/store',
          '~/util': './src/util',
          '~/views': './src/views',
          '~/hooks': './src/hooks',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
