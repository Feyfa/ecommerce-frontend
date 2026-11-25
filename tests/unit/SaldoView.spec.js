import { describe, expect, it } from 'vitest';
import SaldoView from '@/views/auth/SaldoView.vue';

const HISTORY_PRICE = 125_000;
const { formatSaldoHistoryPrice, getColorMoney } = SaldoView.methods;
const { buildWithdrawNotification, getWithdrawalStatusView } = SaldoView.methods;

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
        {
            name: 'pengembalian saldo dari penarikan gagal',
            row: { type: 'withdrawal_refund', price: HISTORY_PRICE },
            amount: '+ Rp125.000',
            color: 'text-green-700',
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

describe('Status penarikan pada riwayat saldo', () => {
    it.each([
        // Status yang dikirim backend sejak TOK-88.
        {
            status: 'processing',
            label: 'Diproses',
            info: 'Menunggu konfirmasi bank. Saldo ditahan, jangan ulangi penarikan.',
        },
        { status: 'completed', label: 'Berhasil', info: '' },
        { status: 'failed', label: 'Gagal', info: 'Saldo sudah dikembalikan.' },
    ])('menampilkan label $label untuk status $status', ({ status, label, info }) => {
        const view = getWithdrawalStatusView({ type: 'withdrawal', withdrawal_status: status });

        expect(view.label).toBe(label);
        expect(view.info).toBe(info);
    });

    it.each([
        // Penarikan lama, baris non-penarikan, dan status yang tidak dikenal tidak diberi label.
        { name: 'status null', row: { type: 'withdrawal', withdrawal_status: null } },
        { name: 'field tidak dikirim', row: { type: 'incoming' } },
        { name: 'status tidak dikenal', row: { type: 'withdrawal', withdrawal_status: 'queued' } },
    ])('tidak memberi label untuk $name', ({ row }) => {
        expect(getWithdrawalStatusView(row)).toBeNull();
    });
});

describe('Notifikasi setelah tarik saldo', () => {
    it('menyebut Diproses untuk penarikan yang menunggu bank', () => {
        // Dana belum pasti sampai, jadi notifikasi tidak boleh menyebut berhasil.
        expect(buildWithdrawNotification('processing', '100.000')).toEqual({
            type: 'info',
            title: 'Diproses',
            message: 'Penarikan Sebesar Rp100.000 Sedang Diproses',
        });
    });

    it('tetap menyebut berhasil untuk penarikan yang sudah selesai', () => {
        expect(buildWithdrawNotification('completed', '100.000')).toEqual({
            type: 'success',
            title: 'Success',
            message: 'Penarikan Sebesar Rp100.000 Berhasil',
        });
    });
});
