// Search utilities (ported from the original Astro implementation).

export function searchContent(articles, query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return articles
    .filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    )
    .map((item) => ({ ...item, type: item.type || 'article' }));
}

export function highlightMatch(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
