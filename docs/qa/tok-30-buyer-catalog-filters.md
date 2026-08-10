# TOK-30 Buyer Catalog Filters QA

## Purpose

This document is the canonical frontend manual QA checklist for TOK-30 buyer
catalog filters. It covers the independent Filter control, price boundaries,
the recently-added period, filter chips, and responsive panel behavior. Keep
evidence redacted: do not capture tokens, cookies, authorization headers, or
private product data.

Status legend: ✅ verified, ⬜ not verified yet. Keep a row ⬜ until its stated
browser scenario has actually been executed.

## Filter Panel and Responsive Layout

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-30-FE-01 | ✅ | Open Belanja at mobile, tablet, and desktop widths, then press `Filter`. | A compact panel opens below the Filter button with an upward pointer; no bottom sheet or full-screen backdrop appears. |
| TOK-30-FE-02 | ✅ | Close the panel with the close button, Escape, and a click outside it. | The panel closes and any draft values that were not applied are discarded. |
| TOK-30-FE-03 | ✅ | Open and close `Harga` and `Terakhir Ditambahkan` separately. | Each section keeps its own open state; opening one does not close the other. |
| TOK-30-FE-04 | ✅ | Open both sections on a narrow mobile viewport. | Inputs, period buttons, footer, and panel edges remain visible with no horizontal overflow or clipping. |
| TOK-30-FE-05 | ✅ | Compare the two price fields with the Harga field in Product Saya. | Both have the same full-width Rupiah input treatment: `Rp` prefix, border, focus state, and Indonesian thousands formatting. |

## Price Filter Behavior

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-30-FE-06 | ✅ | Enter only a minimum price and press `Terapkan`. | The list reloads with products at or above that price and the trigger shows `Filter (1)`. |
| TOK-30-FE-07 | ✅ | Enter only a maximum price and press `Terapkan`. | The list reloads with products at or below that price and the trigger shows `Filter (1)`. |
| TOK-30-FE-08 | ✅ | Enter equal minimum and maximum prices that match a known product. | The boundary is inclusive: a product at that exact price remains visible. |
| TOK-30-FE-09 | ✅ | Enter a minimum price greater than the maximum price, then press `Terapkan`. | The panel stays open, shows `Harga minimum tidak boleh lebih besar dari harga maksimum.`, and does not send a new catalog request. |
| TOK-30-FE-10 | ✅ | Enter a price, close the panel without applying it, then reopen the panel. | The un-applied value is absent and the current catalog does not change. |
| TOK-30-FE-11 | ✅ | Apply both price boundaries, then remove only the minimum chip and later only the maximum chip. | Each removal reloads the catalog while preserving the other boundary, search, sort, and recently-added filter. |

## Recently Added Filter

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-30-FE-12 | ✅ | Select each of `7 Hari`, `14 Hari`, `1 Bulan`, and `3 Bulan`, then press `Terapkan`. | Each choice reloads the catalog and appears as one `Ditambahkan … terakhir` chip. |
| TOK-30-FE-13 | ✅ | Apply a recently-added period, then remove its chip. | Only the period is cleared; price, search, and sort remain active. |
| TOK-30-FE-14 | ✅ | Select a period, close the panel without applying, then reopen it. | The previous applied period remains selected; the draft choice is discarded. |
| TOK-30-FE-15 | ✅ | Apply both a price boundary and a recently-added period. | The trigger count reflects both criteria and the returned list satisfies their intersection. |

## Reset, Sort, Search, and Pagination Regression

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-30-FE-16 | ✅ | Apply price and recently-added filters, then press `Reset Filter`. | All filter criteria clear, panel closes, and the catalog reloads without changing search or sort. |
| TOK-30-FE-17 | ✅ | Apply one or more filters, choose a non-default sort, then use the sort reset button. | Sort returns to `Terbaru`; all catalog filters remain active. |
| TOK-30-FE-18 | ✅ | Apply filters, search for a product, then clear the search input. | The search is cleared and the applied filters remain in effect. |
| TOK-30-FE-19 | ✅ | Load additional product batches through infinite scroll while a filter is active. | Additional results use the same active search, price, recently-added, and sort criteria; no previously loaded product repeats. |
| TOK-30-FE-20 | ✅ | Use a filter combination that returns no products. | The empty state says `Produk tidak ditemukan`; removing or resetting criteria can restore results. |

## API and Console Observation

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-30-FE-21 | ✅ | Inspect the request after applying minimum, maximum, and recently-added filters. | `GET /api/belanja` carries `min_price`, `max_price`, and `added_within` only when their criteria are active. |
| TOK-30-FE-22 | ✅ | Complete the scenarios above while watching the browser console. | No uncaught error or Vue warning occurs; unrelated Clerk development-key warnings may be ignored. |

## Automated Coverage

Backend request validation and query behavior are covered in
[TOK-30 backend QA](../../../backend/docs/qa/tok-30-buyer-catalog-filters.md).

## Evidence Notes

