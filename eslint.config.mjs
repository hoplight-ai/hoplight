// Minimal flat config. Added 2026-09-16 (review-squad fix lane: expert-nextjs-vercel.md #5, no
// lint step existed anywhere). eslint-config-next@16.3.5 matches the installed Next major
// (package.json pins next@^16.3.5). Imported directly rather than through FlatCompat +
// 'next/core-web-vitals': that legacy-name path threw "Converting circular structure to JSON"
// under eslint-config-next@16.3.5 / ESLint 9 here, because eslint-config-next now ships its own
// flat-config arrays (dist/core-web-vitals.js, dist/typescript.js) meant to be imported directly.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      '.next/**',
      '.next-old/**',
      '.remember/**',
      'node_modules/**',
      'public/**',
      '.githooks/**',
    ],
  },
];

export default eslintConfig;
