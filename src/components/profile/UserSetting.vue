<template>
  <div class="w-full border bg-neutral-50 border-neutral-400 shadow-md p-5 rounded">
    <!-- title -->
    <div class="relative">
      <h3 class="text-xl text-center">User Setting</h3>
      <span v-if="isProcessUpdate" class="absolute top-0 bottom-0 end-0 flex justify-center items-center">
        <i class="fa-solid fa-spinner fa-spin-pulse "></i>
      </span>
    </div>
    <!-- title -->

    <!-- input -->
    <div class="mt-5">
      <div class="grid grid-cols-4 items-start gap-y-4 gap-x-8">
        <div class="input-container flex flex-col w-full">
          <label 
            for="name">
            Name
          </label>
          <input
            placeholder="name" 
            id="name" 
            type="text" 
            class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow" 
            v-model="name"
            :disabled="!isEdit"
            :class="{'input-disabled': !isEdit, 'border border-red-500': errors.name}"
            @input="watchInputName">
          <small 
            v-if="errors.name"
            class="text-red-500">
            {{ errors.name }}
          </small>
        </div>

        <div class="input-container flex flex-col w-full">
          <label 
            for="email">
            email
          </label>
          <input
            placeholder="email" 
            id="email" 
            type="text" 
            class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow" 
            v-model="email"
            :disabled="!isEdit"
            :class="{'input-disabled': !isEdit, 'border border-red-500': errors.email}"
            @input="watchInputEmail">
          <small 
            v-if="errors.email"
            class="text-red-500">
            {{ errors.email }}
          </small>
        </div>
  
        <div class="input-container flex flex-col w-full">
          <label 
            for="jenis-kelamin">
            Jenis Kelamin
          </label>
          <select 
            id="jenis-kelamin" 
            class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
            v-model="jenis_kelamin"
            :disabled="!isEdit"
            :class="{'input-disabled': !isEdit}">
            <option value="Laki-Laki">Laki-Laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
  
        <div class="input-container flex flex-col w-full">
          <label 
            for="tanggal-lahir">
            Tanggal Lahir
          </label>
          <input 
            type="date" 
            id="tanggal-lahir"
            class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
            v-model="tanggal_lahir"
            :disabled="!isEdit"
            :class="{'input-disabled': !isEdit}">
        </div>
      </div>
  
      <div class="input-container flex flex-col w-full mt-3">
        <label 
          for="alamat">
          Alamat
        </label>
        <textarea 
          id="alamat"
          rows="2"
          class="border w-full border-neutral-500 rounded outline-none py-1 px-2.5 shadow"
          v-model="alamat"
          :disabled="!isEdit"
          :class="{'input-disabled': !isEdit}"></textarea>
      </div>
    </div>
    <!-- input -->

    <!-- icon -->
    <div class="mt-5 flex justify-end items-center gap-5">
      <svg 
        v-if="isEdit"
        class="w-5 cursor-pointer" 
        :class="{'opacity-50': isProcessUpdate}"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1024 1024" 
        @click="cancelInput">
        <path fill="currentColor" d="m466.752 512-90.496-90.496a32 32 0 0 1 45.248-45.248L512 466.752l90.496-90.496a32 32 0 1 1 45.248 45.248L557.248 512l90.496 90.496a32 32 0 1 1-45.248 45.248L512 557.248l-90.496 90.496a32 32 0 0 1-45.248-45.248z"></path><path fill="currentColor" d="M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768m0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896"></path>
      </svg>

      <svg 
        v-if="isEdit"
        class="w-5 cursor-pointer" 
        :class="{'opacity-50': isProcessUpdate || errors.name || errors.email}"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1024 1024" 
        @click="updateInput">
        <path fill="currentColor" d="M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768m0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896"></path>
        <path fill="currentColor" d="M745.344 361.344a32 32 0 0 1 45.312 45.312l-288 288a32 32 0 0 1-45.312 0l-160-160a32 32 0 1 1 45.312-45.312L480 626.752l265.344-265.408z"></path>
      </svg>

      <svg 
        v-if="!isEdit"
        class="w-5 cursor-pointer" 
        :class="{'opacity-50': isProcessUpdate}"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1024 1024" 
        @click="editInput">
        <path fill="currentColor" d="M832 512a32 32 0 1 1 64 0v352a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h352a32 32 0 0 1 0 64H192v640h640z"></path>
        <path fill="currentColor" d="m469.952 554.24 52.8-7.552L847.104 222.4a32 32 0 1 0-45.248-45.248L477.44 501.44l-7.552 52.8zm422.4-422.4a96 96 0 0 1 0 135.808l-331.84 331.84a32 32 0 0 1-18.112 9.088L436.8 623.68a32 32 0 0 1-36.224-36.224l15.104-105.6a32 32 0 0 1 9.024-18.112l331.904-331.84a96 96 0 0 1 135.744 0z"></path>
      </svg>
    </div>
    <!-- icon -->

  </div>
</template>

<script>
import { ElNotification } from 'element-plus';

export default {
  data() {
    return {
      name: '',
      email: '',
      jenis_kelamin: '',
      tanggal_lahir: '',
      alamat: '',

      isEdit: false,
      isProcessUpdate: false,

      errors: {
        name: '',
        email: '',
      },
    }
  },

  mounted() {
    this.getUser();
  },

  methods: {
    getUser() {
      this.name = this.$store.getters.user.name;
      this.email = this.$store.getters.user.email;
      this.jenis_kelamin = this.$store.getters.user.jenis_kelamin;
      this.tanggal_lahir = this.$store.getters.user.tanggal_lahir;
      this.alamat = this.$store.getters.user.alamat;
    },

    clearErrors() {
      this.errors = {
        name: '',
        email: '',
      }
    },

    editInput() {
      this.isEdit = true;
    },

    cancelInput() {
      if(!this.isProcessUpdate) {
        this.isEdit = false;
        this.getUser();
        this.clearErrors();
      }
    },

    updateInput() {
      if(!this.isProcessUpdate && !this.errors.name && !this.errors.email) {
        this.isProcessUpdate = true;
  
        this.$store.dispatch('updateUser', {
          id: this.$store.getters.user.id,
          name: this.name,
          email: this.email,
          jenis_kelamin: this.jenis_kelamin,
          tanggal_lahir: this.tanggal_lahir,
          alamat: this.alamat,
        })
        .then(response => {
          // console.log(response);
  
          this.isEdit = false;
          this.isProcessUpdate = false;
  
          if(response.data.status == 200) {
  
            ElNotification({
              type: 'success',
              title: 'Success',
              message: response.data.message
            });
  
            localStorage.setItem('user', JSON.stringify(response.data.user));
  
            /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */
            this.$store.dispatch('fetchTokenFromLocalStorage');
            this.$store.dispatch('fetchUserFromLocalStorage');
            /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */
          }
  
        })
        .catch(error => {
          // console.error(error);

          this.isProcessUpdate = false;
  
          if(error.response.data.status == 422) {
            const message = error.response.data.message;
            
            Object.keys(message).forEach(key => {
              switch(key) {
                case 'name' : 
                  this.errors.name = message[key][0];
                  break;
                case 'email' : 
                  this.errors.email = message[key][0];
                  break;
              }
            });
          }
        })
  
      }
    },

    watchInputName() {
      if(this.name.trim() === '') {
        this.errors.name = 'input name is required';
      } else {
        this.errors.name = '';
      }
    },

    watchInputEmail() {
      if(this.email.trim() === '') {
        this.errors.email = 'input email is required';
      } else {
        this.errors.email = '';
      }
    },
  }

}
</script>