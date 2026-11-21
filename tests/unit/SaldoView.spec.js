import { describe, expect, it } from 'vitest';
import SaldoView from '@/views/auth/SaldoView.vue';

const HISTORY_PRICE = 125_000;
const { formatSaldoHistoryPrice, getColorMoney } = SaldoView.methods;

describe('Tampilan nominal riwayat saldo', () => {
    it.each([
        // Jenis mutasi yang dikenali, termasuk nominal dalam bentuk string.
        {
            name: 'pemasukan dengan nominal string',
            row: { type: 'incoming', price: String(HISTORY_PRICE) },
            amount: '+ Rp125.000',
            color: 'text-green-700',
        },
        {
            name: 'penarikan dengan nominal terisi',
            row: { type: 'withdrawal', price: HISTORY_PRICE },
            amount: '- Rp125.000',
            color: 'text-red-700',
        },

        // Jenis mutasi lama dan tipe null tanpa arah saldo yang dikenali.
        {
            name: 'jenis tidak dikenal dengan nominal terisi',
            row: { type: 'legacy_adjustment', price: HISTORY_PRICE },
            amount: 'Rp125.000',
            color: 'text-neutral-700',
        },
        {
            name: 'jenis null dengan nominal terisi',
            row: { type: null, price: HISTORY_PRICE },
            amount: 'Rp125.000',
            color: 'text-neutral-700',
        },

        // Nominal yang hilang, nominal nol, dan field opsional yang tidak dikirim.
        {
            name: 'penarikan dengan nominal null',
            row: { type: 'withdrawal', price: null },
            amount: '—',
            color: 'text-red-700',
        },
        {
            name: 'pemasukan dengan nominal nol',
            row: { type: 'incoming', price: 0 },
            amount: '+ Rp0',
            color: 'text-green-700',
        },
        {
            name: 'baris tanpa jenis dan nominal',
            row: {},
            amount: '—',
            color: 'text-neutral-700',
        },
    ])('memformat $name', ({ row, amount, color }) => {
        // Jalur render memakai kedua formatter untuk teks dan warna nominal.
        expect(formatSaldoHistoryPrice(row)).toBe(amount);
        expect(getColorMoney(row.type)).toBe(color);
    });
});
