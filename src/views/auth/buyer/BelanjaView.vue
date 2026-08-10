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

            <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div class="flex min-w-0 flex-col gap-1.5 sm:flex-1 sm:max-w-[18rem]">
                    <label for="search-product" class="text-xs font-semibold text-slate-600">Cari</label>
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

                <div class="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:w-auto">
                    <div class="flex min-w-0 flex-col gap-1.5 sm:w-[13rem]">
                        <label for="buyer-product-sort" class="text-xs font-semibold text-slate-600">Urutkan</label>
                        <div
                            class="belanja-sort-control flex items-center"
                            :class="{ 'belanja-sort-control--with-reset': sortProduct !== defaultProductSort }"
                        >
                            <el-select
                                id="buyer-product-sort"
                                aria-label="Urutkan produk belanja"
                                v-model="sortProduct"
                                class="product-sort-filter min-w-0 flex-1 !w-auto"
                                popper-class="product-filter-popper"
                                @change="reloadBelanjaProducts"
                            >
                                <el-option
                                    v-for="option in sortProductOptions"
                                    :key="option.value"
                                    :label="option.label"
                                    :value="option.value"
                                />
                            </el-select>

                            <button
                                v-if="sortProduct !== defaultProductSort"
                                type="button"
                                class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-l-none rounded-r-md border border-slate-300 bg-white px-0 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Reset urutan"
                                aria-label="Reset urutan"
                                @click="resetBelanjaSort"
                            >
                                <i class="fa-solid fa-rotate-left text-xs" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>

                    <div
                        ref="belanjaFilterControls"
                        class="relative flex flex-col gap-1.5"
                        @keydown.esc="closeBelanjaFilter"
                    >
                        <span class="text-xs font-semibold text-slate-600">Filter</span>
                        <button
                            id="buyer-product-filter"
                            type="button"
                            class="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 active:scale-95"
                            :aria-expanded="isBelanjaFilterOpen"
                            aria-controls="buyerProductFilterPanel"
                            @click="toggleBelanjaFilter"
                        >
                            <i class="fa-solid fa-filter text-xs" aria-hidden="true"></i>
                            <span>{{
                                activeBelanjaFilterCount > 0 ? `Filter (${activeBelanjaFilterCount})` : 'Filter'
                            }}</span>
                        </button>

                        <section
                            id="buyerProductFilterPanel"
                            class="belanja-filter-panel"
                            :class="{ 'is-open': isBelanjaFilterOpen }"
                            role="dialog"
                            aria-labelledby="buyerProductFilterTitle"
                        >
                            <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                                <h2 id="buyerProductFilterTitle" class="text-base font-semibold text-slate-950">
                                    Filter
                                </h2>
                                <button
                                    type="button"
                                    class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                    aria-label="Tutup filter"
                                    @click="closeBelanjaFilter"
                                >
                                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                                </button>
                            </div>

                            <div class="divide-y divide-slate-200">
                                <div>
                                    <button
                                        type="button"
                                        class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                                        :aria-expanded="isPriceFilterSectionOpen"
                                        aria-controls="buyerProductPriceFilter"
                                        @click="toggleBelanjaFilterSection('price')"
                                    >
                                        Harga
                                        <i
                                            class="fa-solid fa-chevron-down text-xs text-slate-500 transition-transform"
                                            :class="{ 'rotate-180': isPriceFilterSectionOpen }"
                                            aria-hidden="true"
                                        ></i>
                                    </button>

                                    <div
                                        v-show="isPriceFilterSectionOpen"
                                        id="buyerProductPriceFilter"
                                        class="px-4 pb-4"
                                    >
                                        <div class="flex flex-col gap-3">
                                            <label class="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                                                Harga minimum
                                                <span
                                                    class="flex h-11 w-full overflow-hidden rounded-md border border-slate-300 bg-white text-base text-slate-900 shadow-sm focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100"
                                                >
                                                    <span
                                                        class="flex w-12 shrink-0 items-center justify-center border-r border-slate-300 bg-slate-50 text-sm font-semibold text-slate-500"
                                                    >
                                                        Rp
                                                    </span>
                                                    <input
                                                        v-model="draftMinPrice"
                                                        type="text"
                                                        inputmode="numeric"
                                                        class="h-full min-w-0 flex-1 px-3 text-base text-slate-900 outline-none placeholder:text-slate-400"
                                                        placeholder="50.000"
                                                        @input="onBelanjaPriceInput('draftMinPrice')"
                                                    />
                                                </span>
                                            </label>

                                            <label class="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                                                Harga maksimum
                                                <span
                                                    class="flex h-11 w-full overflow-hidden rounded-md border border-slate-300 bg-white text-base text-slate-900 shadow-sm focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100"
                                                >
                                                    <span
                                                        class="flex w-12 shrink-0 items-center justify-center border-r border-slate-300 bg-slate-50 text-sm font-semibold text-slate-500"
                                                    >
                                                        Rp
                                                    </span>
                                                    <input
                                                        v-model="draftMaxPrice"
                                                        type="text"
                                                        inputmode="numeric"
                                                        class="h-full min-w-0 flex-1 px-3 text-base text-slate-900 outline-none placeholder:text-slate-400"
                                                        placeholder="50.000"
                                                        @input="onBelanjaPriceInput('draftMaxPrice')"
                                                    />
                                                </span>
                                            </label>
                                        </div>

                                        <p
                                            v-if="filterPriceError"
                                            class="mt-3 text-xs font-medium leading-5 text-red-600"
                                        >
                                            {{ filterPriceError }}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                                        :aria-expanded="isRecentlyAddedFilterSectionOpen"
                                        aria-controls="buyerProductRecentlyAddedFilter"
                                        @click="toggleBelanjaFilterSection('recently-added')"
                                    >
                                        Terakhir Ditambahkan
                                        <i
                                            class="fa-solid fa-chevron-down text-xs text-slate-500 transition-transform"
                                            :class="{ 'rotate-180': isRecentlyAddedFilterSectionOpen }"
                                            aria-hidden="true"
                                        ></i>
                                    </button>

                                    <div
                                        v-show="isRecentlyAddedFilterSectionOpen"
                                        id="buyerProductRecentlyAddedFilter"
                                        class="px-4 pb-4"
                                    >
                                        <div
                                            class="flex flex-wrap gap-2"
                                            role="group"
                                            aria-label="Rentang terakhir ditambahkan"
                                        >
                                            <button
                                                v-for="option in recentlyAddedFilterOptions"
                                                :key="option.value"
                                                type="button"
                                                class="inline-flex h-9 items-center rounded-md border px-3 text-sm font-semibold transition"
                                                :class="
                                                    draftAddedWithin === option.value
                                                        ? 'border-violet-600 bg-violet-600 text-white'
                                                        : 'border-slate-300 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700'
                                                "
                                                :aria-pressed="draftAddedWithin === option.value"
                                                @click="draftAddedWithin = option.value"
                                            >
                                                {{ option.label }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center justify-end gap-3 border-t border-slate-200 px-4 py-3">
                                <button
                                    type="button"
                                    class="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                                    :disabled="activeBelanjaFilterCount === 0"
                                    @click="resetBelanjaFilters"
                                >
                                    Reset Filter
                                </button>
                                <button
                                    type="button"
                                    class="inline-flex h-9 items-center justify-center rounded-md bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 active:scale-95"
                                    @click="applyBelanjaFilters"
                                >
                                    Terapkan
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <div v-if="activeBelanjaFilterChips.length > 0" class="mt-3 flex flex-wrap items-center gap-2">
                <button
                    v-for="chip in activeBelanjaFilterChips"
                    :key="chip.key"
                    type="button"
                    class="inline-flex h-8 items-center rounded-full bg-violet-50 px-3 text-xs font-semibold text-violet-700 ring-1 ring-violet-100"
                    :aria-label="`Hapus filter ${chip.label}`"
                    @click="removeBelanjaFilter(chip.key)"
                >
                    {{ chip.label }}
                    <i class="fa-solid fa-xmark ml-2 text-[.65rem]" aria-hidden="true"></i>
                </button>
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
            defaultProductSort: DEFAULT_PRODUCT_SORT,
            minPrice: null,
            maxPrice: null,
            addedWithin: null,
            draftMinPrice: '',
            draftMaxPrice: '',
            draftAddedWithin: null,
            isBelanjaFilterOpen: false,
            isPriceFilterSectionOpen: true,
            isRecentlyAddedFilterSectionOpen: false,
            filterPriceError: '',
            productRequestVersion: 0,
            belanjaHeaderStuck: false,
            sortProductOptions: PRODUCT_SORT_OPTIONS,
            recentlyAddedFilterOptions: [
                { value: '7', label: '7 Hari' },
                { value: '14', label: '14 Hari' },
                { value: '30', label: '1 Bulan' },
                { value: '90', label: '3 Bulan' },
            ],
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
         * Menentukan apakah pencarian atau filter katalog aktif sedang membatasi hasil katalog buyer.
         *
         * Sort tidak dihitung sebagai filter karena hanya mengubah urutan hasil, bukan jumlah produk yang tersedia.
         *
         * @returns {boolean} Menunjukkan apakah katalog sedang dibatasi oleh pencarian atau filter.
         */
        hasActiveBelanjaFilter() {
            return this.activeSearchProduct.length > 0 || this.activeBelanjaFilterCount > 0;
        },

        /**
         * Menghitung jumlah kriteria katalog aktif untuk label tombol Filter.
         *
         * Setiap batas harga dan rentang terakhir ditambahkan dihitung terpisah agar count dan chip selalu
         * mencerminkan kriteria yang dapat dihapus satu per satu.
         *
         * @returns {number} Jumlah kriteria filter yang sedang diterapkan pada katalog.
         */
        activeBelanjaFilterCount() {
            return [this.minPrice, this.maxPrice, this.addedWithin].filter((value) => value !== null).length;
        },

        /**
         * Membentuk chip untuk setiap kriteria buyer yang sudah diterapkan.
         *
         * Sort sengaja tidak dimasukkan karena kontrol tersebut berdiri sendiri dari filter katalog.
         *
         * @returns {Array<{key: string, label: string}>} Kumpulan chip filter yang dapat dihapus mandiri.
         */
        activeBelanjaFilterChips() {
            const chips = [];

            if (this.minPrice !== null) {
                chips.push({
                    key: 'min',
                    label: `Harga ≥ ${this.formatRupiah(this.minPrice)}`,
                });
            }

            if (this.maxPrice !== null) {
                chips.push({
                    key: 'max',
                    label: `Harga ≤ ${this.formatRupiah(this.maxPrice)}`,
                });
            }

            if (this.addedWithin !== null) {
                const option = this.recentlyAddedFilterOptions.find((item) => item.value === this.addedWithin);

                if (option) {
                    chips.push({
                        key: 'added-within',
                        label: `Ditambahkan ${option.label} terakhir`,
                    });
                }
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
        document.addEventListener('pointerdown', this.handleBelanjaFilterDocumentPointerDown);

        this.getBelanja();
    },

    /**
     * Melepaskan resource komponen dan pekerjaan tertunda sebelum unmount untuk halaman belanja.
     *
     * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
     */
    beforeUnmount() {
        eventBus.off('scrollGlobal');
        document.removeEventListener('pointerdown', this.handleBelanjaFilterDocumentPointerDown);
    },

    methods: {
        /**
         * Menjalankan proses enter pencarian produk dan menyinkronkan state hasilnya untuk halaman belanja.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        enterSearchProduct() {
            this.activeSearchProduct = this.searchProduct.trim();
            this.reloadBelanjaProducts();
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
            this.reloadBelanjaProducts();
        },

        /**
         * Membuka atau menutup panel filter sambil menyinkronkan draft dengan kriteria yang diterapkan.
         *
         * Menutup panel tanpa menerapkan perubahan mengembalikan draft ke nilai filter aktif agar input yang belum
         * disimpan tidak memengaruhi daftar produk.
         *
         * @returns {void} Memperbarui visibilitas panel dan state draft filter.
         */
        toggleBelanjaFilter() {
            if (this.isBelanjaFilterOpen) {
                this.closeBelanjaFilter();
                return;
            }

            this.draftMinPrice = this.minPrice !== null ? this.minPrice.toLocaleString('id-ID') : '';
            this.draftMaxPrice = this.maxPrice !== null ? this.maxPrice.toLocaleString('id-ID') : '';
            this.draftAddedWithin = this.addedWithin;
            this.filterPriceError = '';
            this.isPriceFilterSectionOpen = true;
            this.isRecentlyAddedFilterSectionOpen = false;
            this.isBelanjaFilterOpen = true;
        },

        /**
         * Menutup panel filter dan membatalkan perubahan draft yang belum diterapkan.
         *
         * Nilai applied tetap menjadi sumber data katalog sehingga penutupan melalui klik di luar panel atau tombol
         * close tidak dapat mengubah hasil produk secara tidak sengaja.
         *
         * @returns {void} Menutup panel serta menyamakan draft dengan filter aktif.
         */
        closeBelanjaFilter() {
            this.draftMinPrice = this.minPrice !== null ? this.minPrice.toLocaleString('id-ID') : '';
            this.draftMaxPrice = this.maxPrice !== null ? this.maxPrice.toLocaleString('id-ID') : '';
            this.draftAddedWithin = this.addedWithin;
            this.filterPriceError = '';
            this.isBelanjaFilterOpen = false;
        },

        /**
         * Menutup panel Filter ketika pointer berada di luar kontrol toolbar belanja.
         *
         * Listener dokumen menyamakan perilaku panel ter-anchored ini dengan Filter Audit Log tanpa backdrop
         * penuh layar, sehingga daftar katalog tetap terasa ringan pada layar mobile maupun desktop.
         *
         * @param {PointerEvent} event Event pointer dari dokumen browser.
         *
         * @returns {void} Menutup panel bila target klik berada di luar kontrol Filter.
         */
        handleBelanjaFilterDocumentPointerDown(event) {
            if (!this.isBelanjaFilterOpen || this.$refs.belanjaFilterControls?.contains(event.target)) {
                return;
            }

            this.closeBelanjaFilter();
        },

        /**
         * Membuka atau menutup satu section accordion di dalam panel Filter.
         *
         * Setiap section menyimpan statusnya sendiri agar buyer dapat membandingkan atau mengisi beberapa jenis
         * filter tanpa section lain tertutup secara otomatis.
         *
         * @param {'price'|'recently-added'} section Identitas section filter yang dipilih buyer.
         *
         * @returns {void} Memperbarui section accordion yang sedang terbuka.
         */
        toggleBelanjaFilterSection(section) {
            if (section === 'price') {
                this.isPriceFilterSectionOpen = !this.isPriceFilterSectionOpen;
                return;
            }

            this.isRecentlyAddedFilterSectionOpen = !this.isRecentlyAddedFilterSectionOpen;
        },

        /**
         * Menerapkan rentang harga dan terakhir ditambahkan setelah memastikan nominal serta urutan batas valid.
         *
         * Request katalog hanya dibuat ketika nilai applied berubah sehingga menekan Terapkan tanpa perubahan cukup
         * menutup panel dan tidak memuat ulang daftar tanpa alasan.
         *
         * @returns {void} Memperbarui filter aktif atau menampilkan pesan validasi di panel.
         */
        applyBelanjaFilters() {
            // --- step 1 - start - normalisasi dan validasi nominal draft
            const minPrice = this.parseBelanjaPrice(this.draftMinPrice, 'Harga minimum');
            const maxPrice = this.parseBelanjaPrice(this.draftMaxPrice, 'Harga maksimum');

            if (minPrice === false || maxPrice === false) {
                return;
            }

            if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
                this.filterPriceError = 'Harga minimum tidak boleh lebih besar dari harga maksimum.';
                return;
            }
            // --- step 1 - end - normalisasi dan validasi nominal draft

            // --- step 2 - start - terapkan filter aktif dan muat ulang bila berubah
            const hasChanged =
                this.minPrice !== minPrice || this.maxPrice !== maxPrice || this.addedWithin !== this.draftAddedWithin;
            this.minPrice = minPrice;
            this.maxPrice = maxPrice;
            this.addedWithin = this.draftAddedWithin;
            this.closeBelanjaFilter();

            if (hasChanged) {
                this.reloadBelanjaProducts();
            }
            // --- step 2 - end - terapkan filter aktif dan muat ulang bila berubah
        },

        /**
         * Mengubah input nominal filter menjadi angka bulat atau nilai kosong yang aman untuk query katalog.
         *
         * @param {string|number|null} value Nilai draft yang dimasukkan buyer pada field harga.
         * @param {string} label Nama field yang digunakan pada pesan validasi.
         *
         * @returns {number|null|false} Nominal valid, null untuk field kosong, atau false ketika input tidak valid.
         */
        parseBelanjaPrice(value, label) {
            if (value === '' || value === null) {
                return null;
            }

            const price = Number(String(value).replace(/\D/g, ''));

            if (!Number.isInteger(price) || price < 0) {
                this.filterPriceError = `${label} harus berupa angka bulat Rp0 atau lebih.`;
                return false;
            }

            return price;
        },

        /**
         * Menormalkan nominal yang diketik buyer agar memakai pemisah ribuan Indonesia seperti input harga Produk.
         *
         * @param {'draftMinPrice'|'draftMaxPrice'} field State draft harga yang sedang diubah buyer.
         *
         * @returns {void} Menyimpan kembali teks nominal terformat pada state draft yang dipilih.
         */
        onBelanjaPriceInput(field) {
            const normalizedValue = String(this[field] ?? '').replace(/\D/g, '');

            this[field] = normalizedValue ? Number(normalizedValue).toLocaleString('id-ID') : '';
            this.filterPriceError = '';
        },

        /**
         * Menghapus seluruh filter aktif tanpa mengubah pencarian atau urutan katalog.
         *
         * Reset memiliki efek langsung agar daftar produk segera kembali ke hasil tanpa batas harga setelah buyer
         * menekan tombolnya di panel.
         *
         * @returns {void} Mengosongkan filter dan memuat ulang katalog bila filter sebelumnya aktif.
         */
        resetBelanjaFilters() {
            const hasActiveFilter = this.activeBelanjaFilterCount > 0;
            this.minPrice = null;
            this.maxPrice = null;
            this.addedWithin = null;
            this.closeBelanjaFilter();

            if (hasActiveFilter) {
                this.reloadBelanjaProducts();
            }
        },

        /**
         * Menghapus satu kriteria melalui chip filter yang dipilih buyer.
         *
         * @param {'min'|'max'|'added-within'} filterKey Identitas kriteria yang harus dilepas dari filter aktif.
         *
         * @returns {void} Menghapus satu kriteria dan memuat ulang katalog bila nilainya berubah.
         */
        removeBelanjaFilter(filterKey) {
            if (filterKey === 'min' && this.minPrice !== null) {
                this.minPrice = null;
                this.reloadBelanjaProducts();
                return;
            }

            if (filterKey === 'max' && this.maxPrice !== null) {
                this.maxPrice = null;
                this.reloadBelanjaProducts();
                return;
            }

            if (filterKey === 'added-within' && this.addedWithin !== null) {
                this.addedWithin = null;
                this.reloadBelanjaProducts();
            }
        },

        /**
         * Mengosongkan daftar produk dan memuat batch pertama sesuai pencarian, filter, dan sort aktif.
         *
         * Setiap perubahan kriteria menggunakan jalur ini agar infinite scroll dimulai ulang dan response dari
         * request lama tidak dapat menimpa hasil katalog yang lebih baru.
         *
         * @returns {void} Menyiapkan state reload lalu meminta katalog buyer terbaru.
         */
        reloadBelanjaProducts() {
            this.show.loading_search_product = true;
            this.completeProduct = false;
            this.products = [];

            this.getBelanja();
        },

        /**
         * Mengembalikan urutan katalog ke nilai bawaan tanpa menghapus
         * pencarian aktif pengguna.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        resetBelanjaSort() {
            if (this.sortProduct === DEFAULT_PRODUCT_SORT) {
                return;
            }

            this.sortProduct = DEFAULT_PRODUCT_SORT;
            this.reloadBelanjaProducts();
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
                    min_price: this.minPrice,
                    max_price: this.maxPrice,
                    added_within: this.addedWithin,
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
.belanja-sort-control--with-reset :deep(.el-select__wrapper) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right-width: 0;
}

.belanja-filter-panel {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 30;
    display: none;
    box-sizing: border-box;
    width: min(22rem, calc(100vw - 2rem));
    overflow: visible;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #ffffff;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
}

.belanja-filter-panel::before {
    position: absolute;
    top: -7px;
    right: 22px;
    width: 12px;
    height: 12px;
    border-top: 1px solid #e2e8f0;
    border-left: 1px solid #e2e8f0;
    background: #ffffff;
    content: '';
    transform: rotate(45deg);
}

.belanja-filter-panel.is-open {
    display: block;
}

@media (max-width: 640px) {
    .belanja-filter-panel::before {
        right: 20px;
    }
}

@media (min-width: 1920px) {
    .belanja-list-grid {
        grid-template-columns: repeat(auto-fill, minmax(15rem, 15rem));
        align-items: start;
    }
}
</style>
