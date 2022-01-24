'use strict';

const path = require('path');
const Handlebars = require('handlebars');
const strftime = require('strftime');

const hbsContext = builder => {
  /* Returns the previous context if it exists */
  let hbs = builder.data.hbs;
  if (hbs)
    return hbs;

  /* Create a brand new context */
  hbs = Handlebars.create();
  builder.data.hbs = hbs;

  /* Register hbs helpers */
  hbs.registerHelper("date", function(date) {
    return strftime("%B %d, %Y", new Date(date));
  });

  hbs.registerHelper("asset", function(path) {
    return builder.data.assets.get(path);
  });

  return hbs;
};

module.exports = () => (files, builder) => Promise.all(files.map(async file => {
  const hbs = hbsContext(builder);
  let { name } = path.parse(file.fullpath);

  const isPartial = (name[0] === '_');
  const data = (await file.read()).toString();
  const layout = hbs.compile(data);

  if (isPartial) {
    name = name.substring(1);
    hbs.registerPartial(name, layout);
  } else {
    builder.data.layouts ||= {};
    builder.data.layouts[name] = layout;
  }

  return null;
}));
