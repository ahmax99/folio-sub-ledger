# api

RESTful API built with Elysia and the Bun runtime. It still serves the starter posts, comments and users resources; the ledger domain will replace them.

## Setup

1. Copy the environment file:

```bash
cp .env.example .env
```

2. Configure environment variables in `.env`:

```env
# AWS
AWS_REGION="us-east-1"
S3_BUCKET_NAME="your-bucket-name"

# Cognito (JWT verification)
COGNITO_CLIENT_ID=""
COGNITO_USERPOOL_ID=""

# Application
BACKEND_PORT="4000"
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"

# Database (local development only; Lambda loads it from Secrets Manager)
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

## Development

Start the development server:

```bash
bun run dev
```

The server runs at `http://localhost:4000`

## Tests

Integration tests run against a real, dedicated Postgres database through Vitest. Start one and export its URL (never point it at the dev database):

```bash
docker run -d --rm --name folio-test-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=folio_test -p 5432:5432 postgres:17-alpine
export TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/folio_test
bun run test
```

The run applies the Prisma migrations to `TEST_DATABASE_URL` first and truncates every table before each test. Without the variable, or when the database name doesn't end in `_test`, it aborts before running anything. Environments that block port 5432 can rely on the `PR Checks` CI run instead.

## API Documentation

Interactive API documentation is available via Swagger UI:

**Swagger UI**: `http://localhost:4000/api/v1/openapi`

The documentation provides:

- Complete endpoint reference with request/response schemas
- Interactive API testing interface
- Authentication requirements for each endpoint
- Request parameter validation rules

Requests that fail Zod validation return `400` with `{ error: { message, fields } }` (`ErrorModel` in `@shared/config`), so the web app can show each message on its form field.

### Available Endpoints

#### Posts

- `GET /api/v1/posts` - Get all posts
- `GET /api/v1/posts/:id` - Get post by ID
- `POST /api/v1/posts` - Create a new post (requires auth)
- `PUT /api/v1/posts/:id` - Update a post (requires auth)
- `DELETE /api/v1/posts/:id` - Delete a post (requires auth)
- `GET /api/v1/posts/presigned-url` - Get S3 presigned URL for image upload (requires auth)

#### Comments

- `GET /api/v1/comments?postId={uuid}` - Get comments for a post
- `POST /api/v1/comments` - Create a new comment (requires auth)
- `DELETE /api/v1/comments/:id` - Delete a comment (requires auth)

#### Users

- `GET /api/v1/users` - List users (requires auth)
- `GET /api/v1/users/me` - Get the signed-in user (requires auth)
- `GET /api/v1/users/:id` - Get user by ID (requires auth)
- `GET /api/v1/users/presigned-url` - Get S3 presigned URL for an avatar upload (requires auth)
- `POST /api/v1/users` - Create a user (requires auth)
- `PUT /api/v1/users/:id` - Update a user (requires auth)
- `DELETE /api/v1/users/:id` - Delete a user (requires auth)

#### Images

- `GET /api/v1/images/*` - Stream an uploaded image from S3
