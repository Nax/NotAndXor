'use strict';

module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,
      useBuiltIns: 'usage',
      corejs: '3'
    }],
    '@babel/preset-typescript'
  ],
};
