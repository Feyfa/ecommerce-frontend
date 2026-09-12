# TOK-33 Product Image Lazy Loading QA

## Purpose

This document tracks verification of native lazy loading for the primary
product-card images on Seller Product and Buyer Belanja. The change does not
alter image URLs, upload behavior, API contracts, pagination, or card layout.

Revision under review:

- branch: `task/jd-tok-33`;
- commit: see the Git history for this QA document.

Status legend: ✅ verified, ⬜ not verified yet.

## Automated Verification

| ID | Status | Verification | Expected Result | Evidence |
| --- | --- | --- | --- | --- |
| TOK-33-FE-01 | ✅ | Run the focused Seller Product and Buyer Belanja component tests. | Both primary product-card images render with `loading="lazy"`, retain their accessible product name, and keep `object-contain`. | `ProductPagination.spec.js` passed 21 tests locally with Node.js 22.21.1 on September 11, 2026. |
| TOK-33-FE-02 | ✅ | Run `npm run test:unit`. | The complete frontend unit suite passes without pagination or navigation regressions. | All 24 tests passed locally with Node.js 22.21.1 on September 11, 2026. |
| TOK-33-FE-03 | ✅ | Run `npm run format:check`. | Vue, JavaScript, test, and config files follow repository formatting. | Prettier reported all matched files use the expected style on September 11, 2026. |
| TOK-33-FE-04 | ✅ | Run `npm run build`. | The production bundle compiles successfully. | Vite built 1,725 modules successfully on September 11, 2026; existing Browserslist and large-chunk notices remained warnings. |

## Browser Verification

| ID | Status | Verification | Expected Result | Evidence |
| --- | --- | --- | --- | --- |
| TOK-33-FE-05 | ✅ | Hard-refresh Seller Product on desktop with Network recording and cache disabling active. | Images in the initial viewport render, while product images far below the viewport are not requested eagerly. | Verified on Seller Product with 50 products, desktop width, Network image filtering, cache disabling, and Fast 4G throttling active on September 12, 2026. The initial settled view requested 36 images rather than all 51 page images, demonstrating that distant product images remained deferred. |
| TOK-33-FE-06 | ✅ | Scroll Seller Product toward deferred cards. | Deferred product images are requested before their cards need to be viewed, without visible layout shift. | Continuing from FE-05, image requests increased from 36 to 41 and then 51 as the Seller Product page was scrolled through deferred cards. Images rendered successfully and no visible layout shift was observed. |
| TOK-33-FE-07 | ✅ | Repeat the initial-load and scroll checks on Buyer Belanja desktop. | Buyer card images follow the same lazy-loading behavior without affecting search, filter, sort, navigation, error states, or infinite scroll. | Verified on Buyer Belanja at desktop width with Network image filtering and cache disabling active on September 12, 2026. Image requests increased from 36 to 46 and then 51 while scrolling, with no visible layout shift. The passing component and full unit suites cover search, sort, pagination, infinite scroll, and cross-page navigation behavior; filter and current-page error states were not exercised manually because TOK-33 only adds the native image-loading hint and does not change those flows. |
| TOK-33-FE-08 | ✅ | Repeat Seller Product and Buyer Belanja checks at tablet width. | Three-column layouts remain stable and deferred images load as scrolling approaches them. | Verified on Seller Product and Buyer Belanja with an iPad Mini viewport, Network image filtering, and cache disabling active on September 12, 2026. Both three-column layouts remained stable while scrolling. Chrome requested all 18 product images within its tablet preload distance; native lazy-loading behavior for the same card images is covered by the component tests and was observed incrementally during mobile verification. |
| TOK-33-FE-09 | ✅ | Repeat Seller Product and Buyer Belanja checks at mobile width. | Two-column layouts remain stable and deferred images load as scrolling approaches them. | Verified on Seller Product and Buyer Belanja with an iPhone 12 Pro viewport, Network image filtering, and cache disabling active on September 12, 2026. Both two-column layouts remained stable, while image requests increased incrementally from 13 to 15, 17, and 19 as scrolling approached deferred cards. |

## Compatibility

Native `loading="lazy"` is an additive browser hint. Browsers that support it
may defer below-the-fold images, while unsupported browsers ignore the
attribute and retain eager loading as their fallback behavior.
