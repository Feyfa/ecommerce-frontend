# TOK-29 Buyer Catalog Search QA

## Purpose

This document is the active frontend QA record for the TOK-29 buyer catalog
search migration. It covers the Meilisearch request contract, numbered infinite
scroll, deterministic ordering, the 10,000-result boundary, relevance behavior,
stale-response protection, and recoverable search errors.

QA record date: August 25, 2026.

Revision under review:

- branch: `task/jd-tok-29`;
- base commit: `187021ec34e5c442d9643649419a23cd570ce084`;
- TOK-29 changes: uncommitted working tree at the time this record was created.

Replace the working-tree note with the final commit after the reviewed changes
are committed. Do not mark browser or staging rows as verified until those
scenarios have actually been executed.

Status legend: ✅ verified, ⬜ not verified yet.

All QA tables in this record keep evidence in the `Evidence` column. Do not add
a separate `Evidence Notes` section; update the matching row instead.

## Automated And Static Verification

| ID | Status | Verification | Expected Result | Evidence |
| --- | --- | --- | --- | --- |
| TOK-29-FE-01 | ✅ | Build the production frontend bundle. | Vite compiles the buyer catalog changes without an error. | `npm run build` passed during the final audit on August 25, 2026; Vite transformed 1,725 modules. The existing outdated Browserslist data and large-chunk notices remained warnings. |
| TOK-29-FE-02 | ✅ | Check formatting for Vue and JavaScript sources. | Every matched source follows the repository Prettier configuration. | `npm run format:check` passed during the final audit on August 25, 2026. |
| TOK-29-FE-03 | ✅ | Review the Vuex buyer-catalog request payload. | Every request forwards `page`, `per_page`, keyword, price boundaries, recently-added period, and sorting; the retired buyer `products_current_id` parameter is not sent. | Working-tree review of `src/store.js` confirmed the `getBelanja` action forwards the numbered pagination contract. |
| TOK-29-FE-04 | ✅ | Review pagination state and response handling in the buyer view. | A reload resets to page 1 and clears the cap state; successful pages append unique cards, use `has_more` to stop loading, accept `limit_reached` only from the current request version, and increment the next page only when another page exists. | Working-tree review of `src/views/auth/buyer/BelanjaView.vue` confirmed `currentPage`, `perPage`, `hasMoreProducts`, `paginationLimitReached`, defensive ID de-duplication, and request-version checks. |
| TOK-29-FE-05 | ✅ | Review keyword and sort state transitions. | Pressing Enter activates the trimmed keyword and defaults to `relevance`; clearing and submitting the keyword restores `latest`; sort reset follows the active context. | Working-tree review confirmed `buyerSortProductOptions`, `activeDefaultProductSort`, and `enterSearchProduct` implement this state contract. |
| TOK-29-FE-06 | ✅ | Review catalog error handling. | HTTP `503` displays the dedicated temporary-search-unavailable notification, while other failures retain the generic catalog error. | Working-tree review confirmed the status-specific branch in `BelanjaView.vue`; runtime browser behavior remains covered by the manual rows below. |

## Local Browser Verification

