<template>
    <!-- keranjang view -->
    <div v-show="show.keranjang_view" class="min-h-full w-full bg-slate-50 text-xl">
        <div class="w-full bg-slate-50 px-3 pb-28 pt-4 sm:px-5 lg:px-6 lg:pb-6">
            <div class="mb-4 flex items-center justify-between gap-3">
                <h1 class="text-3xl font-medium text-slate-950">Keranjang</h1>

                <span
                    v-if="hasKeranjang"
                    class="hidden h-8 shrink-0 items-center rounded-full bg-white px-3 text-sm font-medium text-slate-500 shadow-sm ring-1 ring-slate-200 sm:inline-flex"
                >
                    {{ availableKeranjangCount }} produk
                </span>
            </div>

            <div class="keranjang-container flex flex-col items-start gap-5 lg:flex-row">
                <div class="flex w-full flex-col gap-4" :class="{ 'lg:w-[65%] xl:w-[70%] 2xl:w-[75%]': true }">
                    <div
                        v-if="!hasKeranjang"
                        class="flex min-h-[15rem] w-full items-center justify-center rounded-md border border-slate-200 bg-white px-6 py-8 shadow-sm"
                    >
                        <div class="flex max-w-2xl flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                            <div
                                class="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-500"
                            >
                                <i class="fa-solid fa-cart-shopping text-4xl"></i>
                            </div>

                            <div class="flex flex-col items-center sm:items-start">
                                <h2 class="text-xl font-semibold text-slate-950">Keranjang belanjamu kosong</h2>
                                <p class="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    Yuk, isi dengan produk yang kamu butuhkan. Produk yang kamu pilih nanti akan muncul
                                    di sini sebelum checkout.
                                </p>

                                <button
                                    type="button"
                                    class="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-violet-500 bg-violet-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600 active:scale-95"
                                    @click="goBelanja"
                                >
                                    <i class="fa-solid fa-bag-shopping text-sm"></i>
                                    Mulai Belanja
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="hasKeranjang"
                        class="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm"
                    >
                        <label class="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-900">
                            <input
                                @change="checkedKeranjangAll"
                                :checked="isCheckedKeranjangAll()"
                                :disabled="availableKeranjangCount === 0 || isProcessCheckout || isProcessChecked"
                                type="checkbox"
                                class="h-5 w-5 rounded border-slate-300 accent-violet-500"
                            />
                            <span>Pilih Semua</span>
                        </label>

                        <span class="text-sm font-medium text-slate-500"
                            >{{ selectedKeranjangCount }} dari {{ availableKeranjangCount }} produk dipilih</span
                        >
                    </div>

                    <div
                        v-if="cartReviewCount > 0"
                        class="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 shadow-sm"
                        role="alert"
                    >
                        <div class="flex items-start gap-3">
                            <i class="fa-solid fa-triangle-exclamation mt-0.5 text-amber-600"></i>
                            <div>
                                <p class="text-sm font-semibold">{{ cartReviewCount }} produk perlu diperiksa</p>
                                <p class="mt-1 text-xs leading-5 text-amber-800">
                                    Stok produk berubah sejak ditambahkan ke keranjang. Periksa produk yang ditandai
                                    sebelum checkout.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        class="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
                        v-for="(keranjang, index1) in keranjangGroups"
                        :key="keranjang[0].k_user_id_seller"
                    >
                        <div class="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                            <input
                                @change="checkedKeranjangGroup($event, keranjang[0].k_user_id_seller)"
                                :checked="isCheckedKeranjangGroup(keranjang)"
                                :disabled="
                                    !hasAvailableKeranjangGroup(keranjang) || isProcessCheckout || isProcessChecked
                                "
                                type="checkbox"
                                class="h-5 w-5 rounded border-slate-300 accent-violet-500"
                            />
                            <div class="flex min-w-0 flex-col">
                                <span class="truncate text-sm font-semibold text-slate-950">{{
                                    keranjang[0].u_seller_name
                                }}</span>
                                <span class="text-xs font-medium text-slate-500">Pilih semua dari toko ini</span>
                            </div>
                        </div>

                        <div
                            :id="`cart-item-${item.k_id}`"
                            class="row relative flex gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0"
                            v-for="item in keranjang"
                            :key="item.p_id"
                            :class="{
                                'bg-slate-50/70': !item.is_purchasable,
                                'border-l-4 border-l-amber-400 bg-amber-50/60': hasQuantityStockIssue(item),
                                'border-l-4 border-l-red-400 bg-red-50/50': item.unavailable_reason === 'OUT_OF_STOCK',
                            }"
                        >
                            <input
                                v-if="item.is_purchasable"
                                @change="checkedKeranjang($event, item.p_id)"
                                :checked="item.k_checked != 0 ? true : false"
                                :disabled="!isItemSelectable(item) || isProcessCheckout || isProcessChecked"
                                type="checkbox"
                                class="mt-9 h-5 w-5 shrink-0 rounded border-slate-300 accent-violet-500"
                            />

                            <div v-else class="mt-9 h-5 w-5 shrink-0"></div>

                            <div
                                class="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-slate-100 bg-white"
                            >
                                <img
                                    class="h-full w-full object-contain"
                                    :src="`${APP_BACKEND_BASE_URL}/${SYMLINK_FOLDER}/${item.p_img}`"
                                    :alt="item.p_name"
                                />

                                <div
                                    class="absolute inset-0 flex items-center justify-center bg-slate-950/30"
                                    v-if="item.unavailable_reason === 'OUT_OF_STOCK'"
                                >
                                    <img class="w-20" :src="SoldOutImage" alt="SoldOutImage" />
                                </div>
                            </div>

                            <div
                                class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                            >
                                <div class="min-w-0">
                                    <h3 class="line-clamp-2 text-sm font-medium leading-5 text-slate-900">
                                        {{ item.p_name || 'Produk tidak tersedia' }}
                                    </h3>
                                    <p class="mt-1 text-sm font-semibold text-slate-950">
                                        {{ formatRupiah(item.p_price) }}
                                    </p>
                                    <span
                                        class="mt-2 inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium"
                                        :class="
                                            item.p_stock < 1 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                                        "
                                    >
                                        Stok: {{ item.p_stock }}
                                    </span>
                                    <p
                                        v-if="!item.is_purchasable"
                                        class="mt-2 text-xs font-semibold leading-5"
                                        :class="
                                            item.unavailable_reason === 'SELLER_LOCATION_UNVERIFIED'
                                                ? 'text-amber-700'
                                                : 'text-red-600'
                                        "
                                    >
                                        {{ unavailableReasonLabel(item.unavailable_reason) }}
                                    </p>
                                    <div
                                        v-if="hasQuantityStockIssue(item)"
                                        class="mt-3 rounded-md border border-amber-200 bg-white/80 px-3 py-2 text-xs leading-5 text-amber-900"
                                    >
                                        Stok tersisa
                                        <strong>{{ item.stock_issue.available_stock }}</strong
                                        >, tetapi jumlah Anda <strong>{{ item.stock_issue.cart_quantity }}</strong
                                        >. Kurangi jumlah menjadi maksimal
                                        <strong>{{ item.stock_issue.available_stock }}</strong
                                        >.
                                    </div>
                                </div>

                                <div class="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                                    <button
                                        type="button"
                                        class="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                        aria-label="Hapus produk"
                                        title="Hapus produk"
                                        :disabled="
                                            isProcessCheckout || isProcessChecked || isQuantityProcessing(item.p_id)
                                        "
                                        @click="deleteKeranjang(item.p_id)"
                                    >
                                        <i class="fa-regular fa-trash-can text-sm"></i>
                                    </button>

                                    <div
                                        class="flex items-center rounded-md border border-slate-300 bg-white shadow-sm"
                                        v-if="item.is_purchasable"
                                    >
                                        <button
                                            type="button"
                                            class="flex h-8 w-8 items-center justify-center rounded-l-md text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                                            aria-label="Kurangi jumlah produk"
                                            title="Kurangi jumlah produk"
                                            :disabled="
                                                item.k_total <= 1 ||
                                                isProcessCheckout ||
                                                isQuantityProcessing(item.p_id)
                                            "
                                            @click="minusTotalKeranjang(item)"
                                        >
                                            <i class="bi bi-dash-lg text-sm"></i>
                                        </button>

                                        <input
                                            v-model="item.k_total"
                                            class="input-keranjang h-8 w-12 border-x border-slate-200 text-center text-sm font-medium text-slate-900 outline-none"
                                            type="text"
                                            inputmode="numeric"
                                            pattern="[0-9]*"
                                            aria-label="Jumlah produk"
                                            :disabled="isProcessCheckout || isQuantityProcessing(item.p_id)"
                                            @focus="rememberTotalKeranjang(item)"
                                            @input="validationTotalKeranjang($event, item)"
                                            @blur="changeTotalKeranjang(item.p_id, item)"
                                            min="1"
                                        />

                                        <button
                                            type="button"
                                            class="flex h-8 w-8 items-center justify-center rounded-r-md text-slate-500 transition hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
                                            aria-label="Tambah jumlah produk"
                                            title="Tambah jumlah produk"
                                            :disabled="
                                                item.k_total >= item.p_stock ||
                                                isProcessCheckout ||
                                                isQuantityProcessing(item.p_id)
                                            "
                                            @click="plusTotalKeranjang(item)"
                                        >
                                            <i class="bi bi-plus-lg text-sm"></i>
                                        </button>
                                    </div>

                                    <div
                                        v-else
                                        class="flex min-w-[9rem] items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                                        aria-label="Jumlah produk tersimpan"
                                    >
                                        <span class="text-xs font-medium text-slate-500">Jumlah tersimpan</span>
                                        <span class="text-sm font-semibold text-slate-900">{{ item.k_total }}</span>
                                    </div>

                                    <button
                                        v-if="hasQuantityStockIssue(item)"
                                        type="button"
                                        class="inline-flex h-9 items-center justify-center rounded-md border border-amber-500 bg-amber-500 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                                        :disabled="isProcessCheckout || isQuantityProcessing(item.p_id)"
                                        @click="adjustQuantityToStock(item)"
                                    >
                                        Sesuaikan ke
                                        {{ item.stock_issue.available_stock }}
                                    </button>

                                    <span
                                        v-if="isQuantityProcessing(item.p_id)"
                                        class="text-xs font-medium text-slate-400"
                                    >
                                        Menyimpan...
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    v-if="hasKeranjang"
                    class="fixed bottom-0 left-0 right-0 z-[2] flex items-center gap-3 border border-slate-200 bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] lg:static lg:block lg:w-[35%] lg:self-start lg:rounded-md lg:shadow-sm xl:w-[30%] 2xl:w-[25%]"
                >
                    <div class="min-w-0 flex-1 lg:border-b lg:border-b-slate-200 lg:pb-3">
                        <h2 class="hidden text-base font-semibold text-slate-950 lg:block">Ringkasan Belanja</h2>
                        <div
                            class="flex flex-col gap-0 text-sm lg:mt-3 lg:flex-row lg:items-center lg:justify-between lg:gap-3"
                        >
                            <h3 class="font-medium text-slate-500">Total</h3>
                            <h3 class="text-base font-semibold text-slate-950">
                                {{ formatRupiah(totalPrice) }}
                            </h3>
                        </div>
                    </div>
                    <div class="w-40 shrink-0 lg:w-auto lg:pt-3">
                        <button
                            @click="checkout"
                            class="inline-flex h-11 w-full items-center justify-center rounded-md border border-violet-500 bg-violet-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600 active:scale-95"
                            :class="{
                                'button-disabled cursor-not-allowed opacity-60':
                                    !disabled.buttonCheckout ||
                                    isProcessCheckout ||
                                    isProcessChecked ||
                                    hasQuantityProcessing,
                            }"
                            :disabled="
                                !disabled.buttonCheckout ||
                                isProcessCheckout ||
                                isProcessChecked ||
                                hasQuantityProcessing
                            "
                        >
                            Checkout
                            <i v-if="isProcessCheckout" class="ml-2 fas fa-spinner fa-pulse"></i>
                        </button>
                    </div>
                </div>

                <div
                    v-if="!hasKeranjang"
                    class="fixed bottom-0 left-0 right-0 z-[2] flex items-center gap-3 border border-slate-200 bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] lg:static lg:block lg:w-[35%] lg:self-start lg:rounded-md lg:px-4 lg:py-4 lg:shadow-sm xl:w-[30%] 2xl:w-[25%]"
                >
                    <div class="min-w-0 flex-1 lg:border-b lg:border-b-slate-200 lg:pb-3">
                        <h2 class="hidden text-base font-semibold text-slate-950 lg:block">Ringkasan Belanja</h2>
                        <div
                            class="flex flex-col gap-0 text-sm lg:mt-3 lg:flex-row lg:items-center lg:justify-between lg:gap-3"
                        >
                            <h3 class="font-medium text-slate-500">Total</h3>
                            <h3 class="text-base font-semibold text-slate-400">-</h3>
                        </div>
                    </div>

                    <div
                        class="my-3 hidden rounded-md border border-violet-100 bg-violet-50 px-3 py-3 text-sm leading-5 text-violet-700 lg:block"
                    >
                        Pilih barang terlebih dahulu sebelum checkout.
                    </div>

                    <button
                        type="button"
                        class="inline-flex h-11 w-40 shrink-0 cursor-not-allowed items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-400 lg:w-full"
                        disabled
                    >
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- keranjang view -->

    <!-- loading view -->
    <div v-show="show.loading" class="w-full text-xl h-full flex justify-center items-center">
        <span>
            <i class="fas fa-spinner fa-pulse text-4xl"></i>
        </span>
    </div>
    <!-- loading view -->
