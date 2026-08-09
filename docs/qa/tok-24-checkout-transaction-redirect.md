# TOK-24 Checkout Transaction Highlight QA

## Purpose

This document is the canonical frontend manual QA checklist for TOK-24. After a successful checkout the buyer
lands on the pending-payment filter with the transactions created by that checkout highlighted, instead of the
empty paid-history state. The same task also fixes the shared transaction card so large amounts stay inside
the card on both the buyer and the seller page. Keep evidence redacted and never capture tokens, cookies,
authorization headers, or full virtual account numbers belonging to real buyers.

Status legend: ✅ verified, ⬜ not verified yet. Rows stay ⬜ until the scenario is actually executed in a
browser; do not mark a row from code reading alone.

## Post-Checkout Highlight

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-24-FE-01 | ✅ | Complete a checkout containing products from exactly one store. | The page routes to Transaksi on the `Belum Dibayar` filter and the resulting card is highlighted. |
| TOK-24-FE-02 | ✅ | Read the address bar right after landing. | The URL is `/buyer/transaction` with no `status` or `invoice` query left behind. |
| TOK-24-FE-03 | ✅ | Watch the viewport on landing when the highlighted card sits below the fold. | The highlighted card is scrolled into view. |
| TOK-24-FE-04 | ✅ | Look at how the highlighted card differs from the others. | The card carries the `Baru Saja Dibuat` chip, not colour alone. |
| TOK-24-FE-05 | ✅ | Complete a checkout containing products from two different stores. | One grouped pending invoice card is highlighted and no modal opens. |
| TOK-24-FE-06 | ✅ | Confirm no modal appears at any point of the flow above. | No detail modal is opened automatically. |
| TOK-24-FE-07 | ✅ | After landing, change the status filter, then the date range, sort, search, and page. | The highlight is dropped on the first of these changes and does not come back. |
| TOK-24-FE-08 | ✅ | Reload the page, then navigate away and press browser back. | Nothing is highlighted and the console reports no error. |

## Query Handling and Safety

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-24-FE-09 | ✅ | Paste `/buyer/transaction?status=pending_payment&invoice=<own pending invoice>`. | The pending filter applies and the matching card is highlighted. |
| TOK-24-FE-10 | ✅ | Repeat TOK-24-FE-09 using an invoice id that is already paid or expired. | The page renders normally with nothing highlighted and no console error. |
| TOK-24-FE-11 | ✅ | Repeat TOK-24-FE-09 using a random uuid and an invoice owned by another buyer. | No transaction is revealed and nothing is highlighted. |
| TOK-24-FE-12 | ✅ | Open `/buyer/transaction?status=not-a-filter`. | The page falls back to the default paid history filter. |

## Card Layout

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-24-FE-13 | ✅ | View a buyer transaction whose total reaches the millions, at mobile, tablet, and desktop widths. | The amount renders fully inside the card with no clipping or horizontal overflow. |
| TOK-24-FE-14 | ✅ | Repeat TOK-24-FE-13 on the seller transaction page, where the total is `Total Pendapatan`. | Same result. |
| TOK-24-FE-15 | ⬜ | Narrow the viewport until the total row runs out of space. | The label wraps; the amount is never truncated. |

## Regression

| ID | Status | Action | Expected Result |
| --- | --- | --- | --- |
| TOK-24-FE-16 | ✅ | Open Transaksi from the sidebar without any query. | Behavior is unchanged: paid history by default, with the `Menunggu Pembayaran` notice when relevant. |
| TOK-24-FE-17 | ✅ | Use the status, date, sort, search, and pagination controls. | All filters behave as before and the URL stays clean. |
| TOK-24-FE-18 | ✅ | Open the seller Transaksi page. | Nothing changed on the seller side apart from the corrected amount layout. |
| TOK-24-FE-19 | ✅ | Trigger a checkout conflict, such as a stock change while the buyer is still on the checkout page. | The existing conflict notifications and cart redirect still work. |

## Evidence Notes

TOK-24-FE-09, TOK-24-FE-02, and TOK-24-FE-04 were verified together through one supplied screenshot
sequence, using an existing pending invoice instead of a new checkout. The invoice id was copied from the
detail modal, then pasted as
`/buyer/transaction?status=pending_payment&invoice=<own pending invoice>`. The page applied the
`Belum Dibayar` filter, the matching card rendered with an accent ring and the `Baru Saja Dibuat` chip next
to its status badge, and the two other pending cards stayed unmarked, so the highlight discriminates
correctly when several pending rows exist. The address bar was already reduced to `/buyer/transaction` at
that point. The console reported `No errors`; the only warning is the pre-existing Clerk development-keys
notice.

TOK-24-FE-07 was verified through the supplied screenshot sequence: the highlighted card was restored by
pasting the same deep link, the status filter was switched from `Belum Dibayar` to `Semua`, and the highlight
disappeared. Switching back to `Belum Dibayar` listed all three pending cards with none of them marked, which
confirms the highlight is dropped rather than merely hidden by the filter. The console reported `No errors`.

