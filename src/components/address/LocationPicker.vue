<template>
    <div class="location-picker">
        <div class="location-search">
            <label :for="searchInputId">Cari alamat</label>
            <div class="location-search-input-wrap">
                <input
                    :id="searchInputId"
                    v-model="searchQuery"
                    type="search"
                    autocomplete="off"
                    placeholder="Cari jalan, gedung, atau wilayah"
                    @input="scheduleAutocomplete"
                />
                <i v-if="isSearching" class="fa-solid fa-spinner fa-spin-pulse"></i>
            </div>

            <div v-if="suggestions.length" class="location-suggestions">
                <button
                    v-for="suggestion in suggestions"
                    :key="suggestion.place_id || `${suggestion.lat}-${suggestion.lon}`"
                    type="button"
                    @click="selectSuggestion(suggestion)"
                >
                    <strong>{{ suggestion.address_line1 || suggestion.name || suggestion.formatted }}</strong>
                    <span>{{ suggestion.address_line2 || suggestion.formatted }}</span>
                </button>
            </div>
        </div>

        <div ref="mapContainer" class="location-map" aria-label="Peta pemilih lokasi"></div>

        <button type="button" class="current-location-button" :disabled="isLocating" @click="useCurrentLocation">
            <i :class="isLocating ? 'fa-solid fa-spinner fa-spin-pulse' : 'fa-solid fa-location-crosshairs'"></i>
            {{ isLocating ? 'Mengambil lokasi...' : 'Gunakan Lokasi Saya' }}
        </button>

        <p v-if="serviceError" class="location-error" role="alert">
            {{ serviceError }}
        </p>

        <div class="selected-location">
            <span>Lokasi yang dipilih <span class="required-mark">*</span></span>
            <div
                class="selected-location-value"
                :class="{
                    'is-empty': !localValue.formatted_address,
                    'is-error': locationError,
                }"
            >
                {{ localValue.formatted_address || 'Cari alamat atau tentukan posisi marker pada peta.' }}
            </div>
            <small v-if="locationError" class="location-error">{{ locationError }}</small>
        </div>

        <label class="address-detail" :for="detailInputId">
            <span>Detail alamat <span class="required-mark">*</span></span>
            <textarea
                :id="detailInputId"
                :value="localValue.address_detail"
                :class="{ 'is-error': detailError }"
                rows="3"
                placeholder="Nomor rumah, blok, lantai, RT/RW, atau patokan"
                @input="updateDetail($event.target.value)"
            >
            </textarea>
            <small v-if="detailError" class="location-error">{{ detailError }}</small>
        </label>
    </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { autocompleteAddress, geoapifyApiKey, GeoapifyRequestError, reverseGeocode } from '@/services/geoapify';

// Resolver default Leaflet menambahkan direktori gambar yang terdeteksi sebagai prefix.
// Vite sudah mengubah import ini menjadi URL asset lengkap sehingga prefix ganda akan menduplikasi path.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const JAKARTA_CENTER = { latitude: -6.2, longitude: 106.8166667 };
const INDONESIA_BOUNDS = [
    [-11.2, 94.7],
    [6.3, 141.1],
];

