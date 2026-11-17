export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'article' | 'pdf' | 'audiobook';
}

export function searchContent(
  articles: Array<{ id: string; title: string; description: string; url: string }>,
  query: string
): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return articles.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
  ).map((item) => ({ ...item, type: 'article' as const }));
}

export function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}