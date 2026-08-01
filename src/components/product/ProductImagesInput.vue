<template>
    <div>
        <div class="flex items-start justify-between gap-3">
            <div>
                <p class="text-sm font-medium text-slate-700">Foto Produk</p>
                <p class="mt-1 text-xs leading-5 text-slate-500">
                    Foto pertama menjadi foto utama. Geser foto untuk mengubah urutan.
                </p>
            </div>
            <span class="shrink-0 text-xs font-medium text-slate-500">{{ images.length }} dari 5</span>
        </div>

        <input ref="imageFile" class="hidden" type="file" accept="image/*" multiple @change="addImages" />

        <draggable
            v-model="images"
            item-key="key"
            class="mt-3 grid grid-cols-2 gap-3 sm500:grid-cols-3"
            :animation="180"
            ghost-class="opacity-40"
        >
            <template #item="{ element, index }">
                <div
                    class="group relative aspect-square cursor-grab overflow-hidden rounded-md border border-slate-200 bg-slate-100 active:cursor-grabbing"
                >
                    <img :src="element.preview" :alt="`Foto produk ${index + 1}`" class="h-full w-full object-cover" />

                    <span
                        v-if="index === 0"
                        class="absolute left-2 top-2 rounded bg-violet-600 px-2 py-1 text-[.65rem] font-semibold text-white shadow-sm"
                    >
                        Foto Utama
                    </span>

                    <div
                        class="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-slate-950/75 to-transparent p-2 pt-8"
                    >
                        <button
                            type="button"
                            class="flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-slate-700 shadow-sm hover:bg-white"
                            :aria-label="`Perbesar foto ${index + 1}`"
                            @click.stop="openZoom(index)"
                        >
                            <i class="fa-solid fa-magnifying-glass-plus text-xs"></i>
                        </button>
                        <button
                            type="button"
                            class="flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-red-600 shadow-sm hover:bg-white"
                            :aria-label="`Hapus foto ${index + 1}`"
                            @click.stop="removeImage(index)"
                        >
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    </div>
                </div>
            </template>
        </draggable>

        <button
            v-if="images.length < 5"
            type="button"
            class="mt-3 inline-flex h-10 items-center gap-2 rounded-md border border-dashed border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
            @click="$refs.imageFile.click()"
        >
            <i class="fa-solid fa-plus text-xs"></i>
            Tambahkan Foto
        </button>

        <p class="mt-2 text-xs text-slate-500">Format gambar, maksimal 1 MB per foto.</p>
        <small v-if="error" class="mt-2 block text-sm text-red-500">{{ error }}</small>

        <el-image-viewer
            v-if="isZoomOpen"
            :url-list="images.map((image) => image.preview)"
            :initial-index="zoomIndex"
            :min-scale="0.2"
            :max-scale="7"
            :zoom-rate="1.2"
            :z-index="9999"
            teleported
            @close="isZoomOpen = false"
        />
    </div>
</template>

<script>
import { ElNotification } from 'element-plus';
import draggable from 'vuedraggable';

export default {
    components: {
        draggable,
    },

    props: {
        modelValue: {
            type: Array,
            required: true,
        },
        error: {
            type: String,
            default: '',
        },
    },

    emits: ['update:modelValue', 'clear-error'],

    /**
     * Membuat state reaktif yang digunakan komponen untuk produk gambar input.
     *
     * @returns {Object} State reaktif yang diinisialisasi untuk komponen.
     */
    data() {
        return {
            isZoomOpen: false,
            zoomIndex: 0,
            nextImageKey: 0,
        };
    },

    computed: {
        images: {
            /**
             * Mengembalikan daftar gambar yang sedang digunakan oleh input gambar produk.
             *
             * @returns {*} Nilai yang dihasilkan oleh operasi get.
             */
            get() {
                return this.modelValue;
            },
            /**
             * Memperbarui daftar gambar yang digunakan oleh input gambar produk.
             *
             * @param {*} images Nilai gambar yang diproses oleh function.
             *
             * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
             */
            set(images) {
                this.$emit('update:modelValue', images);
                this.$emit('clear-error');
            },
        },
    },

    /**
     * Melepaskan resource komponen dan pekerjaan tertunda sebelum unmount untuk produk gambar input.
     *
     * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
     */
    beforeUnmount() {
        this.revokeLocalPreviews(this.images);
    },

    methods: {
        /**
         * Membuat gambar untuk produk gambar input.
         *
         * @param {*} event Event browser atau komponen yang memicu handler.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        addImages(event) {
            const selectedFiles = Array.from(event.target.files || []);
            const availableSlots = 5 - this.images.length;

            if (selectedFiles.length > availableSlots) {
                ElNotification({
                    type: 'error',
                    title: 'Error',
                    message: `Maksimal 5 foto produk. Anda hanya dapat menambah ${availableSlots} foto.`,
                });
                this.clearFileInput();
                return;
            }

            const invalidType = selectedFiles.find((file) => !file.type.startsWith('image/'));
            const invalidSize = selectedFiles.find((file) => file.size > 1024 * 1024);

            if (invalidType || invalidSize) {
                ElNotification({
                    type: 'error',
                    title: 'Error',
                    message: invalidType
                        ? 'Setiap file foto harus berupa gambar.'
                        : 'Setiap foto maksimal berukuran 1 MB.',
                });
                this.clearFileInput();
                return;
            }

            const newImages = selectedFiles.map((file) => ({
                key: `new-${Date.now()}-${this.nextImageKey++}`,
                type: 'new',
                file,
                preview: URL.createObjectURL(file),
            }));

            this.images = [...this.images, ...newImages];
            this.clearFileInput();
        },

        /**
         * Menjalankan proses remove gambar dan menyinkronkan state hasilnya untuk produk gambar input.
         *
         * @param {*} index Posisi item target dengan indeks yang dimulai dari nol.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        removeImage(index) {
            const image = this.images[index];

            if (image?.type === 'new') URL.revokeObjectURL(image.preview);

            this.images = this.images.filter((item, itemIndex) => itemIndex !== index);
        },

        /**
         * Membuka zoom untuk produk gambar input.
         *
         * @param {*} index Posisi item target dengan indeks yang dimulai dari nol.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        openZoom(index) {
            this.zoomIndex = index;
            this.isZoomOpen = true;
        },

        /**
         * Menjalankan proses clear dan menyinkronkan state hasilnya untuk produk gambar input.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        clear() {
            this.revokeLocalPreviews(this.images);
            this.images = [];
            this.isZoomOpen = false;
            this.clearFileInput();
        },

        /**
         * Membersihkan file input untuk produk gambar input.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        clearFileInput() {
            if (this.$refs.imageFile) this.$refs.imageFile.value = '';
        },

        /**
         * Menjalankan proses revoke local previews dan menyinkronkan state hasilnya untuk produk gambar input.
         *
         * @param {*} images Nilai gambar yang diproses oleh function.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        revokeLocalPreviews(images) {
            images.filter((image) => image.type === 'new').forEach((image) => URL.revokeObjectURL(image.preview));
        },
    },
};
</script>
