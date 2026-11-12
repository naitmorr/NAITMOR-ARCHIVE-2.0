# Как добавить персонажа

1. Выберите язык и новый стабильный entryKey.
2. Создайте `src/content/characters/<locale>/<entryKey>.md`.
3. Заполните общие поля и паспорт. Начинайте с `draft: true`.
4. Добавьте основной текст на одном языке.
5. Укажите существующие связи того же языка и выполните `npm run check`.
6. После редакционного одобрения канонической записи отключите draft.

Проверяемый пример: `src/content/characters/ru/demo-character-alpha.md`.
Его связь с Бетой является тестовой и не описывает канон NAITMOR.

```yaml
locale: ru
entryKey: demo-character-alpha
translationKey: demo-character-alpha
title: 'DEMO: Тестовый персонаж Альфа'
summary: 'Тестовая запись, не канон NAITMOR.'
draft: true
demo: true
inWorldStatus: unknown
relationships:
  - character: ru/demo-character-beta
    kind: other
    description: 'Условная тестовая связь.'
related:
  timeline: [ru/demo-event]
  music: [ru/demo-album]
```

Это frontmatter, он помещается между строками `---`; после него требуется текст.
Для реального материала создавайте новый ключ и авторский текст, не снимайте
DEMO-маркировку с примера. Неизвестные титулы, даты и происхождение можно не указывать.

`aliases` хранит имена в исходном написании; `titles`, `species`, `affiliations`
и описания связей локализованы. `portrait` необязателен: не указывайте отсутствующий файл.
Связь не дописывается автоматически в обратную сторону — если обратное описание
важно для канона, задайте его в другой записи явно.

Все поля и ограничения описаны в [справочнике](schemas.md).
