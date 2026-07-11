# Security

This document explains the security tab in `Akun Saya`.

## Applies To

Buyer and seller.

## Purpose

The security tab lets a user change password and manage two-factor authentication.

## Main Files

- `src/components/account/AccountSecurity.vue`
  Owns password form, TFA select, validation state, submit behavior, and TFA update behavior.

- `src/views/auth/AccountView.vue`
  Owns the shared account shell and tab placement.

## Change Password

Fields:

```text
Password Lama
Password Baru
Konfirmasi Password Baru
```

Required fields:

- `oldPassword`
- `newPassword`
- `confirmPassword`

Validation rules:

- old password must not be empty;
- new password must not be empty;
- confirm password must not be empty when the confirm field is validated;
- confirm password must match new password.

The confirm password field should not show an error just because the user starts typing in `Password Baru`.

Confirm password validation starts when:

- the confirm field has been touched;
- the confirm field already has content;
- the user clicks `Simpan Password`.

This prevents premature validation noise while preserving frontend validation on submit.

## TFA

TFA is part of the security tab.

Fields:

```text
Status TFA
```

Options:

- `Off`
- `Email`
- `Phone`

The TFA section follows the same hierarchy as `Ubah Password`:

- title first;
- status badge near the title;
- input and save button below.

`Status TFA` label should not behave like a clickable select trigger. Use a non-label text element when necessary so hovering or clicking the title area does not activate the select.

## UI Rules

- Password and TFA live in one security card.
- `Ubah Password` appears first.
- TFA appears below a divider.
- Password fields use Element Plus password inputs.
- TFA uses Element Plus select.
- Save buttons use primary purple styling.

## Store/API Usage

Password change dispatches the password update action in `src/store.js`.

TFA update dispatches the user update action with the existing user fields plus `tfa`.

Keep backend field names unchanged:

- `oldPassword`
- `newPassword`
- `tfa`

