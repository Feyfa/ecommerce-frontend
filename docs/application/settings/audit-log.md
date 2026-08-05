# Audit Log

This document explains the frontend Audit Log foundation from `TOK-1`, the product activity extension under `TOK-16`, the buyer address activity extension under `TOK-21`, the Pengaturan Pengguna extension under `TOK-22`, and the Profil Toko extension under `TOK-23`.

## Status

Implemented. `/settings/audit-log` renders the dedicated authenticated audit timeline and its API-backed detail flow.

## Purpose

Audit Log lets an authenticated buyer or seller review important activity on the shared account. It displays successful Register, Login, user-initiated Logout, seller product create/update/delete, buyer address create/update/delete/select, Pengaturan Pengguna update, profile photo activity, Profil Toko update, and store photo activity.

The page is a global settings route. It must remain available without requiring the user to change buyer or seller mode.

## Event Labels

The user-facing filter and event labels use:

```text
Semua Aktivitas
Register
Login
Logout
Produk Ditambahkan
Produk Diperbarui
Produk Dihapus
Alamat Ditambahkan
Alamat Diperbarui
Alamat Dihapus
Alamat Dipilih
Pengaturan Pengguna Diperbarui
Foto Profil Diperbarui
Foto Profil Dihapus
Profil Toko Diperbarui
Foto Toko Diperbarui
Foto Toko Dihapus
```

Rules:

-   a completed registration displays `Akun Berhasil Dibuat` only;
-   the first session after registration does not display a redundant login item;
-   only successful activity is displayed;
-   login method wording is shown only when the backend provides a verified method;
-   the generic title is `Login` when no verified method is available;
-   activity before feature deployment is not shown because no backfill is planned.

## Route and Component

The existing route remains:

```text
/settings/audit-log
```

The route renders `src/views/auth/settings/AuditLogView.vue`. The implementation follows the existing settings shell, responsive layout, Axios instance, Clerk-backed authentication handling, and Element Plus visual conventions.

## Responsive Layout

The Settings shell owns the `Audit Log` title and description. Audit Log places its filter controls in the same header area instead of rendering a standalone full-width filter card:

```text
Audit Log                         [Semua Aktivitas] [30 Hari] [↺ disabled]
Pantau aktivitas penting di akun Anda.
```

On wide desktop layouts, the activity and time controls remain inline with the page header. When the available settings-header area reaches compact width, those controls move into a purple `Filter` popover. On every non-mobile layout, the compact trigger stays right-aligned on the same row as `Pantau aktivitas penting di akun Anda.`; only mobile places the full-width trigger below that description. The `Rentang Waktu` select stays visible after `Rentang Tanggal` is selected, allowing users to switch directly back to the 7, 30, or 90-day presets. Selecting or reselecting `Rentang Tanggal` opens its calendar close below the same control without adding another visible header input. Duplicate select events are coalesced so the calendar is not immediately dismissed inside the compact popover. The calendar remains below its control instead of flipping upward across the filter interface. After both dates are selected, the closed select displays a compact value such as `28–29 Agu 2026`, while its dropdown option remains named `Rentang Tanggal`. Closing the calendar before completing a range restores the previously applied preset; if the previous applied state was also custom, the safe fallback is 30 days. Reset is visible but disabled while filters are at their defaults, then becomes active after a filter changes. It retains an accessible label and tooltip.

At compact laptop and tablet widths, the trigger and reset action remain right-aligned beside the header copy:

```text
Audit Log
Pantau aktivitas penting di akun Anda.         [Filter] [↺ disabled]
```

At 640px and below, the full-width `Filter` trigger sits below the description and opens a bounded panel containing the activity and time controls. The panel has a small inset from the viewport edges, a pointer, enough width for its labels, and closes when the user interacts outside it. The time select and hidden calendar anchor suppress the software text keyboard because neither accepts free-form text. The custom calendar opens below the time control, follows the available width on small phones, and remains capped and horizontally centered on tablet-sized viewports instead of stretching across or drifting to one side of the content area. When a custom range is cancelled from the compact panel, the first outside interaction closes only the calendar and restores the applied preset; a subsequent outside interaction closes the Filter panel. Filter changes keep the existing immediate reload behavior, so no additional Apply step is introduced.

Changing or resetting a filter reloads the collection while keeping current cards visible. If that request fails, the existing collection remains available with an inline retry action. The header target is resolved before filter controls are teleported, and leaving Audit Log invalidates pending responses so they cannot interfere with the destination settings page.

The activity collection remains a single-column timeline/list rather than a wide data table. Each row uses the same three visual lines for authentication and product events:

```text
+--------------------------------------------------------------+
| Login                                            [Detail]    |
| Akun Anda berhasil login.                                    |
| Chrome - macOS - Desktop • IP 103.10.xxx.xxx • 14 Juli 2026 |
+--------------------------------------------------------------+

+--------------------------------------------------------------+
| Produk Diperbarui                                [Detail]    |
| Aneka Ragam Pakaian • Stok berubah.                         |
| Chrome - macOS - Desktop • IP 103.10.xxx.xxx • 14 Juli 2026 |
+--------------------------------------------------------------+
```

