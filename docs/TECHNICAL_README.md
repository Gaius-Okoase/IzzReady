# IzzReady Technical Guide

This is the developer-oriented guide to the IzzReady backend: how to run it,
where behavior lives, and which documentation describes each part of the API.
It reflects the current code rather than planned features. For product context,
see the [project README](../README.md).

## What this repository contains

IzzReady is currently a Node.js/TypeScript REST API built with Express. It uses
MongoDB through Mongoose and supports customer and bukka-owner accounts. The API
covers authentication, bukka discovery and management, food menus and readiness,
customer queues, and browser push subscriptions.

There is no frontend in this repository yet. Redis and SMS/OTP delivery are not
configured as active services. The canonical endpoint and schema reference is
the [OpenAPI document](./openapi.yaml); Swagger UI is served at `/api-docs` in
development.

## Prerequisites

- Node.js and npm. The repository does not pin a Node.js version; use a
  currently supported Node.js LTS release compatible with the dependencies.
- A MongoDB database and connection URI.
- Credentials/values for the integrations in the environment-variable table
  below. The current configuration module requires every listed variable to be
  defined at startup, even when you are not exercising that integration.

## Local setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and set values for your local environment.
   Do not commit `.env` or put real credentials in documentation or source
   control.

3. Start the development server:

   ```sh
   npm run dev
   ```

   By default, the server listens on port `4100`. Set `PORT` to override it.
   Set `NODE_ENV=development` to enable the development-only Swagger UI at
   `http://localhost:4100/api-docs`.

4. Check `http://localhost:4100/health` for the HTTP health response. This
   endpoint currently returns a static response; it does not verify MongoDB or
   external service availability.

### Environment variables

The names below are taken from `.env.example` and `src/config/env.ts`.
`PORT` defaults to `4100`. `NODE_ENV` defaults in the config object, but set it
explicitly to `development` when you want development-only behavior such as
Swagger UI. All remaining values must be present because startup validation
exits when a config value is `undefined`.

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP listening port. Defaults to `4100`. |
| `NODE_ENV` | Environment mode. Use `development` locally and `production` for a production deployment. |
| `MONGO_URI` | MongoDB connection string. |
| `JWT_ACCESS_SECRET` | Secret used to sign/verify access JWTs. |
| `JWT_REFRESH_SECRET` | Secret used to sign/verify refresh JWTs. |
| `CLIENT_ID` | Google OAuth client ID. |
| `CLIENT_SECRET` | Google OAuth client secret. |
| `REDIRECT_URI` | OAuth callback URL registered with Google. |
| `CORS_ORIGIN` | Allowed origin used by the production CORS configuration. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for custom food-image uploads. |
| `CLOUDINARY_API_KEY` | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret. |
| `CLOUDINARY_URL` | Cloudinary URL; currently part of required configuration. |
| `VAPID_PUBLIC_KEY` | Web Push VAPID public key. |
| `VAPID_PRIVATE_KEY` | Web Push VAPID private key. |

The current startup check tests whether a value is `undefined`; it does not
validate whether a non-empty value is correct or whether its external service
is reachable. Use real local/deployment-specific values for integrations you
intend to test.

## Common commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run `src/server.ts` with `tsx` watch mode. |
| `npm run lint` | Run ESLint over the repository. |
| `npm run build` | Install packages, remove `dist`, and compile TypeScript. |
| `npm start` | Run the compiled server from `dist/server.js`. |

The configured build command uses the Unix `rm -rf` command, so it may not run
in Windows' default shell. On Windows, `npm exec tsc -- --pretty false` runs
the TypeScript compiler without that cleanup step. The repository's `test`
script is a placeholder that exits with an error; no automated test suite is
configured yet.

## Project structure

| Path | Responsibility |
| --- | --- |
| `src/server.ts` | Creates the Express app, configures middleware, mounts routes, and starts/stops the HTTP server and MongoDB connection. |
| `src/routes/` | Maps URL paths and HTTP methods to middleware and controllers. |
| `src/controllers/` | Handles HTTP request/response concerns and calls services. |
| `src/services/` | Implements application workflows and performs database operations through Mongoose models. |
| `src/models/` | Defines Mongoose schemas, indexes, and model behavior. |
| `src/middleware/` | Authentication, authorization, validation, rate limiting, uploads, and error handling. |
| `src/zod_schema/` | Zod request schemas used by validation middleware. |
| `src/config/` | Environment configuration, MongoDB connection, and Cloudinary setup. |
| `src/jobs/` | Scheduled background work. |
| `src/types/` | Shared TypeScript types. |
| `src/utils/` | Shared utilities, including application errors and response helpers. |
| `docs/openapi.yaml` | OpenAPI 3.0.3 endpoint and schema reference. |

Typical request flow:

