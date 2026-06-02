<template>
  <!-- Product View -->
  <div v-show="show.product_view" class="min-h-full w-full bg-slate-50 text-xl">

    <div
      class="sticky top-0 z-[2] px-4 pt-4 transition-all duration-200 lg:px-6"
      :class="{
        'border-b border-slate-200 bg-slate-50/95 pb-3 shadow-sm backdrop-blur': productHeaderStuck,
        'bg-slate-50': !productHeaderStuck,
      }">
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-3xl font-medium text-slate-950">Product Saya</h1>

        <button
          type="button"
          class="hidden h-11 shrink-0 items-center gap-2 rounded-md border border-violet-500 bg-violet-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600 active:scale-95 sm:inline-flex"
          @click.stop="showAddProduct">
          <i class="fa-solid fa-plus text-sm"></i>
          Tambah Produk
        </button>
      </div>

      <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          placeholder="Search produk"
          id="search-product"
          type="text"
          class="h-11 w-full rounded-md border border-slate-300 px-3 text-base text-slate-900 outline-none shadow-sm placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 sm:max-w-md"
          v-model="searchProduct"
          @input="onSearchProductInput"
          @keyup.enter="enterSearchProduct">

        <button
          type="button"
          class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-violet-500 bg-violet-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600 active:scale-95 sm:hidden"
          @click.stop="showAddProduct">
          <i class="fa-solid fa-plus text-sm"></i>
          Tambah Produk
        </button>
      </div>
    </div>

    <div class="w-full bg-slate-50">
      <div v-show="show.loading_search_product" class="w-full text-center mt-28 sm:mt-16">
        <span>
          <i class="fas fa-spinner fa-pulse text-xl"></i>
        </span>
      </div>

      <div
        v-if="!show.loading_search_product && products.length === 0"
        class="px-3 py-6 sm:p-6">
        <div class="mx-auto flex min-h-[18rem] max-w-xl flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600">
            <i
              class="text-xl"
              :class="activeSearchProduct.length > 0 ? 'fa-solid fa-magnifying-glass' : 'fa-solid fa-box-open'"></i>
          </div>

          <h2 class="mt-4 text-lg font-semibold text-slate-950">
            {{ activeSearchProduct.length > 0 ? 'Produk tidak ditemukan' : 'Produk Anda kosong' }}
          </h2>

          <p class="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {{ activeSearchProduct.length > 0 ? 'Coba gunakan kata kunci lain atau hapus pencarian.' : 'Tambahkan produk pertama agar mulai tampil di daftar produk.' }}
          </p>

          <button
            v-if="activeSearchProduct.length === 0"
            type="button"
            class="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-violet-500 bg-violet-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600 active:scale-95"
            @click.stop="showAddProduct">
            <i class="fa-solid fa-plus text-sm"></i>
            Tambah Produk
          </button>
        </div>
      </div>

      <div class="grid w-full grid-cols-2 gap-x-4 gap-y-5 p-4 sm:grid-cols-3 sm:p-5 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-6 lg:p-6 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8">
        <div v-for="product in products" :key="product.id" class="row group flex h-72 flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
          <div class="relative flex h-44 w-full items-center justify-center bg-white px-3 py-2">
            <img
              class="h-full w-full object-contain"
              :src="`${APP_BACKEND_BASE_URL}/${SYMLINK_FOLDER}/${product.img}`"
              :alt="product.name">

            <!-- WHEN STOCK 0 -->
            <div
              class="absolute inset-0 bg-slate-950/35 z-[1] flex justify-center items-start"
              v-if="product.stock < 1">
              <img
                class="w-40 mt-10"
                :src="SoldOutImage" 
                alt="SoldOutImage">
            </div>
            <!-- WHEN STOCK 0 -->
          </div>

          <div class="flex flex-1 flex-col justify-between p-3">
            <div class="flex flex-col">
              <h4 class="truncate text-sm font-medium leading-5 text-slate-900">{{ product.name }}</h4>
              <h4 class="mt-1 text-sm font-semibold text-slate-950">{{ formatRupiah(product.price) }}</h4>
            </div>
    
            <div class="mt-3 flex items-center justify-between gap-2">
              <span
                class="inline-flex h-7 max-w-[6rem] items-center rounded-full px-2.5 text-xs font-medium"
                :class="product.stock < 1 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'">
                Stok: {{ product.stock }}
              </span>
    
              <div class="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Hapus produk"
                  title="Hapus produk"
                  @click="deleteProduct(product.id)">
                  <svg
                  class="w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1024 1024">
                  <path fill="currentColor" d="M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32zm448-64v-64H416v64zM224 896h576V256H224zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32m192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32"></path>
                  </svg>
                </button>

                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-violet-50 hover:text-violet-600"
                  aria-label="Edit produk"
                  title="Edit produk"
                  @click="editProductView(product.id)">
                  <svg
                  class="w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1024 1024">
                  <path fill="currentColor" d="M832 512a32 32 0 1 1 64 0v352a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h352a32 32 0 0 1 0 64H192v640h640z"></path>
                  <path fill="currentColor" d="m469.952 554.24 52.8-7.552L847.104 222.4a32 32 0 1 0-45.248-45.248L477.44 501.44l-7.552 52.8zm422.4-422.4a96 96 0 0 1 0 135.808l-331.84 331.84a32 32 0 0 1-18.112 9.088L436.8 623.68a32 32 0 0 1-36.224-36.224l15.104-105.6a32 32 0 0 1 9.024-18.112l331.904-331.84a96 96 0 0 1 135.744 0z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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
