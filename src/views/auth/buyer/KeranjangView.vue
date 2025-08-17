<template>
  <!-- keranjang view -->
  <div v-show="show.keranjang_view" class="w-full pb-2">
    <h1 class="text-center text-3xl font-medium flex justify-center items-center">Daftar Keranjang</h1>

    <div class="keranjang-container mt-2 flex justify-start items-start px-3 py-2 gap-5">

      <div 
        class="w-full h-screen-minus-banyak overflow-auto flex flex-col gap-5 pb-[7.5rem] lg:pb-0"
        :class="{'lg:w-[65%] xl:w-[70%] 2xl:w-[75%]': Object.keys(keranjangs).length > 0}">         
        <h3
          ref="empty" 
          class="w-full text-center text-lg mt-5 font-medium hidden">
          Daftar Keranjang Kamu Masih Kosong Nih
        </h3>

        <div 
          class="border border-neutral-400 flex flex-col gap-3 rounded-md shadow-lg p-3"
          v-for="(keranjang, index1) in keranjangs">
          <div
            class="flex items-start p-2 gap-3 -my-2">
            <div class="w-5 h-5 border">
              <input
                @change="checkedKeranjangGroup($event, keranjang[0].k_user_id_seller)"
                :checked="isCheckedKeranjangGroup(keranjang)"
                type="checkbox"
                class="w-5 h-5">
            </div>
            <span class="text-[.9rem] font-semibold">{{ keranjang[0].u_seller_name }}</span>
          </div>

          <div
            class="row relative flex items-start border border-neutral-400 rounded shadow p-2 gap-2"
            v-for="(item, index2) in keranjang">
            <!-- WHEN STOCK 0 -->
            <div
              class="absolute inset-0 bg-[rgba(0,0,0,.3)] z-[1] flex justify-start items-center"
              v-if="item.p_stock < 1">
              <img
                class="ml-2.5 w-28"
                :src="SoldOutImage" 
                alt="SoldOutImage">
              <span class="absolute top-2 right-2">
                <i 
                  @click="deleteKeranjang(item.p_id)"
                  class="fa-regular fa-trash-can cursor-pointer text-black text-[1.2rem]">
                </i>
              </span>
            </div>
            <!-- WHEN STOCK 0 -->
            <div class="w-5 h-5 " :class="{'border': item.p_stock > 0}">
              <input
                v-if="item.p_stock > 0"
                @change="checkedKeranjang($event, item.p_id)" 
                :checked="item.k_checked != 0 ? true : false"
                type="checkbox"
                class="w-5 h-5">
            </div>
            <div class="w-screen flex flex-col justify-start items-start gap-1">
              <div class="flex gap-3 sm500:gap-5 w-full">
                <div class="w-24 h-24 bg-cover bg-no-repeat bg-center rounded" :style="{ backgroundImage: `url(${APP_BACKEND_BASE_URL}/${SYMLINK_FOLDER}/${item.p_img})` }"></div>
  
                <div class="sm:relative flex flex-col gap-1 w-full">
                  <div class="text-[.8rem]">
                    <span class="w-[3.3rem] inline-block">Name</span>
                    <span class="mr-2">:</span>
                    <span>{{ item.p_name }}</span>
                  </div>
                  <div class="text-[.8rem]">
                    <span class="w-[3.3rem] inline-block">Price</span>
                    <span class="mr-2">:</span>
                    <span class="font-semibold">Rp {{ item.p_price.toLocaleString('id-ID') }}</span>
                  </div>
                  <div class="text-[.8rem]">
                    <span class="w-[3.3rem] inline-block">Stock</span>
                    <span class="mr-2">:</span>
                    <span>{{ item.p_stock }}</span>
                  </div>
                  <div class="flex justify-end w-full" v-if="item.p_stock > 0">
                    <div class="total-keranjang-container flex border border-zinc-400 lg:absolute lg:bottom-2 lg:right-2 py-0.5 px-1 rounded sm:absolute sm:bottom-0">
                      <span>
                        <i 
                          v-if="item.k_total > 1"
                          @click="minusTotalKeranjang(item.p_id)"
                          class="bi bi-dash-lg mr-2.5 cursor-pointer">
                        </i>
                        <i
                          v-else
                          @click="deleteKeranjang(item.p_id)"
                          class="fa-regular fa-trash-can mr-2.5 cursor-pointer">
                        </i>
                      </span>
                      <input
                        v-model="item.k_total"
                        class="input-keranjang text-center outline-none text-sm w-12 mr-2" 
                        type="text"
                        @input="validationTotalKeranjang($event, index1, index2)"
                        @blur="changeTotalKeranjang(item.p_id, index1, index2)"
                        min="1" >
                      <span>
                        <i 
                          @click="plusTotalKeranjang(item.p_id)" 
                          class="bi bi-plus-lg cursor-pointer">
                        </i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div
        v-if="Object.keys(keranjangs).length > 0" 
        class="lg:w-[35%] xl:w-[30%] 2xl:w-[25%] bottom-0 left-3 right-3 border border-neutral-300 bg-white rounded shadow-md px-2 fixed lg:static">
        <div class="border-b border-b-neutral-300 py-2">
          <h2 class="text-base font-semibold">Ringkasan Belanja</h2>
          <div class="mt-1 flex items-center justify-between text-sm">
            <h3>Total</h3>
            <h3 class="font-semibold">Rp {{ totalPrice.toLocaleString('id-ID') }}</h3>
          </div>
        </div>
        <div class="py-2">
          <button 
            @click="checkout" 
            class="w-full border border-neutral-300 rounded-md bg-blue-500 py-1.5 text-white font-medium"
            :class="{'button-disabled': !disabled.buttonCheckout || isProcessCheckout || isProcessChecked}"
            :disabled="!disabled.buttonCheckout || isProcessCheckout || isProcessChecked">
            Checkout
            <i v-if="isProcessCheckout || isProcessChecked" class="ml-1 fas fa-spinner fa-pulse"></i>
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

  methods: {
    checkout() {
      // cek apakah ada 1 saja keranjang yang checked
      const keranjangAlReadyChecked = Object.values(this.keranjangs).some(group => 
        group.some(item => item.k_checked === 1)
      );

      // ambil id product dalam bentuk array
      const productIds = Object.values(this.keranjangs)
                               .flat()
                               .filter(item => item.k_checked === 1)
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

          this.isProcessCheckout = false;
          this.keranjangs = error.response.data.keranjangs;
          this.totalPrice = error.response.data.totalPrice;

          if(error.response.status == 422) {
            const message = error.response.data.message;
            
            Object.keys(message).forEach(key => {
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
              message: error.response.data.message
            });
          }
        });
      }
    },

    validationTotalKeranjang(event, index1, index2) {
      let newValue = event.target.value;

      // Remove any non-digit characters
      newValue = newValue.replace(/[^0-9]/g, '');

      // Convert the sanitized value to an integer
      const integerValue = parseInt(newValue, 10);

      // Check if the integer value is valid and greater than 0
      if (integerValue > 0) {
        // Update the total value with a valid integer
        this.keranjangs[index1][index2].k_total = integerValue;
      } 
      else if(integerValue <= 0) {
        this.keranjangs[index1][index2].k_total = 1;
      }
      else if(newValue === '') {
        this.keranjangs[index1][index2].k_total = '';
      }
    },

    changeTotalKeranjang(product_id, index1, index2) {
      this.isProcessChecked = true;

      if(this.keranjangs[index1][index2].k_total === '') {
        this.keranjangs[index1][index2].k_total = 1;
      }

      this.$store.dispatch('storeTotalKeranjang', {
        user_id_buyer: this.$store.getters.user.id,
        product_id,
        total: this.keranjangs[index1][index2].k_total
      })
      .then(response => {
        // console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;

        this.isProcessChecked = false;
      })
      .catch(error => {
        // console.error(error);

        this.keranjangs = error.response.data.keranjangs;
        this.totalPrice = error.response.data.totalPrice;

        this.isProcessChecked = false;

        if(error.response.data.status == 422) {
          const message = error.response.data.message;
          
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

    minusTotalKeranjang(product_id) {
      this.isProcessChecked = true;

      this.$store.dispatch('minusTotalKeranjang', {
        user_id_buyer: this.$store.getters.user.id,
        product_id
      })
      .then(response => {
        // console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;

        this.isProcessChecked = false;
      })
      .catch(error => {
        // console.error(error);
        this.isProcessChecked = false;
      });
    },

    plusTotalKeranjang(product_id) {
      this.isProcessChecked = true;

      this.$store.dispatch('plusTotalKeranjang', {
        user_id_buyer: this.$store.getters.user.id,
        product_id
      })
      .then(response => {
        // console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;
        
        this.isProcessChecked = false;
      })
      .catch(error => {
        // console.error(error);
        this.isProcessChecked = false;

        if(error.response.data.status == 422) {
          const message = error.response.data.message;
          
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

    deleteKeranjang(product_id) {
      this.isProcessChecked = true;

      this.$store.dispatch('deleteKeranjang', {
        user_id_buyer: this.$store.getters.user.id,
        product_id
      })
      .then(response => {
        // console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;

        if(this.keranjangs.length == 0) {
          this.$refs.empty.classList.remove('hidden');
          this.$refs.empty.classList.add('visible');
        }

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

        if(this.keranjangs.length == 0) {
          this.$refs.empty.classList.remove('hidden');
          this.$refs.empty.classList.add('visible');
        }

        // cek apakah ada 1 saja keranjang yang checked
        const keranjangAlReadyChecked = Object.values(this.keranjangs).some(group => 
          group.some(item => item.k_checked === 1)
        );
        this.disabled.buttonCheckout = keranjangAlReadyChecked;

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

        // cek apakah ada 1 saja keranjang yang checked
        const keranjangAlReadyChecked = Object.values(this.keranjangs).some(group => 
          group.some(item => item.k_checked === 1)
        );
        this.disabled.buttonCheckout = keranjangAlReadyChecked;

        this.isProcessChecked = false;
      })
      .catch(error => {
        // console.error(error);
        this.isProcessChecked = false;
      })
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

        // cek apakah ada 1 saja keranjang yang checked
        const keranjangAlReadyChecked = Object.values(this.keranjangs).some(group => 
          group.some(item => item.k_checked === 1)
        );
        this.disabled.buttonCheckout = keranjangAlReadyChecked;

        this.isProcessChecked = false;
      })
      .catch(error => {
        // console.error(error);
        this.isProcessChecked = false;
      });
    },

    isCheckedKeranjangGroup(keranjang) {
      return keranjang.filter(item => item.p_stock > 0)
                      .every(item => item.k_checked === 1);
    }
  }
}
</script>