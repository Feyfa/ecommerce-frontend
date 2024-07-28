<template>
  <div class="w-full text-xl">
    <h1 class="text-center text-3xl font-medium">Product Saya</h1>

    <h1 v-if="products.length === 0" class="text-center mt-10">Produt Anda Kosong</h1>
    
    <div class="w-full p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-3 gap-y-5">   
      <div v-for="product in products" class="row flex flex-col justify-end gap-2 border border-neutral-500 bg-white rounded shadow-md">
        <img 
          :src="`http://ecommerce.backend.com/storage/${product.img}`"
          alt="product" 
          class="w-full h-max rounded-sm shadow-md bg-white">
        
        <div class="px-1.5 flex flex-col gap-1">
          <h4 class="text-[1rem] leading-6">{{ product.name }}</h4>
          <h4 class="font-semibold text-[1rem]">Rp {{ product.price.toLocaleString('id-ID') }}</h4>
        </div>

        <div class="flex justify-between px-1.5 py-1">
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

    <router-link 
      to="/product/add"
      class="fixed bottom-7 right-5 w-max border border-slate-500 p-2 rounded-md bg-blue-500 hover:bg-[#428bff] cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
      </svg>
    </router-link>
  </div>
</template>

<script>
import ProductImage from "@/assets/img/product.png";
import { ElNotification } from "element-plus";
import Swal from "sweetalert2";
import { RouterLink } from "vue-router";

export default {
  data() {
    return {
      ProductImage: ProductImage,
      products: [],
    }
  },

  mounted() {
    this.getProducts();
  },

  methods: {
    editProductView(id) {
      this.$router.push(`/product/edit?id=${id}`);
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
            console.log(response);

            if(response.data.status === 200) {
              this.products = response.data.products;

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
      this.$store.dispatch('getProducts', {
        user_id_seller: this.$store.getters.user.id
      })
      .then(response => {
        // console.log(response);
        
        this.products = response.data.products;
      })
      .catch(error => {
        // console.error(error);
      })
    }
  }
}
</script>