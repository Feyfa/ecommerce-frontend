<template>
    <!-- belanja view -->
    <div v-show="show.belanja_view" class="min-h-full w-full bg-slate-50 text-xl">
        <div
            class="sticky top-0 z-[2] px-4 pt-4 transition-all duration-200 lg:px-6"
            :class="{
                'border-b border-slate-200 bg-slate-50/95 pb-3 shadow-sm backdrop-blur': belanjaHeaderStuck,
                'bg-slate-50': !belanjaHeaderStuck,
            }"
        >
            <div class="flex items-center justify-between gap-3">
                <h1 class="text-3xl font-medium text-slate-950">Barang Belanja</h1>
            </div>

            <div class="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(14rem,27rem)_1fr_14rem_3rem] lg:items-end">
                <div class="flex min-w-0 flex-col gap-1.5">
                    <label for="search-product" class="text-xs font-semibold text-slate-600">Cari Produk</label>
                    <input
                        placeholder="Search produk"
                        id="search-product"
                        type="text"
                        class="h-11 w-full rounded-md border border-slate-300 px-3 text-base text-slate-900 outline-none shadow-sm placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                        v-model="searchProduct"
                        @input="onSearchProductInput"
                        @keyup.enter="enterSearchProduct"
                    />
                </div>

                <div class="hidden lg:block"></div>

                <div class="flex min-w-0 flex-col gap-1.5">
                    <label for="buyer-product-sort" class="text-xs font-semibold text-slate-600">Urutkan Produk</label>
                    <el-select
                        id="buyer-product-sort"
                        aria-label="Urutkan produk belanja"
                        v-model="sortProduct"
                        class="product-sort-filter !w-full"
                        popper-class="product-filter-popper"
                        @change="applyBelanjaFilters"
                    >
                        <el-option
                            v-for="option in sortProductOptions"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                        />
                    </el-select>
                </div>

                <button
                    type="button"
                    class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white px-0 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="!hasActiveBelanjaFilter"
                    title="Reset filter"
                    aria-label="Reset filter"
                    @click="resetBelanjaFilters"
                >
                    <i class="fa-solid fa-rotate-left text-xs" aria-hidden="true"></i>
                </button>
            </div>

            <div v-if="activeBelanjaFilterChips.length > 0" class="mt-3 flex flex-wrap items-center gap-2">
                <span
                    v-for="chip in activeBelanjaFilterChips"
                    :key="chip.key"
                    class="inline-flex h-8 items-center rounded-full bg-violet-50 px-3 text-xs font-semibold text-violet-700 ring-1 ring-violet-100"
                >
                    {{ chip.label }}
                </span>
            </div>
        </div>

        <div class="w-full bg-slate-50">
            <div v-show="show.loading_search_product" class="w-full text-center mt-28 sm:mt-16">
                <span>
                    <i class="fas fa-spinner fa-pulse text-xl"></i>
                </span>
            </div>

            <div v-if="!show.loading_search_product && products.length === 0" class="px-3 py-6 sm:p-6">
                <div
                    class="mx-auto flex min-h-[18rem] max-w-xl flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm"
                >
                    <div class="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                        <i
                            class="text-xl"
                            :class="hasActiveBelanjaFilter ? 'fa-solid fa-magnifying-glass' : 'fa-solid fa-box-open'"
                        ></i>
                    </div>

                    <h2 class="mt-4 text-lg font-semibold text-slate-950">
                        {{ hasActiveBelanjaFilter ? 'Produk tidak ditemukan' : 'Produk belum tersedia' }}
                    </h2>

                    <p class="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                        {{
                            hasActiveBelanjaFilter
                                ? 'Coba ubah filter, kata kunci, atau reset filter yang sedang aktif.'
                                : 'Belum ada produk yang bisa ditampilkan untuk pembeli.'
                        }}
                    </p>
                </div>
            </div>

            <div
                class="belanja-list-grid grid w-full grid-cols-2 gap-x-4 gap-y-5 p-4 sm:grid-cols-3 sm:p-5 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-6 lg:p-6 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8"
            >
                <div
                    v-for="product in products"
                    :key="product.p_id"
                    class="belanja-list-card row group flex h-[18.5rem] flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
                >
                    <div
                        class="belanja-list-image relative flex h-40 w-full items-center justify-center bg-white px-3 py-2"
                    >
                        <img
                            class="h-full w-full object-contain"
                            :src="`${APP_BACKEND_BASE_URL}/${SYMLINK_FOLDER}/${product.p_img}`"
                            :alt="product.p_name"
                        />
                    </div>

                    <div class="flex flex-1 flex-col justify-between p-3">
                        <div class="flex flex-col">
                            <span class="mb-1 truncate text-[.72rem] font-medium leading-4 text-slate-500">{{
                                product.u_name
                            }}</span>
                            <h4 class="mt-0.5 truncate text-sm font-medium leading-5 text-slate-900">
                                {{ product.p_name }}
                            </h4>
                            <h4 class="mt-1 text-sm font-semibold leading-5 text-slate-950">
                                {{ formatRupiah(product.p_price) }}
                            </h4>
                        </div>

                        <div class="mt-3 flex items-center justify-between gap-2">
                            <span
                                class="inline-flex h-7 max-w-[6rem] items-center rounded-full bg-slate-100 px-2.5 text-xs font-medium text-slate-600"
                            >
                                Stok: {{ product.p_stock }}
                            </span>

                            <button
                                type="button"
                                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-violet-50 hover:text-violet-600"
                                aria-label="Tambah ke keranjang"
                                title="Tambah ke keranjang"
                                @click="addKeranjang(product.p_id, product.u_id)"
                            >
                                <svg class="w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                                    <path
                                        fill="currentColor"
                                        d="M432 928a48 48 0 1 1 0-96 48 48 0 0 1 0 96m320 0a48 48 0 1 1 0-96 48 48 0 0 1 0 96M96 128a32 32 0 0 1 0-64h160a32 32 0 0 1 31.36 25.728L320.64 256H928a32 32 0 0 1 31.296 38.72l-96 448A32 32 0 0 1 832 768H384a32 32 0 0 1-31.36-25.728L229.76 128zm314.24 576h395.904l82.304-384H333.44l76.8 384z"
                                    ></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- belanja view -->

    <!-- loading view -->
    <div v-show="show.loading" class="w-full text-xl h-full flex justify-center items-center">
        <span>
            <i class="fas fa-spinner fa-pulse text-4xl"></i>
        </span>
    </div>
    <!-- loading view -->
