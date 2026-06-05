# IzzReady API Documentation

This document is generated from the codebase. It lists every Express route, the HTTP method and path, request shapes (from Zod schemas and TypeScript types), authentication requirements, success responses and possible error responses derived strictly from the implemented code.

Security
- Authentication: JWT Bearer token is used for protected endpoints. The middleware expects an `Authorization` header with the format `Bearer <token>` (see [src/middleware/auth.ts](src/middleware/auth.ts#L1)).
- The app also uses an HTTP-only cookie named `refresh_token` for refresh/token rotation on the auth routes. Some OAuth flows set additional cookies: `oauth_state` and `role`.

Common response shapes
- Success responses use `successResponse(res, statusCode, message, data?)` and therefore return JSON shaped like:

	```json
	{
		"success": true,
		"message": "...",
		"data": { /* optional */ },
		"timestamp": "ISO timestamp"
	}
	```

- Error responses are handled by `errorHandler` and typically return:

	```json
	{
		"status": "error",
		"message": "...",
		"timestamp": "ISO timestamp"
	}
	```

Notes about roles and mounts
- Routes are mounted in [src/server.ts](src/server.ts#L1):
	- `/api/auth` → public auth endpoints (rate-limited)
	- `/api/bukkas` → mounted with `authenticate` middleware; route handlers additionally use `isOwner` where owner-only behavior is required
	- `/api/bukkas/:bukkaId/food-items` → mounted with `authenticate` middleware; route handlers additionally use `isOwner` where owner-only behavior is required
	- `/api/food-catalog` → mounted with `authenticate` and `isOwner` (owner-only)


---

**Endpoints**

**Auth** (`/api/auth`)

- **POST /api/auth/register**
	- Description: Register a new user and set `refresh_token` cookie; returns the created user and an access token.
	- Authentication: Public
	- Request body (validated by `RegisterSchema` - [src/zod_schema/authSchema.ts](src/zod_schema/authSchema.ts#L1)):
		- `name` (string, required) — min length 4
		- `phoneNumber` (string, required) — matches the regex `/^(\+234|0)[789][01]\d{8}$/`
		- `password` (string, required) — min length 6
		- `role` (`"customer" | "owner"`, required) — per `IUser` type. 
	- Success response (201): `success=true`, `data` contains:
		- `user`: user document (see `IUser` in [src/types/types.ts](src/types/types.ts#L1)); returned fields are those defined on the `User` model (sensitive fields like `password` and `refreshToken` are removed in `toJSON`)
		- `accessToken`: string
	- Example request:
		```json
		{
			"name": "Ore Kolawole",
			"phoneNumber": "+2341234567890",
			"password": "SecurePass123",
			"role": "owner"
		}
		```
	- Example response (201):
		```json
		{
			"success": true,
			"message": "User created successfuly",
			"data": {
				"user": {
					"id": "507f1f77bcf86cd799439011",
					"name": "Ore Kolawole",
					"phoneNumber": "+2341234567890",
					"role": "owner",
					"isProfileComplete": false,
					"isActive": true,
					"lastLoginAt": "2026-06-05T10:30:00.000Z",
					"createdAt": "2026-06-05T10:30:00.000Z",
					"updatedAt": "2026-06-05T10:30:00.000Z"
				},
				"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
			},
			"timestamp": "2026-06-05T10:30:00.000Z"
		}
		```
	- Side effects: sets an HTTP-only cookie `refresh_token` (path `/api/auth`)
	- Possible error responses:
		- 400 Bad Request — Zod validation errors for the request body
		- 400 Missing identifier for token generation (if neither email nor phoneNumber present in service)
		- 409 Conflict — `User already exists. Please log in or reset your password.` (when matching user is found)
		- 500 Internal Server Error — unexpected errors

- **GET /api/auth/google**
	- Description: Starts Google OAuth by setting cookies for `role` and `oauth_state` then redirecting the client to Google's OAuth endpoint.
	- Authentication: Public
	- Query parameters:
		- `role` (string, optional) — expected `'customer'` or `'owner'`; stored in cookie
	- Response: redirect (302) to Google OAuth URL. Sets cookies `role` and `oauth_state` (HTTP-only, short expiry).
	- Possible error responses: none explicitly thrown in controller; generic 500 may apply.

- **GET /api/auth/google/callback**
	- Description: OAuth callback handler. Validates state cookie, exchanges code with Google, then either signs in an existing user or creates a new user. Sets `refresh_token` cookie and returns `user` and `accessToken` in response data.
	- Authentication: Public (relies on cookies set previously)
	- Query parameters (from Google): `state`, `error`, `code` (controller reads these via `req.query`)
	- Success responses:
		- 200 OK — existing user signed in. Response data contains `user` and `accessToken`.
		- 201 Created — new user created. Response data contains `user`, `accessToken` and a `refreshToken` cookie is set.
	- Possible error responses (thrown in service):
		- 400 / 500 with message 'Something went wrong. Please try again.' (if Google returns `error`)
		- Error on state mismatch: thrown as Error with message 'State mismatch. Possible CSRF attack.' → results in generic 500 by `errorHandler` (unless environment maps differently)
		- 403 Forbidden — if an existing user's `isActive !== true` (service throws `AppError(403, 'Forbidden')`)
		- 500 — unexpected errors or token exchange failures

- **POST /api/auth/login**
	- Description: Authenticate a user using phone number and password; sets `refresh_token` cookie and returns user and access token.
	- Authentication: Public
	- Request body (validated by `LoginSchema` - [src/zod_schema/authSchema.ts](src/zod_schema/authSchema.ts#L1)):
		- `phoneNumber` (string, required) — regex `/^(\+234|0)[789][01]\d{8}$/`
		- `password` (string, required) — min length 6
	- Success response (200): `data` contains `user` and `accessToken`.
	- Example request:
		```json
		{
			"phoneNumber": "+2341234567890",
			"password": "SecurePass123"
		}
		```
	- Example response (200):
		```json
		{
			"success": true,
			"message": "Log in successful.",
			"data": {
				"user": {
					"id": "507f1f77bcf86cd799439011",
					"name": "Ore Kolawole",
					"phoneNumber": "+2341234567890",
					"role": "owner",
					"isProfileComplete": true,
					"isActive": true,
					"lastLoginAt": "2026-06-05T11:00:00.000Z",
					"createdAt": "2026-06-05T10:30:00.000Z",
					"updatedAt": "2026-06-05T11:00:00.000Z"
				},
				"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
			},
			"timestamp": "2026-06-05T11:00:00.000Z"
		}
		```
	- Side effects: sets HTTP-only cookie `refresh_token` (path `/api/auth`)
	- Possible errors:
		- 400 Bad Request — Zod validation errors
		- 401 Unauthorized — `Incorrect phone number or password` (when user not found or password mismatch)
		- 403 Forbidden — `Forbidden` (if `user.isActive !== true`)
		- 500 Internal Server Error — unexpected errors

- **POST /api/auth/logout**
	- Description: Logs out the currently authenticated user by clearing stored refresh token in DB and clearing cookie.
	- Authentication: Requires JWT Bearer token (`authenticate` middleware)
	- Headers: `Authorization: Bearer <token>` required
	- Success response (200): `{ success: true, message: 'Log out successful' }` (no `data`)
	- Side effects: clears cookie `refresh_token` (path `/api/auth`)
	- Possible errors:
		- 401 Unauthorized — missing/invalid `Authorization` header (handled by `authenticate` middleware)
		- 410 User does not exist — thrown by `authenticate` if the token's user id doesn't map to an existing user
		- 403 Forbidden — if user's `isActive !== true` (in `authenticate`)
		- 500 Internal Server Error — unexpected errors

- **POST /api/auth/refresh-token**
	- Description: Rotate refresh token. Reads cookie `refresh_token`, verifies it, issues new refresh and access tokens, updates DB refresh token and sets new `refresh_token` cookie.
	- Authentication: Public (reads `refresh_token` cookie)
	- Cookies: `refresh_token` (HTTP-only) required
	- Success response (200): `data` contains `{ accessToken: string }`. 
	- Example response (200):
		```json
		{
			"success": true,
			"message": "Token refresh successful",
			"data": {
				"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
			},
			"timestamp": "2026-06-05T11:15:00.000Z"
		}
		```
	- Possible errors:
		- 403 Forbidden — `Invalid or expired token. Please log in again.` (when refresh token not found or invalid)
		- 500 Internal Server Error — generic fallback from `tokenRotationService`

- **GET /api/auth/me**
	- Description: Returns profile of the currently authenticated user.
	- Authentication: Requires JWT Bearer token (`authenticate` middleware)
	- Success response (200): `data` contains `user` (user document)
	- Example response (200):
		```json
		{
			"success": true,
			"message": "User profile retrieved",
			"data": {
				"user": {
					"id": "507f1f77bcf86cd799439011",
					"name": "Ore Kolawole",
					"phoneNumber": "+2341234567890",
					"role": "owner",
					"isProfileComplete": true,
					"isActive": true,
					"lastLoginAt": "2026-06-05T11:00:00.000Z",
					"createdAt": "2026-06-05T10:30:00.000Z",
					"updatedAt": "2026-06-05T11:00:00.000Z"
				}
			},
			"timestamp": "2026-06-05T11:20:00.000Z"
		}
		```
	- Possible errors:
		- 401 Unauthorized — missing/invalid Authorization header
		- 410 User does not exist — if user id from token not found
		- 403 Forbidden — if user's `isActive !== true`
		- 404 Not Found — `User not found` (thrown by `getUserService` if user missing)


**Bukkas** (`/api/bukkas`) — mounted with `authenticate` middleware

- **POST /api/bukkas/create**
	- Description: Create a Bukka for the authenticated owner.
	- Authentication: Requires JWT Bearer token and owner role (`authenticate` at mount, `isOwner` on route)
	- Request body (expected to follow `IBukka` / `BukkaSetupSchema`):
		- `name` (string, required) — short name for bukka (1..50 chars) [validation in `BukkaSetupSchema`]
		- `location` (object, required) — GeoJSON Point with:
			- `type`: must be `'Point'`
			- `coordinates`: tuple of two numbers: `[longitude, latitude]` (long between -180..180, lat between -90..90)
	- Success response (201): `data` is the created Bukka document (see model `Bukka` in [src/models/Bukka.ts](src/models/Bukka.ts#L1))
	- Example request:
		```json
		{
			"name": "Main Food Court",
			"location": {
				"type": "Point",
				"coordinates": [3.1357, 6.6753]
			}
		}
		```
	- Example response (201):
		```json
		{
			"success": true,
			"message": "Bukka created successfully.",
			"data": {
				"id": "607f1f77bcf86cd799439015",
				"ownerId": "507f1f77bcf86cd799439011",
				"name": "Main Food Court",
				"location": {
					"type": "Point",
					"coordinates": [3.1357, 6.6753]
				},
				"createdAt": "2026-06-05T11:25:00.000Z",
				"updatedAt": "2026-06-05T11:25:00.000Z"
			},
			"timestamp": "2026-06-05T11:25:00.000Z"
		}
		```
	- Possible errors (from `createBukkaService`):
		- 401 Unauthorized — `Unauthorized. User does not exist.` (if user id not found)
		- 401 Forbidden — `Forbidden` (if user.isActive !== true) — note: the code uses status 401 with message 'Forbidden' in one place
		- 409 Conflict — `You already have a registered bukka.` (if owner already has a bukka)
		- 400 / 500 — other validation or DB errors

- **GET /api/bukkas/me**
	- Description: Retrieve bukka(s) owned by the authenticated owner.
	- Authentication: Requires JWT Bearer token and owner role (`authenticate` + `isOwner`)
	- Success response (200): `data` contains an array of Bukka documents
	- Example response (200):
		```json
		{
			"success": true,
			"message": "Owner's bukka(s) retrieved successfully.",
			"data": [
				{
					"id": "607f1f77bcf86cd799439015",
					"ownerId": "507f1f77bcf86cd799439011",
					"name": "Main Food Court",
					"location": {
						"type": "Point",
						"coordinates": [3.1357, 6.6753]
					},
					"createdAt": "2026-06-05T11:25:00.000Z",
					"updatedAt": "2026-06-05T11:25:00.000Z"
				}
			],
			"timestamp": "2026-06-05T11:30:00.000Z"
		}
		```
	- Possible errors:
		- 401 Unauthorized / 403 Forbidden / 410 User does not exist — as per `authenticate`
		- 404 Not Found — `You have no bukka. Create a bukka to continue.` (thrown by `getOwnerBukkas`)


**Food Items** (`/api/bukkas/:bukkaId/food-items`) — mounted with `authenticate` middleware

- **POST /api/bukkas/:bukkaId/food-items/**
	- Description: Add food items (from the Food Catalog) to a bukka's menu. Uses bulk upsert; returns `upsertedCount` and `upsertedIds`.
	- Path parameters:
		- `bukkaId` (string, required) — ObjectId of the Bukka
	- Authentication: Requires JWT Bearer token and owner role (`isOwner` middleware applied on this route)
	- Request body (validated by `FoodItemIdsSchema` - [src/zod_schema/foodItemSchema.ts](src/zod_schema/foodItemSchema.ts#L1)):
		- `foodItemIds` (array of strings, required) — must contain at least one item id
	- Success response (201): `data` is an object `{ upsertedCount, upsertedIds }` (returned from `bulkWrite` result)
	- Example request:
		```json
		{
			"foodItemIds": ["507f1f77bcf86cd799439020", "507f1f77bcf86cd799439021"]
		}
		```
	- Example response (201):
		```json
		{
			"success": true,
			"message": "2 food item(s) has been added to your bukka.",
			"data": {
				"upsertedCount": 2,
				"upsertedIds": {
					"0": "707f1f77bcf86cd799439050",
					"1": "707f1f77bcf86cd799439051"
				}
			},
			"timestamp": "2026-06-05T11:35:00.000Z"
		}
		```
	- Possible errors (from `createFoodItem` service):
		- 404 Not Found — `Bukka not found. Food item creation failed.` (if bukkaId invalid)
		- 400 Bad Request — `Unkown food items identified. Create custom food item instead.` (if one or more provided ids are not found in FoodCatalog)
		- 401 / 403 / 410 — authentication/authorization errors from `authenticate` and `isOwner`

- **GET /api/bukkas/:bukkaId/food-items/**
	- Description: Retrieve a bukka's food menu items (documents from `FoodItem` collection for that bukka).
	- Path parameters:
		- `bukkaId` (string, required)
	- Authentication: Requires JWT Bearer token and owner role
	- Success response (200): `data` is an array of `FoodItem` documents. If the array is empty, the controller returns a message indicating the menu is empty.
	- Example response (200):
		```json
		{
			"success": true,
			"message": "Food menu retreived successfully.",
			"data": [
				{
					"id": "707f1f77bcf86cd799439050",
					"bukkaId": "607f1f77bcf86cd799439015",
					"foodCatalogId": "507f1f77bcf86cd799439020",
					"isCustom": false,
					"status": "unavailable",
					"createdAt": "2026-06-05T11:35:00.000Z",
					"updatedAt": "2026-06-05T11:35:00.000Z"
				}
			],
			"timestamp": "2026-06-05T11:40:00.000Z"
		}
		```
	- Possible errors:
		- 404 Not Found — `Bukka not found. Food item creation failed.` (service checks bukka existence and throws 404)
		- 401 / 403 / 410 — authentication/authorization errors


**Food Catalog** (`/api/food-catalog`) — mounted with `authenticate` and `isOwner` (owner-only)

- **GET /api/food-catalog/**
	- Description: Returns the system food catalog (documents from `FoodCatalog`). This route is mounted with `authenticate` and `isOwner`, therefore only authenticated owners can call it.
	- Authentication: Requires JWT Bearer token and owner role
	- Success response (200): `data` is an array of food catalog items containing selected fields (`name`, `imageUrl`, `id`, `category`), per `getFoodCatalog` service which uses `.select('name imageUrl id category')`.
	- Example response (200):
		```json
		{
			"success": true,
			"message": "Food Catalog retrieved successfully.",
			"data": [
				{
					"id": "507f1f77bcf86cd799439020",
					"name": "Jollof Rice",
					"imageUrl": "https://example.com/jollof-rice.jpg",
					"category": "Rice Dishes"
				},
				{
					"id": "507f1f77bcf86cd799439021",
					"name": "Fried Chicken",
					"imageUrl": "https://example.com/fried-chicken.jpg",
					"category": "Protein"
				}
			],
			"timestamp": "2026-06-05T11:45:00.000Z"
		}
		```
	- Possible errors:
		- 401 / 403 / 410 — authentication/authorization errors
		- 500 — unexpected DB errors


---

Appendix: Key types referenced

- `IUser` (see [src/types/types.ts](src/types/types.ts#L1)) — core user shape used throughout responses.
- `IBukka` (see [src/types/types.ts](src/types/types.ts#L1)) — shape for Bukka documents.
- `IFoodCatalog` (see [src/types/types.ts](src/types/types.ts#L1)) — shape for food catalog items.
- `IFoodItem` (see [src/types/types.ts](src/types/types.ts#L1)) — shape for food item documents.

