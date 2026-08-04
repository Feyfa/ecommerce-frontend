# TOK-22 Profile Audit Log QA

## Purpose

This document is the canonical frontend manual QA checklist for the TOK-22
profile audit experience. Keep evidence redacted and never capture tokens,
cookies, authorization headers, or full phone numbers.

## Pengaturan Pengguna Activity

| ID           | Status  | Action                                                                  | Expected Result                                                                                  |
| ------------ | ------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| TOK-22-FE-01 | ✅      | Open Profil Pengguna.                                                   | The editable-form section title is `Pengaturan Pengguna`.                                       |
| TOK-22-FE-02 | ✅      | Change one or more Pengaturan Pengguna values, then open Audit Log.    | `Pengaturan Pengguna Diperbarui` appears with an accurate safe summary.                         |
| TOK-22-FE-03 | ✅      | Save Pengaturan Pengguna without changing any value, then open Detail. | Phone, birth date, and gender all render with `Tetap`.                                          |
| TOK-22-FE-04 | ✅      | Open the first update of a field that was previously empty.            | The `Sebelum` value renders as `-`; the new value appears under `Sesudah` with status `Berubah`. |

## Profile Photo Activity and Privacy

| ID           | Status  | Action                                                            | Expected Result                                                                                       |
| ------------ | ------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| TOK-22-FE-05 | ✅      | Open a Pengaturan Pengguna detail and press the phone reveal.    | Phone is masked initially; reveal shows the full value and closing/reopening resets the mask.         |
| TOK-22-FE-06 | ✅      | Upload or replace a profile image, then open Audit Log.          | `Foto Profil Diperbarui` appears without a historical image preview, path, or URL.                   |
| TOK-22-FE-07 | ✅      | Delete a profile image, then open Audit Log.                     | `Foto Profil Dihapus` appears without a historical image preview, path, or URL.                      |

## Filters and Regression

| ID           | Status  | Action                                                               | Expected Result                                                               |
| ------------ | ------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| TOK-22-FE-08 | ✅      | Select each event in the `Profil` filter group on desktop and mobile. | Each filter reloads a fresh collection containing only the selected event. |
| TOK-22-FE-09 | ✅      | Reopen authentication, product, and address events.                 | Existing cards and detail panels behave as before.                            |

## Evidence Notes

TOK-22-FE-01 through TOK-22-FE-04 were manually verified through the supplied
screenshots: the renamed section is visible, successful saves create
`Pengaturan Pengguna Diperbarui` cards, and an unchanged save produces a detail
table whose three rows are all marked `Tetap`. The first update of initially
empty profile fields renders `-` in `Sebelum` and the new values as `Berubah`.
TOK-22-FE-05 was verified through the supplied screenshots: phone starts
masked, reveals after the eye control is used, and returns to masked after the
detail modal is closed and opened again.

TOK-22-FE-08 was verified with the supplied desktop and mobile screenshots:
each Profil filter option returns only its selected profile activity, and the
mobile collection and detail panel remain readable.

TOK-22-FE-06 and TOK-22-FE-07 were verified through the supplied upload and
delete flow screenshots. Their timeline cards and detail panels contain only
the action result and no historical image preview, path, or URL.

TOK-22-FE-09 was verified through the supplied regression screenshots:
authentication Login and Logout details, product create/update/delete details,
and address update details all render successfully with their existing
category-specific content.