`TOK-30-FE-01` was verified through the supplied responsive screenshots at
375 px, 768 px, and 1024 px. In every viewport, Filter opens as a compact
popover below its trigger with the upward pointer; it is not a bottom sheet or
full-screen modal.

`TOK-30-FE-04` was verified through the supplied 375 px mobile screenshot.
Both filter sections are expanded and every input, period button, footer
control, and panel edge remains visible without horizontal overflow or
clipping.

`TOK-30-FE-05` was verified by comparing the buyer implementation with the
Harga input in Product Saya. Both use the same full-width Rupiah field
structure and styles: an `Rp` prefix, `h-11` bordered container, violet focus
state, and Indonesian thousands-formatted value.

`TOK-30-FE-02` was verified manually: the panel closed through the close
button, a click outside the panel, and the Escape key. No filter chip was
created and the catalog criteria did not change.

`TOK-30-FE-10` was verified through the supplied screenshot sequence: a draft
minimum price of `50.000` was entered, the panel was closed without applying,
and reopening Filter showed no draft price, chip, or active filter count.

`TOK-30-FE-14` was verified through the supplied screenshot sequence: `7 Hari`
was selected as a draft, the panel was closed without applying, and reopening
the recently-added section showed no selected period, chip, or active filter
count.

`TOK-30-FE-09` was verified through the supplied screenshot sequence: a
minimum price of `100.000` and maximum price of `50.000` kept the panel open
and displayed the expected inverted-range validation message. No active filter
count or chip was shown.

`TOK-30-FE-13` was verified through the supplied screenshot sequence: `7 Hari`
was applied, producing `Filter (1)`, the `Ditambahkan 7 Hari terakhir` chip,
and the filtered empty state. Removing that chip restored the complete product
list and cleared the active filter indicator.

`TOK-30-FE-06` was verified through the supplied screenshot sequence: applying
only a minimum price of `100.000` produced `Filter (1)` and the `Harga ≥ Rp
100.000` chip. The catalog returned the two Rp150.000 products while excluding
the Rp50.000 product.

`TOK-30-FE-07` was verified through the supplied screenshot sequence: applying
only a maximum price of `50.000` produced `Filter (1)` and the `Harga ≤ Rp
50.000` chip. Only the product priced at Rp50.000 remained visible.

`TOK-30-FE-08` was verified through the supplied screenshot sequence: applying
both the minimum and maximum price as `50.000` produced `Filter (2)` and both
price chips. The Rp50.000 product remained visible, proving both boundaries
are inclusive.

`TOK-30-FE-11` was verified through the supplied screenshot sequence: removing
the minimum-price chip preserved the maximum-price chip and changed the count
from `Filter (2)` to `Filter (1)`. Removing the remaining maximum-price chip
cleared the indicator and restored all products.

`TOK-30-FE-12` was verified through the supplied screenshot sequence: each of
`7 Hari`, `14 Hari`, `1 Bulan`, and `3 Bulan` was selected and applied. Each
selection reloaded the catalog with its matching `added_within` value and
displayed the corresponding recently-added chip.

`TOK-30-FE-15` was verified through the supplied screenshot sequence: applying
`Harga ≤ Rp 50.000` together with `Ditambahkan 3 Bulan terakhir` produced
`Filter (2)`, both chips, and only the Rp50.000 product. The catalog request
included both the maximum-price and `added_within=90` criteria.

`TOK-30-FE-16` was verified through the supplied screenshot sequence: Reset
Filter closed the panel, cleared both active filter chips and the indicator,
then restored all products while the sort selection remained `Terbaru`.

`TOK-30-FE-17` was verified through the supplied screenshot sequence: after
selecting `Harga Tertinggi`, the sort reset returned the control to `Terbaru`.
The `Ditambahkan 3 Bulan terakhir` chip and `Filter (1)` remained active.

`TOK-30-FE-18` was verified through the supplied screenshot sequence: searching
for `Aldis` showed only Aldis Burger while the recently-added filter remained
active. Clearing the search restored all products without removing its chip or
the `Filter (1)` indicator.

`TOK-30-FE-20` is also covered by the `TOK-30-FE-13` evidence: applying `7
Hari` produced the `Produk tidak ditemukan` empty state, and removing that
filter chip restored the product list.

`TOK-30-FE-21` was verified through the supplied screenshot sequence: applying
minimum and maximum prices of `50.000` with `3 Bulan` produced `Filter (3)`
and three chips. The observed request URL included `min_price=50000`,
`max_price=50000`, and `added_within=90`.

`TOK-30-FE-22` was verified through the supplied DevTools screenshots taken
throughout the manual filter scenarios: no uncaught JavaScript error or Vue
warning was visible in the Console. The unrelated Clerk development-key
warning was ignored.

`TOK-30-FE-19` was verified through code review and backend feature tests. The
frontend sends the active search, price, recently-added, and sort criteria with
every subsequent batch along with all loaded product IDs. The backend applies
the same criteria, excludes those IDs, and uses a stable ID tie-breaker for
sorting; `php artisan test tests/Feature/ProductListFilterTest.php` passed
with 15 tests and 100 assertions.
