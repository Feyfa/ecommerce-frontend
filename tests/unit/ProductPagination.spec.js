import { flushPromises, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { ElNotification } from 'element-plus';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BelanjaView from '@/views/auth/buyer/BelanjaView.vue';
import ProductView from '@/views/auth/seller/ProductView.vue';

let observerInstances;
let mountedWrappers;

vi.mock('element-plus', async (importOriginal) => ({
    ...(await importOriginal()),
    ElNotification: vi.fn(),
}));

/**
 * Memasang mock IntersectionObserver yang menyimpan callback dan operasi pengamatan setiap instance.
 *
 * @returns {void} Mock browser tersedia secara global untuk komponen yang dipasang dalam test.
 */
const installIntersectionObserverMock = () => {
    observerInstances = [];

    vi.stubGlobal(
        'IntersectionObserver',
        vi.fn(function (callback, options) {
            const observer = {
                callback,
                options,
                observe: vi.fn(),
                unobserve: vi.fn(),
                disconnect: vi.fn(),
            };

            observerInstances.push(observer);

            return observer;
        }),
    );
};

/**
 * Membuat promise terkontrol agar urutan penyelesaian response dapat diatur oleh test stale-response.
 *
 * @returns {{promise: Promise<*>, resolve: Function, reject: Function}} Promise dan pengendali penyelesaiannya.
 */
const createDeferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });

    return { promise, resolve, reject };
};

/**
 * Membentuk response daftar seller dengan metadata pagination dan status lokasi yang valid.
 *
 * @param {Array<Object>} products Produk seller yang dikembalikan pada batch aktif.
 * @param {boolean|undefined} hasMore Metadata keberadaan batch berikutnya atau undefined untuk backend lama.
 *
 * @returns {Object} Response menyerupai hasil Axios untuk action Seller Product.
 */
const sellerResponse = (products, hasMore) => ({
    data: {
        products,
        has_more: hasMore,
        seller_location_verified: true,
    },
});

/**
 * Membentuk response katalog buyer dengan metadata numbered pagination Meilisearch.
 *
 * @param {Array<Object>} products Produk buyer yang dikembalikan pada halaman aktif.
 * @param {boolean} hasMore Menunjukkan apakah halaman berikutnya tersedia.
 *
 * @returns {Object} Response menyerupai hasil Axios untuk action Buyer Belanja.
 */
const buyerResponse = (products, hasMore) => ({
    data: {
        products,
        has_more: hasMore,
        limit_reached: false,
    },
});

/**
 * Memasang Seller Product dengan store dan state global terkontrol untuk pengujian pagination.
 *
 * @param {Function} dispatch Mock dispatch Vuex yang menyediakan response setiap request.
 * @param {Object|undefined} sharedContainer State container bersama untuk simulasi perpindahan halaman.
 *
 * @returns {import('@vue/test-utils').VueWrapper} Wrapper Seller Product yang telah dipasang.
 */
const mountSellerProduct = (dispatch, sharedContainer) => {
    const globalContainer = document.createElement('div');
    const wrapper = shallowMount(ProductView, {
        global: {
            mocks: {
                $store: {
                    getters: { user: { id: 'seller-1' } },
                    dispatch,
                },
                $global: {
                    globalContainer: sharedContainer ?? { ref: globalContainer, loading: false },
                    modals: { addProduct: false, editProduct: false },
                },
                $router: { push: vi.fn() },
            },
            stubs: {
                AddProduct: true,
                EditProduct: true,
                ElOption: true,
                ElSelect: true,
            },
        },
    });

    mountedWrappers.push(wrapper);

    return wrapper;
};

/**
 * Memasang Buyer Belanja dengan store dan state global terkontrol untuk pengujian pagination.
 *
 * @param {Function} dispatch Mock dispatch Vuex yang menyediakan response setiap request.
 * @param {Object|undefined} sharedContainer State container bersama untuk simulasi perpindahan halaman.
 *
 * @returns {import('@vue/test-utils').VueWrapper} Wrapper Buyer Belanja yang telah dipasang.
 */
