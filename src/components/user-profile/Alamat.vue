<template>
    <div
        :class="
            flat
                ? 'w-full'
                : 'w-full border bg-neutral-50 border-neutral-400 shadow-md p-5 rounded'
        "
    >
        <!-- form add alamat -->
        <Modal v-model:show="modal.addAlamatBuyer">
            <div class="alamat-modal flex flex-col gap-3 p-5">
                <h1 class="alamat-modal-title text-center">Tambah Alamat</h1>
                <div class="input-container flex flex-col w-full">
                    <label for="place">
                        Label Alamat
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <input
                        placeholder="Contoh: Rumah, Kantor, Kos"
                        id="place"
                        type="text"
                        v-model="place"
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                        required
                        aria-required="true"
                        :class="{
                            'is-error-field border-red-500': errors.place,
                        }"
                        @input="watchInput('place')"
                    />
                    <small v-if="errors.place" class="text-red-500">
                        {{ errors.place }}
                    </small>
                </div>
                <div class="input-container flex flex-col w-full">
                    <label for="nama">
                        Nama Penerima
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <input
                        placeholder="Masukkan nama penerima"
                        id="name"
                        type="text"
                        v-model="name"
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                        required
                        aria-required="true"
                        :class="{
                            'is-error-field border-red-500': errors.name,
                        }"
                        @input="watchInput('name')"
                    />
                    <small v-if="errors.name" class="text-red-500">
                        {{ errors.name }}
                    </small>
                </div>
                <div class="input-container flex flex-col w-full">
                    <label for="phone">
                        Nomor Telepon
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <input
                        placeholder="Masukkan nomor telepon"
                        id="phone"
                        type="text"
                        v-model="phone"
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                        required
                        aria-required="true"
                        :class="{
                            'is-error-field border-red-500': errors.phone,
                        }"
                        @input="watchInput('phone')"
                    />
                    <small v-if="errors.phone" class="text-red-500">
                        {{ errors.phone }}
                    </small>
                </div>
                <div class="input-container flex flex-col w-full gap-1">
                    <span class="font-semibold">Pinpoint Alamat</span>
                    <small class="text-slate-500"
                        >Lokasi wajib berada di Indonesia dan akan diverifikasi
                        saat disimpan.</small
                    >
                </div>
                <LocationPicker
                    v-model="location"
                    :location-error="errors.location"
                    :detail-error="errors.addressDetail"
                    @detail-input="watchLocationDetail"
                    @unavailable="handleLocationUnavailable"
                />
                <div class="mt-2">
                    <div class="alamat-checkbox-row">
                        <input
                            type="checkbox"
                            id="enable-add-alamat"
                            name="enable-add-alamat"
                            class="alamat-checkbox-input"
                            v-model="enable"
                        />
                        <label
                            for="enable-add-alamat"
                            class="alamat-checkbox-label"
                            :class="{ 'text-violet-500': enable }"
                        >
                            Tetapkan Sebagai Pilihan
                        </label>
                    </div>
                    <div
                        class="flex flex-col gap-2 mt-1 md:flex-row md:gap-20 lg:gap-40"
                    >
                        <button
                            class="alamat-primary-button w-full border py-2 px-8 mt-1.5"
                            @click="addAlamatBuyer"
                            :disabled="isProcessAddAlamatBuyer"
                            :class="{ 'opacity-50': isProcessAddAlamatBuyer }"
                        >
                            Tambah Alamat
                            <i
                                v-if="isProcessAddAlamatBuyer"
                                class="fa-solid fa-spinner fa-spin-pulse ml-1"
                            ></i>
                        </button>
                        <button
                            class="alamat-danger-button w-full border py-2 px-8 mt-1.5"
                            @click="closeFormAddAlamat"
                            :disabled="isProcessAddAlamatBuyer"
                            :class="{ 'opacity-50': isProcessAddAlamatBuyer }"
                        >
                            Batal
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
                    <label for="place">
                        Label Alamat
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <input
                        placeholder="Contoh: Rumah, Kantor, Kos"
                        id="place"
                        type="text"
                        v-model="placeEdit"
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                        required
                        aria-required="true"
                        :class="{
                            'is-error-field border-red-500': errorsEdit.place,
                        }"
                        @input="watchInputEdit('place')"
                    />
                    <small v-if="errorsEdit.place" class="text-red-500">
                        {{ errorsEdit.place }}
                    </small>
                </div>
                <div class="input-container flex flex-col w-full">
                    <label for="nama">
                        Nama Penerima
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <input
                        placeholder="Masukkan nama penerima"
                        id="name"
                        type="text"
                        v-model="nameEdit"
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                        required
                        aria-required="true"
                        :class="{
                            'is-error-field border-red-500': errorsEdit.name,
                        }"
                        @input="watchInputEdit('name')"
                    />
                    <small v-if="errorsEdit.name" class="text-red-500">
                        {{ errorsEdit.name }}
                    </small>
                </div>
                <div class="input-container flex flex-col w-full">
                    <label for="phone">
                        Nomor Telepon
                        <span class="required-mark" aria-hidden="true">*</span>
                    </label>
                    <input
                        placeholder="Masukkan nomor telepon"
                        id="phone"
                        type="text"
                        v-model="phoneEdit"
                        class="border w-full border-neutral-500 rounded outline-none h-12 px-2.5 shadow"
                        required
                        aria-required="true"
                        :class="{
                            'is-error-field border-red-500': errorsEdit.phone,
                        }"
                        @input="watchInputEdit('phone')"
                    />
                    <small v-if="errorsEdit.phone" class="text-red-500">
                        {{ errorsEdit.phone }}
                    </small>
                </div>
                <div v-if="legacyAddressEdit" class="legacy-address-notice">
                    <strong>Alamat ini perlu diverifikasi.</strong>
                    <span>Alamat lama: {{ legacyAddressEdit }}</span>
                </div>
                <div class="input-container flex flex-col w-full gap-1">
                    <span class="font-semibold">Pinpoint Alamat</span>
                    <small class="text-slate-500"
                        >Pilih lokasi Indonesia yang sesuai sebelum menyimpan
                        perubahan.</small
                    >
                </div>
                <LocationPicker
                    v-model="locationEdit"
                    :location-error="errorsEdit.location"
                    :detail-error="errorsEdit.addressDetail"
                    @detail-input="watchLocationDetailEdit"
                    @unavailable="handleLocationEditUnavailable"
                />
                <div
                    class="flex flex-col gap-2 mt-1 md:flex-row md:gap-20 lg:gap-40"
                >
                    <button
                        @click="editAlamatBuyer"
                        class="alamat-primary-button w-full border py-2 px-8 mt-1.5"
                        :disabled="isProcessEditAlamatBuyer"
                        :class="{ 'opacity-50': isProcessEditAlamatBuyer }"
                    >
                        Ubah Alamat
                        <i
                            v-if="isProcessEditAlamatBuyer"
                            class="fa-solid fa-spinner fa-spin-pulse ml-2"
                        ></i>
                    </button>
                    <button
                        @click="closeFormEditAlamat"
                        class="alamat-danger-button w-full border py-2 px-8 mt-1.5"
                        :disabled="isProcessEditAlamatBuyer"
                        :class="{ 'opacity-50': isProcessEditAlamatBuyer }"
                    >
                        Batal
                    </button>
                </div>
            </div>
        </Modal>
        <!-- form edit alamat -->

        <!-- title -->
        <div v-if="showTitle" class="relative">
            <h3 class="text-xl text-center">Alamat User</h3>
        </div>
        <!-- title -->

        <!-- search and button add alamat -->
        <div
            class="mb-7 flex flex-col md:flex-row md:justify-between md:items-center gap-3"
        >
            <div class="alamat-search-control w-full md:w-[40%] lg:w-[35%]">
                <input
                    placeholder="Cari Nama Alamat"
                    id="search-alamat"
                    type="text"
                    class="alamat-search-input border w-full outline-none h-12 px-3"
                    v-model="searchAlamat"
                    @keyup.enter="enterSearchAlamat"
                />
            </div>
            <div class="alamat-add-control md:w-[25%] lg:w-[22%]">
                <button
                    class="alamat-primary-button border w-[100%] h-12"
                    @click="openFormAddAlamat"
                    :disabled="isProcessAddAlamatBuyer"
                    :class="{ 'opacity-50': isProcessAddAlamatBuyer }"
                >
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
                <div v-if="this.alamats.length > 0" class="flex flex-col gap-5">
                    <!-- kontent -->
                    <div
                        v-for="(alamat, index) in alamats"
                        class="alamat-card w-full py-3 px-3 gap-5 flex flex-row justify-between items-center"
                        :class="{ 'is-selected': alamat.enable }"
                    >
                        <div class="flex flex-col gap-1 w-[80%] xl:w-[85%]">
                            <div class="flex flex-wrap items-center gap-2">
                                <h4 class="font-semibold text-[.9rem]">
                                    {{ alamat.place }}
                                </h4>
                                <span
                                    class="location-source-badge"
                                    :class="
                                        alamat.location_source === 'map'
                                            ? 'is-map'
                                            : 'is-unverified'
                                    "
                                >
                                    {{
                                        alamat.location_source === "map"
                                            ? "Pinpoint"
                                            : "Perlu Verifikasi"
                                    }}
                                </span>
                            </div>
                            <h3 class="font-semibold text-[1.1rem]">
                                {{ alamat.name }}
                            </h3>
                            <p class="text-[.9rem]">{{ alamat.phone }}</p>
                            <p class="text-[.8rem]">{{ alamat.alamat }}</p>

                            <div class="mt-2 text-[.8rem] text-violet-500">
                                <span
                                    @click="openFormEditAlamat(index)"
                                    class="border-r border-r-neutral-500 pr-3 cursor-pointer"
                                >
                                    {{
                                        alamat.location_source === "map"
                                            ? "Ubah"
                                            : "Verifikasi"
                                    }}
                                </span>
                                <span
                                    @click="deleteAlamatBuyer(alamat.id)"
                                    class="pl-3 cursor-pointer"
                                >
                                    Hapus
                                </span>
                            </div>
                        </div>
                        <div class="w-[20%] xl:w-[15%]">
                            <div
                                v-if="
                                    alamat.enable &&
                                    alamat.location_source === 'map'
                                "
                                class="flex justify-center items-center"
                            >
                                <i
                                    class="fas fa-check text-violet-500 text-2xl"
                                ></i>
                            </div>
                            <div v-else class="flex justify-end">
                                <button
                                    class="alamat-primary-button text-[.7rem] border py-1.5 w-[100%] sm500:text-[.8rem] sm:text-[.9rem]"
                                    @click="
                                        alamat.location_source === 'map'
                                            ? setEnableAlamatBuyer(
                                                  alamat.id,
                                                  index,
                                              )
                                            : openFormEditAlamat(index)
                                    "
                                    :disabled="
                                        isProcessEnableAlamatBuyer[index]
                                    "
                                    :class="{
                                        'opacity-50':
                                            isProcessEnableAlamatBuyer[index],
                                    }"
                                >
                                    {{
                                        alamat.location_source === "map"
                                            ? "Pilih"
                                            : "Verifikasi"
                                    }}
                                    <i
                                        v-if="isProcessEnableAlamatBuyer[index]"
                                        class="fa-solid fa-spinner fa-spin-pulse ml-1"
                                    ></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <!-- kontent -->
                </div>
                <div v-else class="text-center mt-10">
                    <h5 class="text-[.9rem]">Alamat Kosong</h5>
                </div>
            </div>
        </div>
        <!-- list alamat -->
    </div>
