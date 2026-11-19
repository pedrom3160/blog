import markdownIt from 'markdown-it';
import Prism from 'prismjs';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-json.js';

const PATH_PREFIX = '/blog/';
const SITE_URL = 'https://pedrom3160.github.io/blog/';

// Sections that belong to the "Blog" primary navigation destination.
// (These are content areas, not additional menus.)
const BLOG_NAV_PREFIXES = [
  '/journal/',
  '/ai-research/',
  '/academy/',
  '/pdf-library/',
  '/audiobook-library/',
  '/search/',
  '/tags/',
];

const SECTIONS = {
  journal: { label: 'Jornal', url: '/journal/' },
  'ai-research': { label: 'Investigação em IA', url: '/ai-research/' },
  academy: { label: 'GPTCLONE Academy', url: '/academy/' },
};

export default function (eleventyConfig) {
  eleventyConfig.setTemplateFormats(['md', 'njk', 'html', 'xml', '11ty.js']);

  // ---------------------------------------------------------------------------
  // Passthrough static assets
  // ---------------------------------------------------------------------------
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addPassthroughCopy({ 'src/styles': 'styles' });
  eleventyConfig.addPassthroughCopy({ 'src/scripts': 'scripts' });
  eleventyConfig.addPassthroughCopy({ 'public/resources': 'resources' });
  eleventyConfig.addPassthroughCopy({ 'public/robots.txt': 'robots.txt' });
  eleventyConfig.addPassthroughCopy({ 'src/admin': 'admin' });

  // ---------------------------------------------------------------------------
  // Markdown
  // ---------------------------------------------------------------------------
  const md = markdownIt({
    html: true,
    linkify: true,
    typographer: false,
    breaks: false,
    highlight: (code, lang) => {
      if (!lang || !Prism.languages[lang]) return '';
      const label = lang === 'js' ? 'javascript' : lang;
      try {
        const html = Prism.highlight(code, Prism.languages[lang], label);
        return `<pre class="code-block" data-lang="${label}"><code class="language-${label}">${html}</code></pre>`;
      } catch (error) {
        return '';
      }
    },
  }).enable(['table', 'strikethrough']);
  eleventyConfig.setLibrary('md', md);

  // ---------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------
  eleventyConfig.addNunjucksFilter('absoluteUrl', (value) => {
    const clean = String(value || '')
      .replace(/^https?:\/\/[^/]+/i, '')
      .replace(/^\/blog\//, '')
      .replace(/^\//, '');
    return SITE_URL + clean;
  });

  eleventyConfig.addNunjucksFilter('formatDate', (value) => {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  });

  // Compact editorial date for cards and index rows: "17 NOV 2026"
  const SHORT_MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const LONG_MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  eleventyConfig.addNunjucksFilter('shortDate', (value) => {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${day} ${SHORT_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  });

  // Edition line for the homepage index card: "Novembro 2026"
  eleventyConfig.addNunjucksFilter('monthYear', (value) => {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return `${LONG_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  });

  eleventyConfig.addNunjucksFilter('isoDate', (value) => {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  });

  eleventyConfig.addNunjucksFilter('rssDate', (value) => {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toUTCString();
  });

  eleventyConfig.addNunjucksFilter('fileSize', (bytes) => {
    const n = Number(bytes);
    if (!Number.isFinite(n) || n <= 0) return '';
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  });

  eleventyConfig.addNunjucksFilter('sortByDate', (items) => {
    if (!Array.isArray(items)) return items;
    return [...items].sort(
      (a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
    );
  });

  eleventyConfig.addNunjucksFilter('categories', (items) => {
    if (!Array.isArray(items)) return [];
    const counts = new Map();
    for (const item of items) {
      const name =
        (item.data && item.data.category) || item.category || 'Sem categoria';
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-PT'));
  });

  eleventyConfig.addNunjucksFilter('tagCounts', (articles) => {
    if (!Array.isArray(articles)) return [];
    const counts = new Map();
    for (const article of articles) {
      const tags = article.data && article.data.tags;
      if (!Array.isArray(tags)) continue;
      for (const tag of tags) {
        if (!tag) continue;
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pt-PT'));
  });

  eleventyConfig.addNunjucksFilter('filterByTag', (items, tag) => {
    if (!Array.isArray(items) || !tag) return [];
    return items.filter(
      (item) => Array.isArray(item.data.tags) && item.data.tags.includes(tag)
    );
  });

  eleventyConfig.addNunjucksFilter('relatedArticles', (slugs, articles) => {
    if (!Array.isArray(slugs) || !Array.isArray(articles)) return [];
    return articles.filter(
      (article) =>
        slugs.includes(article.data.slug) ||
        slugs.includes(article.fileSlug) ||
        slugs.includes(article.data.title)
    );
  });

  // Primary navigation state. "Blog" owns the whole content experience.
  eleventyConfig.addNunjucksFilter('isNavActive', (pageUrl, navUrl) => {
    if (!pageUrl) return false;
    if (navUrl === '/') {
      return (
        pageUrl === '/' ||
        BLOG_NAV_PREFIXES.some((prefix) => pageUrl.startsWith(prefix))
      );
    }
    return pageUrl === navUrl || pageUrl.startsWith(navUrl);
  });

  eleventyConfig.addNunjucksFilter('sectionMeta', (collection) => {
    return SECTIONS[collection] || { label: 'Blog', url: '/' };
  });

  // Social platforms do not render SVG previews reliably; fall back to the
  // raster brand card when a page only has a vector illustration.
  eleventyConfig.addNunjucksFilter('socialImage', (value, fallback) => {
    if (!value) return fallback;
    return /\.svg$/i.test(String(value)) ? fallback : value;
  });

  // Previous (older) / next (newer) article within the global chronological list.
  eleventyConfig.addNunjucksFilter('articleNeighbours', (url, articles) => {
    const list = Array.isArray(articles) ? articles : [];
    const index = list.findIndex((article) => article.url === url);
    if (index < 0) return { previous: null, next: null };
    return {
      previous: list[index + 1] || null,
      next: list[index - 1] || null,
    };
  });

  // ---------------------------------------------------------------------------
  // Base-path transform: rewrite root-relative URLs in generated HTML
  // ---------------------------------------------------------------------------
  const HTML_URL_ATTRIBUTES = /(href|src|poster|srcset)=([\"'])([^\"']*)\2/g;
  const RESERVED_PREFIXES = ['/blog/', '//', '#', 'data:', 'mailto:', 'tel:'];

  function isExternal(value) {
    return (
      RESERVED_PREFIXES.some((prefix) => value.startsWith(prefix)) ||
      /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)
    );
  }

  eleventyConfig.addTransform('base-path-links', (content, outputPath) => {
    if (!outputPath || !outputPath.endsWith('.html')) return content;
    return content.replace(HTML_URL_ATTRIBUTES, (match, attr, quote, value) => {
      if (!value.startsWith('/') || isExternal(value)) return match;
      const prefixed = PATH_PREFIX.replace(/\/$/, '') + value;
      return `${attr}=${quote}${prefixed}${quote}`;
    });
  });

  // ---------------------------------------------------------------------------
  // Collections
  // ---------------------------------------------------------------------------
  const ARTICLE_COLLECTIONS = /^\.\/src\/content\/(journal|ai-research|academy)\//;

  // Artigos com front matter `draft: true` são excluídos das coleções públicas
  // (rascunhos do CMS do Decap). Autores não usam este campo.
  function isPublished(page) {
    return !page.data || page.data.draft !== true;
  }

  eleventyConfig.addCollection('journal', (api) =>
    api.getFilteredByGlob('./src/content/journal/*.md').filter(isPublished)
  );
  eleventyConfig.addCollection('ai-research', (api) =>
    api.getFilteredByGlob('./src/content/ai-research/*.md').filter(isPublished)
  );
  eleventyConfig.addCollection('academy', (api) =>
    api.getFilteredByGlob('./src/content/academy/*.md').filter(isPublished)
  );
  eleventyConfig.addCollection('authors', (api) => api.getFilteredByGlob('./src/content/authors/*.md'));

  // Automatic "tags" collection is unavailable in this setup; build it explicitly
  // from published articles only (drafts must not leak into /tags/).
  eleventyConfig.addCollection('tags', (api) => {
    const seen = new Map();
    for (const page of api.getAll()) {
      if (!isPublished(page)) continue;
      if (!page.inputPath || !ARTICLE_COLLECTIONS.test(page.inputPath)) continue;
      const tags = page.data && page.data.tags;
      if (!Array.isArray(tags)) continue;
      for (const tag of tags) {
        if (!tag || seen.has(tag)) continue;
        seen.set(tag, tag);
      }
    }
    return [...seen.keys()];
  });

  eleventyConfig.addCollection('articles', (api) =>
    api
      .getAll()
      .filter((page) => page.inputPath && ARTICLE_COLLECTIONS.test(page.inputPath))
      .filter(isPublished)
      .sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate))
  );

  eleventyConfig.addCollection('sitePages', (api) =>
    api
      .getAll()
      .filter(
        (page) =>
          page.inputPath &&
          page.inputPath.startsWith('./src/pages/') &&
          !/(feed|sitemap|search-index|tags)\.(njk|js|11ty\.js)$/.test(page.inputPath)
      )
  );

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data',
    },
    pathPrefix: PATH_PREFIX,
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    templateFormats: ['md', 'njk', 'html', 'xml', '11ty.js'],
  };
}
