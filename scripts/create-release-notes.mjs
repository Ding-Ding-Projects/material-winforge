import { readFile, writeFile } from 'node:fs/promises';

const output = process.argv[2];
if (!output) throw new Error('Usage: node scripts/create-release-notes.mjs <output>');
const env = process.env;
for (const key of ['RELEASE_VERSION', 'RELEASE_TAG', 'RELEASE_COMMIT', 'WORKFLOW_STARTED', 'WORKFLOW_COMPLETED', 'WORKFLOW_DURATION', 'SHA256_FILE', 'LINE_COUNT_FILE']) {
  if (!env[key]) throw new Error(`Missing environment variable: ${key}`);
}

const checksums = (await readFile(env.SHA256_FILE, 'utf8')).trim();
const lineCount = (await readFile(env.LINE_COUNT_FILE, 'utf8')).trim();
let dimSum = null;
if (env.DIM_SUM_FILE) {
  try { dimSum = JSON.parse(await readFile(env.DIM_SUM_FILE, 'utf8')); } catch { dimSum = null; }
}
const codeName = dimSum?.available
  ? `**Code name:** ${dimSum.codeName} — [public catalog photo](${dimSum.assetUrl}) (${dimSum.catalogRelease})`
  : '**Code name:** unavailable for this release; the public catalog did not yield an unused published image.';

const notes = `# WinForge · Material 3 Preview ${env.RELEASE_VERSION}

This is an offline interface preview. It demonstrates the Material 3 desktop design with sample data; it does not change Windows, files, services, accounts, networks, or hardware.

${codeName}

## Download

The Squirrel.Windows artifacts are **unsigned**. Windows may show an unknown-publisher or SmartScreen warning. Code signing is intentionally not used.

\`\`\`text
${checksums}
\`\`\`

## Workflow timing

- Workflow started: ${env.WORKFLOW_STARTED}
- Workflow completed: ${env.WORKFLOW_COMPLETED}
- Workflow duration: ${env.WORKFLOW_DURATION}
- Release commit: \`${env.RELEASE_COMMIT}\`
- Release tag: \`${env.RELEASE_TAG}\`

## Verification boundary

Build and packaging completed for the recorded commit. Tests, lint, type checking, static analysis, accessibility checks, runtime launch, installation, browser interaction, and screenshots were intentionally not run in this accelerated release pass.

## Project line count

${lineCount}
`;

await writeFile(output, notes, 'utf8');
console.log(`Wrote release notes to ${output}.`);
