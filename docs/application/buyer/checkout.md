# Buyer Checkout

This document explains the current buyer checkout feature from the frontend side.

The goal is to keep a practical map of the checkout UI, state, API usage, and stale-checkout recovery behavior so future changes can preserve the payment flow and buyer review experience.

## Purpose

The buyer checkout page lets a buyer review selected cart items, choose shipping per seller, choose a payment method, and submit the checkout.

Current supported actions:

- Load checked cart items from the backend checkout state.
- Review the active buyer shipping address.
- Open the address picker and switch the active buyer address.
- Review checkout items grouped by seller.
- Choose one courier option per seller package.
- Add one optional note per seller package.
- Choose a payment method from the backend payment list.
- Review product total, shipping total, and final total.
- Submit checkout with a client snapshot for stale-state protection.
- Refresh the checkout UI when the backend reports that checkout data changed.
- Route back to cart when the backend reports that checkout is no longer valid.

## Main Files

- `src/views/auth/buyer/CheckoutView.vue`
  Main buyer checkout page. It owns checkout rendering, address modal behavior, package-by-seller UI, courier selection, seller notes, payment selection, total calculation, client snapshot building, stale-checkout recovery, and checkout submission.

- `src/store.js`
  Vuex actions for checkout, address, and checkout process API calls.

- `src/router/index.js`
  Defines `/buyer/checkout` with route name `buyer_checkout`.

- `src/views/auth/buyer/KeranjangView.vue`
  Previous buyer step. It validates selected cart items before routing to `buyer_checkout`.

## Important State

`CheckoutView.vue`:

- `alamat`: active buyer address text shown in the address section.
- `activeAlamat`: full active address used to compare its id and update version during submit.
- `alamats`: address list shown in the address picker modal.
- `checkouts`: seller-grouped checkout packages returned by the backend.
- `payments`: backend payment methods available for checkout.
- `kurirs`: selected courier per seller package.
- `noteds`: note per seller package.
- `paymentName`: selected payment display name.
- `paymentSlug`: selected payment slug sent to the backend.
- `paymentMethod`: selected payment method used for frontend validation.
- `totalPriceKeranjangs`: backend product total for checkout products.
- `totalPriceKurirs`: frontend-calculated shipping total from selected couriers.
- `totalPriceAll`: product total plus shipping total.
- `isProcessCheckout`: checkout process request is in progress.
- `isProcessGetAlamatBuyer`: address list request is in progress.
- `isProcessEnableAlamatBuyer`: per-address active-address update state.
- `show.checkout_view`: checkout content visibility.
- `show.loading`: initial loading state.

Helper methods:

- `formatRupiah(value)`: formats numbers for display.
- `getCheckoutProductTotal(item)`: returns item subtotal from `k_total_price`, with a quantity-price fallback.
- `buildShippingOptions()`: converts selected `kurirs` into the backend request shape.
- `buildClientSnapshot()`: creates the stale-checkout comparison payload.
- `applyCheckoutSnapshot(checkout)`: updates the page from a backend refresh snapshot after `CHECKOUT_CHANGED`.

## UI Layout

The checkout page uses a one-page review flow. It does not embed the cart page and does not use a multi-page stepper.

Desktop layout:

- left column:
  - page title and helper copy
  - address card
  - checkout packages grouped by seller
  - product rows inside each package
  - courier selector per seller
  - estimated delivery display per seller
  - note input per seller
- right column:
  - payment method list
  - checkout summary
  - final total
  - `Bayar Sekarang` button

Mobile layout:

- checkout content becomes a single column.
- payment and summary sections appear below the packages.
- final total and `Bayar` action are fixed in a bottom bar.

## Flows

### Load Checkout

1. `CheckoutView.vue` mounts.
2. It dispatches `getDataCheckout`.
3. The backend returns active address, checkout packages, payment methods, and product total.
4. The first payment method is selected by default.
5. Default courier and note structures are generated per seller package.
6. Shipping total and final total are calculated.
7. The checkout page is shown.

If loading fails generically, the page shows an error notification and redirects to `/buyer/keranjang`.

If the active buyer address is a legacy manual row, the backend returns
`ADDRESS_REQUIRES_VERIFICATION` and the page directs the buyer to address
settings. If a seller still has a legacy manual address, the backend returns
`SELLER_ADDRESS_REQUIRES_VERIFICATION`. The page shows a blocking `Lokasi Toko
Belum Diverifikasi` dialog and only returns to the cart after the buyer confirms
`Kembali ke Keranjang`. The same dialog behavior applies when the seller loses
verification immediately before `Bayar Sekarang`. Neither condition may
proceed to payment.

### Change Address

1. The buyer clicks `Ganti`.
2. The page dispatches `getAlamatBuyer`.
3. The address modal opens with available buyer addresses.
4. The buyer clicks `Pilih` on a verified non-active address. Legacy rows show
   `Verifikasi` and route to address settings instead.
5. The page dispatches `setEnableAlamatBuyer`.
6. On success, `alamat` is replaced with the backend `currentAlamat.alamat`, the modal closes, and a success notification is shown.

