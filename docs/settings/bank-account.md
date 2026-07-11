# Bank Account

This document explains the bank account settings page in `Pengaturan`.

## Applies To

Buyer and seller.

## Purpose

The bank account settings page lets a user manage bank accounts used for withdrawal.

## Main Files

- `src/views/auth/PaymentView.vue`
  Owns bank account search, account list, add account modal trigger, and delete action.

- `src/views/auth/SaldoView.vue`
  Uses bank account data in the withdrawal modal.

- `src/views/auth/settings/SettingsView.vue`
  Owns the shared settings shell and route placement.

## Bank Account List

Each bank account row should show:

- bank logo;
- bank name;
- account number;
- account owner name;
- delete action.

The row should feel like a modern bank account item:

- logo on the left;
- account detail in the middle;
- action on the right;
- clear border and spacing.

## Add Bank Account

The add account modal includes:

- bank selector;
- account number input;
- account owner check action;
- account owner result;
- cancel action;
- add account action.

Inputs and buttons should use the shared account UI style.

## Delete Bank Account

Delete should use a danger visual style instead of a traditional gray button.

Do not remove account data without confirmation if the action becomes destructive and irreversible in the current flow.

## Store/API Usage

Bank account actions are handled through Vuex actions in `src/store.js`.

Keep backend field names unchanged when building payloads:

- bank identifier/name field used by the existing API;
- account number field;
- account owner field.
