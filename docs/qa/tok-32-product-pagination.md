# TOK-32 Product Pagination QA

## Purpose

This document tracks frontend verification for the Seller Product `has_more`
contract and the Buyer Belanja 50-card numbered pagination contract.

Revision under review:

- branch: `task/jd-tok-32`;
- commit: see the Git history for this QA document;
- lazy product-card image loading: tracked separately by TOK-33.

Status legend: ✅ verified, ⬜ not verified yet.

## Automated Verification

| ID | Status | Verification | Expected Result | Evidence |
| --- | --- | --- | --- | --- |
| TOK-32-FE-01 | ✅ | Run `npm run test:unit`. | Seller terminal, multi-batch, compatibility fallback, stale response, buyer page size, and buyer deduplication tests pass. | Vitest passed 6 tests on August 26, 2026. |
| TOK-32-FE-02 | ✅ | Run `npm run format:check`. | Vue, JavaScript, test, and config files follow repository formatting. | Prettier reported all matched files use the expected style on August 26, 2026. |
| TOK-32-FE-03 | ✅ | Run `npm run build`. | The production bundle compiles with the new test tooling excluded from runtime behavior. | Vite built 1,725 modules successfully on August 26, 2026; existing Browserslist and large-chunk notices remained warnings. |
| TOK-32-FE-04 | ✅ | Review the Buyer Belanja request payload. | Every buyer request sends `page` and `per_page=50` without `products_current_id`. | Unit coverage asserts the complete page-one and page-two payload contract. |

## Browser Verification

| ID | Status | Verification | Expected Result | Evidence |
| --- | --- | --- | --- | --- |
| TOK-32-FE-05 | ✅ | Hard-refresh Seller Product with a short catalog below 50 products while Network recording and cache disabling are active. | One list request completes the result without an empty terminal request. | User-run local browser QA passed on August 26, 2026: four product cards rendered normally, Network showed one successful `GET /api/product/{sellerId}` request with `products_current_id=[]`, and no follow-up request containing the four loaded IDs appeared. |
| TOK-32-FE-06 | ✅ | Load a 51-product seller catalog, inspect both responses, and scroll through the terminal batch. | The next batch loads only while `has_more=true`, with no duplicates or parallel request. | User-run local browser QA passed on August 26, 2026 using 47 prefixed fixtures plus four original products: the first request returned 50 products with `has_more: true`; the second request sent the 50 loaded IDs, appended the one remaining product, and returned `has_more: false`; all 51 cards appeared without a third request. |
| TOK-32-FE-07 | ✅ | Search Seller Product for an existing exact product name after clearing Network. | Search resets `products_current_id`, returns the matching card, and completes without an empty terminal request. | User-run local browser QA passed on August 26, 2026: searching `Sepatu Snikers 123` issued one successful request with `products_current_id=[]`, `search_product=Sepatu Snikers 123`, `stock_filter=all`, and `sort_product=latest`; one matching card rendered, the response contained `has_more: false`, and no follow-up request appeared. |
| TOK-32-FE-08 | ✅ | Hard-refresh Buyer Belanja on desktop while Network recording and cache disabling are active. | The initial request uses `page=1`, `per_page=50`, and `sort_product=latest` without `products_current_id`; a terminal short result does not request page 2. | User-run local browser QA passed on August 26, 2026: four cards rendered normally, one successful `/api/belanja?page=1&per_page=50&search_product=&sort_product=latest` request appeared, and no page-2 request followed. |
| TOK-32-FE-09 | ✅ | Hard-refresh Buyer Belanja in a mobile viewport while Network recording is active. | The request uses `per_page=50`; controls remain usable, four products render in two columns, and no terminal page-2 request appears. | User-run local browser QA passed on August 26, 2026: the mobile simulator rendered Search, Urutan, Filter, and four non-overlapping cards in two columns; one successful `page=1&per_page=50&search_product=&sort_product=latest` request appeared without `products_current_id` or a page-2 request. The visible iframe sandbox warnings came from the device simulator rather than the application. |
| TOK-32-FE-10 | ✅ | Select the Seller Product `healthy` stock filter after clearing Network. | The filter resets `products_current_id`, returns only products with stock above 5, and avoids an empty terminal request. | User-run local browser QA passed on August 26, 2026: one successful request used `products_current_id=[]`, an empty `search_product`, `stock_filter=healthy`, and `sort_product=latest`; only the stock 9, 17, and 9 cards rendered, the stock 1 card was excluded, and no follow-up request appeared. |
| TOK-32-FE-11 | ✅ | Select Seller Product price-lowest sorting after resetting filters and clearing Network. | Sorting resets `products_current_id`, preserves the selected sort, returns deterministic order, and avoids an empty terminal request. | User-run local browser QA passed on August 26, 2026: one successful request used `products_current_id=[]`, an empty `search_product`, `stock_filter=all`, and `sort_product=price_lowest`; cards rendered in Rp3,000, Rp50,000, Rp150,000, and Rp200,000 order, and no follow-up request appeared. |
| TOK-32-FE-12 | ✅ | Hard-refresh Buyer Belanja in a tablet viewport while Network recording is active. | The request uses `per_page=50`; controls, three-column layout, and scrolling remain correct without a terminal page-2 request. | User-run local browser QA passed on August 26, 2026: the tablet simulator kept Search, Urutan, and Filter visible, rendered three cards on the first row and the fourth on the next row without overlap or horizontal overflow, and issued successful `page=1&per_page=50&search_product=&sort_product=latest` requests without `products_current_id` or any page-2 request. Repeated page-1 entries reflected separate reload recordings rather than pagination. |

