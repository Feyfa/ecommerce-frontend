# Buyer Belanja

This document explains the current buyer catalog from the frontend side. It
maps the UI, state, request flow, pagination behavior, and frontend-owned
decisions without duplicating backend operational documentation.

## Purpose and ownership

Buyer Belanja lets an authenticated buyer discover purchasable products from
other sellers and add an available product to the cart.

The page supports:

- typo-tolerant product and displayed-store search;
- relevance, update-date, price, and product-name sorting;
- inclusive minimum and maximum price filters;
- recently-added filters for 7, 14, 30, or 90 days;
- independent search, sort, and filter reset behavior;
- numbered infinite-scroll pagination with a 10,000-result browsing boundary;
- responsive product cards and distinct empty, unavailable, and boundary
  states; and
- add-to-cart submission with stale-availability recovery.

Meilisearch is the direct read model for this buyer-facing catalog. PostgreSQL
remains the source of truth for product mutations, carts, and checkout. The
seller Product management page intentionally reads PostgreSQL instead of this
buyer projection.

## Main files

- `src/views/auth/buyer/BelanjaView.vue` owns the catalog UI, local filter and
  pagination state, response guards, sentinel observer, and add-to-cart
  feedback.
- `src/store.js` forwards the catalog and cart payloads to the backend through
  the shared Axios client.
- `src/App.vue` owns the shared scrolling container observed by the catalog
  sentinel and the global incremental-loading indicator.
- `src/utils/productFilters.js` supplies the shared explicit product-sort
  options and default sort value.
- `src/components/app/SidebarComponent.vue` exposes the buyer navigation entry.

## State and derived state

`BelanjaView.vue` keeps the following catalog state:

- `products`: unique cards appended from accepted API responses.
- `searchProduct`: current search input text.
- `activeSearchProduct`: trimmed keyword used by the current request.
- `sortProduct` and `defaultProductSort`: active and non-keyword default sort.
- `minPrice`, `maxPrice`, and `addedWithin`: applied catalog filters.
- `draftMinPrice`, `draftMaxPrice`, and `draftAddedWithin`: unapplied values in
  the filter panel.
- `isBelanjaFilterOpen` and the two filter-section flags: panel and accordion
  visibility.
- `filterPriceError`: local price-validation feedback.
- `currentPage` and `perPage`: next numbered page and the 50-card page size.
- `hasMoreProducts` and `completeProduct`: infinite-scroll completion guards.
- `paginationLimitReached`: distinguishes the engine boundary from genuine
  result exhaustion.
- `productRequestVersion`: rejects responses from superseded query criteria.
- `paginationObserver`: active `IntersectionObserver` for the transparent
  sentinel below the grid.
- `catalogLoadError`: distinguishes a search-service outage from another list
  failure.
- `show.loading` and `show.loading_search_product`: initial and catalog-reload
  loading states.

Computed state keeps UI decisions synchronized:

- `hasActiveBelanjaFilter` is true for an applied keyword or catalog filter;
  sort alone does not narrow results.
- `buyerSortProductOptions` adds **Paling Sesuai** only while a keyword is
  active.
- `activeDefaultProductSort` is `relevance` for an active keyword and `latest`
  otherwise.
- `activeBelanjaFilterCount` counts the two price boundaries and recently-added
  period independently.
- `activeBelanjaFilterChips` creates one removable chip per applied criterion.

## Catalog flows

### Initial load and query reset

When the component mounts, it observes the transparent pagination sentinel and
requests page 1. `App.vue` exposes the shared scroll-container reference before
the observer is initialized, including when the first page does not create a
scrollbar.

Search, sort, and applied-filter changes call `reloadBelanjaProducts()`. A
reload clears the cards and error state, resets pagination to page 1, restores
`hasMoreProducts`, clears the boundary flag, and starts a new request version.

Only the latest request version may update the UI. This prevents a slow response
for old search or filter criteria from appending cards or advancing the current
page after a newer request has completed.

### Search and sort

Search is Enter-only. Pressing Enter copies the trimmed input into
`activeSearchProduct` and restarts the catalog. Merely editing or clearing the
input does not issue a request until Enter is pressed.

An active keyword automatically selects `relevance`, displayed as **Paling
Sesuai**. Relevance remains a Meilisearch ranking decision and does not send an
explicit sort expression. The explicit choices remain available:

- `latest` and `oldest`;
- `price_lowest` and `price_highest`; and
- `name_asc` and `name_desc`.

Clearing the keyword and pressing Enter returns relevance to `latest`. The sort
reset restores the context-sensitive default without clearing search or catalog
filters.

Applied search appears as a removable **Pencarian: …** chip. Draft input does
not change the chip until Enter is pressed. Removing it clears both the input
and active keyword; relevance returns to **Terbaru**, while an explicit sort
and price/time filters remain selected.

A removable **Urutkan: …** chip appears only when sorting differs from the
context default: **Terbaru** without a keyword, **Paling Sesuai** with a keyword.
Removing it uses the existing sort reset and preserves search and filters.
Both chip actions reload page 1 with `per_page=50` and retain stale-response
protection. The Filter button count still includes only price/time criteria.
Long chip labels truncate to fit the container, with the full label available
through the title and accessible button name.

### Filter behavior

The Filter button opens a compact anchored panel. Price and recently-added
sections can open independently. Draft values remain separate from applied
criteria until the buyer presses **Terapkan**.

Price input removes non-digits and displays Indonesian thousands separators.
Blank values become `null`; valid values must be non-negative whole Rupiah
amounts. An inverted range keeps the panel open, shows
`Harga minimum tidak boleh lebih besar dari harga maksimum.`, and sends no
request.

