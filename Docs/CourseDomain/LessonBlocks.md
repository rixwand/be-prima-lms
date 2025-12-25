# Lesson Blocks

Base path: `/api/me/courses/:courseId/sections/:sectionId/lessons/:lessonId/blocks`

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
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 42,
      "lessonId": 12,
      "position": 2,
      "type": "VIDEO",
      "textJson": null,
      "url": "https://cdn.example/video.mp4",
      "meta": {
        "poster": "https://cdn.example/poster.jpg"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
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

Request body:

```json
{
  "type": "RICH_TEXT" | "VIDEO" | "FILE" | "EMBED",
  "textJson": {}, // optional
  "url": "string", // optional, must be a valid URL
  "meta": {} // optional
}
```

- `type` (required): The type of the lesson block.
- `textJson` (optional): The content of the block, for `RICH_TEXT` type.
- `url` (optional): The URL of the video, file, or embed.
- `meta` (optional): Additional metadata for the block.

At least one content field (`textJson`, `url`, or `meta`) must be provided.

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
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### `PATCH /:blockId`

Request body:

```json
{
  "type": "RICH_TEXT" | "VIDEO" | "FILE" | "EMBED", // optional
  "textJson": {}, // optional
  "url": "string", // optional, must be a valid URL
  "meta": {} // optional
}
```

- `type` (optional): The type of the lesson block.
- `textJson` (optional): The content of the block, for `RICH_TEXT` type.
- `url` (optional): The URL of the video, file, or embed.
- `meta` (optional): Additional metadata for the block.

Any subset of fields is allowed, but at least one must be sent.

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
