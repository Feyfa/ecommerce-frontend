<template>
  <div class="w-full px-4 flex flex-col justify-center gap-5">

    <div class="row relative">
      <router-link 
        to="/product"
        class="absolute top-0 end-0 left-2 w-max">
        <svg 
          class="w-5 cursor-pointer"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1024 1024" >
          <path fill="currentColor" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64"></path>
          <path fill="currentColor" d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312z"></path>
        </svg>
      </router-link>
      
      <h1 class="text-center text-4xl tracking-wide">Tambah Product</h1>
    </div>

    <!-- zoom img -->
    <div 
      v-if="isZoomUserImage"
      class="z-[999] fixed top-0 left-0 bottom-0 right-0 bg-[rgba(0,0,0,.7)] flex justify-center items-center cursor-zoom-out"
      @click="zoomUserImage('out')">
      <img 
        :src="ProductImage"
        alt="product"
        width="500"
        class="border border-neutral-400 rounded-md shadow-xl cursor-default"
        @click.stop/>  
    </div>
    <!-- zoom img -->
    
    <div class="w-max mx-auto relative">
      <img 
        :src="ProductImage" 
        alt="product" 
        class="product w-[400px] h-[225px] border border-neutral-500 rounded shadow-md"
        @click="togglePreview"
        @click.stop>

      <div class="text-center">
        <small 
          v-if="errors.img"
          class="text-red-500 text-[.8rem]">
          {{ errors.img }}
        </small>
      </div>

      <ul 
        class="absolute bg-white z-50 top-52 left-[21rem] rounded transition-all duration-75 ease-in-out overflow-hidden"
        :class="this.$global.isCLickDropdown.product ? 'border border-neutral-500 h-[4.5rem] shadow-lg p-2' : 'h-0'">
        <li>
          <span 
            class="inline-block px-1 rounded h-7 w-36 leading-7 hover:bg-violet-500 cursor-pointer"
            @click="zoomUserImage('in')">
            Zoom Image
          </span>
        </li>
        <li>
          <div>
            <input
              class="top-0 left-0 right-0 bottom-0 hidden"
              type="file"
              id="image-file"
              ref="imageFile"
              name="file"
              @change="imageFileChange"/>
            <span 
              class="inline-block px-1 rounded h-7 w-36 leading-7 hover:bg-violet-500 cursor-pointer"
              @click="this.$refs.imageFile.click()">
              Upload Image
            </span>
          </div>
        </li>
      </ul>
    </div>

    <div class="grid grid-cols-3 gap-5 text-xl">
      <div class="input-container flex flex-col w-full">
        <label 
          for="name">
          name
        </label>
        <input
          placeholder="name" 
          id="name" 
          type="text" 
          class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow" 
          :class="{'border border-red-500': errors.name}"
          v-model="name"
          @input="watchInputName">
        <small 
          v-if="errors.name"
          class="text-red-500 text-[.8rem]">
          {{ errors.name }}
        </small>
      </div>
      
      <div class="input-container flex flex-col w-full">
        <label 
          for="price">
          price
        </label>
        <input
          placeholder="price" 
          id="price" 
          type="number"
          min="1" 
          class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow" 
          :class="{'border border-red-500': errors.price}"
          v-model="price"
          @input="watchInputPrice">
        <small 
          v-if="errors.price"
          class="text-red-500 text-[.8rem]">
          {{ errors.price }}
        </small>
      </div>
      
      <div class="input-container flex flex-col w-full">
        <label 
          for="stock">
          stock
        </label>
        <input
          placeholder="stock" 
          id="stock"
          type="number"
          min="1" 
          class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow" 
          :class="{'border border-red-500': errors.stock}"
          v-model="stock"
          @input="watchInputStock">
        <small 
          v-if="errors.stock"
          class="text-red-500 text-[.8rem]">
          {{ errors.stock }}
        </small>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-5">
      <button 
        class="h-12 px-2.5 border border-neutral-500 rounded shadow-lg bg-blue-500 mt-2 hover:bg-[#428bff]"
        :class="isProcessAddProduct ? 'opacity-85' : 'hover:bg-[#428bff]'"
        :disabled="isProcessAddProduct"
        @click="addProduct">
        Tambah
        <i v-if="isProcessAddProduct" class="ml-1 fas fa-spinner fa-pulse"></i>
      </button>
    </div>

  </div>
