import path from 'path';
import fs from 'fs';
import Handlebars from 'handlebars';
import strftime from 'strftime';

import { TaskFunc } from '../task';
import { Builder } from '../build';

const hbsContext = (builder: Builder) => {
  /* Returns the previous context if it exists */
  let hbs = builder.data.hbs;
  if (hbs)
    return hbs;

  /* Create a brand new context */
  hbs = Handlebars.create();
  builder.data.hbs = hbs;

  /* Register hbs helpers */
  hbs.registerHelper("date", function(date: string) {
    return strftime("%B %d, %Y", new Date(date));
  });

  hbs.registerHelper("asset", function(path: string) {
    return builder.data.assets.get(path);
  });

  hbs.registerHelper("svg", function(path: string) {
    return fs.readFileSync(__dirname + '/../../svg/' + path).toString();
  });

  return hbs;
};

export default (): TaskFunc => (files, builder) => Promise.all(files.map(async file => {
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
})).then(_ => []);
