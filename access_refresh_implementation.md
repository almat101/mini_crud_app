# Access Token & Refresh Token Implementation Guide

## Overview
This guide describes how to migrate from a single JWT token (stored in an HTTP-only cookie with 7-day expiry) to a dual-token system using an access token and a refresh token.

---

## Key Concepts

- **Access Token**: Short-lived (e.g., 15 minutes). Used to authenticate API requests. If stolen, it expires quickly.
- **Refresh Token**: Long-lived (e.g., 7 days). Used only to obtain a new access token. Should be stored securely and be revocable.

---

## Storage Strategy

- **Access Token**: Store in an HTTP-only, secure cookie (e.g., `access_token`).
- **Refresh Token**: Store in a separate HTTP-only, secure cookie (e.g., `refresh_token`).
- **Refresh Token Reference**: Store a hash or identifier in Redis for revocation and validation.

---

## Steps to Implement

### 1. Set Up Redis
- [x] Add Redis to your Docker Compose setup.
- [x] Install a Redis client library for Node.js (e.g., `ioredis` or `redis`).
- [x] Create a utility to connect to Redis and export the client.

### 2. Update Token Generation Logic
- [x] Create two functions for generate token: one for access token (short expiry), one for refresh token (long expiry).
- [x] Use same secret, with different `type` to differentiate.

### 3. Update `/login` Endpoint
- [x] Generate both access token and refresh token on successful login.
- [x] Store the refresh token (or its hash) in Redis with the user ID as part of the key.
- [x] Set both tokens as HTTP-only, secure cookies with appropriate `maxAge`.

### 4. Create `/refresh` Endpoint
- [ ] Accept the refresh token from the cookie.
- [ ] Verify the refresh token (signature and expiry).
- [ ] Check if the refresh token exists in Redis (not revoked).
- [ ] If valid, issue a new access token (and optionally rotate the refresh token).
- [ ] Set the new access token as an HTTP-only cookie.

### 5. Update `/logout` Endpoint
- [ ] Remove the refresh token from Redis (revoke it).
- [ ] Clear both access and refresh token cookies.

### 6. Update `/checkIsAuth` Endpoint
- [ ] Verify the access token from the cookie.
- [ ] If expired, optionally instruct the frontend to call `/refresh`.

### 7. Update Frontend (if needed)
- [ ] Handle 401 responses by calling `/refresh` to get a new access token.
- [ ] On logout, call `/logout` to clear cookies and revoke the refresh token.

### 8. Testing
- [ ] Test login: both tokens are set as cookies.
- [ ] Test API access: access token is validated.
- [ ] Test refresh: new access token is issued.
- [ ] Test logout: both cookies are cleared, refresh token is revoked.
- [ ] Test expired access token: refresh flow works.
- [ ] Test revoked refresh token: refresh fails, user must log in again.

---

## Endpoints Summary

| Endpoint        | Method | Purpose                                         |
|-----------------|--------|-------------------------------------------------|
| `/auth/login`   | POST   | Authenticate, issue access + refresh tokens     |
| `/auth/refresh` | POST   | Issue new access token using refresh token      |
| `/auth/logout`  | POST   | Revoke refresh token, clear cookies             |
| `/auth/check`   | GET    | Verify access token, return auth status         |

---

## Notes
- Never store tokens in localStorage (XSS risk).
- Always use `httpOnly`, `secure`, and `sameSite` cookie options.
- Consider refresh token rotation for extra security.
- Set Redis TTL to match refresh token expiry.

---

## Estimated Time
- With Redis and JWT experience: 1–2 days
- Learning as you go: 3–5 days