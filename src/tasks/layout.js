'use strict';

const path = require('path');
const hbsContext = require('../hbs-context');

module.exports = builder => builder.taskAny([], "app/layouts", "**.hbs", async (m) => {
  const hbs = hbsContext(builder);
  let { name } = path.parse(m.fullpath);

  const isPartial = (name[0] === '_');
  const data = (await m.read()).toString();
  const layout = hbs.compile(data);

  if (isPartial) {
    name = name.substring(1);
    hbs.registerPartial(name, layout);
  } else {
    builder.data.layouts ||= {};
    builder.data.layouts[name] = layout;
  }

  return null;
});
