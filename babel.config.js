'use strict';

module.exports = {
  presets: [
    ['@babel/preset-env', {
      corejs: '3',
      useBuiltIns: 'usage'
    }],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ]
};
