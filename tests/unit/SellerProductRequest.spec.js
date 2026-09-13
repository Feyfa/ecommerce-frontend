import { describe, expect, it, vi } from 'vitest';
import axios from '@/axios';
import store from '@/store';

vi.mock('@/axios', () => ({ default: { get: vi.fn() } }));

describe('Request ukuran batch Seller Product', () => {
    it.each([50, 20, undefined])('meneruskan per_page %s ke request HTTP', async (perPage) => {
        const response = { data: { products: [], has_more: false } };
        axios.get.mockResolvedValue(response);

        const result = await store.dispatch('getProducts', {
            user_id_seller: 'seller-1',
            cursor: 'opaque-cursor',
            per_page: perPage,
            search_product: 'sepatu',
            stock_filter: 'healthy',
            sort_product: 'latest',
        });

        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(axios.get).toHaveBeenCalledWith('/product/seller-1', {
            params: {
                cursor: 'opaque-cursor',
                per_page: perPage,
                search_product: 'sepatu',
                stock_filter: 'healthy',
                sort_product: 'latest',
            },
        });
        expect(result).toBe(response);
    });

    it('menghilangkan cursor dari request batch pertama', async () => {
        const response = { data: { products: [], next_cursor: null, has_more: false } };
        axios.get.mockResolvedValue(response);

        await store.dispatch('getProducts', {
            user_id_seller: 'seller-1',
            cursor: null,
            per_page: 50,
            search_product: '',
            stock_filter: 'all',
            sort_product: 'latest',
        });

        expect(axios.get.mock.calls[0][1].params).not.toHaveProperty('cursor');
        expect(axios.get.mock.calls[0][1].params).not.toHaveProperty('products_current_id');
    });
});
