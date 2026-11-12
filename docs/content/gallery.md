# Как добавить арт

1. Создайте метаданные в `src/content/gallery/<locale>/<entryKey>.json`, YAML или Markdown.
2. Заполните общие поля, kind и непустой массив creators.
3. Когда появится утверждённое изображение, поместите его отдельно в
   `src/assets/images/gallery/` и задайте image.src и локализованный image.alt.
4. При необходимости укажите credit, createdOn, medium, focalPoint и related.
5. Проверьте запись командой `npm run check`. До готовности изображения сохраняйте draft.

Текущий пример — только DEMO-метаданные без файла изображения:

```json
{
  "locale": "ru",
  "entryKey": "demo-artwork",
  "translationKey": "demo-artwork",
  "title": "DEMO: Тестовая карточка арта",
  "summary": "Тестовые метаданные, не канон NAITMOR.",
  "draft": true,
  "demo": true,
  "kind": "concept",
  "creators": [{ "name": "DEMO" }]
}
```

Готовый пример: `src/content/gallery/ru/demo-artwork.json`.
Отсутствующий файл не нужно заменять вымышленным путём. Только DEMO и черновики
могут не иметь image; опубликованный канон требует существующее изображение.

Путь image.src задаётся от корня проекта, с префиксом `src/assets/images/`.
`focalPoint.x` и `focalPoint.y` задаются в диапазоне 0–1. Проверка контролирует
наличие файла, будущий UI использует `resolveContentImage()` и компоненты Astro.
Авторство хранится в creators, локализованная подпись — в summary и основном тексте.

[Допустимые форматы и поля](schemas.md).
