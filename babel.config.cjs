module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      }
    }]
  ],
  plugins: [
    '@babel/plugin-syntax-import-meta',
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-runtime'
  ]
};
