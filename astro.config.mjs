import { defineConfig } from 'astro/config';
import rss from '@astrojs/rss';

export default defineConfig({
  site: 'https://pedrom3160.github.io/blog/',
  base: '/blog/',
  integrations: [],
  markdown: {
    syntaxHighlight: 'prism',
  },
  output: 'static',
});

export function getRss() {
  return rss({
    title: 'GPTCLONE Blog',
    description: 'Conhecimento, investigação, educação e diário de projeto',
    site: 'https://pedrom3160.github.io/blog/',
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
    },
  });
}