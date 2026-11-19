// Suggestions page configuration.
//
// The page works without any backend: the form prepares a prefilled public
// GitHub issue and never claims a submission succeeded. To collect suggestions
// privately instead, set `endpoint` to a CORS-enabled form service URL and
// update `endpointProvider` with its name so the privacy notice stays accurate.
// See docs/SUGGESTIONS.md before enabling one.

const endpoint = ''; // e.g. 'https://formspree.io/f/xxxxxxxx'
const endpointProvider = ''; // e.g. 'Formspree'

export default {
  repo: 'pedrom3160/blog',
  endpoint,
  endpointProvider,
  lastReviewed: '2026-11-19',
  categories: [
    {
      id: 'ideas',
      title: 'Ideias & Funcionalidades',
      description: 'Novas funcionalidades, ferramentas ou capacidades que façam sentido para o projeto.',
    },
    {
      id: 'naming',
      title: 'Nomenclatura',
      description: 'Nomes para projetos, modelos, ferramentas ou para o próprio ecossistema.',
    },
    {
      id: 'design',
      title: 'Design & UX',
      description: 'Ideias para tornar a experiência mais clara, rápida e agradável.',
    },
    {
      id: 'feedback',
      title: 'Feedback',
      description: 'O que funciona, o que não funciona e o que poderia ser melhor.',
    },
    {
      id: 'other',
      title: 'Outras sugestões',
      description: 'Qualquer outra ideia que possa ajudar o GPTCLONE a evoluir.',
    },
  ],
};
