// Production build with the GitHub Pages base path. Run: node scripts/build.mjs
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const siteDir = join(root, '_site');

rmSync(siteDir, { recursive: true, force: true });

const result = spawnSync('npx', ['@11ty/eleventy', '--pathprefix=/blog/'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
});

process.exit(result.status ?? 1);
