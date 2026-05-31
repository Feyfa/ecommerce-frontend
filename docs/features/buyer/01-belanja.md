# Buyer Belanja

This document explains the current buyer belanja feature from the frontend side.

The goal is to keep a lightweight map of the feature so future work can understand the main UI, state, and API usage without reading the whole page first.

## Purpose

The buyer belanja feature lets a buyer browse products sold by other users and add available products to their cart.

Current supported actions:

- View product list from other sellers.
- Search products by product name or seller name.
- Load more products through infinite scroll.
- Add an available product to the cart.
- See sold-out products without a cart action.
- See an empty state when search returns no results.

## Main Files

- `src/views/auth/buyer/BelanjaView.vue`
  Main buyer shopping page. It owns the product list, search keyword, empty state, sold-out card state, add-to-cart action, price formatting, and infinite-scroll product loading.

- `src/store.js`
  Vuex actions for buyer belanja and cart API calls.

- `src/components/app/SidebarComponent.vue`
  Buyer navigation entry for the belanja page.

## Important State

`BelanjaView.vue`:

- `products`: currently loaded buyer product cards.
- `searchProduct`: current input value in the search field.
- `activeSearchProduct`: keyword that is actually used by the current belanja query.
- `productRequestVersion`: internal request guard so stale list/search responses do not overwrite newer product state.
- `completeProduct`: marks that the backend has no more products to return.
- `show.loading`: initial page loading state.
- `show.loading_search_product`: search/list reload loading state.

## Flows

### List Products

1. `BelanjaView.vue` mounts.
2. It calls `getBelanja()`.
3. The current product ids are sent as `products_current_id`.
4. The backend returns the next product batch.
5. New products are appended to `products`.

Infinite scroll is driven by the global scroll event. When the global container reaches the bottom, `getBelanja()` loads the next batch unless `completeProduct` is already true.

### Search Products

1. The buyer types in the search input.
2. Pressing Enter copies the trimmed input into `activeSearchProduct`.
3. The product list is cleared and fetched again with the active keyword.
4. If no product matches, the empty state shows `Produk tidak ditemukan`.
5. When the input is cleared after a search, `activeSearchProduct` is reset and all products are fetched again.

`activeSearchProduct` exists so the empty state can distinguish between "search returned no result" and "there are no products available for the buyer".

### Add To Cart

1. The buyer clicks the cart icon on an available product card.
2. `BelanjaView.vue` dispatches `addKeranjang`.
3. The request sends `user_id_buyer`, `user_id_seller`, and `product_id`.
4. On success, Element Plus notification shows the backend message.
5. If the backend returns `stock_maximum`, an error notification is shown.

Sold-out products show a sold-out overlay and do not render the cart button.

## API Calls

The frontend uses these backend API actions through `src/store.js`:

- `GET /api/belanja/{user_id_seller}`
- `POST /api/keranjang`

Authenticated requests use the stored bearer token.

## UI Notes

- The page follows the same visual direction as seller product: white toolbar, light page background, white cards, soft border, and soft shadow.
- Buyer cards include seller name, so they use `h-[18.5rem]` instead of the seller product card height.
- Product images use `object-contain` so the full product is visible.
- Prices are formatted with Indonesian thousands separators, for example `Rp 12.000.000`.
- Stock is shown as a badge. Sold-out stock uses red styling.
- The cart icon is hidden for sold-out products.
- Empty state is different for no search result and truly unavailable products.
- The mobile layout is supported and should be checked when changing toolbar, grid, card, or empty-state layout.

## Known Decisions

- Buyer belanja does not show the buyer's own seller products.
- Product search is executed on Enter, not on every keystroke.
- Clearing the search input after a search reloads the full product list.
- Product pagination uses `products_current_id` instead of a page number.
- Buyer card UI is similar to seller product but not identical because buyer cards include seller name and cart action instead of edit/delete actions.
