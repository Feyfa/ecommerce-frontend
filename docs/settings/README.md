# Settings

This document explains the current account settings feature from the frontend side.

The goal is to keep a lightweight map of `Pengaturan` so future UI, validation, and behavior changes have one clear reference without reading every account component first.

## Purpose

The settings feature collects personal, company, financial, and address settings into one global settings page.

Current supported areas:

- Buyer user profile.
- Seller company profile.
- Buyer address management.
- Balance overview and withdrawal.
- Bank account management.
- Coming soon placeholders for security, audit log, notifications, and support report.

## Main Files

- `src/views/auth/settings/SettingsView.vue`
  Main settings shell. It owns the settings sidebar, mobile settings dropdown, route content header, shared layout, and shared styling overrides.

- `src/views/auth/settings/ComingSoonView.vue`
  Reusable coming soon content for settings routes that are visible but not implemented yet.

- `src/views/auth/SaldoView.vue`
  Balance settings content, history, date range filter, and withdrawal modal trigger.

- `src/views/auth/PaymentView.vue`
  Bank account settings content, account list, add account modal trigger, and delete action.

- `src/views/auth/buyer/UserProfileView.vue`
  Buyer profile settings content and image preview placement.

- `src/views/auth/seller/CompanyProfileView.vue`
  Seller company profile settings content and company image preview placement.

- `src/components/user-profile/UserSetting.vue`
  Buyer editable user profile form.

- `src/components/user-profile/Alamat.vue`
  Buyer address list and add/edit address modal.

- `src/components/company-profile/CompanySetting.vue`
  Seller editable company profile form.

## Route Structure

The settings page uses route paths instead of query-based tabs:

```text
/settings/profile
/settings/addresses
/settings/store
/settings/balance
/settings/bank-accounts
/settings/security
/settings/audit-log
/settings/notifications
/settings/support-report
```

Legacy routes are preserved as redirects:

```text
/account?tab=profile  -> /settings/profile
/account?tab=alamat   -> /settings/addresses
/account?tab=saldo    -> /settings/balance
/account?tab=rekening -> /settings/bank-accounts
/saldo                -> /settings/balance
/rekening             -> /settings/bank-accounts
```

The settings page is available in buyer and seller mode. The router guard treats settings routes as global authenticated routes so users do not need to switch active account mode just to manage settings.

## Menu Order

Settings menu sections:

```text
Akun
- Profil Pengguna
- Alamat
- Keamanan

Bisnis / Toko
- Profil Toko

Keuangan
- Saldo
- Rekening Bank

Aktivitas
- Audit Log

Preferensi
- Notifikasi

Bantuan
- Support Report
```

Desktop uses the left settings sidebar. Mobile uses a custom dropdown menu above the content to avoid cramped multi-column navigation.

## Documents

- [Shared UI](shared-ui.md)
  Shared visual and validation rules used across settings pages.

- [User Profile](profile.md)
  Buyer profile form, image behavior, required fields, and save rules.

- [Company Profile](company-profile.md)
  Seller company form, image behavior, required fields, and save rules.

- [Address](address.md)
  Buyer address settings page, address cards, add/edit modal, required fields, and default address behavior.

- [Balance](balance.md)
  Balance summary, history list, date range filter, and withdrawal modal.

- [Bank Account](bank-account.md)
  Bank account list, add account modal, and delete behavior.

## Role Rules

Shared settings pages are documented once and list the roles they apply to.

Role-specific settings pages are kept separate:

- `profile.md` applies to the user profile settings page.
- `company-profile.md` applies to the store profile settings page.
- `address.md` applies to the address settings page.
- `balance.md` and `bank-account.md` apply to buyer and seller.

Do not duplicate shared feature documentation into separate buyer and seller documents unless the behavior becomes meaningfully different.