</template>

<script>
import Modal from "../partials/ModalView.vue";
import LocationPicker from "../address/LocationPicker.vue";
import { ElNotification, ElMessageBox } from "element-plus";

const createEmptyLocation = () => ({
    latitude: null,
    longitude: null,
    geoapify_place_id: null,
    formatted_address: "",
    address_detail: "",
});

export default {
    components: {
        Modal,
        LocationPicker,
    },

    props: {
        flat: {
            type: Boolean,
            default: false,
        },
        showTitle: {
            type: Boolean,
            default: true,
        },
    },

    data() {
        return {
            alamats: [],

            place: "",
            name: "",
            phone: "",
            alamat: "",
            location: createEmptyLocation(),
            enable: false,

            errors: {
                place: "",
                name: "",
                phone: "",
                alamat: "",
                location: "",
                addressDetail: "",
            },

            idEdit: "",
            placeEdit: "",
            nameEdit: "",
            phoneEdit: "",
            alamatEdit: "",
            locationEdit: createEmptyLocation(),
            legacyAddressEdit: "",

            errorsEdit: {
                place: "",
                name: "",
                phone: "",
                alamat: "",
                location: "",
                addressDetail: "",
            },

            isProcessAddAlamatBuyer: false,
            isProcessEditAlamatBuyer: false,
            isProcessEnableAlamatBuyer: [],
            isProcessGetAlamatBuyer: false,
            rows: 4,
            searchAlamat: "",

            modal: {
                addAlamatBuyer: false,
                editAlamatBuyer: false,
            },
        };
    },

    mounted() {
        this.getAlamatBuyer();
        this.openRequestedAddAddressModal();
    },

    methods: {
        /**
         * Membuka form tambah ketika halaman Alamat dituju dari aksi checkout.
         * Query langsung dibersihkan supaya refresh atau navigasi history tidak
         * membuka kembali modal yang sebelumnya sudah dikonsumsi.
         */
        openRequestedAddAddressModal() {
            if (this.$route.query.openAddAddress !== "1") {
                return;
            }

            this.$nextTick(() => {
                this.openFormAddAlamat();
            });

            const remainingQuery = { ...this.$route.query };
            delete remainingQuery.openAddAddress;
            this.$router
                .replace({
                    name: this.$route.name,
                    query: remainingQuery,
                    hash: this.$route.hash,
                })
                .catch(() => {});
        },

        /**
         * Mengubah nama field teknis menjadi label form yang mudah dibaca user.
         */
        getAlamatFieldLabel(type) {
            const labels = {
                place: "Label alamat",
                name: "Nama penerima",
                phone: "Nomor telepon",
                alamat: "Alamat",
            };

            return labels[type] ?? type;
        },

        /**
         * Membuat pesan wajib isi yang konsisten untuk form tambah dan ubah alamat.
         */
        getAlamatRequiredMessage(type) {
            return `${this.getAlamatFieldLabel(type)} wajib diisi.`;
        },

        isMapPinpointInvalid(location) {
            return (
                !location.formatted_address ||
                location.latitude === null ||
                location.latitude === "" ||
                location.longitude === null ||
                location.longitude === "" ||
                !Number.isFinite(Number(location.latitude)) ||
                !Number.isFinite(Number(location.longitude))
            );
        },

        isMapDetailInvalid(location) {
            return !location.address_detail?.trim();
        },

        getLocationPayload(location) {
            return {
                alamat: "",
                location_source: "map",
                latitude: location.latitude,
                longitude: location.longitude,
                geoapify_place_id: location.geoapify_place_id,
                formatted_address: location.formatted_address,
                address_detail: location.address_detail,
            };
        },

        handleLocationUnavailable(message) {
            ElNotification({
                type: "warning",
                title: "Pinpoint Tidak Tersedia",
                message,
            });
        },

        handleLocationEditUnavailable(message) {
            ElNotification({
                type: "warning",
                title: "Pinpoint Tidak Tersedia",
                message,
            });
        },

        watchLocationDetail(addressDetail) {
            this.errors.addressDetail =
                addressDetail.trim() === "" ? "Detail alamat wajib diisi." : "";
        },

        watchLocationDetailEdit(addressDetail) {
            this.errorsEdit.addressDetail =
                addressDetail.trim() === "" ? "Detail alamat wajib diisi." : "";
        },

        watchInputEdit(type) {
            switch (type) {
                case "place":
                    this.errorsEdit.place =
                        this.placeEdit.trim() == ""
                            ? this.getAlamatRequiredMessage(type)
                            : "";
                    break;
                case "name":
                    this.errorsEdit.name =
                        this.nameEdit.trim() == ""
                            ? this.getAlamatRequiredMessage(type)
                            : "";
                    break;
                case "phone":
                    this.errorsEdit.phone =
                        this.phoneEdit.trim() == ""
                            ? this.getAlamatRequiredMessage(type)
                            : "";
                    break;
                case "alamat":
                    this.errorsEdit.alamat =
                        this.alamatEdit.trim() == ""
                            ? this.getAlamatRequiredMessage(type)
                            : "";
                    break;
            }
        },

        resetFormEditAlamat() {
            this.placeEdit = "";
            this.nameEdit = "";
            this.phoneEdit = "";
            this.alamatEdit = "";
            this.locationEdit = createEmptyLocation();
            this.legacyAddressEdit = "";
            this.enableEdit = false;

            this.errorsEdit.place = "";
            this.errorsEdit.name = "";
            this.errorsEdit.phone = "";
            this.errorsEdit.alamat = "";
            this.errorsEdit.location = "";
            this.errorsEdit.addressDetail = "";
        },

        /**
         * Validates and submits an address update while keeping loading state recoverable.
         *
         * Validation feedback is mapped to the related form fields. Network failures without an
         * HTTP response use a safe fallback message so the edit action never remains stuck loading.
         *
         * @returns {false|void} False when client validation blocks submission; otherwise returns nothing.
         */
        editAlamatBuyer() {
            /* VALIDATION */
            const mapPinpointInvalid = this.isMapPinpointInvalid(
                this.locationEdit,
            );
            const mapDetailInvalid = this.isMapDetailInvalid(this.locationEdit);
            if (
                this.placeEdit == "" ||
                this.nameEdit == "" ||
                this.phoneEdit == "" ||
                mapPinpointInvalid ||
                mapDetailInvalid
            ) {
                if (this.placeEdit == "") {
                    this.errorsEdit.place =
                        this.getAlamatRequiredMessage("place");
                }
                if (this.nameEdit == "") {
                    this.errorsEdit.name =
                        this.getAlamatRequiredMessage("name");
                }
                if (this.phoneEdit == "") {
                    this.errorsEdit.phone =
                        this.getAlamatRequiredMessage("phone");
                }
                if (mapPinpointInvalid) {
                    this.errorsEdit.location = "Pilih lokasi pada peta.";
                }
                if (mapDetailInvalid) {
                    this.errorsEdit.addressDetail =
                        "Detail alamat wajib diisi.";
                }
                return false;
            }
            /* VALIDATION */

            this.isProcessEditAlamatBuyer = true;

            this.$store
                .dispatch("editAlamatBuyer", {
                    id: this.idEdit,
                    place: this.placeEdit,
                    name: this.nameEdit,
                    phone: this.phoneEdit,
                    ...this.getLocationPayload(this.locationEdit),
                    searchAlamat: this.searchAlamat,
                })
                .then((response) => {
                    // console.log(response);
                    this.modal.editAlamatBuyer = false;
                    this.isProcessEditAlamatBuyer = false;
                    this.alamats = response.alamats;
                    ElNotification({
                        type: "success",
                        title: "Success",
                        message: response.message,
                    });
                })
                .catch((error) => {
                    this.isProcessEditAlamatBuyer = false;

                    if (error.response?.status == 422) {
                        const message = error.response.data.message;
                        Object.keys(message).forEach((key) => {
                            switch (key) {
                                case "place":
                                    this.errorsEdit.place = message[key][0];
                                    break;
                                case "name":
                                    this.errorsEdit.name = message[key][0];
                                    break;
                                case "phone":
                                    this.errorsEdit.phone = message[key][0];
                                    break;
                                case "alamat":
                                    this.errorsEdit.alamat = message[key][0];
                                    break;
                                case "latitude":
                                case "longitude":
                                case "formatted_address":
                                case "location_source":
                                    this.errorsEdit.location = message[key][0];
                                    break;
                                case "address_detail":
                                    this.errorsEdit.addressDetail =
                                        message[key][0];
                                    break;
                            }
                            setTimeout(() => {
                                ElNotification({
                                    type: "error",
                                    title: "Error",
                                    message: message[key][0],
                                });
                            }, 100);
                        });
                    } else {
                        ElNotification({
                            type: "error",
                            title: "Error",
                            message:
                                error.response?.data?.message ||
                                "Gagal mengubah alamat. Periksa koneksi Anda dan coba lagi.",
                        });
                    }
                });
        },

        openFormEditAlamat(index) {
            this.resetFormEditAlamat();

            this.idEdit = this.alamats[index].id;
            this.placeEdit = this.alamats[index].place;
            this.nameEdit = this.alamats[index].name;
            this.phoneEdit = this.alamats[index].phone;
            this.alamatEdit = this.alamats[index].alamat;
            this.legacyAddressEdit =
                this.alamats[index].location_source === "map"
                    ? ""
                    : this.alamats[index].alamat;
            this.locationEdit = {
                latitude: this.alamats[index].latitude,
                longitude: this.alamats[index].longitude,
                geoapify_place_id: this.alamats[index].geoapify_place_id,
                formatted_address: this.alamats[index].formatted_address || "",
                address_detail: this.alamats[index].address_detail || "",
            };
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

            if (this[type].trim() == "") {
                this.errors[type] = this.getAlamatRequiredMessage(type);
            } else {
                this.errors[type] = "";
            }
        },

        getAlamatBuyer() {
            this.$global.showUserProfileView.alamat = false;
            this.isProcessGetAlamatBuyer = true;

            this.$store
                .dispatch("getAlamatBuyer", {
                    searchAlamat: this.searchAlamat,
                })
                .then((response) => {
                    // console.log(response)
                    this.alamats = response.alamats;
                    this.$global.showUserProfileView.alamat = true;
                    this.isProcessGetAlamatBuyer = false;
                })
                .catch((error) => {
                    console.error(error);
                    this.isProcessGetAlamatBuyer = false;
                });
        },

        resetFormAddAlamat() {
            this.place = "";
            this.name = "";
            this.phone = "";
            this.alamat = "";
            this.location = createEmptyLocation();
            this.enable = false;

            this.errors.place = "";
            this.errors.name = "";
            this.errors.phone = "";
            this.errors.alamat = "";
            this.errors.location = "";
            this.errors.addressDetail = "";
        },

        openFormAddAlamat() {
            this.modal.addAlamatBuyer = true;
        },

        closeFormAddAlamat() {
            this.modal.addAlamatBuyer = false;
        },

        /**
         * Validates and submits a new Pinpoint address while keeping loading state recoverable.
         *
         * Validation feedback is mapped to the related form fields. Network failures without an
         * HTTP response use a safe fallback message so the add action never remains stuck loading.
         *
         * @returns {false|void} False when client validation blocks submission; otherwise returns nothing.
         */
        addAlamatBuyer() {
            /* VALIDATION */
            const mapPinpointInvalid = this.isMapPinpointInvalid(this.location);
            const mapDetailInvalid = this.isMapDetailInvalid(this.location);
            if (
                this.place == "" ||
                this.name == "" ||
                this.phone == "" ||
                mapPinpointInvalid ||
                mapDetailInvalid
            ) {
                if (this.place == "") {
                    this.errors.place = this.getAlamatRequiredMessage("place");
                }
                if (this.name == "") {
                    this.errors.name = this.getAlamatRequiredMessage("name");
                }
                if (this.phone == "") {
                    this.errors.phone = this.getAlamatRequiredMessage("phone");
                }
                if (mapPinpointInvalid) {
                    this.errors.location = "Pilih lokasi pada peta.";
                }
                if (mapDetailInvalid) {
                    this.errors.addressDetail = "Detail alamat wajib diisi.";
                }
                return false;
            }
            /* VALIDATION */

            this.isProcessAddAlamatBuyer = true;

            this.$store
                .dispatch("addAlamatBuyer", {
                    place: this.place,
                    name: this.name,
                    phone: this.phone,
                    ...this.getLocationPayload(this.location),
                    enable: this.enable,
                    searchAlamat: this.searchAlamat,
                })
                .then((response) => {
                    this.modal.addAlamatBuyer = false;
                    this.isProcessAddAlamatBuyer = false;
                    this.alamats = response.alamats;
                    this.resetFormAddAlamat();
                    ElNotification({
                        type: "success",
                        title: "Success",
                        message: response.message,
                    });
                })
                .catch((error) => {
                    this.isProcessAddAlamatBuyer = false;

                    if (error.response?.status == 422) {
                        const message = error.response.data.message;
                        Object.keys(message).forEach((key) => {
                            switch (key) {
                                case "place":
                                    this.errors.place = message[key][0];
                                    break;
                                case "name":
                                    this.errors.name = message[key][0];
                                    break;
                                case "phone":
                                    this.errors.phone = message[key][0];
                                    break;
                                case "alamat":
                                    this.errors.alamat = message[key][0];
                                    break;
                                case "latitude":
                                case "longitude":
                                case "formatted_address":
                                case "location_source":
                                    this.errors.location = message[key][0];
                                    break;
                                case "address_detail":
                                    this.errors.addressDetail = message[key][0];
                                    break;
                            }
                            setTimeout(() => {
                                ElNotification({
                                    type: "error",
                                    title: "Error",
                                    message: message[key][0],
                                });
                            }, 100);
                        });
                    } else {
                        ElNotification({
                            type: "error",
                            title: "Error",
                            message:
                                error.response?.data?.message ||
                                "Gagal menambah alamat. Periksa koneksi Anda dan coba lagi.",
                        });
                    }
                });
        },

        deleteAlamatBuyer(id) {
            if (id == "") {
                return false;
            }

            ElMessageBox.confirm("Anda Yakin Ingin Hapus Alamat?", "Warning", {
                confirmButtonText: "OK",
                cancelButtonText: "Cancel",
                type: "warning",
            })
                .then(() => {
                    this.$store
                        .dispatch("deleteAlamatBuyer", {
                            id: id,
                            searchAlamat: this.searchAlamat,
                        })
                        .then((response) => {
                            // console.log(response);
                            this.alamats = response.alamats;
                            ElNotification({
                                type: "success",
                                title: "Success",
                                message: response.message,
                            });
                        })
                        .catch((error) => {
                            console.error(error);
                            ElNotification({
                                type: "error",
                                title: "Error",
                                message: error.message,
                            });
                        });
                })
                .catch(() => {});
        },

        setEnableAlamatBuyer(id, index) {
            if (id == "") {
                return false;
            }

            this.isProcessEnableAlamatBuyer[index] = true;

            this.$store
                .dispatch("setEnableAlamatBuyer", {
                    id: id,
                    searchAlamat: this.searchAlamat,
                })
                .then((response) => {
                    // console.log(response);
                    this.isProcessEnableAlamatBuyer[index] = false;
                    this.alamats = response.alamats;
                    ElNotification({
                        type: "success",
                        title: "Success",
                        message: response.message,
                    });
                })
                .catch((error) => {
                    console.error(error);
                    this.isProcessEnableAlamatBuyer[index] = false;
                    ElNotification({
                        type: "error",
                        title: "Error",
                        message:
                            error.response?.data?.message ||
                            "Gagal memilih alamat. Periksa koneksi Anda dan coba lagi.",
                    });
                });
        },
    },

    watch: {
        alamats(newValue) {
            this.isProcessEnableAlamatBuyer = Array(newValue.length).fill(
                false,
            );
        },

        location: {
            deep: true,
            handler(newValue) {
                if (!this.isMapPinpointInvalid(newValue)) {
                    this.errors.location = "";
                }
                if (!this.isMapDetailInvalid(newValue)) {
                    this.errors.addressDetail = "";
                }
            },
        },

        locationEdit: {
            deep: true,
            handler(newValue) {
                if (!this.isMapPinpointInvalid(newValue)) {
                    this.errorsEdit.location = "";
                }
                if (!this.isMapDetailInvalid(newValue)) {
                    this.errorsEdit.addressDetail = "";
                }
            },
        },

        "modal.addAlamatBuyer": function (newValue) {
            if (!newValue) {
                this.resetFormAddAlamat();
            }
        },

        "modal.editAlamatBuyer": function (newValue) {
            if (!newValue) {
                this.resetFormEditAlamat();
            }
        },
    },
};
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
    box-shadow:
        0 0 0 2px #ede9fe,
        0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

