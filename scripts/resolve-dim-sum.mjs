import { execFileSync } from 'node:child_process';
import { basename } from 'node:path';
import { writeFile } from 'node:fs/promises';

const photoRepository = 'Ding-Ding-Projects/dim-sum-photos';
const catalogUrl = 'https://raw.githubusercontent.com/Ding-Ding-Projects/dim-sum-photos/main/catalog/index.json';
const MAX_CATALOG_BYTES = 32 * 1024 * 1024;
const COMMAND_TIMEOUT_MS = 30_000;

const parseJson = (text, label) => {
  const source = String(text || '').trim();
  if (!source) throw new Error(`${label} returned an empty response.`);
  try { return JSON.parse(source); }
  catch (error) { throw new Error(`${label} returned invalid JSON: ${error.message}`); }
};

const ghJson = (args, label) => parseJson(execFileSync('gh', args, {
  encoding: 'utf8',
  maxBuffer: 32 * 1024 * 1024,
  timeout: COMMAND_TIMEOUT_MS,
  stdio: ['ignore', 'pipe', 'pipe']
}), label);

async function fetchBoundedJson(url, label) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), COMMAND_TIMEOUT_MS);
  timer.unref();
  try {
    const response = await fetch(url, {
      redirect: 'error',
      signal: controller.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'material-winforge-release' }
    });
    if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}.`);
    const declared = Number(response.headers.get('content-length') || 0);
    if (declared > MAX_CATALOG_BYTES) throw new Error(`${label} exceeds the ${MAX_CATALOG_BYTES}-byte limit.`);
    const reader = response.body?.getReader();
    if (!reader) throw new Error(`${label} returned no response body.`);
    const chunks = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_CATALOG_BYTES) {
        controller.abort();
        throw new Error(`${label} exceeded the ${MAX_CATALOG_BYTES}-byte limit while downloading.`);
      }
      chunks.push(value);
    }
    if (total === 0) throw new Error(`${label} returned an empty response body.`);
    return parseJson(Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), total).toString('utf8'), label);
  } finally {
    clearTimeout(timer);
  }
}

const catalog = await fetchBoundedJson(catalogUrl, 'Public dim-sum catalog');
if (!Array.isArray(catalog.dishes) || catalog.dishes.length === 0) throw new Error('Public dim-sum catalog contains no dishes.');
const releases = ghJson(['release', 'list', '-R', photoRepository, '--limit', '100', '--json', 'tagName,isDraft'], 'Public catalog release inventory')
  .filter((release) => !release.isDraft && /^catalog-v1/i.test(release.tagName));
if (!releases.length) throw new Error('No published catalog-v1 release was found in the bounded release inventory.');

const assets = new Map();
for (const release of releases.slice(0, 10)) {
  const view = ghJson(['release', 'view', release.tagName, '-R', photoRepository, '--json', 'assets'], `Catalog release ${release.tagName}`);
  for (const asset of view.assets || []) {
    if (asset.name && /^https:\/\/github\.com\//i.test(asset.url || '')) assets.set(asset.name, { url: asset.url, tag: release.tagName });
  }
}
if (!assets.size) throw new Error('Published catalog-v1 releases contain no downloadable image assets.');

let usedText = '';
const currentRepository = process.env.GITHUB_REPOSITORY;
if (currentRepository) {
  try {
    const prior = ghJson(['release', 'list', '-R', currentRepository, '--limit', '100', '--json', 'body'], 'Current project release inventory');
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
