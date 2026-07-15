<template>
    <div class="audit-page">
        <section class="audit-toolbar" aria-label="Filter audit log">
            <div class="audit-filter-group">
                <div class="audit-filter-field">
                    <label for="auditEventFilter">Jenis Aktivitas</label>
                    <el-select
                        id="auditEventFilter"
                        v-model="eventFilter"
                        placeholder="Semua Aktivitas"
                        @change="handleFilterChange">
                        <el-option
                            v-for="option in eventOptions"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value" />
                    </el-select>
                </div>

                <div class="audit-filter-field">
                    <label for="auditTimeFilter">Rentang Waktu</label>
                    <el-select
                        id="auditTimeFilter"
                        v-model="timeFilter"
                        @change="handleTimeFilterChange">
                        <el-option
                            v-for="option in timeOptions"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value" />
                    </el-select>
                </div>

                <div
                    v-if="timeFilter === 'custom'"
                    class="audit-filter-field audit-date-field audit-desktop-date-field">
                    <label for="auditDateRange">Rentang Tanggal</label>
                    <el-date-picker
                        id="auditDateRange"
                        v-model="customDateRange"
                        type="daterange"
                        range-separator="-"
                        start-placeholder="Mulai"
                        end-placeholder="Selesai"
                        value-format="YYYY-MM-DD"
                        format="DD MMM YYYY"
                        :clearable="false"
                        @change="handleCustomDateChange" />
                </div>

                <div v-if="timeFilter === 'custom'" class="audit-mobile-date-fields">
                    <div class="audit-filter-field audit-mobile-date-field">
                        <label for="auditStartDate">Tanggal mulai</label>
                        <el-date-picker
                            id="auditStartDate"
                            v-model="mobileCustomStartDate"
                            type="date"
                            placeholder="Pilih tanggal mulai"
                            value-format="YYYY-MM-DD"
                            format="DD MMM YYYY"
                            :clearable="false"
                            :disabled-date="disableMobileStartDate" />
                    </div>

                    <div class="audit-filter-field audit-mobile-date-field">
                        <label for="auditEndDate">Tanggal selesai</label>
                        <el-date-picker
                            id="auditEndDate"
                            v-model="mobileCustomEndDate"
                            type="date"
                            placeholder="Pilih tanggal selesai"
                            value-format="YYYY-MM-DD"
                            format="DD MMM YYYY"
                            :clearable="false"
                            :disabled-date="disableMobileEndDate" />
                    </div>
                </div>
            </div>

            <button
                type="button"
                class="audit-refresh-button"
                :disabled="isLoadingInitial"
                title="Muat ulang audit log"
                aria-label="Muat ulang audit log"
                @click="refreshAuditLogs">
                <i class="fa-solid fa-rotate-right" :class="{'fa-spin': isLoadingInitial}"></i>
                <span>Refresh</span>
            </button>
        </section>

        <section v-if="initialError" class="audit-state-card is-error">
            <div class="audit-state-icon" aria-hidden="true">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3>Audit log gagal dimuat</h3>
            <p>{{ initialError }}</p>
            <button type="button" class="audit-primary-button" @click="refreshAuditLogs">Coba Lagi</button>
        </section>

        <section v-else-if="isLoadingInitial" class="audit-skeleton-list" aria-label="Memuat audit log">
            <div v-for="index in 4" :key="index" class="audit-skeleton-card">
                <div class="audit-skeleton-icon"></div>
                <div class="audit-skeleton-content">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </section>

        <section v-else-if="auditLogs.length === 0" class="audit-state-card">
            <div class="audit-state-icon" aria-hidden="true">
                <i class="fa-solid fa-clock-rotate-left"></i>
            </div>
            <template v-if="hasActiveFilter">
                <h3>Aktivitas tidak ditemukan</h3>
                <p>Tidak ada aktivitas yang sesuai dengan filter dan rentang tanggal yang dipilih.</p>
                <button type="button" class="audit-secondary-button" @click="resetFilters">Reset Filter</button>
            </template>
            <template v-else>
                <h3>Belum ada aktivitas</h3>
                <p>Aktivitas register, login, dan logout akan tampil di halaman ini.</p>
            </template>
        </section>

        <template v-else>
            <section class="audit-list" aria-live="polite">
                <article v-for="audit in auditLogs" :key="audit.id" class="audit-card">
                    <div class="audit-event-icon" :class="eventClass(audit.event)" aria-hidden="true">
                        <i :class="eventIcon(audit.event)"></i>
                    </div>

                    <div class="audit-card-content">
                        <div class="audit-card-heading">
                            <div>
                                <div class="audit-title-row">
                                    <h3>{{ audit.title }}</h3>
                                    <span class="audit-event-badge">{{ audit.event_label }}</span>
                                </div>
                                <p>{{ audit.description }}</p>
                            </div>

                            <button type="button" class="audit-detail-button" @click="openDetail(audit)">
                                Detail
                                <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                            </button>
                        </div>

                        <div class="audit-meta-list">
                            <span v-if="deviceSummary(audit.device)">
                                <i class="fa-solid fa-laptop" aria-hidden="true"></i>
                                {{ deviceSummary(audit.device) }}
                            </span>
                            <span v-if="audit.ip_address">
                                <i class="fa-solid fa-network-wired" aria-hidden="true"></i>
                                IP {{ audit.ip_address }}
                            </span>
                            <time :datetime="audit.occurred_at">
                                <i class="fa-regular fa-clock" aria-hidden="true"></i>
                                {{ formatOccurredAt(audit.occurred_at) }}
                            </time>
                        </div>
                    </div>
                </article>
            </section>

            <div class="audit-pagination">
                <div v-if="loadMoreError" class="audit-load-more-error">
                    <span>{{ loadMoreError }}</span>
                    <button type="button" @click="loadMore">Coba Lagi</button>
                </div>

                <button
                    v-if="hasMore && !loadMoreError"
                    type="button"
                    class="audit-load-more-button"
                    :disabled="isLoadingMore"
                    @click="loadMore">
                    <i v-if="isLoadingMore" class="fa-solid fa-spinner fa-spin-pulse"></i>
                    {{ isLoadingMore ? 'Memuat...' : 'Muat Aktivitas Lainnya' }}
                </button>
            </div>
        </template>

        <Modal v-model:show="modal.detail" panel-class="audit-detail-modal-panel">
            <div class="audit-detail-modal">
                <div class="audit-detail-header">
                    <div>
                        <span class="audit-detail-eyebrow">Detail Aktivitas</span>
                        <h3>{{ selectedAudit?.title || 'Memuat aktivitas...' }}</h3>
                        <p v-if="selectedAudit?.occurred_at">{{ formatOccurredAt(selectedAudit.occurred_at) }}</p>
                    </div>

                    <button
                        type="button"
                        class="audit-modal-close"
                        aria-label="Tutup detail aktivitas"
                        @click="closeDetail">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div v-if="isLoadingDetail" class="audit-detail-loading">
                    <i class="fa-solid fa-spinner fa-spin-pulse"></i>
                    Memuat detail aktivitas...
                </div>

                <div v-else-if="detailError" class="audit-detail-error">
                    <p>{{ detailError }}</p>
                    <button type="button" class="audit-secondary-button" @click="loadDetail">Coba Lagi</button>
                </div>

                <template v-else-if="selectedAudit">
                    <p class="audit-detail-description">{{ selectedAudit.description }}</p>

                    <dl class="audit-detail-list">
                        <div v-if="selectedAudit.auth_method">
                            <dt>Metode login</dt>
                            <dd>{{ selectedAudit.auth_method }}</dd>
                        </div>
                        <div v-if="selectedAudit.device?.device_type">
                            <dt>Perangkat</dt>
                            <dd>{{ selectedAudit.device.device_type }}</dd>
                        </div>
                        <div v-if="selectedAudit.device?.browser">
                            <dt>Browser</dt>
                            <dd>{{ selectedAudit.device.browser }}</dd>
                        </div>
                        <div v-if="selectedAudit.device?.operating_system">
                            <dt>Sistem operasi</dt>
                            <dd>{{ selectedAudit.device.operating_system }}</dd>
                        </div>
                        <div v-if="selectedAudit.ip_address" class="audit-ip-row">
                            <dt>Alamat IP</dt>
                            <dd class="audit-ip-value">
                                <code>{{ displayedDetailIp }}</code>
                                <button
                                    type="button"
                                    :title="isIpVisible ? 'Sembunyikan alamat IP' : 'Tampilkan alamat IP'"
                                    :aria-label="isIpVisible ? 'Sembunyikan alamat IP' : 'Tampilkan alamat IP'"
                                    @click="isIpVisible = !isIpVisible">
                                    <i :class="isIpVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                                </button>
                            </dd>
                        </div>
                        <div>
                            <dt>Status</dt>
                            <dd><span class="audit-success-badge">Berhasil</span></dd>
                        </div>
                    </dl>

                    <div class="audit-security-note">
                        <div>
                            <strong>Tidak mengenali aktivitas ini?</strong>
                            <p>Periksa dan keluarkan perangkat lain melalui halaman Keamanan.</p>
                        </div>
                        <router-link :to="{name: 'settings_security'}" @click="closeDetail">
                            Buka Pengaturan Keamanan
                        </router-link>
                    </div>
                </template>
            </div>
        </Modal>
    </div>
