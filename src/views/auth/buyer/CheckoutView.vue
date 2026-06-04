<template>
  <!-- Checkout View -->
  <div v-if="show.checkout_view" class="min-h-full w-full bg-slate-50 px-3 pb-28 pt-4 text-slate-950 sm:px-5 lg:px-6 lg:pb-6">
    <div class="checkout-container w-full">
      <div class="mb-4 flex flex-col gap-1">
        <h1 class="text-3xl font-medium text-slate-950">Checkout</h1>
        <p class="text-sm font-medium text-slate-500">Review pesanan, pengiriman, dan pembayaran sebelum lanjut.</p>
      </div>

      <div class="flex flex-col items-start gap-5 lg:flex-row">
        <div class="flex w-full flex-col gap-4 lg:w-[65%] xl:w-[70%]">
          <!-- ALAMAT -->
          <div class="w-full rounded-md border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div class="flex items-start justify-between gap-4">
              <div class="flex min-w-0 gap-3">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-500">
                  <i class="fa-solid fa-location-dot text-base"></i>
                </div>
                <div class="min-w-0">
                  <h2 class="text-base font-semibold text-slate-950">Alamat Pengiriman</h2>
                  <p class="mt-1 text-sm leading-6 text-slate-600">{{ alamat || 'Alamat belum dipilih' }}</p>
                </div>
              </div>

              <button
                type="button"
                @click="getAlamatBuyer"
                class="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isProcessGetAlamatBuyer">
                Ganti
                <i v-if="isProcessGetAlamatBuyer" class="ml-2 fas fa-spinner fa-pulse"></i>
              </button>
            </div>
          </div>

          <Modal v-model:show="modal.alamats" class="">
            <div class="py-5">
              <h3 class="mb-5 text-center text-2xl font-medium text-slate-950">Pilih Alamat</h3>
  
              <div 
                v-if="this.alamats.length > 0" 
                class="flex max-h-[710px] flex-col gap-4 overflow-auto px-5">
                <div v-for="(alamat, index) in alamats" :key="alamat.id">
                  <div 
                    class="flex w-full flex-row items-center justify-between gap-5 rounded-md px-4 py-3"
                    :class="{'border-2 border-violet-500 bg-violet-50': alamat.enable, 'border border-slate-200 bg-white': !alamat.enable}">
                    <div class="flex w-[80%] flex-col gap-1 xl:w-[85%]">
                      <h4 class="text-sm font-semibold text-slate-500">{{ alamat.place }}</h4>
                      <h3 class="text-base font-semibold text-slate-950">{{ alamat.name }}</h3>
                      <p class="text-sm text-slate-600">{{ alamat.phone }}</p>
                      <p class="text-sm leading-5 text-slate-500">{{ alamat.alamat }}</p>
                    </div>
                    <div class="w-[20%] xl:w-[15%]">
                      <div v-if="alamat.enable" class="flex items-center justify-center">
                        <i class="fas fa-check text-violet-500 text-2xl"></i>
                      </div>
                      <div v-else class="flex justify-end">
                        <button
                          class="inline-flex h-9 w-full items-center justify-center rounded-md border border-violet-500 bg-violet-500 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                          @click="setEnableAlamatBuyer(alamat.id, index)"
                          :disabled="isProcessEnableAlamatBuyer[index]">
                          Pilih
                          <i v-if="isProcessEnableAlamatBuyer[index]" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else >
                <h3 class="mt-7 text-center text-base font-medium text-slate-500">Alamat Kosong</h3>
              </div>
            </div>
          </Modal>
          <!-- ALAMAT -->
          
          <!-- KERANJANG -->
          <div class="flex w-full flex-col gap-4">
            <div 
              class="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
              v-for="(checkout, index1) in checkouts"
              :key="checkout.user_id_seller">
              <!-- nama penjual -->
              <div class="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div class="flex min-w-0 items-center gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    <i class="fa-solid fa-store text-sm"></i>
                  </div>
                  <div class="min-w-0">
                    <h2 class="truncate text-sm font-semibold text-slate-950">Paket dari {{ checkout.user_name_seller }}</h2>
                    <p class="text-xs font-medium text-slate-500">{{ checkout.keranjangs.length }} produk</p>
                  </div>
                </div>
              </div>
              <!-- nama penjual -->

              <!-- keranjang -->
              <div class="divide-y divide-slate-100">
                <div
                  class="flex gap-3 px-4 py-4"
                  v-for="item in checkout.keranjangs"
                  :key="item.k_id">
                  <div class="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-slate-100 bg-white sm:h-24 sm:w-24">
                    <img
                      class="h-full w-full object-contain"
                      :src="`${APP_BACKEND_BASE_URL}/${SYMLINK_FOLDER}/${item.p_img}`"
                      :alt="item.p_name">
                  </div>

                  <div class="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div class="min-w-0">
                      <h3 class="line-clamp-2 text-sm font-medium leading-5 text-slate-900">{{ item.p_name }}</h3>
                      <p class="mt-1 text-sm font-semibold text-slate-950">{{ item.k_total }} x {{ formatRupiah(item.p_price) }}</p>
                    </div>

                    <div class="shrink-0 text-left sm:text-right">
                      <p class="text-xs font-medium text-slate-500">Subtotal</p>
                      <p class="text-sm font-semibold text-slate-950">{{ formatRupiah(getCheckoutProductTotal(item)) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <!-- keranjang -->

              <!-- kuris -->
              <div 
                class="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-4 text-sm">
                <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <label class="flex flex-col gap-2">
                    <span class="text-xs font-semibold uppercase text-slate-500">Kurir</span>
                    <el-select
                      :id="`kurir-${index1}`"
                      class="checkout-courier-select w-full"
                      v-model="kurirs[index1].name"
                      size="large"
                      placement="bottom-start"
                      :fallback-placements="['bottom-start', 'bottom', 'bottom-end']"
                      popper-class="checkout-courier-popper"
                      @change="changeKurir(index1)">
                      <el-option
                        v-for="item in checkout.kurirs"
                        :key="`${checkout.user_id_seller}-${item.name}`"
                        :label="`${item.name} (${formatRupiah(item.price)})`"
                        :value="item.name" />
                    </el-select>
                  </label>

                  <div class="flex flex-col gap-2">
                    <span class="text-xs font-semibold uppercase text-slate-500">Estimasi Sampai</span>
                    <div class="flex h-11 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                      {{ kurirs[index1].estimation }}
                    </div>
                  </div>
                </div>

                <label class="flex flex-col gap-2">
                  <span class="text-xs font-semibold uppercase text-slate-500">Catatan untuk penjual</span>
                  <input
                    placeholder="Kasih catatan"
                    :id="`noteds-${index1}`"
                    type="text"
                    class="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                    v-model="noteds[index1].noted">
                </label>
              </div>
              <!-- kuris -->
            </div>
          </div>
          <!-- KERANJANG -->
        </div>
        
        <!-- CHECKOUT -->
        <div class="w-full rounded-md border border-slate-200 bg-white shadow-sm lg:sticky lg:top-6 lg:w-[35%] xl:w-[30%]">
          <!-- list payment -->
          <div class="w-full px-4 py-4">
            <h2 class="text-base font-semibold text-slate-950">Metode Pembayaran</h2>
            <div class="mt-3 flex flex-col overflow-hidden rounded-md border border-slate-200">
            <div 
              v-for="item in payments"
              :key="item.slug"
              class="flex min-h-[4rem] w-full cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 transition last:border-b-0 hover:bg-slate-50"
              :class="{'bg-violet-50': paymentName == item.name}"
              @click="changePayment(item.name)">
              <span class="flex h-10 w-16 shrink-0 items-center justify-center rounded-md bg-white">
                <img :src="getImage(item.slug)" class="max-h-7 max-w-12" :alt="item.name">
              </span>
              <span class="flex min-w-0 flex-1 items-center text-sm font-semibold text-slate-900">
                {{ item.name }}
              </span>
              <span class="flex shrink-0 justify-center">
                <input class="h-4 w-4 cursor-pointer accent-violet-500" type="radio" name="paymentName" :id="item.name" :value="item.name" v-model="paymentName">
              </span>
            </div>
            </div>
          </div>
          <!-- list payment -->

          <!-- ringkasan transaksi -->
          <div class="w-full border-t border-slate-100 px-4 py-4">
            <h2 class="text-base font-semibold text-slate-950">Ringkasan Checkout</h2>
            <div class="mt-3 flex flex-col gap-2 text-sm">
              <div class="flex items-center justify-between gap-4">
                <span class="text-slate-500">Total Harga Barang</span>
                <span class="font-semibold text-slate-900">{{ formatRupiah(totalPriceKeranjangs) }}</span>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-slate-500">Total Ongkos Kirim</span>
                <span class="font-semibold text-slate-900">{{ formatRupiah(totalPriceKurirs) }}</span>
              </div>
              <div class="hidden justify-between items-center">
                <span>Total Discount</span>
                <span>-Rp50.000</span>
              </div>
            </div>
          </div>
          <!-- ringkasan transaksi -->

          <!-- pembayaran -->
          <div class="hidden w-full flex-col gap-3 border-t border-slate-100 px-4 py-4 lg:flex">
            <div class="flex items-center justify-between gap-4">
              <span class="text-sm font-medium text-slate-500">Total Bayar</span>
              <span class="text-lg font-semibold text-slate-950">{{ formatRupiah(totalPriceAll) }}</span>
            </div>
            <button 
              @click="processCheckout"
              class="inline-flex h-11 w-full items-center justify-center rounded-md border border-violet-500 bg-violet-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600 active:scale-95"
              :class="{'button-disabled cursor-not-allowed opacity-60': isProcessCheckout}"
              :disabled="isProcessCheckout">
              Bayar Sekarang
              <i v-if="isProcessCheckout" class="ml-2 fas fa-spinner fa-pulse"></i>
          </button>
          </div>
          <!-- pembayaran -->
        </div>
        <!-- CHECKOUT -->
      </div>

      <div class="fixed bottom-0 left-0 right-0 z-[2] flex items-center gap-3 border border-slate-200 bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] lg:hidden">
        <div class="min-w-0 flex-1">
          <p class="text-xs font-medium text-slate-500">Total Bayar</p>
          <p class="truncate text-base font-semibold text-slate-950">{{ formatRupiah(totalPriceAll) }}</p>
        </div>

        <button
          @click="processCheckout"
          class="inline-flex h-11 w-40 shrink-0 items-center justify-center rounded-md border border-violet-500 bg-violet-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-600 active:scale-95"
          :class="{'button-disabled cursor-not-allowed opacity-60': isProcessCheckout}"
          :disabled="isProcessCheckout">
          Bayar
          <i v-if="isProcessCheckout" class="ml-2 fas fa-spinner fa-pulse"></i>
        </button>
      </div>
    </div>
  </div>
  <!-- Checkout View -->

   <!-- loading view -->
  <div v-if="show.loading" class="w-full text-xl h-full flex justify-center items-center">
    <span>
      <i class="fas fa-spinner fa-pulse text-4xl"></i>
    </span>
  </div>
  <!-- loading view -->
</template>

<script>
import { ElNotification } from 'element-plus';
import Modal from '@/components/partials/ModalView.vue';

export default {
  components: {
    Modal
  },

  data() {
    return {
      APP_BACKEND_BASE_URL: import.meta.env.VITE_APP_BACKEND_BASE_URL,
      SYMLINK_FOLDER: import.meta.env.VITE_SYMLINK_FOLDER,

      show: {
        checkout_view: false,
        loading: false,
      },

      isProcessCheckout: false,
      isProcessGetAlamatBuyer: false,
      isProcessEnableAlamatBuyer: [],

      modal: {
        alamats: false,
      },

      alamats: [],
      checkouts: [
        {
          user_id_seller: 1,
          user_name_seller: "Muhammad Jidan",
          keranjangs: [
            {
              k_id: 67,
              k_total: 2,
              k_total_price: 54000,
              p_id: 1856,
              p_name: "Cover Knalpot Aerox 155 CC",
              p_price: 27000,
              p_img: "product-imgs/afyTJ5RWyMT0fFZFdjWiMSAzyg4vtmmXUVKYcav0.jpg"
            },
            {
              k_id: 64,
              k_total: 1,
              k_total_price: 20000,
              p_id: 7,
              p_name: "Nasi Goreng Ayam",
              p_price: 20000,
              p_img: "product-imgs/RR97Yp3e52W69H8PRt5pRwjYoYUyANLRqDsKXbED.jpg"
            }
          ],
          kurirs: [
            {
              name: "JNT",
              price: 13000,
              estimation: "11 Mei 2025 - 13 Mei 2025"
            },
            {
              name: "Anter Aja",
              price: 6000,
              estimation: "11 Mei 2025 - 15 Mei 2025"
            },
            {
              name: "Si Cepat Halu",
              price: 8000,
              estimation: "11 Mei 2025 - 14 Mei 2025"
            },
          ],
        },
        {
          user_id_seller: 2,
          user_name_seller: "Ahmad Ibrahim",
          keranjangs: [
            {
              k_id: 101,
              k_total: 1,
              k_total_price: 12000000,
              p_id: 1867,
              p_name: "Mesin Cuci Front",
              p_price: 12000000,
              p_img: "product-imgs/ZaSIT3XcLhVykIPvtFf11byufTicaihUneOY3OLn.jpg"
            },
            {
              k_id: 100,
              k_total: 1,
              k_total_price: 2500000,
              p_id: 1868,
              p_name: "Monitor Samsung 40 Inch",
              p_price: 2500000,
              p_img: "product-imgs/0Uz4m4nrgipG3vJsuBMSPtaibhQEYXZs0XWzoAK4.jpg"
            }
          ],
          kurirs: [
            {
              name: "JNT",
              price: 13000,
              estimation: "11 Mei 2025 - 13 Mei 2025"
            },
            {
              name: "Anter Aja",
              price: 6000,
              estimation: "11 Mei 2025 - 15 Mei 2025"
            },
            {
              name: "Si Cepat Halu",
              price: 8000,
              estimation: "11 Mei 2025 - 14 Mei 2025"
            },
          ],
        }
      ],
      payments: [
        {
          slug: 'bca',
          method: 'va',
          name: "BCA Virtual Account",
        },
        {
          slug: 'bri',
          method: 'va',
          name: "BRI Virtual Account",
        },
        {
          slug: "bni",
          method: 'va',
          name: "BNI Virtual Account",
        },
        {
          slug: 'mandiri',
          method: 'va',
          name: "Mandiri Virtual Account",
        },
      ],
      totalPriceKeranjangs: 0,
      totalPriceKurirs: 0,
      totalPriceAll: 0,

      kurirs: [],
      noteds: [],
      alamat: '',
      paymentSlug: '',
      paymentMethod: '',
      paymentName: '',  
    }
  }, 
  
  mounted() {
    this.getDataCheckout();
  },

  methods: {
    formatRupiah(value) {
      return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
    },

    getCheckoutProductTotal(item) {
      return Number(item.k_total_price || (Number(item.k_total || 0) * Number(item.p_price || 0)));
    },

    setEnableAlamatBuyer(id, index) {
      if(id == '') {
        return false;
      }

      this.isProcessEnableAlamatBuyer[index] = true;

      this
      .$store
      .dispatch('setEnableAlamatBuyer', {
        id: id
      })
      .then(response => {
        // console.log(response);
        
        this.isProcessEnableAlamatBuyer[index] = false;
        this.alamat = response.currentAlamat.alamat;
        this.modal.alamats = false;

        ElNotification({ type: 'success', title: 'Success', message: response.message });
      })
      .catch(error => {
        console.error(error);
        
        this.isProcessEnableAlamatBuyer[index] = false;

        ElNotification({ type: 'error', title: 'Error', message: error.response.data.message });
      })
    },

    getAlamatBuyer() {
      this.isProcessGetAlamatBuyer = true;

      this
      .$store
      .dispatch('getAlamatBuyer', {
        searchAlamat: ''
      })
      .then(response => {
        // console.log(response);

        this.isProcessGetAlamatBuyer = false;
        this.modal.alamats = true;
        this.alamats = response.alamats;
      })
      .catch(error => {
        console.error(error);

        this.isProcessGetAlamatBuyer = false;
      });
    },

    processCheckout() {
      /* VALIDATION */
      if(!this.paymentName || !this.paymentSlug || !this.paymentMethod) {
        ElNotification({ type: 'error', title: 'Error', message: 'Please pilih metode pembayaran' });
        return;
      }
      /* VALIDATION */
      
      this.isProcessCheckout = true;
      this
      .$store
      .dispatch('processCheckout', {
        shippingOptions: this.buildShippingOptions(),
        noteds: this.noteds,
        paymentSlug: this.paymentSlug,
        clientSnapshot: this.buildClientSnapshot(),
      })
      .then(response => {
        // console.log(response);

        ElNotification({ type: 'success', title: 'Success', message: response.message });
        
        setTimeout(() => {
          this.$router.push({ name: 'buyer_transaction'});
        }, 500);
      })
      .catch(error => {
        console.error(error);

        this.isProcessCheckout = false;

        const responseData = error.response?.data;
        const responseStatus = error.response?.status;

        if(responseStatus == 409 && responseData?.code == 'CHECKOUT_CHANGED' && responseData?.checkout) {
          this.applyCheckoutSnapshot(responseData.checkout);
          ElNotification({ type: 'warning', title: 'Checkout Berubah', message: responseData.message });
          return;
        }

        if(responseStatus == 409 && responseData?.code == 'CHECKOUT_INVALID') {
          ElNotification({ type: 'error', title: 'Error', message: responseData.message });
          setTimeout(() => {
            this.$router.push({ name: 'buyer_keranjang' });
          }, 500);
          return;
        }

        if(responseStatus == 422) {
          const message = responseData.message;
          
          Object.keys(message).forEach(key => {
            setTimeout(() => {
              ElNotification({ type: 'error', title: 'Error', message: message[key][0] });
            }, 10);
          })
        } else {
          ElNotification({type: 'error', title: 'Error', message: responseData?.message || 'Checkout gagal diproses'});
        }
      });
    },

    buildShippingOptions() {
      return this.kurirs.map(item => ({
        user_id_seller: item.user_id_seller,
        kurir_name: item.name,
      }));
    },

    buildClientSnapshot() {
      const cartItemIds = [];

      this.checkouts.forEach(checkout => {
        (checkout.keranjangs || []).forEach(item => {
          cartItemIds.push(item.k_id);
        });
      });

      cartItemIds.sort();

      return {
        cart_item_ids: cartItemIds,
        total_product: Number(this.totalPriceKeranjangs || 0),
        total_shipping: Number(this.totalPriceKurirs || 0),
        total_all: Number(this.totalPriceAll || 0),
      };
    },

    applyCheckoutSnapshot(checkout) {
      if(checkout.alamat?.alamat) {
        this.alamat = checkout.alamat.alamat;
      }

      if(checkout.checkouts) {
        this.checkouts = checkout.checkouts;
      }

      if(checkout.kurirs) {
        this.kurirs = checkout.kurirs;
      } else {
        this.generateFormatKurirs();
      }

      if(checkout.noteds) {
        this.noteds = checkout.noteds;
      } else {
        this.generateFormatNoteds();
      }

      this.totalPriceKeranjangs = Number(checkout.totalPrice || 0);
      this.totalPriceKurirs = Number(checkout.totalShipping || 0);
      this.totalPriceAll = Number(checkout.totalAll || (this.totalPriceKeranjangs + this.totalPriceKurirs));
    },

    changePayment(name) {
      const payment = this.payments.find(item => item.name == name);
      this.paymentName = name;
      this.paymentSlug = payment ? payment.slug : '';
      this.paymentMethod = payment ? payment.method : '';
    },

    getImage(slug) {  
      return `/img/${slug}.png`;
    },
    
    changeKurir(index) {
      const name = this.kurirs[index].name;
      const selectedKurir = this.checkouts[index].kurirs.find(item => item.name == name);

      /* SET VALUE */
      this.kurirs[index].price = selectedKurir.price;
      this.kurirs[index].estimation = selectedKurir.estimation
      /* SET VALUE */

      this.calculatePrice();
    },
    
    generateFormatKurirs() {
      this.checkouts.forEach((item, index) => {
        this.kurirs[index] = {
          user_id_seller: item.user_id_seller,
          name: item.kurirs[0].name,
          price: item.kurirs[0].price,
          estimation: item.kurirs[0].estimation,
        };
      })
    },

    calculatePrice() {
      /* RESET */
      this.totalPriceKurirs = 0;
      this.totalPriceAll = 0;
      /* RESET */

      /* TOTAL PRICE KURIRS */
      this.kurirs.forEach((item) => {
        this.totalPriceKurirs += item.price;
      });
      /* TOTAL PRICE KURIRS */

      /* TOTAL PRICE ALL */
      this.totalPriceAll = Number(this.totalPriceKeranjangs) + Number(this.totalPriceKurirs);
      /* TOTAL PRICE ALL */
    },

    generateFormatNoteds() {
      this.checkouts.forEach((item, index) => {
        this.noteds[index] = {
          user_id_seller: item.user_id_seller,
          noted: ''
        };
      });
    },

    getDataCheckout() {
      this.show.loading = true;

      this
      .$store
      .dispatch('getDataCheckout')
      .then(response => {
        // console.log(response);

        /* DATA */
        this.alamat = response.alamat.alamat;
        this.checkouts = response.checkouts;
        this.payments = response.payments;
        this.paymentName = this.payments[0].name;
        this.paymentSlug = this.payments[0].slug;
        this.paymentMethod = this.payments[0].method;
        this.totalPriceKeranjangs = response.totalPrice;

        this.generateFormatKurirs();
        this.generateFormatNoteds();
        this.calculatePrice();
        /* DATA */

        /* SHOW VIEW */
        this.show.loading = false;
        this.show.checkout_view = true;
        /* SHOW VIEW */
      })
      .catch(error => {
        console.error(error);

        /* NOT SHOW VIEW */
        this.show.loading = true;
        this.show.checkout_view = false;
        /* NOT SHOW VIEW */

        if(error.response.status == 422) {
          const message = error.response.data.message;
          
          Object.keys(message).forEach(key => {
            switch(key) {
              case 'user_id_buyer' : 
                ElNotification({ type: 'error', title: 'Error', message: message[key][0] });
                break;
            }
          })
        } else {
          ElNotification({type: 'error', title: 'Error', message: error.response.data.message});
        }

        setTimeout(() => {
          window.location.href = '/buyer/keranjang';
        }, 500);
      });
    },
  },
}
</script>

<style scoped>
.checkout-courier-select :deep(.el-select__wrapper) {
  min-height: 44px;
  height: 44px;
  border-color: #cbd5e1;
  border-radius: 6px;
  box-shadow: none;
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
}

.checkout-courier-select :deep(.el-select__wrapper.is-hovering),
.checkout-courier-select :deep(.el-select__wrapper.is-focused) {
  border-color: #a78bfa;
  box-shadow: 0 0 0 2px #ede9fe;
}

.checkout-courier-select :deep(.el-select__placeholder) {
  color: #0f172a;
}
</style>
