# Отчёт: контентная архитектура, этап 2

Дата: 11 ноября 2026 года. Этап реализован локально поверх сохранённого этапа 1.

## Архитектура

| Коллекция | Схема | Записей DEMO |
| --- | --- | --- |
| characters | Паспорт, псевдонимы, титулы, статус мира, портрет, отношения | 4 |
| lore | История, мир, места, фракции, артефакты, понятия и эпохи; родительская иерархия | 4 |
| timeline | Авторская дата, числовая сортировка, диапазон, эпоха, участники, важность | 2 |
| music | Discriminated union release/track; формат релиза, треклист, длительности, площадки и авторство | 4 |
| gallery | Вид арта, авторы, изображение, дата создания и техника | 2 |
| news | Дата публикации с часовым поясом, автор, обложка, featured | 2 |
| dossiers | Архивный шифр, сюжетная классификация, обнаружение, спойлеры и подсказки | 2 |

Всего 20 DEMO-записей: по 10 на русский и английский язык. Названия, ключи и demo-флаг явно обозначают их тестовый статус. Биографии реальных персонажей NAITMOR, канонические факты и реальные медиа не добавлены.

Схемы общие для Astro и самостоятельного валидатора, с запретом неизвестных полей. Файловые glob-загрузчики читают Markdown, MDX, JSON и YAML. Один файл данных соответствует одной записи. ID имеет вид locale/entryKey.

Ссылки типизированы как { collection, id }. Проверяются существование цели, язык, допустимый музыкальный подтип, эпоха, уникальность, невозможность ссылок канона на DEMO, публикации на черновики и отсутствие циклов родительского лора.

Семантические ссылки в тексте используют content:collection/locale/entryKey, при необходимости с якорем. Проверяются также относительные ссылки на записи и локальные заголовки. Отдельный будущий слой отображения должен преобразовать семантическую ссылку в обычный URL.

Локализация: отдельные ru/en-записи, общий translationKey, полные типизированные словари интерфейса, отсутствие подстановки перевода другого языка. Native Astro i18n подготовлен: русский без префикса, английский /en/ внутри прежнего base.

Production API исключает draft и demo независимо друг от друга. Preview отделён. Каталог скрывает unlisted-досье, общий поиск исключает всю коллекцию dossiers. Маршруты контентных материалов на этом этапе не создавались.

## Документация

- docs/content-guide.md: общий процесс, форматы, связи, медиа и проверки.
- docs/content/schemas.md: подробный справочник всех полей.
- docs/content/characters.md: добавление персонажа.
- docs/content/music.md: добавление альбома и трека.
- docs/content/timeline.md: добавление события.
- docs/content/gallery.md: добавление арта.
- docs/content/news.md: выпуск новости.
- docs/content/dossiers.md: оформление секретного досье.
- docs/content/localization.md: создание и проверка переводов.
- docs/architecture.md и README.md обновлены под состояние этапа 2.

## Проверки

| Проверка | Результат |
| --- | --- |
| npm run check:content | 20 записей, 7 коллекций, 8 текстовых ссылок, 0 ошибок |
| Регрессионные тесты | 15 из 15 пройдены, включая негативные сценарии |
| Astro / TypeScript | 29 файлов: 0 ошибок, предупреждений и подсказок |
| npm run build | Успешно; сохранены техническая главная и 404 |
| npm run check:pages | 2 HTML-файла, 3 внутренних ссылки/ресурса; правильные site/base/canonical |
| Фактическое хранилище Astro | Все 20 записей присутствуют, включая JSON/YAML/MDX |
| Production HTML | DEMO-тексты и идентификаторы не обнаружены |
| npm ls --all | Дерево зависимостей без конфликтов |
| npm audit --json | 0 известных уязвимостей |
| Локальные ссылки документации | 16 ссылок, все цели существуют |
| git diff --check | Успешно при существующих настройках Git |
| Сохранность прежних файлов | Все 57 ранее отслеживаемых файлов присутствуют |

В сценариях ошибок проверены смешанные поля локалей, маркировка DEMO, неверные даты и варианты музыки, дубли позиций, отсутствующие цели, ссылки между языками, циклы, неверные типы целей, черновики, отсутствующие якоря и медиа, исполняемый MDX.

