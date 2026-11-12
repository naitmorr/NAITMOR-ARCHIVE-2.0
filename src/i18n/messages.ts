import type { Locale } from './config.ts';

const ru = {
  home: 'Главная',
  characters: 'Персонажи',
  lore: 'Лор',
  timeline: 'Хронология',
  music: 'Музыка',
  gallery: 'Галерея',
  news: 'Новости',
  dossiers: 'Секретные досье',
  translationUnavailable: 'Перевод пока недоступен',
  demoNotice: 'DEMO: тестовые данные, не канон NAITMOR',
};

type MessageKey = keyof typeof ru;
const en: Record<MessageKey, string> = {
  home: 'Home',
  characters: 'Characters',
  lore: 'Lore',
  timeline: 'Timeline',
  music: 'Music',
  gallery: 'Gallery',
  news: 'News',
  dossiers: 'Classified dossiers',
  translationUnavailable: 'Translation is not available yet',
  demoNotice: 'DEMO: test data, not NAITMOR canon',
};

const messages: Record<Locale, Record<MessageKey, string>> = { ru, en };

export function translate(locale: Locale, key: MessageKey): string {
  return messages[locale][key];
}
