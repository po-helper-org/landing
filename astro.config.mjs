import { defineConfig } from 'astro/config';

// Подсайт живёт на своём поддомене po-system.aleksishmanov.ru (ADR 0007 основного репозитория).
export default defineConfig({
  site: 'https://po-system.aleksishmanov.ru',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
