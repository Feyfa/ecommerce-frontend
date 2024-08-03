<template>
  <div class="w-full pb-2">
    <h1 class="text-center text-3xl font-medium h-10 flex justify-center items-center">Daftar Keranjang</h1>

    <div class="keranjang-container flex justify-start items-start px-3 py-2 gap-5">

      <div class="w-full lg:w-[65%] xl:w-[70%] 2xl:w-[75%] h-screen-minus-banyak overflow-auto flex flex-col gap-3 pb-[7.5rem] lg:pb-0">         
        <h3
          ref="empty" 
          class="w-full text-center text-base font-medium hidden">
          Daftar Keranjang Kamu Masih Kosong Nih
        </h3>
        
        <div
          v-for="(keranjang, index) in keranjangs" 
          class="row flex items-start border border-neutral-400 bg-white rounded shadow-md p-2 gap-2">
          <div class="w-5 h-5 border">
            <input
              @change="checkedKeranjang($event, keranjang.p_id)" 
              :checked="keranjang.k_checked != 0 ? true : false"
              type="checkbox" 
              class="w-5 h-5">
          </div>
          <div class="w-screen flex flex-col justify-start items-start gap-1">
            <div class="flex gap-3 sm500:gap-5 w-full">
              <div class="w-24 h-24 bg-cover bg-no-repeat bg-center rounded" :style="{ backgroundImage: `url(${APP_BACKEND_BASE_URL}/${SYMLINK_FOLDER}/${keranjang.p_img})` }"></div>

              <div class="sm:relative flex flex-col gap-1 justify-center w-full">
                <span class="text-[.7rem] font-semibold">{{ keranjang.u_seller_name }}</span>
                <div class="text-[.8rem]">
                  <span class="w-[3.3rem] inline-block">Name</span>
                  <span class="mr-2">:</span>
                  <span>{{ keranjang.p_name }}</span>
                </div>
                <div class="text-[.8rem]">
                  <span class="w-[3.3rem] inline-block">Price</span>
                  <span class="mr-2">:</span>
                  <span class="font-semibold">Rp {{ keranjang.p_price.toLocaleString('id-ID') }}</span>
                </div>
                <div class="text-[.8rem]">
                  <span class="w-[3.3rem] inline-block">Stock</span>
                  <span class="mr-2">:</span>
                  <span>{{ keranjang.p_stock }}</span>
                </div>
                <div class="flex justify-end w-full">
                  <div class="total-keranjang-container flex border border-zinc-400 lg:absolute lg:bottom-2 lg:right-2 py-0.5 px-1 rounded sm:absolute sm:bottom-0">
                    <span>
                      <i 
                        v-if="keranjang.k_total > 1"
                        @click="minusTotalKeranjang(keranjang.p_id)"
                        class="bi bi-dash-lg mr-2.5 cursor-pointer">
                      </i>
                      <i 
                        v-else
                        @click="deleteKeranjang(keranjang.p_id)"
                        class="fa-regular fa-trash-can mr-2.5 cursor-pointer">
                      </i>
                    </span>
                    <input
                      v-model="keranjang.k_total"
                      class="input-keranjang text-center outline-none text-sm w-12 mr-2" 
                      type="text"
                      @input="validationTotalKeranjang($event, index)"
                      @blur="changeTotalKeranjang(keranjang.p_id, index)"
                      min="1" >
                    <span>
                      <i
                        @click="plusTotalKeranjang(keranjang.p_id)" 
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

      <div class="lg:w-[35%] xl:w-[30%] 2xl:w-[25%] bottom-0 left-3 right-3 border border-neutral-300 bg-white rounded shadow-md px-2 fixed lg:static">
        <div class="border-b border-b-neutral-300 py-2">
          <h2 class="text-base font-semibold">Ringkasan Belanja</h2>
          <div class="mt-1 flex items-center justify-between text-sm">
            <h3>Total</h3>
            <h3 class="font-semibold">Rp {{ totalPrice.toLocaleString('id-ID') }}</h3>
          </div>
        </div>
        <div class="border-b border-b-neutral-300 py-2">
          <button type="button" class="w-full border border-neutral-300 rounded-md bg-blue-500 py-1.5 text-white font-medium">Bayar</button>
        </div>
      </div>

    </div>
      
  </div>
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
    }
  },

  mounted() {
    this.getKeranjang();
  },

  methods: {
    validationTotalKeranjang(event, index) {
      let newValue = event.target.value;

      // Remove any non-digit characters
      newValue = newValue.replace(/[^0-9]/g, '');

      // Convert the sanitized value to an integer
      const integerValue = parseInt(newValue, 10);

      // Check if the integer value is valid and greater than 0
      if (integerValue > 0) {
        // Update the total value with a valid integer
        this.keranjangs[index].k_total = integerValue;
      } 
      else if(integerValue <= 0) {
        this.keranjangs[index].k_total = 1;
      }
      else if(newValue === '') {
        this.keranjangs[index].k_total = '';
      }
    },

    changeTotalKeranjang(product_id, index) {
      if(this.keranjangs[index].k_total === '') {
        this.keranjangs[index].k_total = 1;
      }

      this.$store.dispatch('storeTotalKeranjang', {
        user_id_buyer: this.$store.getters.user.id,
        product_id,
        total: this.keranjangs[index].k_total
      })
      .then(response => {
        console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;
      })
      .catch(error => {
        console.error(error);

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
        console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;
      })
      .catch(error => {
        console.error(error);
      });
    },

    plusTotalKeranjang(product_id) {
      this.$store.dispatch('plusTotalKeranjang', {
        user_id_buyer: this.$store.getters.user.id,
        product_id
      })
      .then(response => {
        console.log(response);

        this.keranjangs = response.data.keranjangs;
        this.totalPrice = response.data.totalPrice;
      })
      .catch(error => {
        console.error(error);

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
      })
      .catch(error => {
        // console.error(error);
      })
    }
  }
}
</script>