<template>
    <div :class="flat ? 'w-full' : 'w-full border bg-neutral-50 border-neutral-400 shadow-md p-5 rounded'">
        <!-- form add alamat -->
        <Modal v-model:show="modal.addAlamatBuyer">
            <div class="alamat-modal flex flex-col gap-3 p-5">
                <h1 class="alamat-modal-title text-center">Tambah Alamat</h1>
                <div class="input-container flex flex-col w-full">
                    <label
                        for="place">
                        Place
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <input
                        placeholder="place"
                        id="place"
                        type="text"
                        v-model="place"
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                        required
                        aria-required="true"
                        :class="{'is-error-field border-red-500': errors.place}"
                        @input="watchInput('place')">
                    <small
                        v-if="errors.place"
                        class="text-red-500">
                        {{ errors.place }}
                    </small>
                </div>
                <div class="input-container flex flex-col w-full">
                    <label
                        for="nama">
                        nama
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <input
                        placeholder="name"
                        id="name"
                        type="text"
                        v-model="name"
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                        required
                        aria-required="true"
                        :class="{'is-error-field border-red-500': errors.name}"
                        @input="watchInput('name')">
                    <small
                        v-if="errors.name"
                        class="text-red-500">
                        {{ errors.name }}
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
                        id="phone"
                        type="text"
                        v-model="phone"
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                        required
                        aria-required="true"
                        :class="{'is-error-field border-red-500': errors.phone}"
                        @input="watchInput('phone')">
                    <small
                        v-if="errors.phone"
                        class="text-red-500">
                        {{ errors.phone }}
                    </small>
                </div>
                <div class="input-container flex flex-col w-full">
                    <label
                        for="alamat">
                        Alamat
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <textarea
                        id="alamat"
                        :rows="rows"
                        placeholder="Alamat"
                        v-model="alamat"
                        class="border w-full border-neutral-500 rounded outline-none py-1 px-2.5 shadow"
                        required
                        aria-required="true"
                        :class="{'is-error-field border-red-500': errors.alamat}"
                        @input="watchInput('alamat')">
                    </textarea>
                    <small
                        v-if="errors.alamat"
                        class="text-red-500">
                        {{ errors.alamat }}
                    </small>
                </div>
                <div class="mt-2">
                    <div class="alamat-checkbox-row">
                        <input
                            type="checkbox"
                            id="enable-add-alamat"
                            name="enable-add-alamat"
                            class="alamat-checkbox-input"
                            v-model="enable">
                        <label
                            for="enable-add-alamat"
                            class="alamat-checkbox-label"
                            :class="{'text-violet-500': enable}">
                            Tetapkan Sebagai Pilihan
                        </label>
                    </div>
                    <div class="flex flex-col gap-2 mt-1 md:flex-row md:gap-20 lg:gap-40">
                        <button
                            class="alamat-primary-button w-full border py-2 px-8 mt-1.5"
                            @click="addAlamatBuyer"
                            :disabled="isProcessAddAlamatBuyer"
                            :class="{'opacity-50': isProcessAddAlamatBuyer}">
                            Tambah Alamat
                            <i v-if="isProcessAddAlamatBuyer" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
                        </button>
                        <button
                            class="alamat-danger-button w-full border py-2 px-8 mt-1.5"
                            @click="closeFormAddAlamat"
                            :disabled="isProcessAddAlamatBuyer"
                            :class="{'opacity-50': isProcessAddAlamatBuyer}">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
        <!-- form add alamat -->

        <!-- form edit alamat -->
        <Modal v-model:show="modal.editAlamatBuyer">
            <div class="alamat-modal flex flex-col gap-3 p-5">
                <h1 class="alamat-modal-title text-center">Ubah Alamat</h1>
                <div class="input-container flex flex-col w-full">
                    <label
                        for="place">
                        Place
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <input
                        placeholder="place"
                        id="place"
                        type="text"
                        v-model="placeEdit"
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                        required
                        aria-required="true"
                        :class="{'is-error-field border-red-500': errorsEdit.place}"
                        @input="watchInputEdit('place')">
                    <small
                        v-if="errorsEdit.place"
                        class="text-red-500">
                        {{ errorsEdit.place }}
                    </small>
                </div>
                <div class="input-container flex flex-col w-full">
                    <label
                        for="nama">
                        nama
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <input
                        placeholder="name"
                        id="name"
                        type="text"
                        v-model="nameEdit"
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                        required
                        aria-required="true"
                        :class="{'is-error-field border-red-500': errorsEdit.name}"
                        @input="watchInputEdit('name')">
                    <small
                        v-if="errorsEdit.name"
                        class="text-red-500">
                        {{ errorsEdit.name }}
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
                        id="phone"
                        type="text"
                        v-model="phoneEdit"
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                        required
                        aria-required="true"
                        :class="{'is-error-field border-red-500': errorsEdit.phone}"
                        @input="watchInputEdit('phone')">
                    <small
                        v-if="errorsEdit.phone"
                        class="text-red-500">
                        {{ errorsEdit.phone }}
                    </small>
                </div>
                <div class="input-container flex flex-col w-full">
                    <label
                        for="alamat">
                        Alamat
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <textarea
                        id="alamat"
                        :rows="rows"
                        placeholder="Alamat"
                        v-model="alamatEdit"
                        class="border w-full border-neutral-500 rounded outline-none py-1 px-2.5 shadow"
                        required
                        aria-required="true"
                        :class="{'is-error-field border-red-500': errorsEdit.alamat}"
                        @input="watchInputEdit('alamat')">
                    </textarea>
                    <small
                        v-if="errorsEdit.alamat"
                        class="text-red-500">
                        {{ errorsEdit.alamat }}
                    </small>
                </div>
                <div class="flex flex-col gap-2 mt-1 md:flex-row md:gap-20 lg:gap-40">
                    <button
                        @click="editAlamatBuyer"
                        class="alamat-primary-button w-full border py-2 px-8 mt-1.5"
                        :disabled="isProcessEditAlamatBuyer"
                        :class="{'opacity-50': isProcessEditAlamatBuyer}">
                        Ubah Alamat
                        <i v-if="isProcessEditAlamatBuyer" class="fa-solid fa-spinner fa-spin-pulse ml-2"></i>
                    </button>
                    <button
                        @click="closeFormEditAlamat"
                        class="alamat-danger-button w-full border py-2 px-8 mt-1.5"
                        :disabled="isProcessEditAlamatBuyer"
                        :class="{'opacity-50': isProcessEditAlamatBuyer}">
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
        <!-- form edit alamat -->

        <!-- title -->
        <div class="relative">
            <h3 class="text-xl text-center">Alamat User</h3>
        </div>
        <!-- title -->

        <!-- search and button add alamat -->
        <div class="mt-5 mb-7 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
            <div class="w-full md:w-[40%] lg:w-[35%]">
                <input
                    placeholder="Cari Nama Alamat"
                    id="search-alamat"
                    type="text"
                    class="alamat-search-input border w-full outline-none h-12 px-3"
                    v-model="searchAlamat"
                    @keyup.enter="enterSearchAlamat">
            </div>
            <div class="md:w-[25%] lg:w-[22%]">
                <button
                    class="alamat-primary-button border w-[100%] h-12"
                    @click="openFormAddAlamat"
                    :disabled="isProcessAddAlamatBuyer"
                    :class="{'opacity-50': isProcessAddAlamatBuyer}">
                    Tambah Alamat
                </button>
            </div>
        </div>
        <!-- search and button add alamat -->

        <!-- list alamat -->
        <div class="mt-5">
            <div v-if="isProcessGetAlamatBuyer" class="text-center">
                <span class="inline-block py-[7px]">
                    <i class="fa-solid fa-spinner fa-spin-pulse text-xl"></i>
                </span>
            </div>
            <div v-else>
                <div
                    v-if="this.alamats.length > 0"
                    class="flex flex-col gap-5">
                    <!-- kontent -->
                    <div
                        v-for="(alamat, index) in alamats"
                        class="alamat-card w-full py-3 px-3 gap-5 flex flex-row justify-between items-center"
                        :class="{'is-selected': alamat.enable}">
                        <div class="flex flex-col gap-1 w-[80%] xl:w-[85%]">
                            <h4 class="font-semibold text-[.9rem]">{{ alamat.place }}</h4>
                            <h3 class="font-semibold text-[1.1rem]">{{ alamat.name }}</h3>
                            <p class="text-[.9rem]">{{ alamat.phone }}</p>
                            <p class="text-[.8rem]">{{ alamat.alamat }}</p>

                            <div class="mt-2 text-[.8rem] text-violet-500">
                                <span
                                    @click="openFormEditAlamat(index)"
                                    class="border-r border-r-neutral-500 pr-3 cursor-pointer">
                                    Ubah
                                </span>
                                <span
                                    @click="deleteAlamatBuyer(alamat.id)"
                                    class="pl-3 cursor-pointer">
                                    Hapus
                                </span>
                            </div>
                        </div>
                        <div class="w-[20%] xl:w-[15%]">
                            <div v-if="alamat.enable" class="flex justify-center items-center">
                                <i class="fas fa-check text-violet-500 text-2xl"></i>
                            </div>
                            <div v-else class="flex justify-end">
                                <button
                                    class="alamat-primary-button text-[.7rem] border py-1.5 w-[100%] sm500:text-[.8rem] sm:text-[.9rem]"
                                    @click="setEnableAlamatBuyer(alamat.id, index)"
                                    :disabled="isProcessEnableAlamatBuyer[index]"
                                    :class="{'opacity-50': isProcessEnableAlamatBuyer[index]}">
                                    Pilih
                                    <i v-if="isProcessEnableAlamatBuyer[index]" class="fa-solid fa-spinner fa-spin-pulse ml-1"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <!-- kontent -->
                </div>
                <div
                    v-else
                    class="text-center mt-10">
                    <h5 class="text-[.9rem]">Alamat Not Found</h5>
                </div>
            </div>
        </div>
        <!-- list alamat -->
    </div>
