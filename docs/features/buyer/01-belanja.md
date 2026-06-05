# Buyer Belanja

This document explains the current buyer belanja feature from the frontend side.

The goal is to keep a lightweight map of the feature so future work can understand the main UI, state, and API usage without reading the whole page first.

## Purpose

The buyer belanja feature lets a buyer browse products sold by other users and add available products to their cart.

Current supported actions:

- View product list from other sellers.
- Search products by product name or seller name.
- Sort products by latest update, price, or name.
- Filter products by stock availability.
- Reset active search, sort, and stock filters.
- Load more products through infinite scroll.
- Add an available product to the cart.
- See sold-out products without a cart action.
- See an empty state when the active search or filters return no results.

## Main Files

- `src/views/auth/buyer/BelanjaView.vue`
  Main buyer shopping page. It owns the product list, search keyword, sort option, stock filter, filter chips, empty state, sold-out card state, add-to-cart action, price formatting, and infinite-scroll product loading.

- `src/store.js`
  Vuex actions for buyer belanja and cart API calls.

- `src/components/app/SidebarComponent.vue`
  Buyer navigation entry for the belanja page.

## Important State

`BelanjaView.vue`:

- `products`: currently loaded buyer product cards.
- `searchProduct`: current input value in the search field.
- `activeSearchProduct`: keyword that is actually used by the current belanja query.
- `stockFilter`: selected buyer stock filter. Supported values are `all`, `available`, and `empty`.
- `sortProduct`: selected buyer sort option. Supported values are `latest`, `price_lowest`, `price_highest`, `name_asc`, and `name_desc`.
- `stockFilterOptions`: stock filter options shown in the toolbar.
- `sortProductOptions`: sort options shown in the toolbar.
- `productRequestVersion`: internal request guard so stale list/search responses do not overwrite newer product state.
- `completeProduct`: marks that the backend has no more products to return.
- `show.loading`: initial page loading state.
- `show.loading_search_product`: search/list reload loading state.

Computed state:

- `hasActiveBelanjaFilter`: true when search, sort, or stock filter differs from the default state.
- `activeBelanjaFilterChips`: compact labels for the active search, sort, and stock filters.

## Flows

### List Products

1. `BelanjaView.vue` mounts.
2. It calls `getBelanja()`.
3. The current product ids are sent as `products_current_id`.
4. The active search keyword, stock filter, and sort option are sent with the request.
5. The backend returns the next product batch.
6. New products are appended to `products`.

Infinite scroll is driven by the global scroll event. When the global container reaches the bottom, `getBelanja()` loads the next batch unless `completeProduct` is already true.

### Filter And Sort Products

1. The buyer changes the sort or stock dropdown.
2. `applyBelanjaFilters()` clears the current list and resets infinite-scroll completion state.
3. `getBelanja()` reloads products from the first batch using the selected filter values.
4. New products are appended to `products`.

The reset button is disabled while the search, stock filter, and sort option are all in their default state. Clicking it clears search, restores `Semua Produk` and `Terbaru`, then reloads the product list.

### Search Products

1. The buyer types in the search input.
2. Pressing Enter copies the trimmed input into `activeSearchProduct`.
3. The product list is cleared and fetched again with the active keyword.
4. If no product matches the active search and filters, the empty state shows `Produk tidak ditemukan`.
5. When the input is cleared after a search, `activeSearchProduct` is reset and all products are fetched again.

`hasActiveBelanjaFilter` exists so the empty state can distinguish between "the active search or filter returned no result" and "there are no products available for the buyer".

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

`GET /api/belanja/{user_id_seller}` sends:

- `products_current_id`
- `search_product`
- `stock_filter`
- `sort_product`

## UI Notes

- The page follows the same visual direction as seller product: white toolbar, light page background, white cards, soft border, and soft shadow.
- The toolbar uses a responsive grid: the search field is capped on wide desktop screens, while sort, stock filter, and reset button stay grouped on the right with consistent fixed columns.
- Active search, sort, and stock filters are shown as violet chips below the toolbar.
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
- Sort and stock filter changes reload the product list immediately.
- Buyer stock filters intentionally use fewer options than seller product management because buyers only need all products, available stock, or sold-out products.
- Product pagination uses `products_current_id` instead of a page number.
- Buyer card UI is similar to seller product but not identical because buyer cards include seller name and cart action instead of edit/delete actions.
