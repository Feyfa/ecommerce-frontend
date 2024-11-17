<template>
  <!-- belanja view -->
  <div v-show="show.belanja_view" class="w-full text-xl">
    <div class="grid grid-rows-2 grid-cols-none sm:grid-rows-none sm:grid-cols-2 sm:items-center px-2 sm:px-4 mb-2 sm:mb-0 lg:grid-cols-3 fixed right-0 left-0 lg:left-[20.5%] xl:left-[17.1%] 2xl:left-[16.9%] top-14 bg-white sm:h-14">
      <div class="lg:col-start-2 mt-1 sm:mt-0">
        <h1 class="text-start lg:text-center text-3xl font-medium">Barang Belanja</h1>
      </div>
      <div class="lg:col-start-3 text-end">
        <input
          placeholder="Search" 
          id="search-product" 
          type="text" 
          class="border w-full sm:w-[80%] md:w-[70%] lg:w-[90%] xl:w-[80%] 2xl:w-[70%] border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
          v-model="searchProduct"
          @keyup.enter="enterSearchProduct">
      </div>
    </div>

    <h1 ref="empty" class="text-center mt-[7rem] sm:mt-16 text-base font-medium hidden">Product Kosong</h1>
    
    <div class="w-full mt-[5.5rem] sm:mt-8">
      <div v-show="show.loading_search_product" class="w-full text-center mt-28 sm:mt-16">
        <span>
          <i class="fas fa-spinner fa-pulse text-xl"></i>
        </span>
      </div>

      <div class="w-full p-2 sm:p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8 gap-x-3 gap-y-5">   
        <div v-for="product in products" class="row flex flex-col justify-between gap-2 border border-neutral-400 bg-white rounded shadow-md h-72">
          <div class="h-44 border w-full bg-cover bg-no-repeat bg-center" :style="{ backgroundImage: `url(${APP_BACKEND_BASE_URL}/${SYMLINK_FOLDER}/${product.p_img})` }"></div>
  
          <div class="mb-1">
            <div class="px-1.5 flex flex-col">
              <h4 class="font-semibold text-[.8rem]">{{ product.u_name }}</h4>
              <h4 class="text-[.9rem] leading-6 whitespace-nowrap overflow-hidden text-ellipsis">{{ product.p_name }}</h4>
              <h4 class="font-semibold text-[.9rem]">Rp {{ product.p_price.toLocaleString('id-ID') }}</h4>
            </div>
    
            <div class="flex justify-between px-1.5">
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
    </div>
  </div>
  <!-- belanja view -->

  <!-- loading view -->
  <div v-show="show.loading" class="w-full text-xl h-full flex justify-center items-center">
    <span>
      <i class="fas fa-spinner fa-pulse text-4xl"></i>
    </span>
  </div>
  <!-- loading view -->
</template>

<script>
import eventBus from "@/eventBus";
import { ElNotification } from 'element-plus';


export default {
  data() {
    return {
      APP_BACKEND_BASE_URL: import.meta.env.VITE_APP_BACKEND_BASE_URL,
      SYMLINK_FOLDER: import.meta.env.VITE_SYMLINK_FOLDER,
      products: [],

      searchProduct: '',
      completeProduct: false,

      show: {
        belanja_view: false,
        loading: false,
        loading_search_product: false,
      }
    }
  },

  mounted() {
    /* EVENT BUS FOR SCROLL GLOBAL */
    eventBus.on('scrollGlobal', () => {
      const globalContainer = this.$global.globalContainer.ref;
      const tolerant = 2;

      // console.log({
      //   'scrollTop': globalContainer.scrollTop,
      //   'clientHeight': globalContainer.clientHeight,
      //   'scrollHeight': globalContainer.scrollHeight,
      //   'total_ceil': Math.ceil(globalContainer.scrollTop + globalContainer.clientHeight),
      //   'tolerant': tolerant,
      //   'this.$global.globalContainer.loading': this.$global.globalContainer.loading,
      //   'this.completeProduct': this.completeProduct
      // });

      if ((Math.ceil(globalContainer.scrollTop + globalContainer.clientHeight) >= globalContainer.scrollHeight - tolerant) && (!this.$global.globalContainer.loading) && (!this.completeProduct) && (this.products.length > 0)) {
        this.$global.globalContainer.loading = true;

        this.$nextTick(() => {
          globalContainer.scrollTop = globalContainer.scrollHeight;
          
          this.getBelanja();
        });
      }
    });
    /* EVENT BUS FOR SCROLL GLOBAL */

    this.show.belanja_view = false;
    this.show.loading = true;

    this.getBelanja();
  },

  beforeUnmount() {
    eventBus.off('scrollGlobal');
  },

  methods: {
    enterSearchProduct() {
      this.$refs.empty.classList.remove('visible');
      this.$refs.empty.classList.add('hidden');

      this.show.loading_search_product = true;
      this.completeProduct = false;
      this.products = [];

      this.getBelanja();
    },

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

        if(error.response.data.status == 422) {
          const message = error.response.data.message;
          
          Object.keys(message).forEach(key => {
            switch(key) {
              case 'stock_maximum' : 
                ElNotification({
                  type: 'error',
                  title: 'Error',
                  message: message[key][0]
                })   
                break;
            }
          });
        }
      })
    },

    getBelanja() {
      /* GET ALL ID */
      let products_current_id = this.products.map(product => product.p_id);
      products_current_id = JSON.stringify(products_current_id);
      /* GET ALL ID */

      this.$store.dispatch('getBelanja', {
        user_id_seller: this.$store.getters.user.id,
        products_current_id: products_current_id,
        search_product: this.searchProduct
      })
      .then(response => {
        // console.log(response);

        this.show.loading_search_product = false
        this.show.belanja_view = true;
        this.show.loading = false;

        this.$global.globalContainer.loading = false;
        if(response.data.products.length == 0) {
          this.completeProduct = true;
        }

        this.products = [ ...this.products, ...response.data.products ];

        if(this.products.length == 0) {
          this.$refs.empty.classList.remove('hidden');
          this.$refs.empty.classList.add('visible');
        } else {
          this.$refs.empty.classList.remove('visible');
          this.$refs.empty.classList.add('hidden');
        }
      })
      .catch(error => {
        console.error(error);
      
        this.show.belanja_view = true;
        this.show.loading = false;
      
      })
    }
  }
}
</script>