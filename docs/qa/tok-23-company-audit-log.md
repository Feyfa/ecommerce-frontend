# TOK-23 Company Audit Log QA

## Purpose

This document is the canonical frontend manual QA checklist for the TOK-23
Profil Toko audit experience. Keep evidence redacted and never capture tokens,
cookies, authorization headers, or full phone numbers.

## Profil Toko Activity

| ID           | Status | Action                                                                  | Expected Result                                                                                  |
| ------------ | ------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| TOK-23-FE-01 | ✅     | Open Profil Toko and save one or more changed values.                   | `Profil Toko Diperbarui` appears with an accurate safe summary.                                  |
| TOK-23-FE-02 | ✅     | Save Profil Toko without changing any value, then open Detail.          | Nama, email, phone, deskripsi, lokasi, and detail alamat all render with `Tetap`.                |
| TOK-23-FE-03 | ✅     | Open the first update of a field that was previously empty.             | The `Sebelum` value renders as `-`; the new value appears under `Sesudah` with status `Berubah`. |

## Store Photo Activity and Privacy

| ID           | Status | Action                                                            | Expected Result                                                                                       |
| ------------ | ------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| TOK-23-FE-04 | ✅     | Open a Profil Toko detail and press the phone reveal.             | Phone is masked initially; reveal shows the full value and closing/reopening resets the mask.         |
| TOK-23-FE-05 | ✅     | Upload or replace a store image, then open Audit Log.             | `Foto Toko Diperbarui` appears without a historical image preview, path, or URL.                      |
| TOK-23-FE-06 | ✅     | Delete a store image, then open Audit Log.                        | `Foto Toko Dihapus` appears without a historical image preview, path, or URL.                         |

## Filters and Regression

| ID           | Status | Action                                                               | Expected Result                                                               |
| ------------ | ------ | -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| TOK-23-FE-07 | ✅     | Select each event in the `Toko` filter group on desktop and mobile.  | Each filter reloads a fresh collection containing only the selected event.    |
| TOK-23-FE-08 | ✅     | Reopen authentication, product, address, and profile events.         | Existing cards and detail panels behave as before.                            |

## Evidence Notes

TOK-23-FE-01 was verified through the supplied screenshots: Profil Toko was
filled and saved successfully (`Success - Company Update Successfully`,
`PUT /api/company` status `200`), then Audit Log showed
`Profil Toko Diperbarui` with the summary
`Nama Toko, Email, Nomor Telepon, Deskripsi, Lokasi, dan Detail Alamat berubah`.
`GET /api/audit-logs` returned status `200`.

TOK-23-FE-03 was verified in the same Detail modal: every `Sebelum` value is
`-`, every `Sesudah` value shows the newly saved store data, and each row is
marked `Berubah`.

TOK-23-FE-04 was verified through the supplied screenshots: Detail opens with
phone masked as `0813****433`, the eye control reveals `081322445433`, and
closing then reopening Detail resets the phone to the masked value.

TOK-23-FE-02 was verified through the supplied screenshots: an unchanged Profil
Toko save returned `Success - Company Update Successfully` with
`PUT /api/company` status `200`, Audit Log shows a new
`Profil Toko Diperbarui` card with `Tidak ada perubahan`, and Detail marks
every field `Tetap`.

TOK-23-FE-05 and TOK-23-FE-06 were verified through the supplied screenshots:
store photo upload succeeded (`Foto toko berhasil diunggah`, `image` status
`200`), delete succeeded after confirmation (`Foto toko berhasil dihapus`),
Audit Log shows both `Foto Toko Diperbarui` and `Foto Toko Dihapus`, and both
Detail panels show text-only summaries without historical image previews,
paths, or URLs.

TOK-23-FE-07 was verified through the supplied screenshots: filtering by
`Profil Toko Diperbarui`, `Foto Toko Diperbarui`, and `Foto Toko Dihapus`
each returns only the matching cards, and returning to `Semua Aktivitas`
restores the full mixed timeline.

TOK-23-FE-08 was verified through the supplied screenshots: the mixed Audit
Log timeline still includes Toko events alongside Login, Logout, and
`Alamat Ditambahkan`, and Detail panels for address and authentication events
still render correctly without layout or console regressions beyond the usual
Clerk development-key warning.
