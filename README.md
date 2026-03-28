## Description

API для обучающего приложения

## Compile and run the project

```bash
# development mode
$ docker compose -p codik -f docker/docker-compose.dev.yml up -d --build
```

## Run tests

```bash
# unit tests
$ pnpm run test
```

## Stay in touch

- Author - Artem Kosyrev
- Author - Islam Gadilyaev
- Author - Radmir Arslanbekov

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

**Courses**
```
POST   /courses              — создать курс
GET    /courses              — список всех курсов (витрина)
GET    /courses/:id          — курс с модулями
PATCH  /courses/:id          — обновить заголовок/описание
PATCH  /courses/:id/publish  — опубликовать
DELETE /courses/:id          — удалить

POST   /courses/:id/enroll   — записаться на курс
GET    /courses/:id/progress — прогресс текущего пользователя
```

**Modules**
```
POST   /courses/:courseId/modules        — создать модуль в курсе
PATCH  /modules/:id                      — обновить модуль
DELETE /modules/:id                      — удалить
PATCH  /modules/:id/reorder              — изменить порядок
```

**Steps**
```
POST   /modules/:moduleId/steps          — добавить шаг (передаёшь type + lessonId/testId)
DELETE /steps/:id                        — удалить
PATCH  /steps/:id/reorder               — изменить порядок
POST   /steps/:id/complete              — отметить шаг пройденным
```

**Lessons**
```
POST   /lessons              — создать урок
GET    /lessons/:id          — получить урок с контентом
PATCH  /lessons/:id          — обновить контент
DELETE /lessons/:id          — удалить
```

**Tests**
```
POST   /tests                — создать тест
GET    /tests/:id            — тест с вопросами
PATCH  /tests/:id            — обновить
DELETE /tests/:id            — удалить
POST   /tests/:id/attempt    — отправить ответы, получить результат
GET    /tests/:id/attempts   — история попыток пользователя
```

**Questions**
```
POST   /tests/:testId/questions     — добавить вопрос
PATCH  /questions/:id               — обновить вопрос
DELETE /questions/:id               — удалить
```

---

