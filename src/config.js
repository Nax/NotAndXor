'use strict';

const env = process.env.NODE_ENV || 'development';
const dev = (env !== 'production');

module.exports = { env, dev };