</template>

<script>
import eventBus from "@/eventBus";
import { ElNotification } from "element-plus";
import Swal from "sweetalert2";
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
      SoldOutImage: '/img/sold-out.png',
      products: [],

      editProductId: '',
      searchProduct: '',
      activeSearchProduct: '',
      productRequestVersion: 0,
      productHeaderStuck: false,
      
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
      this.productHeaderStuck = globalContainer.scrollTop > 8;

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
      this.activeSearchProduct = this.searchProduct.trim();
      this.show.loading_search_product = true;
      this.completeProduct = false;
      this.products = [];

      this.getProducts();
    },

    onSearchProductInput() {
      if(this.searchProduct.trim().length > 0 || this.activeSearchProduct.length === 0) {
        return;
      }

      this.activeSearchProduct = '';
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

    formatRupiah(value) {
      const price = Number(value);

      if(!Number.isFinite(price)) {
        return 'Rp 0';
      }

      return `Rp ${price.toLocaleString('id-ID')}`;
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
                this.completeProduct = true;
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
      const requestVersion = ++this.productRequestVersion;
      const requestSearchProduct = this.activeSearchProduct;

      /* GET ALL ID */
      let products_current_id = this.products.map(product => product.id);
      products_current_id = JSON.stringify(products_current_id);
      /* GET ALL ID */

      this.$store.dispatch('getProducts', {
        user_id_seller: this.$store.getters.user.id,
        products_current_id: products_current_id,
        search_product: requestSearchProduct
      })
      .then(response => {
        // console.log(response);

        if(requestVersion !== this.productRequestVersion) {
          return;
        }

        this.show.loading_search_product = false;
        this.show.loading = false;
        this.show.product_view = true;

        this.$global.globalContainer.loading = false;
        if(response.data.products.length == 0) {
          this.completeProduct = true;
        }
        
        this.products = [ ...this.products, ...response.data.products ];

        // console.log({
        //   'length_products': this.products.length
        // });

      })
      .catch(error => {
        // console.error(error);

        if(requestVersion !== this.productRequestVersion) {
          return;
        }

        this.show.loading = false;
        this.show.not_connected_account = true;
        this.$global.globalContainer.loading = false;
      })
    }
  }
}
</script>
