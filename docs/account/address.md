# Address

This document explains the buyer address tab in `Akun Saya`.

## Applies To

Buyer only.

## Purpose

The address tab lets a buyer search, add, edit, delete, and choose a default shipping address.

The address UI is separated from the user profile tab because addresses can grow independently and are operationally different from personal identity fields.

## Main Files

- `src/components/user-profile/Alamat.vue`
  Owns address list, search, add modal, edit modal, validation state, delete action, and selected/default address behavior.

- `src/views/auth/AccountView.vue`
  Owns the buyer `Alamat` tab entry and shared account styling.

## Fields

Address modal fields:

```text
Place
nama
Phone
Alamat
Tetapkan Sebagai Pilihan
```

Required fields:

- `place`
- `nama`
- `phone`
- `alamat`

Optional fields:

- `Tetapkan Sebagai Pilihan`

## Behavior

- Buyer address is its own account tab.
- The list can be searched by address name.
- Add and edit actions use a modal.
- Existing address cards show address identity, contact number, address text, edit/delete actions, and selected/default state.
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

Keep backend field names unchanged when building payloads:

- `place`
- `nama`
- `phone`
- `alamat`
- selected/default flag field used by the existing backend contract.

