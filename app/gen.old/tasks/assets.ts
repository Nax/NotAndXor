import { TaskFunc } from '../task';
import { replaceFilename } from '../util';

type AssetsOpts = {
  filename: string;
};

export default (opts: AssetsOpts): TaskFunc => (files, builder) => {
  builder.data.assets ||= new Map();

  return Promise.all(files.map(async file => {
    const data = await file.read();
    const filename = replaceFilename(opts.filename, { file, data });

    builder.data.assets.set(file.path, `/${filename}`);

    return { filename, data };
  }));
};

