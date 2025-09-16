import { styleText } from 'node:util';

import { OutputFile } from './types';

type BuilderCallback = (file: OutputFile) => void;

const SUFFIXES = ['B', 'KiB', 'MiB', 'GiB'];

function formatBytes(size: number) {
  let suffixIndex = 0;
  while (size >= 1024 && suffixIndex < SUFFIXES.length - 1) {
    size /= 1024;
    suffixIndex++;
  }
  return `${size.toFixed(2)} ${SUFFIXES[suffixIndex]}`;
}

export class Builder {
  private callback: BuilderCallback;

  constructor(callback: BuilderCallback) {
    this.callback = callback;
  }

  emit(file: OutputFile): OutputFile {
    const fileSize = file.content.length;
    console.log(`${styleText(['bold', 'green'], file.name.padEnd(50))} ${styleText(['bold', 'yellow'], formatBytes(fileSize).padStart(8))}`);
    this.callback(file);
    return file;
  }
}
