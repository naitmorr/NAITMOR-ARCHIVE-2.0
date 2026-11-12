# Как опубликовать новость

1. Создайте `src/content/news/<locale>/<entryKey>.md` или `.mdx`.
2. Заполните общие поля, publishedAt и текст публикации. Начинайте с draft: true.
3. При необходимости добавьте author, cover, featured и related.
4. Выполните `npm run check` и `npm run build`.
5. После редакционного одобрения канонической новости снимите draft.
6. Включите материал в отдельно согласованный выпуск сайта.

```yaml
locale: ru
entryKey: demo-news
translationKey: demo-news
title: 'DEMO: Тестовая публикация'
summary: 'Тестовая публикация, не канон NAITMOR.'
draft: true
demo: true
publishedAt: '2026-11-11T12:00:00+03:00'
author: DEMO
related:
  music: [ru/demo-album]
```

Примеры: `src/content/news/ru/demo-news.md` и `src/content/news/en/demo-news.mdx`.
В MDX-примере используется статический aside без программной логики.

publishedAt требует дату, время и часовой пояс. updatedAt, если задан,
не должен быть раньше publishedAt. Дата является метаданными: будущая дата
не скрывает автоматически запись с draft: false. Для отложенного выпуска сохраняйте draft.

demo: true исключает тестовую публикацию из production независимо от draft.
Редактирование исходников и снятие draft не запускают публикацию автоматически:
workflow по-прежнему имеет только ручной запуск.