```text
Express mount → route middleware → controller → service → Mongoose model → MongoDB
```

Services currently access Mongoose models directly; there is no separate
repository/data-access layer in `src/`.

## API overview

All versioned endpoints are mounted under `/api/v1`. Authentication endpoints
are rate-limited separately; the other API groups use the general bukka
rate limiter. Protected route groups expect the access token in the request's
authorization header. Owner-only actions additionally check the user's
`owner` role.

| Base path | Purpose |
| --- | --- |
| `/health` | Public HTTP health response. |
| `/api/v1/auth` | Registration, login, Google OAuth, logout, token refresh, and current-user lookup. |
| `/api/v1/bukkas` | Discover nearby bukkas and create, inspect, update, or delete bukkas. |
| `/api/v1/bukkas/:bukkaId/food-items` | Read menus; create catalog-backed or custom items; update item details/status; delete items. |
| `/api/v1/food-catalog` | Read catalog items. The route group is owner-authenticated. |
| `/api/v1/food-item/:itemId/queue` | Join/leave a food-item queue; owners can read its count. |
| `/api/v1/notification` | Save a browser push subscription for the signed-in user. |

For exact methods, parameters, validation, response codes, and schemas, use
[openapi.yaml](./openapi.yaml). The request/response notes in
[API.md](./API.md) are supplementary and may not always match the current
route prefixes; verify behavior against the OpenAPI file and implementation.

## Main application flows

### Authentication and roles

Users can register or log in with a phone number and password, or start a
Google OAuth flow. Successful authentication issues an access JWT; refresh
tokens are handled using an HTTP-only cookie. Protected routes use
`authenticate` middleware to verify the bearer token and confirm the account
exists and is active. `isOwner` restricts owner operations to users with the
`owner` role.

### Bukkas and food

Bukkas store a GeoJSON `Point` location. A `2dsphere` index supports nearby
searches. Coordinates in GeoJSON are ordered `[longitude, latitude]`.

Food items can refer to an item in the shared food catalog or be custom items.
Custom item images are uploaded through Multer and Cloudinary. Multer currently
accepts JPEG, PNG, WebP, and SVG images up to 5 MB.

Food-item statuses in the model are `unavailable`, `cooking`,
`awaiting_confirmation`, and `izz_ready`. Starting `cooking` requires a timer;
the service stores its expiry time in `cookingTimer`.

### Queues and push notifications

Customers can join a queue only while an item is `cooking` and cannot join the
same item twice through the service check. When an item becomes `izz_ready`,
the food-item service sends push notifications to queued users and then deletes
the queue entries. Push subscriptions are saved on the user record. Browser
push delivery requires valid VAPID keys and user subscriptions.

### Cooking timer job

`src/jobs/cookingTimerJob.ts` schedules a check every minute. It finds items
whose `cookingTimer` has expired while their status is `cooking`, then calls
the food-item service to set each item to `izz_ready`. That service handles
notifications and queue cleanup.

The job has an in-process `isRunning` guard to avoid overlapping runs within
one server process. The implementation does **not** transition the item to
`awaiting_confirmation`, despite the older description in
[ARCHITECTURE.md](./ARCHITECTURE.md), and the guard is not a distributed lock
across multiple server instances.

## Data model

Mongoose models are defined in `src/models/`:

- **User** — identity, role, password/OAuth fields, account status, refresh
  token, and push subscriptions.
- **Bukka** — owner reference, name, and GeoJSON location.
- **FoodCatalog** — shared food choices.
- **FoodItem** — a bukka's catalog or custom item, status, and cooking timer.
- **Queue** — a user-to-food-item queue entry.

See [DATAMODEL.md](./DATAMODEL.md) for the existing entity diagram and
relationships. Treat the Mongoose models as the source of truth if older
documentation differs.

## Deployment and operations

The production server listens on `PORT` (including a platform-assigned port),
connects to MongoDB before starting Express, and uses `NODE_ENV=production` to
select production CORS/logging behavior. Configure every required environment
variable in the hosting provider's secret/environment settings; do not rely on
a committed `.env` file.

The health endpoint is `GET /health`. `GET /` is not currently defined and
returns the application's JSON 404 response. Swagger UI is only mounted when
`NODE_ENV=development`; the OpenAPI YAML file itself is in `docs/`.

## Documentation and implementation caveats

- `ARCHITECTURE.md` describes an `awaiting_confirmation` timer flow, but the
  current scheduled job automatically sets expired items to `izz_ready`. `awaiting_confirmation` was removed for smoother user experience, considering that target users (bukka owners), will like something simple.
- `npm run build` contains a Unix-specific cleanup command (`rm -rf dist`),
  which can fail under the default Windows shell.
- `GET /` has no welcome handler. Use `/health` for the current health
  response.
