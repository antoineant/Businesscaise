# Authentication API Testing Guide

This guide shows how to test the authentication endpoints using curl, Postman, or any HTTP client.

## Prerequisites

1. Backend server running: `npm run dev`
2. PostgreSQL database set up (see `DATABASE_SETUP.md`)
3. Database migrations applied

## Base URL

```
http://localhost:3001
```

## Authentication Endpoints

### 1. Register a New User

Create a new user account (Game Master or Player).

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "gamemaster@test.com",
  "password": "testpassword123",
  "name": "Test Game Master",
  "role": "game_master"
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gamemaster@test.com",
    "password": "testpassword123",
    "name": "Test Game Master",
    "role": "game_master"
  }'
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "gamemaster@test.com",
    "name": "Test Game Master",
    "role": "game_master"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400):**
```json
{
  "error": "Email already registered"
}
```

**Validation Errors:**
- Email must be valid
- Password must be at least 6 characters
- Name is required
- Role must be either "game_master" or "player" (defaults to "player")

---

### 2. Login

Authenticate an existing user and receive a JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "gamemaster@test.com",
  "password": "testpassword123"
}
```

**curl Example:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gamemaster@test.com",
    "password": "testpassword123"
  }'
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "gamemaster@test.com",
    "name": "Test Game Master",
    "role": "game_master"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### 3. Get Current User

Get information about the currently authenticated user (requires authentication).

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**curl Example:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "gamemaster@test.com",
    "name": "Test Game Master",
    "role": "game_master"
  }
}
```

**Error Response (401):**
```json
{
  "error": "No token provided"
}
```

Or:
```json
{
  "error": "Invalid or expired token"
}
```

---

### 4. Logout

Logout the current user (client-side token removal).

**Endpoint:** `POST /api/auth/logout`

**curl Example:**
```bash
curl -X POST http://localhost:3001/api/auth/logout
```

**Success Response (200):**
```json
{
  "message": "Logout successful"
}
```

**Note:** With JWT authentication, logout is primarily handled on the client-side by removing the token. This endpoint exists for consistency and future stateful session management if needed.

---

## Testing Workflow

### 1. Complete User Registration Flow

```bash
# Step 1: Register a Game Master
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gm@school.edu",
    "password": "securepass123",
    "name": "Professor Smith",
    "role": "game_master"
  }' | jq

# Save the token from the response
TOKEN="<token_from_response>"

# Step 2: Verify authentication works
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq

# Step 3: Register a Player
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@school.edu",
    "password": "studentpass123",
    "name": "Student Team Alpha"
  }' | jq
```

### 2. Login Flow

```bash
# Login as Game Master
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gm@school.edu",
    "password": "securepass123"
  }' | jq

# Save token
GM_TOKEN="<token_from_response>"

# Test protected route
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $GM_TOKEN" | jq
```

### 3. Test Role-Based Access Control

Once Game Master routes are implemented, you can test RBAC:

```bash
# As Game Master (should succeed)
curl -X GET http://localhost:3001/api/gm/games \
  -H "Authorization: Bearer $GM_TOKEN" | jq

# As Player (should fail with 403 Forbidden)
curl -X GET http://localhost:3001/api/gm/games \
  -H "Authorization: Bearer $PLAYER_TOKEN" | jq
```

---

## Postman Collection

### Environment Variables

Create a Postman environment with:
- `baseUrl`: `http://localhost:3001`
- `token`: (leave empty, will be set after login)

### Tests Script for Login/Register

Add this to the "Tests" tab of your login/register requests to automatically save the token:

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    console.log("Token saved:", jsonData.token);
}
```

### Authorization Setup

For protected routes, set the Authorization header:
- Type: `Bearer Token`
- Token: `{{token}}`

---

## Common Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Request successful |
| 201 | Created | User registered successfully |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing/invalid token, wrong credentials |
| 403 | Forbidden | Insufficient permissions (wrong role) |
| 404 | Not Found | User not found |
| 500 | Server Error | Database connection, server error |

---

## Token Information

### JWT Structure

The JWT token contains:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "gm@school.edu",
  "role": "game_master",
  "iat": 1699564800,
  "exp": 1700169600
}
```

### Token Expiration

- Default: 7 days (configurable in `.env` via `JWT_EXPIRES_IN`)
- After expiration, users must login again
- Expired tokens will return 401 error

### Decoding Tokens (for debugging)

Visit [jwt.io](https://jwt.io) and paste your token to inspect the payload.

---

## Security Best Practices

1. **HTTPS in Production**: Always use HTTPS in production to prevent token interception
2. **Secure Storage**: Store tokens in httpOnly cookies or secure storage (not localStorage)
3. **Token Refresh**: Implement token refresh mechanism for long-lived sessions
4. **Rate Limiting**: Add rate limiting to prevent brute force attacks
5. **Password Requirements**: Enforce strong password policies
6. **Environment Variables**: Never commit `.env` file or expose JWT_SECRET

---

## Database Verification

After creating users, verify in PostgreSQL:

```sql
-- Connect to database
psql -U postgres -d businesscase

-- List all users
SELECT id, email, name, role, created_at FROM users;

-- Check password hash (should be bcrypt hash)
SELECT email, password_hash FROM users WHERE email = 'gm@school.edu';

-- Verify role constraint
SELECT DISTINCT role FROM users;
```

---

## Troubleshooting

### "Database connection error"

- Ensure PostgreSQL is running: `pg_isready`
- Check `.env` file has correct database credentials
- Verify database exists: `psql -U postgres -l | grep businesscase`

### "Invalid token"

- Token may be expired (check expiration with jwt.io)
- Ensure `JWT_SECRET` in `.env` matches the one used to create the token
- Verify Bearer token format: `Authorization: Bearer <token>`

### "Email already registered"

- User already exists in database
- Use a different email or delete existing user:
  ```sql
  DELETE FROM users WHERE email = 'test@example.com';
  ```

### "Password must be at least 6 characters"

- Validation error from express-validator
- Ensure password meets minimum length requirement

---

## Next Steps

After authentication is working:

1. Implement Game Management endpoints (`/api/gm/games`)
2. Add Team Management endpoints (`/api/teams`)
3. Protect routes with `authenticate` middleware
4. Implement role-based authorization with `requireGameMaster` / `requirePlayer`
5. Add refresh token mechanism for better UX
6. Implement password reset functionality

---

## Additional Resources

- [Backend README](./README.md)
- [Database Setup Guide](./DATABASE_SETUP.md)
- [Architecture Documentation](../ARCHITECTURE.md)
- [Development Status](../DEVELOPMENT_STATUS.md)
