import markdownIt from 'markdown-it';

const PATH_PREFIX = '/blog/';
const SITE_URL = 'https://pedrom3160.github.io/blog/';

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
  }).enable(['table', 'strikethrough']);
  eleventyConfig.setLibrary('md', md);

  // ---------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------
  eleventyConfig.addNunjucksFilter('absoluteUrl', (value) => {
    if (!value) return SITE_URL;
    return SITE_URL + value.replace(/^\//, '');
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

  // ---------------------------------------------------------------------------
  // Base-path transform: rewrite root-relative URLs in generated HTML
  // ---------------------------------------------------------------------------
  const HTML_URL_ATTRIBUTES = /(href|src|poster|srcset)=(["'])([^"']*)\2/g;
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
