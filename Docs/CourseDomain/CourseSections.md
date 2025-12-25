# Course Sections

Base path: `/api/me/courses/:courseId/sections`

All endpoints require:

- Bearer token
- Course ownership (`requireCourseOwnership`)
- Relevant permission on `course` with `own` scope

| Method   | Path          | Description                                                              | Permission |
| -------- | ------------- | ------------------------------------------------------------------------ | ---------- |
| `GET`    | `/`           | List ordered sections with their lessons for the course.                 | `view`     |
| `POST`   | `/`           | Append one or more sections to the course.                               | `create`   |
| `PATCH`  | `/reorder`    | Reorder existing sections and optionally insert new ones (with lessons). | `edit`     |
| `PATCH`  | `/:sectionId` | Rename a section.                                                        | `edit`     |
| `DELETE` | `/:sectionId` | Delete a single section.                                                 | `delete`   |
| `DELETE` | `/deleteMany` | Delete several sections by ID.                                           | `delete`   |

## Payloads

### `GET /`

Returns the sections ordered by `position` along with their lessons ordered by `position`. The response also includes the parent course title for convenience.

Response `200 OK`:

```json
{
  "data": {
    "courseTitle": "My Awesome Course",
    "sections": [
      {
        "id": 11,
        "courseId": 5,
        "title": "Introduction",
        "position": 1,
        "lessons": [
          {
            "id": 101,
            "sectionId": 11,
            "title": "Welcome",
            "summary": "High-level overview",
            "position": 1,
            "slug": "welcome",
            "durationSec": 300,
            "isPreview": true
          }
        ]
      },
      {
        "id": 12,
        "courseId": 5,
        "title": "Deep Dive",
        "position": 2,
        "lessons": []
      }
    ]
  }
}
```

### `POST /`

```json
{ "arrayTitle": ["Introduction", "Advanced Topics"] }
```

Appends sections to the end of the course.

Response `200 OK`:

```json
{
  "data": {
    "message": "success add 2 course sections"
  }
}
```

### `PATCH /reorder`

`reorders` may mix existing section references and brand-new sections. Positions are 1-based.

```json
{
  "reorders": [
    { "id": 12, "position": 2 },
    {
      "position": 1,
      "title": "New Section",
      "lessons": [
        {
          "title": "Welcome",
          "summary": "short overview",
          "durationSec": 300,
          "isPreview": true
        }
      ]
    }
  ]
}
```

- Each `id` must belong to the target course.
- New sections omit `id`, require a `title`, and can seed lessons (same shape as lesson creation payload).
- Unmentioned existing sections retain their order and are inserted into the remaining positions automatically.

Response `200 OK`:

```json
{
  "data": [
    { "id": 21, "position": 1 },
    { "id": 12, "position": 2 },
    { "id": 18, "position": 3 }
  ]
}
```

### `PATCH /:sectionId`

```json
{ "title": "Updated Section Name" }
```

Response `200 OK`:

```json
{
  "data": {
    "id": 12,
    "courseId": 3,
    "title": "Updated Section Name",
    "position": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T12:00:00.000Z"
  }
}
```

### `DELETE /:sectionId`

Removes a single section (and its nested lessons).

Response:

```json
{
  "data": {
    "removedId": 42,
    "message": "success remove course section \"Section Title\""
  }
}
```

### `DELETE /deleteMany`

```json
{ "ids": [1, 2, 3] }
```

Response `200 OK`:

```json
{
  "data": {
    "message": "success remove 3 course sections"
  }
}
```
