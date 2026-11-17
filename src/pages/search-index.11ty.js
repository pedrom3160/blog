export const data = {
  permalink: '/search-index.json',
};

function absolute(path) {
  const base = 'https://pedrom3160.github.io/blog/';
  if (!path) return base;
  return base + path.replace(/^\//, '');
}

export default function (data) {
  const items = [];

  for (const article of data.collections.articles) {
    items.push({
      type: 'article',
      title: article.data.title,
      description: article.data.description,
      url: absolute(article.url),
      date: article.data.pubDate,
      category: article.data.category,
      tags: article.data.tags || [],
    });
  }

  for (const doc of data.pdfLibrary.documents) {
    items.push({
      type: 'pdf',
      title: doc.title,
      description: doc.description,
      url: absolute(doc.downloadUrl || '/pdf-library/'),
      category: doc.category,
      tags: doc.tags || [],
    });
  }

  for (const audio of data.audiobookLibrary.audiobooks) {
    items.push({
      type: 'audiobook',
      title: audio.title,
      description: audio.description,
      url: absolute('/audiobook-library/'),
      category: audio.category,
      tags: audio.tags || [],
    });
  }

  return JSON.stringify(
    {
      generated: new Date().toISOString(),
      count: items.length,
      items,
    },
    null,
    2
  );
}
