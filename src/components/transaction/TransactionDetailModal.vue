<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="$emit('close')">
        <section class="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
            <header class="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
                <div class="min-w-0">
                    <div class="mb-2 flex flex-wrap items-center gap-2">
                        <span class="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold" :class="status.class">
                            <i :class="status.icon"></i>
                            {{ status.label }}
                        </span>
                        <span class="text-sm font-semibold text-neutral-700">{{ item.transaction_date }}</span>
                    </div>
                    <h2 class="text-xl font-semibold text-neutral-950">Detail Transaksi</h2>
                    <p class="mt-1 text-sm text-neutral-500">{{ role == 'buyer' ? 'Penjual' : 'Pembeli' }}: {{ displayName }}</p>
                </div>

                <button class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900" aria-label="Tutup modal" @click="$emit('close')">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </header>

            <div class="overflow-y-auto p-5">
                <div class="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
                    <div class="flex min-w-0 flex-col gap-4">
                        <section class="rounded-lg border border-neutral-200 p-4">
                            <div class="mb-3 flex items-center justify-between gap-3">
                                <h3 class="text-base font-semibold text-neutral-900">Invoice</h3>
                                <button
                                    class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-neutral-300 bg-white text-xs text-neutral-700 transition hover:border-violet-300 hover:text-violet-700"
                                    title="Copy Invoice ID"
                                    aria-label="Copy Invoice ID"
                                    @click="$emit('copy-invoice', item.invoice_id)">
                                    <i class="fa-regular fa-copy"></i>
                                </button>
                            </div>
                            <p class="break-all text-sm font-semibold text-neutral-900">{{ item.invoice_id ?? '-' }}</p>
                        </section>

                        <section class="rounded-lg border border-neutral-200 p-4">
                            <h3 class="mb-3 text-base font-semibold text-neutral-900">Produk ({{ productCount }})</h3>
                            <div class="flex flex-col gap-3">
                                <div v-for="(product, index) in item.products" :key="`${product.name}-${index}`" class="flex min-w-0 gap-3 rounded-md bg-neutral-50 p-3">
                                    <div class="h-16 w-16 shrink-0 rounded-md bg-neutral-100 bg-cover bg-center bg-no-repeat" :style="{ backgroundImage: `url(${backendBaseUrl}/${symlinkFolder}/${product.img})` }"></div>
                                    <div class="min-w-0 flex-1">
                                        <h4 class="truncate text-sm font-semibold text-neutral-900">{{ product.name }}</h4>
                                        <p class="mt-1 text-sm text-neutral-600">{{ product.total }} x {{ formatCurrency(product.price) }}</p>
                                    </div>
                                    <div class="shrink-0 text-right text-sm font-semibold text-neutral-900">
                                        {{ formatCurrency(productSubtotal(product)) }}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="rounded-lg border border-neutral-200 p-4">
                            <h3 class="mb-3 text-base font-semibold text-neutral-900">Pengiriman</h3>
                            <div class="grid gap-3 text-sm sm:grid-cols-2">
                                <InfoRow label="Kurir" :value="item.kurir_type" />
                                <InfoRow label="Estimasi" :value="item.kurir_estimate" />
                                <InfoRow class="sm:col-span-2" label="Alamat" :value="item.alamat_buyer" />
                            </div>
                        </section>

                        <section class="rounded-lg border border-neutral-200 p-4">
                            <h3 class="mb-3 text-base font-semibold text-neutral-900">Catatan</h3>
                            <p class="text-sm font-semibold text-neutral-900">{{ item.noted || '-' }}</p>
                        </section>
                    </div>

                    <aside class="flex min-w-0 flex-col gap-4">
                        <section class="rounded-lg border border-neutral-200 p-4">
                            <h3 class="mb-3 text-base font-semibold text-neutral-900">Pembayaran</h3>
                            <div v-if="paymentLogo" class="mb-3 flex items-center gap-3 rounded-md bg-neutral-50 p-3">
                                <img :src="paymentLogo" class="h-10 w-10 shrink-0 rounded-sm object-cover object-center" alt="Payment logo">
                                <span class="text-sm font-semibold text-neutral-900">{{ item.payment_name }}</span>
                            </div>
                            <div class="flex flex-col gap-3 text-sm">
                                <InfoRow v-if="!paymentLogo" label="Metode" :value="item.payment_name" />
                                <InfoRow v-if="role == 'buyer'" label="Virtual Account" :value="item.payment_account" />
                                <InfoRow label="Expired" :value="item.expired_at" />
                            </div>

                            <button
                                v-if="showPaymentButton"
                                class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                                @click="$emit('copy-payment', item.payment_account)">
                                <i class="fa-regular fa-copy"></i>
                                Copy Virtual Account
                            </button>
                        </section>

                        <section class="rounded-lg border border-neutral-200 p-4">
                            <h3 class="mb-3 text-base font-semibold text-neutral-900">{{ role == 'seller' ? 'Rincian Pendapatan' : 'Rincian Harga' }}</h3>
                            <div class="flex flex-col gap-3 text-sm">
                                <div class="flex items-center justify-between gap-4">
                                    <span class="text-neutral-600">Barang</span>
                                    <span class="font-semibold text-neutral-900">{{ formatCurrency(item.product_price) }}</span>
                                </div>
                                <div class="flex items-center justify-between gap-4">
                                    <span class="text-neutral-600">Ongkir</span>
                                    <span class="font-semibold text-neutral-900">{{ formatCurrency(item.kurir_price) }}</span>
                                </div>
                                <div class="flex items-center justify-between gap-4 border-t border-neutral-200 pt-3">
                                    <span class="font-semibold text-neutral-900">{{ totalLabel }}</span>
                                    <span class="font-bold text-neutral-950">{{ formatCurrency(role == 'seller' ? item.product_price : item.total_price) }}</span>
                                </div>
                            </div>
                        </section>

                        <button
                            v-if="showApproveButton"
                            class="inline-flex items-center justify-center gap-2 rounded-md bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                            :disabled="approving"
                            @click="$emit('approve', item.id)">
                            Setujui Transaksi
                            <i v-if="approving" class="fa-solid fa-spinner fa-spin-pulse"></i>
                        </button>
                    </aside>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import InfoRow from '@/components/transaction/TransactionInfoRow.vue';

export default {
    components: {
        InfoRow
    },

    props: {
        item: {
            type: Object,
            required: true
        },
        role: {
            type: String,
            required: true
        },
        approving: {
            type: Boolean,
            default: false
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

    emits: ['close', 'copy-payment', 'copy-invoice', 'approve'],

    computed: {
        displayName() {
            return this.role == 'buyer' ? this.item.seller_name : this.item.buyer_name;
        },

        productCount() {
            return this.item.products?.length ?? 0;
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

        paymentLogo() {
            if((this.item.payment_name ?? '').toLowerCase().includes('bca'))
                return '/img/bca.png';

            return '';
        },

        showApproveButton() {
            return this.role == 'seller' && this.item.invoice_status == 'done' && this.item.transaction_status == 'approved_seller';
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
        },

        productSubtotal(product) {
            return Number(product.price || 0) * Number(product.total || 0);
        }
    }
}
</script>
