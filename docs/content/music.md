# Как добавить альбом и трек

Оба вида записей находятся в `src/content/music/<locale>/`.
`kind: release` означает релиз, `kind: track` — отдельную запись трека.
Альбом отличается от EP и сингла полем format, а не отдельной коллекцией.

Сначала добавьте трек. Можно использовать YAML без основного текста:

```yaml
locale: ru
entryKey: demo-track
translationKey: demo-track
title: 'DEMO: Тестовый трек'
summary: 'Тестовая запись трека, не канон NAITMOR.'
draft: true
demo: true
kind: track
artist: DEMO
durationSeconds: 60
```

Готовые примеры: `src/content/music/ru/demo-track.yaml` и английский JSON-перевод
`src/content/music/en/demo-track.json`. Для подробного комментария используйте
Markdown/MDX с теми же полями в frontmatter. Текст песни можно хранить в lyrics;
язык текста должен совпадать с locale записи.

Затем создайте релиз, например в Markdown:

```yaml
locale: ru
entryKey: demo-album
translationKey: demo-album
title: 'DEMO: Тестовый альбом'
summary: 'Тестовый релиз, не канон NAITMOR.'
draft: true
demo: true
kind: release
format: album
artist: DEMO
releaseStatus: released
releaseDate: '2026-11-11'
tracklist:
  - track: ru/demo-track
    disc: 1
    position: 1
```

Пример: `src/content/music/ru/demo-album.md`.
Релиз с releaseStatus: released требует дату и непустой список треков.
У анонса releaseStatus: announced дата и треклист могут отсутствовать.
Позиции на одном диске уникальны; ссылка на другой альбом вместо трека запрещена.

Один трек допускается в нескольких релизах. Отдельный сингл оформляется как
release с format: single и ссылкой на track. Не привязывайте трек единственным
полем album: это помешает повторному использованию в сборниках.

У опубликованного канонического трека обязательна длительность. Аудиопревью,
обложка, ISRC и ссылки площадок необязательны. В этом этапе медиа не добавлялись.
Для ссылки площадки указываются platform и HTTPS URL; домен должен соответствовать
площадке. Имена исполнителей и авторов сохраняют оригинальное написание.

Для выпуска канона создайте отдельные записи без demo-префиксов и с авторскими
данными, проверьте их, затем снимите draft у треков и релиза. Опубликованный релиз
не может ссылаться на черновик или DEMO. Выполните `npm run check` и `npm run build`.

[Все музыкальные поля](schemas.md), [правила переводов](localization.md).
