<template>
  <!-- Product View -->
  <div v-show="show.product_view" class="w-full text-xl">

    <div class="grid grid-rows-2 grid-cols-none sm:grid-rows-none sm:grid-cols-2 sm:items-center px-2 sm:px-4 mb-2 sm:mb-0 lg:grid-cols-3 fixed right-0 left-0 lg:left-[20.5%] xl:left-[17.1%] 2xl:left-[16.9%] top-14 bg-white sm:h-14">
      <div class="lg:col-start-2 mt-1 sm:mt-0">
        <h1 class="text-start lg:text-center text-3xl font-medium">Product Saya</h1>
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

    <h1 ref="empty" class="text-center mt-[7rem] sm:mt-16 text-base font-medium hidden">Produt Anda Kosong</h1>
    
    <div class="w-full mt-[5.5rem] sm:mt-8">
      <div v-show="show.loading_search_product" class="w-full text-center mt-28 sm:mt-16">
        <span>
          <i class="fas fa-spinner fa-pulse text-xl"></i>
        </span>
      </div>

      <div class="w-full p-2 sm:p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8 gap-x-3 gap-y-5">   
        <div v-for="product in products" class="row flex flex-col justify-between gap-2 border border-neutral-400 bg-white rounded shadow-md h-72">
          <div class="h-44 w-full bg-cover bg-no-repeat bg-center" :style="{ backgroundImage: `url(${APP_BACKEND_BASE_URL}/${SYMLINK_FOLDER}/${product.img})` }"></div>
          
          <div class="mb-1">
            <div class="px-1.5 flex flex-col">
              <h4 class="text-[.9rem] leading-6 whitespace-nowrap overflow-hidden text-ellipsis">{{ product.name }}</h4>
              <h4 class="font-semibold text-[.9rem]">Rp {{ product.price.toLocaleString('id-ID') }}</h4>
            </div>
    
            <div class="flex justify-between px-1.5">
              <div>
                <h6 class="text-[.8rem]">stock : {{ product.stock }}</h6>
              </div>
    
              <div class="flex gap-x-5">
                <svg 
                  class="w-5 cursor-pointer"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 1024 1024" 
                  @click="deleteProduct(product.id)">
                  <path fill="currentColor" d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32zm448-64v-64H416v64zM224 896h576V256H224zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32m192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32"></path>
                </svg>
      
                <svg 
                  class="w-5 cursor-pointer"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 1024 1024" 
                  @click="editProductView(product.id)">
                  <path fill="currentColor" d="M832 512a32 32 0 1 1 64 0v352a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h352a32 32 0 0 1 0 64H192v640h640z"></path>
                  <path fill="currentColor" d="m469.952 554.24 52.8-7.552L847.104 222.4a32 32 0 1 0-45.248-45.248L477.44 501.44l-7.552 52.8zm422.4-422.4a96 96 0 0 1 0 135.808l-331.84 331.84a32 32 0 0 1-18.112 9.088L436.8 623.68a32 32 0 0 1-36.224-36.224l15.104-105.6a32 32 0 0 1 9.024-18.112l331.904-331.84a96 96 0 0 1 135.744 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="fixed bottom-7 right-5 w-max border border-slate-500 p-2 rounded-md bg-blue-500 hover:bg-[#428bff] cursor-pointer" @click.stop="showAddProduct">
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
      </svg>
    </div>
  </div>
  <!-- Product View -->

  <!-- Product Add View -->
  <AddProduct :show="this.$global.modals.addProduct" @onAfterAddProduct="onAfterAddProduct" />
  <!-- Product Add View -->
  
  <!-- Product Add View -->
  <EditProduct :show="this.$global.modals.editProduct" :product-id="editProductId" @onAfterEditProduct="onAfterEditProduct" />
  <!-- Product Add View -->

  <!-- loading view -->
  <div v-show="show.loading" class="w-full text-xl h-full flex justify-center items-center">
    <span>
      <i class="fas fa-spinner fa-pulse text-4xl"></i>
    </span>
  </div>
  <!-- loading view -->

  <!-- not connected account -->
  <div v-show="show.not_connected_account && !this.$global.isConnectedAccountComplete" class="w-full text-xl">
    <div class="py-4 px-6 gap-x-10 gap-y-5 flex flex-col items-center sm:flex-row sm:items-start">
      <div class="w-[40%] sm400:w-[30%] sm500:w-[25%] sm:w-[20%] md:w-[15%] xl:w-[10%] 2xl:w-[5%]">
        <img
          class="w-64"
          :src="IntegrationImage" 
          alt="IntegrationImage">
      </div>
      <div class="w-full sm:w-[80%] md:w-[85%] xl:w-[90%] 2xl:w-[95%]">
        <p class="text-lg lg:text-xl leading-7">Jika Anda ingin bergabung sebagai penjual untuk memasarkan produk Anda melalui platform kami, kami mengundang Anda untuk membuat akun Connected di Stripe. Silakan ikuti langkah-langkah pendaftaran akun Connected di Stripe agar Anda dapat segera memulai penjualan dan meningkatkan bisnis Anda bersama kami!
          <router-link 
            to="/user#connected-account"
            class="underline text-blue-800">
            klik disini
          </router-link>
        </p>
      </div>
    </div>
  </div>
  <!-- not connected account -->


</template>

<script>
import eventBus from "@/eventBus";
import IntegrationImage from "@/assets/img/integration.png";
import ProductImage from "@/assets/img/product.png";
import { ElNotification } from "element-plus";
import Swal from "sweetalert2";
import { RouterLink } from "vue-router";
import AddProduct from "@/components/product/add.vue";
import EditProduct from "@/components/product/edit.vue"

export default {
  components: {
    AddProduct,
    EditProduct
  },

  data() {
    return {
      APP_BACKEND_BASE_URL: import.meta.env.VITE_APP_BACKEND_BASE_URL,
      SYMLINK_FOLDER: import.meta.env.VITE_SYMLINK_FOLDER,
      ProductImage: ProductImage,
      IntegrationImage: IntegrationImage,
      products: [],

      editProductId: '',
      searchProduct: '',
      
      completeProduct: false,

      show: {
        product_view: false,
        loading: false,
        loading_search_product: false,
        not_connected_account: false,
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
          
          this.getProducts();
        });
      }
    });
    /* EVENT BUS FOR SCROLL GLOBAL */

    this.show.loading = true;
    this.show.product_view = false;
    this.show.not_connected_account = false;

    this.getProducts();
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

      this.getProducts();
    },

    onAfterAddProduct(data) {
      /* CHANGE PRICE STRING TO NUMBER */
      data.price = Number(data.price);
      /* CHANGE PRICE STRING TO NUMBER */
      
      this.products = [ data, ...this.products ];

      if(this.products.length > 0 && this.$refs.empty.classList.contains('visible')) {
        this.$refs.empty.classList.remove('visible');
        this.$refs.empty.classList.add('hidden');
      }
    },
    
    onAfterEditProduct(data) {
      /* CHANGE PRICE STRING TO NUMBER */
      data.price = Number(data.price);
      /* CHANGE PRICE STRING TO NUMBER */
      
      const lengthProducts = this.products.length;

      /* DELETE PREV ITEM */
      this.products = this.products.filter(item => item.id !== data.id);
      /* DELETE PREV ITEM */

      if(this.products.length == lengthProducts - 1) {
        /* ADD NEW ITEM */
        this.products = [ data, ...this.products ];
        /* ADD NEW ITEM */
      }

    },

    showAddProduct() {
      this.$global.modals.addProduct = true;
    },

    editProductView(id) {
      this.editProductId = id;
      this.$global.modals.editProduct = true
    },

    deleteProduct(id) {
      Swal.fire({
        title: "Delete Product",
        icon: "question",
        confirmButtonText: "Yes, delete it!",
        showCancelButton: true,
        confirmButtonColor: '#dc3545'
      })
      .then(result => {
        if(result.isConfirmed) {
          this.$store.dispatch('deleteProduct', {
            user_id_seller: this.$store.getters.user.id,
            id_product: id
          })
          .then(response => {
            // console.log(response);

            if(response.data.status === 200) {
              const index = this.products.findIndex(item => item.id === id );
              this.products.splice(index, 1);

              if(this.products.length == 0) {
                this.$refs.empty.classList.add('visible');
                this.$refs.empty.classList.remove('hidden');
              }

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
        }
      })
    },

    getProducts() {
      /* GET ALL ID */
      let products_current_id = this.products.map(product => product.id);
      products_current_id = JSON.stringify(products_current_id);
      /* GET ALL ID */

      this.$store.dispatch('getProducts', {
        user_id_seller: this.$store.getters.user.id,
        products_current_id: products_current_id,
        search_product: this.searchProduct
      })
      .then(response => {
        // console.log(response);

        this.show.loading_search_product = false;
        this.show.loading = false;
        this.show.product_view = true;
        this.$global.isConnectedAccountComplete = true;

        this.$global.globalContainer.loading = false;
        if(response.data.products.length == 0) {
          this.completeProduct = true;
        }
        
        this.products = [ ...this.products, ...response.data.products ];

        // console.log({
        //   'length_products': this.products.length
        // });

        if(this.products.length == 0) {
          this.$refs.empty.classList.remove('hidden');
          this.$refs.empty.classList.add('visible');
        } else {
          this.$refs.empty.classList.remove('visible');
          this.$refs.empty.classList.add('hidden');
        }
      })
      .catch(error => {
        // console.error(error);

        this.show.loading = false;
        this.show.not_connected_account = true;

        this.$global.globalContainer.loading = false;

        if(error.response.data.status == 402) {
          this.$global.isConnectedAccountComplete = false;
        }
      })
    }
  }
}
</script>