<template>
  <!-- Dashboard View -->
  <div v-show="!show.loading" class="min-h-full w-full bg-slate-50 px-4 py-4 text-slate-950 lg:px-6">
    <div class="flex flex-col gap-4">
      <!-- Header -->
      <div class="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h1 class="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">Dashboard Penjual</h1>
          <p class="mt-1 text-sm leading-6 text-slate-500">Ringkasan aktivitas toko dan transaksi terbaru.</p>
        </div>
      </div>
      <!-- Header -->

      <!-- Summary -->
      <div class="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-950">Ringkasan Toko</h2>

        <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="item in summaryCards"
            :key="item.label"
            class="rounded-md border border-slate-100 bg-slate-50 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-medium text-slate-500">{{ item.label }}</p>
                <h2 class="mt-2 text-2xl font-semibold text-slate-950">{{ item.value }}</h2>
              </div>

              <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-violet-100 bg-violet-50 text-violet-600">
                <i class="text-base" :class="item.icon"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- Summary -->

      <!-- Recent Transactions -->
      <div class="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-lg font-semibold text-slate-950">Transaksi Terbaru</h2>
          <router-link :to="{name: 'seller_transaction'}" class="text-sm font-semibold text-violet-700 hover:text-violet-800">Lihat Semua</router-link>
        </div>

        <div v-if="recentTransactions.length > 0" class="mt-4 overflow-hidden rounded-md border border-slate-100">
          <div
            v-for="transaction in recentTransactions"
            :key="transaction.id"
            class="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="truncate text-sm font-semibold text-slate-950">{{ transaction.buyer_name }}</h3>
                <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusClass(transaction)">
                  {{ statusLabel(transaction) }}
                </span>
              </div>
              <p class="mt-1 truncate text-sm text-slate-500">{{ transaction.product_names || '-' }}</p>
              <p class="mt-1 text-xs text-slate-400">{{ transaction.transaction_date }}</p>
            </div>

            <div class="text-left sm:text-right">
              <p class="text-sm font-semibold text-slate-950">{{ formatRupiah(transaction.total_price) }}</p>
              <p class="mt-1 text-xs text-slate-400">{{ transaction.transaction_number || '-' }}</p>
            </div>
          </div>
        </div>

        <div v-else class="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <h3 class="text-base font-semibold text-slate-950">Belum ada transaksi</h3>
          <p class="mt-1 text-sm text-slate-500">Transaksi pembeli akan tampil di bagian ini.</p>
        </div>
      </div>
      <!-- Recent Transactions -->

      <!-- Performance -->
      <div class="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-950">Performance Penjualan</h2>
            <p class="mt-1 text-sm text-slate-500">Data 30 hari terakhir dari transaksi selesai.</p>
          </div>

          <div class="flex rounded-md border border-slate-200 bg-slate-50 p-1">
            <button class="h-8 rounded px-3 text-sm font-semibold text-violet-700">30 Hari</button>
          </div>
        </div>

        <div class="mt-5 grid gap-5 xl:grid-cols-[1fr_18rem]">
          <div class="min-h-64 rounded-md border border-slate-100 bg-slate-50 p-4">
            <div v-if="hasPerformanceData" class="h-64 w-full">
              <svg viewBox="0 0 640 240" class="h-full w-full" role="img" aria-label="Grafik pendapatan penjualan 30 hari terakhir">
                <line x1="24" y1="210" x2="616" y2="210" stroke="#cbd5e1" stroke-width="1" />
                <line x1="24" y1="24" x2="24" y2="210" stroke="#cbd5e1" stroke-width="1" />

                <polyline
                  :points="chartPoints"
                  fill="none"
                  stroke="#7c3aed"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round" />

                <circle
                  v-for="point in chartPointList"
                  :key="`${point.x}-${point.y}`"
                  :cx="point.x"
                  :cy="point.y"
                  r="5"
                  fill="#7c3aed" />
              </svg>
            </div>

            <div v-else class="flex h-64 flex-col items-center justify-center text-center">
              <span class="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                <i class="fa-solid fa-chart-line"></i>
              </span>
              <h3 class="mt-3 text-base font-semibold text-slate-950">Belum ada performance</h3>
              <p class="mt-1 max-w-sm text-sm leading-6 text-slate-500">Grafik akan muncul setelah ada transaksi selesai.</p>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div class="rounded-md border border-slate-100 bg-slate-50 p-4">
              <p class="text-sm font-medium text-slate-500">Terjual 30 Hari</p>
              <h3 class="mt-2 text-2xl font-semibold text-slate-950">{{ performance.total_sold }}</h3>
            </div>
            <div class="rounded-md border border-slate-100 bg-slate-50 p-4">
              <p class="text-sm font-medium text-slate-500">Pendapatan 30 Hari</p>
              <h3 class="mt-2 text-2xl font-semibold text-slate-950">{{ formatRupiah(performance.total_revenue) }}</h3>
            </div>
          </div>
        </div>
      </div>
      <!-- Performance -->

      <!-- Product Snapshot -->
      <div class="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-950">Ringkasan Produk</h2>

        <div class="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          <div
            v-for="item in productSnapshotItems"
            :key="item.label"
            class="rounded-md border border-slate-100 bg-slate-50 p-4">
            <p class="text-sm font-medium text-slate-500">{{ item.label }}</p>
            <h3 class="mt-2 text-2xl font-semibold text-slate-950">{{ item.value }}</h3>
          </div>
        </div>
      </div>
      <!-- Product Snapshot -->

      <!-- Quick Actions -->
      <div class="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-950">Aksi Cepat</h2>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <router-link
            v-for="action in quickActions"
            :key="action.label"
            :to="{name: action.route}"
            class="flex h-12 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700">
            <i :class="action.icon"></i>
            {{ action.label }}
          </router-link>
        </div>
      </div>
      <!-- Quick Actions -->
    </div>
  </div>
  <!-- Dashboard View -->

  <!-- Loading View -->
  <div v-show="show.loading" class="flex h-full w-full items-center justify-center text-xl">
    <i class="fas fa-spinner fa-pulse text-4xl"></i>
  </div>
  <!-- Loading View -->
