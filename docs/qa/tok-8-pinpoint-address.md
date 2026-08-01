# TOK-8 Pinpoint Address QA

## Purpose

This document is the canonical frontend manual QA checklist for the TOK-8
buyer address, store location, and checkout workflows. Backend API, provider,
authorization, and snapshot coverage is tracked at
`backend-repo:/docs/qa/tok-8-pinpoint-address.md`.

Run these scenarios through the application UI. Do not edit requests or
database rows to manufacture a successful result. A controlled database change
may establish an otherwise unreachable legacy or stale-state precondition when
the scenario explicitly requires it; all actions and expected recovery after
that setup must still be verified through the UI. Run other legacy-address
scenarios only when the required `Perlu Verifikasi` row already exists;
otherwise treat them as not applicable and rely on backend automated coverage.

The completed states were migrated from the former backend feature checklists.
Those checklists did not record separate evidence, so their status is preserved
without inventing evidence.

## Buyer Pinpoint

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-8-FE-01 | ✅ | Add a buyer address with a Pinpoint location and address detail. | The saved card shows a `Pinpoint` badge and remains available after reload. |
| TOK-8-FE-02 | ✅ | Open the add and edit forms. | Pinpoint and address detail are the only address-entry workflow; no Manual option is displayed. |
| TOK-8-FE-03 | ✅ | Search for an Indonesian address, select a suggestion, drag the marker, and save. | The marker and resolved address update, and the saved card shows the final address. |
| TOK-8-FE-04 | ✅ | Submit without a pinpoint and address detail, then correct each field. | Separate validation messages appear and clear when their corresponding fields become valid. |
| TOK-8-FE-05 | ✅ | Open a legacy `Perlu Verifikasi` address and verify it with Pinpoint. | The same address becomes `Pinpoint` and is eligible for selection. |

## Buyer Address Rules and Safety

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-8-FE-06 | ✅ | Create five addresses, try a sixth, and change the default address. | The limit remains five and exactly one buyer address is enabled. |
| TOK-8-FE-07 | ✅ | Delete the selected address while other verified addresses remain. | The row is removed and the newest remaining verified Pinpoint address becomes the single selected address; a legacy manual row is never selected automatically. |
| TOK-8-FE-08 | ✅ | Deny device-location permission, then use search and drag the marker. | A clear warning appears and marker dragging remains usable without losing form data. |
| TOK-8-FE-09 | ✅ | Open the add and edit forms on desktop and a representative mobile viewport. | Map controls and form actions remain usable without clipping or horizontal overflow. |

## Store Location

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-8-FE-10 | ✅ | Open Company Setting and inspect the location form. | The inline Pinpoint picker is displayed and no Manual address option is available. |
| TOK-8-FE-11 | ✅ | Search for an Indonesian location, move the marker, enter address detail, and save. | The final address is saved as a verified Pinpoint and remains selected after reload. |
| TOK-8-FE-12 | ✅ | Search for an address outside Indonesia. | No overseas location can be confirmed and the last valid Indonesian marker remains usable. |
| TOK-8-FE-13 | ✅ | Clear the address detail, select Save, then enter the detail again. | The detail validation message appears and clears as soon as the field becomes valid. |
| TOK-8-FE-14 | ✅ | Verify a legacy `Perlu Verifikasi` store address with Pinpoint. | The existing seller address becomes verified while other company fields remain intact. |
| TOK-8-FE-15 | ✅ | Open the inline picker on desktop and a representative mobile viewport. | The map renders fully and its controls remain usable without overflow. |

## Checkout Snapshot

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-8-FE-16 | ✅ | Checkout with verified Pinpoint buyer and seller addresses. | Checkout continues normally and the completed transaction displays the buyer shipping-address snapshot. Seller-address snapshot persistence is covered by the backend checklist. |
| TOK-8-FE-17 | ✅ | Attempt checkout with a buyer address labeled `Perlu Verifikasi`. | Checkout is blocked with a clear action directing the buyer to verify the address. Browser verification used a controlled active `manual` address fixture, confirmed the `Perlu Verifikasi` badge, allowed cart validation to complete, displayed the `Alamat Belum Diverifikasi` Pinpoint warning, and routed `Verifikasi Alamat` back to Address Settings without processing payment. |
| TOK-8-FE-18 | ✅ | Open Checkout while the seller location is verified, invalidate that seller location as a controlled concurrent change, then test both refreshing Checkout and selecting `Bayar Sekarang`. | Each path shows a `Lokasi Toko Belum Diverifikasi` dialog, waits for confirmation before routing back to the cart, and does not create or process a payment. Browser verification confirmed both Checkout reload and payment submission returned `409 SELLER_ADDRESS_REQUIRES_VERIFICATION`, kept the buyer on Checkout while the dialog awaited confirmation, and routed to a reconciled cart only after `Kembali ke Keranjang` was selected. |
| TOK-8-FE-19 | ✅ | Open checkout, update the active buyer address from another browser tab, then continue payment. | An address-changed message appears and checkout refreshes to the current address. |
| TOK-8-FE-20 | ✅ | Complete checkout, then edit or delete the master address through Settings. | The address displayed in transaction history remains unchanged. |

