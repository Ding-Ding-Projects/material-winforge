import { execFileSync } from 'node:child_process';
import { basename } from 'node:path';
import { writeFile } from 'node:fs/promises';

const photoRepository = 'Ding-Ding-Projects/dim-sum-photos';
const ghJson = (args) => JSON.parse(execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
const catalogResponse = ghJson(['api', `repos/${photoRepository}/contents/catalog/index.json`]);
const catalog = JSON.parse(Buffer.from(String(catalogResponse.content).replace(/\s/g, ''), 'base64').toString('utf8'));
const releases = ghJson(['release', 'list', '-R', photoRepository, '--limit', '100', '--json', 'tagName,isDraft'])
  .filter((release) => !release.isDraft && /^catalog-v1/i.test(release.tagName));

const assets = new Map();
for (const release of releases) {
  const view = ghJson(['release', 'view', release.tagName, '-R', photoRepository, '--json', 'assets']);
  for (const asset of view.assets || []) assets.set(asset.name, { url: asset.url, tag: release.tagName });
}

let usedText = '';
const currentRepository = process.env.GITHUB_REPOSITORY;
if (currentRepository) {
  try {
    const prior = ghJson(['release', 'list', '-R', currentRepository, '--limit', '100', '--json', 'body']);
    usedText = prior.map((release) => release.body || '').join('\n');
  } catch {
    usedText = '';
  }
}

let selection = null;
for (const dish of catalog.dishes || []) {
  const assetName = basename(dish.image?.path || '');
  const asset = assets.get(assetName);
  const codeName = `${dish.name?.en || ''} · ${dish.name?.zhHant || ''}`;
  if (asset && dish.name?.en && dish.name?.zhHant && !usedText.includes(codeName)) {
    selection = {
      available: true,
      id: dish.id,
      codeName,
      name: dish.name,
      assetName,
      assetUrl: asset.url,
      catalogRelease: asset.tag,
      alt: dish.image?.alt?.en || codeName
    };
    break;
  }
}

const result = selection || { available: false, reason: 'No unused dish with a published catalog-v1 image asset was resolved.' };
const outputIndex = process.argv.indexOf('--output');
if (outputIndex >= 0 && process.argv[outputIndex + 1]) await writeFile(process.argv[outputIndex + 1], `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(result));
