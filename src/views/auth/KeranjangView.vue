<template>
  <div class="w-full">
    <h1 class="text-center text-3xl font-medium h-10 flex justify-center items-center">Daftar Keranjang</h1>

    <div class="keranjang-container flex justify-start items-start px-3 py-2 gap-5">

      <div class="w-[70%] h-screen-minus-banyak overflow-auto flex flex-col gap-3">         
        <!-- <h v-if="keranjangs.length === 0" class="w-full text-center text-xl font-medium">Barang Belanjaan Kamu Masih Kosong Nih</h> -->
        
        <div
          v-for="keranjang in keranjangs" 
          class="row flex items-start border border-neutral-400 bg-white rounded shadow-md p-2 gap-2 relative">
          <div>
            <input
              @change="checkedKeranjang($event, keranjang.p_id)" 
              :checked="keranjang.k_checked != 0 ? true : false"
              type="checkbox" 
              class="w-5 h-5">
          </div>
          <div class="flex flex-col justify-start items-start gap-1">
            <div class="flex gap-2">
              <img 
                :src="`http://ecommerce.backend.com/storage/${keranjang.p_img}`" 
                alt="keranjang" 
                class="w-[25%] rounded-sm shadow-md bg-white">

              <div class=" flex flex-col gap-1">
                <span class="text-sm font-semibold">{{ keranjang.u_seller_name }}</span>
                <div>
                  <span class="w-14 inline-block">Name</span>
                  <span class="mr-2">:</span>
                  <span>{{ keranjang.p_name }}</span>
                </div>
                <div>
                  <span class="w-14 inline-block">Price</span>
                  <span class="mr-2">:</span>
                  <span class="font-semibold">Rp {{ keranjang.p_price.toLocaleString('id-ID') }}</span>
                </div>
                <div>
                  <span class="w-14 inline-block">Stock</span>
                  <span class="mr-2">:</span>
                  <span>{{ keranjang.p_stock }}</span>
                </div>
                <div class="mt-1">
                  <svg 
                    @click="deleteKeranjang(keranjang.p_id)"
                    xmlns="http://www.w3.org/2000/svg" 
                    width="22" 
                    height="22" 
                    fill="currentColor" 
                    class="bi bi-trash cursor-pointer" 
                    viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                  </svg>
                </div>
                <div class="total-keranjang-container border border-zinc-300 absolute bottom-2 right-2 py-0.5 px-1 rounded">
                  <span>
                    <i class="bi bi-dash-lg mr-2.5 cursor-pointer"></i>
                  </span>
                  <input
                    v-model="keranjang.k_total"  
                    class="input-keranjang text-center w-10 outline-none text-sm" 
                    readonly 
                    type="number" 
                    min="1" >
                  <span>
                    <i class="bi bi-plus-lg cursor-pointer"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="w-[30%] border border-neutral-400 bg-white rounded shadow-md px-2">
        <div class="border-b border-b-neutral-300 py-2">
          <h2 class="text-lg font-semibold">Ringkasan Belanja</h2>
          <div class="mt-1 flex items-center justify-between">
            <h3>Total</h3>
            <h3 class="font-semibold">Rp {{ totalPrice.toLocaleString('id-ID') }}</h3>
          </div>
        </div>
        <div class="border-b border-b-neutral-300 py-2">
          <button type="button" class="w-full border border-neutral-300 rounded-md bg-blue-500 py-1.5 text-white font-medium">Bayar</button>
        </div>
      </div>

    </div>
      
  </div>
</template>

<script>
export default {
  data() {
    return {
      keranjangs: [],
      totalPrice: ''
    }
  },

  mounted() {
    this.getKeranjang();
  },

  methods: {
    deleteKeranjang(product_id) {
      this.$store.dispatch('deleteKeranjang', {
        user_id_buyer: this.$store.getters.user.id,
        product_id
      })
      .then(response => {
        // console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;
      })
      .catch(error => {
        // console.error(error);
      })
    },

    getKeranjang() {
      this.$store.dispatch('getKeranjang', {
        user_id_buyer: this.$store.getters.user.id
      })
      .then(response => {
        // console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;
      })
      .catch(error => {
        // console.error(error);
      })
    },

    checkedKeranjang(event, product_id) {
      this.$store.dispatch('checkedKeranjang', {
        user_id_buyer: this.$store.getters.user.id,
        checked: event.target.checked,
        product_id      
      })
      .then(response => {
        // console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;
      })
      .catch(error => {
        // console.error(error);
      })
    }
  }
}
</script>