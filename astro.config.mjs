import { defineConfig } from 'astro/config';

// Подсайт живёт под префиксом: хостинг отдаёт его на aleksishmanov.ru/po-system/ (ADR 0007 основного репозитория).
export default defineConfig({
  site: 'https://aleksishmanov.ru',
  base: '/po-system',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
