const { minify } = require('html-minifier');
const { emit } = require('./util');

module.exports = async (template, templateArgs, dst) => {
  const html = minify(
    template(templateArgs), {
      html5: true,
      collapseBooleanAttributes: true,
      collapseInlineTagWhitespace: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      decodeEntities: true,
      sortAttributes: true,
      sortClassName: true
    }
  );
  await emit(dst, html);
};
