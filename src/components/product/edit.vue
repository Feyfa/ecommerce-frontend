<template>
    <div id="edit-product-container" class="fixed inset-0 bg-[rgba(100,100,100,.5)] z-998" v-show="show" @click="closeEditProduct">
        <div class="w-full sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[35%] 2xl:w-[30%] px-4 pb-2 flex flex-col justify-start items-center gap-4 fixed top-0 bottom-0 right-0 z-999 bg-[rgba(255,255,255,1)] shadow overflow-auto min-h-screen" v-show="show" @click.stop>
      
          <div class="w-full mt-[4.5rem] relative">            
            <h1 class="text-center text-2xl sm:text-3xl tracking-wide">Edit Product</h1>

            <span class="inline-block sm:hidden absolute top-0 bottom-0 right-0 -mt-0.5 cursor-pointer" @click="closeEditProduct">
                <i class="fa-solid fa-xmark text-3xl"></i>
            </span>
          </div>
      
          <!-- zoom img -->
          <div 
            v-if="isZoomUserImage"
            class="z-[999] fixed top-0 left-0 bottom-0 right-0 bg-[rgba(0,0,0,.7)] flex justify-center items-center cursor-zoom-out"
            @click="zoomUserImage('out')">
            <img 
              :src="ProductImage"
              alt="product"
              class="w-[95%] h-[40%] sm400:h-[45%] sm500:h-[50%] md:w-[70%] md:h-[70%] lg:w-[50%] border border-neutral-400 rounded-md shadow-xl cursor-default"
              @click.stop/>  
          </div>
          <!-- zoom img -->
      
          <div class="w-full flex flex-col items-center gap-y-3 md:gap-x-5">
            <div class="w-full">
                <div
                    class="product relative w-full h-[20rem] mx-auto border border-neutral-500 rounded shadow-md bg-cover bg-no-repeat bg-center"
                    :style="{ backgroundImage: `url(${ProductImage})` }"
                    @click="togglePreview"
                    @click.stop>
        
                    <ul 
                    class="absolute bg-white z-50 top-[90%] left-[45%] rounded transition-all duration-75 ease-in-out overflow-hidden"
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
        
                <div class="text-center">
                    <small 
                    v-if="errors.img"
                    class="text-red-500 text-[.8rem]">
                    {{ errors.img }}
                </small>
                </div>
            </div>
      
            <div class="grid items-start grid-cols-1 sm500:grid-cols-2 sm:grid-cols-1 w-full gap-y-3 sm500:gap-y-1 gap-x-5 text-xl">
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
      
              <div class="input-container flex flex-col w-full -mt-3 sm500:mt-0 sm:-mt-3">
                <!-- bantuan -->
                <label 
                  style="visibility: hidden;">
                  bantuan
                </label>
                <!-- bantuan -->
                <button 
                    class="h-12 px-2.5 border border-neutral-500 rounded shadow-lg bg-blue-500 hover:bg-[#428bff]"
                    :class="isProcessEditProduct ? 'opacity-85' : 'hover:bg-[#428bff]'"
                    :disabled="isProcessEditProduct"
                    @click="editProduct">
                    Edit
                    <i v-if="isProcessEditProduct" class="ml-1 fas fa-spinner fa-pulse"></i>
                </button>
                <!-- bantuan -->
                <small 
                  class="text-red-500 text-[.8rem]"
                  style="visibility: hidden;">
                  {{ errors.price }}
                </small>
                <!-- bantuan -->
              </div>
            </div>
          </div>
      
        </div>
    </div>
</template>

<script>
import { ElNotification } from "element-plus";
import { RouterLink } from "vue-router";

export default {
    props: {
        show: {
            type: Boolean,
            required: true
        },
        productId: {
            type: [String, Number],
            required: true
        },
    },

    data() {
        return {
            ProductImage: '',
            oldProductImage: '',

            id: '',
            name: '',
            price: '',
            stock: '',

            isProcessEditProduct: false,

            errors: {
                file: '',
                name: '',
                price: '',
                stock: '',
            },

            isZoomUserImage: false,
        }
    },

    mounted() {
        // this.getProduct();
    },

    watch: {
        show(newValue) {
            if(newValue && !isNaN(this.productId)) {
                this.getProduct();
            }

        },
    },

    methods: {
        closeEditProduct() {
            if(this.$global.modals.editProduct) {
                this.$global.modals.editProduct = false;
                
                $('#image-file').val('');
                this.name = '';
                this.price = '';
                this.stock = '';
                this.ProductImage = '';
            }
        },

        togglePreview() {
            this.$global.isCLickDropdown.product = !this.$global.isCLickDropdown.product; 
        },

        zoomUserImage(type) {
            this.isZoomUserImage = (type == 'in') ? true : false;
        },

        imageFileChange(event) {
            this.$global.isCLickDropdown.product = false;
            
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

                this.errors.file = '';
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

        getProduct() {
            this.$store.dispatch('getProduct', {
                user_id_seller: this.$store.getters.user.id,
                id_product: this.productId,
            })
            .then(response => {
                // console.log(response);

                if(!response.data.product) {
                    ElNotification({
                        type: 'error',
                        title: 'Error',
                        message: 'Product Not Valid',
                    });
                } else {
                    this.id = response.data.product.id;
                    this.oldProductImage = response.data.product.img;
                    this.ProductImage = `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${import.meta.env.VITE_SYMLINK_FOLDER}/${response.data.product.img}`;
                    this.name = response.data.product.name;
                    this.price = response.data.product.price;
                    this.stock = response.data.product.stock;
                }
            })
            .catch(error => {
                console.error(error);
            })
        },

        editProduct() {
            if(!this.name || !this.price || !this.stock)
            {
                if(!this.name)
                    this.errors.name = 'The Field Name Is Required';
                if(!this.price)
                    this.errors.price = 'The Field Price Is Required';
                if(!this.stock)
                    this.errors.stock = 'The Field Stock Is Required';
                }
            else
            {
                this.isProcessEditProduct = true;

                const form = new FormData();
                form.append('id', this.id);
                form.append('oldImg', this.oldProductImage);
                form.append('img', this.$refs.imageFile.files[0]);
                form.append('name', this.name);        
                form.append('price', this.price);        
                form.append('stock', this.stock);   
                form.append('_method', 'PUT');    

                this.$store.dispatch('editProduct', form)
                            .then(response => {
                                // console.log(response);

                                this.isProcessEditProduct = false;

                                if(response.data.status === 200) {
                                    ElNotification({
                                        type: 'success',
                                        title: 'Success',
                                        message: response.data.message
                                    });

                                    $('#image-file').val('');
                                    this.name = '' ?? response.data.product.name;
                                    this.price = '' ?? response.data.product.price;
                                    this.stock = '' ?? response.data.product.stock;
                                    this.oldProductImage = '' ?? response.data.product.img;
                                    this.ProductImage = '' ?? `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${import.meta.env.VITE_SYMLINK_FOLDER}/${response.data.product.img}`;

                                    this.$global.modals.editProduct = false;
                                    this.$emit('onAfterEditProduct', response.data.product);
                                }

                            })
                            .catch(error => {
                                console.error(error);
                                this.isProcessEditProduct = false;

                                if(error.response.data.status === 422) {
                                    const message = error.response.data.message;
                        
                                    Object.keys(message).forEach(key => {
                                        switch(key) {
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