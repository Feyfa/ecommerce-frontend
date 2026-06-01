<template>
    <!-- transaction view -->
    <div v-show="!show.loading" class="w-full">
        <div class="px-4 pt-4 lg:px-6">
            <h1 class="text-3xl font-medium">Transaksi</h1>

            <div class="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div class="flex flex-wrap items-center gap-2">
                    <button
                        v-for="filter in transactionFilters"
                        :key="filter.value"
                        class="rounded-md border px-4 py-2 text-sm font-semibold transition"
                        :class="selectedFilter == filter.value ? 'border-violet-600 bg-violet-600 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:border-violet-300 hover:text-violet-700'"
                        @click="changeFilter(filter.value)">
                        {{ filter.label }}
                        <span class="ml-1 text-xs opacity-80">{{ filter.count }}</span>
                    </button>
                </div>

                <div class="flex flex-col gap-2 sm:flex-row">
                    <input
                        v-model="searchKeyword"
                        type="text"
                        class="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none transition focus:border-violet-400 sm:w-72"
                        placeholder="Cari pembeli / produk / invoice"
                        @input="searchTransactions" />
                    <el-date-picker
                        v-model="dateRange"
                        class="transaction-date-filter !w-full sm:!w-[290px]"
                        type="daterange"
                        range-separator="-"
                        start-placeholder="Start Date"
                        end-placeholder="End Date"
                        value-format="YYYY-MM-DD"
                        format="DD MMM YYYY"
                        @change="changeDateRange" />
                    <el-select v-model="sortOrder" class="transaction-sort-filter !w-full sm:!w-28" popper-class="transaction-sort-popper" @change="changeSort">
                        <el-option label="Terbaru" value="newest" />
                        <el-option label="Terlama" value="oldest" />
                    </el-select>
                </div>
            </div>
        </div>

        <!-- list -->
        <div class="flex w-full flex-col items-center p-4 lg:px-6">
            <div v-if="counts.all == 0 && selectedFilter == 'all' && !searchKeyword.trim()" class="w-full rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
                <h3 class="text-lg font-semibold text-neutral-900">Daftar Transaksi Kamu Masih Kosong Nih</h3>
                <p class="mt-1 text-sm text-neutral-500">Transaksi dari pembeli akan tampil di halaman ini.</p>
            </div>

            <div v-else-if="transactions.length == 0" class="w-full rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center">
                <h3 class="text-lg font-semibold text-neutral-900">Transaksi Tidak Ditemukan</h3>
                <p class="mt-1 text-sm text-neutral-500">Belum ada transaksi pada filter ini.</p>
            </div>

            <div v-else class="flex w-full flex-col gap-4">
                <TransactionCard
                    v-for="item in transactions"
                    :key="item.id"
                    role="seller"
                    :item="item"
                    :backend-base-url="APP_BACKEND_BASE_URL"
                    :symlink-folder="SYMLINK_FOLDER"
                    @view-detail="openDetail" />

                <PaginationView :pagination="pagination" @change-page="changePage" />
            </div>
        </div>
        <!-- list -->

        <TransactionDetailModal
            v-if="selectedTransaction"
            role="seller"
            :item="selectedTransaction"
            :approving="!!isSellerApprovedTransaction[selectedTransaction.id]"
            :backend-base-url="APP_BACKEND_BASE_URL"
            :symlink-folder="SYMLINK_FOLDER"
            @close="selectedTransaction = null"
            @copy-invoice="copyText($event, 'Invoice ID Berhasil Disalin')"
            @approve="approvedTransaction" />
    </div>
    <!-- transaction view -->

    <!-- loading view -->
     <div v-show="show.loading" class="w-full text-xl h-full flex justify-center items-center">
        <i class="fas fa-spinner fa-pulse text-4xl"></i>
    </div>
    <!-- loading view -->
</template>

<script>
import { ElMessageBox, ElNotification } from 'element-plus';
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

            selectedFilter: 'all',
            searchKeyword: '',
            sortOrder: 'newest',
            dateRange: [],
            searchTimeout: null,
            page: 1,
            perPage: 5,
            counts: {
                all: 0,
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
            isSellerApprovedTransaction: {},

            transactions: []
        }
    },

    computed: {
        transactionFilters() {
            return [
                { value: 'all', label: 'Semua', count: this.counts.all },
                { value: 'pending_payment', label: 'Belum Dibayar', count: this.counts.pending_payment },
                { value: 'waiting_seller', label: 'Perlu Persetujuan', count: this.counts.waiting_seller },
                { value: 'done', label: 'Selesai', count: this.counts.done },
            ];
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
                user_type: 'seller',
                status_filter: this.selectedFilter,
                search: this.searchKeyword,
                sort: this.sortOrder,
                page: this.page,
                per_page: this.perPage,
                date_from: this.dateRange?.[0] ?? '',
                date_to: this.dateRange?.[1] ?? ''
            })
            .then(response => {
                this.setTransactionResponse(response);
                this.isSellerApprovedTransaction = {};
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
        },

        approvedTransaction(transaction_user_id) {
            ElMessageBox.confirm('Yakin Ingin Menyetujui Transaksi Ini ?', 'Persetujuan', {
                confirmButtonText: 'Setuju',
                cancelButtonText: 'Cancel',
                callback: (action) => {
                    if(action == 'confirm') {
                        this.isSellerApprovedTransaction[transaction_user_id] = true;
                        this
                        .$store
                        .dispatch('approvedTransaction', {
                            transaction_user_id: transaction_user_id,
                            user_type: this.$store.getters.user.account_type
                        })
                        .then(response => {
                            // console.log(response);
                            this.isSellerApprovedTransaction[transaction_user_id] = false;
                            this.selectedTransaction = null;
                            this.getTransactions();
                            ElNotification({ type: 'success', title: 'Success', message: 'Persetujuan Transaksi Berhasil, Uang Sudah Masuk Ke Saldo Anda' });
                        })
                        .catch(error => {
                            console.error(error);
                            this.isSellerApprovedTransaction[transaction_user_id] = false;
                            const message = typeof(error.response.data.message) ? error.response.data.message : 'Ups Sepertinya Ada Yang Salah';
                            ElNotification({ type: 'error', title: 'Error', message: message });
                        });
                    }
                },
            });
        }
    }
}
</script>
