# Course Module

## Public catalogue (`/api/courses`)

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/list` | Paginated catalogue of published courses. | None |
| `GET` | `/:courseSlug` | Preview a single course by slug. | None |

- Pagination: supply `page` & `limit` as query parameters (defaults: `page=1`, `limit=10`).
- Preview returns the course with public-friendly fields and previewable lessons.

### `GET /api/courses/list`

Returns a paginated list of published courses.

```text
/api/courses/list?page=1&limit=10
```

Response `200 OK`:

```json
{
  "data": {
    "courses": [
      {
        "id": 1,
        "title": "React Basics",
        "slug": "react-basics",
        "status": "PUBLISHED",
        "ownerId": 3,
        "coverImage": "react.png",
        "previewVideo": "https://cdn.example/react-intro.mp4",
        "shortDescription": "Learn the fundamentals of React.",
        "descriptionJson": {
          "blocks": []
        },
        "priceAmount": 9900,
        "isFree": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPage": 1
    }
  }
}
```

### `GET /api/courses/:courseSlug`

Retrieves a public preview of the course identified by slug.

Response `200 OK` (flattened for convenience):

```json
{
  "data": {
    "id": 1,
    "title": "React Basics",
    "slug": "react-basics",
    "status": "PUBLISHED",
    "coverImage": "react.png",
    "previewVideo": "https://cdn.example/react-intro.mp4",
    "shortDescription": "Learn the fundamentals of React.",
    "descriptionJson": {
      "blocks": []
    },
    "priceAmount": 9900,
    "isFree": false,
    "tags": [
      { "name": "javascript" },
      { "name": "frontend" }
    ],
    "sections": [
      {
        "title": "Introduction",
        "lessons": [
          { "title": "Welcome", "position": 1 },
          { "title": "Setup", "position": 2 }
        ]
      }
    ],
    "discountType": "PERCENTAGE",
    "discountValue": 20,
    "discountIsActive": true
  }
}
```

## Author-owned operations (`/api/me/courses`)

These routes require:

- `Authorization: Bearer <token>`
- Corresponding permission: `view|create|edit|delete` on `course` with `own` scope.
- Courses must belong to the authenticated user (checked by `requireCourseOwnership`).

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | List the author's courses (supports `page` & `limit` query parameters). |
| `GET` | `/:courseId` | Retrieve a single owned course with details. |
| `POST` | `/` | Create a course; optional sections and lessons can be seeded. |
| `PATCH` | `/:courseId` | Update course metadata, pricing, and discounts. |
| `PATCH` | `/:courseId/tags` | Add or remove tags by slug/name. |
| `DELETE` | `/:courseId` | Remove a course. |
| `DELETE` | `/deleteMany` | Bulk delete owned courses via IDs. |
| `DELETE` | `/:courseId/discounts/:discountId` | Remove a specific discount from a course. |

### `GET /api/me/courses`

Supports `page` and `limit` query parameters.

Response `200 OK`:

```json
{
  "data": {
    "courses": [
      {
        "id": 1,
        "title": "React Basics",
        "slug": "react-basics",
        "status": "PUBLISHED",
        "coverImage": "react.png",
        "priceAmount": 9900,
        "isFree": false,
        "discount": [
          {
            "id": 10,
            "type": "PERCENTAGE",
            "value": 20,
            "label": "Launch Promo",
            "isActive": true,
            "startAt": "2024-01-01T00:00:00.000Z",
            "endAt": "2024-02-01T00:00:00.000Z",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "updatedAt": "2024-01-01T00:00:00.000Z"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPage": 1
    }
  }
}
```

### `GET /api/me/courses/:courseId`

Retrieves full details for an owned course (flattened structure).

Response `200 OK`:

```json
{
  "data": {
    "id": 1,
    "title": "React Basics",
    "slug": "react-basics",
    "status": "PUBLISHED",
    "coverImage": "react.png",
    "previewVideo": "https://cdn.example/react-intro.mp4",
    "shortDescription": "Learn the fundamentals of React.",
    "descriptionJson": {
      "blocks": []
    },
    "priceAmount": 9900,
    "isFree": false,
    "tags": [
      { "tag": { "name": "javascript" } }
    ],
    "sections": [
      {
        "id": 11,
        "courseId": 1,
        "title": "Introduction",
        "position": 1,
        "lessons": [
          {
            "id": 32,
            "sectionId": 11,
            "slug": "welcome",
            "title": "Welcome",
            "summary": null,
            "position": 1,
            "durationSec": 300,
            "isPreview": true,
            "createdAt": "2024-01-01T00:00:00.000Z",
            "updatedAt": "2024-01-01T00:00:00.000Z"
          }
        ]
      }
    ],
    "discount": [
      {
        "id": 10,
        "courseId": 1,
        "type": "PERCENTAGE",
        "value": 20,
        "label": "Launch Promo",
        "isActive": true,
        "startAt": "2024-01-01T00:00:00.000Z",
        "endAt": "2024-02-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### `POST /api/me/courses`

```json
{
  "title": "string",
  "status": "PUBLISHED" | "DRAFT",
  "coverImage": "string",
  "previewVideo": "string (optional)",
  "shortDescription": "string",
  "descriptionJson": "stringified rich text (optional)",
  "priceAmount": 0,
  "isFree": false,
  "tags": ["slug-or-name"],
  "sections": [
    {
      "title": "string",
      "lessons": [
        {
          "title": "string",
          "summary": "string (optional)",
          "durationSec": 3600,
          "isPreview": false
        }
      ]
    }
  ],
  "discount": {
    "type": "FIXED" | "PERCENTAGE",
    "value": 10,
    "label": "string (optional)",
    "isActive": true,
    "startAt": "ISO datetime (optional, must be >= now)",
    "endAt": "ISO datetime (optional, must be >= now)"
  }
}
```

Response: `200 OK` → `{ "data": CreatedCourse }`
Response `200 OK`:

```json
{
  "data": {
    "id": 1,
    "title": "React Basics",
    "slug": "react-basics",
    "status": "DRAFT",
    "ownerId": 3,
    "coverImage": "react.png",
    "previewVideo": null,
    "shortDescription": "Learn the fundamentals of React.",
    "descriptionJson": null,
    "priceAmount": 9900,
    "isFree": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### `PATCH /api/me/courses/:courseId`

Accepts any subset of course properties. Discounts can be upserted via an array of objects containing `id` (for existing discounts) plus the same fields used during creation.

```json
{
  "title": "React Basics (Updated)",
  "status": "PUBLISHED",
  "priceAmount": 7900,
  "isFree": false,
  "discounts": [
    {
      "id": 10,
      "type": "PERCENTAGE",
      "value": 15,
      "label": "Fresh Deal",
      "isActive": true,
      "startAt": "2024-02-01T00:00:00.000Z",
      "endAt": "2024-03-01T00:00:00.000Z"
    }
  ]
}
```

Response `200 OK`:

```json
{
  "data": {
    "id": 1,
    "title": "React Basics (Updated)",
    "slug": "react-basics-updated",
    "status": "PUBLISHED",
    "coverImage": "react.png",
    "previewVideo": null,
    "shortDescription": "Learn the fundamentals of React.",
    "descriptionJson": null,
    "priceAmount": 7900,
    "isFree": false
  }
}
```

### `PATCH /api/me/courses/:courseId/tags`

```json
{
  "disconnectSlugs": ["tag-slug"],
  "createOrConnect": ["New Tag Name"]
}
```

At least one array must be present. Internally tag names are slugified before connecting.

Response: `{ "data": UpdatedCourseWithTags }`
Response `200 OK`:

```json
{
  "data": {
    "message": "Success add 1 tags and remove 0 tags"
  }
}
```

### `DELETE /api/me/courses/:courseId`

Removes a single owned course.

```json
{
  "data": {
    "removedId": 7,
    "message": "success remove course \"Course Title\""
  }
}
```

### `DELETE /api/me/courses/deleteMany`

```json
{ "ids": [1, 2, 3] }
```

Deletes only the caller's courses. Response includes the count removed.
Response `200 OK`:

```json
{
  "data": {
    "message": "success remove 2 course"
  }
}
```

### `DELETE /api/me/courses/:courseId/discounts/:discountId`

Removes a specific discount.

Response `200 OK`:

```json
{
  "message": "Successfully remove discount"
}
```
