'use strict';

const Handlebars = require('handlebars');
const strftime = require('strftime');

module.exports = (builder) => {
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
