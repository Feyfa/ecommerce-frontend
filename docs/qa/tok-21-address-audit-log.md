# TOK-21 Address Audit Log QA

## Purpose

This document is the canonical frontend manual QA checklist for the TOK-21 buyer
address audit experience. Backend event persistence, masking, rollback, and
response-contract coverage is tracked at
`backend-repo:/docs/qa/tok-21-address-audit-log.md`.

Run these scenarios in local or staging. Keep evidence redacted and never
capture tokens, cookies, authorization headers, full phone numbers, or pinpoint
coordinates.

## Address Activity Cards

| ID           | Status | Action                                                                     | Expected Result                                                                                                          |
| ------------ | ------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| TOK-21-FE-01 | ✅     | Add a buyer address, then open Audit Log.                                  | One `Alamat Ditambahkan` card shows three lines: title, `label • nama penerima • telepon tersamar`, and device/IP/time.  |
| TOK-21-FE-02 | ✅     | Change the phone number and pinpoint location of an address.               | One `Alamat Diperbarui` card summarises only the fields that changed on its second line.                                 |
| TOK-21-FE-03 | ✅     | Save an address without changing any value.                                | The card second line reads `Tidak ada perubahan` instead of inventing changes.                                           |
| TOK-21-FE-04 | ✅     | Select a different main address.                                           | One `Alamat Dipilih` card ends its second line with `Jadi alamat utama`.                                                 |
| TOK-21-FE-05 | ✅     | Delete an address.                                                         | One `Alamat Dihapus` card keeps the same three-line layout using the last known snapshot.                                |

## Detail Panel and Privacy

| ID           | Status | Action                                                                     | Expected Result                                                                                                          |
| ------------ | ------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| TOK-21-FE-06 | ✅     | Open the detail of an `Alamat Ditambahkan` event.                          | The snapshot table shows label, recipient, masked phone, location, address detail, and main-address status.               |
| TOK-21-FE-07 | ✅     | Press the phone reveal control inside the detail panel.                    | The full phone number appears; closing and reopening the detail returns it to the masked state.                           |
| TOK-21-FE-08 | ✅     | Open the detail of an `Alamat Diperbarui` event.                           | All address fields appear as `Sebelum`/`Sesudah` rows, with each row marked `Berubah` or `Tetap` like the product table.  |
| TOK-21-FE-09 | ✅     | Open the detail of an `Alamat Dipilih` and an `Alamat Dihapus` event.      | The previous main address and the automatically chosen replacement address are named where applicable.                    |
| TOK-21-FE-10 | ✅     | Inspect the collection and detail responses in the browser network tab.    | No latitude, longitude, or Geoapify place id appears in either response.                                                  |
| TOK-21-FE-11 | ✅     | Open the detail of any address event.                                      | The security note that offers to sign out other devices is not shown for address activity.                                |

## Filters and Regression

| ID           | Status | Action                                                                     | Expected Result                                                                                                          |
| ------------ | ------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| TOK-21-FE-12 | ✅     | Open the activity filter and select each option in the `Alamat` group.     | Each filter reloads a fresh collection containing only the selected address event.                                        |
| TOK-21-FE-13 | ✅     | Switch between an address filter and a product filter after paginating.    | The collection resets correctly without reusing the previous cursor.                                                      |
| TOK-21-FE-14 | ✅     | Reopen existing authentication and product events.                         | Their cards and detail panels behave exactly as before the shared category dispatcher was introduced.                     |

## Evidence Notes

TOK-21-FE-10 was verified directly on the collection response, which showed the
masked phone, the shortened recipient name, no `address_detail`, and no
coordinates. The detail response was verified through the rendered detail panel,
which displays the full phone number and address detail that only that response
can supply; its coordinate exclusion is additionally asserted by the backend test
`coordinates_are_never_stored_or_exposed`.