</template>

<script>
import axios from '@/axios';
import Modal from '@/components/partials/ModalView.vue';

export default {
    components: {
        Modal,
    },

    data() {
        return {
            eventOptions: [
                {label: 'Semua Aktivitas', value: ''},
                {label: 'Register', value: 'auth.registered'},
                {label: 'Login', value: 'auth.logged_in'},
                {label: 'Logout', value: 'auth.logged_out'},
            ],
            timeOptions: [
                {label: '7 Hari Terakhir', value: '7'},
                {label: '30 Hari Terakhir', value: '30'},
                {label: '90 Hari Terakhir', value: '90'},
                {label: 'Rentang Tanggal', value: 'custom'},
            ],
            eventFilter: '',
            timeFilter: '30',
            customDateRange: [],
            auditLogs: [],
            nextCursor: null,
            hasMore: false,
            isLoadingInitial: false,
            isLoadingMore: false,
            isLoadingDetail: false,
            initialError: '',
            loadMoreError: '',
            detailError: '',
            collectionRequestVersion: 0,
            detailRequestVersion: 0,
            selectedAudit: null,
            selectedMaskedIp: '',
            isIpVisible: false,
            modal: {
                detail: false,
            },
        };
    },

    computed: {
        hasActiveFilter() {
            return this.eventFilter !== '' || this.timeFilter !== '30';
        },

        mobileCustomStartDate: {
            get() {
                return this.customDateRange?.[0] || '';
            },
            set(value) {
                this.updateMobileCustomDate(0, value);
            },
        },

        mobileCustomEndDate: {
            get() {
                return this.customDateRange?.[1] || '';
            },
            set(value) {
                this.updateMobileCustomDate(1, value);
            },
        },

        displayedDetailIp() {
            if(this.isIpVisible)
                return this.selectedAudit?.ip_address || '';

            return this.selectedMaskedIp || this.selectedAudit?.ip_address || '';
        },
    },

    watch: {
        'modal.detail'(isOpen) {
            if(!isOpen)
                this.resetDetailState();
        },
    },

    mounted() {
        this.loadAuditLogs();
    },

    methods: {
        /**
         * Memulai collection baru agar cursor dan response filter lama
         * tidak tercampur dengan filter yang sedang aktif.
         */
        handleFilterChange() {
            this.loadAuditLogs();
        },

        /**
         * Mengaktifkan preset tanggal atau menunggu input custom lengkap.
         */
        handleTimeFilterChange() {
            if(this.timeFilter !== 'custom') {
                this.customDateRange = [];
                this.loadAuditLogs();
            }
        },

        /**
         * Memuat ulang collection setelah dua tanggal custom tersedia.
         */
        handleCustomDateChange() {
            if(this.customDateRange?.length === 2)
                this.loadAuditLogs();
        },

        /**
         * Menyatukan input tanggal mobile dengan rentang tanggal utama.
         *
         * @param {number} index Posisi tanggal mulai atau selesai.
         * @param {string} value Tanggal terpilih dalam format YYYY-MM-DD.
         */
        updateMobileCustomDate(index, value) {
            // --- step 1 - start - salin rentang agar perubahan computed tetap reaktif
            const nextRange = Array.isArray(this.customDateRange)
                ? [...this.customDateRange]
                : [];
            nextRange[index] = value || '';
            this.customDateRange = nextRange;
            // --- step 1 - end - salin rentang agar perubahan computed tetap reaktif

            // --- step 2 - start - muat data hanya setelah kedua batas tanggal lengkap
            if(nextRange[0] && nextRange[1])
                this.loadAuditLogs();
            // --- step 2 - end - muat data hanya setelah kedua batas tanggal lengkap
        },

        /**
         * Mencegah tanggal mulai melewati tanggal selesai yang sudah dipilih.
         *
         * @param {Date} date Kandidat tanggal dari date picker.
         * @returns {boolean}
         */
        disableMobileStartDate(date) {
            if(!this.mobileCustomEndDate)
                return false;

            return this.formatDateValue(date) > this.mobileCustomEndDate;
        },

        /**
         * Mencegah tanggal selesai mendahului tanggal mulai yang sudah dipilih.
         *
         * @param {Date} date Kandidat tanggal dari date picker.
         * @returns {boolean}
         */
        disableMobileEndDate(date) {
            if(!this.mobileCustomStartDate)
                return false;

            return this.formatDateValue(date) < this.mobileCustomStartDate;
        },

        /**
         * Memuat ulang halaman pertama tanpa mengubah filter aktif.
         */
        refreshAuditLogs() {
            this.loadAuditLogs();
        },

        /**
         * Mengembalikan filter ke default 30 hari dan mengambil data baru.
         */
        resetFilters() {
            this.eventFilter = '';
            this.timeFilter = '30';
            this.customDateRange = [];
            this.loadAuditLogs();
        },

        /**
         * Mengambil halaman pertama atau halaman cursor berikutnya.
         *
         * @param {Object} options Pengaturan request collection.
         * @param {boolean} options.append Menentukan replace atau append list.
         */
        async loadAuditLogs({append = false} = {}) {
            // --- step 1 - start - cegah load-more yang tidak diperlukan atau masih berjalan
            const shouldSkipLoadMore = append && (!this.hasMore || this.isLoadingMore);
            // --- step 1 - end - cegah load-more yang tidak diperlukan atau masih berjalan

            if(shouldSkipLoadMore)
                return;

            // --- step 2 - start - siapkan state initial load atau pagination lanjutan
            if(!append) {
                this.collectionRequestVersion += 1;
                this.nextCursor = null;
                this.hasMore = false;
                this.initialError = '';
                this.loadMoreError = '';
                this.isLoadingInitial = true;
            } else {
                this.isLoadingMore = true;
                this.loadMoreError = '';
            }
            // --- step 2 - end - siapkan state initial load atau pagination lanjutan

            const requestVersion = this.collectionRequestVersion;

            // --- step 3 - start - proses response hanya untuk versi filter yang masih aktif
            try {
                const response = await axios.get('/audit-logs', {
                    params: this.buildCollectionParams(append),
                });

                if(requestVersion !== this.collectionRequestVersion)
                    return;

                const nextItems = Array.isArray(response.data?.data) ? response.data.data : [];
                this.auditLogs = append ? [...this.auditLogs, ...nextItems] : nextItems;
                this.nextCursor = response.data?.meta?.next_cursor || null;
                this.hasMore = Boolean(response.data?.meta?.has_more && this.nextCursor);
            } catch(error) {
                if(requestVersion !== this.collectionRequestVersion)
                    return;

                const message = error?.response?.data?.message
                    || 'Periksa koneksi Anda lalu coba kembali.';

                if(append)
                    this.loadMoreError = message;
                else
                    this.initialError = message;
            } finally {
                if(requestVersion === this.collectionRequestVersion) {
                    this.isLoadingInitial = false;
                    this.isLoadingMore = false;
                }
            }
            // --- step 3 - end - proses response hanya untuk versi filter yang masih aktif
        },

        /**
         * Meminta cursor berikutnya dan mempertahankan list yang sudah tampil.
         */
        loadMore() {
            this.loadAuditLogs({append: true});
        },

        /**
         * Membentuk query API dari filter, tanggal, dan cursor aktif.
         *
         * @param {boolean} append Menentukan apakah cursor perlu dikirim.
         */
        buildCollectionParams(append) {
            const params = {
                per_page: 20,
            };

            if(this.eventFilter)
                params.event = this.eventFilter;

            const dateRange = this.resolveDateRange();
            if(dateRange.from)
                params.from = dateRange.from;
            if(dateRange.to)
                params.to = dateRange.to;
            if(append && this.nextCursor)
                params.cursor = this.nextCursor;

            return params;
        },

        /**
         * Mengubah preset hari atau date picker menjadi from/to API.
         */
        resolveDateRange() {
            if(this.timeFilter === 'custom') {
                return {
                    from: this.customDateRange?.[0] || '',
                    to: this.customDateRange?.[1] || '',
                };
            }

            const totalDays = Number(this.timeFilter || 30);

            return {
                from: this.resolveJakartaDateValue(-Math.max(totalDays - 1, 0)),
                to: this.resolveJakartaDateValue(),
            };
        },

        /**
         * Membentuk tanggal kalender Asia/Jakarta agar preset tidak bergeser
         * ketika browser memakai timezone yang berbeda dari aplikasi.
         *
         * @param {number} offsetDays Selisih hari kalender dari hari ini.
         * @returns {string}
         */
        resolveJakartaDateValue(offsetDays = 0) {
            // --- step 1 - start - ambil komponen hari ini langsung pada timezone aplikasi
            const parts = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Jakarta',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }).formatToParts(new Date());
            const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
            // --- step 1 - end - ambil komponen hari ini langsung pada timezone aplikasi

            // --- step 2 - start - hitung offset sebagai hari kalender tanpa konversi timezone browser
            const date = new Date(Date.UTC(
                Number(values.year),
                Number(values.month) - 1,
                Number(values.day) + offsetDays,
            ));

            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');
            // --- step 2 - end - hitung offset sebagai hari kalender tanpa konversi timezone browser

            return `${year}-${month}-${day}`;
        },

        /**
         * Membentuk tanggal lokal YYYY-MM-DD tanpa pergeseran UTC.
         *
         * @param {Date} date Tanggal lokal yang akan dikirim ke API.
         */
        formatDateValue(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        },

        /**
         * Membuka modal dengan data masked lalu mengambil detail owner-scoped.
         *
         * @param {Object} audit Row audit dari collection.
         */
        async openDetail(audit) {
            this.selectedAudit = {...audit};
            this.selectedMaskedIp = audit.ip_address || '';
            this.isIpVisible = false;
            this.modal.detail = true;
            await this.loadDetail();
        },

        /**
         * Mengambil detail audit yang boleh membawa full IP milik user aktif.
         */
        async loadDetail() {
            // --- step 1 - start - pastikan detail masih memiliki id target yang valid
            const auditId = this.selectedAudit?.id || '';
            // --- step 1 - end - pastikan detail masih memiliki id target yang valid

            if(!auditId)
                return;

            const requestVersion = ++this.detailRequestVersion;
            this.isLoadingDetail = true;
            this.detailError = '';
            this.isIpVisible = false;

            // --- step 2 - start - terapkan response hanya jika modal dan target audit masih sama
            try {
                const response = await axios.get(`/audit-logs/${auditId}`);

                if(this.isCurrentDetailRequest(requestVersion, auditId))
                    this.selectedAudit = response.data?.data || this.selectedAudit;
            } catch(error) {
                if(this.isCurrentDetailRequest(requestVersion, auditId)) {
                    this.detailError = error?.response?.data?.message
                        || 'Detail aktivitas belum bisa dimuat. Coba lagi.';
                }
            } finally {
                if(this.isCurrentDetailRequest(requestVersion, auditId))
                    this.isLoadingDetail = false;
            }
            // --- step 2 - end - terapkan response hanya jika modal dan target audit masih sama
        },

        /**
         * Memastikan response detail masih milik modal dan request terbaru.
         *
         * @param {number} requestVersion Versi request yang sedang diselesaikan.
         * @param {string} auditId UUID audit target request.
         * @returns {boolean}
         */
        isCurrentDetailRequest(requestVersion, auditId) {
            return requestVersion === this.detailRequestVersion
                && this.modal.detail
                && this.selectedAudit?.id === auditId;
        },

        /**
         * Menutup modal melalui state v-model bersama komponen Modal.
         */
        closeDetail() {
            this.modal.detail = false;
        },

        /**
         * Menghapus full IP dan detail sementara ketika modal ditutup.
         */
        resetDetailState() {
            this.detailRequestVersion += 1;
            this.selectedAudit = null;
            this.selectedMaskedIp = '';
            this.isIpVisible = false;
            this.detailError = '';
            this.isLoadingDetail = false;
        },

        /**
         * Memetakan event API ke icon Font Awesome.
         *
         * @param {string} event Nama event audit.
         */
        eventIcon(event) {
            return {
                'auth.registered': 'fa-solid fa-user-plus',
                'auth.logged_in': 'fa-solid fa-right-to-bracket',
                'auth.logged_out': 'fa-solid fa-arrow-right-from-bracket',
            }[event] || 'fa-solid fa-clock-rotate-left';
        },

        /**
         * Memetakan event API ke variant warna icon.
         *
         * @param {string} event Nama event audit.
         */
        eventClass(event) {
            return {
                'auth.registered': 'is-register',
                'auth.logged_in': 'is-login',
                'auth.logged_out': 'is-logout',
            }[event] || '';
        },

        /**
         * Menggabungkan metadata perangkat yang benar-benar tersedia.
         *
         * @param {Object} device Metadata perangkat dari backend.
         */
        deviceSummary(device = {}) {
            return [device.browser, device.operating_system, device.device_type]
                .filter(Boolean)
                .join(' • ');
        },

        /**
         * Menampilkan timestamp API dalam zona Asia/Jakarta.
         *
         * @param {string} value Timestamp ISO 8601 dari backend.
         */
        formatOccurredAt(value) {
            if(!value)
                return '-';

            const date = new Date(value);
            if(Number.isNaN(date.getTime()))
                return '-';

            const formatted = new Intl.DateTimeFormat('id-ID', {
                timeZone: 'Asia/Jakarta',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23',
            }).format(date).replace(/\./g, ':');

            return `${formatted} WIB`;
        },
    },
};
</script>

