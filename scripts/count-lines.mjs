import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root }).toString('utf8').split('\0').filter(Boolean);
const excluded = /(^|\/)(node_modules|dist|out|release|vendor)(\/|$)|(?:^|\/)(?:package-lock\.json)$/i;
const generated = new Set(['main-app-design/winforge-m3-data.js']);
const textExtensions = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.html', '.css', '.scss', '.md', '.json', '.yml', '.yaml', '.toml', '.xml', '.bat', '.ps1', '.sh', '.svg']);

const buckets = new Map();
const rows = [];
const add = (category, lines, nonblank, agent, human) => {
  const current = buckets.get(category) || { files: 0, lines: 0, nonblank: 0, agent: 0, human: 0 };
  current.files += 1;
  current.lines += lines;
  current.nonblank += nonblank;
  current.agent += agent;
  current.human += human;
  buckets.set(category, current);
};
const categoryFor = (file) => {
  if (generated.has(file)) return 'Generated data';
  if (/(^|\/)(test|tests|spec|specs)(\/|$)|\.(?:test|spec)\./i.test(file)) return 'Tests';
  if (/\.(?:css|scss|html|svg)$/i.test(file)) return 'Styles and markup';
  if (/\.(?:md)$/i.test(file) || /^(docs|wiki)\//i.test(file)) return 'Documentation';
  if (/^(scripts|\.github)\//i.test(file) || /\.(?:bat|ps1|sh|ya?ml)$/i.test(file)) return 'Build and release tooling';
  if (/^(main-app-design|pages)\//i.test(file)) return 'Application source';
  return 'Other project files';
};

for (const file of tracked) {
  if (excluded.test(file) || !textExtensions.has(path.extname(file).toLowerCase())) continue;
  const absolute = path.join(root, file);
  const content = await readFile(absolute, 'utf8');
  const lines = content === '' ? [] : content.replace(/\r\n?/g, '\n').split('\n');
  if (lines.at(-1) === '') lines.pop();
  const nonblank = lines.filter((line) => line.trim()).length;
  let agent = 0;
  let human = 0;
  try {
    const blame = execFileSync('git', ['blame', '--line-porcelain', 'HEAD', '--', file], { cwd: root, maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
    const authors = [...blame.matchAll(/^author (.+)$/gm)].map((match) => match[1]);
    agent = authors.filter((author) => author === 'Claude Fable 5').length;
    human = authors.length - agent;
  } catch {
    human = lines.length;
  }
  add(categoryFor(file), lines.length, nonblank, agent, human);
  rows.push({ file, lines: lines.length, nonblank, agent, human });
}

const ordered = [...buckets.entries()].sort(([left], [right]) => left.localeCompare(right));
const totals = ordered.reduce((sum, [, row]) => ({
  files: sum.files + row.files,
  lines: sum.lines + row.lines,
  nonblank: sum.nonblank + row.nonblank,
  agent: sum.agent + row.agent,
  human: sum.human + row.human
}), { files: 0, lines: 0, nonblank: 0, agent: 0, human: 0 });

if (totals.agent + totals.human !== totals.lines) throw new Error('Attribution total does not match the line total.');

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ generatedAt: new Date().toISOString(), commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root }).toString().trim(), categories: Object.fromEntries(ordered), totals, files: rows }, null, 2));
} else {
  console.log('| Category | Files | Total lines | Non-blank lines | Agent-authored surviving lines | Human-authored surviving lines |');
  console.log('|---|---:|---:|---:|---:|---:|');
  for (const [category, row] of ordered) console.log(`| ${category} | ${row.files} | ${row.lines} | ${row.nonblank} | ${row.agent} | ${row.human} |`);
  console.log(`| **Everything counted** | **${totals.files}** | **${totals.lines}** | **${totals.nonblank}** | **${totals.agent}** | **${totals.human}** |`);
  console.log('\nExcluded: dependencies, vendored runtime output, build/release output, and lockfiles. Generated data is reported separately. Attribution uses surviving lines from `git blame`; author `Claude Fable 5` is counted as agent-authored.');
}
