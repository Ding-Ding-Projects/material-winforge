import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pngToIco from 'png-to-ico';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'assets', 'app-icon.svg');
const generated = path.join(root, 'assets', 'generated');
const sizes = [16, 20, 24, 32, 40, 48, 64, 128, 256];

await mkdir(generated, { recursive: true });
const pngs = [];
for (const size of sizes) {
  const output = path.join(generated, `app-${size}.png`);
  await sharp(source, { density: 384 })
    .resize(size, size, { fit: 'contain' })
    .png({ compressionLevel: 9 })
    .toFile(output);
  const metadata = await sharp(output).metadata();
  if (metadata.format !== 'png' || metadata.width !== size || metadata.height !== size) {
    throw new Error(`Generated icon failed validation: ${output}`);
  }
  pngs.push(output);
}

const icoPath = path.join(root, 'assets', 'app.ico');
await writeFile(icoPath, await pngToIco(pngs));
const ico = await readFile(icoPath);
if (ico.length < 1024 || ico[0] !== 0 || ico[1] !== 0 || ico[2] !== 1 || ico[3] !== 0) {
  throw new Error('Generated ICO has an invalid signature or is unexpectedly small.');
}
const imageCount = ico.readUInt16LE(4);
if (imageCount !== sizes.length) {
  throw new Error(`Generated ICO contains ${imageCount} images; expected ${sizes.length}.`);
}

console.log(`Generated and validated ${imageCount} icon sizes at ${icoPath}.`);
