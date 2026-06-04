# Seller Dashboard

This document explains the current seller dashboard feature from the frontend side.

The goal is to keep a lightweight map of the dashboard UI, state, API usage, and layout decisions so future work can update the page without re-discovering the dashboard structure.

## Purpose

The seller dashboard gives sellers an operational overview of their store.

Current dashboard sections:

- Header.
- Ringkasan Toko.
- Transaksi Terbaru.
- Performance Penjualan.
- Ringkasan Produk.
- Aksi Cepat.

## Main Files

- `src/views/auth/seller/DashboardView.vue`
  Main seller dashboard page. It owns data loading, formatting helpers, chart points, empty states, and dashboard layout.

- `src/store.js`
  Provides the `getSellerDashboard` Vuex action.

## Route

The page is available through the existing seller route:

```text
/seller/dashboard
```

The route is guarded by account type, so buyer users are redirected away by the existing router guard.

## API Usage

The dashboard calls the backend through Vuex:

```text
GET /api/dashboard
```

The frontend does not send `user_id_seller`. The backend uses the authenticated token owner as the seller source of truth.

## Important State

`DashboardView.vue`:

- `show.loading`
  Controls the initial dashboard loading view.

- `summary`
  Stores the Ringkasan Toko metrics:
  - `total_products`
  - `new_orders`
  - `total_sold`
  - `monthly_revenue`

- `performance`
  Stores 30-day chart data:
  - `labels`
  - `sales`
  - `revenue`
  - `total_sold`
  - `total_revenue`

- `recentTransactions`
  Stores the latest seller transactions shown in Transaksi Terbaru.

- `productSnapshot`
  Stores Ringkasan Produk metrics:
  - `active_products`
  - `new_products`
  - `low_stock_products`
  - `empty_stock_products`

## Layout Order

The dashboard uses this section order:

```text
Header
Ringkasan Toko
Transaksi Terbaru
Performance Penjualan
Ringkasan Produk
Aksi Cepat
```

This order prioritizes operational seller work before analytics. Recent transactions are shown before the performance chart because sellers usually need to see what requires attention before reviewing trend data.

## UI Notes

- Top summary cards are wrapped in one `Ringkasan Toko` container so they match the other dashboard sections.
- Summary icon badges use a square violet badge with a subtle border.
- `Transaksi Terbaru` shows an empty state when no transaction exists.
- `Performance Penjualan` renders a lightweight SVG line chart when revenue data exists.
- When there is no performance data, the chart area shows an empty state.
- `Ringkasan Produk` is rendered as mini stat cards, not a list, because the values are short.
- Product snapshot order is:

```text
Produk Aktif
Produk Baru
Stok Rendah
Stok Habis
```

- `Aksi Cepat` contains only two actions:
  - `Kelola Produk`
  - `Lihat Transaksi`

The previous `Tambah Produk` action was removed from the dashboard because it duplicated the product management destination.

## Formatting

- Numbers use Indonesian thousands separators.
- Prices are formatted as rupiah, for example `Rp 8.450.000`.
- Unknown or invalid numeric values fall back to `0` or `Rp 0`.

## Known Decisions

- The dashboard uses an inline SVG chart instead of adding a chart package.
- The dashboard keeps the action area below the data sections because seller navigation already provides primary access to products and transactions.
- The page keeps a calm dashboard style with white section containers and light slate inner cards.
- Empty states are expected for sellers with no completed transactions or no recent transaction activity.
