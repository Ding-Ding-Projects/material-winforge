import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (value) => value.slice(1)));
const output = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root });
const files = output.toString('utf8').split('\0').filter(Boolean);
const findings = [];

const forbiddenPaths = new Set(['PLAN.md', 'main-app-design/CLAUDE.md', 'main-app-design/.thumbnail']);
const genericPatterns = [
  { label: 'absolute user profile path', regex: /(?:[A-Za-z]:[\\/]Users[\\/][^\\/\s]+|\/home\/[^/\s]+)\//giu },
  { label: 'remote renderer runtime', regex: /https:\/\/(?:unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//giu }
];

let privateTerms = [];
const dictionaryPath = [
  process.env.PRIVATE_VOCABULARY_DICTIONARY,
  path.join(root, '..', 'agent-global-memory', 'memory', 'vocabulary-dictionary.json'),
  path.join(homedir(), 'Documents', 'GitHub', 'agent-global-memory', 'memory', 'vocabulary-dictionary.json')
].filter(Boolean).find((candidate) => existsSync(candidate));
if (dictionaryPath) {
  const dictionary = JSON.parse(await readFile(dictionaryPath, 'utf8'));
  privateTerms = (dictionary.terms || [])
    .flatMap((entry) => [entry.alias, entry.plural])
    .filter((term) => typeof term === 'string' && term.length > 2 && !/^N\/A/i.test(term) && term !== 'Slop Machine');
}

const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const privatePatterns = privateTerms.map((term) => ({
  label: `private conversation term: ${term}`,
  regex: new RegExp(`(?<![\\p{L}\\p{N}])${escape(term)}(?![\\p{L}\\p{N}])`, 'giu')
}));

for (const relative of files) {
  const normalized = relative.replace(/\\/g, '/');
  if (forbiddenPaths.has(normalized)) findings.push(`${normalized}: private design-control file must remain untracked`);
  let content;
  try {
    const bytes = await readFile(path.join(root, relative));
    if (bytes.includes(0) || bytes.length > 4 * 1024 * 1024) continue;
    content = bytes.toString('utf8');
  } catch {
    continue;
  }
  for (const { label, regex } of genericPatterns) {
    regex.lastIndex = 0;
    if (regex.test(content)) findings.push(`${normalized}: ${label}`);
  }
  let publicProse = '';
  if (/\.md$/i.test(normalized)) {
    publicProse = content.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, '').replace(/`[^`]*`/g, '');
  } else if (/\.html$/i.test(normalized)) {
    publicProse = content.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '');
  }
  for (const { label, regex } of privatePatterns) {
    regex.lastIndex = 0;
    if (regex.test(publicProse)) findings.push(`${normalized}: ${label}`);
  }
}

if (findings.length) {
  console.error(findings.join('\n'));
  process.exit(1);
}
console.log(`Publication preflight passed for ${files.length} tracked or proposed files${dictionaryPath ? ' with the configured private dictionary' : ''}.`);
