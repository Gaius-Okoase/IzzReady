# IzzReady — System Architecture

Version: 1.0
Status: Pilot
Last Updated: May 2026

---

## 1. Overview

IzzReady is a two-sided web platform connecting local bukka owners with nearby customers through real-time food availability updates. The backend is a stateless REST API built with Node.js, Express, and TypeScript, persisting data to MongoDB Atlas and delivering browser notifications via the Web Push protocol.
This document describes the internal structure of the server, the relationships between system components, and the lifecycle of both HTTP requests and background jobs.

---

## 2. Architectural Pattern

The server follows a three-layer architecture, separating HTTP concerns, business logic, and data access into distinct boundaries.
Routing Layer
Maps incoming HTTP requests to the correct controller based on URL path and HTTP method. Contains no logic. Middleware — authentication, authorisation, and input validation — is applied at this layer before requests reach controllers.
Controller Layer
Receives requests from the router. Extracts relevant data from params, body, and headers. Delegates to the service layer for all business logic. Shapes and sends the final HTTP response. Never interacts with the database directly.
Service Layer
Contains all business logic. Completely HTTP-agnostic — no request or response objects exist here. Services are callable by both controllers and background jobs without modification. This is where cross-collection operations, status transitions, and notification triggers are orchestrated.
Data Access Layer
The only layer that interacts with MongoDB. All queries, updates, and deletions are written here. Isolating database interaction in this layer means any future database change is contained to one place.

---

## 3. System Components

**Client**: The browser. Communicates with the server exclusively via HTTP. Responsible for collecting user coordinates through the browser Geolocation API and storing push subscription objects returned by the Web Push API.

**Server**: A Node.js and Express application written in TypeScript. Handles all incoming HTTP requests, enforces authentication and authorisation through middleware, and delegates business logic to the service layer. Also hosts the node-cron background job scheduler as part of the same process.

**MongoDB Atlas**: The primary database. Stores all application data across four collections — users, bukkas, food_items, and queue_entries. A 2dsphere index on the bukka location field enables geospatial queries using the $nearSphere operator, powering the nearby bukkas feature.

**node-cron**: A background job scheduler running inside the same Node.js process as Express. Executes a timer check function every minute, querying food_items for documents where the timer timestamp has elapsed and status remains coming soon. For each match, status is updated to awaiting confirmation and the bukka owner is notified to confirm readiness. Calls service layer functions directly, maintaining separation of concerns.

**Google OAuth 2.0**: Handles Google sign in. The client redirects to Google's authentication servers. On success, Google redirects to the server's callback endpoint with an authorisation code. The server exchanges this for user information, then creates or retrieves the corresponding user document and issues a JWT.

**Web Push**: Delivers browser notifications to queued customers when a food item is confirmed ready. On notification opt-in, the browser generates a push subscription object which the client forwards to the server for storage as pushNotifToken on the user document. When food is confirmed ready, the server sends push payloads to all relevant subscription tokens via the Web Push protocol, routed through the browser vendor's push service.

4. Request Lifecycle
   Every HTTP request follows this path through the system:

Request arrives at the router
Middleware executes in sequence — authentication verifies the JWT, authorisation confirms the user has permission, validation checks the request body
Controller extracts request data and calls the appropriate service function
Service executes business logic and calls the data access layer
Data access layer queries MongoDB and returns the result
Result travels back up through the service to the controller
Controller sends the HTTP response to the client

5. Background Job Lifecycle
   node-cron fires the timer check independently of any HTTP request, every minute.
   Timer expiry job:

Query food_items for documents where timer is less than or equal to current time and status is coming soon
Update matched documents status to awaiting confirmation
Notify the bukka owner via web push to confirm readiness

Owner confirmation flow (triggered by HTTP request):

Owner sends PATCH request updating food item status to izz ready
Controller calls the food item service
Service queries queue_entries for all documents matching the food item ID
For each entry, retrieves the customer's pushNotifToken from users
Sends web push notification to each customer
Deletes all queue entries for that food item
Returns success to the controller

The timer job is idempotent by design. Once a food item status transitions to awaiting confirmation it no longer satisfies the query condition, preventing duplicate processing on subsequent runs.

6. Authentication Strategy
   Two authentication methods are supported. Phone number and password issues a JWT on successful credential verification. Google OAuth 2.0 redirects through Google's authentication flow and issues a JWT on callback. Both methods converge on the same JWT-based session model post-authentication.
   Access tokens are short-lived. Refresh token rotation is used to issue new access tokens without requiring re-authentication. Refresh tokens are invalidated on logout and rotated on every use.
   Google OAuth users who have not yet provided a phone number are flagged with isProfileComplete set to false. All protected routes check this flag and redirect incomplete profiles to the profile completion endpoint before granting access.

7. Authorisation Model
   Two roles exist — customer and owner. Owner is a superset of customer, inheriting all customer permissions plus additional owner-specific capabilities. Role is stored as a single string on the user document. Authorisation middleware enforces role requirements per route.

8. Geolocation
   Bukka coordinates are stored as GeoJSON Point objects in MongoDB. A 2dsphere index on the location field enables efficient distance-based queries. The GET /bukkas endpoint accepts latitude and longitude as query parameters and returns bukkas within a defined radius using MongoDB's $nearSphere operator, sorted by proximity.

9. Components Deferred to Post-Pilot
   Redis — will store temporary OTP codes with a five-minute TTL once phone number verification is introduced.
   Termii — will deliver OTP codes via SMS once phone number verification is introduced.

10. Environment Strategy
    Three environments are maintained — local development, staging, and production. All environment-specific configuration including database connection strings, JWT secrets, Google OAuth credentials, and Web Push keys are managed through environment variables. No secrets are committed to version control.
