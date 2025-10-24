# Lesson Blocks

Base path: `/api/me/course/:courseId/section/:sectionId/lessons/:lessonId/blocks`

Ownership is enforced via `requireHierarcy("lesson"|"block")`. Permissions follow the course RBAC (`view`, `create`, `edit`, `delete` actions with `own` scope).

| Method | Path | Description | Permission |
| --- | --- | --- | --- |
| `GET` | `/` | List blocks for the lesson in order. | `view` |
| `POST` | `/` | Create a new lesson block. | `create` |
| `GET` | `/:blockId` | Fetch one block by ID. | `view` |
| `PATCH` | `/:blockId` | Update block content or type. | `edit` |
| `DELETE` | `/:blockId` | Remove a block. | `delete` |

## Payloads

### `GET /`

Returns the ordered list of blocks in the lesson.

Response `200 OK`:

```json
{
  "data": [
    {
      "id": 41,
      "lessonId": 12,
      "position": 1,
      "type": "RICH_TEXT",
      "textJson": {
        "content": "<p>Welcome!</p>"
      },
      "url": null,
      "meta": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### `GET /:blockId`

Returns a single block by ID.

Response `200 OK`:

```json
{
  "data": {
    "id": 41,
    "lessonId": 12,
    "position": 1,
    "type": "RICH_TEXT",
    "textJson": {
      "content": "<p>Welcome!</p>"
    },
    "url": null,
    "meta": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### `POST /`

At least one content field must be provided.

```json
{
  "type": "RICH_TEXT" | "VIDEO" | "FILE" | "EMBED",
  "textJson": {},
  "url": "https://…",
  "meta": {}
}
```

Response `201 Created`:

```json
{
  "data": {
    "id": 42,
    "lessonId": 12,
    "position": 2,
    "type": "VIDEO",
    "textJson": null,
    "url": "https://cdn.example/video.mp4",
    "meta": {
      "poster": "https://cdn.example/poster.jpg"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### `PATCH /:blockId`

Any subset of fields is allowed, but at least one must be sent.

```json
{
  "type": "VIDEO",
  "url": "https://cdn.example/video.mp4",
  "meta": { "poster": "…" }
}
```

Response `200 OK`:

```json
{
  "data": {
    "id": 42,
    "lessonId": 12,
    "position": 2,
    "type": "VIDEO",
    "textJson": null,
    "url": "https://cdn.example/video-hd.mp4",
    "meta": {
      "poster": "https://cdn.example/poster-hd.jpg"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T10:00:00.000Z"
  }
}
```

### `DELETE /:blockId`

Response `200 OK`:

```json
{
  "data": {
    "removedId": 42,
    "message": "Lesson block removed"
  }
}
```
