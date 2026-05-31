# Seller Product

This document explains the current seller product feature from the frontend side.

The goal is to keep a lightweight map of the feature so future work can understand the main UI, state, and API usage without reading every component first.

## Purpose

The seller product feature lets a seller manage their own product catalog.

Current supported actions:

- View product list.
- Search products by name.
- Add a product with image upload.
- Edit product data and optionally replace the image.
- Delete a product after confirmation.
- Preview product images through a zoom viewer.

## Main Files

- `src/views/auth/seller/ProductView.vue`
  Main seller product page. It owns the list, search keyword, empty states, add/edit modal opening, delete action, and infinite-scroll product loading.

- `src/components/product/add.vue`
  Product creation drawer. It handles image selection, preview, form fields, validation display, image zoom, and submit.

- `src/components/product/edit.vue`
  Product editing drawer. It fetches one product before editing, supports loading state, image replacement, image zoom, and submit.

- `src/store.js`
  Vuex actions for product API calls.

- `src/global.js`
  Global modal flags for add and edit product drawers.

## Important State

`ProductView.vue`:

- `products`: currently loaded seller products.
- `searchProduct`: current input value in the search field.
- `activeSearchProduct`: keyword that is actually used by the current product query.
- `productRequestVersion`: internal request guard so stale list/search responses do not overwrite newer product state.
- `completeProduct`: marks that the backend has no more products to return.
- `editProductId`: selected product id for the edit drawer.
- `show.loading`: initial page loading state.
- `show.loading_search_product`: search/list reload loading state.

`add.vue` and `edit.vue`:

- `ProductImage`: preview image URL shown in the image area.
- `image`: selected image file.
- `name`, `price`, `stock`: form fields.
- `errors`: validation errors returned by the backend.
- `isZoomUserImage`: controls the Element Plus image viewer.

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

### Add Product

1. The seller clicks `Tambah Produk`.
2. `this.$global.modals.addProduct` opens `add.vue`.
3. The seller selects an image and fills name, price, and stock.
4. `add.vue` submits a `FormData` payload through the `addProduct` Vuex action.
5. On success, `ProductView.vue` prepends the returned product to `products`.

### Edit Product

1. The seller clicks the edit icon on a product card.
2. `ProductView.vue` stores the selected product id in `editProductId`.
3. `edit.vue` opens and fetches the product by id.
4. The drawer shows a loading state while product data is fetched.
5. The seller edits the fields and may replace the image.
6. `edit.vue` submits a `FormData` payload through the `editProduct` Vuex action.
7. On success, `ProductView.vue` replaces the old product in the list with the updated product.

The edit modal guard must accept UUID ids. Do not rely on numeric id checks.

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

Authenticated requests use the stored bearer token.

## UI Notes

- Product cards use a light page background and white cards so adjacent products do not blend together.
- Product images use `object-contain` so the full product is visible.
- Prices are formatted with Indonesian thousands separators, for example `Rp 12.000.000`.
- The add/edit product UI is a right-side drawer below the top navbar.
- Image zoom uses Element Plus image viewer.
- Empty states are different for no search result and truly empty seller products.
- The mobile layout is supported and should be checked when changing toolbar, grid, card, drawer, or empty-state layout.

## Known Decisions

- `add.vue` and `edit.vue` are still separate components. This keeps the current change impact small, but duplicated UI must be maintained manually in both files.
- Product search is executed on Enter, not on every keystroke.
- Clearing the search input after a search reloads the full product list.
- Product pagination uses `products_current_id` instead of a page number.