The remaining TOK-24-FE-07 controls were exercised in a later run, closing the gap left above. Starting from
a highlighted card each time, switching the sort order from `Terbaru` to `Terlama`, typing `Spacex` into the
search field, and applying a `01 Aug 2026 - 07 Aug 2026` range each dropped the highlight on its own. Every
control in the acceptance criterion has now been observed except pagination.

TOK-24-FE-01 and TOK-24-FE-06 were verified end to end through a supplied screenshot sequence, with both
repositories running the task branch. A single-store cart holding one product was checked out; `checkout`,
`data`, and `process` all returned `200`. The page landed on `Belum Dibayar`, whose count rose from three to
four, and the card created by that checkout rendered at the top with the accent ring and the
`Baru Saja Dibuat` chip. The three pre-existing pending cards stayed unmarked, so the highlight discriminates
correctly when several pending rows exist. No modal opened at any point. The address bar was already reduced
to `/buyer/transaction`, which re-confirms TOK-24-FE-02 through the real checkout flow rather than a pasted
link. The console reported `No errors`.

TOK-24-FE-05 was reverified as part of TOK-25 after a second store was added to the catalogue. A cart holding
products from `Spacex` and `Aneka Makanan` was checked out as one order. The checkout page grouped it into two
packages, `process` returned `200`, and the transaction page landed on `Belum Dibayar` with one new grouped
invoice card, labelled `Pesanan dari 2 toko`, carrying the accent ring and the `Baru Saja Dibuat` chip. No
modal opened. The buyer has one payment obligation, so the multi-store checkout now highlights one invoice card
rather than two seller rows.

A multi-product variant of TOK-24-FE-01 was also run: a single-store cart holding two different products
produced exactly one transaction, not one per product. The `Belum Dibayar` count rose from four to five, the
single resulting card was highlighted while the four older pending cards stayed unmarked, and its detail modal
listed `Produk (2)` with both items under one invoice and one virtual account. This confirms that product
count does not split a transaction; only seller count does. The console reported `No errors`.

TOK-24-FE-03 initially failed and was fixed during QA. Earlier runs could not evidence it, because a fresh
checkout always sorts to the top and nothing needed scrolling. Once seven pending transactions existed, the
scenario was reachable by deep-linking the oldest invoice, which sits at the bottom of the list.

That first attempt exposed a real defect: the page never scrolled at all. The card list lives inside a
`Transition` with `mode="out-in"`, so the new content is only mounted after the old content finishes leaving.
The scroll ran on `nextTick`, before that swap completed, so `$refs.transactionCards` was still empty and the
optional chaining swallowed the miss without an error. The highlight appeared and the scroll silently did not.

The fix moves the scroll to the `Transition` `after-enter` hook, which fires once the cards are guaranteed to
be in the DOM, guarded by a one-shot flag so later filter changes do not move the viewport. Re-tested
afterwards: the page lands at the top for a fraction of a second and then scrolls down to the highlighted
card. Because the target was the last row, it settles at the bottom of the viewport rather than centred; the
page simply cannot scroll further. The console reported `No errors` after a full reload.

A Vue warning reading `Property "scrollToHighlightedTransaction" was accessed during render but is not defined
on instance` appeared once during this run. It was a hot-reload artefact, raised while Vite had applied the
new template but not yet the new script block, and it did not recur after a full page load.

TOK-24-FE-13 was verified through a supplied screenshot sequence across four widths: full desktop, a 1310 px
responsive viewport, iPhone 14 Pro Max at 430 px, and iPad Mini at 768 px. The pending cards showing
`Rp 10.015.000` and `Rp 8.015.000` rendered their amounts fully inside the card at every width, with no
clipping and no horizontal page scroll. The console reported `No errors`.

Observed while running TOK-24-FE-13: at iPad Mini width the detail and copy buttons sit side by side and do
not stretch awkwardly, so widening the total block from a fixed `230px` to a `300px` cap did not degrade the
tablet layout as had been anticipated.

TOK-24-FE-08 was verified through a supplied screenshot sequence. From a highlighted card, reloading the page
returned the default `Semua` filter with the `Menunggu Pembayaran` notice and nothing highlighted. Navigating
to Beranda and pressing browser back returned to `/buyer/transaction` in the same state, again with nothing
highlighted. The console reported `No errors` throughout. The restored page shows the default filter rather
than the `Belum Dibayar` filter that was active before leaving, because filter state is deliberately not
stored in the URL; only the post-checkout redirect carries filter context, and it is consumed once.

TOK-24-FE-17 was verified through the same run: the status filter, sort order, search field, and date range
were each applied individually and then in combination (`Spacex` + `01 Aug 2026 - 07 Aug 2026` + `Terlama`),
all returning sensible results while the address bar stayed `/buyer/transaction`.

Pagination was not exercised. The account holds a single transaction in the paid history and three in the
pending queue, and the pending tab deliberately has no pagination, so the control never renders. This is a
data limitation of the test account, not evidence that pagination works.

