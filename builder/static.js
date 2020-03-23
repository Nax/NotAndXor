const fs = require('fs');
const path = require('path');
const { emit } = require('./util');

module.exports = async (p) => {
  const { name, ext } = path.parse(p);
  const data = await fs.promises.readFile(p);
  await emit('./dist/' + name + ext, data);
};
