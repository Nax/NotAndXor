'use strict';

module.exports = builder => builder.task([], "app/static", "**.*", matches => Promise.all(matches.map(async (m) => {
  const data = await m.read();
  const filename = m.path;
  return { filename, data };
})));