## Cart-to-Checkout Guards

Rows marked complete in this section were recorded as browser-verified in the
Buyer Cart feature document or in this checklist's evidence notes.

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-8-FE-21 | ✅ | Select at least one purchasable item, then select Checkout while the buyer and sellers have verified addresses. | Validation succeeds and the buyer is routed to the checkout page with the selected items. |
| TOK-8-FE-22 | ✅ | Leave every cart item unselected and inspect Checkout; repeat while a checked-state, quantity, or checkout request is pending. | Checkout remains disabled and no validation request or navigation is triggered. |
| TOK-8-FE-23 | ✅ | Select a purchasable item while the buyer has no active address, select Checkout, then choose `Tambah Alamat`. | Navigation is blocked until the action is confirmed, the cart selection remains unchanged, Address Settings opens with its add-address modal already visible, and refreshing after closing it does not reopen the modal. |
| TOK-8-FE-24 | ✅ | Preserve a stocked legacy or stale cart row, remove its seller's verified-address precondition, reload the cart, then attempt to continue. | The item shows `Lokasi Toko Belum Diverifikasi`, cannot be selected, retains its stored quantity as read-only text, contributes `Rp 0`, and cannot proceed to checkout. A controlled database setup was used because catalog and product guards prevent this state from being created through the current UI. |
| TOK-8-FE-25 | ✅ | Inspect selected cart items after one product becomes sold out or is deleted. | The unavailable reason is displayed, the affected item becomes unselected, checkout is blocked for that item, and its stored quantity remains visible as read-only text without `+`, `-`, or an editable input. |
| TOK-8-FE-26 | ✅ | Change product stock below the selected quantity or make the browser selection stale, then select Checkout. | Checkout validation is rejected, the cart refreshes from the backend, the affected selection clears, and its quantity remains available for review. |
| TOK-8-FE-27 | ✅ | Open or refresh the checkout route after all checkout rows have been cleared. | The page shows the invalid-checkout message and routes the buyer back to the cart without attempting payment. |
| TOK-8-FE-28 | ✅ | Select a product with quantity `2`, reduce its positive stock to `1`, then select Checkout. | One stock warning appears, the page scrolls to an amber-highlighted row, its checkbox clears and disables, the `- / quantity / +` controls remain, and `Sesuaikan ke 1` updates the quantity without selecting it again. Browser verification confirmed the expected `409` recovery, transient saving state, cleared warning, quantity `1`, and unchanged unchecked state. |
| TOK-8-FE-29 | ✅ | Select products from multiple sellers, including at least one valid product and one whose quantity exceeds stock, then select Checkout twice. | The first attempt is cancelled with one `{N} produk perlu diperiksa` banner and inline product detail; valid products remain selected, and the second attempt continues only with those valid products. Browser verification confirmed one `2 produk perlu diperiksa` summary for two invalid Theo Robotic items, preserved both valid SpaceX selections and their total, and created a Checkout and transaction containing only the two valid SpaceX products. |

## Public Store Identity

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-8-FE-30 | ✅ | Use a seller whose account name differs from its public company name, then follow one product through Belanja, Keranjang, Checkout, the buyer transaction, and the matching seller transaction. | Every buyer-facing seller label and both transaction views consistently display the public company name. Browser verification used the public store name `SpaceX`. |

## Follow-up Regressions

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-8-FE-31 | ✅ | Select a product while its seller location is verified, invalidate that seller location as a controlled concurrent change, then select Checkout from the cart. | The buyer remains on the cart, the affected item becomes unselected and displays `Lokasi Toko Belum Diverifikasi`, and one seller-specific warning notification explains why checkout did not continue. Browser verification confirmed a controlled seller-location invalidation returned `409`, cleared the selected item and total, marked both products from the affected seller, preserved their stored quantities, and displayed the seller-specific warning without navigating away from the cart. |
| TOK-8-FE-32 | ✅ | Disconnect the network while adding an address, then repeat while editing an address. | Each request shows a connection-safe error message, resets its loading button, preserves the form, and allows retry after connectivity returns. Browser verification confirmed both add and edit requests displayed the appropriate connection error while offline, restored their submit buttons, retained the entered form values, and completed successfully when retried after connectivity returned. |
