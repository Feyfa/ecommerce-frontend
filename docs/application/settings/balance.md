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
- income amount in green with a `+ Rp` prefix;
- withdrawal amount in red with a `- Rp` prefix;
- transaction description and related invoice/reference text.

History amounts should use Indonesian thousands separators even when the API sends the price as a string. For example:

```text
+ Rp120.000
- Rp20.000
```

Incoming transaction descriptions should show the same invoice id that appears in the transaction detail modal.

The history title and date range control should be vertically aligned.

On desktop, the date range control uses the same compact `320px` proportion as Audit Log. It must remain wide enough to read the selected start and end dates without dominating the card header.

## Date Range

The balance history date filter uses responsive Element Plus date pickers that share the same date state and API request behavior:

- desktop uses one `el-date-picker` with `type="daterange"`;
- mobile uses separate start and end `el-date-picker` controls with `type="date"` so the calendar stays inside the narrow viewport;
- the start date cannot be later than the selected end date;
- the end date cannot be earlier than the selected start date;
- history reloads after both date boundaries are available.

The desktop picker should visually follow the Audit Log date filter style:

- one combined date range input;
- calendar icon;
- start date and end date separated by `-`;
- compact `Mulai` and `Selesai` placeholders;
- consistent border and focus state;
- popper placement that does not cover important content more than necessary.

On mobile, display `Tanggal mulai` and `Tanggal selesai` as full-width stacked fields with the same label, input, and vertical spacing proportions used by Audit Log.

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
