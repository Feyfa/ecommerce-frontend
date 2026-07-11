<template>
  <div class="setting-card w-full border bg-neutral-50 border-neutral-400 shadow-md p-5 rounded">
    <!-- title -->
    <div class="setting-card-header relative">
      <h3 class="text-xl text-center">User Setting</h3>
    </div>
    <!-- title -->

    <!-- input -->
    <div class="mt-5">
      <div class="grid grid-cols-1 sm500:grid-cols-2 md:grid-cols-3 items-start gap-y-4 gap-x-4 lg:gap-x-6">
        <div class="input-container flex flex-col w-full">
          <label
            for="name">
            Name
          </label>
          <input
            placeholder="name"
            id="name"
            type="text"
            class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow bg-neutral-100 text-neutral-600 cursor-not-allowed"
            readonly
            aria-readonly="true"
            v-model="name"
            tabindex="-1">
          <small class="text-neutral-500 mt-1">
            Nama mengikuti akun autentikasi Anda.
          </small>
        </div>

        <div class="input-container flex flex-col w-full">
          <label
            for="email">
            Email
          </label>
          <input
            placeholder="email"
            id="email"
            type="email"
            class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow bg-neutral-100 text-neutral-600 cursor-not-allowed"
            readonly
            aria-readonly="true"
            v-model="email"
            tabindex="-1">
          <small class="text-neutral-500 mt-1">
            Email mengikuti akun autentikasi Anda.
          </small>
        </div>

        <div class="input-container flex flex-col w-full">
          <label
            for="phone">
            Phone
            <span class="required-mark" aria-hidden="true">*</span>
          </label>
          <input
            placeholder="phone"
            type="text"
            id="phone"
            class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
            required
            aria-required="true"
            v-model="phone"
            @keypress="validatePhone"
            :class="{'is-error-field border border-red-500': errors.phone}"
            @input="watchInputPhone">
          <small
          v-if="errors.phone"
          class="text-red-500">
            {{ errors.phone }}
          </small>
        </div>

        <div class="input-container flex flex-col w-full">
          <label
            for="tanggal-lahir">
            Tanggal Lahir
          </label>
          <el-date-picker
            id="tanggal-lahir"
            v-model="tanggal_lahir"
            class="account-form-control !w-full"
            type="date"
            placeholder="dd/mm/tttt"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            size="large"
            :clearable="false"
            :editable="false" />
        </div>

        <div class="input-container flex flex-col w-full">
          <label
            for="jenis-kelamin">
            Jenis Kelamin
          </label>
          <el-select
            id="jenis-kelamin"
            class="account-form-control"
            v-model="jenis_kelamin"
            placeholder="Pilih jenis kelamin"
            size="large">
            <el-option label="Laki-Laki" value="Laki-Laki" />
            <el-option label="Perempuan" value="Perempuan" />
          </el-select>
        </div>

      </div>

      <!-- <div class="input-container flex flex-col w-full mt-4">
        <label
          for="alamat">
          Alamat
        </label>
        <textarea
          id="alamat"
          :rows="rows"
          placeholder="Alamat"
          class="border w-full border-neutral-500 rounded outline-none py-1 px-2.5 shadow"
          v-model="alamat"
          ></textarea>
      </div> -->
    </div>
    <!-- input -->

    <!-- action -->
    <div class="setting-action">
      <button
        type="button"
        class="setting-primary-button"
        :disabled="isProcessUpdate"
        :class="{'is-invalid': errors.phone, 'opacity-50': isProcessUpdate}"
        @click="updateInput">
        Simpan
      </button>
    </div>
    <!-- action -->

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
      phone: '081388992799',
      // alamat: '',

      isProcessUpdate: false,

      errors: {
        phone: ''
      },

      // rows: 4,
    }
  },

  mounted() {
    this.getUser();
    // this.setRowsTextAreaBasedOnScreenSize();
    // window.addEventListener('resize', this.setRowsTextAreaBasedOnScreenSize);
  },

  beforeUnmount() {
    // window.removeEventListener('resize', this.setRowsTextAreaBasedOnScreenSize);
  },

  methods: {
    validatePhone(event) {
      const key = event.key;
      if (!/^[\d()+-\s]$/.test(key)) {
        event.preventDefault();
      }
    },

    // setRowsTextAreaBasedOnScreenSize() {
    //   if(window.innerWidth < 500)
    //     this.rows = 4;
    //   else if(window.innerWidth < 600)
    //     this.rows = 3;
    //   else
    //     this.rows = 2;
    // },

    getUser() {
      this.$global.showUserProfileView.userSetting = false;
      this.$store
          .dispatch('getUser')
          .then(response => {
            localStorage.setItem('user', JSON.stringify(response.data.user));

            this.name = response.data.user.name;
            this.email = response.data.user.email;
            this.jenis_kelamin = response.data.user.jenis_kelamin;
            this.tanggal_lahir = response.data.user.tanggal_lahir;
            this.phone = response.data.user.phone;
            // this.alamat = response.data.user.alamat;

            this.$global.showUserProfileView.userSetting = true;
          })
          .catch(error => {
            ElNotification({
              type: 'error',
              title: 'Gagal Memuat Data',
              message: error?.response
                ? 'Data profil pengguna belum berhasil dimuat. Silakan coba lagi.'
                : 'Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.',
            });
          });
    },

    updateInput() {
      /* VALIDATION */
      this.watchInputPhone();

      if(this.errors.phone) {
        return;
      }
      /* VALIDATION */

      if(!this.isProcessUpdate) {
        this.isProcessUpdate = true;

        this.$store.dispatch('updateUser', {
          id: this.$store.getters.user.id,
          jenis_kelamin: this.jenis_kelamin,
          tanggal_lahir: this.tanggal_lahir,
          phone: this.phone,
          // alamat: this.alamat,
        })
        .then(response => {
          this.isProcessUpdate = false;

          if(response.data.status == 200) {

            ElNotification({
              type: 'success',
              title: 'Success',
              message: response.data.message
            });

            localStorage.setItem('user', JSON.stringify(response.data.user));

            /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */
            this.$store.dispatch('fetchUserFromLocalStorage');
            this.$store.dispatch('fetchCompanyFromLocalStorage');
            /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */
          }

        })
        .catch(error => {
          this.isProcessUpdate = false;

          if(error.response?.data?.status == 422) {
            const message = error.response.data.message;

            Object.keys(message).forEach(key => {
              switch(key) {
                case 'phone' :
                  this.errors.phone = message[key][0];
                  break;
              }
            });
          }
        })

      }
    },

    watchInputPhone() {
      if(!this.phone || this.phone.trim() === '') {
        this.errors.phone = 'input phone is required';
      } else {
        this.errors.phone = '';
      }
    }
  }

}
</script>

<style scoped>
.setting-card {
  border-color: #e5e7eb !important;
  border-radius: 8px;
  background: #ffffff !important;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
}

.setting-card-header {
  border-bottom: 1px solid #eef2f7;
  padding-bottom: 14px;
}

.setting-card-header h3 {
  color: #111827;
  font-size: 20px;
  font-weight: 600;
  text-align: left;
}

.account-form-control {
  width: 100%;
}

.required-mark {
  color: #ef4444;
  font-weight: 700;
}

.setting-action {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.setting-primary-button {
  min-height: 40px;
  min-width: 116px;
  border-radius: 7px;
  border: 1px solid transparent;
  font-weight: 700;
  padding: 0 16px;
  transition: 150ms ease-in-out;
}

.setting-primary-button {
  border-color: #7c3aed;
  background: #8b5cf6;
  color: #ffffff;
}

.setting-primary-button:not(:disabled):hover {
  background: #7c3aed;
}

.setting-primary-button.is-invalid {
  cursor: not-allowed;
  opacity: 0.55;
}

.input-container input.is-error-field,
.input-container input.is-error-field:focus {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px #fee2e2, 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

</style>
