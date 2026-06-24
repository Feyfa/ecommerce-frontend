# Balance

This document explains the balance settings page in `Pengaturan`.

## Applies To

Buyer and seller.

## Purpose

The balance settings page lets a user view active balance, review balance history, filter history by date range, and withdraw available balance to a bank account.

## Main Files

- `src/views/auth/SaldoView.vue`
  Owns balance summary, history list, date range filter, withdraw modal, and withdrawal form behavior.

- `src/views/auth/settings/SettingsView.vue`
  Owns the shared settings shell and route placement.

## Balance Summary

The summary card shows:

- total active balance;
- `Saldo Penghasilan`;
- `Saldo Refund`;
- `Tarik Saldo` action.

## History

The history card shows:

- `History` title;
- Element Plus date range picker;
- balance transaction rows;
- income amount in green;
- transaction description and related invoice/reference text.

The history title and date range control should be vertically aligned.

The date range control should not be unnecessarily wide. Keep it compact enough to read the selected start and end dates without dominating the card header.

## Date Range

The balance history date filter uses Element Plus `el-date-picker` with `type="daterange"`.

The picker should visually follow the transaction date filter style:

- one combined date range input;
- calendar icon;
- start date and end date separated by `-`;
- consistent border and focus state;
- popper placement that does not cover important content more than necessary.

## Withdraw Modal

The withdraw modal includes:

- `Nominal` input;
- `Rp` prefix;
- `Tarik Semua` shortcut;
- bank account selection list;
- cancel action;
- withdraw submit action.

The `Rp` prefix and amount input should feel like one soft input group, not two unrelated controls.

## Validation

Withdrawal should not submit when required input or selected bank account data is invalid.

Use visual disabled state for unavailable actions.

## Store/API Usage

Balance and withdrawal actions are handled through Vuex actions in `src/store.js`.

Keep backend field names unchanged when building payloads for balance history and withdrawal.
