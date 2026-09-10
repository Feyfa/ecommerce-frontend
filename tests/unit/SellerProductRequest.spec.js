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
            products_current_id: '["product-1"]',
            per_page: perPage,
            search_product: 'sepatu',
            stock_filter: 'healthy',
            sort_product: 'latest',
        });

        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(axios.get).toHaveBeenCalledWith('/product/seller-1', {
            params: {
                products_current_id: '["product-1"]',
                per_page: perPage,
                search_product: 'sepatu',
                stock_filter: 'healthy',
                sort_product: 'latest',
            },
        });
        expect(result).toBe(response);
    });
});
