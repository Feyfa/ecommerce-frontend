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
- **TOK-88-FE-05 Browser flow.** Passed locally on November 25, 2026, except
  the rejection case. The user ran the local backend with `schedule:work` and
  the Xendit Test Mode business:
  - A seller withdrawal of Rp10.000 from a Rp15.000 balance showed the info
    notification `Penarikan Sebesar Rp10.000 Sedang Diproses`, a Rp5.000
    balance, and a `Diproses` row with the hold notice. `POST
    /api/saldo-withdraw` returned HTTP 200.
  - Checks ran at 22:08 and 22:10 and both read `PENDING`. Xendit settled the
    disbursement at 22:10, and the 22:15 check read `COMPLETED`. A reloaded
    history then showed `Berhasil` without the hold notice, and the balance
    stayed Rp5.000.
  - The rejection case (`Gagal` row and `Pengembalian Saldo` row) was not run
    in the browser, because no verified way to make Test Mode reject a
    disbursement was available. Backend feature tests and FE-01 to FE-03
    cover it.

  Without a disbursement webhook, the label changes only at the next scheduled
  check, so it can trail Xendit by up to the current backoff delay.

## Local checks

- `npm run test:unit` went from 32 to 41 passing tests on Node 22.
- `npm run lint` and `npm run format:check` passed.
- `npm run build` passed with the existing chunk-size warning.

Vitest checks the component methods used by the history template and the
withdrawal handler with synthetic inputs. It does not render the page or call
the backend.