The mobile page keeps the same information in a single-column compact card/list. Important content must not depend on hover. The filter panel is revealed only when requested, so it does not permanently consume a full row of the activity viewport.

## Filters

Event filters are grouped as:

```text
Semua Aktivitas
Akun
  Register
  Login
  Logout
Produk
  Produk Ditambahkan
  Produk Diperbarui
  Produk Dihapus
Alamat
  Alamat Ditambahkan
  Alamat Diperbarui
  Alamat Dihapus
  Alamat Dipilih
Profil
  Pengaturan Pengguna Diperbarui
  Foto Profil Diperbarui
  Foto Profil Dihapus
Toko
  Profil Toko Diperbarui
  Foto Toko Diperbarui
  Foto Toko Dihapus
```

The event select is searchable by its user-facing label. Its dropdown uses a viewport-aware maximum height and keeps scrolling available as more event groups are added.

The time filter provides:

```text
7 Hari Terakhir
30 Hari Terakhir
90 Hari Terakhir
Rentang Tanggal
```

The implemented default is 30 days.

The custom range uses a two-calendar range picker anchored below the unchanged `Rentang Waktu` select. On narrower viewports, the calendar panel is constrained to the viewport and its month sections stack vertically when required. The selected range preserves the same filter state and API parameters without rendering separate date inputs in the header or filter panel.

Changing any filter must:

1. discard the previous cursor;
2. keep the current activity collection visible while the replacement request is loading;
3. request the first page for the new filter and replace the collection only after that request succeeds;
4. keep the current collection with an inline retry message if the replacement request fails;
5. ignore stale responses from the previous filter state.

## Cursor Pagination

`Muat Aktivitas Lainnya` is the user interface for backend cursor pagination; it does not mean the page is unpaginated.

Rules:

-   load 20 activities initially;
-   request the next page using the API `next_cursor`;
-   append new items instead of replacing existing items;
-   hide the button when `has_more` is false;
-   disable duplicate requests while the next page is loading;
-   keep already-loaded activity visible if the next-page request fails;
-   allow retry without resetting the successful list.

The client must treat a cursor as belonging to the active filter set. A cursor from one event or date filter must never be reused after filters change.

## Activity Card

Each item may display:

-   event icon and title;
-   safe event description;
-   verified authentication method when available;
-   browser;
-   operating system;
-   device type;
-   masked IP address;
-   activity time in Asia/Jakarta;
-   detail action.

The interface must not guess device or authentication values. Missing data should be omitted or represented by neutral wording.

### Product Activity Cards

-   Product collection rows use the same three visual lines as authentication rows: activity title, one combined product/outcome description, and compact device/IP/time metadata.
-   Create and delete cards show the product name followed by one compact price, stock, and photo-count summary from the safe snapshot.
-   Update cards show the product name followed by one concise summary of data and photo changes. Verbose field-by-field values remain in Detail.
-   Product events use distinct icons and colors, but labels remain the primary meaning.
-   Image changes are metadata only. The UI never expects or renders historical photo previews.

### Address Activity Cards

-   Address collection rows use the same three visual lines as authentication and product rows: activity title, one combined address/outcome description, and compact device/IP/time metadata.
-   Create and delete cards show the address label followed by the recipient name and the masked phone number from the safe snapshot.
-   Select cards show the address label, the recipient name, and `Jadi alamat utama`.
-   Update cards show the address label followed by one concise summary of the fields that changed. Verbose before/after values remain in Detail.
-   The second line is always assembled from structured snapshot fields. The UI never parses the formatted address string to derive a city or region, because that string is produced by the map provider and may change.
-   When a snapshot is missing, the card falls back to the event description so the three-line layout is preserved.

### Company Activity Cards

-   Company collection rows use the same three visual lines as other domains: activity title, one combined outcome description, and compact device/IP/time metadata.
-   Update cards summarize changed field labels such as `Nama Toko berubah` or `Tidak ada perubahan` when the save was identical.
-   Image upload and delete cards use the backend event description. The UI never expects or renders historical store photo previews, paths, or URLs.

### Category Dispatch

The card description and the detail sections are selected by event category rather than by a chain of product-specific conditions:

```text
collectionDescription(audit) -> product | address | profile | company | event description
isAuditCategory(audit, category) -> section visibility
```

A newly audited domain adds one branch and its own formatter instead of extending shared conditions. The security note that offers to sign out other devices is shown only for the `authentication` category.

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

For product events, Detail additionally shows:

-   create: a two-column `Data`/`Nilai awal` table containing the product name, price, stock, and photo count;
-   update: a stable `Data`/`Sebelum`/`Sesudah`/`Status` table containing name, price, stock, and photo count, including unchanged values marked `Tetap`;
-   update image metadata: a separate `Perubahan foto` card that lists only actual additions, removals, cover changes, or order changes, with neutral wording when nothing changed;
-   delete: a two-column `Data`/`Nilai terakhir` table and an explanation that the product has been deleted.

