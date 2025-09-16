import crypto from 'node:crypto';
import { styleText } from 'node:util';

import { OutputFile } from './types';

type BuilderCallback = (file: OutputFile) => void;

const SUFFIXES = ['B ', 'KB', 'MB', 'GB'];

function formatBytes(size: number) {
  let suffixIndex = 0;
  while (size >= 1024 && suffixIndex < SUFFIXES.length - 1) {
    size /= 1024;
    suffixIndex++;
  }
  return `${size.toFixed(suffixIndex > 0 ? 2 : 0)} ${SUFFIXES[suffixIndex]}`;
}

function processFileName(name: string, content: string | Uint8Array): string {
  if (name.includes('[hash]')) {
    const hash = crypto.createHash('sha256').update(content).digest('hex').substring(0, 12);
    name = name.replace('[hash]', hash);
  }
  return name;
}

export class Builder {
  private callback: BuilderCallback;

  constructor(callback: BuilderCallback) {
    this.callback = callback;
  }

  emit(file: OutputFile): OutputFile {
    file = { ...file };
    file.name = processFileName(file.name, file.content);
    const fileSize = file.content.length;
    console.log(`${styleText(['bold', 'green'], file.name.padEnd(50))} ${styleText(['bold', 'yellow'], formatBytes(fileSize).padStart(11))}`);
    this.callback(file);
    return file;
  }
}
