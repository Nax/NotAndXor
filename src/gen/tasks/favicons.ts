import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { zipObject } from 'lodash-es';

import { Builder } from '../builder';
import { CONFIG } from '../config';
import { Favicons } from '../types';

const SIZES = [16, 32, 48, 64];

async function genResizedFavicons(src: string): Promise<Record<number, Buffer>> {
  const sharpImage = await sharp(src);
  const resizedImages = await Promise.all(SIZES.map(size => sharpImage.clone().resize(size, size).png({ compressionLevel: 9 }).toBuffer()));
  return zipObject(SIZES, resizedImages);
};

function buildIco(pngs: Buffer[]): Buffer {
  const count = pngs.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * count;

  let dataOffset = headerSize + dirSize;
  const parts: Buffer[] = [];

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  parts.push(header);

  for (const png of pngs) {
    const entry = Buffer.alloc(dirEntrySize);
    const w = png.readUInt32BE(16);
    const h = png.readUInt32BE(20);
    entry.writeUInt8(w >= 256 ? 0 : w, 0);
    entry.writeUInt8(h >= 256 ? 0 : h, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(dataOffset, 12);
    dataOffset += png.length;
    parts.push(entry);
  }

  for (const png of pngs) {
    parts.push(png);
  }

  return Buffer.concat(parts);
}

export async function buildFavicons(builder: Builder) {
  const sourcePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../favicon.svg');
  const source = await fs.readFile(sourcePath);
  const images = await genResizedFavicons(sourcePath);
  const ico = buildIco(Object.values(images));

  const svgName = `favicon${CONFIG.dev ? '' : '.[hash]'}.svg`;
  const svgOut = builder.emit({ name: svgName, content: source, mimeType: 'image/svg+xml' });

  const icons: Favicons = {
    svg: { path: '/' + svgOut.name },
    ico: { path: '/favicon.ico' },
    png: []
  };

  builder.emit({ name: 'favicon.ico', content: ico, mimeType: 'image/x-icon' });
  for (const s of SIZES) {
    const name = `favicon-${s}${CONFIG.dev ? '' : '.[hash]'}.png`;
    builder.emit({ name, content: images[s], mimeType: 'image/png' });
    icons.png.push({ size: s, path: '/' + name });
  }

  return icons;
}
