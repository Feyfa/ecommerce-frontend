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
  Local auth snapshot cleanup and the single shared expired-session flow for
  warning, Clerk sign-out, and login redirection.

- `src/axios.js`
  Request interceptor that attaches the current Clerk session token to protected API requests
  and globally handles backend `401` responses.

- `src/router/index.js`
  Route guard logic that distinguishes public routes, protected routes, and business-mode routes.

- `src/views/noauth/LoginView.vue`
  Custom login page that uses Clerk with the existing application design, including password login, Google login, passkey login, and second-factor verification.

- `src/views/noauth/ForgotPasswordView.vue`
  Custom forgot password page that uses Clerk reset password email codes.

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
/forgot-password
/auth/callback
```

The project intentionally keeps the pages separate because the ecommerce UX is already familiar with that pattern.

Even though the routes are separate, the underlying auth engine is still one system:

- the same Clerk app;
- the same browser session model;
- the same backend bootstrap endpoint;
- the same buyer or seller route rules after authentication.

The auth pages show the available auth actions on the same screen:

- Continue with Google
- Login dengan Passkey
- manual email and password form
- forgot password link from the login form

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

If Clerk returns `needs_second_factor`, the login form switches to the second-factor step instead of creating the local application session immediately.

If a Google OAuth account does not have a password credential yet and the user tries manual password login, Clerk may return an invalid verification strategy error.
The frontend maps that response to an Indonesian message that tells the user to sign in with Google or use the forgot password flow to create a new password.

Supported second-factor strategies in the custom login UI:

- TOTP authenticator code;
- backup code;
- email code when Clerk requires client-trust verification.

The login page stores a short pending second-factor timeout in session storage so refreshing the tab does not silently extend an old verification attempt.

### Passkey Login

The custom login page supports discoverable passkey login through Clerk WebAuthn.

Passkey login follows the same result handling as password login:

1. Clerk runs the passkey authentication ceremony.
2. If the sign-in is complete, the frontend activates the Clerk session.
3. If Clerk still requires second-factor verification, the login page shows the second-factor step.
4. After Clerk is complete, the frontend calls backend `GET /api/auth/me`.

Passkey cancellation should be treated as an informational user cancellation, not as a hard application error.

### Forgot Password

The custom forgot password page lives at:

```text
/forgot-password
```

The flow uses Clerk's `reset_password_email_code` strategy:

1. The user enters the account email.
2. Clerk sends a reset password code to that email.
3. The user enters the code.
4. The user sets a new password.
5. If Clerk completes the sign-in directly, the frontend activates the new Clerk session and bootstraps the app through `GET /api/auth/me`.
6. If Clerk returns `needs_second_factor`, the frontend sends the user back to login to complete the required additional verification.

The reset password form must keep the backend local password endpoints out of the flow. Clerk remains the source of truth for password reset.

### Manual Register

The frontend sends manual registration data to Clerk from the custom register form.

Email verification is required before the account is treated as fully active.

After verification completes:

1. Clerk browser session becomes active.
2. The frontend requests backend `GET /api/auth/me`.
3. The backend creates or updates the local app user.
4. The frontend redirects to the default authenticated route.

### OAuth Callback Errors

Google login and register share the Clerk callback route. Callback cancellation should not create a noisy failure toast.

When Clerk returns a meaningful OAuth error, the callback page redirects back to the intended auth page and attaches a safe auth error message in the query string. The target auth page consumes that message once and then removes the query value so the toast does not repeat after refresh.

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

### Global `401` handling

All protected API responses with HTTP status `401` are handled centrally by
the shared Axios response interceptor. Detection uses the HTTP status only and
does not depend on a particular backend `message` value.

The interceptor calls `handleExpiredAuthSession()`, which provides one shared
process for all concurrent `401` responses:

1. Mark the application as logging out and clear the local auth snapshot.
2. Show one `Sesi Berakhir` warning, even when several requests fail together.
3. Sign out the Clerk browser session once.
4. Reload the application at `/login`.

The rejected `401` request stops in the interceptor because the application is
already terminating the invalid session. Component-level `catch` handlers must
not repeat logout, local storage cleanup, session warnings, or redirects.

Network failures, backend `500` responses, and other non-`401` errors are still
rejected to the calling component. These failures may show a relevant retry or
connection notification, but they must not log out an otherwise valid user.

## Required Frontend Environment Variables

The frontend Clerk variables for the current phase are:

```text
VITE_CLERK_PUBLISHABLE_KEY=
VITE_CLERK_SIGN_IN_URL=/login
VITE_CLERK_SIGN_UP_URL=/register
VITE_FEATURE_CLERK_PASSKEY=true
VITE_FEATURE_CLERK_TOTP=true
```

Existing backend target variables still remain relevant:

```text
VITE_APP_BACKEND_BASE_URL=
VITE_SYMLINK_FOLDER=
```

The Clerk publishable key must be different per environment where applicable.

These Vite variables are compiled into the frontend bundle. Staging and
production Docker builds must therefore receive them as build arguments; adding
them only to the runtime environment of the final Nginx container is not enough.

Passkey and TOTP use separate feature flags. Local development defaults both
flags to enabled, while staging and production must explicitly keep them false
until the matching Clerk instances support those paid capabilities. When the
Passkey flag is false, the login entry is hidden. On the Security page, Passkey
and TOTP remain visible but disabled with a `Clerk Pro` badge and explanation.

## Stable Auth Processing UI

`src/components/auth/AuthProcessingPanel.vue` is the shared processing panel
for Login, Register, and the OAuth callback. Auth forms must not render while
the Clerk browser state is still resolving. Google callbacks also keep this
panel visible while Clerk completes the redirect and the frontend bootstraps
the local application session through `GET /api/auth/me`.

The OAuth callback uses neutral copy (`Memeriksa Status Login`) because the
provider result may still be successful, cancelled, or failed while Clerk is
resolving it. A cancelled consent flow therefore keeps a stable processing UI
until Clerk confirms the result, then returns to the originating auth form.

Google account linking from Security follows the same cancellation rule. The
callback is only finalized when Clerk exposes a verified Google external
account. Cancelling the provider flow returns to Security without calling the
backend link validator or showing a false connected state.

Before returning from any failed, cancelled, or expired Google-link callback,
the callback requests `POST /api/security/google/link/cleanup`. The backend
removes only unverified temporary Google external accounts and preserves every
verified provider account and email address. If cleanup cannot be confirmed,
the Security page shows the callback error together with the cleanup failure so
the user is not told that the account is clean when Clerk still reports the
temporary provider account.

A failed or expired Google external-account verification is different from
cancellation. The callback reads Clerk's verification status and error, returns
to Security with a link-specific message, and Security displays that message
once before removing it from the URL. Errors indicating that the Google
identity already belongs to another Clerk user are presented as an
account-linking conflict, not as an instruction to sign in.

The Security page only finalizes a link when the URL explicitly contains
`google_link=callback`. The session marker is used to recognize the flow on
the callback page, but it cannot independently trigger a success notification
during a later normal Google login. The marker is also cleared if creating the
external account fails before redirecting to Google.

The callback intercepts Clerk's internal completion navigation for account
linking. It first confirms that the Google external account is verified, then
navigates explicitly to Security with `google_link=callback`. This guarantees
that a successful link displays its notification once while a regular Google
login cannot reuse a stale link marker.

The callback reloads Clerk's `signIn` resource only for Google login flows.
Google account linking keeps the existing signed-in user and does not request a
sign-in resource reload.

This prevents a slow callback from briefly showing a logged-out form before
the authenticated session is ready.

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
