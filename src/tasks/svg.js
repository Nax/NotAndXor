'use strict';

module.exports = builder => builder.taskAny([], "app/assets", "**/*.svg", async (m) => {
  builder.data.assets ||= new Map();

  const data = await m.read();
  const filename = '_assets/' + m.path;

  builder.data.assets.set(m.path, `/${filename}`);

  return { filename, data };
});