</template>

<script>
import Modal from '../partials/ModalView.vue';
import { ElNotification, ElMessageBox } from 'element-plus';

export default {
    components: {
        Modal
    },

    props: {
        flat: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            alamats: [],

            place: '',
            name: '',
            phone: '',
            alamat: '',
            enable: false,

            errors: {
                place: '',
                name: '',
                phone: '',
                alamat: '',
            },

            idEdit: '',
            placeEdit: '',
            nameEdit: '',
            phoneEdit: '',
            alamatEdit: '',

            errorsEdit: {
                place: '',
                name: '',
                phone: '',
                alamat: '',
            },

            isProcessAddAlamatBuyer: false,
            isProcessEditAlamatBuyer: false,
            isProcessEnableAlamatBuyer: [],
            isProcessGetAlamatBuyer: false,
            rows: 4,
            searchAlamat: '',

            modal: {
                addAlamatBuyer: false,
                editAlamatBuyer: false,
            }

        }
    },

    mounted() {
        this.getAlamatBuyer();
    },

    methods: {
        watchInputEdit(type) {
            switch(type) {
                case 'place':
                    this.errorsEdit.place = this.placeEdit.trim() == '' ? `${type} required` : '';
                    break;
                case 'name':
                    this.errorsEdit.name = this.nameEdit.trim() == '' ? `${type} required` : '';
                    break;
                case 'phone':
                    this.errorsEdit.phone = this.phoneEdit.trim() == '' ? `${type} required` : '';
                    break;
                case 'alamat':
                    this.errorsEdit.alamat = this.alamatEdit.trim() == '' ? `${type} required` : '';
                    break;
            }
        },

        resetFormEditAlamat() {
            this.placeEdit = '';
            this.nameEdit = '';
            this.phoneEdit = '';
            this.alamatEdit = '';
            this.enableEdit = false;

            this.errorsEdit.place = '';
            this.errorsEdit.name = '';
            this.errorsEdit.phone = '';
            this.errorsEdit.alamat = '';
        },

        editAlamatBuyer() {
            /* VALIDATION */
            if(this.placeEdit == '' || this.nameEdit == '' ||this.phoneEdit == '' || this.alamatEdit == '') {
                if(this.placeEdit == '') {
                    this.errorsEdit.place = 'place required';
                }
                if(this.nameEdit == '') {
                    this.errorsEdit.name = 'name required';
                }
                if(this.phoneEdit == '') {
                    this.errorsEdit.phone = 'phone required';
                }
                if(this.alamatEdit == '') {
                    this.errorsEdit.alamat = 'alamat required';
                }
                return false;
            }
            /* VALIDATION */

            this.isProcessEditAlamatBuyer = true;

            this
            .$store
            .dispatch('editAlamatBuyer', {
                id: this.idEdit,
                place: this.placeEdit,
                name: this.nameEdit,
                phone: this.phoneEdit,
                alamat: this.alamatEdit,
                searchAlamat: this.searchAlamat,
            })
            .then(response => {
                // console.log(response);
                this.modal.editAlamatBuyer = false;
                this.isProcessEditAlamatBuyer = false;
                this.alamats = response.alamats;
                ElNotification({ type: 'success', title: 'Success', message: response.message });
            })
            .catch(error => {
                console.log(error);
                if(error.response.status == 422) {
                    const message = error.response.data.message;
                    Object.keys(message).forEach(key => {
                        switch(key) {
                            case 'place' :
                                this.errorsEdit.place = message[key][0];
                                break;
                            case 'name' :
                                this.errorsEdit.name = message[key][0];
                                break;
                            case 'phone' :
                                this.errorsEdit.phone = message[key][0];
                                break;
                            case 'alamat' :
                                this.errorsEdit.alamat = message[key][0];
                                break;
                        }
                        setTimeout(() => {
                            ElNotification({ type: 'error', title: 'Error', message: message[key][0] });
                        }, 100);
                    })
                } else {
                    ElNotification({ type: 'error', title: 'Error', message: error.response.data.message });
                }

                this.isProcessEditAlamatBuyer = false;
            })
        },

        openFormEditAlamat(index) {
            this.resetFormEditAlamat();

            this.idEdit = this.alamats[index].id;
            this.placeEdit = this.alamats[index].place;
            this.nameEdit = this.alamats[index].name;
            this.phoneEdit = this.alamats[index].phone;
            this.alamatEdit = this.alamats[index].alamat;
            this.modal.editAlamatBuyer = true;
        },

        closeFormEditAlamat() {
            this.modal.editAlamatBuyer = false;
        },

        enterSearchAlamat() {
            this.getAlamatBuyer();
        },

        watchInput(type) {
            if (!Object.prototype.hasOwnProperty.call(this, type)) return;

            const value = this[type];
            if (this[type].trim() == '') {
                this.errors[type] = `${type} required`;
            } else {
                this.errors[type] = '';
            }
        },

        getAlamatBuyer() {
            this.$global.showUserProfileView.alamat = false;
            this.isProcessGetAlamatBuyer = true;

            this
            .$store
            .dispatch('getAlamatBuyer', {
                searchAlamat: this.searchAlamat
            })
            .then(response => {
                // console.log(response)
                this.alamats = response.alamats;
                this.$global.showUserProfileView.alamat = true;
                this.isProcessGetAlamatBuyer = false;
            })
            .catch(error => {
                console.error(error);
                this.isProcessGetAlamatBuyer = false;
            });
        },

        resetFormAddAlamat() {
            this.place = '';
            this.name = '';
            this.phone = '';
            this.alamat = '';
            this.enable = false;

            this.errors.place = '';
            this.errors.name = '';
            this.errors.phone = '';
            this.errors.alamat = '';
        },

        openFormAddAlamat() {
            this.modal.addAlamatBuyer = true;
        },

        closeFormAddAlamat() {
            this.modal.addAlamatBuyer = false;
        },

        addAlamatBuyer() {
            /* VALIDATION */
            if(this.place == '' || this.name == '' ||this.phone == '' || this.alamat == '') {
                if(this.place == '') {
                    this.errors.place = 'place required';
                }
                if(this.name == '') {
                    this.errors.name = 'name required';
                }
                if(this.phone == '') {
                    this.errors.phone = 'phone required';
                }
                if(this.alamat == '') {
                    this.errors.alamat = 'alamat required';
                }
                return false;
            }
            /* VALIDATION */

            this.isProcessAddAlamatBuyer = true;

            this
            .$store
            .dispatch('addAlamatBuyer', {
                place: this.place,
                name: this.name,
                phone: this.phone,
                alamat: this.alamat,
                enable: this.enable,
                searchAlamat: this.searchAlamat
            })
            .then(response => {
                this.modal.addAlamatBuyer = false;
                this.isProcessAddAlamatBuyer = false;
                this.alamats = response.alamats;
                this.resetFormAddAlamat();
                ElNotification({ type: 'success', title: 'Success', message: response.message });
            })
            .catch(error => {
                console.log(error);

                if(error.response.status == 422) {
                    const message = error.response.data.message;
                    Object.keys(message).forEach(key => {
                        switch(key) {
                            case 'place' :
                                this.errors.place = message[key][0];
                                break;
                            case 'name' :
                                this.errors.name = message[key][0];
                                break;
                            case 'phone' :
                                this.errors.phone = message[key][0];
                                break;
                            case 'alamat' :
                                this.errors.alamat = message[key][0];
                                break;
                        }
                        setTimeout(() => {
                            ElNotification({ type: 'error', title: 'Error', message: message[key][0] });
                        }, 100);
                    })
                } else {
                    ElNotification({ type: 'error', title: 'Error', message: error.response.data.message });
                }

                this.isProcessAddAlamatBuyer = false;
            })
        },

        deleteAlamatBuyer(id) {
            if(id == '') {
                return false;
            }

            ElMessageBox
            .confirm(
                'Anda Yakin Ingin Hapus Alamat?',
                'Warning',
                {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning',
                }
            )
            .then(() => {
                this
                .$store
                .dispatch('deleteAlamatBuyer', {
                    id: id,
                    searchAlamat: this.searchAlamat
                })
                .then(response => {
                    // console.log(response);
                    this.alamats = response.alamats;
                    ElNotification({ type: 'success', title: 'Success', message: response.message });
                })
                .catch(error => {
                    console.error(error);
                    ElNotification({ type: 'error', title: 'Error', message: error.message });
                })
            })
            .catch(() => {});

        },

        setEnableAlamatBuyer(id, index) {
            if(id == '') {
                return false;
            }

            this.isProcessEnableAlamatBuyer[index] = true;

            this
            .$store
            .dispatch('setEnableAlamatBuyer', {
                id: id,
                searchAlamat: this.searchAlamat
            })
            .then(response => {
                // console.log(response);
                this.isProcessEnableAlamatBuyer[index] = false;
                this.alamats = response.alamats;
                ElNotification({ type: 'success', title: 'Success', message: response.message });
            })
            .catch(error => {
                console.error(error);
                this.isProcessEnableAlamatBuyer[index] = false;
                ElNotification({ type: 'error', title: 'Error', message: error.response.data.message });
            })
        }
    },

    watch: {
        alamats(newValue) {
            this.isProcessEnableAlamatBuyer = Array(newValue.length).fill(false);
        },

        'modal.addAlamatBuyer': function (newValue) {
            if(!newValue) {
                this.resetFormAddAlamat();
            }
        },

        'modal.editAlamatBuyer': function (newValue) {
            if(!newValue) {
                this.resetFormEditAlamat();
            }
        }
    }
}
</script>