</template>

<script>
import { ElNotification } from 'element-plus';

export default {
  data() {
    return {
      show: {
        loading: false,
      },

      summary: {
        total_products: 0,
        new_orders: 0,
        total_sold: 0,
        monthly_revenue: 0,
      },

      performance: {
        labels: [],
        revenue: [],
        sales: [],
        total_sold: 0,
        total_revenue: 0,
      },

      recentTransactions: [],

      productSnapshot: {
        active_products: 0,
        low_stock_products: 0,
        empty_stock_products: 0,
        new_products: 0,
      },
    }
  },

  computed: {
    summaryCards() {
      return [
        { label: 'Total Produk', value: this.formatNumber(this.summary.total_products), icon: 'fa-solid fa-box' },
        { label: 'Pesanan Baru', value: this.formatNumber(this.summary.new_orders), icon: 'fa-solid fa-receipt' },
        { label: 'Total Terjual', value: this.formatNumber(this.summary.total_sold), icon: 'fa-solid fa-bag-shopping' },
        { label: 'Pendapatan Bulan Ini', value: this.formatRupiah(this.summary.monthly_revenue), icon: 'fa-solid fa-wallet' },
      ];
    },

    productSnapshotItems() {
      return [
        { label: 'Produk Aktif', value: this.formatNumber(this.productSnapshot.active_products) },
        { label: 'Produk Baru', value: this.formatNumber(this.productSnapshot.new_products) },
        { label: 'Stok Rendah', value: this.formatNumber(this.productSnapshot.low_stock_products) },
        { label: 'Stok Habis', value: this.formatNumber(this.productSnapshot.empty_stock_products) },
      ];
    },

    quickActions() {
      return [
        { label: 'Kelola Produk', route: 'seller_product', icon: 'fa-solid fa-boxes-stacked' },
        { label: 'Lihat Transaksi', route: 'seller_transaction', icon: 'fa-solid fa-list-check' },
      ];
    },

    hasPerformanceData() {
      return this.performance.revenue.some(item => Number(item) > 0);
    },

    chartPointList() {
      const values = this.performance.revenue.map(item => Number(item) || 0);
      const maxValue = Math.max(...values, 1);
      const width = 592;
      const height = 186;
      const startX = 24;
      const startY = 210;
      const gap = values.length > 1 ? width / (values.length - 1) : width;

      return values.map((value, index) => ({
        x: startX + (gap * index),
        y: startY - ((value / maxValue) * height),
      }));
    },

    chartPoints() {
      return this.chartPointList.map(point => `${point.x},${point.y}`).join(' ');
    },
  },

  mounted() {
    this.show.loading = true;
    this.getDashboard();
  },

  methods: {
    getDashboard() {
      this
      .$store
      .dispatch('getSellerDashboard')
      .then(response => {
        this.summary = response.summary ?? this.summary;
        this.performance = response.performance ?? this.performance;
        this.recentTransactions = response.recent_transactions ?? [];
        this.productSnapshot = response.product_snapshot ?? this.productSnapshot;
        this.show.loading = false;
      })
      .catch(error => {
        console.error(error);
        this.show.loading = false;
        ElNotification({ type: 'error', title: 'Error', message: 'Dashboard gagal dimuat' });
      });
    },

    formatNumber(value) {
      const number = Number(value);

      if(!Number.isFinite(number))
        return '0';

      return number.toLocaleString('id-ID');
    },

    formatRupiah(value) {
      const price = Number(value);

      if(!Number.isFinite(price))
        return 'Rp 0';

      return `Rp ${price.toLocaleString('id-ID')}`;
    },

    statusLabel(transaction) {
      if(transaction.invoice_status == 'pending')
        return 'Belum Dibayar';

      if(transaction.status == 'approved_seller')
        return 'Perlu Diproses';

      if(transaction.status == 'done')
        return 'Selesai';

      return 'Transaksi';
    },

    statusClass(transaction) {
      if(transaction.invoice_status == 'pending')
        return 'bg-amber-50 text-amber-700';

      if(transaction.status == 'approved_seller')
        return 'bg-violet-50 text-violet-700';

      if(transaction.status == 'done')
        return 'bg-emerald-50 text-emerald-700';

      return 'bg-slate-100 text-slate-600';
    },
  }
}
</script>
