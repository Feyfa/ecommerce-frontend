# Audit Log

This document explains the frontend implementation for Audit Log phase 1 under Jira issue `TOK-1`.

## Status

Implemented. `/settings/audit-log` renders the dedicated authenticated audit timeline and its API-backed detail flow.

## Purpose

Audit Log lets an authenticated buyer or seller review important activity on the shared account. Phase 1 displays successful Register, Login, and user-initiated Logout activity only.

The page is a global settings route. It must remain available without requiring the user to change buyer or seller mode.

## Phase 1 Event Labels

The user-facing filter and event labels use:

```text
Semua Aktivitas
Register
Login
Logout
```

Rules:

- a completed registration displays `Akun berhasil dibuat` only;
- the first session after registration does not display a redundant login item;
- only successful activity is displayed;
- login method wording is shown only when the backend provides a verified method;
- the generic title is `Login` when no verified method is available;
- activity before feature deployment is not shown because no backfill is planned.

## Route and Component

The existing route remains:

```text
/settings/audit-log
```

The route renders `src/views/auth/settings/AuditLogView.vue`. The implementation follows the existing settings shell, responsive layout, Axios instance, Clerk-backed authentication handling, and Element Plus visual conventions.

## Desktop Layout

The desktop page uses an activity timeline/list rather than a wide data table:

```text
Audit Log
Pantau aktivitas login dan keamanan penting pada akun Anda.

[Semua Aktivitas] [30 Hari Terakhir]                 [Refresh]

+--------------------------------------------------------------+
| Login                                                        |
| Akun Anda berhasil login.                                    |
| Chrome - macOS - Desktop                                     |
| IP 103.10.xxx.xxx                                            |
| 14 Juli 2026, 07:30 WIB                           [Detail]   |
+--------------------------------------------------------------+

+--------------------------------------------------------------+
| Logout                                                       |
| Anda keluar dari akun pada perangkat ini.                    |
| Chrome - macOS - Desktop                                     |
| IP 103.10.xxx.xxx                                            |
| 13 Juli 2026, 22:15 WIB                           [Detail]   |
+--------------------------------------------------------------+

                    [Muat Aktivitas Lainnya]
```

The mobile page keeps the same information in a single-column compact card/list. The Detail action remains aligned to the top-right of the activity summary instead of separating the description from its metadata. Important content must not depend on hover.

The filter toolbar remains sticky at the top of the scrollable Settings content on viewports wider than 768px, so filters and Refresh stay accessible while reviewing long activity lists. At 768px and below, the toolbar keeps its normal document position because the stacked controls, especially a custom date range, would otherwise consume too much of the mobile viewport.

## Filters

Phase 1 event filter options are:

```text
Semua Aktivitas
Register
Login
Logout
```

The time filter provides:

```text
7 Hari Terakhir
30 Hari Terakhir
90 Hari Terakhir
Rentang Tanggal
```

The implemented default is 30 days.

The custom range uses a two-calendar range picker on desktop. On mobile it uses separate `Tanggal mulai` and `Tanggal selesai` inputs with one calendar each, preventing the calendar panel from overflowing narrow screens while preserving the same filter state and API parameters.

Changing any filter must:

1. discard the previous cursor;
2. clear or replace the current activity collection;
3. request the first page for the new filter;
4. ignore stale responses from the previous filter state.

## Cursor Pagination

`Muat Aktivitas Lainnya` is the user interface for backend cursor pagination; it does not mean the page is unpaginated.

Rules:

- load 20 activities initially;
- request the next page using the API `next_cursor`;
- append new items instead of replacing existing items;
- hide the button when `has_more` is false;
- disable duplicate requests while the next page is loading;
- keep already-loaded activity visible if the next-page request fails;
- allow retry without resetting the successful list.

The client must treat a cursor as belonging to the active filter set. A cursor from one event or date filter must never be reused after filters change.

## Activity Card

Each item may display:

- event icon and title;
- safe event description;
- verified authentication method when available;
- browser;
- operating system;
- device type;
- masked IP address;
- activity time in Asia/Jakarta;
- detail action.

The interface must not guess device or authentication values. Missing data should be omitted or represented by neutral wording.

## Detail Panel

Opening Detail shows one owner-scoped audit event:

