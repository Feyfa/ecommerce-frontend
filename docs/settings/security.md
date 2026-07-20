# Security Settings

This document explains the frontend behavior for the Clerk-backed `Keamanan` settings page.

The goal is to keep the account security scope clear so the page stays aligned with Clerk-owned authentication features and does not rebuild local authentication behavior.

## Purpose

The security settings page lets authenticated users review sign-in methods, manage additional account protection, and monitor active sessions.

This page is intentionally Clerk-first. Laravel remains responsible for the authenticated application boundary and safe backend endpoints, while identity security features stay owned by Clerk wherever possible.

## Route

```text
/settings/security
```

Current route name:

```text
settings_security
```

The route renders:

```text
src/views/auth/settings/SecurityView.vue
```

## Main Files

- `src/views/auth/settings/SecurityView.vue`
  Owns the security settings page, Clerk user actions, modals, TOTP setup, passkey management, Google linking, and active session UI.

- `src/router/index.js`
  Registers `/settings/security` as a protected settings child route.

- `src/clerk.js`
  Provides Clerk helper functions for OAuth callback markers, second-factor timeout state, and user-friendly Clerk error messages.

- `src/components/partials/ModalView.vue`
  Shared modal wrapper used by security credential and management dialogs.

## UI Structure

```text
Keamanan
Kelola cara masuk, perlindungan akun, dan perangkat yang sedang aktif.

Status Keamanan Akun
- Cara Masuk
  - Password
  - Google
  - Passkey
- Perlindungan Tambahan
  - Two-Factor Authentication

Perangkat & Sesi Aktif
- Perangkat saat ini
- Perangkat lain
- Keluar semua perangkat
```

## Sign-In Methods

The `Cara Masuk` section summarizes the Clerk-backed ways the user can enter the account.

### Password

Rules:

- Show `Belum dibuat -> Buat password` when the Clerk user does not have a password.
- Show `Aktif -> Ubah password` when the Clerk user already has a password.
- Password setup and updates use Clerk `user.updatePassword`.
- Password changes may require Clerk session re-verification.
- The form sends the raw password values to Clerk only. It does not call a local Laravel password endpoint.

### Google

Rules:

- Show `Terhubung` when the Clerk user has a valid Google external account connected.
- Show `Belum terhubung -> Hubungkan` when Google is available but not connected.
- Google linking uses Clerk session re-verification and retries external-account creation after verification succeeds.
- Clerk's prebuilt re-verification modal uses the official Indonesian `idID` localization.
- Google linking starts a Clerk OAuth redirect and marks the callback as a Google-link flow.
- After OAuth returns, the frontend distinguishes a verified connection, a failed or expired verification, and a user cancellation.
- Clerk verification failures return to Security with a user-friendly error that is displayed once and then removed from the URL.
- User cancellation returns to Security without a noisy failure notification.
- Failed, cancelled, and expired link callbacks call backend `POST /api/security/google/link/cleanup` before returning to Security.
- Callback cleanup removes only unverified temporary Google external accounts; verified provider accounts and email addresses are preserved.
- A new Google login/register flow also performs this cleanup when it detects a stale signed-in Clerk session on the public auth page, then confirms the browser session is fully signed out before starting OAuth.
- If callback cleanup fails, the frontend includes that failure in the one-time Security notification instead of silently reporting a clean state.
- Only a verified Google external account continues to backend `POST /api/security/google/link/validate`.
- The backend validates that the linked Google email matches the local authenticated user email.
- If the linked Google account is invalid, the backend removes invalid provider accounts through Clerk and the frontend shows an error.
- While callback validation is in progress, the frontend keeps the security summary in its loading state instead of rendering Clerk's temporary linked state.
- The frontend reloads the final security summary before showing the Google-link result notification.

### Passkey

Rules:

- Passkey is a sign-in method, not a separate local credential.
- Show `Belum aktif -> Tambah` when the Clerk user has no passkeys.
- Show `Aktif -> Kelola` when the Clerk user has one or more passkeys.
- New passkeys are created through Clerk `user.createPasskey`.
- Existing passkeys can be viewed in the passkey modal.
- Existing passkeys can be deleted from the user's Clerk account.
- Creating or deleting passkeys may require Clerk session re-verification.
- A cancelled passkey browser dialog should be treated as cancellation, not as a hard failure.