</template>

<script>
import { ElMessageBox, ElNotification } from 'element-plus';

export default {
    /**
     * Membuat state reaktif yang digunakan komponen untuk halaman keranjang.
     *
     * @returns {Object} State reaktif yang diinisialisasi untuk komponen.
     */
    data() {
        return {
            APP_BACKEND_BASE_URL: import.meta.env.VITE_APP_BACKEND_BASE_URL,
            SYMLINK_FOLDER: import.meta.env.VITE_SYMLINK_FOLDER,

            SoldOutImage: '/img/sold-out.png',

            keranjangs: [],
            totalPrice: '',

            isProcessCheckout: false,
            isProcessChecked: false,
            quantityProcessing: {},
            quantityBeforeEdit: {},

            disabled: {
                buttonCheckout: false,
            },

            show: {
                keranjang_view: false,
                loading: false,
            },
        };
    },

    /**
     * Menginisialisasi behavior komponen yang bergantung pada browser setelah mounted untuk halaman keranjang.
     *
     * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
     */
    mounted() {
        this.show.keranjang_view = false;
        this.show.loading = true;

        this.getKeranjang();
    },

    computed: {
        /**
         * Mengembalikan keranjang groups yang dihitung dari state reaktif saat ini untuk halaman keranjang.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi keranjang groups.
         */
        keranjangGroups() {
            return Object.values(this.keranjangs || {}).filter((group) => Array.isArray(group) && group.length > 0);
        },

        /**
         * Menentukan apakah kondisi keranjang terpenuhi untuk halaman keranjang.
         *
         * @returns {boolean} Menunjukkan apakah kondisi has keranjang terpenuhi.
         */
        hasKeranjang() {
            return this.keranjangGroups.length > 0;
        },

        /**
         * Mengembalikan tersedia keranjang jumlah yang dihitung dari state reaktif saat ini untuk halaman keranjang.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi tersedia keranjang jumlah.
         */
        availableKeranjangCount() {
            return this.keranjangGroups.flat().filter((item) => this.isItemSelectable(item)).length;
        },

        /**
         * Mengembalikan terpilih keranjang jumlah yang dihitung dari state reaktif saat ini untuk halaman keranjang.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi terpilih keranjang jumlah.
         */
        selectedKeranjangCount() {
            return this.keranjangGroups
                .flat()
                .filter((item) => this.isItemSelectable(item) && (item.k_checked === 1 || item.k_checked === true))
                .length;
        },

        /**
         * Mengembalikan cart review jumlah yang dihitung dari state reaktif saat ini untuk halaman keranjang.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi cart review jumlah.
         */
        cartReviewCount() {
            return this.keranjangGroups.flat().filter((item) => this.hasCartReviewIssue(item)).length;
        },

        /**
         * Menentukan apakah kondisi jumlah processing terpenuhi untuk halaman keranjang.
         *
         * @returns {boolean} Menunjukkan apakah kondisi has jumlah processing terpenuhi.
         */
        hasQuantityProcessing() {
            return Object.values(this.quantityProcessing).some(Boolean);
        },
    },

    methods: {
        /**
         * Memformat rupiah untuk ditampilkan untuk halaman keranjang.
         *
         * @param {*} value Nilai yang diproses oleh function.
         *
         * @returns {string} Teks format rupiah yang telah diformat atau ditentukan.
         */
        formatRupiah(value) {
            return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
        },

        /**
         * Mengembalikan tidak tersedia reason label yang ditentukan modul untuk halaman keranjang.
         *
         * @param {*} reason Nilai reason yang diproses oleh function.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi tidak tersedia reason label.
         */
        unavailableReasonLabel(reason) {
            return (
                {
                    PRODUCT_DELETED: 'Produk Sudah Tidak Tersedia',
                    OUT_OF_STOCK: 'Stok Habis',
                    SELLER_LOCATION_UNVERIFIED: 'Lokasi Toko Belum Diverifikasi',
                }[reason] || 'Produk sementara tidak tersedia'
            );
        },

        /**
         * Menentukan apakah kondisi jumlah stock issue terpenuhi untuk halaman keranjang.
         *
         * @param {*} item Item yang diproses oleh operasi UI saat ini.
         *
         * @returns {boolean} Menunjukkan apakah kondisi has jumlah stock issue terpenuhi.
         */
        hasQuantityStockIssue(item) {
            return item?.stock_issue?.code === 'QUANTITY_EXCEEDS_STOCK' && Number(item.stock_issue.available_stock) > 0;
        },

        /**
         * Menentukan apakah kondisi cart review issue terpenuhi untuk halaman keranjang.
         *
         * @param {*} item Item yang diproses oleh operasi UI saat ini.
         *
         * @returns {boolean} Menunjukkan apakah kondisi has cart review issue terpenuhi.
         */
        hasCartReviewIssue(item) {
            return this.hasQuantityStockIssue(item) || item?.unavailable_reason === 'OUT_OF_STOCK';
        },

        /**
         * Menentukan apakah kondisi item selectable terpenuhi untuk halaman keranjang.
         *
         * @param {*} item Item yang diproses oleh operasi UI saat ini.
         *
         * @returns {boolean} Menunjukkan apakah kondisi is item selectable terpenuhi.
         */
        isItemSelectable(item) {
            if (item?.is_selectable !== undefined) {
                return item.is_selectable === true || item.is_selectable === 1;
            }

            return item?.is_purchasable === true && !this.hasQuantityStockIssue(item);
        },

        /**
         * Menjalankan proses go belanja dan menyinkronkan state hasilnya untuk halaman keranjang, termasuk state navigasi yang dihasilkan.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        goBelanja() {
            this.$router.push({ name: 'buyer_belanja' });
        },

        /**
         * Memperbarui button checkout state untuk halaman keranjang.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        updateButtonCheckoutState() {
            this.disabled.buttonCheckout = this.keranjangGroups.some((group) =>
                group.some((item) => this.isItemSelectable(item) && (item.k_checked === 1 || item.k_checked === true)),
            );
        },

        /**
         * Memperbarui jumlah processing untuk halaman keranjang.
         *
         * @param {*} product_id Nilai produk id yang diproses oleh function.
         * @param {*} processing Nilai processing yang diproses oleh function.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        setQuantityProcessing(product_id, processing) {
            this.quantityProcessing = {
                ...this.quantityProcessing,
                [product_id]: processing,
            };
        },

        /**
         * Menentukan apakah kondisi jumlah processing terpenuhi untuk halaman keranjang.
         *
         * @param {*} product_id Nilai produk id yang diproses oleh function.
         *
         * @returns {boolean} Menunjukkan apakah kondisi is jumlah processing terpenuhi.
         */
        isQuantityProcessing(product_id) {
            return this.quantityProcessing[product_id] === true;
        },

        /**
         * Menjalankan proses remember total keranjang dan menyinkronkan state hasilnya untuk halaman keranjang.
         *
         * @param {*} item Item yang diproses oleh operasi UI saat ini.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        rememberTotalKeranjang(item) {
            this.quantityBeforeEdit = {
                ...this.quantityBeforeEdit,
                [item.p_id]: Number(item.k_total || 1),
            };
        },

        /**
         * Menentukan apakah kondisi checked item terpenuhi untuk halaman keranjang.
         *
         * @param {*} item Item yang diproses oleh operasi UI saat ini.
         *
         * @returns {boolean} Menunjukkan apakah kondisi is checked item terpenuhi.
         */
        isCheckedItem(item) {
            return item.k_checked === 1 || item.k_checked === true;
        },

        /**
         * Memperbarui local total price untuk halaman keranjang.
         *
         * @param {*} item Item yang diproses oleh operasi UI saat ini.
         * @param {*} quantityDelta Nilai quantity delta yang diproses oleh function.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        updateLocalTotalPrice(item, quantityDelta) {
            if (this.isCheckedItem(item)) {
                this.totalPrice = Number(this.totalPrice || 0) + Number(item.p_price || 0) * quantityDelta;
            }
        },

        /**
         * Menjalankan proses sync keranjang from response data dan menyinkronkan state hasilnya untuk halaman keranjang.
         *
         * @param {*} responseData Nilai response data yang diproses oleh function.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        syncKeranjangFromResponseData(responseData) {
            if (responseData?.keranjangs) {
                this.keranjangs = responseData.keranjangs;
            }
            if (responseData?.totalPrice !== undefined) {
                this.totalPrice = responseData.totalPrice;
            }
            this.updateButtonCheckoutState();
        },

        /**
         * Menangani buyer alamat required untuk halaman keranjang, termasuk state navigasi yang dihasilkan.
         *
         * @param {*} responseData Nilai response data yang diproses oleh function.
         *
         * @returns {boolean} Menunjukkan apakah kondisi handle buyer alamat required terpenuhi.
         */
        handleBuyerAddressRequired(responseData) {
            if (responseData?.code !== 'BUYER_ADDRESS_REQUIRED') {
                return false;
            }

            ElMessageBox.alert(
                responseData.message || 'Tambahkan alamat pengiriman sebelum melanjutkan checkout.',
                'Alamat Pengiriman Belum Tersedia',
                {
                    confirmButtonText: 'Tambah Alamat',
                    type: 'warning',
                },
            )
                .then(() =>
                    this.$router.push({
                        name: 'settings_addresses',
                        query: { openAddAddress: '1' },
                    }),
                )
                .catch(() => {});

            return true;
        },

        /**
         * Menjalankan proses scroll to first cart review issue dan menyinkronkan state hasilnya untuk halaman keranjang.
         *
         * @param {*} [issues] Nilai issues yang diproses oleh function.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        scrollToFirstCartReviewIssue(issues = []) {
            const firstCartId =
                issues.find((issue) => issue?.cart_id)?.cart_id ||
                this.keranjangGroups.flat().find((item) => this.hasCartReviewIssue(item))?.k_id;

            if (!firstCartId) {
                return;
            }

            this.$nextTick(() => {
                document.getElementById(`cart-item-${firstCartId}`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            });
        },

        /**
         * Menjalankan proses checkout dan menyinkronkan state hasilnya untuk halaman keranjang, dengan mendelegasikan pekerjaan backend atau shared state melalui Vuex store.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        checkout() {
            // --- step 1 - start - kumpulkan produk valid yang dipilih untuk checkout
            const keranjangAlReadyChecked = Object.values(this.keranjangs).some((group) =>
                group.some((item) => this.isItemSelectable(item) && (item.k_checked === 1 || item.k_checked === true)),
            );

            // ambil id product dalam bentuk array
            const productIds = Object.values(this.keranjangs)
                .flat()
                .filter((item) => this.isItemSelectable(item) && (item.k_checked === 1 || item.k_checked === true))
                .map((item) => item.p_id);
            // --- step 1 - end - kumpulkan produk valid yang dipilih untuk checkout

            // --- step 2 - start - validasi checkout dan tangani perubahan alamat atau stok dari backend
            if (keranjangAlReadyChecked) {
                this.isProcessCheckout = true;

                this.$store
                    .dispatch('validateCheckout', {
                        product_ids: productIds,
                        user_id_buyer: this.$store.getters.user.id,
                    })
                    .then((response) => {
                        // console.log(response);

                        this.$router.push({ name: 'buyer_checkout' });
                    })
                    .catch((error) => {
                        console.error(error);

                        const responseData = error.response?.data;
                        this.isProcessCheckout = false;
                        this.syncKeranjangFromResponseData(responseData);
                        const message = responseData?.message;

                        if (this.handleBuyerAddressRequired(responseData)) {
                            return;
                        }

                        if (responseData?.code === 'SELLER_ADDRESS_REQUIRES_VERIFICATION') {
                            ElNotification({
                                type: 'warning',
                                title: 'Lokasi Toko Belum Diverifikasi',
                                message:
                                    message ||
                                    'Lokasi toko penjual belum diverifikasi. Produk terkait tidak dapat dilanjutkan ke checkout.',
                            });
                            return;
                        }

                        if (responseData?.code === 'CART_STOCK_CHANGED') {
                            ElNotification({
                                type: 'warning',
                                title: 'Stok Berubah',
                                message:
                                    message ||
                                    'Stok beberapa produk berubah. Periksa produk yang ditandai sebelum checkout.',
                            });
                            this.scrollToFirstCartReviewIssue(responseData.issues || []);
                            return;
                        }

                        if (error.response?.status == 422) {
                            Object.keys(message || {}).forEach((key) => {
                                switch (key) {
                                    case 'product_ids':
                                        ElNotification({
                                            type: 'error',
                                            title: 'error',
                                            message: message[key][0],
                                        });
                                        break;
                                }
                            });
                        } else {
                            ElNotification({
                                type: 'error',
                                title: 'error',
                                message:
                                    typeof message === 'string' && message.trim() !== ''
                                        ? message
                                        : 'Something went wrong',
                            });
                        }
                    });
            }
            // --- step 2 - end - validasi checkout dan tangani perubahan alamat atau stok dari backend
        },

        /**
         * Menjalankan proses validation total keranjang dan menyinkronkan state hasilnya untuk halaman keranjang.
         *
         * @param {*} event Event browser atau komponen yang memicu handler.
         * @param {*} item Item yang diproses oleh operasi UI saat ini.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        validationTotalKeranjang(event, item) {
            let newValue = event.target.value;
            const stock = item.p_stock;

            // Remove any non-digit characters
            newValue = newValue.replace(/[^0-9]/g, '');

            // Ubah nilai yang telah dibersihkan menjadi integer.
            const integerValue = parseInt(newValue, 10);

            // Pastikan nilai integer valid dan lebih besar dari nol.
            if (integerValue > 0) {
                item.k_total = Math.min(integerValue, stock);
            } else if (integerValue <= 0) {
                item.k_total = 1;
            } else if (newValue === '') {
                item.k_total = '';
            }
        },

        /**
         * Menerapkan terpilih total keranjang perubahan untuk halaman keranjang, dengan mendelegasikan pekerjaan backend atau shared state melalui Vuex store.
         *
         * @param {*} product_id Nilai produk id yang diproses oleh function.
         * @param {*} item Item yang diproses oleh operasi UI saat ini.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        changeTotalKeranjang(product_id, item) {
            // --- step 1 - start - normalisasi jumlah baru dan hentikan proses ketika nilainya tidak berubah
            const previousTotal = Number(this.quantityBeforeEdit[product_id] || item.k_total || 1);
            const previousTotalPrice = this.totalPrice;

            if (item.k_total === '') {
                item.k_total = 1;
            } else if (item.k_total > item.p_stock) {
                item.k_total = item.p_stock;
            }

            const nextTotal = Number(item.k_total || 1);

            if (nextTotal === previousTotal) {
                return;
            }
            // --- step 1 - end - normalisasi jumlah baru dan hentikan proses ketika nilainya tidak berubah

            // --- step 2 - start - terapkan perubahan jumlah secara optimistis pada state lokal
            this.quantityBeforeEdit = {
                ...this.quantityBeforeEdit,
                [product_id]: nextTotal,
            };

            this.updateLocalTotalPrice(item, nextTotal - previousTotal);
            this.setQuantityProcessing(product_id, true);
            // --- step 2 - end - terapkan perubahan jumlah secara optimistis pada state lokal

            // --- step 3 - start - simpan jumlah ke backend atau pulihkan state ketika request gagal
            this.$store
                .dispatch('storeTotalKeranjang', {
                    user_id_buyer: this.$store.getters.user.id,
                    product_id,
                    total: item.k_total,
                })
                .then((response) => {
                    // console.log(response);

                    this.keranjangs = response.data.keranjangs;
                    this.totalPrice = response.data.totalPrice;

                    this.updateButtonCheckoutState();
                    this.setQuantityProcessing(product_id, false);
                })
                .catch((error) => {
                    // console.error(error);

                    const responseData = error.response?.data;
                    item.k_total = previousTotal;
                    this.totalPrice = previousTotalPrice;
                    this.syncKeranjangFromResponseData(responseData);

                    this.setQuantityProcessing(product_id, false);

                    if (responseData?.status == 422) {
                        const message = responseData.message;

                        Object.keys(message).forEach((key) => {
                            switch (key) {
                                case 'stock_maximum':
                                    ElNotification({
                                        type: 'error',
                                        title: 'Error',
                                        message: message[key][0],
                                    });
                                    break;
                            }
                        });
                    }
                });
            // --- step 3 - end - simpan jumlah ke backend atau pulihkan state ketika request gagal
        },

        /**
         * Menjalankan proses adjust jumlah to stock dan menyinkronkan state hasilnya untuk halaman keranjang.
         *
         * @param {*} item Item yang diproses oleh operasi UI saat ini.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        adjustQuantityToStock(item) {
            const availableStock = Number(item?.stock_issue?.available_stock || 0);

            if (availableStock < 1 || isNaN(availableStock)) {
                return;
            }

            this.quantityBeforeEdit = {
                ...this.quantityBeforeEdit,
                [item.p_id]: Number(item.k_total || 1),
            };
            item.k_total = availableStock;
            this.changeTotalKeranjang(item.p_id, item);
        },

        /**
         * Menjalankan proses minus total keranjang dan menyinkronkan state hasilnya untuk halaman keranjang, dengan mendelegasikan pekerjaan backend atau shared state melalui Vuex store.
         *
         * @param {*} item Item yang diproses oleh operasi UI saat ini.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        minusTotalKeranjang(item) {
            const product_id = item.p_id;
            const previousTotal = item.k_total;
            const previousTotalPrice = this.totalPrice;

            if (item.k_total <= 1) {
                return;
            }

            item.k_total -= 1;
            this.updateLocalTotalPrice(item, -1);
            this.setQuantityProcessing(product_id, true);

            this.$store
                .dispatch('minusTotalKeranjang', {
                    user_id_buyer: this.$store.getters.user.id,
                    product_id,
                })
                .then((response) => {
                    // console.log(response);

                    this.keranjangs = response.data.keranjangs;
                    this.totalPrice = response.data.totalPrice;

                    this.updateButtonCheckoutState();
                    this.setQuantityProcessing(product_id, false);
                })
                .catch((error) => {
                    // console.error(error);
                    const responseData = error.response?.data;

                    item.k_total = previousTotal;
                    this.totalPrice = previousTotalPrice;
                    this.syncKeranjangFromResponseData(responseData);
                    this.setQuantityProcessing(product_id, false);

                    if (responseData?.message && typeof responseData.message === 'string') {
                        ElNotification({
                            type: 'error',
                            title: 'Error',
                            message: responseData.message,
                        });
                    }
                });
        },

        /**
         * Menjalankan proses plus total keranjang dan menyinkronkan state hasilnya untuk halaman keranjang, dengan mendelegasikan pekerjaan backend atau shared state melalui Vuex store.
         *
         * @param {*} item Item yang diproses oleh operasi UI saat ini.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        plusTotalKeranjang(item) {
            const product_id = item.p_id;
            const previousTotal = item.k_total;
            const previousTotalPrice = this.totalPrice;

            if (item.k_total >= item.p_stock) {
                return;
            }

            item.k_total += 1;
            this.updateLocalTotalPrice(item, 1);
            this.setQuantityProcessing(product_id, true);

            this.$store
                .dispatch('plusTotalKeranjang', {
                    user_id_buyer: this.$store.getters.user.id,
                    product_id,
                })
                .then((response) => {
                    // console.log(response);

                    this.keranjangs = response.data.keranjangs;
                    this.totalPrice = response.data.totalPrice;

                    this.updateButtonCheckoutState();
                    this.setQuantityProcessing(product_id, false);
                })
                .catch((error) => {
                    // console.error(error);
                    const responseData = error.response?.data;

                    item.k_total = previousTotal;
                    this.totalPrice = previousTotalPrice;
                    this.syncKeranjangFromResponseData(responseData);
                    this.setQuantityProcessing(product_id, false);

                    if (responseData?.status == 422) {
                        const message = responseData.message;

                        Object.keys(message).forEach((key) => {
                            switch (key) {
                                case 'stock_maximum':
                                    ElNotification({
                                        type: 'error',
                                        title: 'Error',
                                        message: message[key][0],
                                    });
                                    break;
                            }
                        });
                    } else if (responseData?.message && typeof responseData.message === 'string') {
                        ElNotification({
                            type: 'error',
                            title: 'Error',
                            message: responseData.message,
                        });
                    }
                });
        },

        /**
         * Menghapus keranjang untuk keranjang page.
         *
         * @param {*} product_id Nilai produk id yang diproses oleh function.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        deleteKeranjang(product_id) {
            ElMessageBox.confirm('Produk ini akan dihapus dari keranjang.', 'Hapus produk?', {
                confirmButtonText: 'Hapus',
                cancelButtonText: 'Batalkan',
                type: 'warning',
                confirmButtonClass: 'el-button--danger',
            })
                .then(() => {
                    this.processDeleteKeranjang(product_id);
                })
                .catch(() => {});
        },

        /**
         * Menjalankan proses process delete keranjang dan menyinkronkan state hasilnya untuk halaman keranjang, dengan mendelegasikan pekerjaan backend atau shared state melalui Vuex store.
         *
         * @param {*} product_id Nilai produk id yang diproses oleh function.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        processDeleteKeranjang(product_id) {
            this.isProcessChecked = true;

            this.$store
                .dispatch('deleteKeranjang', {
                    user_id_buyer: this.$store.getters.user.id,
                    product_id,
                })
                .then((response) => {
                    // console.log(response);

                    this.keranjangs = response.data.keranjangs;
                    this.totalPrice = response.data.totalPrice;

                    this.updateButtonCheckoutState();
                    this.isProcessChecked = false;
                })
                .catch((error) => {
                    // console.error(error);
                    this.isProcessChecked = false;
                });
        },

        /**
         * Mengambil keranjang untuk halaman keranjang, dengan mendelegasikan pekerjaan backend atau shared state melalui Vuex store.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        getKeranjang() {
            this.isProcessChecked = true;
            this.$store
                .dispatch('getKeranjang', {
                    user_id_buyer: this.$store.getters.user.id,
                })
                .then((response) => {
                    // console.log(response);

                    this.show.keranjang_view = true;
                    this.show.loading = false;

                    this.keranjangs = response.data.keranjangs;
                    this.totalPrice = response.data.totalPrice;

                    this.updateButtonCheckoutState();
                    this.isProcessChecked = false;
                })
                .catch((error) => {
                    // console.error(error);

                    this.show.keranjang_view = true;
                    this.show.loading = false;
                    this.isProcessChecked = false;
                });
        },

        /**
         * Menjalankan proses checked keranjang dan menyinkronkan state hasilnya untuk halaman keranjang, dengan mendelegasikan pekerjaan backend atau shared state melalui Vuex store.
         *
         * @param {*} event Event browser atau komponen yang memicu handler.
         * @param {*} product_id Nilai produk id yang diproses oleh function.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        checkedKeranjang(event, product_id) {
            this.isProcessChecked = true;

            this.$store
                .dispatch('checkedKeranjang', {
                    user_id_buyer: this.$store.getters.user.id,
                    checked: event.target.checked,
                    product_id,
                })
                .then((response) => {
                    // console.log(response);

                    this.keranjangs = response.data.keranjangs;
                    this.totalPrice = response.data.totalPrice;

                    this.updateButtonCheckoutState();
                    this.isProcessChecked = false;
                })
                .catch((error) => {
                    // console.error(error);
                    this.isProcessChecked = false;
                });
        },

        /**
         * Menjalankan proses checked keranjang all dan menyinkronkan state hasilnya untuk halaman keranjang, dengan mendelegasikan pekerjaan backend atau shared state melalui Vuex store.
         *
         * @param {*} event Event browser atau komponen yang memicu handler.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        checkedKeranjangAll(event) {
            const checked = event.target.checked;

            if (this.availableKeranjangCount === 0) {
                return;
            }

            this.isProcessChecked = true;

            this.$store
                .dispatch('checkedKeranjangAll', {
                    user_id_buyer: this.$store.getters.user.id,
                    checked,
                })
                .then((response) => {
                    this.keranjangs = response.data.keranjangs;
                    this.totalPrice = response.data.totalPrice;
                    this.updateButtonCheckoutState();
                    this.isProcessChecked = false;
                })
                .catch((error) => {
                    // console.error(error);
                    this.isProcessChecked = false;
                });
        },

        /**
         * Menjalankan proses checked keranjang group dan menyinkronkan state hasilnya untuk halaman keranjang, dengan mendelegasikan pekerjaan backend atau shared state melalui Vuex store.
         *
         * @param {*} event Event browser atau komponen yang memicu handler.
         * @param {*} user_id_seller Nilai user id seller yang diproses oleh function.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        checkedKeranjangGroup(event, user_id_seller) {
            this.isProcessChecked = true;

            this.$store
                .dispatch('checkedKeranjangGroup', {
                    user_id_buyer: this.$store.getters.user.id,
                    checked: event.target.checked,
                    user_id_seller: user_id_seller,
                })
                .then((response) => {
                    // console.log(response);

                    this.keranjangs = response.data.keranjangs;
                    this.totalPrice = response.data.totalPrice;

                    this.updateButtonCheckoutState();
                    this.isProcessChecked = false;
                })
                .catch((error) => {
                    // console.error(error);
                    this.isProcessChecked = false;
                });
        },

        /**
         * Menentukan apakah kondisi checked keranjang group terpenuhi untuk halaman keranjang.
         *
         * @param {*} keranjang Nilai keranjang yang diproses oleh function.
         *
         * @returns {boolean} Menunjukkan apakah kondisi is checked keranjang group terpenuhi.
         */
        isCheckedKeranjangGroup(keranjang) {
            const availableItems = keranjang.filter((item) => this.isItemSelectable(item));

            return (
                availableItems.length > 0 &&
                availableItems.every((item) => item.k_checked === 1 || item.k_checked === true)
            );
        },

        /**
         * Menentukan apakah kondisi tersedia keranjang group terpenuhi untuk halaman keranjang.
         *
         * @param {*} keranjang Nilai keranjang yang diproses oleh function.
         *
         * @returns {boolean} Menunjukkan apakah kondisi has tersedia keranjang group terpenuhi.
         */
        hasAvailableKeranjangGroup(keranjang) {
            return keranjang.some((item) => this.isItemSelectable(item));
        },

        /**
         * Menentukan apakah kondisi checked keranjang all terpenuhi untuk halaman keranjang.
         *
         * @returns {boolean} Menunjukkan apakah kondisi is checked keranjang all terpenuhi.
         */
        isCheckedKeranjangAll() {
            return this.availableKeranjangCount > 0 && this.selectedKeranjangCount === this.availableKeranjangCount;
        },
    },
};
</script>
