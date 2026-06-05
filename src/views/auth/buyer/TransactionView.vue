<template>
    <!-- transaction view -->
    <div v-show="!show.loading" class="w-full">
        <div class="px-4 pt-4 lg:px-6">
            <h1 class="text-3xl font-medium">Transaksi</h1>

            <div class="mt-5 grid grid-cols-1 gap-2 md:grid-cols-12 xl:grid-cols-[192px_minmax(320px,1fr)_270px_112px]">
                <div class="md:col-span-4 xl:col-span-1">
                    <el-select v-model="selectedFilter" class="transaction-status-filter !w-full" popper-class="transaction-status-popper" @change="changeFilter">
                        <template #label="{ label }">
                            <span class="inline-flex items-center gap-2">
                                <span>{{ label }}</span>
                                <span class="transaction-status-count">
                                    {{ selectedFilterCount }}
                                </span>
                            </span>
                        </template>
                        <el-option
                            v-for="filter in transactionFilters"
                            :key="filter.value"
                            :label="filter.label"
                            :value="filter.value">
                            <div class="flex w-full items-center justify-between gap-4">
                                <span>{{ filter.label }}</span>
                                <span class="text-xs font-semibold text-neutral-400">{{ filter.count }}</span>
                            </div>
                        </el-option>
                    </el-select>
                </div>

                <div class="md:col-span-8 xl:col-span-1">
                    <input
                        v-model="searchKeyword"
                        type="text"
                        class="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none transition focus:border-violet-400"
                        placeholder="Cari penjual / produk / invoice"
                        @input="searchTransactions" />
                </div>

                <div class="md:col-span-9 xl:col-span-1">
                    <el-date-picker
                        v-model="dateRange"
                        class="transaction-date-filter !w-full"
                        type="daterange"
                        range-separator="-"
                        start-placeholder="Start Date"
                        end-placeholder="End Date"
                        value-format="YYYY-MM-DD"
                        format="DD MMM YYYY"
                        @change="changeDateRange" />
                </div>

                <div class="md:col-span-3 xl:col-span-1">
                    <el-select v-model="sortOrder" class="transaction-sort-filter !w-full" popper-class="transaction-sort-popper" @change="changeSort">
                        <el-option label="Terbaru" value="newest" />
                        <el-option label="Terlama" value="oldest" />
                    </el-select>
                </div>
            </div>
        </div>

        <!-- list -->
        <div class="flex w-full flex-col items-center p-4 lg:px-6">
            <button
                v-if="showPendingPaymentNotice"
                class="mb-4 flex w-full items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left transition hover:border-amber-300 hover:bg-amber-100"
                @click="changeFilter('pending_payment')">
                <div class="flex min-w-0 items-center gap-3">
                    <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-amber-700">
                        <i class="fa-solid fa-clock"></i>
                    </span>
                    <div class="min-w-0">
                        <p class="font-semibold text-neutral-900">Menunggu Pembayaran</p>
                        <p class="text-sm text-neutral-600">{{ counts.pending_payment }} transaksi belum dibayar. Selesaikan pembayaran supaya transaksi tidak kedaluwarsa.</p>
                    </div>
                </div>
                <div class="flex shrink-0 items-center gap-3 text-amber-700">
                    <span class="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-2 text-xs font-semibold text-white">{{ counts.pending_payment }}</span>
                    <i class="fa-solid fa-chevron-right"></i>
                </div>
            </button>

            <div v-if="counts.all == 0 && selectedFilter == 'paid' && !searchKeyword.trim()" class="w-full rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
                <h3 class="text-lg font-semibold text-neutral-900">Daftar Transaksi Kamu Masih Kosong Nih</h3>
                <p class="mt-1 text-sm text-neutral-500">Transaksi yang sudah dibuat akan tampil di halaman ini.</p>
            </div>

            <div v-else-if="transactions.length == 0" class="w-full rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
                <h3 class="text-lg font-semibold text-neutral-900">Transaksi Tidak Ditemukan</h3>
                <p class="mt-1 text-sm text-neutral-500">Belum ada transaksi pada filter ini.</p>
            </div>

            <div v-else class="flex w-full flex-col gap-4">
                <TransactionCard
                    v-for="item in transactions"
                    :key="item.id"
                    role="buyer"
                    :item="item"
                    :backend-base-url="APP_BACKEND_BASE_URL"
                    :symlink-folder="SYMLINK_FOLDER"
                    @view-detail="openDetail"
                    @copy-payment="copyText($event, 'Nomor Virtual Account Berhasil Disalin')"
                />

                <PaginationView v-if="showPagination" :pagination="pagination" @change-page="changePage" />
            </div>
        </div>
        <!-- list -->

        <TransactionDetailModal
            v-if="selectedTransaction"
            role="buyer"
            :item="selectedTransaction"
            :backend-base-url="APP_BACKEND_BASE_URL"
            :symlink-folder="SYMLINK_FOLDER"
            @close="selectedTransaction = null"
            @copy-payment="copyText($event, 'Nomor Virtual Account Berhasil Disalin')"
            @copy-invoice="copyText($event, 'Invoice ID Berhasil Disalin')" />
    </div>
    <!-- transaction view -->

    <!-- loading view -->
     <div v-show="show.loading" class="w-full text-xl h-full flex justify-center items-center">
        <i class="fas fa-spinner fa-pulse text-4xl"></i>
    </div>
    <!-- loading view -->
