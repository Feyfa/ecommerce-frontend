<template>
    <div id="edit-product-container" class="fixed inset-0 z-[9] bg-slate-950/50" v-show="show" @click="closeEditProduct">
        <div class="product-drawer-panel fixed bottom-0 right-0 top-14 flex w-full flex-col bg-white shadow-2xl sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[35%] 2xl:w-[30%]" v-show="show" @click.stop>
            <div class="border-b border-slate-200 px-5 py-4">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h1 class="text-xl font-semibold text-slate-900 sm:text-2xl">Ubah Produk</h1>
                        <p class="mt-1 text-sm text-slate-500">Perbarui foto dan informasi produk.</p>
                    </div>

                    <button
                        type="button"
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        aria-label="Tutup ubah produk"
                        @click="closeEditProduct">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto px-5 py-5">
                <div v-if="isProcessGetProduct" class="flex min-h-[24rem] flex-col items-center justify-center gap-3 text-slate-500">
                    <i class="fas fa-spinner fa-pulse text-2xl text-violet-500"></i>
                    <span class="text-sm font-medium">Memuat data produk...</span>
                </div>

                <div v-else class="space-y-5">
                    <ProductImagesInput
                        ref="productImagesInput"
                        v-model="productImages"
                        :error="errors.images"
                        @clear-error="errors.images = ''" />

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
                                <div
                                    class="flex h-11 w-full overflow-hidden rounded-md border border-slate-300 bg-white text-base text-slate-900 shadow-sm focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100"
                                    :class="{'border-red-500 focus-within:border-red-500 focus-within:ring-red-100': errors.price}">
                                    <div class="flex w-12 shrink-0 items-center justify-center border-r border-slate-300 bg-slate-50 text-sm font-semibold text-slate-500">
                                        Rp
                                    </div>
                                    <input
                                        placeholder="50.000"
                                        id="edit-product-price"
                                        type="text"
                                        inputmode="numeric"
                                        class="h-full min-w-0 flex-1 px-3 text-base text-slate-900 outline-none placeholder:text-slate-400"
                                        v-model="priceString"
                                        @keydown="restrictPriceInput"
                                        @input="watchInputPrice">
                                </div>
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
import ProductImagesInput from './ProductImagesInput.vue';

export default {
    components: {
        ProductImagesInput,
    },
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
            productImages: [],

            id: '',
            name: '',
            price: '',
            priceString: '',
            stock: '',

            isProcessGetProduct: true,
            isProcessEditProduct: false,
            productRequestVersion: 0,

            errors: {
                images: '',
                name: '',
                price: '',
                stock: '',
            },

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
                this.productRequestVersion++;
                this.$global.modals.editProduct = false;
                this.resetForm();
            }
        },

        resetErrors() {
            this.errors.images = '';
            this.errors.name = '';
            this.errors.price = '';
            this.errors.stock = '';
        },

        resetForm() {
            this.$refs.productImagesInput?.clear();
            this.id = '';
            this.name = '';
            this.price = '';
            this.priceString = '';
            this.stock = '';
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
            this.syncFormattedPrice();

            if(String(this.price).trim() === '') {
                this.errors.price = 'The Field Price Is Required';
            } else {
                this.errors.price = '';
            }
        },

        /**
         * Tujuan method ini untuk membatasi input harga agar hanya angka
         * yang masuk sebelum diformat sebagai rupiah.
         */
        restrictPriceInput(event) {
            if(event.metaKey || event.ctrlKey)
                return;

            if(['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', 'Home', 'End'].includes(event.key))
                return;

            if(!/^\d$/.test(event.key))
                event.preventDefault();
        },

        /**
         * Tujuan method ini untuk menjaga tampilan harga memakai format
         * ribuan Indonesia, tetapi nilai yang dikirim tetap angka bersih.
         */
        syncFormattedPrice() {
            const normalizedPrice = String(this.priceString || '').replace(/\D/g, '');

            this.price = normalizedPrice;
            this.priceString = normalizedPrice ? Number(normalizedPrice).toLocaleString('id-ID') : '';
        },

        /**
         * Tujuan method ini untuk mengisi harga produk dari API ke state
         * tampilan rupiah dan state angka bersih sekaligus.
         */
        setProductPrice(price) {
            this.price = String(price || '');
            this.priceString = this.price ? Number(this.price).toLocaleString('id-ID') : '';
        },

        watchInputStock() {
            if(String(this.stock).trim() === '') {
                this.errors.stock = 'The Field Stock Is Required';
            } else {
                this.errors.stock = '';
            }
        },

        getProduct() {
            const requestVersion = ++this.productRequestVersion;
            this.isProcessGetProduct = true;
            this.resetErrors();
            this.$refs.productImagesInput?.clear();

            this.$store.dispatch('getProduct', {
                user_id_seller: this.$store.getters.user.id,
                id_product: this.productId,
            })
            .then(response => {
                // console.log(response);

                if(requestVersion !== this.productRequestVersion)
                    return;

                this.isProcessGetProduct = false;
                
                if(!response.data.product) {
                    ElNotification({
                        type: 'error',
                        title: 'Error',
                        message: 'Product Not Valid',
                    });
                } else {
                    this.id = response.data.product.id;
                    this.productImages = response.data.product.images.map(image => ({
                        key: image.id,
                        id: image.id,
                        type: 'existing',
                        path: image.path,
                        preview: `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${import.meta.env.VITE_SYMLINK_FOLDER}/${image.path}`,
                    }));
                    this.name = response.data.product.name;
                    this.setProductPrice(response.data.product.price);
                    this.stock = response.data.product.stock;
                }
            })
            .catch(error => {
                if(requestVersion !== this.productRequestVersion)
                    return;

                console.error(error);

                this.isProcessGetProduct = false;
            })
        },

        editProduct() {
            if(this.productImages.length === 0 || !this.name || !this.price || (this.stock === ''))
            {
                if(this.productImages.length === 0)
                    this.errors.images = 'Produk wajib memiliki minimal 1 foto.';
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
                let newImageIndex = 0;
                this.productImages.forEach(image => {
                    if(image.type === 'new') {
                        form.append('images[]', image.file);
                        form.append('image_order[]', `new:${newImageIndex}`);
                        newImageIndex++;
                    } else {
                        form.append('image_order[]', image.id);
                    }
                });
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

                                if(error.response?.data?.status === 422) {
                                    const message = error.response.data.message;
                        
                                    Object.keys(message).forEach(key => {
                                        if(key.startsWith('images.') || key.startsWith('image_order.')) {
                                            this.errors.images = message[key][0];
                                            return;
                                        }

                                        switch(key) {
                                            case 'images' :
                                            case 'image_order' :
                                                this.errors.images = message[key][0];
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

<style scoped>
@media (min-width: 1800px) {
    .product-drawer-panel {
        width: min(30vw, 38rem);
    }
}
</style>
