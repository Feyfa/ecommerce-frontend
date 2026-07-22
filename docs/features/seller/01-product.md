# Seller Product

This document explains the current seller product feature from the frontend side.

The goal is to keep a lightweight map of the feature so future work can understand the main UI, state, and API usage without reading every component first.

## Purpose

The seller product feature lets a seller manage their own product catalog.

Current supported actions:

- View product list.
- Search products by name.
- Filter products by stock condition.
- Sort products by latest update, price, stock, or name.
- Add a product with one to five image uploads.
- Edit product data and manage image additions, removals, and ordering.
- Delete a product after confirmation.
- Preview product images through a zoom viewer.

## Main Files

- `src/views/auth/seller/ProductView.vue`
  Main seller product page. It owns the list, search keyword, empty states, add/edit modal opening, delete action, and infinite-scroll product loading.

- `src/components/product/add.vue`
  Product creation drawer. It handles image selection, preview, form fields, validation display, image zoom, and submit.

- `src/components/product/edit.vue`
  Product editing drawer. It fetches one product before editing, supports loading state, ordered image management, and submit.

- `src/components/product/ProductImagesInput.vue`
  Shared image input for local previews, validation, zoom, removal, and drag-and-drop ordering in both product forms.

- `src/store.js`
  Vuex actions for product API calls.

- `src/global.js`
  Global modal flags for add and edit product drawers.

## Important State

`ProductView.vue`:

- `products`: currently loaded seller products.
- `searchProduct`: current input value in the search field.
- `activeSearchProduct`: keyword that is actually used by the current product query.
- `stockFilter`: active stock filter value for the current product query.
- `sortProduct`: active sort value for the current product query.
- `stockFilterOptions`: available stock filter choices shown in the product toolbar.
- `sortProductOptions`: available sort choices shown in the product toolbar.
- `productRequestVersion`: internal request guard so stale list/search responses do not overwrite newer product state.
- `completeProduct`: marks that the backend has no more products to return.
- `editProductId`: selected product id for the edit drawer.
- `show.loading`: initial page loading state.
- `show.loading_search_product`: search/list reload loading state.

`add.vue` and `edit.vue`:

- `productImages`: ordered existing images and local file previews, with the first entry acting as the primary image.
- `name`, `price`, `priceString`, `stock`: form fields. `price` keeps the raw numeric value for the API payload, while `priceString` keeps the formatted rupiah input display.
- `errors`: validation errors returned by the backend.

`ProductImagesInput.vue` owns the shared file input, local preview URLs, zoom viewer state, removal, and drag-and-drop ordering.

## Flows

### List Products

1. `ProductView.vue` mounts.
2. It calls `getProducts()`.
3. The current product ids are sent as `products_current_id`.
4. The backend returns the next product batch.
5. New products are appended to `products`.

Infinite scroll is driven by the global scroll event. When the global container reaches the bottom, `getProducts()` loads the next batch unless `completeProduct` is already true.

### Search Products

1. The seller types in the search input.
2. Pressing Enter copies the trimmed input into `activeSearchProduct`.
3. The product list is cleared and fetched again with the active keyword.
4. If no product matches, the empty state shows `Produk tidak ditemukan`.
5. When the input is cleared after a search, `activeSearchProduct` is reset and all products are fetched again.

`activeSearchProduct` exists so the empty state can distinguish between "search returned no result" and "seller really has no products".

### Filter and Sort Products

1. The seller selects a stock filter or sort option from the product toolbar.
2. `ProductView.vue` clears the current product list.
3. The next request sends `stock_filter` and `sort_product` through the `getProducts` Vuex action.
4. The backend returns a filtered and sorted product batch.
5. Active filter chips appear when search, stock filter, or non-default sorting is active.
6. Clicking `Reset Filter` clears the search, restores the default stock filter and sort, then reloads the product list.

Supported stock filter values:

- `all`: all seller products.
- `available`: products with stock greater than `0`.
- `low`: products with stock between `1` and `5`.
- `empty`: products with stock less than or equal to `0`.

Supported sort values:

- `latest`: newest updated products first.
- `oldest`: oldest updated products first.
- `price_highest`: highest price first.
- `price_lowest`: lowest price first.
- `stock_highest`: highest stock first.
- `stock_lowest`: lowest stock first.
- `name_asc`: product name A-Z.
- `name_desc`: product name Z-A.

### Add Product

1. The seller clicks `Tambah Produk`.
2. `this.$global.modals.addProduct` opens `add.vue`.
3. The seller selects 1 to 5 images, arranges them with drag-and-drop, and fills name, price, and stock.
4. `add.vue` submits a `FormData` payload through the `addProduct` Vuex action.
5. Files remain local previews until submit. On success, `ProductView.vue` prepends the returned product to `products`.

The price input is displayed as a rupiah-style input group with an `Rp` prefix and Indonesian thousands separators. For example, typing `500000` is displayed as `500.000`, but the value submitted through `FormData` remains the clean numeric string `500000`.

### Edit Product

1. The seller clicks the edit icon on a product card.
2. `ProductView.vue` stores the selected product id in `editProductId`.
3. `edit.vue` opens and fetches the product by id.
4. The drawer shows a loading state while product data is fetched.
5. The seller may add, remove, zoom, and reorder images while editing the fields.
6. `edit.vue` submits a `FormData` payload through the `editProduct` Vuex action.
7. The form refuses to submit with zero images. On success, `ProductView.vue` replaces the old product in the list with the updated product.

The edit modal guard must accept UUID ids. Do not rely on numeric id checks.

When an existing product is loaded, the API price is copied into both `price` and `priceString` so the form can show the formatted rupiah value while still submitting the raw numeric value.

### Delete Product

1. The seller clicks the delete icon.
2. SweetAlert asks for confirmation.
3. The `deleteProduct` Vuex action calls the backend.
4. On success, the deleted product is removed from `products`.

## API Calls

The frontend uses these backend API actions through `src/store.js`:

- `GET /api/product/{user_id_seller}`
- `GET /api/product/{user_id_seller}/{id}`
- `POST /api/product`
- `PUT /api/product/{id}`
- `DELETE /api/product/{user_id_seller}/{id}`

Authenticated requests use the current Clerk session token attached by the shared Axios interceptor.

## UI Notes

- Product cards use a light page background and white cards so adjacent products do not blend together.
- Add and edit drawers show up to five draggable thumbnails; the first is labeled `Foto Utama`.
- Each image is limited to 1 MB. Closing or cancelling the drawer removes unsaved local previews without uploading them.
- Product images use `object-contain` so the full product is visible.
- Prices are formatted with Indonesian thousands separators, for example `Rp 12.000.000`.
- Add and edit price inputs use an `Rp` prefix and Indonesian thousands separators, but submit raw numeric values to the backend.
- The product toolbar uses Element Plus selects for stock filter and sorting so it matches other app controls.
- The desktop toolbar caps the search width on wide screens and keeps stock filter, sort, and reset controls grouped on the right.
- The add/edit product UI is a right-side drawer below the top navbar.
- Image zoom uses Element Plus image viewer.
- Empty states are different for no search result and truly empty seller products.
- The mobile layout is supported and should be checked when changing toolbar, grid, card, drawer, or empty-state layout.

## Known Decisions

- `add.vue` and `edit.vue` remain separate because their loading and submission flows differ.
- Both forms share `ProductImagesInput.vue` for image validation, preview, zoom, removal, and drag-and-drop behavior.
- Product search is executed on Enter, not on every keystroke.
- Clearing the search input after a search reloads the full product list.
- Product pagination uses `products_current_id` instead of a page number.
