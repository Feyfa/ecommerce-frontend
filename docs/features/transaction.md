# Transaction

This document explains the current transaction feature from the frontend side.

The goal is to document the buyer and seller transaction UI in one place because both roles share the same feature shape: transaction list, filters, compact transaction cards, pagination, and a detail modal. Role-specific behavior is handled by props, labels, and available actions.

## Purpose

The transaction pages let authenticated users review transaction history and continue the next action for each role.

Current supported actions:

- Show transaction status filters with backend-provided counts.
- Search transactions by seller, buyer, product, invoice, transaction number, or payment name.
- Filter transactions by date range.
- Sort transactions by newest or oldest transaction date.
- Paginate transaction history with a shared numeric pagination component.
- Show compact transaction cards.
- Keep buyer pending payments separate from paid transaction history.
- Open transaction details in a modal.
- Copy buyer virtual account numbers.
- Copy invoice IDs from the detail modal.
- Let sellers approve transactions that are waiting for seller action.

## Main Files

- `src/views/auth/buyer/TransactionView.vue`
  Buyer transaction page. It owns buyer filters, pending-payment notice behavior, buyer default status, buyer search/date/sort state, pagination state, and modal state.

- `src/views/auth/seller/TransactionView.vue`
  Seller transaction page. It owns seller filters, seller search/date/sort state, pagination state, seller approval state, and modal state.

- `src/components/transaction/TransactionCard.vue`
  Shared compact transaction card used by buyer and seller pages.

- `src/components/transaction/TransactionDetailModal.vue`
  Shared modal for transaction details, invoice copy, payment information, product list, shipping information, notes, price details, and seller approval action.

- `src/components/transaction/TransactionInfoRow.vue`
  Small shared label/value row used inside the detail modal.

- `src/components/PaginationView.vue`
  Shared pagination component used by transaction pages.

- `src/store.js`
  Vuex actions for transaction list loading and seller transaction approval.

- `src/assets/style/style.css`
  Transaction date picker overrides.

- `src/assets/style/select-element-ui.css`
  Transaction status and sort select overrides.

## Routes

The transaction views are reached through authenticated buyer and seller routes.

```text
/buyer/transaction
/seller/transaction
```

The buyer checkout flow routes to the buyer transaction page after checkout succeeds.

## Shared Filters

Both buyer and seller transaction pages send filter state to the backend through `getTransactions`.

Request parameters:

- `user_type`: `buyer` or `seller`.
- `status_filter`: selected transaction status filter.
- `search`: search keyword.
- `sort`: `newest` or `oldest`.
- `page`: current page number.
- `per_page`: page size.
- `date_from`: optional `YYYY-MM-DD` start date.
- `date_to`: optional `YYYY-MM-DD` end date.

The current UI uses:

- an Element Plus status select with a compact count badge;
- a text input for search;
- an Element Plus date range picker with `Start Date` and `End Date` placeholders;
- an Element Plus select for newest/oldest sorting.

On wide desktop screens, the transaction toolbar keeps the capped search input on the left and groups the status select, date range picker, and sort select on the right.

## Buyer Transaction Page

The buyer page defaults to paid transaction history.

Buyer status filters:

- `Semua`: paid transaction history only.
- `Belum Dibayar`: pending invoices.
- `Menunggu Penjual`: paid transactions waiting for seller approval.
- `Selesai`: completed transactions.

Important buyer behavior:

- Pending invoices are intentionally not mixed into the paid history list by default.
- When pending payments exist and the buyer is not already on `Belum Dibayar`, the page shows a `Menunggu Pembayaran` notice.
- Clicking the notice switches the page to `pending_payment`.
- The pending-payment tab does not show pagination because it is an action queue, not history browsing.
- Pending payment cards focus on payment method, virtual account number, expiry date, total payment, and copy action.
- Paid transaction cards focus on product summary, seller display name, total price, and detail action.

## Seller Transaction Page

Seller status filters:

- `Semua`: all seller transaction rows.
- `Belum Dibayar`: buyer has not paid the invoice yet.
- `Perlu Persetujuan`: buyer has paid and the seller must approve the transaction.
- `Selesai`: completed seller transaction rows.

Important seller behavior:

- Seller cards show the buyer name as the counterparty.
- Seller cards show `Total Pendapatan`, based on product price only.
- The detail modal shows `Setujui Transaksi` when the transaction is paid and waiting for seller approval.
- Seller approval dispatches `approvedTransaction`.

## Transaction Card

`TransactionCard.vue` is role-aware through the `role` prop.

Display rules:

- Buyer cards display `seller_name`.
- Seller cards display `buyer_name`.
- Buyer pending cards show payment details instead of product images.
- Non-pending cards show the first product, quantity, price, and `+n produk lainnya` when more products exist.
- Buyer pending totals use `Total Pembayaran`.
- Buyer paid totals use `Total Harga`.
- Seller totals use `Total Pendapatan`.

Status mapping in the card:

```text
invoice_status = pending
  -> pending_payment

invoice_status = done and transaction_status = approved_seller
  -> waiting_seller

invoice_status = done and transaction_status = done
  -> done
```

Payment logos are currently resolved from `/img/bca.png` when `payment_name` contains `bca`.

## Detail Modal

`TransactionDetailModal.vue` keeps long transaction details out of the list card.

The modal includes:

- status badge and transaction date;
- role-based counterparty label;
- invoice ID with copy icon button;
- full product list;
- shipping courier, estimation, and buyer address;
- buyer note;
- payment method, virtual account, and expiry date;
- price summary;
- seller approval action when applicable.

The modal is intentionally used instead of expanding long details inline. This keeps the list scannable and leaves room for future transaction details to grow.

## Pagination

`PaginationView.vue` receives the backend `pagination` object and emits `change-page`.

Expected pagination shape:

```json
{
  "current_page": 1,
  "last_page": 1,
  "per_page": 5,
  "total": 0,
  "from": 0,
  "to": 0
}
```

The pagination UI shows:

- current item range;
- previous and next controls;
- page numbers;
- ellipsis when the page count is large.

Buyer pending-payment lists do not show pagination. Other transaction lists use pagination.

## API Calls

The frontend uses these backend API actions through `src/store.js`:

```text
GET  /api/transaction
POST /api/transaction/approved
```

Authenticated requests use the stored bearer token.

## UI Notes

- The page title is `Transaksi`.
- The list uses compact cards to keep transaction history scannable.
- Transaction details are opened in a modal instead of inline expansion.
- Pending payment is treated as a separate action queue.
- Copy actions use the browser clipboard fallback and show Element Plus notifications.
- Status, date, and sort controls use Element Plus styling so they match the transaction filter bar.
- The transaction card keeps action buttons aligned with the total block.

## Known Decisions

- Transaction documentation is centralized in one frontend document because buyer and seller share most UI concepts.
- Buyer `Semua` intentionally means paid transaction history, not pending invoices.
- Pending payment rows are separated so unpaid invoices do not get buried inside paid history.
- The buyer should see the seller company name when available. The backend falls back to the seller user name when no company name exists.
- The seller should see the buyer user name.
