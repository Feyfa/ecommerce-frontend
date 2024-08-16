<template>
  <div class="w-full p-2 h-screen-minus-3.5rem flex flex-col justify-center gap-3 items-center">
    <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-wide text-center">Selamat Datang Di Ecommerce</h1>
    <h2 class="text-base sm:text-lg md:text-xl lg:text-2xl font-light tracking-wide text-center">Jual Barang Dan Beli Barang Semua Nya Mudah Disini</h2>

    <button 
      class="border border-zinc-400 rounded px-5 py-2 bg-violet-500 text-white shadow-lg transition-all ease-in-out duration-100" 
      :class="disabled.sendEmail ? 'button-disabled' : 'active:scale-[97%] hover:scale-[.99]'"
      :disabled="disabled.sendEmail" 
      @click="sendEmailWithMessend">
      Send Email With Messend
    </button>
  </div>
</template>

<script>
import { ElNotification } from 'element-plus';

export default {
  data() {
    return {
      disabled: {
        sendEmail: false
      }
    }
  },

  methods: {
    sendEmailWithMessend() {
      this.disabled.sendEmail = true;

      this.$store.dispatch('sendEmailWithMessend')
                 .then(response => {
                  this.disabled.sendEmail = false;

                  if(response.data.status == 'success') {
                    ElNotification({
                      type: 'success',
                      title: 'Success',
                      message: response.data.message
                    });
                  }
                 })
                 .catch(error => {
                  console.error(error);
                 })
    }
  }
}
</script>