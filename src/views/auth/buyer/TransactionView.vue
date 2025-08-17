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
                    <h4 v-if="item.invoice_status == 'pending'">Selesaikan Pembayaran Anda</h4>
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
                <div v-if="item.invoice_status != 'done' && item.transaction_status != 'done'" class="flex flex-col gap-1 my-0.5">
                    <div class="flex items-center justify-between text-[.75rem]">
                        <h3>Pembayaran</h3>
                        <h3 class="font-semibold">{{ item.payment_name }}</h3>
                    </div>
                    <div class="flex items-center justify-between text-[.75rem]">
                        <h3>Virtual Account</h3>
                        <h3 class="font-semibold">{{ item.payment_account }}</h3>
                    </div>
                    <div class="flex items-center justify-between text-[.75rem]">
                        <h3>Tanggal Expired</h3>
                        <h3 class="font-semibold">{{ item.expired_at }}</h3>
                    </div>
                </div>
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
                        <h3>Total Harga</h3>
                        <h3 class="font-semibold">Rp {{ item.total_price.toLocaleString('id-ID') }}</h3>
                    </div>
                </div>
                <!-- list invoice -->
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
                user_type: 'buyer'
            })
            .then(response => {
                // console.log(response);
                this.transactions = response.transactions;
                this.show.loading = false;
            })
            .catch(error => {
                console.error(error);
                this.show.loading = false
            })
        }
    }
}
</script>