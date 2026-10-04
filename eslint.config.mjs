import { eslintConfig } from '@maxigarcia/eslint-config';

export default eslintConfig(
  {
    typescript: true,
    markdown: true,
    astro: true,
    tailwindcss: true,
  },
  {
    ignores: [
      'packages/**/dist/**',
      'packages/**/node_modules/**',
      'packages/**/.astro/**',
    ],
  },
);