<style scoped>
.audit-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 20px;
}

.audit-toolbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #ffffff;
    padding: 16px;
}

.audit-filter-group {
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 12px;
}

.audit-filter-field {
    width: 190px;
}

.audit-date-field {
    width: 320px;
}

.audit-mobile-date-fields {
    display: none;
}

.audit-filter-field label {
    display: block;
    margin-bottom: 6px;
    color: #475569;
    font-size: 12px;
    font-weight: 700;
}

.audit-filter-field :deep(.el-select),
.audit-filter-field :deep(.el-date-editor) {
    width: 100%;
}

.audit-refresh-button,
.audit-detail-button,
.audit-load-more-button,
.audit-primary-button,
.audit-secondary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 42px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    transition: 150ms ease-in-out;
}

.audit-refresh-button {
    border: 1px solid #ddd6fe;
    background: #f5f3ff;
    color: #7c3aed;
    padding: 0 15px;
}

.audit-refresh-button:not(:disabled):hover,
.audit-secondary-button:hover {
    border-color: #c4b5fd;
    background: #ede9fe;
}

button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.audit-list,
.audit-skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.audit-card {
    display: flex;
    gap: 14px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #ffffff;
    padding: 16px;
    box-shadow: 0 5px 16px rgba(15, 23, 42, 0.035);
}

