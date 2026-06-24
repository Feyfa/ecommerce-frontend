# Clerk Authentication

This document explains the frontend authentication direction after the project moved from a Sanctum-centered browser token flow to a Clerk-centered session flow.

The goal is to keep one clear reference for the Vue auth pages, route guard behavior, Clerk session handling, backend bootstrap flow, and the cleanup rules after the legacy Sanctum auth UI was removed.

## Purpose

The Clerk migration on the frontend exists to solve three problems at once:

- Move the main auth session source from `localStorage token` to Clerk.
- Keep the existing ecommerce login and register UI instead of switching to generic hosted auth pages.
- Keep buyer and seller navigation rules inside the application, while identity authentication moves to Clerk.

## Current Phase

The current frontend phase is the post-implementation cleanup phase.

What already changed:

- Clerk is treated as the main auth session source.
- The custom `/login` and `/register` pages now expose Google and manual Clerk flows.
- The frontend can bootstrap the local app session by calling backend `GET /api/auth/me`.
- The router no longer treats the old `/tokenvalidation` flow as the primary bootstrap path.
- The temporary legacy form fallback and legacy browser token fallback have been removed.

## Main Decisions

The frontend decisions that define the Clerk migration are:

- Clerk is the main auth session source.
- `/login` and `/register` stay separated during the migration.
- Manual email and password accounts require email verification.
- Buyer and seller remain application business modes, not Clerk auth modes.
- Local storage or session storage may still be used for UI-only state, but not as the source of auth validity.
- Route protection still exists in the frontend, but it now follows Clerk auth state first.
- Google login and manual login using the same verified email should resolve to one user identity.
- Logout must sign out Clerk, clear relevant local app state, and redirect to the auth page.

## Main Files

The current Clerk-related frontend files are:

- `src/clerk.js`
  Clerk browser bootstrap helpers and session token access.

- `src/authBridge.js`
  The frontend bridge between Clerk browser session state and backend `GET /api/auth/me`.

- `src/authSession.js`
  Local auth snapshot cleanup helpers and Clerk sign-out browser handling.

- `src/axios.js`
  Request interceptor that attaches the current Clerk bearer token to protected API requests.

- `src/router/index.js`
  Route guard logic that distinguishes public routes, protected routes, and business-mode routes.

- `src/views/noauth/LoginView.vue`
  Custom login page that uses Clerk with the existing application design.

- `src/views/noauth/RegisterView.vue`
  Custom register page that uses Clerk with the existing application design.

- `src/views/noauth/ClerkCallbackView.vue`
  Callback entry used to complete Clerk flows that return through the browser.

- `src/components/sidebar/SettingPreview.vue`
  Sidebar logout entry that now follows the Clerk-aware logout flow.

## Auth Routes and UI Flow

The phase-one Clerk routes remain:

```text
/login
/register
/auth/callback
```

The project intentionally keeps the pages separate because the ecommerce UX is already familiar with that pattern.

Even though the routes are separate, the underlying auth engine is still one system:

- the same Clerk app;
- the same browser session model;
- the same backend bootstrap endpoint;
- the same buyer or seller route rules after authentication.

The auth pages show both methods on the same screen:

- Continue with Google
- manual email and password form

This keeps the UX consistent and avoids making one route feel social-only and the other route feel manual-only.

## Session Model

The new frontend session model is:

1. Clerk determines whether the browser session is authenticated.
2. The frontend retrieves a Clerk session token when it needs to call protected backend endpoints.
3. The frontend calls backend `GET /api/auth/me`.
4. The backend resolves the local app user and returns user and company data.
5. The frontend stores the returned user and company snapshot for current UI compatibility.

Important rule:

```text
The browser may still keep local UI state,
but it no longer decides by itself whether the user is authenticated.
```

## Route Guard Strategy

The frontend still owns route guard behavior because Clerk does not understand the application business structure by itself.

The route guard now has two different responsibilities:

