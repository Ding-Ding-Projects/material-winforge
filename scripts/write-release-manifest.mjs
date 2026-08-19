import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const output = process.argv[2];
if (!output) throw new Error('Usage: node scripts/write-release-manifest.mjs <output>');
const required = ['RELEASE_VERSION', 'RELEASE_TAG', 'RELEASE_COMMIT', 'RELEASE_ASSET_NAME', 'RELEASE_ASSET_URL', 'RELEASE_SHA256', 'RELEASE_SIZE', 'RELEASE_PUBLISHED_AT'];
for (const key of required) if (!process.env[key]) throw new Error(`Missing environment variable: ${key}`);

const manifest = {
  schemaVersion: 1,
  status: 'published',
  version: process.env.RELEASE_VERSION,
  tag: process.env.RELEASE_TAG,
  commit: process.env.RELEASE_COMMIT,
  platform: 'Windows x64',
  assetName: process.env.RELEASE_ASSET_NAME,
  url: process.env.RELEASE_ASSET_URL,
  sha256: process.env.RELEASE_SHA256.toLowerCase(),
  size: Number(process.env.RELEASE_SIZE),
  publishedAt: process.env.RELEASE_PUBLISHED_AT
};
if (!/^[a-f0-9]{64}$/.test(manifest.sha256) || !Number.isSafeInteger(manifest.size) || manifest.size <= 0) {
  throw new Error('Release manifest digest or size is invalid.');
}
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Wrote verified release manifest to ${output}.`);
