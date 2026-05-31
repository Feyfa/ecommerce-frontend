<template>
  <!-- keranjang view -->
  <div v-show="show.keranjang_view" class="-mt-4 min-h-[calc(100%+1rem)] w-full bg-slate-50 text-xl">
    <div class="w-full bg-slate-50 px-3 pb-28 pt-4 sm:px-5 lg:px-6 lg:pb-6">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h1 class="text-3xl font-medium text-slate-950">Keranjang</h1>

        <span
          v-if="hasKeranjang"
          class="hidden h-8 shrink-0 items-center rounded-full bg-white px-3 text-sm font-medium text-slate-500 shadow-sm ring-1 ring-slate-200 sm:inline-flex">
          {{ availableKeranjangCount }} produk
        </span>
      </div>

      <div class="keranjang-container flex flex-col items-start gap-5 lg:flex-row">

        <div
          class="flex w-full flex-col gap-4"
          :class="{'lg:w-[65%] xl:w-[70%] 2xl:w-[75%]': true}">
          <div
            v-if="!hasKeranjang"
            class="flex min-h-[15rem] w-full items-center justify-center rounded-md border border-slate-200 bg-white px-6 py-8 shadow-sm">
            <div class="flex max-w-2xl flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <div class="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-500">
                <i class="fa-solid fa-cart-shopping text-4xl"></i>
              </div>

              <div class="flex flex-col items-center sm:items-start">
                <h2 class="text-xl font-semibold text-slate-950">Keranjang belanjamu kosong</h2>
                <p class="mt-2 max-w-md text-sm leading-6 text-slate-500">Yuk, isi dengan produk yang kamu butuhkan. Produk yang kamu pilih nanti akan muncul di sini sebelum checkout.</p>

                <button
                  type="button"
                  class="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-violet-500 bg-violet-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600 active:scale-95"
                  @click="goBelanja">
                  <i class="fa-solid fa-bag-shopping text-sm"></i>
                  Mulai Belanja
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="hasKeranjang"
            class="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <label class="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-900">
              <input
                @change="checkedKeranjangAll"
                :checked="isCheckedKeranjangAll()"
                :disabled="availableKeranjangCount === 0 || isProcessCheckout || isProcessChecked"
                type="checkbox"
                class="h-5 w-5 rounded border-slate-300 accent-violet-500">
              <span>Pilih Semua</span>
            </label>

            <span class="text-sm font-medium text-slate-500">{{ selectedKeranjangCount }} dari {{ availableKeranjangCount }} produk dipilih</span>
          </div>

          <div 
            class="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
            v-for="(keranjang, index1) in keranjangGroups"
            :key="keranjang[0].k_user_id_seller">
            <div class="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <input
                @change="checkedKeranjangGroup($event, keranjang[0].k_user_id_seller)"
                :checked="isCheckedKeranjangGroup(keranjang)"
                :disabled="!hasAvailableKeranjangGroup(keranjang) || isProcessCheckout || isProcessChecked"
                type="checkbox"
                class="h-5 w-5 rounded border-slate-300 accent-violet-500">
              <div class="flex min-w-0 flex-col">
                <span class="truncate text-sm font-semibold text-slate-950">{{ keranjang[0].u_seller_name }}</span>
                <span class="text-xs font-medium text-slate-500">Pilih semua dari toko ini</span>
              </div>
            </div>

            <div
              class="row relative flex gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0"
              v-for="item in keranjang"
              :key="item.p_id"
              :class="{'bg-slate-50/70': item.p_stock < 1}">
              <input
                v-if="item.p_stock > 0"
                @change="checkedKeranjang($event, item.p_id)" 
                :checked="item.k_checked != 0 ? true : false"
                :disabled="isProcessCheckout || isProcessChecked"
                type="checkbox"
                class="mt-9 h-5 w-5 shrink-0 rounded border-slate-300 accent-violet-500">

              <div v-else class="mt-9 h-5 w-5 shrink-0"></div>

              <div class="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-slate-100 bg-white">
                <img
                  class="h-full w-full object-contain"
                  :src="`${APP_BACKEND_BASE_URL}/${SYMLINK_FOLDER}/${item.p_img}`"
                  :alt="item.p_name">

                <div
                  class="absolute inset-0 flex items-center justify-center bg-slate-950/30"
                  v-if="item.p_stock < 1">
                  <img
                    class="w-20"
                    :src="SoldOutImage" 
                    alt="SoldOutImage">
                </div>
              </div>

              <div class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="min-w-0">
                  <h3 class="line-clamp-2 text-sm font-medium leading-5 text-slate-900">{{ item.p_name }}</h3>
                  <p class="mt-1 text-sm font-semibold text-slate-950">{{ formatRupiah(item.p_price) }}</p>
                  <span
                    class="mt-2 inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium"
                    :class="item.p_stock < 1 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'">
                    Stok: {{ item.p_stock }}
                  </span>
                </div>

                <div class="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Hapus produk"
                    title="Hapus produk"
                    :disabled="isProcessCheckout || isProcessChecked || isQuantityProcessing(item.p_id)"
                    @click="deleteKeranjang(item.p_id)">
                    <i class="fa-regular fa-trash-can text-sm"></i>
                  </button>

                  <div class="flex items-center rounded-md border border-slate-300 bg-white shadow-sm" v-if="item.p_stock > 0">
                    <button
                      type="button"
                      class="flex h-8 w-8 items-center justify-center rounded-l-md text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Kurangi jumlah produk"
                      title="Kurangi jumlah produk"
                      :disabled="item.k_total <= 1 || isProcessCheckout || isQuantityProcessing(item.p_id)"
                      @click="minusTotalKeranjang(item)">
                      <i class="bi bi-dash-lg text-sm"></i>
                    </button>

                    <input
                      v-model="item.k_total"
                      class="input-keranjang h-8 w-12 border-x border-slate-200 text-center text-sm font-medium text-slate-900 outline-none" 
                      type="text"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      aria-label="Jumlah produk"
                      :disabled="isProcessCheckout || isQuantityProcessing(item.p_id)"
                      @focus="rememberTotalKeranjang(item)"
                      @input="validationTotalKeranjang($event, item)"
                      @blur="changeTotalKeranjang(item.p_id, item)"
                      min="1">

                    <button
                      type="button"
                      class="flex h-8 w-8 items-center justify-center rounded-r-md text-slate-500 transition hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Tambah jumlah produk"
                      title="Tambah jumlah produk"
                      :disabled="item.k_total >= item.p_stock || isProcessCheckout || isQuantityProcessing(item.p_id)"
                      @click="plusTotalKeranjang(item)">
                      <i class="bi bi-plus-lg text-sm"></i>
                    </button>
                  </div>

                  <span
                    v-if="isQuantityProcessing(item.p_id)"
                    class="text-xs font-medium text-slate-400">
                    Menyimpan...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="hasKeranjang" 
          class="fixed bottom-0 left-0 right-0 z-[2] flex items-center gap-3 border border-slate-200 bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] lg:static lg:block lg:w-[35%] lg:self-start lg:rounded-md lg:shadow-sm xl:w-[30%] 2xl:w-[25%]">
          <div class="min-w-0 flex-1 lg:border-b lg:border-b-slate-200 lg:pb-3">
            <h2 class="hidden text-base font-semibold text-slate-950 lg:block">Ringkasan Belanja</h2>
            <div class="flex flex-col gap-0 text-sm lg:mt-3 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
              <h3 class="font-medium text-slate-500">Total</h3>
              <h3 class="text-base font-semibold text-slate-950">{{ formatRupiah(totalPrice) }}</h3>
            </div>
          </div>
          <div class="w-40 shrink-0 lg:w-auto lg:pt-3">
            <button 
              @click="checkout" 
              class="inline-flex h-11 w-full items-center justify-center rounded-md border border-violet-500 bg-violet-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600 active:scale-95"
              :class="{'button-disabled cursor-not-allowed opacity-60': !disabled.buttonCheckout || isProcessCheckout || isProcessChecked || hasQuantityProcessing}"
              :disabled="!disabled.buttonCheckout || isProcessCheckout || isProcessChecked || hasQuantityProcessing">
              Checkout
              <i v-if="isProcessCheckout" class="ml-2 fas fa-spinner fa-pulse"></i>
            </button>
          </div>
        </div>

        <div
          v-if="!hasKeranjang" 
          class="fixed bottom-0 left-0 right-0 z-[2] flex items-center gap-3 border border-slate-200 bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] lg:static lg:block lg:w-[35%] lg:self-start lg:rounded-md lg:px-4 lg:py-4 lg:shadow-sm xl:w-[30%] 2xl:w-[25%]">
          <div class="min-w-0 flex-1 lg:border-b lg:border-b-slate-200 lg:pb-3">
            <h2 class="hidden text-base font-semibold text-slate-950 lg:block">Ringkasan Belanja</h2>
            <div class="flex flex-col gap-0 text-sm lg:mt-3 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
              <h3 class="font-medium text-slate-500">Total</h3>
              <h3 class="text-base font-semibold text-slate-400">-</h3>
            </div>
          </div>

          <div class="my-3 hidden rounded-md border border-violet-100 bg-violet-50 px-3 py-3 text-sm leading-5 text-violet-700 lg:block">
            Pilih barang terlebih dahulu sebelum checkout.
          </div>

          <button 
            type="button"
            class="inline-flex h-11 w-40 shrink-0 cursor-not-allowed items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-400 lg:w-full"
            disabled>
            Checkout
          </button>
        </div>

      </div>
    </div>
      
  </div>
  <!-- keranjang view -->

  <!-- loading view -->
  <div v-show="show.loading" class="w-full text-xl h-full flex justify-center items-center">
    <span>
      <i class="fas fa-spinner fa-pulse text-4xl"></i>
    </span>
  </div>
  <!-- loading view -->
