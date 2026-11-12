# NAITMOR // ARCHIVE 2.0

Официальный портал авторской музыкальной дарк-фэнтези вселенной NAITMOR.

## Состояние проекта

Этап 2: техническая основа дополнена семью типизированными Content Collections,
проверкой графа связей и локализацией ru/en. Поддерживаются Markdown, MDX, JSON и YAML.
Подготовлены 20 явно помеченных DEMO-записей без канонических фактов, изображений и аудио.
Визуальный интерфейс разделов ещё не реализован; сохраняются техническая главная и 404.

## Требования

- Node.js 26.13.0: версия закреплена в `.node-version` и используется в CI.
- npm 11.x.
- Доступ к npm registry для первой установки зависимостей.

Прямые зависимости закреплены без диапазонов версий: Astro 7.4.11,
`@astrojs/check` 0.9.12, TypeScript 6.0.3. TypeScript 7 пока не входит
в поддерживаемый диапазон `@astrojs/check`. Полное дерево закреплено
в `package-lock.json`; `.npmrc` включает проверку совместимости Node.js и npm.

Для MDX используется совместимая `@astrojs/mdx` 8.1.5. Парсеры Markdown/YAML
и типы Node.js также закреплены точными версиями в package.json.

## Локальный запуск

Из корня репозитория:

```sh
npm ci
npm run dev
```

Адрес разработки с учётом базового пути:
[http://localhost:4321/NAITMOR-ARCHIVE-2.0/](http://localhost:4321/NAITMOR-ARCHIVE-2.0/).
Если порт занят, Astro выведет другой адрес в терминале.

## Команды

| Команда | Назначение |
| --- | --- |
| `npm run dev` | Запуск сервера разработки |
| `npm run check` | Валидация контента, регрессионные тесты, синхронизация Astro и проверка TypeScript |
| `npm run check:content` | Проверка схем, локалей, графа связей, текстовых ссылок и локальных медиа |
| `npm run test:content` | Регрессионные тесты валидатора и правил публикации |
| `npm run typecheck` | Псевдоним `npm run check` |
| `npm run build` | Production build в `dist/` |
| `npm run check:pages` | Проверка `site`, `base`, canonical URL и локальных ссылок собранного сайта |
| `npm run preview` | Локальный просмотр содержимого `dist/` |
| `npm run astro -- <команда>` | Вызов CLI Astro |
| `npm ls --all` | Проверка установленного дерева зависимостей |
| `npm audit --audit-level=high` | Аудит известных уязвимостей; ошибка при уровне high и выше |

Проверка готовой сборки:

```sh
npm run check
npm run build
npm run check:pages
npm run preview
```

Preview использует тот же базовый путь, что и сервер разработки.
Перед dev и build автоматически выполняется проверка контента через predev/prebuild.
Команда `check:pages` выполняется после сборки; она также проверяет наличие
локальных ресурсов, на которые ссылаются сгенерированные HTML-страницы.

## Структура

```text
.github/workflows/     Проверки и отдельная ручная публикация
docs/                  Архитектура и правила работы с контентом
public/audio/previews/ Аудиопревью, копируемые без обработки
public/fonts/          Локальные файлы шрифтов
public/icons/          Статические иконки
scripts/               Проверка сборки для GitHub Pages
src/assets/images/     Изображения для обработки при сборке
src/content/           Авторские Markdown-материалы по коллекциям
src/schemas/           Общие и предметные схемы семи коллекций
src/i18n/              Локали, словари и контракт будущих адресов
src/components/        UI, навигация, архив, музыка, галерея, атмосфера
src/config/            Общие настройки сайта
src/layouts/           Шаблоны страниц
src/lib/               Общие функции, включая базовые URL
src/pages/             Маршруты сайта
src/scripts/           Будущая клиентская интерактивность
src/styles/            Палитра и базовые стили
src/content.config.ts  Регистрация семи коллекций и файловых загрузчиков
```

Пустые каталоги сохраняются в Git через `.gitkeep`. Это технические маркеры,
а не записи контента. `node_modules/`, `.astro/` и `dist/` исключены из Git.

Подробнее: [архитектура](docs/architecture.md) и
[добавление контента](docs/content-guide.md).
Результаты этапа 2: [полный отчёт и список файлов](docs/stage-2-report.md).

Коллекции: characters, lore, timeline, music, gallery, news, dossiers.
В music релизы и треки различаются kind: release / track. Каждая запись хранится
отдельно в папке ru/ или en/. Переводы связаны translationKey без смешивания текстов.
Черновики и DEMO исключаются из production-API; коллекции сами не создают страницы.
Старые пустые events/releases/tracks/artworks сохранены, но новые записи туда не добавляются.

## GitHub Pages

В `astro.config.mjs` заданы:

```js
site: 'https://naitmorr.github.io',
base: '/NAITMOR-ARCHIVE-2.0',
output: 'static',
trailingSlash: 'always'
```

Ожидаемый адрес после будущей публикации:
[https://naitmorr.github.io/NAITMOR-ARCHIVE-2.0/](https://naitmorr.github.io/NAITMOR-ARCHIVE-2.0/).
Наличие этого адреса в документации не означает, что сайт уже опубликован.

Внутренние ссылки и пути к статическим файлам формируются через `withBase()`
из `src/lib/urls.ts`. Не следует использовать корневые пути вроде `/music/`
без префикса проекта. Импортируемые стили и изображения обрабатывает Astro.

При переименовании репозитория или подключении своего домена необходимо
согласованно обновить конфигурацию, `scripts/check-pages.mjs` и документацию.

## GitHub Actions

`check.yml` выполняется для push в `main`, pull request и ручного запуска:
`npm ci`, проверка дерева, аудит зависимостей, проверка типов, production build
и проверка URL GitHub Pages. Этот workflow не публикует сайт.
Существующие workflows не изменены: проверки контента подключены через npm-команды.

`deploy.yml` имеет только `workflow_dispatch` и допускает публикацию только
из `main`. Автоматического запуска при push или после CI нет. Сборка заново
проходит те же проверки, затем передаётся в GitHub Pages через официальный artifact.
Разрешения записи Pages и OIDC выдаются только job публикации.

Перед отдельно одобренной первой публикацией владелец должен выбрать
**Settings → Pages → Source → GitHub Actions**. Workflow не включает Pages
самостоятельно: для `actions/configure-pages` задано `enablement: false`.
Настройки удалённого репозитория на этапе 1 не изменяются.

Ручной запуск находится в **Actions → Deploy GitHub Pages manually → Run workflow**.
Он действительно публикует сайт, поэтому выполнять его следует только после
отдельного согласования выпуска. Секреты или персональный токен для стандартной
публикации этим workflow не требуются.

Документация: [Astro / TypeScript](https://docs.astro.build/en/guides/typescript/),
[Astro / GitHub Pages](https://docs.astro.build/en/guides/deploy/github/).