Контентная проверка запускается автоматически через predev/prebuild; npm run check также выполняет тесты и Astro check. Поэтому существующие workflows получили проверки через прежние npm-команды без изменения YAML.

## Зависимости и конфигурация

Astro 7.4.11, TypeScript 6.0.3 и @astrojs/check 0.9.12 сохранены.
Добавлены точные версии: @astrojs/mdx 8.1.5, yaml 2.9.1, unified 11.0.5, remark-parse 11.0.0, remark-mdx 3.1.1, github-slugger 2.0.0; для служебных TypeScript-скриптов — @types/node 26.6.6.
В astro.config.mjs добавлены только MDX и i18n. GitHub Pages site/base/output/trailingSlash сохранены; strict-настройки TypeScript и версия Node.js не изменены.

## Обнаруженные ограничения

- Функциональных ошибок после проверок не осталось.
- Контроль языка проверяет структуру локализации и письменность, но не качество перевода и не определяет язык семантически. Имена авторов/исполнителей и псевдонимы сохраняют исходное написание.
- Внешние HTTPS URL проверяются по синтаксису, ссылки площадок также по домену. Сетевые запросы к сервисам не выполняются; в текущих DEMO внешних ссылок нет.
- Изображения и аудио отсутствуют по заданию. Проверено отклонение отсутствующих файлов; реальная оптимизация медиа будет проверяться после их добавления.
- CLASSIFIED — сюжетный архив без настоящей защиты доступа. Черновики и DEMO видны в исходном публичном репозитории.
- Существующая настройка Git предупреждает о будущей нормализации некоторых LF-файлов в CRLF; настройки Git не изменялись.
- Интерфейс материалов, отображение переводов и конвертация content:-ссылок в HTML относятся к следующему этапу.

## Созданные файлы (48)

- `docs/content/characters.md`
- `docs/content/dossiers.md`
- `docs/content/gallery.md`
- `docs/content/localization.md`
- `docs/content/music.md`
- `docs/content/news.md`
- `docs/content/schemas.md`
- `docs/content/timeline.md`
- `docs/stage-2-report.md`
- `scripts/check-content.ts`
- `scripts/content.test.ts`
- `src/content/characters/en/demo-character-alpha.md`
- `src/content/characters/en/demo-character-beta.md`
- `src/content/characters/ru/demo-character-alpha.md`
- `src/content/characters/ru/demo-character-beta.md`
- `src/content/dossiers/en/demo-dossier.md`
- `src/content/dossiers/ru/demo-dossier.md`
- `src/content/gallery/en/demo-artwork.yaml`
- `src/content/gallery/ru/demo-artwork.json`
- `src/content/lore/en/demo-concept.md`
- `src/content/lore/en/demo-era.md`
- `src/content/lore/ru/demo-concept.md`
- `src/content/lore/ru/demo-era.md`
- `src/content/music/en/demo-album.md`
- `src/content/music/en/demo-track.json`
- `src/content/music/ru/demo-album.md`
- `src/content/music/ru/demo-track.yaml`
- `src/content/news/en/demo-news.mdx`
- `src/content/news/ru/demo-news.md`
- `src/content/timeline/en/demo-event.md`
- `src/content/timeline/ru/demo-event.md`
- `src/i18n/config.ts`
- `src/i18n/messages.ts`
- `src/i18n/routes.ts`
- `src/lib/content-policy.ts`
- `src/lib/content-source.ts`
- `src/lib/content-validation.ts`
- `src/lib/content.ts`
- `src/lib/media.ts`
- `src/schemas/characters.ts`
- `src/schemas/common.ts`
- `src/schemas/dossiers.ts`
- `src/schemas/gallery.ts`
- `src/schemas/index.ts`
- `src/schemas/lore.ts`
- `src/schemas/music.ts`
- `src/schemas/news.ts`
- `src/schemas/timeline.ts`

## Изменённые файлы (7)

- `README.md`
- `astro.config.mjs`
- `docs/architecture.md`
- `docs/content-guide.md`
- `package-lock.json`
- `package.json`
- `src/content.config.ts`

## Состояние Git и публикации

Существующие workflows, визуальные страницы и HTML-layout не изменены. Файлы и старые каталоги не удалялись. Commit, push и публикация не выполнялись. Этап визуального интерфейса не начат.

