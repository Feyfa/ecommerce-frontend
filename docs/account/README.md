# Account

This document explains the current account feature from the frontend side.

The goal is to keep a lightweight map of `Akun Saya` so future UI, validation, and behavior changes have one clear reference without reading every account component first.

## Purpose

The account feature collects personal, company, financial, and address settings into one account page.

Current supported areas:

- Buyer user profile.
- Seller company profile.
- Buyer address management.
- Balance overview and withdrawal.
- Bank account management.

## Main Files

- `src/views/auth/AccountView.vue`
  Main account shell. It owns role-aware tab order, selected tab state, tab query sync, shared account layout, and shared account styling overrides.

- `src/views/auth/SaldoView.vue`
  Balance tab content, history, date range filter, and withdrawal modal trigger.

- `src/views/auth/PaymentView.vue`
  Bank account tab content, account list, add account modal trigger, and delete action.

- `src/views/auth/buyer/UserProfileView.vue`
  Buyer profile tab content and image preview placement.

- `src/views/auth/seller/CompanyProfileView.vue`
  Seller company profile tab content and company image preview placement.

- `src/components/user-profile/UserSetting.vue`
  Buyer editable user profile form.

- `src/components/user-profile/Alamat.vue`
  Buyer address list and add/edit address modal.

- `src/components/company-profile/CompanySetting.vue`
  Seller editable company profile form.

## Tab Order

Buyer tabs:

```text
User Profile -> Alamat -> Saldo -> Rekening Bank
```

Seller tabs:

```text
Company Profile -> Saldo -> Rekening Bank
```

The account page uses identity-first ordering. Profile/company information appears first and financial settings follow.

## Documents

- [Shared UI](shared-ui.md)
  Shared visual and validation rules used across account tabs.

- [User Profile](profile.md)
  Buyer profile form, image behavior, required fields, and save rules.

- [Company Profile](company-profile.md)
  Seller company form, image behavior, required fields, and save rules.

- [Address](address.md)
  Buyer address tab, address cards, add/edit modal, required fields, and default address behavior.

- [Balance](balance.md)
  Balance summary, history list, date range filter, and withdrawal modal.

- [Bank Account](bank-account.md)
  Bank account list, add account modal, and delete behavior.

## Role Rules

Shared tabs are documented once and list the roles they apply to.

Role-specific tabs are kept separate:

- `profile.md` applies to buyer only.
- `company-profile.md` applies to seller only.
- `address.md` applies to buyer only.
- `balance.md` and `bank-account.md` apply to buyer and seller.

Do not duplicate shared feature documentation into separate buyer and seller documents unless the behavior becomes meaningfully different.
