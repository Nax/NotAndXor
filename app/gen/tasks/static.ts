import { TaskFunc } from '../task';

export default (): TaskFunc => files => Promise.all(files.map(async file => {
  const data = await file.read();
  const filename = file.path;
  return { filename, data };
}));
