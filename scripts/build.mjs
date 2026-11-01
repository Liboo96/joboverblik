import { cp, mkdir, rm, writeFile } from 'node:fs/promises';

// src is the only editable app copy. docs is the published GitHub Pages artifact.
// Paths are resolved from this script so the command also works outside the repo root.
const source = new URL('../src/', import.meta.url);
const output = new URL('../docs/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });
await writeFile(new URL('.nojekyll', output), '');
console.log('Built docs/ from src/.');