export default {
    name: 'LocationPicker',

    props: {
        modelValue: {
            type: Object,
            default: () => ({}),
        },
        locationError: {
            type: String,
            default: '',
        },
        detailError: {
            type: String,
            default: '',
        },
    },

    emits: ['update:modelValue', 'unavailable', 'detail-input'],

    /**
     * Membuat state reaktif yang digunakan komponen untuk location picker.
     *
     * @returns {Object} State reaktif yang diinisialisasi untuk komponen.
     */
    data() {
        return {
            map: null,
            marker: null,
            mapResizeObserver: null,
            lastMapSize: { width: 0, height: 0 },
            tileErrorCount: 0,
            searchQuery: '',
            suggestions: [],
            searchTimer: null,
            searchController: null,
            reverseController: null,
            isSearching: false,
            isLocating: false,
            serviceError: '',
            localValue: this.normalizeValue(this.modelValue),
            lastValidCoordinate: null,
            instanceId: `location-${Math.random().toString(36).slice(2)}`,
        };
    },

    computed: {
        /**
         * Memproses pencarian input id untuk location picker.
         *
         * @returns {string} Teks pencarian input id yang telah diformat atau ditentukan.
         */
        searchInputId() {
            return `${this.instanceId}-search`;
        },
        /**
         * Memproses detail input id untuk location picker.
         *
         * @returns {string} Teks detail input id yang telah diformat atau ditentukan.
         */
        detailInputId() {
            return `${this.instanceId}-detail`;
        },
    },

    /**
     * Menginisialisasi behavior komponen yang bergantung pada browser setelah mounted untuk location picker.
     *
     * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
     */
    mounted() {
        if (!geoapifyApiKey) {
            this.markUnavailable('Layanan pinpoint belum dikonfigurasi. Alamat belum dapat disimpan.');
            return;
        }

        this.$nextTick(this.initializeMap);
    },

    /**
     * Melepaskan resource komponen dan pekerjaan tertunda sebelum location picker di-unmount.
     *
     * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
     */
    beforeUnmount() {
        clearTimeout(this.searchTimer);
        this.searchController?.abort();
        this.reverseController?.abort();
        this.mapResizeObserver?.disconnect();
        this.map?.remove();
    },

    methods: {
        /**
         * Menormalkan data opsional dari form parent menjadi struktur nilai location picker yang lengkap.
         *
         * @param {Object} value Data lokasi yang diberikan oleh form parent.
         *
         * @returns {Object} Normalized location data yang digunakan oleh the picker.
         */
        normalizeValue(value = {}) {
            return {
                latitude: value.latitude ?? null,
                longitude: value.longitude ?? null,
                geoapify_place_id: value.geoapify_place_id ?? null,
                formatted_address: value.formatted_address ?? '',
                address_detail: value.address_detail ?? '',
            };
        },

        /**
         * Mengembalikan koordinat Indonesia dari data lokasi yang tersimpan.
         *
         * API dapat melakukan serialisasi kolom decimal sebagai string, sehingga nilainya dinormalkan
         * sebelum state Leaflet dipulihkan.
         *
         * @param {*} value Data lokasi tersimpan yang koordinatnya akan dinormalkan dan divalidasi.
         *
         * @returns {Object} Object yang telah disiapkan untuk alur saat ini.
         */
        getIndonesiaCoordinate(value) {
            if (
                value.latitude === null ||
                value.latitude === '' ||
                value.longitude === null ||
                value.longitude === ''
            ) {
                return null;
            }

            const latitude = Number(value.latitude);
            const longitude = Number(value.longitude);
            const indonesiaBounds = L.latLngBounds(INDONESIA_BOUNDS);
            if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude) ||
                !indonesiaBounds.contains([latitude, longitude])
            ) {
                return null;
            }

            return { latitude, longitude };
        },

        /**
         * Menerapkan data lokasi yang diterima secara asynchronous dari form parent.
         *
         * Data company dimuat setelah location picker di-mount, sehingga nilai internal,
         * marker, dan viewport peta juga harus mengikuti pembaruan model berikutnya.
         *
         * @param {*} value Data lokasi terbaru dari form parent yang akan diterapkan ke picker.
         *
         * @returns {void} Memperbarui state komponen atau aplikasi tanpa mengembalikan nilai.
         */
        applyModelValue(value) {
            const normalizedValue = this.normalizeValue(value);
            const fields = ['latitude', 'longitude', 'geoapify_place_id', 'formatted_address', 'address_detail'];
            const hasChanged = fields.some((field) => normalizedValue[field] !== this.localValue[field]);
            if (!hasChanged) return;

            this.localValue = normalizedValue;

            const coordinate = this.getIndonesiaCoordinate(normalizedValue);
            if (!coordinate) return;

            this.restoreMapViewport(coordinate);
        },

        /**
         * Menjaga marker tersimpan tetap berada di tengah setelah container tersembunyi ditampilkan.
         *
         * @param {*} coordinate Koordinat geografis untuk memulihkan atau memperbarui peta.
         *
         * @returns {void} Memperbarui state komponen atau aplikasi tanpa mengembalikan nilai.
         */
        restoreMapViewport(coordinate) {
            this.lastValidCoordinate = coordinate;
            this.marker?.setLatLng([coordinate.latitude, coordinate.longitude]);
            this.map?.setView([coordinate.latitude, coordinate.longitude], 17, {
                animate: false,
            });
        },

        /**
         * Menginisialisasi peta yang dibatasi pada wilayah Indonesia dan menghubungkan interaksi marker.
         *
         * Koordinat tersimpan dipulihkan ketika tersedia; jika tidak, peta menggunakan
         * Jakarta hanya sebagai viewport awal dan tidak mengirimkannya sebagai lokasi terpilih.
         *
         * @returns {void}
         */
        initializeMap() {
            const indonesiaBounds = L.latLngBounds(INDONESIA_BOUNDS);
            const coordinate = this.getIndonesiaCoordinate(this.localValue);
            const hasCoordinate = coordinate !== null;
            const latitude = coordinate?.latitude ?? JAKARTA_CENTER.latitude;
            const longitude = coordinate?.longitude ?? JAKARTA_CENTER.longitude;
            this.lastValidCoordinate = { latitude, longitude };

            this.map = L.map(this.$refs.mapContainer, {
                zoomControl: false,
                minZoom: 5,
                maxBounds: indonesiaBounds,
                maxBoundsViscosity: 1,
            }).setView([latitude, longitude], hasCoordinate ? 17 : 15);
            L.control.zoom({ position: 'bottomleft' }).addTo(this.map);
            const retinaSuffix = L.Browser.retina ? '@2x' : '';
            const tileLayer = L.tileLayer(
                `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}${retinaSuffix}.png?apiKey=${geoapifyApiKey}`,
                {
                    maxZoom: 20,
                    attribution:
                        'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> contributors',
                },
            );

            tileLayer.on('tileerror', () => {
                this.tileErrorCount += 1;
                if (this.tileErrorCount >= 3) {
                    this.markUnavailable('Peta belum dapat dimuat. Alamat belum dapat disimpan.');
                }
            });
            tileLayer.addTo(this.map);

            this.marker = L.marker([latitude, longitude], {
                draggable: true,
            }).addTo(this.map);
            this.marker.on('dragend', () => {
                const coordinate = this.marker.getLatLng();
                this.confirmCoordinate(coordinate.lat, coordinate.lng);
            });
            this.map.on('click', (event) => {
                this.marker.setLatLng(event.latlng);
                this.confirmCoordinate(event.latlng.lat, event.latlng.lng);
            });

            this.observeMapSize();
            setTimeout(() => this.map?.invalidateSize({ pan: false }), 0);
        },

        /**
         * Menghitung ulang tile Leaflet setelah profile atau modal tersembunyi ditampilkan.
         * Tanpa langkah ini, Leaflet mempertahankan ukuran nol atau kecil yang dihitung saat inisialisasi.
         *
         * @returns {void} Memperbarui state komponen atau aplikasi tanpa mengembalikan nilai.
         */
        observeMapSize() {
            if (typeof ResizeObserver === 'undefined' || !this.$refs.mapContainer) return;

            this.mapResizeObserver = new ResizeObserver((entries) => {
                const { width, height } = entries[0]?.contentRect || {};
                if (!width || !height) return;
                if (width === this.lastMapSize.width && height === this.lastMapSize.height) return;

                this.lastMapSize = { width, height };
                requestAnimationFrame(() => {
                    if (!this.map) return;

                    this.map.invalidateSize({ pan: false, animate: false });

                    const coordinate = this.getIndonesiaCoordinate(this.localValue);
                    if (coordinate) this.restoreMapViewport(coordinate);
                });
            });
            this.mapResizeObserver.observe(this.$refs.mapContainer);
        },

        /**
         * Menerapkan debounce pada pencarian alamat dan membatalkan request yang tidak lagi relevan akibat input user.
         *
         * @returns {void}
         */
        scheduleAutocomplete() {
            clearTimeout(this.searchTimer);
            this.searchController?.abort();
            this.suggestions = [];
            this.serviceError = '';

            const query = this.searchQuery.trim();
            if (query.length < 3) {
                this.isSearching = false;
                return;
            }

            this.searchTimer = setTimeout(() => this.loadSuggestions(query), 400);
        },

        /**
         * Memuat saran alamat Indonesia untuk teks pencarian yang sedang aktif.
         *
         * @param {string} query Teks alamat dari user yang telah di-trim.
         *
         * @returns {Promise<void>}
         */
        async loadSuggestions(query) {
            const controller = new AbortController();
            this.searchController = controller;
            this.isSearching = true;

            try {
                const center = this.map?.getCenter();
                const suggestions = await autocompleteAddress(query, {
                    latitude: center?.lat,
                    longitude: center?.lng,
                    signal: controller.signal,
                });

                // Request lama dapat selesai setelah input terbaru pada browser yang terlambat
                // menjalankan pembatalan. Hanya request aktif yang boleh mengganti daftar saran.
                if (this.searchController === controller) this.suggestions = suggestions;
            } catch (error) {
                if (error.name !== 'AbortError') this.handleServiceError(error);
            } finally {
                if (this.searchController === controller) {
                    this.searchController = null;
                    this.isSearching = false;
                }
            }
        },

        /**
         * Menerapkan hasil autocomplete dan memindahkan peta ke koordinat yang telah diverifikasi.
         *
         * @param {Object} suggestion Hasil autocomplete Geoapify yang dipilih user.
         *
         * @returns {void}
         */
        selectSuggestion(suggestion) {
            const latitude = Number(suggestion.lat);
            const longitude = Number(suggestion.lon);
            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

            this.searchQuery = suggestion.formatted || suggestion.address_line1 || '';
            this.suggestions = [];
            this.marker.setLatLng([latitude, longitude]);
            this.map.setView([latitude, longitude], 17);
            this.applyLocation(suggestion, latitude, longitude);
        },

        /**
         * Melakukan reverse geocoding pada koordinat marker sebelum mengirimkannya ke form parent.
         *
         * Pencarian yang gagal atau kosong memulihkan marker terakhir yang terverifikasi agar peta
         * yang terlihat tetap sesuai dengan payload lokasi yang akan dikirim.
         *
         * @param {number} latitude Latitude marker yang dipilih user.
         * @param {number} longitude Longitude marker yang dipilih user.
         *
         * @returns {Promise<void>}
         */
        async confirmCoordinate(latitude, longitude) {
            this.reverseController?.abort();
            const controller = new AbortController();
            this.reverseController = controller;
            this.serviceError = '';

            try {
                const result = await reverseGeocode(latitude, longitude, controller.signal);
                if (!result) {
                    this.serviceError = 'Alamat pada titik tersebut belum ditemukan.';
                    this.restoreLastValidCoordinate();
                    return;
                }

                if (this.reverseController !== controller) return;
                this.applyLocation(result, latitude, longitude);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    this.handleServiceError(error);
                    this.restoreLastValidCoordinate();
                }
            } finally {
                if (this.reverseController === controller) this.reverseController = null;
            }
        },

        /**
         * Menerima hasil provider hanya ketika lokasi yang direpresentasikan berada di Indonesia.
         *
         * @param {Object} result Hasil geocoding Geoapify untuk titik terpilih.
         * @param {number} latitude Latitude terverifikasi untuk titik tersebut.
         * @param {number} longitude Longitude terverifikasi untuk titik tersebut.
         *
         * @returns {void}
         */
        applyLocation(result, latitude, longitude) {
            if (String(result.country_code || '').toLowerCase() !== 'id') {
                this.serviceError = 'Lokasi harus berada di wilayah Indonesia.';
                this.restoreLastValidCoordinate();
                return;
            }

            this.localValue = {
                ...this.localValue,
                latitude,
                longitude,
                geoapify_place_id: result.place_id || null,
                formatted_address: result.formatted || result.address_line1 || '',
            };
            this.lastValidCoordinate = { latitude, longitude };
            this.emitValue();
        },

        /**
         * Mengembalikan marker ke koordinat terakhir yang diterima provider.
         *
         * @returns {void}
         */
        restoreLastValidCoordinate() {
            if (!this.lastValidCoordinate) return;

            const { latitude, longitude } = this.lastValidCoordinate;
            this.marker?.setLatLng([latitude, longitude]);
            this.map?.panTo([latitude, longitude]);
        },

        /**
         * Memperbarui detail alamat yang ditulis user tanpa mengubah metadata provider.
         *
         * @param {string} addressDetail Detail rumah, unit, lantai, atau patokan alamat.
         *
         * @returns {void}
         */
        updateDetail(addressDetail) {
            this.localValue = {
                ...this.localValue,
                address_detail: addressDetail,
            };
            this.emitValue();
            this.$emit('detail-input', addressDetail);
        },

        /**
         * Mengirim snapshot lokasi immutable ke form parent.
         *
         * @returns {void}
         */
        emitValue() {
            this.$emit('update:modelValue', { ...this.localValue });
        },

        /**
         * Meminta koordinat perangkat dan memverifikasinya sebelum memilih lokasi.
         *
         * @returns {void}
         */
        useCurrentLocation() {
            if (!navigator.geolocation) {
                this.serviceError = 'Browser ini tidak mendukung pengambilan lokasi perangkat.';
                return;
            }

            this.isLocating = true;
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    this.marker.setLatLng([latitude, longitude]);
                    this.map.setView([latitude, longitude], 17);
                    this.isLocating = false;
                    this.confirmCoordinate(latitude, longitude);
                },
                () => {
                    this.isLocating = false;
                    this.serviceError = 'Izin lokasi tidak tersedia. Cari alamat atau pindahkan marker secara manual.';
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
            );
        },

        /**
         * Menerjemahkan kegagalan provider menjadi state UI yang dapat dipulihkan atau memblokir form.
         *
         * @param {Error} error Error yang terjadi saat memanggil Geoapify.
         *
         * @returns {void}
         */
        handleServiceError(error) {
            if (error instanceof GeoapifyRequestError && [401, 403, 429].includes(error.status)) {
                this.markUnavailable('Layanan pinpoint tidak tersedia. Alamat belum dapat disimpan.');
                return;
            }

            this.serviceError = 'Lokasi belum dapat dimuat. Silakan coba lagi.';
        },

        /**
         * Menandai pemilihan pinpoint tidak tersedia dan mencegah form parent menyimpan data.
         *
         * @param {string} message Penjelasan untuk user mengenai layanan yang tidak tersedia.
         *
         * @returns {void}
         */
        markUnavailable(message) {
            this.serviceError = message;
            this.$emit('unavailable', message);
        },
    },

    watch: {
        modelValue: {
            deep: true,
            /**
             * Menyinkronkan state komponen ketika nilai model location picker berubah.
             *
             * @param {*} value Nilai yang diproses oleh function.
             *
             * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
             */
            handler(value) {
                this.applyModelValue(value);
            },
        },
    },
};
</script>

