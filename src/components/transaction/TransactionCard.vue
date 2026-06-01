<template>
    <article class="w-full rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div class="flex flex-col gap-3 border-b border-neutral-100 p-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="flex min-w-0 flex-col gap-2">
                <div class="flex flex-wrap items-center gap-2">
                    <span class="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold" :class="status.class">
                        <i :class="status.icon"></i>
                        {{ status.label }}
                    </span>
                    <span class="text-sm font-semibold text-neutral-900">{{ displayName }}</span>
                </div>
            </div>

            <div class="text-sm font-medium text-neutral-600">{{ item.transaction_date }}</div>
        </div>

        <div class="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
            <div v-if="showPaymentCard" class="grid min-w-0 gap-3 sm:grid-cols-3">
                <div class="flex min-w-0 items-center gap-3 rounded-md bg-neutral-50 p-3">
                    <img v-if="paymentLogo" :src="paymentLogo" class="h-10 w-10 shrink-0 rounded-sm object-cover object-center" alt="Payment logo">
                    <span v-else class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-violet-700">
                        <i class="fa-regular fa-credit-card"></i>
                    </span>
                    <div class="min-w-0">
                    <p class="text-xs text-neutral-500">Metode Pembayaran</p>
                    <p class="mt-1 truncate text-sm font-semibold text-neutral-900">{{ item.payment_name }}</p>
                    </div>
                </div>
                <div class="min-w-0 rounded-md bg-neutral-50 p-3">
                    <p class="text-xs text-neutral-500">Virtual Account</p>
                    <p class="mt-1 truncate text-sm font-semibold text-neutral-900">{{ item.payment_account }}</p>
                </div>
                <div class="min-w-0 rounded-md bg-amber-50 p-3">
                    <p class="text-xs text-amber-700">Bayar sebelum</p>
                    <p class="mt-1 truncate text-sm font-semibold text-amber-800">{{ item.expired_at }}</p>
                </div>
            </div>

            <div v-else class="flex min-w-0 gap-3">
                <div class="h-16 w-16 shrink-0 rounded-md bg-neutral-100 bg-cover bg-center bg-no-repeat" :style="productImageStyle"></div>
                <div class="min-w-0">
                    <h3 class="truncate text-sm font-semibold text-neutral-900 sm:text-base">{{ primaryProduct?.name ?? '-' }}</h3>
                    <p class="mt-1 text-sm text-neutral-600">{{ primaryProduct?.total ?? 0 }} x {{ formatCurrency(primaryProduct?.price) }}</p>
                    <p v-if="hiddenProductsCount > 0" class="mt-2 text-xs font-semibold text-violet-700">+{{ hiddenProductsCount }} produk lainnya</p>
                    <p v-else class="mt-2 text-xs font-semibold text-neutral-500">Produk ({{ productCount }})</p>
                </div>
            </div>

            <div class="flex flex-col gap-3 lg:items-end">
                <div class="flex w-full flex-col gap-3 sm:w-[230px]">
                <div class="flex items-center justify-between gap-5">
                    <span class="whitespace-nowrap text-sm text-neutral-500">{{ totalLabel }}</span>
                    <span class="whitespace-nowrap text-base font-bold text-neutral-950">{{ formatCurrency(role == 'seller' ? item.product_price : item.total_price) }}</span>
                </div>

                <div class="grid gap-2" :class="showPaymentButton ? 'grid-cols-2' : 'grid-cols-1'">
                    <button class="inline-flex min-w-0 items-center justify-center rounded-md border border-violet-600 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50" @click="$emit('view-detail', item)">
                        Lihat Detail
                    </button>
                    <button
                        v-if="showPaymentButton"
                        class="inline-flex min-w-0 items-center justify-center gap-2 rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
                        @click="$emit('copy-payment', item.payment_account)">
                        <i class="fa-regular fa-copy"></i>
                        Copy VA
                    </button>
                </div>
                </div>
            </div>
        </div>
    </article>
</template>

<script>
export default {
    props: {
        item: {
            type: Object,
            required: true
        },
        role: {
            type: String,
            required: true
        },
        backendBaseUrl: {
            type: String,
            required: true
        },
        symlinkFolder: {
            type: String,
            required: true
        }
    },

    emits: ['view-detail', 'copy-payment'],

    computed: {
        displayName() {
            return this.role == 'buyer' ? this.item.seller_name : this.item.buyer_name;
        },

        productCount() {
            return this.item.products?.length ?? 0;
        },

        primaryProduct() {
            return this.item.products?.[0] ?? null;
        },

        productImageStyle() {
            if(!this.primaryProduct?.img)
                return {};

            return {
                backgroundImage: `url(${this.backendBaseUrl}/${this.symlinkFolder}/${this.primaryProduct.img})`
            };
        },

        hiddenProductsCount() {
            return Math.max(this.productCount - 1, 0);
        },

        statusKey() {
            if(this.item.invoice_status == 'pending')
                return 'pending_payment';
            if(this.item.invoice_status == 'done' && this.item.transaction_status == 'approved_seller')
                return 'waiting_seller';
            if(this.item.invoice_status == 'done' && this.item.transaction_status == 'done')
                return 'done';

            return 'unknown';
        },

        status() {
            const statusMap = {
                pending_payment: {
                    label: this.role == 'seller' ? 'Menunggu Pembayaran Pembeli' : 'Selesaikan Pembayaran',
                    class: 'border-amber-200 bg-amber-50 text-amber-700',
                    icon: 'fa-solid fa-clock'
                },
                waiting_seller: {
                    label: this.role == 'seller' ? 'Perlu Persetujuan' : 'Menunggu Persetujuan Penjual',
                    class: 'border-blue-200 bg-blue-50 text-blue-700',
                    icon: 'fa-solid fa-hourglass-half'
                },
                done: {
                    label: 'Selesai',
                    class: 'border-emerald-200 bg-emerald-50 text-emerald-700',
                    icon: 'fa-solid fa-circle-check'
                },
                unknown: {
                    label: 'Status Tidak Dikenal',
                    class: 'border-neutral-200 bg-neutral-50 text-neutral-600',
                    icon: 'fa-solid fa-circle-info'
                }
            };

            return statusMap[this.statusKey];
        },

        showPaymentButton() {
            return this.role == 'buyer' && this.item.invoice_status == 'pending' && this.item.payment_account;
        },

        showPaymentCard() {
            return this.role == 'buyer' && this.item.invoice_status == 'pending';
        },

        paymentLogo() {
            if((this.item.payment_name ?? '').toLowerCase().includes('bca'))
                return '/img/bca.png';

            return '';
        },

        totalLabel() {
            if(this.role == 'seller')
                return 'Total Pendapatan';

            return this.item.invoice_status == 'pending' ? 'Total Pembayaran' : 'Total Harga';
        }
    },

    methods: {
        formatCurrency(value) {
            return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
        }
    }
}
</script>
