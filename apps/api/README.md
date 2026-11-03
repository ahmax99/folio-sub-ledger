# api

RESTful API built with Elysia and the Bun runtime. It serves the users resource and the image proxy; the ledger domain builds on them.

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
