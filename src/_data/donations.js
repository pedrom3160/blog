// ---------------------------------------------------------------------------
// Donation configuration point
// ---------------------------------------------------------------------------
// This project does not invent payment endpoints. Until a legitimate channel is
// configured here, the /donations/ page renders an explicit "no active channels"
// state instead of a broken or fake button.
//
// To enable support channels, add entries to `channels` using this schema:
//
//   {
//     label: 'GitHub Sponsors',              // required, shown to visitors
//     description: 'Apoio recorrente ...',   // required, one short sentence
//     url: 'https://github.com/sponsors/...',// required, https:// only
//     type: 'recurring' | 'one-off',         // optional
//   }
//
// Rules:
// - Only publish channels that you control and can verify.
// - Never add card numbers, IBANs, wallet addresses or unverified links here.
// - Keep this file free of secrets.
// ---------------------------------------------------------------------------
export default {
  channels: [],
  // Human-readable status shown as a footnote on the page.
  status: 'not-configured',
  lastReviewed: '2026-11-19',
};