## Navigation Request Regression — September 9, 2026

Seller Product and Buyer Belanja invalidate their request version during
`beforeUnmount`, mark pagination complete, release shared loading, and disconnect
the observer. Late successes and failures cannot update state or show stale
notifications. Already queued observer callbacks cannot start another batch.
The network request itself is not cancelled; its eventual result is ignored.

| ID | Status | Verification | Expected Result | Evidence |
| --- | --- | --- | --- | --- |
| TOK-32-FE-13 | ✅ | Navigate seller to buyer and buyer to seller while an initial or incremental request is pending; settle the old request with success or failure while the new page loads another batch. | Unmount releases old loading; late responses preserve the new loading guard and old product state, produce no notification/error log, and do not allow parallel pagination. The new response still appends correctly and releases loading. Queued old observer callbacks do not dispatch. | Eight parameterized regression cases failed before the lifecycle fix and passed afterward. `npm run test:unit` passed all 14 tests on September 9, 2026. |
| TOK-32-FE-14 | ✅ | Run formatting and production build after the lifecycle fix. | Source follows formatting and the bundle compiles. | `npm run format:check` passed; `npm run build` passed with 1,725 modules. Existing Browserslist and large-chunk warnings remain. |

These regression cases mount Vue components with a shared container and controlled
promises; IntersectionObserver and Vuex dispatch are mocked. Browser navigation
under network throttling has not been rerun for this fix. Earlier browser results
above remain historical evidence.

## Buyer Search and Sort Chips — September 10, 2026

| ID | Status | Verification | Expected Result | Evidence |
| --- | --- | --- | --- | --- |
| TOK-32-FE-15 | ✅ | Apply search, edit draft input, and change sorting with a price filter active. | Chips reflect the applied keyword and non-default sort only. Draft typing does not request data or change the search chip. Filter count remains price/time only. | Component test passed with rendered chip and Filter count assertions. |
| TOK-32-FE-16 | ✅ | Remove search under relevance and explicit price sorting with other filters applied. | One page-1 request sends `per_page=50`, clears search, preserves price/time filters, and changes only relevance to latest. A late old response is ignored. | Two parameterized component cases passed. |
| TOK-32-FE-17 | ✅ | Remove sort with and without an active keyword. | One page-1 request restores relevance or latest respectively, preserves search and price filter, and removes the sort chip. | Two parameterized component cases passed. |
| TOK-32-FE-18 | ✅ | Run frontend tests, formatting, and build. | Existing pagination and navigation regression tests remain green and the production bundle compiles. | September 10: `npm run test:unit` passed 19 tests; `npm run format:check` and `npm run build` passed. Existing Browserslist and large-chunk warnings remain. |

Chip behavior is verified through mounted components with mocked API responses.
User-run desktop QA passed on September 10, 2026. The supplied screenshot shows
the applied search, sort, minimum/maximum price, and time chips together with
Filter (3) and a rendered product card. Mobile chip layout and long-label
truncation remain unverified in a real browser. TOK-32 scope and acceptance
criteria now include the buyer search/sort chips.

## Configurable Seller Batch Size

Seller now sends `per_page` from component state (default 50). Component tests
verify the initial and subsequent batch payloads and a changed size after search.
Three store tests verify forwarding sizes 50, 20, and an omitted value to Axios.

- `npm run test:unit`: **22 tests passed**.
- `npm run format:check` and `npm run build`: passed.
- Existing Browserslist and large-chunk warnings remain.
- No additional browser QA was performed for this request-contract change.

## Pull Request Unit Test Check

The frontend CI workflow now runs `npm run test:unit` after formatting and
before the production build in the existing `Build Vue frontend` job.
Pull requests targeting `main` or `staging` use this sequence, including PRs
from `task/jd-tok-32` and `task/jd-tok-32-staging` respectively.
The test step uses the normal failure behavior; failed tests stop the job
before the build. Branch creation or pushes without an open PR do not trigger
this workflow.

Local validation: `npm run test:unit` passed all 22 tests on Node.js 22.22.0.
The workflow YAML was parsed and its target branches and command order checked.

GitHub Actions execution remains unverified until a PR run completes. Earlier
local test results are not evidence of a successful GitHub Actions run.
Required-check enforcement in branch rules has not been verified.

## Remaining Limitations

- Product-card native lazy loading was implemented and verified separately by
  TOK-33 after this pagination QA was completed.
- Historical TOK-29 evidence remains unchanged because it accurately records
  the 24-card contract tested for that earlier revision.
