const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const bytes = require('bytes');
const c = require('ansi-colors');
const crypto = require('crypto');

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

module.exports.replaceFilename = (pattern, args) => {
  if (args.file) {
    args.ext ||= path.extname(args.file.path).substring(1);
    args.name ||= path.basename(args.file.path).split('.')[0];
    args.path ||= path.dirname(args.file.path);
  }

  return pattern
    .replace(/\[ext\]/, args.ext)
    .replace(/\[name\]/, args.name)
    .replace(/\[path\]/, args.path)
    .replace(/\[hash\]/, () => {
      const cipher = crypto.createHash('md5');
      cipher.update(args.data);
      return cipher.digest('hex');
    });
}
