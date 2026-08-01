# TOK-6 Product Images QA

## Purpose

This document is the canonical frontend manual QA checklist for the TOK-6
product image workflow. Backend storage, validation, migration, and ownership
coverage is tracked at `backend-repo:/docs/qa/tok-6-product-images.md`.

The completed states below were migrated from the former checklist in the
backend Seller Product feature document. That checklist did not record separate
evidence, so this migration preserves its status without inventing evidence.

## Main Flow

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-6-FE-01 | ✅ | Create a product with five valid images. | The product card uses image 1 and reopening Edit loads all five images in their saved order. |
| TOK-6-FE-02 | ✅ | Drag another image to position 1 and save. | The product card cover changes to the new first image. |

## Edit Images

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-6-FE-03 | ✅ | Remove one image, add one image, reorder the collection, and save. | Reopening Edit displays the final saved collection in the selected order. |
| TOK-6-FE-04 | ✅ | Remove images until one remains, then save. | The product saves and the remaining image becomes its cover. |
| TOK-6-FE-05 | ✅ | Change image previews, cancel, and reopen Edit. | No update is sent and the last saved collection returns. |

## Client Validation

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-6-FE-06 | ✅ | Remove every image and select Save. | Submission is blocked and the saved product remains unchanged. |
| TOK-6-FE-07 | ✅ | Select more files than the five available slots. | The UI keeps no more than five images. |
| TOK-6-FE-08 | ✅ | Select a non-image file and an image larger than 1 MB. | Both invalid files are rejected and are not included in the upload. |

## Display Regression

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-6-FE-09 | ✅ | Inspect the buyer card, cart, checkout, and transaction views for the product. | Every view displays the current primary image. |
