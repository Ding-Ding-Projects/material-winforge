import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const appRoot = path.join(root, 'main-app-design');
const sources = [path.join(root, 'docs', 'application'), path.join(root, 'docs', 'site')];
const output = path.join(appRoot, 'docs-browser-data.js');
const MAX_ARTICLES = 256;
const MAX_BYTES = 180 * 1024;

async function collect(directory, prefix) {
  const names = (await readdir(directory, { withFileTypes: true }))
    .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b));
  return Promise.all(names.map(async name => {
    const file = path.join(directory, name);
    const markdown = await readFile(file, 'utf8');
    const bytes = Buffer.byteLength(markdown, 'utf8');
    if (bytes < 1 || bytes > MAX_BYTES) throw new Error(`Documentation article is empty or exceeds ${MAX_BYTES} bytes: ${file}`);
    const id = `${prefix}/${name.slice(0, -3)}`;
    const title = (markdown.match(/^#\s+(.+)$/m) || [])[1] || name.slice(0, -3).replace(/-/g, ' ');
    return { id, title: title.trim().slice(0, 160), source: `${prefix}/${name}`, markdown };
  }));
}

const articles = (await Promise.all(sources.map((directory, index) => collect(directory, index === 0 ? 'application' : 'site')))).flat();
if (articles.length < 1 || articles.length > MAX_ARTICLES) throw new Error(`Documentation article inventory is outside 1-${MAX_ARTICLES}: ${articles.length}`);
const ids = new Set();
for (const article of articles) {
  if (ids.has(article.id)) throw new Error(`Duplicate documentation article id: ${article.id}`);
  ids.add(article.id);
}
const payload = `/* Generated from checked-in Markdown by generate-docs-browser.mjs. */\nwindow.WINFORGE_DOCS = ${JSON.stringify({ schemaVersion: 1, articles })};\n`;
await writeFile(output, payload, 'utf8');
console.log(`Generated and validated ${articles.length} offline documentation articles at ${output}.`);
