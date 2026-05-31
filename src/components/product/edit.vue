<template>
    <div id="edit-product-container" class="fixed inset-0 z-[9] bg-slate-950/50" v-show="show" @click="closeEditProduct">
        <div class="fixed bottom-0 right-0 top-14 flex w-full flex-col bg-white shadow-2xl sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[35%] 2xl:w-[30%]" v-show="show" @click.stop>
            <div class="border-b border-slate-200 px-5 py-4">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h1 class="text-xl font-semibold text-slate-900 sm:text-2xl">Edit Produk</h1>
                        <p class="mt-1 text-sm text-slate-500">Update foto dan informasi produk.</p>
                    </div>

                    <button
                        type="button"
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        aria-label="Tutup edit produk"
                        @click="closeEditProduct">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            <!-- zoom img -->
            <el-image-viewer
                v-if="isZoomUserImage"
                :url-list="[ProductImage]"
                :initial-index="0"
                :min-scale="0.2"
                :max-scale="7"
                :zoom-rate="1.2"
                :z-index="9999"
                teleported
                @close="zoomUserImage('out')" />
            <!-- zoom img -->

            <div class="flex-1 overflow-y-auto px-5 py-5">
                <div v-if="isProcessGetProduct" class="flex min-h-[24rem] flex-col items-center justify-center gap-3 text-slate-500">
                    <i class="fas fa-spinner fa-pulse text-2xl text-violet-500"></i>
                    <span class="text-sm font-medium">Memuat data produk...</span>
                </div>

                <div v-else class="space-y-5">
                    <div>
                        <div
                            class="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-slate-200 bg-slate-100 bg-cover bg-center shadow-sm"
                            :style="{ backgroundImage: `url(${ProductImage})` }">
                            <div class="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-t from-slate-950/80 to-transparent p-3">
                                <input
                                    class="hidden"
                                    type="file"
                                    id="edit-product-image-file"
                                    ref="imageFile"
                                    name="file"
                                    accept="image/*"
                                    @change="imageFileChange"/>

                                <button
                                    type="button"
                                    class="inline-flex h-9 items-center gap-2 rounded-md bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
                                    @click="this.$refs.imageFile.click()">
                                    <i class="fa-solid fa-upload text-xs"></i>
                                    Upload
                                </button>

                                <button
                                    type="button"
                                    class="inline-flex h-9 items-center gap-2 rounded-md bg-white/90 px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
                                    @click="zoomUserImage('in')">
                                    <i class="fa-solid fa-magnifying-glass-plus text-xs"></i>
                                    Zoom
                                </button>
                            </div>
                        </div>

                        <small
                            v-if="errors.img"
                            class="mt-2 block text-sm text-red-500">
                            {{ errors.img }}
                        </small>
                    </div>

                    <div class="space-y-4">
                        <div class="input-container flex flex-col gap-y-1.5">
                            <label
                                for="edit-product-name"
                                class="text-sm font-medium text-slate-700">
                                Nama Produk
                            </label>
                            <input
                                placeholder="Contoh: Baju Hitam"
                                id="edit-product-name"
                                type="text"
                                class="h-11 w-full rounded-md border border-slate-300 px-3 text-base text-slate-900 outline-none shadow-sm placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                :class="{'border-red-500 focus:border-red-500 focus:ring-red-100': errors.name}"
                                v-model="name"
                                @input="watchInputName">
                            <small
                                v-if="errors.name"
                                class="text-sm text-red-500">
                                {{ errors.name }}
                            </small>
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm500:grid-cols-2 sm:grid-cols-1">
                            <div class="input-container flex flex-col gap-y-1.5">
                                <label
                                    for="edit-product-price"
                                    class="text-sm font-medium text-slate-700">
                                    Harga
                                </label>
                                <input
                                    placeholder="50000"
                                    id="edit-product-price"
                                    type="number"
                                    min="1"
                                    class="h-11 w-full rounded-md border border-slate-300 px-3 text-base text-slate-900 outline-none shadow-sm placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                    :class="{'border-red-500 focus:border-red-500 focus:ring-red-100': errors.price}"
                                    v-model="price"
                                    @input="watchInputPrice">
                                <small
                                    v-if="errors.price"
                                    class="text-sm text-red-500">
                                    {{ errors.price }}
                                </small>
                            </div>

                            <div class="input-container flex flex-col gap-y-1.5">
                                <label
                                    for="edit-product-stock"
                                    class="text-sm font-medium text-slate-700">
                                    Stok
                                </label>
                                <input
                                    placeholder="8"
                                    id="edit-product-stock"
                                    type="number"
                                    min="0"
                                    class="h-11 w-full rounded-md border border-slate-300 px-3 text-base text-slate-900 outline-none shadow-sm placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                                    :class="{'border-red-500 focus:border-red-500 focus:ring-red-100': errors.stock}"
                                    v-model="stock"
                                    @input="watchInputStock">
                                <small
                                    v-if="errors.stock"
                                    class="text-sm text-red-500">
                                    {{ errors.stock }}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="border-t border-slate-200 bg-white px-5 py-4">
                <div class="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        class="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        :disabled="isProcessEditProduct"
                        @click="closeEditProduct">
                        Batal
                    </button>
                    <button
                        type="button"
                        class="h-11 rounded-md border border-violet-500 bg-violet-500 px-3 text-sm font-semibold text-white shadow-sm"
                        :class="(isProcessGetProduct || isProcessEditProduct) ? 'cursor-not-allowed opacity-70' : 'hover:bg-violet-600'"
                        :disabled="isProcessGetProduct || isProcessEditProduct"
                        @click="editProduct">
                        Simpan
                        <i v-if="isProcessEditProduct" class="ml-1 fas fa-spinner fa-pulse"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ElNotification } from "element-plus";

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

            isProcessGetProduct: true,
            isProcessEditProduct: false,

            errors: {
                img: '',
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
            if(newValue && this.productId) {
                this.getProduct();
            }
        },
    },

    methods: {
        closeEditProduct() {
            if(this.$global.modals.editProduct) {
                this.$global.modals.editProduct = false;
                this.resetForm();
            }
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
                this.clearImageFile();
                
                ElNotification({
                    type: 'error',
                    title: 'Error',
                    message: `The foto field must be an image`
                })
            }
            // jika file di atas 1mb
            else if(!sizeValid)
            {
                this.clearImageFile();
                
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

        clearImageFile() {
            if(this.$refs.imageFile) {
                this.$refs.imageFile.value = '';
            }
        },

        resetErrors() {
            this.errors.img = '';
            this.errors.name = '';
            this.errors.price = '';
            this.errors.stock = '';
        },

        resetForm() {
            this.clearImageFile();
            this.id = '';
            this.name = '';
            this.price = '';
            this.stock = '';
            this.oldProductImage = '';
            this.ProductImage = '';
            this.isZoomUserImage = false;
            this.resetErrors();
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
            this.isProcessGetProduct = true;
            this.resetErrors();
            this.clearImageFile();

            this.$store.dispatch('getProduct', {
                user_id_seller: this.$store.getters.user.id,
                id_product: this.productId,
            })
            .then(response => {
                // console.log(response);

                this.isProcessGetProduct = false;
                
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

                this.isProcessGetProduct = false;
            })
        },

        editProduct() {
            if(!this.name || !this.price || (this.stock === ''))
            {
                if(!this.name)
                    this.errors.name = 'The Field Name Is Required';
                if(!this.price)
                    this.errors.price = 'The Field Price Is Required';
                if(this.stock === '')
                    this.errors.stock = 'The Field Stock Is Required';
            }
            else
            {
                this.isProcessEditProduct = true;

                const form = new FormData();
                form.append('id', this.id);
                form.append('oldImg', this.oldProductImage);
                if(this.$refs.imageFile.files[0]) {
                    form.append('img', this.$refs.imageFile.files[0]);
                }
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

                                    this.resetForm();
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
