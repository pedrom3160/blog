import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogEntry = CollectionEntry<'journal' | 'ai-research' | 'academy'>;

export async function getAllArticles() {
  const journal = await getCollection('journal');
  const aiResearch = await getCollection('ai-research');
  const academy = await getCollection('academy');
  return [...journal, ...aiResearch, ...academy];
}

export async function getArticlesByCollection(collection: string) {
  return await getCollection(collection as any);
}

export function getUniqueTags(entries: BlogEntry[]): string[] {
  const tags = new Set<string>();
  entries.forEach((entry) => {
    entry.data.tags?.forEach((tag: string) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

export function getUniqueCategories(entries: BlogEntry[]): string[] {
  const categories = new Set<string>();
  entries.forEach((entry) => {
    if (entry.data.category) categories.add(entry.data.category);
  });
  return Array.from(categories).sort();
}

export function filterByTag(entries: BlogEntry[], tag: string): BlogEntry[] {
  return entries.filter((entry) => entry.data.tags?.includes(tag));
}

export function filterByCategory(entries: BlogEntry[], category: string): BlogEntry[] {
  return entries.filter((entry) => entry.data.category === category);
}

export function sortByDateDesc(entries: BlogEntry[]): BlogEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
  );
}

export function searchArticles(entries: BlogEntry[], query: string): BlogEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return entries;

  return entries.filter((entry) => {
    const { title, description, tags, category } = entry.data;
    const content = entry.body.toLowerCase();
    return (
      title.toLowerCase().includes(q) ||
      description.toLowerCase().includes(q) ||
      content.includes(q) ||
      tags?.some((t: string) => t.toLowerCase().includes(q)) ||
      category?.toLowerCase().includes(q)
    );
  });
}