.audit-event-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    border-radius: 10px;
    background: #f1f5f9;
    color: #64748b;
}

.audit-event-icon.is-register {
    background: #ecfdf5;
    color: #059669;
}

.audit-event-icon.is-login {
    background: #f5f3ff;
    color: #7c3aed;
}

.audit-event-icon.is-logout {
    background: #fff7ed;
    color: #ea580c;
}

.audit-card-content {
    min-width: 0;
    flex: 1;
}

.audit-card-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
}

.audit-title-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.audit-title-row h3 {
    color: #0f172a;
    font-size: 15px;
    font-weight: 750;
}

.audit-card-heading p,
.audit-detail-description {
    color: #64748b;
    font-size: 13px;
    line-height: 1.55;
}

.audit-card-heading p {
    margin-top: 4px;
}

.audit-detail-description {
    margin-top: 12px;
}

.audit-event-badge,
.audit-success-badge {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #64748b;
    font-size: 10px;
    font-weight: 800;
    padding: 0 8px;
}

.audit-success-badge {
    background: #dcfce7;
    color: #15803d;
}

.audit-detail-button {
    min-height: 34px;
    flex: 0 0 auto;
    border: 0;
    background: transparent;
    color: #7c3aed;
    padding: 0 4px 0 10px;
}

.audit-detail-button:hover {
    color: #6d28d9;
}

