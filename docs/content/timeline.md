# Как добавить событие

1. При необходимости создайте эпоху в lore с kind: era.
2. Создайте `src/content/timeline/<locale>/<entryKey>.md`.
3. Заполните отображаемую дату dateLabel и числовой порядок orderKey.
4. Добавьте участников из characters и смысловые связи через related.
5. Выполните `npm run check`; после одобрения снимите draft у канона.

Пример: `src/content/timeline/ru/demo-event.md`.

```yaml
locale: ru
entryKey: demo-event
translationKey: demo-event
title: 'DEMO: Тестовое событие'
summary: 'Тестовая запись события, не канон NAITMOR.'
draft: true
demo: true
dateLabel: 'Условный первый день'
orderKey: 0
era: ru/demo-era
participants:
  - ru/demo-character-alpha
  - ru/demo-character-beta
importance: minor
related:
  music: [ru/demo-album]
```

Не преобразуйте фантазийную дату в произвольную реальную календарную дату:
dateLabel отвечает за представление, orderKey — за порядок.
Для диапазона можно добавить endOrderKey, не меньший orderKey.
Одинаковый orderKey допустим для одновременных событий; сортировка стабилизируется по ID.

Эпоха необязательна. Если она задана, ссылка должна вести на lore с kind: era.
Все участники и связи принадлежат тому же языку. Реальное событие создаётся
отдельной записью с авторскими данными, без превращения DEMO в канон.

[Поля события и эпохи](schemas.md).
