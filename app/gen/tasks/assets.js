'use strict';

const { replaceFilename } = require('../util');

module.exports = (opts) => (files, builder) => {
  builder.data.assets ||= new Map();

  return Promise.all(files.map(async file => {
    const data = await file.read();
    const filename = replaceFilename(opts.filename, { file, data });

    builder.data.assets.set(file.path, `/${filename}`);

    return { filename, data };
  }));
};