.audit-meta-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 18px;
    margin-top: 7px;
    color: #64748b;
    font-size: 12px;
}

.audit-meta-list span,
.audit-meta-list time {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.audit-state-card {
    display: flex;
    min-height: 300px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px dashed #cbd5e1;
    border-radius: 10px;
    background: #f8fafc;
    padding: 32px 20px;
    text-align: center;
}

.audit-state-card.is-error {
    border-color: #fecaca;
    background: #fffafa;
}

.audit-state-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
    border-radius: 12px;
    background: #ede9fe;
    color: #7c3aed;
    font-size: 19px;
}

.audit-state-card.is-error .audit-state-icon {
    background: #fee2e2;
    color: #dc2626;
}

.audit-state-card h3 {
    color: #1e293b;
    font-size: 17px;
    font-weight: 750;
}

.audit-state-card p {
    max-width: 520px;
    margin-top: 6px;
    color: #64748b;
    font-size: 13px;
    line-height: 1.6;
}

.audit-primary-button,
.audit-secondary-button {
    margin-top: 16px;
    padding: 0 16px;
}

.audit-primary-button {
    border: 1px solid #7c3aed;
    background: #8b5cf6;
    color: #ffffff;
}

.audit-secondary-button {
    border: 1px solid #ddd6fe;
    background: #f5f3ff;
    color: #7c3aed;
}

