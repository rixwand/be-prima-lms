# Users Module

Base path: `/api/user` (all routes behind the authentication middleware).

| Method | Path | Description | Auth / Permission |
| --- | --- | --- | --- |
| `GET` | `/me` | Fetch the authenticated user's profile. | Bearer token |
| `PATCH` | `/me` | Update profile fields. | Bearer token |
| `PATCH` | `/update-password` | Change the authenticated user's password. | Bearer token |
| `GET` | `/list` | List users with pagination. | Bearer token + `manage:user` (`global`) |

## Payloads

### `GET /me`

Response `200 OK`:

```json
{
  "data": {
    "id": 1,
    "fullName": "Arisu",
    "username": "risu",
    "email": "risu@mail.com",
    "profilePict": "user.jpg",
    "roles": {
      "name": "member"
    }
  }
}
```

### `PATCH /me`

At least one field must be provided.

```json
{
  "profilePict": "string (optional)",
  "fullName": "string (optional)"
}
```

Response `200 OK`:

```json
{
  "data": {
    "id": 1,
    "fullName": "Arisu",
    "username": "risu",
    "email": "risu@mail.com",
    "profilePict": "profile.png",
    "roles": {
      "name": "member"
    }
  }
}
```

### `PATCH /update-password`

```json
{
  "oldPassword": "string",
  "newPassword": "min 8 chars, must include a digit"
}
```

Response `200 OK`:

```json
{
  "data": {
    "message": "Password successfully changed"
  }
}
```

### `GET /list`

Accepts pagination parameters (defaults applied when omitted):

- `page`: query string, defaults to `1`
- `limit`: query string, defaults to `10`

Requires the `manage` action on the `user` resource with `global` scope.

Response `200 OK`:

```json
{
  "data": [
    {
      "id": 1,
      "fullName": "Arisu",
      "email": "risu@mail.com",
      "username": "risu",
      "profilePict": "user.jpg",
      "passwordHash": "$2b$...",
      "roleId": 2,
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-05T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPage": 1
  }
}
```