<style scoped>
.location-picker {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.location-search {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.location-search-input-wrap {
    position: relative;
}

.location-search input,
.address-detail textarea {
    width: 100%;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px 12px;
    outline: none;
}

.location-search input:focus,
.address-detail textarea:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.12);
}

.location-search-input-wrap i {
    position: absolute;
    right: 12px;
    top: 13px;
    color: #7c3aed;
}

.location-suggestions {
    position: absolute;
    z-index: 1000;
    top: 72px;
    width: 100%;
    max-height: 230px;
    overflow-y: auto;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: white;
    box-shadow: 0 12px 25px rgba(15, 23, 42, 0.16);
}

.location-suggestions button {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 2px;
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #f1f5f9;
}

.location-suggestions button:hover {
    background: #f5f3ff;
}

.location-suggestions strong {
    color: #0f172a;
    font-size: 14px;
}

.location-suggestions span {
    color: #64748b;
    font-size: 12px;
}

.location-map {
    width: 100%;
    height: 320px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
}

.current-location-button {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #8b5cf6;
    border-radius: 6px;
    padding: 9px 12px;
    color: #7c3aed;
    font-weight: 600;
}

.current-location-button:disabled {
    opacity: 0.6;
}

.selected-location,
.address-detail {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.selected-location-value {
    min-height: 48px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: #f8fafc;
    padding: 10px 12px;
    color: #334155;
}

.selected-location-value.is-empty {
    color: #94a3b8;
}

.selected-location-value.is-error,
.address-detail textarea.is-error {
    border-color: #ef4444;
    box-shadow: 0 0 0 2px #fee2e2;
}

.required-mark,
.location-error {
    color: #ef4444;
}

.location-error {
    margin: 0;
    font-size: 13px;
}

@media (max-width: 640px) {
    .location-map {
        height: 260px;
    }

    /* Jaga kontrol zoom agar tidak bertumpuk dengan attribution ketika peta berukuran sempit. */
    :deep(.leaflet-bottom .leaflet-control-zoom) {
        margin-bottom: 42px;
    }
}
</style>