.audit-skeleton-card {
    display: flex;
    gap: 14px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #ffffff;
    padding: 16px;
}

.audit-skeleton-icon,
.audit-skeleton-content span {
    border-radius: 8px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: audit-shimmer 1.4s infinite;
}

.audit-skeleton-icon {
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
}

.audit-skeleton-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
}

.audit-skeleton-content span:nth-child(1) {
    width: 34%;
    height: 16px;
}

.audit-skeleton-content span:nth-child(2) {
    width: 62%;
    height: 12px;
}

.audit-skeleton-content span:nth-child(3) {
    width: 48%;
    height: 12px;
}

@keyframes audit-shimmer {
    to { background-position: -200% 0; }
}

.audit-pagination {
    display: flex;
    justify-content: center;
    padding: 4px 0 8px;
}

.audit-load-more-button {
    min-width: 220px;
    border: 1px solid #ddd6fe;
    background: #ffffff;
    color: #7c3aed;
    padding: 0 18px;
}

.audit-load-more-button:not(:disabled):hover {
    background: #f5f3ff;
}

.audit-load-more-error {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #b91c1c;
    font-size: 12px;
}

.audit-load-more-error button {
    color: #7c3aed;
    font-weight: 750;
}

.audit-detail-modal {
    width: 100%;
    padding: 22px;
}

