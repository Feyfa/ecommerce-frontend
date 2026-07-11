<template>
    <div class="profile-image-manager">
        <!-- zoom img -->
        <el-image-viewer
            v-if="isZoomUserImage"
            :url-list="[src]"
            :initial-index="0"
            :min-scale="0.2"
            :max-scale="7"
            :zoom-rate="1.2"
            :z-index="9999"
            teleported
            @close="zoomUserImage('out')" />
        <!-- zoom img -->

        <div role="status" class="profile-image-loading" v-if="isProcessImageCompany">
            <svg aria-hidden="true" class="w-[1.5rem] h-[1.5rem] text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <span class="sr-only">Loading...</span>
        </div>

        <div
            class="profile-image-preview" :style="{ backgroundImage: `url(${src})` }"
            @click="togglePreview"
            @click.stop>
        </div>

        <ul
            class="profile-image-menu"
            :class="this.$global.isClickDropdown.company ? 'is-open' : 'h-0'">
            <li>
                <span
                class="profile-image-menu-item"
                @click="zoomUserImage('in')">
                    Perbesar Foto
                </span>
            </li>
            <li>
                <div>
                <input
                    class="top-0 left-0 right-0 bottom-0 hidden"
                    type="file"
                    id="image-file"
                    ref="imageFile"
                    name="file"
                    accept="image/*"
                    @change="imageFileChange"/>
                <span
                    class="profile-image-menu-item"
                    @click="this.$refs.imageFile.click()">
                    Unggah Foto
                </span>
                </div>
            </li>
            <li>
                <span
                class="profile-image-menu-item"
                :class="disable.deleteImage ? 'is-disabled' : 'cursor-pointer'"
                @click="deleteImageCompany">
                    Hapus Foto
                </span>
            </li>
        </ul>
    </div>
</template>

<script>
import { ElMessageBox, ElNotification } from "element-plus";