## Additional Protection

The `Perlindungan Tambahan` section currently contains Clerk TOTP MFA.

### Two-Factor Authentication

Rules:

- MFA is managed through Clerk TOTP methods, not through the old local `users.tfa` field.
- Show `Belum aktif -> Aktifkan` when TOTP is disabled.
- Show `Aktif -> Kelola` when TOTP is enabled.
- Setup opens a modal with a QR code and secret key.
- The QR code is generated in the frontend from Clerk's TOTP URI.
- The user verifies a TOTP code before TOTP is enabled.
- After TOTP is enabled, the page can create and show backup codes.
- Backup codes can be copied or downloaded as a text file.
- Existing TOTP users can regenerate backup codes.
- Existing TOTP users can disable TOTP.
- Sensitive TOTP actions may require Clerk session re-verification.

## Active Sessions

The sessions panel lets users review where their account is currently signed in.

Preferred item layout:

```text
Chrome di macOS
Perangkat ini
Aktif sekarang
Jakarta, Indonesia

Safari di iPhone
Terakhir aktif 2 jam lalu
Jakarta, Indonesia
[Keluar]
```

Rules:

- Mark the current session with `Perangkat ini`.
- Show `Keluar` only for sessions that are not the current session.
- Show `Keluar Semua Perangkat` for ending other active sessions.
- Do not show the application domain such as `app.ecommerce.dev`; every session belongs to the same app, so the domain is redundant.
- Location is optional. Hide it if Clerk does not provide enough location data.
- Device and browser names should have fallbacks when Clerk activity data is incomplete.

## API Usage

The frontend consumes backend endpoints shaped like this:

```text
GET  /api/security/summary
GET  /api/security/sessions
POST /api/security/google/link/validate
POST /api/security/sessions/{id}/revoke
POST /api/security/sessions/revoke-others
```

`GET /api/security/summary` returns `security.sign_in_methods` and `security.additional_protections`.

`GET /api/security/sessions` returns `session_data.current_session_id` and `session_data.sessions`.

`POST /api/security/google/link/validate` validates that a newly linked Google external account belongs to the same email as the local authenticated user.

Session rows use:

```text
id
status
is_current
is_mobile
device_label
location_label
last_active_at
last_active_at_timestamp
```

The session icon uses `is_mobile` from the backend instead of inferring the
device category from the localized `device_label` text.

## UI States

The page supports these states:

- Loading state for account security summary.
- Loading state for active sessions.
- Empty state when only the current session exists.
- Error state when Clerk or backend security data cannot be loaded.
- Confirmation modal before revoking one session.
- Confirmation modal before revoking all other sessions.
- Credential modal for password setup and password change.
- Passkey management modal.
- TOTP setup modal with QR code and secret key.
- Backup code modal with copy and download actions.
- Success toast after security actions succeed.

## Out of Scope

The following items are intentionally excluded from the current security settings implementation:

- OTP Email as an additional login protection setting.
- Local password change endpoint.
- Local TFA management through `users.tfa`.
- Audit log.
- Business activity history such as bank account changes, address changes, store profile changes, balance withdrawal, and transaction events.
- Account self-delete.

Email code verification that exists during manual registration remains a registration verification flow, not a security settings feature.

## Data Source

Preferred data ownership:

```text
Clerk
- sign-in methods
- Google external account connection
- password status
- MFA status
- passkeys
- sessions

Laravel
- authenticated application boundary
- safe frontend-facing security endpoints
- user ownership checks before exposing or revoking sessions
- Google link validation against the local authenticated user
```

## Implementation Notes

- Keep the page inside the existing settings shell.
- Reuse the current settings card style, border radius, spacing, typography, and badge style.
- Use Clerk browser user methods for credential changes that belong to identity.
- Use backend security endpoints for session listing, session revoke, revoke others, and Google link validation.
- Keep desktop actions aligned to the right of each row.
- On mobile, stack row content and make destructive session actions easier to tap.
- Use clear Indonesian UI copy, but keep this documentation in English to match repository documentation rules.
