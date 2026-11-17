import { execSync } from 'node:child_process';

try {
  execSync('npx astro build', { stdio: 'inherit' });
} catch (err) {
  console.error('Astro build failed:', err.message);
  process.exit(1);
}

try {
  execSync('node scripts/generate-sitemap.mjs', { stdio: 'inherit' });
} catch (err) {
  console.error('Sitemap generation failed:', err.message);
  process.exit(1);
}

console.log('Build complete!');
