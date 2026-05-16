# ADR 014 — Authentication Controller Separation

---

## Problem
The platform supports two registration paths — phone/password and Google OAuth. A decision was needed on whether to handle both in one controller or separate them.
Options considered

---

## Options Considered
- One controller handling both registration paths
- Two separate controllers with a shared createUser service

---

## Decision
**Two separate controllers with a shared createUser service**. The separation is not about payload differences but about fundamental flow differences. Phone/password registration is a straightforward HTTP request — client sends data, server processes it. Google OAuth starts on the client, travels to Google's servers, and returns to the server via a callback URL. These are two completely different request lifecycles that cannot be cleanly handled in one controller. The shared createUser service eliminates code duplication at the database write level while keeping the controllers focused on their respective flows.