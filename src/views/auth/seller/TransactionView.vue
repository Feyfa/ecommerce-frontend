<template>
    <!-- transaction view -->
    <div v-show="!show.loading">
        <h1 class="text-3xl text-center font-medium">Daftar Transaksi</h1>

        <!-- list -->
        <div class="flex flex-col justify-center items-center w-full p-4 lg:px-6 gap-5">
            <h3 v-if="transactions.length == 0" class="w-full text-center text-lg mt-5 font-medium">Daftar Transaksi Kamu Masih Kosong Nih</h3>
            
            <div v-for="(item, index) in transactions" class="flex flex-col p-3 gap-3 border border-neutral-500 w-full rounded shadow">
                <!-- approved seller or buyer -->
                <div v-if="item.invoice_status == 'pending' || item.transaction_status == 'approved_seller'" class="mb-2 flex items-center gap-3 text-[1rem] font-semibold">
                    <h4 v-if="item.invoice_status == 'pending'">Menunggu Pembeli Menyelesaikan Pembayaran</h4>
                    <h4 v-else>Menunggu Persetujuan Penjual</h4>
                    <i class="fas fa-clock text-yellow-500 text-[.9rem]"></i>
                </div>
                <!-- approved seller or buyer -->

                <!-- title -->
                <div class="flex justify-between items-center">
                    <span class="text-[.9rem] font-semibold">{{ item.buyer_name }}</span>
                    <BadgeView v-if="item.invoice_status == 'done' && item.transaction_status == 'done'" color="green" text="selesai" />
                </div>
                <!-- title -->

                <!-- list product -->
                <div v-for="(item2, index2) in item.products" class="flex gap-3 w-full border border-neutral-400 p-2 rounded">
                    <div class="w-24 h-24 bg-cover bg-no-repeat bg-center rounded" :style="{ backgroundImage: `url(${APP_BACKEND_BASE_URL}/${SYMLINK_FOLDER}/${item2.img})` }"></div>
    
                    <div class="sm:relative flex flex-col gap-1 w-full">
                        <div class="text-[.8rem]">
                            <span class="w-[3.3rem] inline-block">Name</span>
                            <span class="mr-2">:</span>
                            <span>{{ item2.name }}</span>
                        </div>
                        <div class="text-[.8rem]">
                            <span class="w-[3.3rem] inline-block">Price</span>
                            <span class="mr-2">:</span>
                            <span class="font-semibold">Rp {{ item2.price.toLocaleString('id-ID') }}</span>
                        </div>
                        <div class="text-[.8rem]">
                            <span class="w-[3.3rem] inline-block">Total</span>
                            <span class="mr-2">:</span>
                            <span>{{ item2.total }}</span>
                        </div>
                    </div>
                </div>
                <!-- list product -->

                <!-- list invoice -->
                <div class="flex flex-col gap-1">
                    <div class="flex items-center justify-between text-[.75rem]">
                        <h3>Invoice Number</h3>
                        <h3 class="font-semibold">{{ item.transaction_number }}</h3>
                    </div>
                    <div class="flex items-center justify-between text-[.75rem]">
                        <h3>Catatan</h3>
                        <h3 class="font-semibold">{{ item.noted }}</h3>
                    </div>
                    <div class="flex items-center justify-between text-[.75rem]">
                        <h3>Tanggal Transaksi</h3>
                        <h3 class="font-semibold">{{ item.transaction_date }}</h3>
                    </div>
                    <div class="flex items-center justify-between text-[.75rem]">
                        <h3>Pengiriman</h3>
                        <h3 class="font-semibold">{{ item.kurir_type }}</h3>
                    </div>
                    <div class="flex items-center justify-between text-[.75rem]">
                        <h3>Estimasi Pengiriman</h3>
                        <h3 class="font-semibold">{{ item.kurir_estimate }}</h3>
                    </div>
                    <div class="flex items-center justify-between text-[.75rem]">
                        <h3>Harga Pengiriman</h3>
                        <h3 class="font-semibold">Rp {{ item.kurir_price.toLocaleString('id-ID') }}</h3>
                    </div>
                    <div class="flex items-center justify-between text-[.75rem]">
                        <h3>Harga Barang</h3>
                        <h3 class="font-semibold">Rp {{ item.product_price.toLocaleString('id-ID') }}</h3>
                    </div>
                    <div class="flex items-center justify-between text-[.75rem]">
                        <h3>Total Pendapatan</h3>
                        <h3 class="font-semibold">Rp {{ item.product_price.toLocaleString('id-ID') }}</h3>
                    </div>
                </div>
                <!-- list invoice -->

                <!-- button persetujuan -->
                <div v-if="item.invoice_status == 'done' && item.transaction_status == 'approved_seller'" class="w-full flex justify-end">
                    <button 
                        class=" text-[.7rem] border border-neutral-500 bg-violet-500 py-1.5 px-10 sm500:text-[.8rem] sm:text-[.9rem] rounded" 
                        @click="approvedTransaction(index, item.id)"
                        :disabled="isSellerApprovedTransaction[index]"
                        :class="{'opacity-50': isSellerApprovedTransaction[index]}">
                        Setuju
                        <i v-if="isSellerApprovedTransaction[index]" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
                    </button>
                </div>
                <!-- button persetujuan -->
            </div>
        </div>
        <!-- list -->
    </div>
    <!-- transaction view -->

    <!-- loading view -->
     <div v-show="show.loading" class="w-full text-xl h-full flex justify-center items-center">
        <i class="fas fa-spinner fa-pulse text-4xl"></i>
    </div>
    <!-- loading view -->