### Change Courier

Each seller package has an independent courier selector. The package heading uses the seller's public company/store name, with the seller account name only as a backend fallback for legacy or incomplete profiles.

When the selected courier changes:

1. `kurirs[index]` is updated with the selected courier price and estimation.
2. `calculatePrice()` recalculates `totalPriceKurirs`.
3. `totalPriceAll` is recalculated from product total plus shipping total.

### Change Payment

Payment rows come from the backend `payments` response.

Clicking a payment row:

1. sets `paymentName`;
2. sets `paymentSlug`;
3. sets `paymentMethod`;
4. updates the radio selection styling.

The frontend currently sends `paymentSlug` to the backend during checkout. The backend validates the final allowed method.

### Process Checkout

Before dispatching `processCheckout`, the page validates that `paymentName`, `paymentSlug`, and `paymentMethod` are present.

The request sends:

```json
{
  "shipping_options": [
    {
      "user_id_seller": "seller uuid",
      "kurir_name": "JNT"
    }
  ],
  "noteds": [
    {
      "user_id_seller": "seller uuid",
      "noted": "optional note"
    }
  ],
  "payment_slug": "bca",
  "client_snapshot": {
    "alamat_id": "address uuid",
    "alamat_updated_at": "address ISO timestamp",
    "cart_item_ids": ["cart uuid"],
    "total_product": 1310000,
    "total_shipping": 30000,
    "total_all": 1340000
  }
}
```

On success:

- a success notification is shown;
- the page routes to `buyer_transaction`.

When the response contains `transaction_invoice_id`, the redirect carries `status=pending_payment` and
`invoice=<transaction_invoice_id>` as route query. The transaction page consumes that context on load to
open the pending-payment filter and highlight every transaction created by that checkout, then clears the
query. A response without `transaction_invoice_id` still routes to `buyer_transaction` without query.

## API Calls

The frontend uses these backend API actions through `src/store.js`:

```text
GET /api/checkout/data
POST /api/checkout/process
GET /api/alamat/buyer
PUT /api/alamat-enable/buyer/{id}
```

`/api/keranjang/validate/checkout` is used by the cart page before navigating to checkout.

Authenticated requests use the current Clerk session token attached by the shared Axios interceptor.

## Error Sync

### `CHECKOUT_CHANGED`

When `POST /api/checkout/process` returns `409` with `code = CHECKOUT_CHANGED`, the response includes a `checkout` snapshot.

The frontend calls `applyCheckoutSnapshot()` to update:

- `alamat`
- `checkouts`
- `kurirs`
- `noteds`
- `totalPriceKeranjangs`
- `totalPriceKurirs`
- `totalPriceAll`

The buyer stays on checkout and sees a warning notification, so they can review the changed totals before paying again.

### `CHECKOUT_INVALID`

When checkout is no longer payable, the backend returns `409` with `code = CHECKOUT_INVALID`.

The frontend shows an error notification and routes back to `buyer_keranjang`.

Expected invalid cases include:

- active address missing;
- no checkout cart rows;
- product was deleted or became sold out;
- product stock changed below checkout quantity;
- checkout cart data became stale enough that the buyer should return to cart.

A seller location that becomes unverified after Checkout opens uses the more
specific `SELLER_ADDRESS_REQUIRES_VERIFICATION` contract instead. Both checkout
load and payment submission wait for the buyer to acknowledge the seller-location
dialog before routing back to the cart.

The backend cancels the complete attempt rather than silently removing only the invalid item. The affected cart selection is cleared after rollback, while its quantity is preserved for review on the cart page.

### Validation Errors

`422` validation responses contain a keyed message object. The frontend iterates the keys and shows each first validation message as an error notification.

## UI Notes

- The checkout page uses the same visual direction as the cart page: light slate background, white sections, soft borders, and restrained violet primary actions.
- Product images use `object-contain` so products remain inspectable.
- Each seller group is presented as a shipping package because courier and note choices are seller-scoped.
- The desktop payment/summary panel is sticky so totals and payment action remain visible while reviewing long checkout lists.
- The mobile layout keeps the final total and payment action in a fixed bottom bar.
- Payment list logos are loaded from `/img/{slug}.png`.
- The page intentionally keeps checkout as one review page instead of adding a visible cart-to-payment stepper.

## Known Decisions

- Checkout data is loaded from backend checkout rows, not from cart page local state.
- Courier options are generated by the backend and selected by the frontend per seller package.
- Shipping total is recalculated on the frontend after courier changes, then verified by the backend snapshot comparison during checkout processing.
- The frontend sends a client snapshot so the backend can reject stale totals before creating a payment.
- The backend is the source of truth for final checkout validity and payment support.
- The visible checkout UI can show all payment methods returned by the backend, but payment processing currently depends on backend validation.

## QA Coverage

- [TOK-8 Pinpoint Address QA](../../qa/tok-8-pinpoint-address.md) tracks
  checkout and address-snapshot UI verification.
