// Всё, что подсайт знает о себе. Контакты и профили скопированы из основного сайта данными, общего кода с ним нет.
export const SITE = {
  origin: 'https://aleksishmanov.ru',
  name: 'po-helper-org',
  tagline: 'Экосистема для роли AI Product Owner',
  subtitle: 'Операционка для корпоративного Product Owner: методология и подключаемые виджеты автоматизации.',
  problem: 'Как построить IT-департамент, который быстро и качественно реализует пожелания бизнеса.',
  contact: { label: 'Обсудить внедрение', href: 'https://t.me/kibarik' },
  owner: { name: 'Алексей Ишманов', href: 'https://aleksishmanov.ru/about/' },
  org: 'https://github.com/po-helper-org',
};

export const PROFILES = [
  { label: 'Telegram: PO-нейробаза', href: 'https://t.me/corporate_ai' },
  { label: 'Telegram: Aleks for PMF', href: 'https://t.me/ai_pmf' },
  { label: 'Telegram: OSS-обзоры', href: 'https://t.me/ai_ossresearch' },
  { label: 'GitHub организации', href: 'https://github.com/po-helper-org' },
];

/** Адрес внутри подсайта с учётом префикса. */
export const href = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;
