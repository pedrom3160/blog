// Suggestions page configuration.
//
// Default: no backend. The form prepares a prefilled public GitHub issue and
// never claims a submission succeeded. Visitors need a GitHub account.
//
// Preferred anonymous mode: set WEB3FORMS_ACCESS_KEY at build time (a public
// Web3Forms form key, not a secret). The form then POSTs JSON to Web3Forms,
// which emails the submission to the project owner. The GitHub issue remains
// available as a public fallback. The key is visible in the built HTML by
// design; do not put a private API token here.
//
// Generic endpoint mode remains available for another CORS form provider.
// See docs/SUGGESTIONS.md before enabling either mode.

const web3formsAccessKey = String(process.env.WEB3FORMS_ACCESS_KEY || '').trim();
const web3formsEndpoint = 'https://api.web3forms.com/submit';
const web3formsPrivacyUrl = 'https://web3forms.com/privacy';

const endpoint = ''; // e.g. 'https://formspree.io/f/xxxxxxxx'
const endpointProvider = ''; // e.g. 'Formspree'

const mode = web3formsAccessKey ? 'web3forms' : endpoint ? 'endpoint' : 'github';
const provider = mode === 'web3forms' ? 'Web3Forms' : mode === 'endpoint' ? endpointProvider : '';

export default {
  repo: 'pedrom3160/blog',
  endpoint,
  endpointProvider,
  submission: {
    mode,
    provider,
    endpoint: mode === 'web3forms' ? web3formsEndpoint : endpoint,
    accessKey: mode === 'web3forms' ? web3formsAccessKey : '',
    privacyUrl: mode === 'web3forms' ? web3formsPrivacyUrl : '',
  },
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
