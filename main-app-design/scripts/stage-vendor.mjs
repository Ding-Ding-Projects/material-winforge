import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modules = path.join(root, 'node_modules');
const vendor = path.join(root, 'vendor');
const fonts = path.join(vendor, 'fonts');
const licenses = path.join(vendor, 'licenses');

await Promise.all([
  mkdir(vendor, { recursive: true }),
  mkdir(fonts, { recursive: true }),
  mkdir(licenses, { recursive: true })
]);

const copies = [
  ['react/umd/react.production.min.js', 'react.production.min.js'],
  ['react-dom/umd/react-dom.production.min.js', 'react-dom.production.min.js'],
  ['@babel/standalone/babel.min.js', 'babel.min.js'],
  ['material-symbols/material-symbols-outlined.woff2', 'fonts/material-symbols-outlined.woff2'],
  ['@fontsource/roboto/files/roboto-latin-300-normal.woff2', 'fonts/roboto-latin-300.woff2'],
  ['@fontsource/roboto/files/roboto-latin-400-normal.woff2', 'fonts/roboto-latin-400.woff2'],
  ['@fontsource/roboto/files/roboto-latin-500-normal.woff2', 'fonts/roboto-latin-500.woff2'],
  ['@fontsource/roboto/files/roboto-latin-700-normal.woff2', 'fonts/roboto-latin-700.woff2'],
  ['@fontsource/roboto-mono/files/roboto-mono-latin-400-normal.woff2', 'fonts/roboto-mono-latin-400.woff2'],
  ['@fontsource/roboto-mono/files/roboto-mono-latin-500-normal.woff2', 'fonts/roboto-mono-latin-500.woff2'],
  ['@fontsource/roboto-mono/files/roboto-mono-latin-700-normal.woff2', 'fonts/roboto-mono-latin-700.woff2'],
  ['react/LICENSE', 'licenses/react.txt'],
  ['react-dom/LICENSE', 'licenses/react-dom.txt'],
  ['@babel/standalone/LICENSE', 'licenses/babel-standalone.txt'],
  ['material-symbols/LICENSE', 'licenses/material-symbols.txt'],
  ['@fontsource/roboto/LICENSE', 'licenses/roboto.txt'],
  ['@fontsource/roboto-mono/LICENSE', 'licenses/roboto-mono.txt']
];

for (const [from, to] of copies) {
  const destination = path.join(vendor, to);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(path.join(modules, from), destination);
}

const face = (family, file, weight) =>
  `@font-face{font-family:'${family}';font-style:normal;font-display:swap;font-weight:${weight};src:url('./fonts/${file}') format('woff2')}`;
const css = [
  face('Roboto', 'roboto-latin-300.woff2', 300),
  face('Roboto', 'roboto-latin-400.woff2', 400),
  face('Roboto', 'roboto-latin-500.woff2', 500),
  face('Roboto', 'roboto-latin-700.woff2', 700),
  face('Roboto Mono', 'roboto-mono-latin-400.woff2', 400),
  face('Roboto Mono', 'roboto-mono-latin-500.woff2', 500),
  face('Roboto Mono', 'roboto-mono-latin-700.woff2', 700),
  "@font-face{font-family:'Material Symbols Outlined';font-style:normal;font-display:block;font-weight:100 700;src:url('./fonts/material-symbols-outlined.woff2') format('woff2')}"
].join('\n') + '\n';
await writeFile(path.join(vendor, 'fonts.css'), css, 'utf8');

for (const relative of ['react.production.min.js', 'react-dom.production.min.js', 'babel.min.js', 'fonts.css']) {
  const bytes = await readFile(path.join(vendor, relative));
  if (!bytes.length) throw new Error(`Staged vendor file is empty: ${relative}`);
}

console.log(`Staged ${copies.length} offline runtime files in ${vendor}.`);
