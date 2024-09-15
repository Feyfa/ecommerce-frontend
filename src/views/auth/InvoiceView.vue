<template>
  <div class="w-full pb-2">
    <h1 class="text-center text-3xl font-medium h-10 flex justify-center items-center">Daftar Invoice</h1>

    <div class="keranjang-container flex flex-col justify-start items-start px-3 py-2 gap-3">

      <h3
        ref="empty" 
        class="w-full text-center text-base font-medium hidden">
        Daftar Invoice Kamu Masih Kosong
      </h3>

      <div class="w-full flex justify-end items-center">
        <FilterView />
      </div>

      <!-- holder invoice -->
      <div class="w-full flex flex-col justify-start items-start gap-3">
        <div
          v-for="(invoice, index) in invoices"
          class="row flex flex-col items-start border border-neutral-400 bg-whie rounded shadow-xl p-2 gap-2 w-full">

          <!-- untuk barang yang di beli -->
          <div 
            v-for="(transaction, index) in invoice.transactions" 
            class="border w-full border-neutral-300 rounded flex flex-col justify-start items-start gap-1">
            <div class="flex gap-3 w-full">
              <div class="w-24 h-24 my-2 ml-2 bg-cover bg-no-repeat bg-center rounded" :style="{ backgroundImage: `url(${APP_BACKEND_BASE_URL}/${SYMLINK_FOLDER}/${transaction.p_img})` }"></div>
  
              <div class="sm:relative flex flex-col gap-1 justify-center w-full">
                <span class="text-[.7rem] font-semibold">{{ transaction.u_name }}</span>
                <div class="text-[.8rem]">
                  <span class="w-[3.8rem] inline-block">Name</span>
                  <span class="mr-2">:</span>
                  <span>{{ transaction.p_name }}</span>
                </div>
                <div class="text-[.8rem]">
                  <span class="w-[3.8rem] inline-block">Price</span>
                  <span class="mr-2">:</span>
                  <span class="font-semibold">Rp {{ transaction.p_price.toLocaleString('id-ID') }}</span>
                </div>
                <div class="text-[.8rem]">
                  <span class="w-[3.8rem] inline-block">Quantity</span>
                  <span class="mr-2">:</span>
                  <span>{{ transaction.t_total }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- untuk barang yang di beli -->

          <!-- ringkasan belanja -->
          <div class="border w-full border-neutral-300 rounded px-2">
            <div class="py-2">
              <div class="flex items-center justify-between mb-2">
                <h2 class="text-base font-semibold">Ringkasan Invoice</h2>
                <BadgeView :type="invoice.transaction_status" :text="invoice.transaction_status" />
              </div>
              <div class="mt-1 flex items-center justify-between text-[.75rem]">
                <h3>Pembayaran</h3>
                <h3 class="font-semibold">{{ invoice.payment_type }}</h3>
              </div>
              <div class="mt-1 flex items-center justify-between text-[.75rem]">
                <h3>Nomor Virtual Account</h3>
                <h3 class="font-semibold">{{ invoice.va_number }}</h3>
              </div>
              <div class="mt-1 flex items-center justify-between text-[.75rem]">
                <h3>Tanggal Transaksi</h3>
                <h3 class="font-semibold">{{ invoice.transaction_time }}</h3>
              </div>
              <div class="mt-1 flex items-center justify-between text-[.75rem]">
                <h3>Tanggal Expired</h3>
                <h3 class="font-semibold">{{ invoice.expiry_time }}</h3>
              </div>
              <div class="mt-1 flex items-center justify-between text-[.75rem]">
                <h3>Total Harga</h3>
                <h3 class="font-semibold">Rp {{ invoice.gross_amount.toLocaleString('id-ID') }}</h3>
              </div>
            </div>
          </div>
          <!-- ringkasan belanja -->

        </div>
      </div>   
      <!-- holder invoice -->

    </div>
      
  </div>
</template>

<script>
import FilterView from '@/components/partials/FilterView.vue';
import BadgeView from '@/components/partials/BadgeView.vue';

export default {
  components: {
    FilterView,
    BadgeView
  },

  data() {
    return {
      APP_BACKEND_BASE_URL: import.meta.env.VITE_APP_BACKEND_BASE_URL,
      SYMLINK_FOLDER: import.meta.env.VITE_SYMLINK_FOLDER,

      invoices: []
    }
  },

  mounted() {
    this.getInvoice();
  },

  methods: {
    getInvoice() {
      this.$store.dispatch('getInvoice', {
        user_id_buyer: this.$store.getters.user.id
      })
      .then(response => {
        this.invoices = response.data.invoices;

        if(this.invoices.length == 0) {
          this.$refs.empty.classList.remove('hidden');
          this.$refs.empty.classList.add('visible');
        }

        // console.log(response);
      })
      .catch(error => {
        // console.error(error);
      })
    }
  }
}
</script>