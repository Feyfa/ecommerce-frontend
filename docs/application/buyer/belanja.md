# Buyer Belanja

This document explains the current buyer belanja feature from the frontend side.

The goal is to keep a lightweight map of the feature so future work can understand the main UI, state, and API usage without reading the whole page first.

## Purpose

The buyer belanja feature lets a buyer browse products sold by other users and add available products to their cart.

Current supported actions:

- View product list from other sellers.
- Search products by product name or store name.
- Sort products by update date, price, or name.
- Clear an active product search or reset sorting.
- Load more products through infinite scroll.
- Add an available product to the cart.
- See only active products with stock whose seller location is verified.
- See an empty state when the active search or sorting returns no results.

## Main Files

- `src/views/auth/buyer/BelanjaView.vue`
  Main buyer shopping page. It owns the product list, search keyword, sort option, filter chips, empty state, add-to-cart action, price formatting, and infinite-scroll product loading.

- `src/store.js`
  Vuex actions for buyer belanja and cart API calls.

- `src/components/app/SidebarComponent.vue`
  Buyer navigation entry for the belanja page.

## Important State

`BelanjaView.vue`:

- `products`: currently loaded buyer product cards.
- `searchProduct`: current input value in the search field.
- `activeSearchProduct`: keyword that is actually used by the current belanja query.
- `sortProduct`: selected buyer sort option. Supported values are `latest`, `oldest`, `price_lowest`, `price_highest`, `name_asc`, and `name_desc`.
- `sortProductOptions`: sort options shown in the toolbar.
- `productRequestVersion`: internal request guard so stale list/search responses do not overwrite newer product state.
- Failed current requests stop both page and filter loading states so the toolbar cannot remain stuck after an API error.
- `completeProduct`: marks that the backend has no more products to return.
- `show.loading`: initial page loading state.
- `show.loading_search_product`: search/list reload loading state.

Computed state:

- `hasActiveBelanjaFilter`: true when search or sorting differs from the default state.
- `activeBelanjaFilterChips`: compact labels for active search and sorting.

## Flows

### List Products

1. `BelanjaView.vue` mounts.
2. It calls `getBelanja()`.
3. The current product ids are sent as `products_current_id`.
4. The active search keyword and sort option are sent with the request.
5. The backend returns the next product batch.
6. New products are appended to `products`.

Infinite scroll is driven by the global scroll event. When the global container reaches the bottom, `getBelanja()` loads the next batch unless `completeProduct` is already true.

### Sort Products

1. The buyer changes the labeled sort select.
2. `applyBelanjaFilters()` clears the current list and resets infinite-scroll completion state.
3. `getBelanja()` reloads products from the first batch using the selected sort value.
4. New products are appended to `products`.

The reset button appears only when the sort select is not `Terbaru`. Clicking it restores `Terbaru`, reloads the product list, and keeps any active search keyword.

### Search Products

1. The buyer types in the search input.
2. Pressing Enter copies the trimmed input into `activeSearchProduct`.
3. The product list is cleared and fetched again with the active keyword.
4. If no product matches the active search and sorting, the empty state shows `Produk tidak ditemukan`.
5. When the input is cleared after a search, `activeSearchProduct` is reset and all products are fetched again.

`hasActiveBelanjaFilter` exists so the empty state can distinguish between "the active search or filter returned no result" and "there are no products available for the buyer".

### Add To Cart

1. The buyer clicks the cart icon on an available product card.
2. `BelanjaView.vue` dispatches `addKeranjang`.
3. The request sends `user_id_buyer`, `user_id_seller`, and `product_id`.
4. On success, Element Plus notification shows the backend message.
5. If availability changed after listing, a warning is shown and the stale product card is removed from the current catalog.

The backend excludes soft-deleted, sold-out, and unverified-seller products from this list. Add-to-cart and cart validation still protect against changes after the list response.

## API Calls

The frontend uses these backend API actions through `src/store.js`:

- `GET /api/belanja`
- `POST /api/keranjang`

Authenticated requests use the current Clerk session token attached by the shared Axios interceptor.

`GET /api/belanja` sends:

- `products_current_id`
- `search_product`
- `sort_product`

## UI Notes

- The page follows the same visual direction as seller product: white toolbar, light page background, white cards, soft border, and soft shadow.
- The toolbar uses a responsive layout: below `640px`, search remains full-width while the labeled sort select and reset button share one row. From `640px`, search stays on the left while sort and reset remain grouped on the right. The search field uses a maximum width of `18rem`.
- The sort select uses the same control width as its option list. Its reset button appears only for a non-default order and restores only the default sort while keeping any active search keyword.
- Active search and non-default sorting are shown as violet chips below the toolbar.
- Buyer cards include the public store name, so they use `h-[18.5rem]` instead of the seller product card height.
- Product images use `object-contain` so the full product is visible.
- Prices are formatted with Indonesian thousands separators, for example `Rp 12.000.000`.
- Stock is shown as a badge and every returned product satisfies all backend purchase rules.
- Empty state is different for no search result and truly unavailable products.
- The mobile layout is supported and should be checked when changing toolbar, grid, card, or empty-state layout.

## Known Decisions

- Buyer belanja does not show the buyer's own seller products.
- Product search is executed on Enter, not on every keystroke.
- Clearing the search input after a search reloads the full product list.
- Sort changes reload the product list immediately.
- Stock condition is intentionally not exposed as a buyer control; the backend only returns products that can be purchased.
- Product pagination uses `products_current_id` instead of a page number.
- Buyer card UI is similar to seller product but not identical because buyer cards include the public store name and cart action instead of edit/delete actions.
- The backend prioritizes the seller company/store name and only falls back to the seller account name for a legacy or incomplete company profile.
