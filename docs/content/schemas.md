# Справочник схем

Все объекты строгие: неизвестное поле считается ошибкой. Текстовые поля после
обрезки пробелов содержат 1–500 символов, если не указан другой диапазон.
Знак `?` означает необязательное поле. Массивы без другого указания пусты по умолчанию.

## Общие поля всех коллекций

| Поле | Тип и правило |
| --- | --- |
| `locale` | `ru` или `en`; совпадает с каталогом |
| `entryKey` | 1–100 символов: строчная латиница, цифры и одиночные дефисы |
| `translationKey` | Такой же формат; уникален внутри коллекции и языка |
| `title`, `summary` | Обязательный локализованный текст |
| `draft` | Boolean; по умолчанию `true` |
| `demo` | Boolean; по умолчанию `false` |
| `tags` | До 30 уникальных машинных ключей в формате entryKey |
| `updatedAt?` | ISO datetime с часовым поясом |
| `seo?` | `title?`, `description?`, `noindex` (по умолчанию false) |
| `related` | Массивы ссылок `characters`, `lore`, `timeline`, `music`, `gallery`, `news`, `dossiers` |

Локализованные поля не объединяют русскую и английскую версии в одном объекте.
Латинские технические ключи, DEMO, NAITMOR, CLASSIFIED, EP, ISRC допустимы.
Имена авторов, исполнителей и псевдонимы сохраняют оригинальное написание.

## Персонажи: characters

| Поле | Тип и правило |
| --- | --- |
| `aliases` | До 30 псевдонимов; допускается оригинальное написание имени |
| `titles` | До 20 локализованных титулов |
| `species?` | Локализованное описание типа сущности |
| `affiliations` | До 20 локализованных названий принадлежности |
| `inWorldStatus` | unknown / alive / dead / missing / other; default unknown |
| `portrait?` | Объект изображения |
| `lifespan?` | `birthLabel?`, `deathLabel?`: авторские даты мира |
| `relationships` | До 100 объектов: character (ссылка), kind, description? |
| `relationships.kind` | ally / opponent / family / other |

Основной Markdown-текст хранит описание персонажа. Статус внутри мира не связан с draft.

## Лор: lore

| Поле | Тип и правило |
| --- | --- |
| `kind` | history / world / location / faction / artifact / concept / era |
| `parent?` | Ссылка на lore в том же языке; циклы запрещены |
| `cover?` | Изображение |
| `order?` | Целое число для редакционной сортировки |

Для новой статьи создайте `lore/<locale>/<entryKey>.md` с общими полями, kind
и основным текстом. Статьи эпох имеют `kind: era`; на них ссылаются события.

## Хронология: timeline

| Поле | Тип и правило |
| --- | --- |
| `dateLabel` | Локализованная дата фантазийного мира |
| `orderKey` | Конечное число для сортировки, включая отрицательные значения |
| `endOrderKey?` | Конечное число, не меньше orderKey |
| `era?` | Ссылка на lore с kind: era |
| `participants` | До 100 ссылок на characters |
| `importance` | minor / major / turning-point; default minor |

## Музыка: music

Общие музыкальные поля: `kind`, `artist`, `genres` (до 20), `platformLinks`
(до 20), `credits` (до 100 объектов с name и локализованным role).

При `kind: release`:

| Поле | Тип и правило |
| --- | --- |
| `format` | album / ep / single / compilation |
| `releaseStatus` | announced / released |
| `releaseDate?` | Реальная календарная дата YYYY-MM-DD; обязательна для released |
| `cover?` | Изображение |
| `catalogNumber?` | 2–50 символов: A–Z, 0–9, точка, дефис, подчёркивание |
| `tracklist` | До 500 объектов: track (ссылка на music kind: track), disc, position |
| `disc`, `position` | Положительные целые числа; disc default 1 |

В released требуется непустой треклист. Позиции в пределах диска уникальны.
Один трек может входить в несколько релизов. Полная длительность вычисляется
из длительностей треков; она не дублируется в данных релиза.

При `kind: track`:

| Поле | Тип и правило |
| --- | --- |
| `version?` | Локализованное обозначение версии записи |
| `durationSeconds?` | Целое число 1–86400; обязательно для опубликованного канона |
| `isrc?` | 12 символов стандартной структуры: 2 буквы, 3 буквенно-цифровых, 7 цифр |
| `audio?` | src и mime аудиопревью |
| `lyrics?` | 1–50000 символов на языке записи |

Поля релиза недопустимы в треке и наоборот. Основной текст — описание релиза
или комментарий к треку. Другая запись или ремикс получает отдельный entryKey.

## Галерея: gallery

| Поле | Тип и правило |
| --- | --- |
| `kind` | illustration / portrait / concept / cover / other |
| `image?` | Обязательно для опубликованного канона; DEMO может быть только метаданными |
| `creators` | 1–20 объектов с name и необязательным HTTPS url |
| `createdOn?` | YYYY-MM-DD |
| `medium?` | Локализованное описание техники |

## Новости: news

`publishedAt` обязателен: ISO datetime с часовым поясом.
`author?` — имя автора, `cover?` — изображение, `featured` — boolean с default false.
Если updatedAt задан, он не должен предшествовать publishedAt.
Дата публикации не включает автоматическое расписание.

## Досье: dossiers

`archiveCode` обязателен, до 60 символов: группы A–Z и 0–9 через дефисы;
код уникален внутри языка. `classification`: classified / redacted / fragment,
по умолчанию classified. `discovery`: listed / unlisted, по умолчанию unlisted.
`spoiler`: boolean, default true. `unlockHint?` — локализованная сюжетная подсказка.
Настройки обозначают сюжетную подачу и обнаружение, не защиту доступа.

## Медиа и площадки

Изображение: `src`, `alt`, необязательные `credit` и `focalPoint: { x, y }`.
Обе координаты — числа 0–1. Путь src начинается с `src/assets/images/` и
заканчивается avif / webp / png / jpg / jpeg / svg. Переходы `..` запрещены.
Файл обязан существовать. Для разного кадрирования используется focalPoint.

Аудио: src — локальный путь `public/audio/previews/` с расширением mp3 / ogg /
m4a / wav либо HTTPS URL. mime: audio/mpeg / audio/ogg / audio/mp4 / audio/wav.

Ссылка площадки: `platform`, HTTPS `url`, необязательный локализованный `label`.
platform: yandex-music / vk-music / spotify / apple-music / bandcamp / soundcloud /
youtube / other. Проверяется соответствие домена площадке. Для other label обязателен.
Данные не содержат произвольный iframe, API-токены или исполняемый embed-код.