</template>

<script>
import ProductImage from "@/assets/img/product.png"
import { ElNotification } from "element-plus";
import { RouterLink } from "vue-router";

export default {
  data() {
    return {
      ProductImage: ProductImage,

      name: '',
      price: '',
      stock: '',

      isProcessAddProduct: false,

      errors: {
        file: '',
        name: '',
        price: '',
        stock: '',
      },

      isZoomUserImage: false,
    }
  },

  methods: {
    togglePreview() {
      this.$global.isCLickDropdown.product = !this.$global.isCLickDropdown.product; 
    },

    zoomUserImage(type) {
      this.isZoomUserImage = (type == 'in') ? true : false;
    },

    imageFileChange(event) {
      const file = event.target.files[0];
      // cek apakah file tipe nya image
      const extensionValid = file ? file.type.startsWith('image/') : false;
      // cek apakah file kurang dari 1mb
      const sizeValid = file ? file.size <= 1000000 : false;

      // jika file bukan image
      if(!extensionValid)
      {
        $('#image-file').val('');
        
        ElNotification({
          type: 'error',
          title: 'Error',
          message: `The foto field must be an image`
        })
      }
      // jika file di atas 1mb
      else if(!sizeValid)
      {
        $('#image-file').val('');
        
        ElNotification({
          type: 'error',
          title: 'Error',
          message: `The foto field must not be greater than 1024 kilobytes`
        })
      }
      else 
      {
        const oFReader = new FileReader();

        oFReader.readAsDataURL(file);

        oFReader.onload = (OFREvent) => {
          this.ProductImage = OFREvent.target.result;
        }

        this.errors.img = '';
      }
    },

    watchInputName() {
      if(this.name.trim() === '') {
        this.errors.name = 'The Field Name Is Required';
      } else {
        this.errors.name = '';
      }
    },

    watchInputPrice() {
      if(String(this.price).trim() === '') {
        this.errors.price = 'The Field Price Is Required';
      } else {
        this.errors.price = '';
      }
    },

    watchInputStock() {
      if(String(this.stock).trim() === '') {
        this.errors.stock = 'The Field Stock Is Required';
      } else {
        this.errors.stock = '';
      }
    },

    addProduct() {
      if(!this.$refs.imageFile.files[0] || !this.name || !this.price || !this.stock)
      {
        if(!this.$refs.imageFile.files[0])
          this.errors.img = 'The Field File Is Required';
        if(!this.name)
          this.errors.name = 'The Field Name Is Required';
        if(!this.price)
          this.errors.price = 'The Field Price Is Required';
        if(!this.stock)
          this.errors.stock = 'The Field Stock Is Required';
      }
      else
      {
        this.isProcessAddProduct = true;

        const form = new FormData();
        form.append('user_id_seller', this.$store.getters.user.id);
        form.append('img', this.$refs.imageFile.files[0]);
        form.append('name', this.name);        
        form.append('price', this.price);        
        form.append('stock', this.stock);        

        this.$store.dispatch('addProduct', form)
                   .then(response => {
                    // console.log(response);

                    this.isProcessAddProduct = false;

                    if(response.data.status === 200) {
                      ElNotification({
                        type: 'success',
                        title: 'Success',
                        message: response.data.message
                      });

                      $('#image-file').val('');
                      this.name = '';
                      this.price = '';
                      this.stock = '';
                      this.ProductImage = ProductImage;
                    }

                   })
                   .catch(error => {
                    // console.error(error);
                    this.isProcessAddProduct = false;

                    if(error.response.data.status === 422) {
                      const message = error.response.data.message;
            
                      Object.keys(message).forEach(key => {
                        switch(key) {
                          case 'img' : 
                            this.errors.img = message[key][0];
                            break;
                          case 'name' : 
                            this.errors.name = message[key][0];
                            break;
                          case 'price' : 
                            this.errors.price = message[key][0];
                            break;
                          case 'stock' : 
                            this.errors.stock = message[key][0];
                            break;
                        }
                      })
                    }
                   })
      }
    }
  }
}
</script>