const mountBuyerCatalog = (dispatch, sharedContainer) => {
    const globalContainer = document.createElement('div');
    const wrapper = shallowMount(BelanjaView, {
        global: {
            mocks: {
                $store: {
                    getters: { user: { id: 'buyer-1' } },
                    dispatch,
                },
                $global: {
                    globalContainer: sharedContainer ?? { ref: globalContainer, loading: false },
                },
            },
            stubs: {
                ElOption: true,
                ElSelect: true,
            },
        },
    });

    mountedWrappers.push(wrapper);

    return wrapper;
};

beforeEach(() => {
    mountedWrappers = [];
    installIntersectionObserverMock();
});

afterEach(() => {
    mountedWrappers.forEach((wrapper) => wrapper.unmount());
    vi.unstubAllGlobals();
});

describe('Seller Product pagination', () => {
    it('menghentikan observer dan tidak meminta batch terminal ketika has_more false', async () => {
        const request = createDeferred();
        const dispatch = vi.fn().mockReturnValue(request.promise);
        const wrapper = mountSellerProduct(dispatch);

        await nextTick();
        request.resolve(sellerResponse([{ id: 'product-1' }], false));
        await flushPromises();

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.completeProduct).toBe(true);

        observerInstances[0].callback([{ isIntersecting: true }]);
        await flushPromises();

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(observerInstances[0].unobserve).toHaveBeenCalled();
    });

    it('memuat batch berikutnya sekali dan berhenti setelah metadata terminal diterima', async () => {
        const dispatch = vi
            .fn()
            .mockResolvedValueOnce(sellerResponse([{ id: 'product-1' }], true))
            .mockResolvedValueOnce(sellerResponse([{ id: 'product-2' }], false));
        const wrapper = mountSellerProduct(dispatch);

        await flushPromises();
        await nextTick();
        observerInstances[0].callback([{ isIntersecting: true }]);
        await flushPromises();
        await nextTick();

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0][1].per_page).toBe(50);
        expect(dispatch.mock.calls[1][1].per_page).toBe(50);
        expect(dispatch.mock.calls[1][1].products_current_id).toBe(JSON.stringify(['product-1']));
        expect(wrapper.vm.products.map((product) => product.id)).toEqual(['product-1', 'product-2']);
        expect(wrapper.vm.completeProduct).toBe(true);

        observerInstances[0].callback([{ isIntersecting: true }]);
        await flushPromises();

        expect(dispatch).toHaveBeenCalledTimes(2);
    });

    it('mempertahankan fallback batch kosong untuk response backend tanpa has_more', async () => {
        const dispatch = vi
            .fn()
            .mockResolvedValueOnce(sellerResponse([{ id: 'product-1' }], undefined))
            .mockResolvedValueOnce(sellerResponse([], undefined));
        const wrapper = mountSellerProduct(dispatch);

        await flushPromises();
        await nextTick();

        expect(wrapper.vm.completeProduct).toBe(false);

        observerInstances[0].callback([{ isIntersecting: true }]);
        await flushPromises();

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(wrapper.vm.completeProduct).toBe(true);
    });

    it('mengabaikan response lama setelah pencarian membuat versi request baru', async () => {
        const oldRequest = createDeferred();
        const newRequest = createDeferred();
        const dispatch = vi.fn().mockReturnValueOnce(oldRequest.promise).mockReturnValueOnce(newRequest.promise);
        const wrapper = mountSellerProduct(dispatch);

        wrapper.vm.searchProduct = 'baru';
        wrapper.vm.perPage = 20;
        wrapper.vm.enterSearchProduct();
        expect(dispatch.mock.calls[1][1].per_page).toBe(20);
        newRequest.resolve(sellerResponse([{ id: 'new-product' }], false));
        await flushPromises();

        oldRequest.resolve(sellerResponse([{ id: 'old-product' }], true));
        await flushPromises();

        expect(wrapper.vm.products.map((product) => product.id)).toEqual(['new-product']);
        expect(wrapper.vm.completeProduct).toBe(true);
    });
});