:deep(.modal-panel.audit-detail-modal-panel) {
    width: min(620px, calc(100vw - 32px));
    min-height: 0;
}

.audit-detail-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 16px;
}

.audit-detail-eyebrow {
    display: block;
    margin-bottom: 4px;
    color: #8b5cf6;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.audit-detail-header h3 {
    color: #0f172a;
    font-size: 20px;
    font-weight: 750;
}

.audit-detail-header p {
    margin-top: 4px;
    color: #64748b;
    font-size: 12px;
}

.audit-modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    border-radius: 8px;
    background: #f1f5f9;
    color: #64748b;
}

.audit-modal-close:hover {
    background: #e2e8f0;
    color: #334155;
}

.audit-detail-loading,
.audit-detail-error {
    display: flex;
    min-height: 220px;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #64748b;
    font-size: 13px;
}

.audit-detail-error {
    flex-direction: column;
    text-align: center;
}

.audit-detail-list {
    margin-top: 18px;
    border: 1px solid #e2e8f0;
    border-radius: 9px;
    overflow: hidden;
}

.audit-detail-list > div {
    display: grid;
    align-items: center;
    grid-template-columns: 150px minmax(0, 1fr);
    gap: 16px;
    padding: 12px 14px;
}

.audit-detail-list > div + div {
    border-top: 1px solid #e2e8f0;
}

