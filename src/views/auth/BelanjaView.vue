<template>
  <div class="w-full text-xl">
    <h1 class="text-center text-3xl font-medium">Barang Belanja</h1>

    <h1 v-if="products.length === 0" class="text-center mt-10">Barang Belanja Kosong</h1>
    
    <div class="w-full p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-3 gap-y-5">   
      <div v-for="product in products" class="row flex flex-col justify-end gap-2 border border-neutral-500 bg-white rounded shadow-md">
        <img 
          :src="`http://ecommerce.backend.com/storage/${product.p_img}`"
          alt="product" 
          class="w-full h-max rounded-sm shadow-md bg-white">
        
        <div class="px-1.5 flex flex-col gap-1">
          <h4 class="font-semibold text-[.75rem]">{{ product.u_name }}</h4>
          <h4 class="text-[1rem] leading-6">{{ product.p_name }}</h4>
          <h4 class="font-semibold text-[1rem]">Rp {{ product.p_price.toLocaleString('id-ID') }}</h4>
        </div>

        <div class="flex justify-between px-1.5 py-1">
          <div>
            <h6 class="text-[.8rem]">stock : {{ product.p_stock }}</h6>
          </div>

          <div class="flex gap-x-5">
            <svg 
              class="w-5 cursor-pointer"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 1024 1024"
              @click="addKeranjang(product.p_id, product.u_id)" >
              <path fill="currentColor" d="M432 928a48 48 0 1 1 0-96 48 48 0 0 1 0 96m320 0a48 48 0 1 1 0-96 48 48 0 0 1 0 96M96 128a32 32 0 0 1 0-64h160a32 32 0 0 1 31.36 25.728L320.64 256H928a32 32 0 0 1 31.296 38.72l-96 448A32 32 0 0 1 832 768H384a32 32 0 0 1-31.36-25.728L229.76 128zm314.24 576h395.904l82.304-384H333.44l76.8 384z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ElNotification } from 'element-plus';


export default {
  data() {
    return {
      products: []
    }
  },

  mounted() {
    this.getBelanja();
  },

  methods: {
    addKeranjang(product_id, user_id_seller) {
      this.$store.dispatch('addKeranjang', {
        user_id_buyer: this.$store.getters.user.id,
        user_id_seller,
        product_id
      })
      .then(response => {
        // console.log(response);

        if(response.data.status === 200) {
          ElNotification({
            type: 'success',
            title: 'Success',
            message: response.data.message
          });
        }
      })
      .catch(error => {
        console.error(error);
      })
    },

    getBelanja() {
      this.$store.dispatch('getBelanja', {
        user_id_seller: this.$store.getters.user.id
      })
      .then(response => {
        // console.log(response);

        if(response.data.status === 200) {
          this.products = response.data.products;
        }
      })
      .catch(error => {
        console.error(error);
      })
    }
  }
}
</script>