# TOK-88 Withdrawal Status QA

[TOK-88](https://muhammadjidan-31088882.atlassian.net/browse/TOK-88) holds a
withdrawal balance until Xendit confirms the transfer. The backend sends
`withdrawal_status` on balance history rows and adds `withdrawal_refund` rows
for failed withdrawals. This page shows that state. Local verification used
frontend branch `bug/jd-tok-88`.

## Local scenarios

- **TOK-88-FE-01 Status labels.** Passed. `processing`, `completed`, and
  `failed` map to `Diproses`, `Berhasil`, and `Gagal`. `processing` carries the
  hold notice and `failed` the refund notice.
- **TOK-88-FE-02 Rows without a tracked status.** Passed. A `null` status, a
  missing field, and an unknown value show no label.
- **TOK-88-FE-03 Refund rows.** Passed. A `withdrawal_refund` amount shows
  `+ Rp` in green, like income.
- **TOK-88-FE-04 Withdrawal notification.** Passed. A `processing` answer shows
  an info notification `Penarikan Sebesar Rp100.000 Sedang Diproses`. A
  `completed` answer keeps the existing success notification.
- **TOK-88-FE-05 Browser flow.** Pending, local. The user checks in the
  browser, against the local backend and the Xendit Test Mode business, that:
  - a new withdrawal shows `Diproses` and the hold notice;
  - after `withdrawal:check` sees `COMPLETED`, a reloaded history shows
    `Berhasil`;
  - a rejected withdrawal shows the error, then a reloaded `Gagal` row and a
    `Pengembalian Saldo` row.

## Local checks

- `npm run test:unit` went from 32 to 41 passing tests on Node 22.
- `npm run lint` and `npm run format:check` passed.
- `npm run build` passed with the existing chunk-size warning.

Vitest checks the component methods used by the history template and the
withdrawal handler with synthetic inputs. It does not render the page or call
the backend.
