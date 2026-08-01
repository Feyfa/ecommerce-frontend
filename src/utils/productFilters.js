export const DEFAULT_PRODUCT_SORT = 'latest';

export const PRODUCT_SORT_OPTIONS = Object.freeze([
    { value: 'latest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'price_lowest', label: 'Harga Terendah' },
    { value: 'price_highest', label: 'Harga Tertinggi' },
    { value: 'name_asc', label: 'Nama A-Z' },
    { value: 'name_desc', label: 'Nama Z-A' },
]);

export const SELLER_STOCK_FILTER_OPTIONS = Object.freeze([
    { value: 'all', label: 'Semua Kondisi', iconClass: 'fa-solid fa-layer-group text-slate-400' },
    { value: 'healthy', label: 'Stok Aman (>5)', iconClass: 'fa-solid fa-circle-check text-emerald-500' },
    { value: 'low', label: 'Stok Menipis (1–5)', iconClass: 'fa-solid fa-triangle-exclamation text-amber-500' },
    { value: 'empty', label: 'Stok Habis (0)', iconClass: 'fa-solid fa-circle-xmark text-red-500' },
]);