An identical successful update keeps the historical values visible and marks them `Tetap` instead of inventing changes. Product details end after their metadata/status content; the login/security-device warning and Security link remain limited to authentication events.

For buyer address events, Detail additionally shows:

-   create: a two-column `Data`/`Nilai awal` table containing the address label, recipient name, phone, location, address detail, and main-address status;
-   update: a stable `Data`/`Sebelum`/`Sesudah`/`Status` table containing the address label, recipient name, phone, location, and address detail, including unchanged values marked `Tetap`;
-   delete: a two-column `Data`/`Nilai terakhir` table, an explanation that the address has been deleted, and the replacement address when the system promoted one;
-   select: a `Data`/`Nilai saat ini` table plus the previous main address.

The value-column heading follows the event so the reader is not misled about whether the address still applies: `Nilai awal` for create, `Nilai saat ini` for select, and `Nilai terakhir` for delete.

An identical successful update keeps every historical value visible and marks each row `Tetap` instead of hiding rows or inventing changes, matching the product update table. The backend still records only the fields that really changed; the unchanged rows are filled from the stored snapshot at display time.

The detail response is owner-scoped, so it carries the full recipient name, phone number, and address detail that the collection response masks or omits. Coordinates are never present in either response.

For Profil Toko events, Detail additionally shows:

-   update: a stable `Data`/`Sebelum`/`Sesudah`/`Status` table containing nama toko, email, phone, deskripsi, lokasi, and detail alamat, including unchanged values marked `Tetap`;
-   image upload or delete: a short text summary only, driven by `has_company_image`, never a historical image preview, path, or URL.

Company phone values reuse the address/profile reveal control. Collection responses keep the phone masked; owner detail starts masked and reveals the full number only after an explicit eye action.

The product and address change tables share one stylesheet. Their `Data` column must stay wide enough for the longest label of every audited domain, because labels do not wrap and would otherwise overflow into the `Sebelum` column. A new audited domain with longer labels widens that shared column for all domains rather than introducing its own table style.

Widening a column must not raise the table minimum width past the space the detail modal actually offers, which is the panel width minus the modal and card padding. The horizontal scroll under the change table exists for narrow screens; if it appears on a full-size desktop panel, the minimum width is too large rather than the modal too narrow.

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

## Phone Reveal Behavior

Address details reuse the IP reveal pattern for the recipient phone number, including its inline eye control rather than a separate wide button:

```text
Nomor Telepon    0918****282     [show icon]
Nomor Telepon    091818828282    [hide icon]
```

The control always sits next to the phone value itself: in the value column of the snapshot table, and in the `Sesudah` column of the update table. Keeping it out of the label column prevents it from overflowing the fixed-width `Data` column. One reveal state covers every phone value in the open detail panel. The reveal state resets whenever a detail panel is opened, reloaded, or closed, so a revealed number never carries over to the next event.

Address detail panels reuse the product detail palette so audited domains remain visually consistent instead of introducing a separate color per domain.

Rules:

-   keep IP masked by default;
-   reveal only after an explicit user action;
-   reset to masked when the detail panel closes;
-   provide `Tampilkan alamat IP` and `Sembunyikan alamat IP` tooltips;
-   provide equivalent `aria-label` values;
-   make the control keyboard accessible;
-   do not store the full IP in persistent frontend storage.

## Authentication Method

The frontend displays a method such as Google, email/password, or passkey only when the backend returns a value verified from reliable Clerk data.

If no verified method is available:

-   render `Login`;
-   omit the method row;
-   do not infer a method from route state, button choice, local storage, or user-agent data.

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

Aktivitas akun dan pengelolaan produk akan tampil di halaman ini.
```

No filter result:

```text
Aktivitas tidak ditemukan

Tidak ada aktivitas yang sesuai dengan filter dan rentang tanggal yang dipilih.

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

-   Use semantic buttons for the compact filter trigger, reset, detail, IP reveal, retry, and load-more actions.
-   Give icon-only buttons accessible names and visible tooltips.
-   Maintain visible keyboard focus.
-   Do not encode event meaning through color alone.
-   Make dialog or drawer focus behavior consistent with the project's Element Plus components.
-   Keep mobile controls large enough for touch interaction.

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

The collection response supplies masked IP data and pagination metadata. Product responses may additionally supply `subject`, `product_snapshot`, `changes`, and `image_changes`. The detail response may supply the full IP after backend ownership authorization. The frontend must not send a user id to select audit ownership.

## Out of Scope

The current scope does not include:

-   failed authentication attempts;
-   geolocation from IP;
-   numbered pagination;
-   export or download;
-   full-text search;
-   bank account, checkout, transaction, or financial audit events;
-   administrator audit access;
-   historical backfill;
-   retention controls.

## QA Coverage

-   [TOK-16 Product Audit Log QA](../../qa/tok-16-product-audit-log.md) tracks
    product audit UI verification.
-   [TOK-23 Company Audit Log QA](../../qa/tok-23-company-audit-log.md) tracks
    Profil Toko audit UI verification.
