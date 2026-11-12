# Как оформить секретное досье

CLASSIFIED — публичный сюжетный архив. Поля классификации и обнаружения
не обеспечивают реальную защиту доступа.

1. Создайте `src/content/dossiers/<locale>/<entryKey>.md`.
2. Заполните общие поля и уникальный внутри языка archiveCode.
3. Выберите classification и discovery, при необходимости задайте unlockHint.
4. Добавьте основной текст на одном языке и существующие связи.
5. Выполните `npm run check`; выпуск канона согласуется так же, как для остальных материалов.

```yaml
locale: ru
entryKey: demo-dossier
translationKey: demo-dossier
title: 'DEMO: Тестовое секретное досье'
summary: 'Тестовое досье, не канон NAITMOR.'
draft: true
demo: true
archiveCode: DEMO-001
classification: classified
discovery: unlisted
spoiler: true
unlockHint: 'Условная сюжетная подсказка.'
related:
  characters: [ru/demo-character-alpha]
  timeline: [ru/demo-event]
```

Пример: `src/content/dossiers/ru/demo-dossier.md`.
classification: classified / redacted / fragment. discovery: listed / unlisted.
По умолчанию досье unlisted: его не возвращает getCatalogEntries().
Общий поисковый API исключает всю коллекцию dossiers. Опубликованная запись
может быть доступна по прямой ссылке через будущий маршрут, даже будучи unlisted.

Не помещайте в досье пароли, ключи или реальные конфиденциальные материалы:
исходный репозиторий публичный, а сюжетная маркировка не скрывает статические файлы.
Пример DEMO всегда остаётся тестовым; для канонического досье нужна новая запись.