- Auth guard
  Determines whether the browser has a valid authenticated identity.

- App guard
  Determines whether the current route fits buyer or seller mode.

The practical behavior is:

- Public routes such as `/login` and `/register` stay accessible for logged-out users.
- If a logged-in user enters an auth route, the frontend redirects them to the default authenticated page.
- Protected routes require a valid Clerk-backed backend bootstrap result.
- Buyer and seller route restrictions are still controlled by the app because they are business rules, not identity rules.

## Backend Bootstrap From Frontend

The main backend bootstrap endpoint for the Clerk flow is:

```text
GET /api/auth/me
```

The frontend uses this endpoint after Clerk session authentication succeeds.

The purpose of `GET /api/auth/me` is not the same as the old `/tokenvalidation` behavior.

The old flow mainly existed to validate a stored local token.

The new flow exists to:

- verify the Clerk-backed request server-side;
- resolve the local app user;
- resolve the related company snapshot;
- rebuild the app session state used by the current frontend.

The router keeps the latest successful `/api/auth/me` result fresh in memory for two minutes.
During that window, internal SPA navigation can reuse the existing local snapshot instead of calling `/api/auth/me` again.
The cache is intentionally memory-only, so a browser refresh or a cleared auth session still forces a new backend check.
After `/api/auth/me` succeeds, the frontend also clears the temporary OAuth return URL from session storage so a stale auth form fallback does not remain after a successful login.

## Login and Register Flow

### Google Login

The frontend starts Clerk Google authentication from the custom auth page.

After Google and Clerk complete successfully:

1. Clerk browser session becomes active.
2. The frontend requests backend `GET /api/auth/me`.
3. The backend resolves the local app user.
4. The frontend redirects to the default authenticated route.

### Manual Login

The frontend sends email and password to Clerk from the custom login form.

After Clerk login succeeds:

1. Clerk browser session becomes active.
2. The frontend requests backend `GET /api/auth/me`.
3. The backend resolves the local app user.
4. The frontend redirects to the default authenticated route.

### Manual Register

The frontend sends manual registration data to Clerk from the custom register form.

Email verification is required before the account is treated as fully active.

After verification completes:

1. Clerk browser session becomes active.
2. The frontend requests backend `GET /api/auth/me`.
3. The backend creates or updates the local app user.
4. The frontend redirects to the default authenticated route.

## Logout Behavior

The frontend logout behavior is:

1. Sign out from Clerk.
2. Clear the relevant local app state.
3. Redirect to `/login`.

## Error and Failure Handling

The frontend should treat Clerk as an external dependency and fail safely.

### If the user is not logged in

- Login and register should be blocked when Clerk auth is clearly unavailable.
- The page should show a clear message that authentication is temporarily unavailable.

### If the user is already logged in

- A temporary Clerk verification issue should not immediately imply a total UI crash.
- The frontend may mark the session as unstable and try to re-bootstrap safely.
- If the backend can no longer verify protected requests, the frontend must stop protected actions, clear the session, and redirect to login.

## Required Frontend Environment Variables

The frontend Clerk variables for the current phase are:

```text
VITE_CLERK_PUBLISHABLE_KEY=
VITE_CLERK_SIGN_IN_URL=/login
VITE_CLERK_SIGN_UP_URL=/register
```

Existing backend target variables still remain relevant:

```text
VITE_APP_BACKEND_BASE_URL=
VITE_SYMLINK_FOLDER=
```

The Clerk publishable key must be different per environment where applicable.

## Cleanup Notes

The frontend should not reintroduce these removed auth paths:

- legacy Sanctum browser token bootstrap;
- compatibility fallback to the old login or register form;
- frontend password-change logic that talks to a local password endpoint;
- local TFA controls that duplicate identity-provider MFA.

The important current boundary is:

```text
Clerk owns authentication identity.
The frontend owns business-mode routing and UI state.
The backend owns final request verification and local app user resolution.
```
