const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const crypto = require('crypto');

module.exports = {};

module.exports.emit = async (p, data) => {
  const { dir } = path.parse(p);
  await mkdirp(dir);
  await fs.promises.writeFile(p, data);
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
