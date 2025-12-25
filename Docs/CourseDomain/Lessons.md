# Lessons

Base path: `/api/me/courses/:courseId/sections/:sectionId/lessons`

Authentication and ownership are enforced via `requireHierarcy("section"|"lesson")` and RBAC:

| Method | Path | Description | Permission |
| --- | --- | --- | --- |
| `POST` | `/` | Bulk create lessons in the section (appended at the end). | `create` (`course`, `own`) |
| `PATCH` | `/:lessonId` | Update lesson metadata. | `edit` (`course`, `own`) |
| `DELETE` | `/:lessonId` | Remove a lesson. | `delete` (`course`, `own`) |
| `DELETE` | `/deleteMany` | Remove multiple lessons by ID. | `delete` (`course`, `own`) |

## Payloads

### `POST /`

```json
[
  {
    "title": "Lesson title",
    "summary": "optional summary",
    "durationSec": 600,
    "isPreview": false
  }
]
```

The array must contain at least one object. New lessons are appended with sequential positions. Response: `{ "data": { "message": "success add <count> lessons" } }`
Response `200 OK`:

```json
{
  "data": {
    "message": "success add 2 lessons"
  }
}
```

### `PATCH /:lessonId`

Partial updates are allowed; at least one field is required.

```json
{
  "title": "Updated title",
  "summary": "optional",
  "durationSec": 900,
  "isPreview": true
}
```

Response `200 OK`:

```json
{
  "data": {
    "id": 5,
    "sectionId": 2,
    "slug": "updated-title",
    "title": "Updated title",
    "summary": "optional",
    "position": 1,
    "durationSec": 900,
    "isPreview": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-03T09:00:00.000Z"
  }
}
```

### `DELETE /:lessonId`

Removes a single lesson.

Response `200 OK`:

```json
{
  "data": {
    "removedId": 5,
    "message": "success remove course section \"Lesson Title\""
  }
}
```

### `DELETE /deleteMany`

```json
{ "ids": [5, 6, 7] }
```

Response `200 OK`:

```json
{
  "data": {
    "message": "success remove 3 course sections"
  }
}
```

---

Nested lesson block management is documented separately in [Lesson Blocks](./LessonBlocks.md).
