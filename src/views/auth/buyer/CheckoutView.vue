<template>
  <!-- Checkout View -->
  <div v-if="show.checkout_view" class="w-full h-max flex justify-center items-start px-3 pb-5">
    <div class="checkout-container w-full">
      <div>
        <h1 class="text-3xl text-center font-medium">Checkout</h1>  
      </div>

      <div class="mt-5 flex flex-col justify-center items-center lg:flex-row lg:items-start gap-0.5 lg:gap-5">
        <div class="w-full lg:w-[60%] xl:w-[65%] 2xl:w-[70%] flex flex-col justify-center items-center gap-0.5 lg:gap-5">
          <!-- ALAMAT -->
          <div class="w-full border border-neutral-400 shadow-md p-3 rounded flex flex-col gap-y-5">
            <div class="flex justify-between items-center">
              <h3 class="text-[1rem] font-semibold">ALAMAT PENGIRIMAN</h3>
              <span 
                @click="getAlamatBuyer"
                class="text-neutral-600 inline-block text-[0.8rem] w-20 p-0.5 rounded-full text-center bg-neutral-50 border border-neutral-400 shadow"
                :class="{'hover:bg-neutral-100 cursor-pointer': !isProcessGetAlamatBuyer, 'hover:bg-neutral-50 cursor-default': isProcessGetAlamatBuyer}">
                Ganti
                <i v-if="isProcessGetAlamatBuyer" class="ml-1 fas fa-spinner fa-pulse"></i>
                </span>
            </div>
            <div>
              <p class="text-[0.9rem]">{{ alamat }}</p>
            </div>
          </div>

          <Modal v-model:show="modal.alamats" class="">
            <div class="py-5">
              <h3 class="text-2xl font-medium text-center mb-5">Alamat User</h3>
  
              <div 
                v-if="this.alamats.length > 0" 
                class="flex flex-col gap-5 max-h-[710px] overflow-auto px-5">
                <div v-for="(alamat, index) in alamats">
                  <div 
                    class="w-full rounded-md py-3 px-3 gap-5 flex flex-row justify-between items-center"
                    :class="{'border-2 border-violet-500 bg-violet-100': alamat.enable, 'border border-neutral-500': !alamat.enable}">
                    <div class="flex flex-col gap-1 w-[80%] xl:w-[85%]">
                      <h4 class="font-semibold text-[.9rem]">{{ alamat.place }}</h4>
                      <h3 class="font-semibold text-[1.1rem]">{{ alamat.name }}</h3>
                      <p class="text-[.9rem]">{{ alamat.phone }}</p>
                      <p class="text-[.8rem]">{{ alamat.alamat }}</p>
                    </div>
                    <div class="w-[20%] xl:w-[15%]">
                      <div v-if="alamat.enable" class="flex justify-center items-center">
                        <i class="fas fa-check text-violet-500 text-2xl"></i>
                      </div>
                      <div v-else class="flex justify-end">
                        <button 
                          class="text-[.7rem] border border-neutral-500 bg-violet-500 py-1.5 w-[100%] sm500:text-[.8rem] sm:text-[.9rem] rounded" 
                          @click="setEnableAlamatBuyer(alamat.id, index)"
                          :disabled="isProcessEnableAlamatBuyer[index]"
                          :class="{'opacity-50': isProcessEnableAlamatBuyer[index]}">
                          Pilih
                          <i v-if="isProcessEnableAlamatBuyer[index]" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else >
                <h3 class="text-[1.1rem] text-center mt-7">Alamat Kosong</h3>
              </div>
            </div>
          </Modal>
          <!-- ALAMAT -->

          <!-- DIVIDER -->
          <div class="w-full block border border-neutral-300 my-5 lg:hidden"></div>
          <!-- DIVIDER -->
          
          <!-- KERANJANG -->
          <div class="w-full rounded flex flex-col gap-5">
            <div 
              class="border border-neutral-400 flex flex-col gap-3 rounded-md shadow-lg p-3"
              v-for="(checkout, index1) in checkouts">
              <!-- nama penjual -->
              <div>
                <span class="text-[1rem] font-semibold">{{ checkout.user_name_seller }}</span>
              </div>
              <!-- nama penjual -->

              <!-- keranjang -->
              <div
                class="border border-neutral-400 rounded shadow p-2"
                v-for="(item, index2) in checkout.keranjangs">
                <div class="flex flex-col justify-start items-start gap-1">
                  <div class="flex gap-3 sm500:gap-5 w-full">
                    <div class="w-24 h-24 bg-cover bg-no-repeat bg-center rounded" :style="{ backgroundImage: `url(${APP_BACKEND_BASE_URL}/${SYMLINK_FOLDER}/${item.p_img})` }"></div>
      
                    <div class="flex flex-col gap-1 w-full">
                      <span class="text-[.8rem]">{{ item.p_name }}</span>
                      <span class="font-semibold text-[.8rem] ">{{ item.k_total }} x {{ item.p_price.toLocaleString('id-ID') }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- keranjang -->

              <!-- kuris -->
              <div 
                class="flex flex-col gap-3 text-[.8rem]">
                <div 
                  class="border border-neutral-500 rounded outline-none shadow overflow-hidden">
                  <select 
                    id="kurir" 
                    class="w-full px-1.5 pt-1.5 pb-1 outline-none"
                    v-model="kurirs[index1].name"
                    @change="changeKurir(index1)">
                    <option v-for="(item, index2) in checkout.kurirs" :value="item.name">
                      {{ item.name }} 
                      (Rp {{ item.price.toLocaleString('id-ID') }})
                    </option>
                  </select>
                  <p class="px-2.5 pt-1 pb-1.5">{{ kurirs[index1].estimation }}</p>
                </div>
                <input
                  placeholder="Kasih Catatan" 
                  id="noteds" 
                  type="text" 
                  class="border w-full border-neutral-500 rounded outline-none h-10 px-2.5 shadow"
                  v-model="noteds[index1].noted">
              </div>
              <!-- kuris -->
            </div>
          </div>
          <!-- KERANJANG -->
        </div>

        <!-- DIVIDER -->
        <div class="w-full block border border-neutral-300 my-5 lg:hidden"></div>
        <!-- DIVIDER -->
        
        <!-- CHECKOUT -->
        <div class="w-full lg:w-[40%] xl:w-[35%] 2xl:w-[30%] border border-neutral-400 rounded">
          <!-- list payment -->
          <div class="w-full pt-3 pb-3 px-3">
            <div 
              v-for="(item, index) in payments" 
              class="w-full h-[3.8rem] border-t border-t-neutral-300 flex items-center cursor-pointer hover:bg-neutral-50"
              @click="changePayment(item.name)">
              <span class="flex justify-center flex-[1.3]">
                <img :src="getImage(item.slug)" class="w-12">
              </span>
              <span class="h-10 flex items-center p-2 flex-[5]">
                {{ item.name }}
              </span>
              <span class="h-10 flex justify-center flex-[0.7]">
                <input class="cursor-pointer" type="radio" name="paymentName" :id="item.name" :value="item.name" v-model="paymentName">
              </span>
            </div>

            <div class="w-full border-t border-neutral-300"></div> 
          </div>
          <!-- list payment -->

          <div class="border-t border-neutral-300"></div>

          <!-- ringkasan transaksi -->
          <div class="w-full pt-3 pb-3 px-3">
            <h3 class="text-[1rem] font-semibold">Cek Ringkasan Checkout</h3>
            <div class="mt-2 text-[.9rem] flex flex-col gap-1">
              <div class="flex justify-between items-center">
                <span>Total Harga Barang</span>
                <span>Rp {{ totalPriceKeranjangs.toLocaleString('id-ID') }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span>Total Ongkos Kirim</span>
                <span>Rp {{ totalPriceKurirs.toLocaleString('id-ID') }}</span>
              </div>
              <div class="hidden justify-between items-center">
                <span>Total Discount</span>
                <span>-Rp50.000</span>
              </div>
            </div>
          </div>
          <!-- ringkasan transaksi -->

          <div class="border-t border-neutral-300"></div>

          <!-- pembayaran -->
          <div class="w-full pt-3 pb-3 px-3 flex flex-col gap-2">
            <div class="flex justify-between items-center">
              <span>Total Harga</span>
              <span>Rp {{ totalPriceAll.toLocaleString('id-ID') }}</span>
            </div>
            <button 
              @click="processCheckout"
              class="w-full border border-neutral-300 rounded-md bg-blue-500 py-1.5 text-white font-medium"
              :class="{'button-disabled': isProcessCheckout}"
              :disabled="isProcessCheckout">
              Bayar Sekarang
              <i v-if="isProcessCheckout" class="ml-1 fas fa-spinner fa-pulse"></i>
          </button>
          </div>
          <!-- pembayaran -->
        </div>
        <!-- CHECKOUT -->
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
        checkouts: this.checkouts,
        kurirs: this.kurirs,
        noteds: this.noteds,
        alamat: this.alamat,
        paymentName: this.paymentName,
        paymentSlug: this.paymentSlug,
        paymentMethod: this.paymentMethod,
        price: this.totalPriceAll,
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

        if(error.response.status == 422) {
          const message = error.response.data.message;
          
          Object.keys(message).forEach(key => {
            setTimeout(() => {
              ElNotification({ type: 'error', title: 'Error', message: message[key][0] });
            }, 10);
          })
        } else {
          ElNotification({type: 'error', title: 'Error', message: error.response.data.message});
        }
      });
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