<style scoped>
.alamat-modal {
    padding: 22px;
}

.alamat-modal-title {
    color: #111827;
    font-size: 24px;
    font-weight: 700;
}

.alamat-modal input:not([type="checkbox"]),
.alamat-modal textarea {
    border: 1px solid #cbd5e1 !important;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

.alamat-modal input:not([type="checkbox"]):focus,
.alamat-modal textarea:focus {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 2px #ede9fe, 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

.alamat-modal input.is-error-field,
.alamat-modal textarea.is-error-field,
.alamat-modal input.is-error-field:focus,
.alamat-modal textarea.is-error-field:focus {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 2px #fee2e2, 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

.required-mark {
    color: #ef4444;
    font-weight: 700;
}

.alamat-checkbox-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 24px;
}

.alamat-checkbox-input {
    width: 15px;
    height: 15px;
    min-height: 15px !important;
    flex: 0 0 auto;
    cursor: pointer;
    accent-color: #8b5cf6;
}

.alamat-checkbox-label {
    cursor: pointer;
    color: #111827;
    line-height: 1;
}

.alamat-search-input {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
}

.alamat-search-input:focus {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 2px #ede9fe, 0 1px 2px rgba(15, 23, 42, 0.05);
}

.alamat-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);
}

.alamat-card {
    transition: 150ms ease-in-out;
}

.alamat-card:hover {
    border-color: #c4b5fd;
}

.alamat-card.is-selected {
    border: 2px solid #8b5cf6;
    background: #f5f3ff;
}

.alamat-primary-button,
.alamat-danger-button {
    border-radius: 7px;
    color: #ffffff;
    font-weight: 700;
    transition: 150ms ease-in-out;
}

.alamat-primary-button {
    border-color: #7c3aed;
    background: #8b5cf6;
}

.alamat-primary-button:not(:disabled):hover {
    background: #7c3aed;
}

.alamat-danger-button {
    border-color: #dc2626;
    background: #ef4444;
}

.alamat-danger-button:not(:disabled):hover {
    background: #dc2626;
}
</style>
