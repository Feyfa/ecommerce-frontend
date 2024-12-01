<template>
  <!-- keranjang view -->
  <div v-show="show.keranjang_view" class="w-full pb-2">
    <h1 class="text-center text-3xl font-medium h-10 flex justify-center items-center">Daftar Keranjang</h1>

    <div class="keranjang-container flex justify-start items-start px-3 py-2 gap-5">

      <div class="w-full lg:w-[65%] xl:w-[70%] 2xl:w-[75%] h-screen-minus-banyak overflow-auto flex flex-col gap-5 pb-[7.5rem] lg:pb-0">         
        <h3
          ref="empty" 
          class="w-full text-center text-base font-medium hidden">
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
            class="row flex items-start border border-neutral-400 bg-white rounded shadow p-2 gap-2"
            v-for="(item, index2) in keranjang">
            <div class="w-5 h-5 border">
              <input
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
                  <div class="flex justify-end w-full">
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

      <div class="lg:w-[35%] xl:w-[30%] 2xl:w-[25%] bottom-0 left-3 right-3 border border-neutral-300 bg-white rounded shadow-md px-2 fixed lg:static">
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
            :class="{'button-disabled': !disabled.buttonBayar || isProcessBayar}"
            :disabled="!disabled.buttonBayar || isProcessBayar">
            Bayar
            <i v-if="isProcessBayar" class="ml-1 fas fa-spinner fa-pulse"></i>
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

      keranjangs: [],
      totalPrice: '',

      isProcessBayar: false,
      
      disabled: {
        buttonBayar: false
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

      if(keranjangAlReadyChecked) {
        this.isProcessBayar = true;
        
        this.$store.dispatch('createTokenMidtrans', {
          user_id_buyer: this.$store.getters.user.id,
          user_name_buyer: this.$store.getters.user.name
        })
        .then(response => {
          // console.log(response);
          window.snap.pay(response.data.token, {
            onPending: (result) => {
              /* CHECK ORDER ID SEKALIGUS GET KERANJANGS */
              this.$store.dispatch('checkOrderId', {
                'order_id': response.data.order_id,
                'user_id_buyer': response.data.user_id_buyer,
              })
              .then(response => {
                console.log(response);
                this.keranjangs = response.data.keranjangs;
                this.totalPrice = response.data.totalPrice;

                if(this.keranjangs.length == 0) {
                  this.$refs.empty.classList.remove('hidden');
                  this.$refs.empty.classList.add('visible');
                }

                // cek apakah ada 1 saja keranjang yang checked
                const keranjangAlReadyChecked = this.keranjangs.some(item => item.k_checked === 1);
                this.disabled.buttonBayar = keranjangAlReadyChecked;

                ElNotification({ type: 'success', title: 'Success', message: response.data.message });
              })
              .catch(error => {
                // console.error(error);
                ElNotification({ type: 'error', title: 'Error', message: response.data.message });
              });
              /* CHECK ORDER ID SEKALIGUS GET KERANJANGS */
            },

            // ketika snap di close, dan belum milih pembayaran
            onClose: () => {
              console.log('onClose');
              this.$store.dispatch('deleteTransaction', {
                'user_id_buyer': response.data.user_id_buyer,
                'order_id': response.data.order_id,
              })
              .then(response => {
                console.log(response);

                if(response.data.status == 200) {
                  ElNotification({ type: 'info', title: 'Info', message: response.data.message });
                }
              })
              .catch(error => {
                // console.error(error);
                ElNotification({ type: 'error', title: 'Error', message: response.data.message });
              });
            },

            onError: () => {
              console.log('onError');
              this.$store.dispatch('deleteTransaction', {
                'user_id_buyer': response.data.user_id_buyer,
                'order_id': response.data.order_id,
              })
              .then(response => {
                console.log(response);

                if(response.data.status == 200) {
                  ElNotification({ type: 'info', title: 'Info', message: response.data.message });
                }
              })
              .catch(error => {
                // console.error(error);
                ElNotification({ type: 'error', title: 'Error', message: response.data.message });
              });
            },
          });
          this.isProcessBayar = false;
        })
        .catch(error => {
          // console.error(error);
        })
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
      })
      .catch(error => {
        // console.error(error);

        this.keranjangs = error.response.data.keranjangs;
        this.totalPrice = error.response.data.totalPrice;

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
      this.$store.dispatch('minusTotalKeranjang', {
        user_id_buyer: this.$store.getters.user.id,
        product_id
      })
      .then(response => {
        // console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;
      })
      .catch(error => {
        // console.error(error);
      });
    },

    plusTotalKeranjang(product_id) {
      this.$store.dispatch('plusTotalKeranjang', {
        user_id_buyer: this.$store.getters.user.id,
        product_id
      })
      .then(response => {
        // console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;
      })
      .catch(error => {
        // console.error(error);

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
      })
      .catch(error => {
        // console.error(error);
      })
    },

    getKeranjang() {
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
        this.disabled.buttonBayar = keranjangAlReadyChecked;
      })
      .catch(error => {
        // console.error(error);
        
        this.show.keranjang_view = true;
        this.show.loading = false;
      })
    },

    checkedKeranjang(event, product_id) {
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
        this.disabled.buttonBayar = keranjangAlReadyChecked;
      })
      .catch(error => {
        // console.error(error);
      })
    },

    checkedKeranjangGroup(event, user_id_seller) {
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
        this.disabled.buttonBayar = keranjangAlReadyChecked;
      })
      .catch(error => {
        // console.error(error);
      });
    },

    isCheckedKeranjangGroup(keranjang) {
      return keranjang.every(item => item.k_checked === 1);
    }
  }
}
</script>