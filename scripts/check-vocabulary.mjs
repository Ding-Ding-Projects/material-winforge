import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = [
  process.env.PRIVATE_VOCABULARY_SOURCE,
  path.join(root, '..', 'agent-global-memory', 'memory', 'SHARED_INSTRUCTIONS.md'),
  path.join(homedir(), 'Documents', 'GitHub', 'agent-global-memory', 'memory', 'SHARED_INSTRUCTIONS.md')
].filter(Boolean).find((candidate) => existsSync(candidate));
const lockPath = process.env.PRIVATE_VOCABULARY_LOCK || (sourcePath ? path.join(path.dirname(sourcePath), '.vocab-lock') : null);

if (!sourcePath) {
  console.log('Private vocabulary source is not configured; outsider build skips the currency lock.');
  process.exit(0);
}

const source = await readFile(sourcePath, 'utf8');
const expected = (await readFile(lockPath, 'utf8')).trim().toLowerCase();
if (!/^[a-f0-9]{64}$/.test(expected)) throw new Error('Private vocabulary lock is not a SHA-256 digest.');

const startMarker = '## Vocabulary and locations';
const endMarker = '## Secrets and sensitive input';
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start + startMarker.length);
if (start < 0 || end < 0 || end <= start) throw new Error('Private vocabulary section markers were not found in order.');
const governed = source.slice(start, end).replace(/\r\n/g, '\n');

const actual = createHash('sha256').update(governed, 'utf8').digest('hex');
if (actual !== expected) throw new Error('Private vocabulary source is present but its lock is stale.');
console.log('Private vocabulary currency lock matches the configured private source.');
