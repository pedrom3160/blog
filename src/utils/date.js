// Date utilities (ported from the original Astro implementation).

export function getFormattedDate(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getISODate(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function getReadingTime(content, wpm = 200) {
  const wordCount = content.split(/\s+/).filter((word) => word.length > 0).length;
  const minutes = Math.ceil(wordCount / wpm);
  return minutes < 1 ? '1 min' : `${minutes} min`;
}

export function formatRelativeDate(date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semana(s)`;
  if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} mês(es)`;
  return `Há ${Math.floor(diffDays / 365)} ano(s)`;
}