</template>

<script>
import eventBus from '@/eventBus';
import { DEFAULT_PRODUCT_SORT, PRODUCT_SORT_OPTIONS } from '@/utils/productFilters';
import { ElNotification } from 'element-plus';

export default {
    /**
     * Membuat state reaktif yang digunakan komponen untuk halaman belanja.
     *
     * @returns {Object} State reaktif yang diinisialisasi untuk komponen.
     */
    data() {
        return {
            APP_BACKEND_BASE_URL: import.meta.env.VITE_APP_BACKEND_BASE_URL,
            SYMLINK_FOLDER: import.meta.env.VITE_SYMLINK_FOLDER,

            products: [],

            searchProduct: '',
            activeSearchProduct: '',
            sortProduct: DEFAULT_PRODUCT_SORT,
            productRequestVersion: 0,
            belanjaHeaderStuck: false,
            sortProductOptions: PRODUCT_SORT_OPTIONS,
            completeProduct: false,

            show: {
                belanja_view: false,
                loading: false,
                loading_search_product: false,
            },
        };
    },

    computed: {
        /**
         * Mengembalikan has active belanja filter yang dihitung dari state reaktif saat ini untuk halaman belanja.
         *
         * @returns {boolean} Menunjukkan apakah kondisi has active belanja filter terpenuhi.
         */
        hasActiveBelanjaFilter() {
            return this.activeSearchProduct.length > 0 || this.sortProduct !== DEFAULT_PRODUCT_SORT;
        },

        /**
         * Mengembalikan active belanja filter chips yang dihitung dari state reaktif saat ini untuk halaman belanja.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi active belanja filter chips.
         */
        activeBelanjaFilterChips() {
            const chips = [];
            const activeSortProduct = this.sortProductOptions.find((option) => option.value === this.sortProduct);

            if (this.activeSearchProduct.length > 0) {
                chips.push({
                    key: 'search',
                    label: `Pencarian: ${this.activeSearchProduct}`,
                });
            }

            if (activeSortProduct && activeSortProduct.value !== DEFAULT_PRODUCT_SORT) {
                chips.push({
                    key: 'sort',
                    label: `Urutkan: ${activeSortProduct.label}`,
                });
            }

            return chips;
        },
    },

    /**
     * Menginisialisasi behavior komponen yang bergantung pada browser setelah mounted untuk halaman belanja.
     *
     * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
     */
    mounted() {
        /* EVENT BUS FOR SCROLL GLOBAL */
        eventBus.on('scrollGlobal', () => {
            const globalContainer = this.$global.globalContainer.ref;
            const tolerant = 2;
            this.belanjaHeaderStuck = globalContainer.scrollTop > 8;

            // console.log({
            //   'scrollTop': globalContainer.scrollTop,
            //   'clientHeight': globalContainer.clientHeight,
            //   'scrollHeight': globalContainer.scrollHeight,
            //   'total_ceil': Math.ceil(globalContainer.scrollTop + globalContainer.clientHeight),
            //   'tolerant': tolerant,
            //   'this.$global.globalContainer.loading': this.$global.globalContainer.loading,
            //   'this.completeProduct': this.completeProduct
            // });

            if (
                Math.ceil(globalContainer.scrollTop + globalContainer.clientHeight) >=
                    globalContainer.scrollHeight - tolerant &&
                !this.$global.globalContainer.loading &&
                !this.completeProduct &&
                this.products.length > 0
            ) {
                this.$global.globalContainer.loading = true;

                this.$nextTick(() => {
                    globalContainer.scrollTop = globalContainer.scrollHeight;

                    this.getBelanja();
                });
            }
        });
        /* EVENT BUS FOR SCROLL GLOBAL */

        this.show.belanja_view = false;
        this.show.loading = true;

        this.getBelanja();
    },

    /**
     * Melepaskan resource komponen dan pekerjaan tertunda sebelum unmount untuk halaman belanja.
     *
     * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
     */
    beforeUnmount() {
        eventBus.off('scrollGlobal');
    },

    methods: {
        /**
         * Menjalankan proses enter pencarian produk dan menyinkronkan state hasilnya untuk halaman belanja.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        enterSearchProduct() {
            this.activeSearchProduct = this.searchProduct.trim();
            this.show.loading_search_product = true;
            this.completeProduct = false;
            this.products = [];

            this.getBelanja();
        },

        /**
         * Menjalankan proses on pencarian produk input dan menyinkronkan state hasilnya untuk halaman belanja.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        onSearchProductInput() {
            if (this.searchProduct.trim().length > 0 || this.activeSearchProduct.length === 0) {
                return;
            }

            this.activeSearchProduct = '';
            this.show.loading_search_product = true;
            this.completeProduct = false;
            this.products = [];

            this.getBelanja();
        },

        /**
         * Menjalankan proses apply belanja filters dan menyinkronkan state hasilnya untuk halaman belanja.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        applyBelanjaFilters() {
            this.show.loading_search_product = true;
            this.completeProduct = false;
            this.products = [];

            this.getBelanja();
        },

        /**
         * Mengembalikan belanja filters ke state awal untuk halaman belanja.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        resetBelanjaFilters() {
            if (!this.hasActiveBelanjaFilter) {
                return;
            }

            this.searchProduct = '';
            this.activeSearchProduct = '';
            this.sortProduct = DEFAULT_PRODUCT_SORT;
            this.show.loading_search_product = true;
            this.completeProduct = false;
            this.products = [];

            this.getBelanja();
        },

        /**
         * Membuat keranjang untuk halaman belanja, dengan mendelegasikan pekerjaan backend atau shared state melalui Vuex store.
         *
         * @param {*} product_id Nilai produk id yang diproses oleh function.
         * @param {*} user_id_seller Nilai user id seller yang diproses oleh function.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        addKeranjang(product_id, user_id_seller) {
            this.$store
                .dispatch('addKeranjang', {
                    user_id_buyer: this.$store.getters.user.id,
                    user_id_seller,
                    product_id,
                })
                .then((response) => {
                    // console.log(response);

                    if (response.data.status === 200) {
                        ElNotification({
                            type: 'success',
                            title: 'Success',
                            message: 'Produk berhasil ditambahkan ke keranjang.',
                        });
                    }
                })
                .catch((error) => {
                    console.error(error);

                    const responseData = error.response?.data;

                    if (error.response?.status == 409) {
                        ElNotification({
                            type: 'warning',
                            title: 'Produk Tidak Tersedia',
                            message: responseData?.message || 'Produk sementara tidak dapat ditambahkan ke keranjang.',
                        });
                        this.products = this.products.filter((product) => product.p_id !== product_id);
                        return;
                    }

                    if (responseData?.status == 422) {
                        const message = responseData.message ?? {};

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
        },

        /**
         * Memformat rupiah untuk ditampilkan untuk halaman belanja.
         *
         * @param {*} value Nilai yang diproses oleh function.
         *
         * @returns {string} Teks format rupiah yang telah diformat atau ditentukan.
         */
        formatRupiah(value) {
            const price = Number(value);

            if (!Number.isFinite(price)) {
                return 'Rp 0';
            }

            return `Rp ${price.toLocaleString('id-ID')}`;
        },

        /**
         * Mengambil belanja untuk halaman belanja, dengan mendelegasikan pekerjaan backend atau shared state melalui Vuex store.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        getBelanja() {
            // --- step 1 - start - siapkan versi request dan id produk yang sudah dimuat
            const requestVersion = ++this.productRequestVersion;
            const requestSearchProduct = this.activeSearchProduct;

            let products_current_id = this.products.map((product) => product.p_id);
            products_current_id = JSON.stringify(products_current_id);
            // --- step 1 - end - siapkan versi request dan id produk yang sudah dimuat

            // --- step 2 - start - muat produk dan abaikan response dari versi filter yang sudah tidak aktif
            this.$store
                .dispatch('getBelanja', {
                    products_current_id: products_current_id,
                    search_product: requestSearchProduct,
                    sort_product: this.sortProduct,
                })
                .then((response) => {
                    // console.log(response);

                    if (requestVersion !== this.productRequestVersion) {
                        return;
                    }

                    this.show.loading_search_product = false;
                    this.show.belanja_view = true;
                    this.show.loading = false;

                    this.$global.globalContainer.loading = false;
                    if (response.data.products.length == 0) {
                        this.completeProduct = true;
                    }

                    this.products = [...this.products, ...response.data.products];

                    // console.log({
                    //   'this.products': this.products
                    // });
                })
                .catch((error) => {
                    console.error(error);

                    if (requestVersion !== this.productRequestVersion) {
                        return;
                    }

                    this.show.belanja_view = true;
                    this.show.loading = false;
                    this.show.loading_search_product = false;
                    this.$global.globalContainer.loading = false;

                    ElNotification({
                        type: 'error',
                        title: 'Error',
                        message: 'Daftar produk gagal dimuat. Silakan coba lagi.',
                    });
                });
            // --- step 2 - end - muat produk dan abaikan response dari versi filter yang sudah tidak aktif
        },
    },
};
</script>

<style scoped>
@media (min-width: 1920px) {
    .belanja-list-grid {
        grid-template-columns: repeat(auto-fill, minmax(15rem, 15rem));
        align-items: start;
    }
}
</style>
