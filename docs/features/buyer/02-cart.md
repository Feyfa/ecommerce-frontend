# Buyer Cart

This document explains the current buyer cart feature from the frontend side.

The goal is to keep a practical map of the cart UI, state, API usage, and recovery behavior so future changes can preserve the checkout safety flow.

## Purpose

The buyer cart page lets a buyer review selected products, group items by seller, adjust quantities, select products for checkout, and continue to checkout.

Current supported actions:

- View cart items grouped by seller.
- Select or unselect one item.
- Select or unselect all available items from one seller.
- Select or unselect all available items in one request.
- Increase, decrease, or type item quantity.
- Delete a cart item after confirmation.
- See sold-out item state.
- See checked-item total price.
- Validate cart state before navigating to checkout.

## Main Files

- `src/views/auth/buyer/KeranjangView.vue`
  Main buyer cart page. It owns cart rendering, grouped UI, quantity controls, selection controls, checkout button state, delete confirmation, and error-state sync.

- `src/store.js`
  Vuex actions for cart API calls.

- `src/components/app/SidebarComponent.vue`
  Buyer navigation entry for the cart page.

## Important State

`KeranjangView.vue`:

- `keranjangs`: raw grouped cart response from the backend.
- `totalPrice`: backend-calculated total for checked rows.
- `isProcessCheckout`: checkout validation request is in progress.
- `isProcessChecked`: item/group/all checked state request is in progress.
- `quantityProcessing`: object keyed by product id for quantity requests in progress.
- `quantityBeforeEdit`: object keyed by product id that stores the quantity before manual input editing.
- `disabled.buttonCheckout`: whether the checkout button can be clicked.
- `show.keranjang_view`: cart content visibility.
- `show.loading`: initial loading state.

Computed values:

- `keranjangGroups`: array version of the grouped backend response.
- `hasKeranjang`: whether the cart has at least one seller group.
- `availableKeranjangCount`: count of items with `p_stock > 0`.
- `selectedKeranjangCount`: count of available checked items.
- `hasQuantityProcessing`: true when any quantity request is still pending.

## UI Behavior

### Empty State

When `hasKeranjang` is false, the page shows an empty cart message and a `Mulai Belanja` button that routes to buyer belanja.

### Grouped Cart

The backend response is grouped by seller id. The page renders each group as one seller section with:

- seller checkbox
- seller name
- one row per product

Each product row shows:

- item checkbox when stock is available
- product image
- product name
- formatted price
- stock badge
- delete button
- quantity controls when stock is available

Sold-out rows show a sold-out overlay and cannot be checked.

### Select One Item

Item checkbox changes dispatch `checkedKeranjang`.

After success:

- `keranjangs` is replaced from the response.
- `totalPrice` is replaced from the response.
- checkout button state is recalculated.

### Select Seller Group

Seller checkbox changes dispatch `checkedKeranjangGroup`.

The UI treats a seller group as checked only when the group has available products and all available products are checked.

### Select All

The `Pilih Semua` checkbox dispatches `checkedKeranjangAll`.

The frontend now sends one request:

```text
POST /api/keranjang/checked/all
```

The backend handles stock filtering. This avoids the previous behavior where the frontend sent one request per seller.

### Quantity Controls

Quantity can be changed through:

- plus button
- minus button
- direct input followed by blur

Important behavior:

- minus is disabled at `1`
- plus is disabled at current stock
- input is sanitized to digits only
- input is clamped to stock
- checkout is disabled while any quantity request is pending
- checked item total is optimistically updated while the request is in progress
- failed requests restore the previous quantity and then sync from backend response when available

### Delete Item

Delete uses SweetAlert confirmation.

When confirmed, `deleteKeranjang` dispatches the delete request and refreshes cart state from the backend response.

### Checkout

The checkout button is enabled only when at least one item is checked and no checkout/checked/quantity request is in progress.

Checkout sends:

```json
{
  "user_id_buyer": "buyer uuid",
  "product_ids": ["checked product uuid"]
}
```

On success, the page routes to `buyer_checkout`.

On failure, the cart syncs from the backend response when `keranjangs` and `totalPrice` are present, then shows an error notification.

## API Calls

The frontend uses these backend API actions through `src/store.js`:

```text
GET    /api/keranjang/{user_id_buyer}
POST   /api/keranjang/checked
POST   /api/keranjang/checked/group
POST   /api/keranjang/checked/all
POST   /api/keranjang/total/plus
POST   /api/keranjang/total/minus
POST   /api/keranjang/total/change
DELETE /api/keranjang/{user_id_buyer}/{product_id}
POST   /api/keranjang/validate/checkout
```

Authenticated requests use the current Clerk session token attached by the shared Axios interceptor.

## Error Sync

`syncKeranjangFromResponseData(responseData)` centralizes recovery from backend error responses.

It updates:

- `keranjangs`
- `totalPrice`
- checkout button state

This is used by checkout and quantity error handlers so stale UI can recover without reloading the whole page.

Expected syncable error responses include:

- missing cart row
- missing product
- stale checkout checked state
- invalid checkout quantity
- sold-out checkout state

## UI Notes

- The cart page uses a light slate background, white sections, soft borders, and restrained violet primary actions.
- The desktop layout uses a cart column and a checkout summary column.
- The checkout summary becomes fixed at the bottom on smaller screens.
- Product images use `object-contain` so products remain inspectable.
- Icon buttons use existing Font Awesome and Bootstrap icon classes already used by the app.
- The visible total always comes from backend `totalPrice` after a successful request.

## Tested Scenarios

The current behavior was verified in the browser:

- Select all checked items.
- Unselect all checked items.
- Restore all checked items.
- Increase `Baju Hitam` quantity from `1` to `2`.
- Decrease `Baju Hitam` quantity from `2` back to `1`.
- Confirm total changes from `Rp 1.375.000` to `Rp 1.425.000` and back.
- Navigate to checkout after successful validation.
- Reject checkout when database quantity is greater than product stock.
- Reject checkout when checked state in the UI is stale.
- Recover when a cart row is deleted after the page has already loaded.

After edge testing, the cart was restored to:

- 4 products.
- all products checked.
- all quantities equal to `1`.
- total `Rp 1.375.000`.

## Known Decisions

- The frontend does not implement select-all by looping over seller groups anymore.
- The backend is the source of truth for checked state and `totalPrice`.
- Checkout is disabled while quantity requests are pending to reduce stale quantity risk.
- Error responses with cart state are preferred over forcing a full page reload.
