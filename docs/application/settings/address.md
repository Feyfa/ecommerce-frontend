# Address

This document explains the address settings page in `Pengaturan`.

## Applies To

Authenticated users with address management access.

## Purpose

The address settings page lets a user search, add, edit, delete, and choose a default shipping address.

The address UI is separated from the user profile tab because addresses can grow independently and are operationally different from personal identity fields.

## Main Files

- `src/components/user-profile/Alamat.vue`
  Owns address list, search, add modal, edit modal, validation state, delete action, and selected/default address behavior.

- `src/views/auth/settings/SettingsView.vue`
  Owns the `Alamat` settings menu entry, content header, and shared settings styling.

- `src/components/address/LocationPicker.vue`
  Owns the reusable Leaflet map, Geoapify search, reverse geocoding, marker,
  device location, and map-unavailable behavior shared with the seller form.

## Fields

Address modal fields:

```text
Place
nama
Phone
Pinpoint dan Detail Alamat
Tetapkan Sebagai Pilihan
```

Required fields:

- `place`
- `nama`
- `phone`
- a confirmed pinpoint and address detail

Optional fields:

- `Tetapkan Sebagai Pilihan`

## Behavior

- Address is its own settings route at `/settings/addresses`.
- The list can be searched by address name.
- Empty address state displays `Alamat Kosong`.
- Add and edit actions use a modal.
- Existing address cards show address identity, contact number, address text, edit/delete actions, and selected/default state.
- Verified address cards show `Pinpoint`; legacy manual rows show `Perlu Verifikasi` without mini maps.
- Add and edit forms use pinpoint only.
- Editing a legacy row keeps its old text visible and converts the same row after a successful pinpoint save.
- Legacy rows cannot become the selected address or pass checkout before verification.
- Geoapify failures preserve recipient inputs, restore the marker to the last
  verified coordinate, and block saving until verification is available.
- Search results and map movement are constrained to Indonesia in the UI; the backend performs the authoritative country validation.
- The shared picker observes its container size and refreshes Leaflet tiles when a hidden profile or modal becomes visible.
- The selected/default address indicator stays visible on the address row.

## Validation

The add/edit modal uses frontend validation before submit.

Error behavior:

- required label marker is visible;
- error message appears below the field;
- focused error field keeps a red border;
- checkbox alignment stays visually centered with its label.

## Modal Rules

The add/edit address modal should keep:

- one title;
- clear labels;
- required markers;
- red error border on focus;
- primary action on the left;
- cancel action on the right;
- checkbox row aligned with text.

## Store/API Usage

Address actions are handled through Vuex actions in `src/store.js`.

Add and edit failures without an HTTP response use a connection-safe fallback
message and always release the related loading state so the form can be retried.

Keep backend field names unchanged when building payloads:

- `place`
- `nama`
- `phone`
- `location_source`
- `latitude`
- `longitude`
- `geoapify_place_id`
- `formatted_address`
- `address_detail`
- selected/default flag field used by the existing backend contract.

## Audit Side Effects

Adding, editing, deleting, and selecting a buyer address each produce one entry
in [Audit Log](audit-log.md). The address UI itself does not record those
events; the backend derives them from the successful mutation. Reads are not
audited, and coordinates never appear in the audit timeline.

## QA Coverage

- [TOK-8 Pinpoint Address QA](../../qa/tok-8-pinpoint-address.md) tracks
  buyer-address UI verification.
- [TOK-21 Address Audit Log QA](../../qa/tok-21-address-audit-log.md) tracks how
  those address activities appear in Audit Log.