describe('Buyer Belanja pagination', () => {
    it('mengirim per_page 50 tanpa products_current_id dan berhenti dari has_more false', async () => {
        const dispatch = vi.fn().mockResolvedValue(buyerResponse([{ p_id: 'product-1' }], false));
        const wrapper = mountBuyerCatalog(dispatch);

        await flushPromises();
        await nextTick();

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][1]).toMatchObject({ page: 1, per_page: 50 });
        expect(dispatch.mock.calls[0][1]).not.toHaveProperty('products_current_id');
        expect(wrapper.vm.completeProduct).toBe(true);

        observerInstances[0].callback([{ isIntersecting: true }]);
        await flushPromises();

        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it('memajukan halaman ketika has_more true dan mendeduplikasi produk antarhalaman', async () => {
        const dispatch = vi
            .fn()
            .mockResolvedValueOnce(buyerResponse([{ p_id: 'product-1' }], true))
            .mockResolvedValueOnce(buyerResponse([{ p_id: 'product-1' }, { p_id: 'product-2' }], false));
        const wrapper = mountBuyerCatalog(dispatch);

        await flushPromises();
        await nextTick();
        observerInstances[0].callback([{ isIntersecting: true }]);
        await flushPromises();

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[1][1]).toMatchObject({ page: 2, per_page: 50 });
        expect(wrapper.vm.products.map((product) => product.p_id)).toEqual(['product-1', 'product-2']);
        expect(wrapper.vm.completeProduct).toBe(true);
    });
});

describe('Chip pencarian dan urutan Buyer Belanja', () => {
    it('menampilkan keyword aktif dan urutan non-default tanpa menambah hitungan Filter', async () => {
        const dispatch = vi.fn().mockResolvedValue(buyerResponse([], false));
        const wrapper = mountBuyerCatalog(dispatch);
        await flushPromises();
        await wrapper.setData({ searchProduct: 'draft sepatu' });
        expect(wrapper.vm.activeBelanjaFilterChips).toEqual([]);
        expect(dispatch).toHaveBeenCalledTimes(1);

        wrapper.vm.enterSearchProduct();
        await flushPromises();
        expect(wrapper.find('[aria-label="Hapus Pencarian: draft sepatu"]').exists()).toBe(true);
        expect(wrapper.vm.activeBelanjaFilterChips.map((chip) => chip.key)).toEqual(['search']);

        await wrapper.setData({ searchProduct: 'belum diterapkan', sortProduct: 'latest', minPrice: 5000 });
        expect(wrapper.find('[aria-label="Hapus Urutkan: Terbaru"]').exists()).toBe(true);
        expect(wrapper.find('[aria-label="Hapus Pencarian: draft sepatu"]').exists()).toBe(true);
        expect(wrapper.vm.activeBelanjaFilterCount).toBe(1);
        expect(wrapper.text()).toContain('Filter (1)');
    });

    it.each([
        ['relevance', 'latest'],
        ['price_lowest', 'price_lowest'],
    ])('menghapus pencarian dengan urutan %s dan mempertahankan filter lain', async (sort, expectedSort) => {
        const staleRequest = createDeferred();
        const dispatch = vi
            .fn()
            .mockReturnValueOnce(staleRequest.promise)
            .mockResolvedValueOnce(buyerResponse([{ p_id: 'fresh' }], false));
        const wrapper = mountBuyerCatalog(dispatch);
        await wrapper.setData({
            searchProduct: 'draft lain',
            activeSearchProduct: 'sepatu',
            sortProduct: sort,
            minPrice: 5000,
            maxPrice: 200000,
            addedWithin: 7,
            currentPage: 4,
        });

        await wrapper.get('[aria-label="Hapus Pencarian: sepatu"]').trigger('click');
        await flushPromises();
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[1][1]).toMatchObject({
            page: 1,
            per_page: 50,
            search_product: '',
            sort_product: expectedSort,
            min_price: 5000,
            max_price: 200000,
            added_within: 7,
        });
        expect(wrapper.vm.searchProduct).toBe('');
        expect(wrapper.find('[aria-label="Hapus Pencarian: sepatu"]').exists()).toBe(false);
        expect(wrapper.vm.activeBelanjaFilterCount).toBe(3);

        staleRequest.resolve(buyerResponse([{ p_id: 'stale' }], true));
        await flushPromises();
        expect(wrapper.vm.products.map((product) => product.p_id)).toEqual(['fresh']);
        expect(wrapper.vm.completeProduct).toBe(true);
    });

    it.each([
        ['', 'latest'],
        ['sepatu', 'relevance'],
    ])('menghapus urutan dengan keyword "%s" dan kembali ke default konteks', async (keyword, expectedSort) => {
        const dispatch = vi.fn().mockResolvedValue(buyerResponse([], false));
        const wrapper = mountBuyerCatalog(dispatch);
        await flushPromises();
        await wrapper.setData({
            searchProduct: keyword,
            activeSearchProduct: keyword,
            sortProduct: 'price_lowest',
            minPrice: 5000,
            currentPage: 3,
        });

        await wrapper.get('[aria-label="Hapus Urutkan: Harga Terendah"]').trigger('click');
        await flushPromises();
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[1][1]).toMatchObject({
            page: 1,
            per_page: 50,
            search_product: keyword,
            sort_product: expectedSort,
            min_price: 5000,
        });
        expect(wrapper.find('[aria-label="Hapus Urutkan: Harga Terendah"]').exists()).toBe(false);
        expect(wrapper.vm.activeSearchProduct).toBe(keyword);
        expect(wrapper.vm.activeBelanjaFilterCount).toBe(1);
    });
});

