# TOK-34 Seller Cursor Pagination QA

## Purpose

This document tracks frontend verification for bounded Seller Product cursor
requests while preserving infinite scroll, criteria resets, and stale-response
protection.

Revision under review:

- branch: `task/jd-tok-34`;
- commit: see the Git history for this QA document.

Status legend: ✅ verified, ⬜ not verified yet.

## Automated Verification

| ID | Status | Verification | Expected Result | Evidence |
| --- | --- | --- | --- | --- |
| TOK-34-FE-01 | ✅ | Run the focused pagination and request-contract unit tests. | The first request omits the legacy ID list and null cursor, later requests forward `next_cursor`, terminal metadata stops the observer, criteria changes reset the cursor, stale responses are ignored, and failures preserve the last valid cursor. | `ProductPagination.spec.js` and `SellerProductRequest.spec.js` passed 25 tests on September 13, 2026. |
| TOK-34-FE-02 | ✅ | Run the complete frontend unit suite and format check. | Cursor integration does not regress Buyer Belanja or unrelated frontend behavior. | Vitest passed 25 tests and Prettier reported all matched files formatted on September 13, 2026. |
| TOK-34-FE-03 | ✅ | Run the production build. | The application compiles with the cursor contract. | Vite built 1,725 modules successfully on September 13, 2026; existing Browserslist and large-chunk notices remained warnings. |

## Local Browser Verification

| ID | Status | Verification | Expected Result | Evidence |
| --- | --- | --- | --- | --- |
| TOK-34-FE-04 | ✅ | Scroll a 51-product Seller Product catalog while inspecting Chrome Network. | The first request omits cursor, the next request sends one bounded opaque cursor without `products_current_id`, all products remain visible, and terminal metadata prevents an empty follow-up request. | Local browser screenshots on September 13, 2026 showed a 513-character cursor, the cursor request with unchanged criteria, and the terminal response with `next_cursor: null` plus `has_more: false`. |

## Staging Verification

| ID | Status | Verification | Expected Result | Evidence |
| --- | --- | --- | --- | --- |
| TOK-34-FE-05 | ⬜ | Load a stable catalog containing at least 1,000 products through all six sorting modes. | Every product appears exactly once, requests remain bounded, and the terminal batch does not trigger another request. | Requires staging. |
| TOK-34-FE-06 | ⬜ | Change search, stock filter, sort, and reset while requests are delayed. | Each active criterion starts without the previous cursor and late responses cannot overwrite current state. | Requires staging. |
| TOK-34-FE-07 | ⬜ | Inspect desktop and mobile Network requests during infinite scroll. | The first request omits cursor; subsequent requests send one opaque cursor and never send `products_current_id`. | Requires staging. |
| TOK-34-FE-08 | ⬜ | Simulate a failed incremental request and retry it. | Loaded cards remain visible and the retry uses the last cursor that produced them. | Requires staging. |

Deploy the cursor-capable backend and frontend as one coordinated release. If a
rollback is required, restore both applications to their previous compatible
versions because the final backend no longer implements the UUID exclusion-list
contract used by the pre-TOK-34 frontend.
