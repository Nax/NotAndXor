const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const crypto = require('crypto');
const bytes = require('bytes');
const c = require('ansi-colors');

module.exports = {};

module.exports.emit = async (p, data) => {
  const { dir } = path.parse(p);
  await mkdirp(dir);
  await fs.promises.writeFile(p, data);
  console.log(c.bold.white('asset: ') + c.bold.green(p.padEnd(70)) + c.yellow.bold(`${bytes(data.length).padStart(6)}`));
};

module.exports.assetHash = (p, data) => {
  const REGEX = /\[hash\]/;

  if (!p.match(REGEX)) {
    return p;
  }

  const cipher = crypto.createHash('md5');
  cipher.update(data);
  const digest = cipher.digest('hex');

  return p.replace(REGEX, digest);
}