describe.each([
    ['seller ke buyer', mountSellerProduct, sellerResponse, mountBuyerCatalog, buyerResponse],
    ['buyer ke seller', mountBuyerCatalog, buyerResponse, mountSellerProduct, sellerResponse],
])('Perpindahan halaman %s', (_direction, mountOld, oldResponse, mountNew, newResponse) => {
    it.each([
        ['awal', 'sukses'],
        ['awal', 'gagal'],
        ['lanjutan', 'sukses'],
        ['lanjutan', 'gagal'],
    ])('mengabaikan request %s yang %s setelah unmount', async (phase, outcome) => {
        const sharedContainer = { ref: document.createElement('div'), loading: false };
        const oldRequest = createDeferred();
        const oldDispatch = vi.fn();
        const firstProduct = { id: 'first', p_id: 'first' };

        if (phase === 'lanjutan') {
            oldDispatch.mockResolvedValueOnce(oldResponse([firstProduct], true));
        }
        oldDispatch.mockReturnValueOnce(oldRequest.promise);
        const oldWrapper = mountOld(oldDispatch, sharedContainer);
        await flushPromises();
        const oldObserver = observerInstances[0];

        if (phase === 'lanjutan') {
            oldObserver.callback([{ isIntersecting: true }]);
            expect(sharedContainer.loading).toBe(true);
        }

        const oldVm = oldWrapper.vm;
        const oldProducts = [...oldVm.products];
        oldWrapper.unmount();
        mountedWrappers = mountedWrappers.filter((wrapper) => wrapper !== oldWrapper);
        expect(oldObserver.disconnect).toHaveBeenCalled();
        expect(sharedContainer.loading).toBe(false);

        const newRequest = createDeferred();
        const newDispatch = vi
            .fn()
            .mockResolvedValueOnce(newResponse([firstProduct], true))
            .mockReturnValueOnce(newRequest.promise);
        const newWrapper = mountNew(newDispatch, sharedContainer);
        await flushPromises();
        const newObserver = observerInstances[1];
        newObserver.callback([{ isIntersecting: true }]);
        expect(newDispatch).toHaveBeenCalledTimes(2);
        expect(sharedContainer.loading).toBe(true);

        const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
        if (outcome === 'sukses') {
            oldRequest.resolve(oldResponse([{ id: 'stale', p_id: 'stale' }], false));
        } else {
            oldRequest.reject(new Error('Request halaman lama gagal'));
        }
        await flushPromises();

        expect(sharedContainer.loading).toBe(true);
        expect(oldVm.products).toEqual(oldProducts);
        expect(ElNotification).not.toHaveBeenCalled();
        expect(errorLog).not.toHaveBeenCalled();
        newObserver.callback([{ isIntersecting: true }]);
        expect(newDispatch).toHaveBeenCalledTimes(2);

        newRequest.resolve(newResponse([{ id: 'second', p_id: 'second' }], false));
        await flushPromises();
        expect(sharedContainer.loading).toBe(false);
        expect(newWrapper.vm.products.map((product) => product.id)).toEqual(['first', 'second']);
        expect(newWrapper.vm.completeProduct).toBe(true);

        // Callback observer yang sudah antre juga tidak boleh memulai request dari halaman lama.
        const oldCallCount = oldDispatch.mock.calls.length;
        oldObserver.callback([{ isIntersecting: true }]);
        expect(oldDispatch).toHaveBeenCalledTimes(oldCallCount);
    });
});