</template>

<script>
import BadgeView from '@/components/partials/BadgeView.vue';
import { ElMessageBox, ElNotification } from 'element-plus';

export default {
    components: {
        BadgeView,
    },

    data() {
        return {
            APP_BACKEND_BASE_URL: import.meta.env.VITE_APP_BACKEND_BASE_URL,
            SYMLINK_FOLDER: import.meta.env.VITE_SYMLINK_FOLDER,

            show: {
                loading: false,
            },

            isSellerApprovedTransaction: [],

            transactions: []
        }
    },

    mounted() {
        this.show.loading = true;
        this.getTransactions();
    },

    methods: {
        getTransactions() {
            this
            .$store
            .dispatch('getTransactions', {
                user_type: 'seller'
            })
            .then(response => {
                // console.log(response);
                this.transactions = response.transactions;
                this.isSellerApprovedTransaction = Array(this.transactions.length).fill(false);
                this.show.loading = false;
            })
            .catch(error => {
                console.error(error);
                this.show.loading = false
            })
        },

        approvedTransaction(index, transaction_user_id) {
            ElMessageBox.confirm('Yakin Ingin Menyetujui Transaksi Ini ?', 'Persetujuan', {
                confirmButtonText: 'Setuju',
                cancelButtonText: 'Cancel',
                callback: (action) => {
                    if(action == 'confirm') {
                        this.isSellerApprovedTransaction[index] = true;
                        this
                        .$store
                        .dispatch('approvedTransaction', {
                            transaction_user_id: transaction_user_id,
                            user_type: this.$store.getters.user.account_type
                        })
                        .then(response => {
                            // console.log(response);
                            this.isSellerApprovedTransaction[index] = false;
                            this.transactions = response.transactions;
                            ElNotification({ type: 'success', title: 'Success', message: 'Persetujuan Transaksi Berhasil, Uang Sudah Masuk Ke Saldo Anda' });
                        })
                        .catch(error => {
                            console.error(error);
                            this.isSellerApprovedTransaction[index] = false;
                            const message = typeof(error.response.data.message) ? error.response.data.message : 'Ups Sepertinya Ada Yang Salah';
                            ElNotification({ type: 'error', title: 'Error', message: message });
                        });
                    }
                },
            });
        }
    }
}
</script>