</template>

<script>
import { ElNotification } from 'element-plus';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      APP_BACKEND_BASE_URL: import.meta.env.VITE_APP_BACKEND_BASE_URL,
      SYMLINK_FOLDER: import.meta.env.VITE_SYMLINK_FOLDER,

      SoldOutImage: '/img/sold-out.png',

      keranjangs: [],
      totalPrice: '',

      isProcessCheckout: false,
      isProcessChecked: false,
      quantityProcessing: {},
      quantityBeforeEdit: {},
      
      disabled: {
        buttonCheckout: false
      },

      show: {
        keranjang_view: false,
        loading: false,
      }
    }
  },

  mounted() {
    this.show.keranjang_view = false;
    this.show.loading = true;

    this.getKeranjang();
  },

  computed: {
    keranjangGroups() {
      return Object.values(this.keranjangs || {})
                   .filter(group => Array.isArray(group) && group.length > 0);
    },

    hasKeranjang() {
      return this.keranjangGroups.length > 0;
    },

    availableKeranjangCount() {
      return this.keranjangGroups.flat()
                                 .filter(item => item.p_stock > 0)
                                 .length;
    },

    selectedKeranjangCount() {
      return this.keranjangGroups.flat()
                                 .filter(item => item.p_stock > 0 && (item.k_checked === 1 || item.k_checked === true))
                                 .length;
    },

    hasQuantityProcessing() {
      return Object.values(this.quantityProcessing).some(Boolean);
    }
  },

  methods: {
    formatRupiah(value) {
      return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
    },

    goBelanja() {
      this.$router.push({ name: 'buyer_belanja' });
    },

    updateButtonCheckoutState() {
      this.disabled.buttonCheckout = this.keranjangGroups.some(group => 
        group.some(item => item.k_checked === 1 || item.k_checked === true)
      );
    },

    setQuantityProcessing(product_id, processing) {
      this.quantityProcessing = {
        ...this.quantityProcessing,
        [product_id]: processing,
      };
    },

    isQuantityProcessing(product_id) {
      return this.quantityProcessing[product_id] === true;
    },

    rememberTotalKeranjang(item) {
      this.quantityBeforeEdit = {
        ...this.quantityBeforeEdit,
        [item.p_id]: Number(item.k_total || 1),
      };
    },

    isCheckedItem(item) {
      return item.k_checked === 1 || item.k_checked === true;
    },

    updateLocalTotalPrice(item, quantityDelta) {
      if(this.isCheckedItem(item)) {
        this.totalPrice = Number(this.totalPrice || 0) + (Number(item.p_price || 0) * quantityDelta);
      }
    },

    syncKeranjangFromResponseData(responseData) {
      if(responseData?.keranjangs) {
        this.keranjangs = responseData.keranjangs;
      }
      if(responseData?.totalPrice !== undefined) {
        this.totalPrice = responseData.totalPrice;
      }
      this.updateButtonCheckoutState();
    },

    checkout() {
      // cek apakah ada 1 saja keranjang yang checked
      const keranjangAlReadyChecked = Object.values(this.keranjangs).some(group => 
        group.some(item => item.k_checked === 1 || item.k_checked === true)
      );

      // ambil id product dalam bentuk array
      const productIds = Object.values(this.keranjangs)
                               .flat()
                               .filter(item => item.k_checked === 1 || item.k_checked === true)
                               .map(item => item.p_id);

      if(keranjangAlReadyChecked) {
        this.isProcessCheckout = true;

        this.$store.dispatch('validateCheckout', {
          product_ids: productIds,
          user_id_buyer: this.$store.getters.user.id,
        })
        .then(response => {
          // console.log(response);

          this.$router.push({name: 'buyer_checkout'});
        })
        .catch(error => {
          console.error(error);

          const responseData = error.response?.data;
          this.isProcessCheckout = false;
          this.syncKeranjangFromResponseData(responseData);
          const message = responseData?.message;

          if(error.response?.status == 422) {
            Object.keys(message || {}).forEach(key => {
              switch(key) {
                case 'product_ids' : 
                  ElNotification({ type: 'error', title: 'error', message: message[key][0] });
                  break;
              }
            })
          } else {
            ElNotification({
              type: 'error',
              title: 'error',
              message: typeof message === 'string' && message.trim() !== ''
                ? message
                : 'Something went wrong'
            });
          }
        });
      }
    },

    validationTotalKeranjang(event, item) {
      let newValue = event.target.value;
      const stock = item.p_stock;

      // Remove any non-digit characters
      newValue = newValue.replace(/[^0-9]/g, '');

      // Convert the sanitized value to an integer
      const integerValue = parseInt(newValue, 10);

      // Check if the integer value is valid and greater than 0
      if (integerValue > 0) {
        item.k_total = Math.min(integerValue, stock);
      } 
      else if(integerValue <= 0) {
        item.k_total = 1;
      }
      else if(newValue === '') {
        item.k_total = '';
      }
    },

    changeTotalKeranjang(product_id, item) {
      const previousTotal = Number(this.quantityBeforeEdit[product_id] || item.k_total || 1);
      const previousTotalPrice = this.totalPrice;

      if(item.k_total === '') {
        item.k_total = 1;
      }
      else if(item.k_total > item.p_stock) {
        item.k_total = item.p_stock;
      }

      const nextTotal = Number(item.k_total || 1);

      if(nextTotal === previousTotal) {
        return;
      }

      this.quantityBeforeEdit = {
        ...this.quantityBeforeEdit,
        [product_id]: nextTotal,
      };

      this.updateLocalTotalPrice(item, nextTotal - previousTotal);
      this.setQuantityProcessing(product_id, true);

      this.$store.dispatch('storeTotalKeranjang', {
        user_id_buyer: this.$store.getters.user.id,
        product_id,
        total: item.k_total
      })
      .then(response => {
        // console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;

        this.setQuantityProcessing(product_id, false);
      })
      .catch(error => {
        // console.error(error);

        const responseData = error.response?.data;
        item.k_total = previousTotal;
        this.totalPrice = previousTotalPrice;
        this.syncKeranjangFromResponseData(responseData);

        this.setQuantityProcessing(product_id, false);

        if(responseData?.status == 422) {
          const message = responseData.message;
          
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
      });
    },

    minusTotalKeranjang(item) {
      const product_id = item.p_id;
      const previousTotal = item.k_total;
      const previousTotalPrice = this.totalPrice;

      if(item.k_total <= 1) {
        return;
      }

      item.k_total -= 1;
      this.updateLocalTotalPrice(item, -1);
      this.setQuantityProcessing(product_id, true);

      this.$store.dispatch('minusTotalKeranjang', {
        user_id_buyer: this.$store.getters.user.id,
        product_id
      })
      .then(response => {
        // console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;

        this.setQuantityProcessing(product_id, false);
      })
      .catch(error => {
        // console.error(error);
        const responseData = error.response?.data;

        item.k_total = previousTotal;
        this.totalPrice = previousTotalPrice;
        this.syncKeranjangFromResponseData(responseData);
        this.setQuantityProcessing(product_id, false);

        if(responseData?.message && typeof responseData.message === 'string') {
          ElNotification({
            type: 'error',
            title: 'Error',
            message: responseData.message
          });
        }
      });
    },

    plusTotalKeranjang(item) {
      const product_id = item.p_id;
      const previousTotal = item.k_total;
      const previousTotalPrice = this.totalPrice;

      if(item.k_total >= item.p_stock) {
        return;
      }

      item.k_total += 1;
      this.updateLocalTotalPrice(item, 1);
      this.setQuantityProcessing(product_id, true);

      this.$store.dispatch('plusTotalKeranjang', {
        user_id_buyer: this.$store.getters.user.id,
        product_id
      })
      .then(response => {
        // console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;
        
        this.setQuantityProcessing(product_id, false);
      })
      .catch(error => {
        // console.error(error);
        const responseData = error.response?.data;

        item.k_total = previousTotal;
        this.totalPrice = previousTotalPrice;
        this.syncKeranjangFromResponseData(responseData);
        this.setQuantityProcessing(product_id, false);

        if(responseData?.status == 422) {
          const message = responseData.message;
          
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
        else if(responseData?.message && typeof responseData.message === 'string') {
          ElNotification({
            type: 'error',
            title: 'Error',
            message: responseData.message
          });
        }
      });
    },

    deleteKeranjang(product_id) {
      Swal.fire({
        title: 'Hapus produk?',
        text: 'Produk ini akan dihapus dari keranjang.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Hapus',
        cancelButtonText: 'Batalkan',
        confirmButtonColor: '#dc3545'
      })
      .then(result => {
        if(result.isConfirmed) {
          this.processDeleteKeranjang(product_id);
        }
      });
    },

    processDeleteKeranjang(product_id) {
      this.isProcessChecked = true;

      this.$store.dispatch('deleteKeranjang', {
        user_id_buyer: this.$store.getters.user.id,
        product_id
      })
      .then(response => {
        // console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;

        this.updateButtonCheckoutState();
        this.isProcessChecked = false;
      })
      .catch(error => {
        // console.error(error);
        this.isProcessChecked = false;
      })
    },

    getKeranjang() {
      this.isProcessChecked = true;
      this.$store.dispatch('getKeranjang', {
        user_id_buyer: this.$store.getters.user.id
      })
      .then(response => {
        // console.log(response);

        this.show.keranjang_view = true;
        this.show.loading = false;

        this.keranjangs = response.data.keranjangs; 
        this.totalPrice = response.data.totalPrice;

        this.updateButtonCheckoutState();
        this.isProcessChecked = false;
      })
      .catch(error => {
        // console.error(error);
        
        this.show.keranjang_view = true;
        this.show.loading = false;
        this.isProcessChecked = false;
      })
    },

    checkedKeranjang(event, product_id) {
      this.isProcessChecked = true;

      this.$store.dispatch('checkedKeranjang', {
        user_id_buyer: this.$store.getters.user.id,
        checked: event.target.checked,
        product_id      
      })
      .then(response => {
        // console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;

        this.updateButtonCheckoutState();
        this.isProcessChecked = false;
      })
      .catch(error => {
        // console.error(error);
        this.isProcessChecked = false;
      })
    },

    checkedKeranjangAll(event) {
      const checked = event.target.checked;

      if(this.availableKeranjangCount === 0) {
        return;
      }

      this.isProcessChecked = true;

      this.$store.dispatch('checkedKeranjangAll', {
        user_id_buyer: this.$store.getters.user.id,
        checked,
      })
      .then(response => {
        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;
        this.updateButtonCheckoutState();
        this.isProcessChecked = false;
      })
      .catch(error => {
        // console.error(error);
        this.isProcessChecked = false;
      });
    },

    checkedKeranjangGroup(event, user_id_seller) {
      this.isProcessChecked = true;

      this.$store.dispatch('checkedKeranjangGroup', {
        user_id_buyer: this.$store.getters.user.id,
        checked: event.target.checked,
        user_id_seller: user_id_seller,
      })
      .then(response => {
        // console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;

        this.updateButtonCheckoutState();
        this.isProcessChecked = false;
      })
      .catch(error => {
        // console.error(error);
        this.isProcessChecked = false;
      });
    },

    isCheckedKeranjangGroup(keranjang) {
      const availableItems = keranjang.filter(item => item.p_stock > 0);

      return availableItems.length > 0
        && availableItems.every(item => item.k_checked === 1 || item.k_checked === true);
    },

    hasAvailableKeranjangGroup(keranjang) {
      return keranjang.some(item => item.p_stock > 0);
    },

    isCheckedKeranjangAll() {
      return this.availableKeranjangCount > 0 && this.selectedKeranjangCount === this.availableKeranjangCount;
    }
  }
}
</script>
