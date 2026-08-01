# TOK-16 Product Audit Log QA

## Purpose

This document is the canonical frontend manual QA checklist for the TOK-16
product audit experience. Backend event persistence, rollback, ownership, and
response-contract coverage is tracked at
`backend-repo:/docs/qa/tok-16-product-audit-log.md`.

Run these scenarios in local or staging. Keep evidence redacted and never
capture tokens, cookies, authorization headers, or raw image storage paths.

The completed states were migrated from the former backend Audit Log feature
checklist. That checklist did not record separate evidence, so its status is
preserved without inventing evidence.

## Product Audit Detail

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-16-FE-01 | ✅ | Create a product with multiple valid images, then open its Audit Log detail. | One `product.created` card shows the product name, initial price, stock, and photo count without image previews or paths. |
| TOK-16-FE-02 | ✅ | Update the product name, price, and stock once. | One `product.updated` detail shows accurate `Sebelum` and `Sesudah` values and distinguishes changed from unchanged rows. |
| TOK-16-FE-03 | ✅ | Delete the product, then open its audit detail after confirming the product is gone. | One `product.deleted` detail remains readable with the final snapshot and deleted-product explanation. |

## Image Metadata and Stable Detail

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-16-FE-04 | ✅ | Add a photo, remove another, change the cover, reorder retained photos, and save. | Audit text reports the before/after, added/removed, cover, and order changes without exposing a path, URL, or internal image ID. |
| TOK-16-FE-05 | ✅ | Submit a successful update without changing product values or image order. | The detail explains that no change was detected and displays no false field or image changes. |
| TOK-16-FE-06 | ✅ | Refresh the collection repeatedly and reopen the same detail. | No duplicate card appears and the displayed snapshot remains stable. |

## Privacy and Regression

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-16-FE-07 | ✅ | Inspect collection and detail views while signed in as the owner. | Collection IP remains masked, owner detail can reveal the full IP, and no raw internal metadata is displayed. |
| TOK-16-FE-08 | ✅ | Select each Product event in the grouped event filter. | Only events matching the selected product event appear. |
| TOK-16-FE-09 | ✅ | Load more than one page, then change the Product event filter. | The previous collection is discarded and the new filter starts without stale or duplicate cards. |
| TOK-16-FE-10 | ✅ | Inspect product cards and create, update, and delete details on desktop and representative mobile widths. | Cards, comparison tables, image changes, and the modal remain readable without overflow and support keyboard or touch use. |
| TOK-16-FE-11 | ✅ | Recheck Register, Login, Logout, IP reveal, date filters, and refresh with mixed product events present. | Existing authentication audit behavior remains unchanged and the combined timeline remains newest-first without duplicates. |
| TOK-16-FE-12 | ✅ | Load multiple pages containing authentication and product events. | Mixed-event pagination remains newest-first without missing or duplicate cards. |