export default {
    props: {
        src: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            required: true
        }
    },

    data() {
        return {
            isZoomUserImage: false,
            isProcessImageCompany: false,

            disable: {
                deleteImage: false
            }
        }
    },

    mounted() {
        this.$global.isClickDropdown.company = false;

        if(!this.$store.getters.company?.img) {
            this.disable.deleteImage = true;
        }
    },

    methods: {
        togglePreview() {
            this.$global.isClickDropdown.company = !this.$global.isClickDropdown.company;
        },

        zoomUserImage(type) {
            this.isZoomUserImage = (type == 'in') ? true : false;

            if(type == 'in') {
                this.$global.isClickDropdown.company = false;
            }
        },

        /**
         * Mengosongkan input file agar file yang sama bisa dipilih ulang setelah gagal.
         */
        resetImageFileInput() {
            if(this.$refs.imageFile) {
                this.$refs.imageFile.value = '';
            }
        },

        /**
         * Mengambil pesan error upload dari response API Laravel.
         */
        getUploadErrorMessages(error) {
            const message = error?.response?.data?.message;

            if(Array.isArray(message)) {
                return message.flat();
            }

            if(message && typeof message == 'object') {
                return Object.values(message).flat();
            }

            if(typeof message == 'string') {
                return [message];
            }

            return ['Upload gambar gagal.'];
        },

        /**
         * Menampilkan semua pesan error upload agar validasi backend terlihat di UI.
         */
        showUploadErrorNotifications(error) {
            this.getUploadErrorMessages(error).forEach(message => {
                ElNotification({ type: 'error', title: 'Error', message });
            });
        },

        imageFileChange(event) {
            const file = event.target.files[0];
            // cek apakah file tipe nya image
            const extensionValid = file ? file.type.startsWith('image/') : false;
            // cek apakah file kurang dari 1mb
            const sizeValid = file ? file.size <= 1000000 : false;

            // jika file bukan image
            if(!extensionValid)
            {
                this.resetImageFileInput();

                ElNotification({ type: 'error', title: 'Error', message: 'File harus berupa gambar.' })
            }
            // jika file di atas 1mb
            else if(!sizeValid)
            {
                this.resetImageFileInput();

                ElNotification({ type: 'error', title: 'Error', message: 'Ukuran gambar tidak boleh lebih dari 1024 KB.' })
            }
            else
            {
                const data = new FormData();
                data.append('file', this.$refs.imageFile.files[0]);

                this.isProcessImageCompany = true;
                this.disable.deleteImage = true;

                this
                .$store
                .dispatch('uploadImageCompany', data)
                .then(response => {
                    // console.log(response);

                    this.resetImageFileInput();

                    if(response.status == 'success') {
                        ElNotification({ type: 'success', title: 'Success', message: response.message })

                        localStorage.setItem('company', JSON.stringify(response.company));

                        /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */
                        this.$store.dispatch('fetchUserFromLocalStorage');
                        this.$store.dispatch('fetchCompanyFromLocalStorage');
                        /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */

                        this.$global.companyImage = `${import.meta.env.VITE_APP_BACKEND_BASE_URL}/${import.meta.env.VITE_SYMLINK_FOLDER}/${response.company.img}`;
                    }

                    this.isProcessImageCompany = false;
                    this.disable.deleteImage = false;
                })
                .catch(error => {
                    console.error(error);

                    this.resetImageFileInput();
                    this.isProcessImageCompany = false;
                    this.disable.deleteImage = !this.$store.getters.company?.img;

                    this.showUploadErrorNotifications(error);
                })
            }
        },

        deleteImageCompany() {
            if(this.$store.getters.company?.img) {
                this.$global.isClickDropdown.company = false;

                ElMessageBox.confirm(
                    'Foto toko akan dihapus dari profil toko.',
                    'Hapus Foto Toko',
                    {
                        type: 'warning',
                        confirmButtonText: 'Hapus Foto',
                        cancelButtonText: 'Batal',
                        confirmButtonClass: 'el-button--danger',
                        distinguishCancelAndClose: true
                    }
                )
                .then(() => {
                    this.isProcessImageCompany = true;

                    this
                    .$store
                    .dispatch('deleteImageCompany')
                    .then(response => {
                        // console.log(response);

                        if(response.status == 'success') {
                            ElNotification({ type: 'success', title: 'Success', message: response.message })

                            localStorage.setItem('company', JSON.stringify(response.company));

                            /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */
                            this.$store.dispatch('fetchUserFromLocalStorage');
                            this.$store.dispatch('fetchCompanyFromLocalStorage');
                            /* UPDATE PENGAMBILAN DARI LOCALSTORAGE */

                            this.$global.companyImage = '/img/company.png';
                        }

                        this.isProcessImageCompany = false;
                        this.disable.deleteImage = true;
                    })
                    .catch(error => {
                        console.error(error);

                        this.isProcessImageCompany = false;
                        this.disable.deleteImage = true;
                        ElNotification({ type: 'error', title: 'Error', message: error.response.data.message });
                    })
                })
                .catch(() => {});
            }
        }
    }
}
</script>

<style scoped>
.profile-image-manager {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.profile-image-preview {
    width: 128px;
    height: 128px;
    cursor: pointer;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
}

.profile-image-loading {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: rgba(15, 23, 42, 0.55);
}

.profile-image-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    z-index: 50;
    width: 168px;
    overflow: hidden;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
    transition: 100ms ease-in-out;
}

.profile-image-menu.is-open {
    height: auto;
    border: 1px solid #e5e7eb;
    padding: 6px;
    transform: translateX(-50%);
}

.profile-image-menu-item {
    display: block;
    width: 100%;
    height: 34px;
    border-radius: 6px;
    color: #374151;
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 34px;
    padding: 0 10px;
    transition: 150ms ease-in-out;
}

.profile-image-menu-item:not(.is-disabled):hover {
    background: #f5f3ff;
    color: #7c3aed;
}

.profile-image-menu-item.is-disabled {
    cursor: no-drop;
    background: #f3f4f6;
    color: #9ca3af;
}
</style>
