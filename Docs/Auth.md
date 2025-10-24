# Auth Module

Base path: `/api/auth`

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/register` | Create a new user account and trigger activation flow. | None |
| `POST` | `/login` | Authenticate user credentials and issue tokens. | None |
| `POST` | `/refresh` | Exchange refresh cookie for a new access token. | Refresh cookie |
| `POST` | `/activation` | Activate a user account using the emailed code. | None |
| `DELETE` | `/logout` | Invalidate current refresh token (cookie cleared). | Refresh cookie |
| `DELETE` | `/logout-all` | Invalidate every refresh token for the account. | Bearer token + refresh cookie |

## Payloads

### `POST /register`

```json
{
  "username": "string",
  "fullName": "string",
  "email": "user@example.com",
  "password": "min 8 chars, must include a digit"
}
```

Response `200 OK`:

```json
{
  "data": {
    "user": {
      "id": 1,
      "username": "risu",
      "fullName": "Arisu",
      "email": "risu@mail.com"
    }
  }
}
```

### `POST /login`

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

Response `200 OK` (also sets `refreshToken` httpOnly cookie):

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
  }
}
```

### `POST /refresh`

Requires a valid `refreshToken` cookie.

Response `200 OK` (rotates `refreshToken` cookie):

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
  }
}
```

### `POST /activation`

```json
{ "code": "string" }
```

Response `200 OK`:

```json
{
  "data": {
    "message": "Account activated. You can login now"
  }
}
```

### `DELETE /logout`

Requires `refreshToken` cookie. Clears the cookie and returns:

Response `200 OK`:

```json
{
  "data": {
    "message": "Logout success"
  }
}
```

### `DELETE /logout-all`

Requires both a Bearer access token and the `refreshToken` cookie. Returns:

Response `200 OK`:

```json
{
  "data": {
    "message": "Logout from all devices"
  }
}
```
