const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const bytes = require('bytes');
const c = require('ansi-colors');

module.exports = {};

module.exports.emitFile = async (destDir, f) => {
  const { filename, data } = f;
  const p = path.join(destDir, filename);

  /* Make the directory */
  const { dir } = path.parse(p);
  await mkdirp(dir);

  /* Write the actual file */
  await fs.promises.writeFile(p, data);

  /* Log */
  console.log(c.bold.green(filename.padEnd(70)) + c.yellow.bold(`${bytes(data.length).padStart(7)}`));
};
