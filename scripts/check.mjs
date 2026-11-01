import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const source = new URL('../src/', import.meta.url);
const output = new URL('../docs/', import.meta.url);
for (const filename of readdirSync(source)) {
  if (/\.(js|mjs)$/.test(filename)) {
    const result = spawnSync(
      process.execPath,
      ['--check', fileURLToPath(new URL(filename, source))],
      {
        stdio: 'inherit',
      },
    );
    if (result.status !== 0) process.exit(1);
  }
  assert.deepEqual(
    readFileSync(new URL(filename, source)),
    readFileSync(new URL(filename, output)),
    `${filename}: run npm run build before publishing.`,
  );
}
assert.deepEqual(
  readdirSync(output).sort(),
  [...readdirSync(source), '.nojekyll'].sort(),
  'Unexpected generated files in docs/.',
);
console.log('Syntax and published artifacts match src/.');