</template>

<script>
import { ElNotification } from 'element-plus';
import PaginationView from '@/components/PaginationView.vue';
import TransactionCard from '@/components/transaction/TransactionCard.vue';
import TransactionDetailModal from '@/components/transaction/TransactionDetailModal.vue';

export default {
    components: {
        PaginationView,
        TransactionCard,
        TransactionDetailModal,
    },

    data() {
        return {
            APP_BACKEND_BASE_URL: import.meta.env.VITE_APP_BACKEND_BASE_URL,
            SYMLINK_FOLDER: import.meta.env.VITE_SYMLINK_FOLDER,

            show: {
                loading: false,
            },

            selectedFilter: 'paid',
            searchKeyword: '',
            sortOrder: 'newest',
            dateRange: [],
            searchTimeout: null,
            page: 1,
            perPage: 5,
            counts: {
                all: 0,
                paid: 0,
                pending_payment: 0,
                waiting_seller: 0,
                done: 0
            },
            pagination: {
                current_page: 1,
                last_page: 1,
                per_page: 5,
                total: 0,
                from: 0,
                to: 0
            },
            selectedTransaction: null,
            transactions: []
        }
    },

    computed: {
        transactionFilters() {
            return [
                { value: 'paid', label: 'Semua', count: this.counts.paid },
                { value: 'pending_payment', label: 'Belum Dibayar', count: this.counts.pending_payment },
                { value: 'waiting_seller', label: 'Menunggu Penjual', count: this.counts.waiting_seller },
                { value: 'done', label: 'Selesai', count: this.counts.done },
            ];
        },

        selectedFilterCount() {
            return this.transactionFilters.find(filter => filter.value == this.selectedFilter)?.count ?? 0;
        },

        showPendingPaymentNotice() {
            return this.counts.pending_payment > 0 && this.selectedFilter != 'pending_payment';
        },

        showPagination() {
            return this.selectedFilter != 'pending_payment';
        }
    },

    mounted() {
        this.show.loading = true;
        this.getTransactions();
    },

    methods: {
        getTransactions() {
            this
            .$store
            .dispatch('getTransactions', {
                user_type: 'buyer',
                status_filter: this.selectedFilter,
                search: this.searchKeyword,
                sort: this.sortOrder,
                page: this.page,
                per_page: this.selectedFilter == 'pending_payment' ? 20 : this.perPage,
                date_from: this.dateRange?.[0] ?? '',
                date_to: this.dateRange?.[1] ?? ''
            })
            .then(response => {
                this.setTransactionResponse(response);
                this.show.loading = false;
            })
            .catch(error => {
                console.error(error);
                this.show.loading = false
            })
        },

        setTransactionResponse(response) {
            this.transactions = response.transactions ?? [];
            this.counts = response.counts ?? this.counts;
            this.pagination = response.pagination ?? this.pagination;
        },

        openDetail(transaction) {
            this.selectedTransaction = transaction;
        },

        changeFilter(filter) {
            this.selectedFilter = filter;
            this.page = 1;
            this.getTransactions();
        },

        changeSort() {
            this.page = 1;
            this.getTransactions();
        },

        changeDateRange() {
            if(!this.dateRange)
                this.dateRange = [];

            this.page = 1;
            this.getTransactions();
        },

        changePage(page) {
            if(page < 1 || page > this.pagination.last_page)
                return;

            this.page = page;
            this.getTransactions();
        },

        searchTransactions() {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.page = 1;
                this.getTransactions();
            }, 400);
        },

        async copyText(text, message) {
            const value = String(text ?? '');
            if(!value)
                return ElNotification({ type: 'error', title: 'Error', message: 'Data Gagal Disalin' });

            try {
                if(this.copyTextFallback(value)) {
                    ElNotification({ type: 'success', title: 'Success', message: message });
                    return;
                }

                if(navigator.clipboard)
                    await navigator.clipboard.writeText(value);
                else
                    throw new Error('Copy failed');

                ElNotification({ type: 'success', title: 'Success', message: message });
            } catch (error) {
                ElNotification({ type: 'error', title: 'Error', message: 'Data Gagal Disalin' });
            }
        },

        copyTextFallback(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);
            const copied = document.execCommand('copy');
            document.body.removeChild(textarea);
            return copied;
        }
    }
}
</script>