```text
Detail Aktivitas

Login
14 Juli 2026, 07:30 WIB

Metode login      Google              (only when verified)
Perangkat         Desktop
Browser           Chrome
Sistem operasi    macOS
Alamat IP         103.10.xxx.xxx  [show icon]
Status            Berhasil
```

The panel may link to Security settings with wording such as:

```text
Tidak mengenali aktivitas ini?
Periksa dan keluarkan perangkat lain melalui halaman Keamanan.

[Buka Pengaturan Keamanan]
```

Do not add a non-functional report action.

## IP Reveal Behavior

The collection API supplies masked IP values. The full value is requested only through the authenticated detail flow for an event owned by the current user.

Default presentation:

```text
Alamat IP    103.10.xxx.xxx  [show icon]
```

After explicit reveal:

```text
Alamat IP    103.10.20.30    [hide icon]
```

Rules:

- keep IP masked by default;
- reveal only after an explicit user action;
- reset to masked when the detail panel closes;
- provide `Tampilkan alamat IP` and `Sembunyikan alamat IP` tooltips;
- provide equivalent `aria-label` values;
- make the control keyboard accessible;
- do not store the full IP in persistent frontend storage.

## Authentication Method

The frontend displays a method such as Google, email/password, or passkey only when the backend returns a value verified from reliable Clerk data.

If no verified method is available:

- render `Login`;
- omit the method row;
- do not infer a method from route state, button choice, local storage, or user-agent data.

## Logout Integration

The logout flow calls the authenticated backend audit endpoint before signing out from Clerk:

```text
record logout activity
  -> clear local auth state
  -> Clerk sign-out
  -> confirm the active browser client has no remaining session
  -> redirect to login
```

Audit recording is best-effort. A failure or timeout must not block local session cleanup or the Clerk sign-out attempt. Redirecting to Login is intentionally different: it happens only after Clerk confirms that the active browser client no longer contains a user or session. If Clerk cannot finish or confirm sign-out, the frontend keeps the public authentication flow blocked and displays a logout failure instead of allowing a new login to reuse stale identity state. The existing shared logout helper must remain the single frontend orchestration path rather than duplicating logout behavior across components.

## Time Presentation

The frontend parses machine-readable API timestamps and presents them in Asia/Jakarta using consistent Indonesian formatting, for example:

```text
14 Juli 2026, 07:30 WIB
```

Sorting is controlled by the backend cursor order. The frontend must not re-sort individual pages in a way that breaks cursor order.

Preset date boundaries are also derived from the Asia/Jakarta calendar rather than the browser's local timezone, so 7-, 30-, and 90-day requests remain stable for users whose device timezone differs from the application timezone.

## Loading, Empty, and Error States

Initial loading uses activity-card skeletons.

No activity:

```text
Belum ada aktivitas

Aktivitas register, login, dan logout akan tampil di halaman ini.
```

No filter result:

```text
Aktivitas tidak ditemukan

Tidak ada aktivitas yang sesuai dengan filter dan rentang tanggal.

[Reset Filter]
```

Initial request failure:

```text
Audit log gagal dimuat

Periksa koneksi Anda lalu coba kembali.

[Coba Lagi]
```

Next-page failure keeps existing items and displays a retry action near the load-more control.

Detail responses are versioned in memory. Closing a modal or opening a different activity invalidates the previous detail request so a slower stale response cannot replace the current modal state.

Global `401` behavior remains owned by the shared Axios/auth session interceptor. The view handles only non-authentication request failures.

## Accessibility

- Use semantic buttons for filters, refresh, detail, IP reveal, retry, and load-more actions.
- Give icon-only buttons accessible names and visible tooltips.
- Maintain visible keyboard focus.
- Do not encode event meaning through color alone.
- Make dialog or drawer focus behavior consistent with the project's Element Plus components.
- Keep mobile controls large enough for touch interaction.

## API Integration

The page consumes:

```http
GET /api/audit-logs
GET /api/audit-logs/{id}
```

Collection request parameters may include:

```text
event
from
to
cursor
per_page=20
```

The collection response supplies masked IP data and pagination metadata. The detail response may supply the full IP after backend ownership authorization. The frontend must not send a user id to select audit ownership.

## Out of Scope

Phase 1 does not include:

- failed authentication attempts;
- geolocation from IP;
- numbered pagination;
- export or download;
- full-text search;
- profile, address, bank account, product, checkout, transaction, or financial audit events;
- administrator audit access;
- historical backfill;
- retention controls.