.audit-detail-list > .audit-ip-row {
    padding-block: 8px;
}

.audit-detail-list dt {
    color: #64748b;
    font-size: 12px;
    font-weight: 650;
}

.audit-detail-list dd {
    min-width: 0;
    color: #1e293b;
    font-size: 13px;
    font-weight: 650;
}

.audit-ip-value {
    display: flex;
    align-items: center;
    gap: 8px;
}

.audit-ip-value code {
    overflow-wrap: anywhere;
    color: #334155;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
}

.audit-ip-value button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex: 0 0 28px;
    border-radius: 6px;
    color: #7c3aed;
}

.audit-ip-value button:hover {
    background: #f5f3ff;
}

.audit-security-note {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 18px;
    border-radius: 9px;
    background: #f8fafc;
    padding: 14px;
}

.audit-security-note strong {
    color: #334155;
    font-size: 13px;
}

.audit-security-note p {
    margin-top: 3px;
    color: #64748b;
    font-size: 12px;
}

.audit-security-note a {
    flex: 0 0 auto;
    color: #7c3aed;
    font-size: 12px;
    font-weight: 750;
}

@media (max-width: 768px) {
    .audit-toolbar {
        position: static;
        z-index: auto;
        align-items: stretch;
        flex-direction: column;
    }

    .audit-filter-group {
        align-items: stretch;
        flex-direction: column;
    }

    .audit-filter-field,
    .audit-date-field {
        width: 100%;
    }

    .audit-desktop-date-field {
        display: none;
    }

    .audit-mobile-date-fields {
        display: flex;
        flex-direction: column;
        gap: 22px;
        width: 100%;
        margin-bottom: 10px;
    }

    .audit-mobile-date-field {
        width: 100%;
    }

    .audit-refresh-button {
        width: 100%;
    }

    .audit-security-note {
        align-items: flex-start;
        flex-direction: column;
    }

    .audit-detail-button {
        min-height: 32px;
        padding: 0 0 0 8px;
    }

    .audit-detail-list > div {
        grid-template-columns: 1fr;
        gap: 5px;
    }

    .audit-detail-list > .audit-ip-row {
        padding: 12px 14px;
    }
}

@media (max-width: 480px) {
    .audit-card {
        padding: 13px;
    }

    .audit-event-icon {
        width: 38px;
        height: 38px;
        flex-basis: 38px;
    }

    .audit-meta-list {
        align-items: flex-start;
        flex-direction: column;
    }

    .audit-detail-modal {
        padding: 17px;
    }
}
</style>