| ID | Status | Action | Expected Result | Evidence |
| --- | --- | --- | --- | --- |
| TOK-29-FE-07 | ✅ | Open Belanja with no active keyword and inspect the first request. | The request sends `page=1`, `per_page=24`, and `sort_product=latest`; returned cards render once with no console error. | Controlled local browser QA passed on August 23, 2026. The initial `/api/belanja` request sent `page=1`, `per_page=24`, an empty `search_product`, and `sort_product=latest`, returned `200 OK`, and rendered four unique product cards. The visible historical `validate/checkout` error came from the earlier missing-address checkout attempt and was unrelated to this successful catalog request. |
| TOK-29-FE-08 | ✅ | Scroll through at least two populated catalog pages. | Requests advance sequentially, cards append without duplicates, and loading stops after `has_more=false`. | Controlled local browser QA passed on August 23, 2026 against 25 eligible SpaceX products. The initial `page=1&per_page=24&sort_product=latest` request returned `200 OK`; scrolling triggered one sequential `page=2` request that also returned `200 OK`. The final catalog displayed all 25 unique cards, including 21 disposable pagination fixtures and four original products, without duplicates, a `page=3` request, or a stuck loading state. |
| TOK-29-FE-09 | ✅ | Start a slow page request, then change search, sort, or a filter before it completes. | The newer criteria replace the catalog and the stale response does not append old cards or advance pagination. | Controlled Slow 3G browser QA passed on August 23, 2026. The older `sepatu` request returned `200 OK` with `Sepatu Snikers`, while the newer `burger` request returned `200 OK` with an empty product list. The UI retained the newer **Produk tidak ditemukan** state instead of appending the stale sepatu card, and clearing the keyword afterward restored the four-product catalog normally. |
| TOK-29-FE-10 | ✅ | Search using a correctly spelled keyword and a supported typo, then inspect the sort control. | Both searches return relevant results; **Paling Sesuai** becomes the contextual default and explicit sort choices remain usable. | Controlled local browser QA passed on August 23, 2026. Searching for `sepatu` and the supported typo `spatu` returned the same `Sepatu Snikers` product with `200 OK`; both keyword searches defaulted to **Paling Sesuai** and sent `sort_product=relevance`. Changing the active typo search to **Harga Terendah** sent `sort_product=price_lowest`, returned `200 OK`, and kept the matching product visible. |
| TOK-29-FE-11 | ✅ | Clear the active keyword and press Enter. | The catalog restarts at page 1, relevance disappears from the visible choices, and sorting returns to `latest` when relevance was active. | Controlled local browser QA passed on August 23, 2026. The active `spatu` search used **Paling Sesuai**, sent `page=1` with `sort_product=relevance`, and returned `200 OK`. Clearing the keyword and pressing Enter restored all four product cards, automatically changed the control to **Terbaru**, sent an empty `search_product` with `page=1` and `sort_product=latest`, and returned `200 OK`. |
| TOK-29-FE-12 | ✅ | Apply price and recently-added filters, change sorting, and load another page. | Every subsequent request preserves the active criteria and no result from another query version is mixed into the list. | Controlled local browser QA passed on August 23, 2026. With the minimum-price filter set to `1000`, the recently-added period set to `90` days, and sorting set to `latest`, the page 1 request returned `200 OK` and rendered the matching catalog. Scrolling issued one page 2 request with the same `min_price=1000`, `added_within=90`, `sort_product=latest`, and `per_page=24` criteria; it returned `200 OK` and appended the remaining unique cards without losing the filter chips, mixing another query version, requesting page 3, or leaving a stuck loading state. The separate FE-10 evidence verifies changing the active sort choice. |
| TOK-29-FE-13 | ✅ | Make Meilisearch unavailable and request the buyer catalog. | The page shows the dedicated temporary-unavailable notification and does not present the response as a genuine empty catalog. | Controlled local failure QA passed on August 22, 2026. With the Homebrew Meilisearch service stopped, `/api/belanja` returned `503` with `BUYER_PRODUCT_SEARCH_UNAVAILABLE`; the page displayed the dedicated unavailable panel and notification instead of the genuine empty-catalog state. Retrying while the service remained down preserved the error state and returned another `503`. |
| TOK-29-FE-14 | ✅ | Restore Meilisearch and reload the catalog after the failure. | The catalog recovers without a hard refresh of authentication state, duplicated cards, or a stuck loading indicator. | Controlled local recovery QA passed on August 22, 2026. After the Homebrew service restarted and `/health` returned `available`, the buyer request returned `200` and the three product cards rendered once without a stuck loader or reindex. |
| TOK-29-FE-15 | ✅ | Repeat initial load, search, filtering, infinite scroll, empty state, and error recovery at mobile, tablet, and desktop widths. | Existing TOK-30 filter controls remain usable and the new pagination/search behavior introduces no responsive regression. | Controlled responsive browser QA passed on August 23, 2026. At a 375-pixel mobile viewport, the search, sort, and filter controls remained usable above a two-column catalog; scrolling loaded `page=2` with `200 OK` and appended the remaining cards without overlap, horizontal overflow, duplication, or a stuck loader. At a `768 × 1024` tablet viewport, the controls remained aligned above a three-column catalog and the sequential page 1 and page 2 requests both returned `200 OK`; all 25 unique products rendered cleanly. The preceding desktop FE-07 through FE-14 scenarios cover initial load, search, filtering, infinite scroll, empty state, unavailable-search handling, and recovery at desktop width. |

## Cross-Repository And Staging Verification

| ID | Status | Verification | Expected Result | Evidence |
| --- | --- | --- | --- | --- |
| TOK-29-FE-16 | ✅ | Run the matching backend contract and real-Meilisearch checks for the revision being released. | Frontend fields and backend response metadata remain compatible. | During the final audit on August 25, 2026, the backend standard suite passed with 182 tests and 985 assertions; the combined real-Meilisearch and reindex integration files passed with 5 tests and 37 assertions, including deterministic ties, `limit_reached`, and a result after position 1,000. |
| TOK-29-FE-17 | ⬜ | Deploy the frontend, backend, worker, Redis, and Meilisearch changes to staging, then execute the browser scenarios above. | The deployed buyer catalog works through the real API and search infrastructure with no console or network-contract regression. | Pending commit, push, staging integration, and deployment. |
| TOK-29-FE-18 | ⬜ | Reach or simulate the configured Meilisearch result boundary in staging. | Infinite scroll stops, existing cards remain visible, and an inline panel below the grid asks the buyer to use search or filters; no toast or normal-exhaustion message is shown. | Pending staging browser QA with a response containing `has_more: false` and `limit_reached: true`. |

## Not Covered

- Redis queue delivery and Meilisearch document synchronization are owned by
  the backend TOK-29 QA record.
- Production verification is not part of this local QA record and must not be
  inferred from a successful local build or staging test.
- The historical TOK-30 checklist remains evidence for its original filter UI
  revision; it is not evidence that the TOK-29 pagination migration passed.