Applying changed criteria closes the panel and restarts the catalog. Closing
through the close button, Escape, or an outside pointer discards unapplied
drafts. Each chip removes only its own criterion, while **Reset Filter** clears
all catalog filters without changing the current keyword or sort.

### Numbered infinite scroll

Every request sends `page` and `per_page=50`. An accepted response appends only
cards whose `p_id` is not already present. `has_more` controls completion, and
the next page advances only when another page exists.

A transparent one-pixel sentinel follows the product grid. Its
`IntersectionObserver` uses the shared scroll container as its root:

- on a large viewport, a visible sentinel automatically loads more pages until
  it moves below the viewport or `has_more` becomes false;
- on a smaller viewport, it remains below the fold and loads the next page when
  the buyer scrolls near the bottom; and
- loading, completion, and non-empty-list guards prevent duplicate or premature
  requests.

The observer is re-armed after each appended page so an unusually large
viewport may load more than one additional page. It is disconnected when the
component unmounts. The global scroll event remains responsible only for the
sticky toolbar state; it does not drive pagination.

The backend exposes at most 10,000 results for one broad browse query. Reaching
that boundary returns `has_more: false` and `limit_reached: true`. Existing
cards remain visible, infinite scroll stops, and a compact inline status asks
the buyer to use search or filters. Normal exhaustion adds no end-of-list
message.

### Add to cart

The cart button dispatches `addKeranjang` with `user_id_buyer`,
`user_id_seller`, and `product_id`.

- A successful response shows a success notification.
- HTTP `409` shows an availability warning and removes the stale card from the
  current projection.
- A validation response containing `stock_maximum` shows the backend message.

Catalog data can be briefly stale while the asynchronous search projection
converges. The cart and checkout paths revalidate PostgreSQL, so a displayed
card is never the final authority for stock or purchasability.

## API contract and response decisions

The Vuex store uses these authenticated endpoints through the shared Axios
client:

```text
GET  /api/belanja
POST /api/keranjang
```

`GET /api/belanja` sends:

- `page` and `per_page`;
- `search_product`;
- `min_price` and `max_price`;
- `added_within`; and
- `sort_product`.

The relevant response shape is:

```json
{
  "status": 200,
  "products": [],
  "page": 1,
  "per_page": 50,
  "has_more": false,
  "limit_reached": false
}
```

Cards contain `p_id`, `p_img`, `p_name`, `p_price`, `p_stock`, `u_id`, and
`u_name`. The frontend does not send the retired `products_current_id`
parameter and does not hydrate Meilisearch IDs through another PostgreSQL list
query.

HTTP `503` maps to the dedicated `search_unavailable` state, an unavailable
panel, and a safe notification. Other request failures use the generic catalog
error state. **Coba Lagi** restarts the current query. A genuine empty response
instead renders **Produk tidak ditemukan** for active criteria or **Produk
belum tersedia** for an unrestricted catalog.

There is intentionally no frontend or backend PostgreSQL search fallback for
`GET /api/belanja`. If Meilisearch is unavailable, the catalog reports the
temporary failure instead of silently changing search semantics.

## UI and responsive behavior

- The sticky toolbar contains Enter-only search on the left and grouped sort
  and Filter controls on the right at wider breakpoints. On mobile, search is
  full-width and sort shares a row with Filter.
- Product-card images use native browser lazy loading so below-the-fold images
  can be deferred while preserving their existing URL, dimensions, and
  `object-contain` presentation.
- The anchored Filter panel uses the same interaction at mobile, tablet, and
  desktop widths; applied criteria appear as individually removable violet
  chips.
- The catalog uses two columns on mobile, three on small screens, and expands
  through the larger breakpoints. At 1920 pixels and wider, flexible columns
  retain a 15-rem minimum while distributing remaining horizontal space.
- Cards display the public store name, product name, formatted Rupiah price,
  stock badge, contained product image, and cart action.
- The product grid stays visible during normal infinite-scroll completion. A
  service outage, genuine empty result, and 10,000-result boundary each use a
  distinct presentation.
- The boundary notice is a compact icon-and-text status row rather than a toast
  or a large panel.

## Decisions and invariants

- Buyer catalog reads directly from the rebuildable Meilisearch projection;
  seller product management continues to read PostgreSQL.
- PostgreSQL remains authoritative for product mutations, carts, checkout,
  price, stock, and final availability validation.
- Only active, in-stock products from sellers with verified locations are
  eligible for the buyer index, and the requesting buyer's own seller products
  are excluded by the backend.
- Search executes on Enter, while sort changes and applied filter changes reload
  immediately.
- Search, sort, and filter reset independently so one control does not silently
  discard another control's criteria.
- Numbered offset pagination relies on backend deterministic ordering with
  product ID as the final tie-breaker.
- The 10,000 setting is a browsing boundary, not a maximum PostgreSQL catalog
  size; narrower search or filters can expose products outside a broad result
  window.

## Related documentation and QA

- [TOK-29 Buyer Catalog Search QA](../../qa/tok-29-buyer-catalog-search.md)
  covers Meilisearch search, numbered pagination, error recovery, and responsive
  regression scenarios.
- [TOK-30 Buyer Catalog Filters QA](../../qa/tok-30-buyer-catalog-filters.md)
  covers the filter panel, validation, chip, reset, and combined-query behavior.
- `backend-repo:/docs/application/buyer/belanja.md` owns the backend API,
  indexing, synchronization, and access rules.
- `backend-repo:/docs/architecture/meilisearch.md` owns Meilisearch settings,
  operational checks, and recovery guidance.
