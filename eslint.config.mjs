import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

const eslintConfig = [
  { ignores: ['.next/', 'node_modules/', 'out/'] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // This is prose-heavy marketing copy; raw apostrophes and quotes in
      // JSX text are fine and render correctly. The rule only adds noise.
      'react/no-unescaped-entities': 'off',
    },
  },
]

export default eslintConfig