.alamat-modal input.is-error-field,
.alamat-modal textarea.is-error-field,
.alamat-modal input.is-error-field:focus,
.alamat-modal textarea.is-error-field:focus {
    border-color: #ef4444 !important;
    box-shadow:
        0 0 0 2px #fee2e2,
        0 1px 2px rgba(15, 23, 42, 0.05) !important;
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
    box-shadow:
        0 0 0 2px #ede9fe,
        0 1px 2px rgba(15, 23, 42, 0.05);
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

.location-source-toggle {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.location-source-toggle button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 9px 12px;
    color: #64748b;
    font-weight: 600;
}

.location-source-toggle button.active {
    border-color: #8b5cf6;
    background: #f5f3ff;
    color: #7c3aed;
}

.location-source-badge {
    border-radius: 999px;
    padding: 2px 8px;
    font-size: 0.7rem;
    font-weight: 700;
}

.location-source-badge.is-map {
    background: #ede9fe;
    color: #7c3aed;
}

.location-source-badge.is-unverified {
    background: #fef3c7;
    color: #b45309;
}

.legacy-address-notice {
    display: flex;
    flex-direction: column;
    gap: 4px;
    border: 1px solid #f59e0b;
    border-radius: 7px;
    background: #fffbeb;
    padding: 10px 12px;
    color: #92400e;
    font-size: 0.82rem;
}

.alamat-danger-button {
    border-color: #dc2626;
    background: #ef4444;
}

.alamat-danger-button:not(:disabled):hover {
    background: #dc2626;
}

@media (min-width: 1536px) {
    .alamat-search-control {
        max-width: 520px;
    }

    .alamat-add-control {
        width: 220px;
        max-width: 220px;
    }
}

@media (max-width: 520px) {
    .location-source-toggle {
        grid-template-columns: 1fr;
    }
}
</style>