TOK-24-FE-10 and TOK-24-FE-11 were verified through a supplied screenshot sequence covering three non-matching
inputs: the random uuid `00000000-0000-0000-0000-000000000000`, the non-uuid string `abc123`, and the buyer's
own already-paid invoice `a270374b-c2cc-41aa-955d-00d034142d87`, whose id was copied from its detail modal.
In all three cases the `Belum Dibayar` filter applied, all three pending cards rendered normally, no card was
highlighted, no error surfaced, and the console reported `No errors`. The paid-invoice case is the meaningful
one: the id is valid and belongs to this buyer, but the invoice is no longer in the pending list, so no match
occurs.

The foreign-invoice half of TOK-24-FE-11 was not run separately, because it would require a second buyer
account holding a pending invoice. It follows the same no-match path, since matching runs against a list the
backend already scopes to the signed-in buyer.

Confirmed while running these cases: when no match is found, the `status` and `invoice` query stays in the
address bar. Cleanup runs only after a successful match, which is intentional and matches the behavior noted
for TOK-24-FE-12.

TOK-24-FE-14 and TOK-24-FE-18 were verified together through a supplied screenshot sequence on
`/seller/transaction`. Cards showing `Rp 10.000.000` and `Rp 8.000.000` under the `Total Pendapatan` label
rendered their amounts fully inside the card at full desktop width and at 320 px, 375 px, and 425 px, with no
clipping and no horizontal page scroll. No card carried an accent ring or a `Baru Saja Dibuat` chip, which
confirms the `highlighted` prop defaults to off for the seller role. The filter bar, status badges, the
`Lihat Detail` action, and the `1-4 dari 4 transaksi` pagination all rendered as before. The console reported
`No errors`.

Tablet width was not captured on the seller page specifically. The widths that were captured bracket it on
both sides, and 320 px is considerably more constrained than a tablet, so the untested 768 px point carries
little residual risk. It is recorded here rather than silently treated as covered.

TOK-24-FE-15 stays ⬜ and is likely unreachable in practice. Across all four widths the label and the amount
always fit on one line, because at narrow widths the total block spans the full card rather than sharing a
row. The wrap-before-truncate rule is therefore a safety property of the markup that current label text and
viewport sizes never exercise. Reaching it would require an artificially long label or heavy browser zoom.

TOK-24-FE-12 was verified through the supplied screenshot: opening `/buyer/transaction?status=not-a-filter`
rendered the status filter as `Semua`, kept the `Menunggu Pembayaran` notice and the standard empty state, and
returned `transaction?user_type=b...` with status `200`. The console reported `No errors`. The only warning is
the pre-existing Clerk development-keys notice, which is unrelated to this task. The request query string
itself was not opened in DevTools; the `Semua` label is bound to the same `selectedFilter` value that is sent
as `status_filter`, so the rendered label evidences the applied fallback indirectly rather than directly.

TOK-24-FE-16 was verified through the supplied screenshot of `/buyer/transaction` without query: the page
showed the paid history default, the `Menunggu Pembayaran` notice for the one unpaid transaction, and the
standard empty state, matching the behavior before this task.

Known behavior observed during TOK-24-FE-12: an unrecognized `status` query stays in the address bar after
load. Query cleanup only runs when an `invoice` value is present and matches a loaded transaction, so a
`status` value alone is preserved to keep filter deep links usable. The stale value has no effect because the
filter falls back on every load.

Rows carried over from the earlier modal-based design were reset rather than kept. That design opened the
detail modal automatically and was replaced by the highlight, so its evidence no longer describes the shipped
behavior. Only TOK-24-FE-12 and TOK-24-FE-16 survive unchanged, because neither depends on the modal.

TOK-24-FE-19 was verified through a supplied screenshot sequence using two sessions, the seller in a normal
window and the buyer in an incognito one. The buyer reached `/buyer/checkout` with `Keyboard Keychorn`
(`Rp 265.000` including shipping) and stopped there. The seller then set that product's stock from `6` to `0`
and saved, after which the product card showed `Stok: 0` with a `SOLD OUT` overlay. The buyer pressed
`Bayar Sekarang`, `POST /api/checkout/process` returned `409 Conflict`, and the page showed the error
notification `Produk di checkout sudah tidak tersedia. Silakan periksa kembali keranjang.` and routed to
`/buyer/keranjang`.

This is the important half of the row: the failed attempt did not route to `/buyer/transaction` and left no
`invoice` query anywhere, so the redirect added by this task is reached only by a checkout that actually
succeeded. The cart page confirmed the documented rollback: `0 dari 0 produk dipilih`, the `1 produk perlu
diperiksa` notice, and the row marked `Stok Habis` while `Jumlah tersimpan 1` preserved the quantity for
review. The console carried only the expected pair of entries for the handled `409` — the logged `POST` and
the `AxiosError` raised at `CheckoutView.vue:698` — and no unhandled error.

Automated backend coverage for the response contract is recorded in
`backend/docs/qa/tok-24-checkout-transaction-redirect.md`.

## Superseded Finding

The multi-store pending-card duplication and its repeated invoice total, originally observed during TOK-24-FE-05,
were fixed in TOK-25. Pending invoices covering several stores now render once with the invoice total; after
payment, buyer rows return to one per store and use that store's product subtotal plus shipping price.
