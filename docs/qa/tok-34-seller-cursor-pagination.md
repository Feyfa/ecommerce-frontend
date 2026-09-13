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
| TOK-34-FE-05 | ✅ | Paginate a staging catalog with a reduced `per_page` while retaining the automated 1,000-product scale test. | Every staging product appears exactly once across multiple bounded requests, while automated coverage verifies all six sorts at the Jira scale baseline. | A three-product staging catalog requested with `per_page=2` returned batches of two and one product on September 13, 2026. All three IDs were unique; the first batch returned an opaque `next_cursor` and the terminal batch returned `has_more: false` with `next_cursor: null`. The backend automated suite separately passed the 1,000-product and six-sort coverage. |
| TOK-34-FE-06 | ✅ | Inspect desktop and mobile Network requests during pagination and criteria changes. | The first request omits cursor; subsequent requests send one opaque cursor and never send `products_current_id`. | Chrome Network evidence on September 13, 2026 showed a successful cursor request across two bounded batches without `products_current_id`. Mobile Seller Product search for `Helm` returned the matching product with status 200, terminal metadata, and no Console error. |

Delayed stale responses, incremental request failures, criteria resets, and
retry cursor preservation remain automated verification. Those
timing-sensitive cases are deterministic in `TOK-34-FE-01` and do not require
intentionally degrading the shared staging session.

Deploy the cursor-capable backend and frontend as one coordinated release. If a
rollback is required, restore both applications to their previous compatible
versions because the final backend no longer implements the UUID exclusion-list
contract used by the pre-TOK-34 frontend.
