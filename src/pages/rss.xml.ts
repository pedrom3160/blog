import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getFormattedDate } from '../utils/date';

export async function get(context: any) {
  const journal = await getCollection('journal');
  const aiResearch = await getCollection('ai-research');
  const academy = await getCollection('academy');
  const allArticles = [...journal, ...aiResearch, ...academy].sort(
    (a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
  );

  return rss({
    title: 'GPTCLONE Blog',
    description: 'Conhecimento, investigação, educação e diário de projeto - GPTCLONE',
    site: context.site || 'https://pedrom3160.github.io/blog/',
    items: allArticles.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: new Date(entry.data.pubDate),
      link: `/${entry.collection}/${entry.id}/`,
      author: entry.data.author,
      categories: entry.data.tags || [],
    })),
    customData: `<language>pt-PT</language>`,
  });
}