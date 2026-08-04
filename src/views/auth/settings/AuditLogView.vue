<template>
    <div class="audit-page">
        <Teleport v-if="headerActionsTarget" :to="headerActionsTarget">
            <div
                ref="auditHeaderControls"
                class="audit-header-controls"
                @click.stop
                @keydown.esc="handleFilterPanelEscape"
            >
                <div
                    id="auditFilterPanel"
                    class="audit-filter-panel"
                    :class="{ 'is-open': isFilterPanelOpen }"
                    role="group"
                    aria-label="Filter audit log"
                >
                    <div class="audit-filter-group">
                        <div class="audit-filter-field audit-event-filter-field">
                            <label for="auditEventFilter">Jenis Aktivitas</label>
                            <el-select
                                id="auditEventFilter"
                                v-model="eventFilter"
                                filterable
                                no-match-text="Aktivitas tidak ditemukan"
                                popper-class="audit-event-filter-popper"
                                placeholder="Semua Aktivitas"
                                @change="handleFilterChange"
                            >
                                <el-option label="Semua Aktivitas" value="" />
                                <el-option-group v-for="group in eventGroups" :key="group.label" :label="group.label">
                                    <el-option
                                        v-for="option in group.options"
                                        :key="option.value"
                                        :label="option.label"
                                        :value="option.value"
                                    />
                                </el-option-group>
                            </el-select>
                        </div>

                        <div class="audit-filter-field audit-time-filter-field">
                            <label for="auditTimeFilter">Rentang Waktu</label>
                            <div
                                class="audit-time-select-control"
                                :title="timeFilter === 'custom' ? customDateRangeLabel : ''"
                            >
                                <el-select
                                    id="auditTimeFilter"
                                    v-model="timeFilter"
                                    :aria-label="
                                        timeFilter === 'custom' && customDateRangeLabel
                                            ? `Rentang Waktu, ${customDateRangeLabel}`
                                            : 'Rentang Waktu'
                                    "
                                    @pointerdown.capture="suppressTimeFilterKeyboard"
                                    @change="handleTimeFilterChange"
                                >
                                    <el-option
                                        v-for="option in timeOptions"
                                        :key="option.value"
                                        :label="option.label"
                                        :value="option.value"
                                        @click="handleTimeOptionClick(option.value)"
                                    />
                                </el-select>
                                <span
                                    v-if="timeFilter === 'custom' && customDateRangeLabel"
                                    class="audit-custom-date-label"
                                    aria-hidden="true"
                                >
                                    {{ customDateRangeLabel }}
                                </span>
                                <el-date-picker
                                    v-if="timeFilter === 'custom'"
                                    id="auditDateRange"
                                    ref="customDatePicker"
                                    v-model="customDateRange"
                                    class="audit-hidden-date-picker"
                                    type="daterange"
                                    range-separator="-"
                                    start-placeholder="Mulai"
                                    end-placeholder="Selesai"
                                    value-format="YYYY-MM-DD"
                                    format="DD MMM YYYY"
                                    placement="bottom-end"
                                    :offset="-8"
                                    :popper-options="customDatePopperOptions"
                                    popper-class="audit-custom-date-popper"
                                    :clearable="false"
                                    :editable="false"
                                    :tabindex="-1"
                                    aria-hidden="true"
                                    @change="handleCustomDateChange"
                                    @visible-change="handleCustomDatePickerVisibilityChange"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="audit-header-actions">
                    <button
                        type="button"
                        class="audit-filter-trigger"
                        aria-haspopup="dialog"
                        :aria-expanded="isFilterPanelOpen"
                        aria-controls="auditFilterPanel"
                        title="Buka filter audit log"
                        @click="toggleFilterPanel"
                    >
                        <i class="fa-solid fa-filter" aria-hidden="true"></i>
                        <span>Filter</span>
                    </button>

                    <button
                        type="button"
                        class="audit-icon-button audit-reset-button"
                        :disabled="!hasActiveFilter || isLoadingInitial"
                        title="Reset filter"
                        aria-label="Reset filter"
                        @click="resetFilters"
                    >
                        <i class="fa-solid fa-rotate-left" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </Teleport>

        <section v-if="initialError && auditLogs.length === 0" class="audit-state-card is-error">
            <div class="audit-state-icon" aria-hidden="true">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3>Audit log gagal dimuat</h3>
            <p>{{ initialError }}</p>
            <button type="button" class="audit-primary-button" @click="refreshAuditLogs">Coba Lagi</button>
        </section>

        <section
            v-else-if="isLoadingInitial && auditLogs.length === 0"
            class="audit-skeleton-list"
            aria-label="Memuat audit log"
        >
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
                <p>Aktivitas akun dan pengelolaan produk akan tampil di halaman ini.</p>
            </template>
        </section>

        <template v-else>
            <div v-if="initialError" class="audit-inline-error" role="alert">
                <span>{{ initialError }}</span>
                <button type="button" @click="refreshAuditLogs">Coba Lagi</button>
            </div>

            <section class="audit-list" aria-live="polite">
                <article v-for="audit in auditLogs" :key="audit.id" class="audit-card">
                    <div class="audit-event-icon" :class="eventClass(audit.event)" aria-hidden="true">
                        <i :class="eventIcon(audit.event)"></i>
                    </div>

                    <div class="audit-card-content">
                        <div class="audit-card-heading">
                            <div>
                                <h3>{{ audit.title }}</h3>
                                <p>{{ collectionDescription(audit) }}</p>
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
                    @click="loadMore"
                >
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
                        @click="closeDetail"
                    >
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

                    <section v-if="isAuditCategory(selectedAudit, 'product')" class="audit-product-detail">
                        <div class="audit-product-detail-heading">
                            <span>Produk</span>
                            <h4>{{ selectedAudit.subject?.name || 'Produk' }}</h4>
                            <p v-if="selectedAudit.event === 'product.deleted'">
                                Produk sudah dihapus. Data berikut adalah kondisi terakhir sebelum penghapusan.
                            </p>
                        </div>

                        <template v-if="selectedAudit.event === 'product.updated'">
                            <div v-if="productDetailChangeRows(selectedAudit).length" class="audit-change-table-wrap">
                                <table class="audit-change-table">
                                    <colgroup>
                                        <col class="audit-change-data-column" />
                                        <col class="audit-change-value-column" />
                                        <col class="audit-change-value-column" />
                                        <col class="audit-change-status-column" />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Sebelum</th>
                                            <th>Sesudah</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="change in productDetailChangeRows(selectedAudit)"
                                            :key="change.field"
                                        >
                                            <th>{{ change.label }}</th>
                                            <td>{{ formatProductValue(change.field, change.before) }}</td>
                                            <td>{{ formatProductValue(change.field, change.after) }}</td>
                                            <td>
                                                <span
                                                    class="audit-change-status"
                                                    :class="change.changed ? 'is-changed' : 'is-unchanged'"
                                                >
                                                    {{ change.changed ? 'Berubah' : 'Tetap' }}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div v-if="selectedAudit.image_changes" class="audit-image-change-summary">
                                <h5>Perubahan foto</h5>
                                <ul v-if="productImageChangeItems(selectedAudit.image_changes).length">
                                    <li
                                        v-for="item in productImageChangeItems(selectedAudit.image_changes)"
                                        :key="item"
                                    >
                                        {{ item }}
                                    </li>
                                </ul>
                                <p v-else>Tidak ada perubahan foto.</p>
                            </div>
                        </template>

                        <div v-else-if="selectedAudit.product_snapshot" class="audit-snapshot-table-wrap">
                            <table class="audit-snapshot-table">
                                <colgroup>
                                    <col class="audit-snapshot-data-column" />
                                    <col />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>
                                            {{
                                                selectedAudit.event === 'product.created'
                                                    ? 'Nilai awal'
                                                    : 'Nilai terakhir'
                                            }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="row in productSnapshotRows(selectedAudit)" :key="row.field">
                                        <th>{{ row.label }}</th>
                                        <td>{{ formatProductValue(row.field, row.value) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section v-if="isAuditCategory(selectedAudit, 'address')" class="audit-address-detail">
                        <div class="audit-address-detail-heading">
                            <span>Alamat</span>
                            <h4>{{ selectedAudit.subject?.name || 'Alamat' }}</h4>
                            <p v-if="selectedAudit.event === 'address.deleted'">
                                Alamat sudah dihapus. Data berikut adalah kondisi terakhir sebelum penghapusan.
                            </p>
                        </div>

                        <template v-if="selectedAudit.event === 'address.updated'">
                            <div v-if="addressDetailChangeRows(selectedAudit).length" class="audit-change-table-wrap">
                                <table class="audit-change-table">
                                    <colgroup>
                                        <col class="audit-change-data-column" />
                                        <col class="audit-change-value-column" />
                                        <col class="audit-change-value-column" />
                                        <col class="audit-change-status-column" />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Sebelum</th>
                                            <th>Sesudah</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="change in addressDetailChangeRows(selectedAudit)"
                                            :key="change.field"
                                        >
                                            <th>{{ change.label }}</th>
                                            <td>
                                                {{
                                                    change.field === 'phone'
                                                        ? displayedAddressPhone(change.before)
                                                        : formatAddressValue(change.before)
                                                }}
                                            </td>
                                            <td v-if="change.field === 'phone'">
                                                <span class="audit-address-sensitive-value">
                                                    <span>{{ displayedAddressPhone(change.after) }}</span>
                                                    <button
                                                        type="button"
                                                        :title="
                                                            isPhoneVisible
                                                                ? 'Sembunyikan nomor telepon'
                                                                : 'Tampilkan nomor telepon'
                                                        "
                                                        :aria-label="
                                                            isPhoneVisible
                                                                ? 'Sembunyikan nomor telepon'
                                                                : 'Tampilkan nomor telepon'
                                                        "
                                                        @click="isPhoneVisible = !isPhoneVisible"
                                                    >
                                                        <i
                                                            :class="
                                                                isPhoneVisible
                                                                    ? 'fa-regular fa-eye-slash'
                                                                    : 'fa-regular fa-eye'
                                                            "
                                                        ></i>
                                                    </button>
                                                </span>
                                            </td>
                                            <td v-else>{{ formatAddressValue(change.after) }}</td>
                                            <td>
                                                <span
                                                    class="audit-change-status"
                                                    :class="change.changed ? 'is-changed' : 'is-unchanged'"
                                                >
                                                    {{ change.changed ? 'Berubah' : 'Tetap' }}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </template>

                        <div v-else-if="selectedAudit.address_snapshot" class="audit-snapshot-table-wrap">
                            <table class="audit-snapshot-table">
                                <colgroup>
                                    <col class="audit-snapshot-data-column" />
                                    <col />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>{{ addressSnapshotHeading(selectedAudit) }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="row in addressSnapshotRows(selectedAudit)" :key="row.field">
                                        <th>{{ row.label }}</th>
                                        <td v-if="row.sensitive" class="audit-address-sensitive-value">
                                            <span>{{ displayedAddressPhone(row.value) }}</span>
                                            <button
                                                type="button"
                                                :title="
                                                    isPhoneVisible
                                                        ? 'Sembunyikan nomor telepon'
                                                        : 'Tampilkan nomor telepon'
                                                "
                                                :aria-label="
                                                    isPhoneVisible
                                                        ? 'Sembunyikan nomor telepon'
                                                        : 'Tampilkan nomor telepon'
                                                "
                                                @click="isPhoneVisible = !isPhoneVisible"
                                            >
                                                <i
                                                    :class="
                                                        isPhoneVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'
                                                    "
                                                ></i>
                                            </button>
                                        </td>
                                        <td v-else>{{ formatAddressValue(row.value) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <p v-if="selectedAudit.previous_address" class="audit-address-reference">
                            Sebelumnya: {{ selectedAudit.previous_address.place }} —
                            {{ formatAddressValue(selectedAudit.previous_address.recipient_name) }}
                        </p>
                        <p v-if="selectedAudit.replacement_address" class="audit-address-reference">
                            Alamat utama dialihkan ke: {{ selectedAudit.replacement_address.place }} —
                            {{ formatAddressValue(selectedAudit.replacement_address.recipient_name) }}
                        </p>
                    </section>

                    <section v-if="isAuditCategory(selectedAudit, 'profile')" class="audit-profile-detail">
                        <div class="audit-profile-detail-heading">
                            <span>{{
                                selectedAudit.event === 'profile.updated' ? 'Pengaturan Pengguna' : 'Foto Profil'
                            }}</span>
                            <h4>{{ selectedAudit.subject?.name || 'Profil Pengguna' }}</h4>
                        </div>

                        <div v-if="selectedAudit.event === 'profile.updated'" class="audit-change-table-wrap">
                            <table class="audit-change-table">
                                <colgroup>
                                    <col class="audit-change-data-column" />
                                    <col class="audit-change-value-column" />
                                    <col class="audit-change-value-column" />
                                    <col class="audit-change-status-column" />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Sebelum</th>
                                        <th>Sesudah</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="change in profileDetailChangeRows(selectedAudit)" :key="change.field">
                                        <th>{{ change.label }}</th>
                                        <td>
                                            {{
                                                change.field === 'phone'
                                                    ? displayedProfilePhone(change.before)
                                                    : formatProfileValue(change.field, change.before)
                                            }}
                                        </td>
                                        <td v-if="change.field === 'phone'">
                                            <span class="audit-profile-sensitive-value">
                                                <span>{{ displayedProfilePhone(change.after) }}</span>
                                                <button
                                                    type="button"
                                                    :title="
                                                        isPhoneVisible
                                                            ? 'Sembunyikan nomor telepon'
                                                            : 'Tampilkan nomor telepon'
                                                    "
                                                    :aria-label="
                                                        isPhoneVisible
                                                            ? 'Sembunyikan nomor telepon'
                                                            : 'Tampilkan nomor telepon'
                                                    "
                                                    @click="isPhoneVisible = !isPhoneVisible"
                                                >
                                                    <i
                                                        :class="
                                                            isPhoneVisible
                                                                ? 'fa-regular fa-eye-slash'
                                                                : 'fa-regular fa-eye'
                                                        "
                                                    ></i>
                                                </button>
                                            </span>
                                        </td>
                                        <td v-else>{{ formatProfileValue(change.field, change.after) }}</td>
                                        <td>
                                            <span
                                                class="audit-change-status"
                                                :class="change.changed ? 'is-changed' : 'is-unchanged'"
                                            >
                                                {{ change.changed ? 'Berubah' : 'Tetap' }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <p v-else class="audit-profile-image-summary">
                            {{
                                selectedAudit.profile_snapshot?.has_profile_image
                                    ? 'Foto profil berhasil diperbarui.'
                                    : 'Foto profil berhasil dihapus.'
                            }}
                        </p>
                    </section>

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
                                    @click="isIpVisible = !isIpVisible"
                                >
                                    <i :class="isIpVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                                </button>
                            </dd>
                        </div>
                        <div>
                            <dt>Status</dt>
                            <dd><span class="audit-success-badge">Berhasil</span></dd>
                        </div>
                    </dl>

                    <div v-if="isAuditCategory(selectedAudit, 'authentication')" class="audit-security-note">
                        <div>
                            <strong>Tidak mengenali aktivitas ini?</strong>
                            <p>Periksa dan keluarkan perangkat lain melalui halaman Keamanan.</p>
                        </div>
                        <router-link :to="{ name: 'settings_security' }" @click="closeDetail">
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

    /**
     * Membuat state reaktif yang digunakan komponen untuk halaman audit log.
     *
     * @returns {Object} State reaktif yang diinisialisasi untuk komponen.
     */
    data() {
        return {
            eventGroups: [
                {
                    label: 'Akun',
                    options: [
                        { label: 'Register', value: 'auth.registered' },
                        { label: 'Login', value: 'auth.logged_in' },
                        { label: 'Logout', value: 'auth.logged_out' },
                    ],
                },
                {
                    label: 'Produk',
                    options: [
                        { label: 'Produk Ditambahkan', value: 'product.created' },
                        { label: 'Produk Diperbarui', value: 'product.updated' },
                        { label: 'Produk Dihapus', value: 'product.deleted' },
                    ],
                },
                {
                    label: 'Alamat',
                    options: [
                        { label: 'Alamat Ditambahkan', value: 'address.created' },
                        { label: 'Alamat Diperbarui', value: 'address.updated' },
                        { label: 'Alamat Dihapus', value: 'address.deleted' },
                        { label: 'Alamat Dipilih', value: 'address.selected' },
                    ],
                },
                {
                    label: 'Profil',
                    options: [
                        { label: 'Pengaturan Pengguna Diperbarui', value: 'profile.updated' },
                        { label: 'Foto Profil Diperbarui', value: 'profile.image_uploaded' },
                        { label: 'Foto Profil Dihapus', value: 'profile.image_deleted' },
                    ],
                },
            ],
            timeOptions: [
                { label: '7 Hari Terakhir', value: '7' },
                { label: '30 Hari Terakhir', value: '30' },
                { label: '90 Hari Terakhir', value: '90' },
                { label: 'Rentang Tanggal', value: 'custom' },
            ],
            eventFilter: '',
            timeFilter: '30',
            appliedTimeFilter: '30',
            customDateRange: [],
            customDatePopperOptions: {
                modifiers: [
                    {
                        name: 'flip',
                        enabled: false,
                    },
                    {
                        name: 'centerCompactDatePicker',
                        enabled: true,
                        phase: 'main',
                        requires: ['popperOffsets'],
                        requiresIfExists: ['preventOverflow'],
                        fn({ state }) {
                            if (window.innerWidth > 865 || !state.modifiersData.popperOffsets) return;

                            // Keep the compact calendar centered in the viewport instead of following
                            // the right-aligned select, while Popper continues to control its vertical offset.
                            state.modifiersData.popperOffsets.x =
                                window.scrollX + (document.documentElement.clientWidth - state.rects.popper.width) / 2;
                        },
                    },
                ],
            },
            isCustomDateSelectionCommitted: false,
            isCustomDatePickerVisible: false,
            isCustomDateOpenPending: false,
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
            isPhoneVisible: false,
            isFilterPanelOpen: false,
            headerActionsTarget: null,
            modal: {
                detail: false,
            },
        };
    },

    computed: {
        /**
         * Menentukan apakah kondisi active filter terpenuhi untuk halaman audit log.
         *
         * @returns {boolean} Menunjukkan apakah kondisi has active filter terpenuhi.
         */
        hasActiveFilter() {
            return this.eventFilter !== '' || this.timeFilter !== '30';
        },

        /**
         * Membentuk label ringkas untuk menampilkan nilai rentang tanggal pada select tanpa mengubah label opsinya.
         *
         * Rentang dalam bulan yang sama diringkas menjadi `28–29 Agu 2026`, sedangkan rentang lintas bulan atau tahun
         * tetap menampilkan bagian tanggal yang diperlukan agar nilainya tidak ambigu.
         *
         * @returns {string} Label tanggal ringkas, atau string kosong sebelum kedua tanggal dipilih.
         */
        customDateRangeLabel() {
            if (!Array.isArray(this.customDateRange) || this.customDateRange.length !== 2) return '';

            const parseDateValue = (value) => {
                const [year, month, day] = String(value || '')
                    .split('-')
                    .map(Number);

                return { year, month, day };
            };
            const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            const start = parseDateValue(this.customDateRange[0]);
            const end = parseDateValue(this.customDateRange[1]);

            if (!start.year || !start.month || !start.day || !end.year || !end.month || !end.day) return '';

            if (start.year === end.year && start.month === end.month) {
                return `${start.day}–${end.day} ${monthLabels[end.month - 1]} ${end.year}`;
            }

            if (start.year === end.year) {
                return `${start.day} ${monthLabels[start.month - 1]}–${end.day} ${monthLabels[end.month - 1]} ${end.year}`;
            }

            return `${start.day} ${monthLabels[start.month - 1]} ${start.year}–${end.day} ${monthLabels[end.month - 1]} ${end.year}`;
        },

        /**
         * Mengembalikan displayed detail ip yang dihitung dari state reaktif saat ini untuk halaman audit log.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi displayed detail ip.
         */
        displayedDetailIp() {
            if (this.isIpVisible) return this.selectedAudit?.ip_address || '';

            return this.selectedMaskedIp || this.selectedAudit?.ip_address || '';
        },
    },

    watch: {
        /**
         * Menjalankan proses modal.detail dan menyinkronkan state hasilnya untuk halaman audit log.
         *
         * @param {*} isOpen Nilai is open yang diproses oleh function.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        'modal.detail'(isOpen) {
            if (!isOpen) this.resetDetailState();
        },
    },

    /**
     * Menginisialisasi behavior komponen yang bergantung pada browser setelah mounted untuk halaman audit log.
     *
     * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
     */
    mounted() {
        document.addEventListener('pointerdown', this.handleDocumentPointerDown, true);
        this.$nextTick(() => {
            this.headerActionsTarget = document.getElementById('settings-content-header-actions');
            this.headerActionsTarget?.parentElement?.classList.add('has-audit-log-actions');
        });
        this.loadAuditLogs();
    },

    /**
     * Membersihkan listener dokumen dan membatalkan penerapan response lama ketika komponen meninggalkan route.
     *
     * @returns {void} Menghentikan listener panel dan menginvalidasi request yang masih berjalan.
     */
    beforeUnmount() {
        document.removeEventListener('pointerdown', this.handleDocumentPointerDown, true);
        this.headerActionsTarget?.parentElement?.classList.remove('has-audit-log-actions');
        this.collectionRequestVersion += 1;
        this.detailRequestVersion += 1;
    },

    methods: {
        /**
         * Menutup panel filter ketika pengguna mulai berinteraksi di luar kontrol yang di-teleport.
         *
         * Event ditangani pada fase capture agar pembatalan click oleh komponen lain tidak membuat panel tetap terbuka.
         * Popper Element Plus dikecualikan karena merupakan bagian dari kontrol filter walaupun dirender di luar panel.
         *
         * @param {PointerEvent} event Event pointer global dari dokumen.
         *
         * @returns {void} Menutup panel jika target klik berada di luar kontrol Audit Log.
         */
        handleDocumentPointerDown(event) {
            const controls = this.$refs.auditHeaderControls;
            const target = event.target;
            const isElementPlusPopper = target instanceof Element && target.closest('.el-popper');
            const isOutsideControls = controls && !controls.contains(target) && !isElementPlusPopper;

            // Let the first outside interaction dismiss an open calendar without also collapsing
            // the compact Filter panel, so a cancelled custom range returns to its preset visibly.
            if (this.isFilterPanelOpen && this.isCustomDatePickerVisible && isOutsideControls) return;

            if (this.isFilterPanelOpen && isOutsideControls) this.closeFilterPanel();
        },

        /**
         * Membuka atau menutup panel filter audit log pada breakpoint yang menggunakan kontrol ringkas.
         *
         * @returns {void} Memperbarui state visibilitas panel filter.
         */
        toggleFilterPanel() {
            this.isFilterPanelOpen = !this.isFilterPanelOpen;
        },

        /**
         * Menutup panel filter audit log setelah pengguna berpindah fokus ke area halaman lain.
         *
         * @returns {void} Memastikan panel filter berada pada state tertutup.
         */
        closeFilterPanel() {
            this.isFilterPanelOpen = false;
        },

        /**
         * Menutup panel filter melalui tombol Escape tanpa mengganggu siklus penutupan kalender custom.
         *
         * Saat kalender masih terlihat, Escape dibiarkan ditangani oleh date picker terlebih dahulu agar
         * pilihan custom yang dibatalkan dapat kembali ke preset terakhir di dalam panel yang tetap terbuka.
         *
         * @returns {void} Menutup panel hanya ketika popper kalender custom sudah tidak aktif.
         */
        handleFilterPanelEscape() {
            if (this.isCustomDatePickerVisible) return;

            this.closeFilterPanel();
        },

        /**
         * Menangani filter perubahan untuk halaman audit log.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        handleFilterChange() {
            this.loadAuditLogs();
        },

        /**
         * Menangani time filter perubahan untuk halaman audit log.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        handleTimeFilterChange() {
            if (this.timeFilter === 'custom') {
                this.openCustomDatePicker();
                return;
            }

            this.appliedTimeFilter = this.timeFilter;
            this.isCustomDateSelectionCommitted = false;
            this.customDateRange = [];
            this.loadAuditLogs();
        },

        /**
         * Mencegah input internal select rentang waktu membuka keyboard alfabet pada perangkat sentuh.
         *
         * Select ini tidak menerima pencarian teks, sehingga input mode dinonaktifkan sebelum Element Plus
         * memindahkan fokus ke input combobox internalnya. Navigasi pointer dan keyboard fisik tetap tersedia.
         *
         * @param {PointerEvent} event Event pointer yang dimulai dari kontrol rentang waktu.
         *
         * @returns {void} Menyesuaikan atribut input internal tanpa mengubah nilai filter.
         */
        suppressTimeFilterKeyboard(event) {
            if (event.pointerType !== 'touch') return;

            const input = event.currentTarget?.querySelector('input');

            input?.setAttribute('inputmode', 'none');
            input?.setAttribute('readonly', 'readonly');
        },

        /**
         * Membuka kembali kalender ketika opsi Rentang Tanggal dipilih, termasuk saat opsi tersebut sudah aktif.
         *
         * @param {string} optionValue Nilai opsi rentang waktu yang dipilih pengguna.
         *
         * @returns {void} Membuka kalender hanya untuk opsi rentang tanggal custom.
         */
        handleTimeOptionClick(optionValue) {
            if (optionValue === 'custom') this.openCustomDatePicker();
        },

        /**
         * Membuka panel kalender dari anchor tersembunyi tanpa mengganti tampilan select Rentang Waktu.
         *
         * @returns {void} Membuka date-range picker setelah komponen tersedia pada DOM.
         */
        openCustomDatePicker() {
            if (this.isCustomDatePickerVisible || this.isCustomDateOpenPending) return;

            this.isCustomDateOpenPending = true;
            this.isCustomDateSelectionCommitted = false;
            this.$nextTick(() => {
                // Wait until the time-select popper has completed its close cycle. Opening the calendar
                // in the same cycle can make the compact Filter panel dismiss it immediately.
                this.$nextTick(() => {
                    this.isCustomDateOpenPending = false;
                    this.$refs.customDatePicker?.handleOpen();
                });
            });
        },

        /**
         * Menangani custom date perubahan untuk halaman audit log.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        handleCustomDateChange() {
            if (this.customDateRange?.length !== 2) return;

            this.appliedTimeFilter = 'custom';
            this.isCustomDateSelectionCommitted = true;
            this.loadAuditLogs();
        },

        /**
         * Mengembalikan pilihan waktu ketika kalender custom ditutup tanpa menyelesaikan pemilihan tanggal.
         *
         * Preset terakhir yang benar-benar diterapkan digunakan sebagai fallback. Jika state terakhir juga custom,
         * nilai dikembalikan ke 30 hari agar penutupan kalender tidak membuka ulang custom range secara berulang.
         *
         * @param {boolean} isVisible Menunjukkan apakah popper kalender sedang terlihat.
         *
         * @returns {void} Mempertahankan custom range yang selesai atau memulihkan preset aman saat dibatalkan.
         */
        handleCustomDatePickerVisibilityChange(isVisible) {
            this.isCustomDatePickerVisible = isVisible;

            if (isVisible || this.timeFilter !== 'custom') return;

            if (this.isCustomDateSelectionCommitted) {
                this.isCustomDateSelectionCommitted = false;
                return;
            }

            const safePreset = ['7', '30', '90'].includes(this.appliedTimeFilter) ? this.appliedTimeFilter : '30';
            const shouldReloadFallback = this.appliedTimeFilter === 'custom';

            this.timeFilter = safePreset;
            this.appliedTimeFilter = safePreset;
            this.customDateRange = [];

            if (shouldReloadFallback) this.loadAuditLogs();
        },

        /**
         * Menjalankan proses refresh audit logs dan menyinkronkan state hasilnya untuk halaman audit log.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        refreshAuditLogs() {
            this.loadAuditLogs();
        },

        /**
         * Mengembalikan filters ke state awal dan menutup panel filter untuk halaman audit log.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        resetFilters() {
            this.eventFilter = '';
            this.timeFilter = '30';
            this.appliedTimeFilter = '30';
            this.customDateRange = [];
            this.isCustomDateSelectionCommitted = false;
            this.closeFilterPanel();
            this.loadAuditLogs();
        },

        /**
         * Memuat audit logs untuk halaman audit log, termasuk penanganan request backend dan response lokal.
         *
         * @param {Object} [options] Opsi pagination untuk request audit log.
         *
         * @returns {Promise<void>} Promise diselesaikan setelah alur asynchronous selesai.
         */
        async loadAuditLogs({ append = false } = {}) {
            // --- step 1 - start - lewati request pagination yang tidak diperlukan atau masih berjalan
            const shouldSkipLoadMore = append && (!this.hasMore || this.isLoadingMore);
            // --- step 1 - end - lewati request pagination yang tidak diperlukan atau masih berjalan

            if (shouldSkipLoadMore) return;

            // --- step 2 - start - siapkan state untuk pemuatan awal atau request pagination berikutnya
            if (!append) {
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
            // --- step 2 - end - siapkan state untuk pemuatan awal atau request pagination berikutnya

            const requestVersion = this.collectionRequestVersion;

            // --- step 3 - start - terapkan response hanya jika versi filternya masih aktif
            try {
                const response = await axios.get('/audit-logs', {
                    params: this.buildCollectionParams(append),
                });

                if (requestVersion !== this.collectionRequestVersion) return;

                const nextItems = Array.isArray(response.data?.data) ? response.data.data : [];
                this.auditLogs = append ? [...this.auditLogs, ...nextItems] : nextItems;
                this.nextCursor = response.data?.meta?.next_cursor || null;
                this.hasMore = Boolean(response.data?.meta?.has_more && this.nextCursor);
            } catch (error) {
                if (requestVersion !== this.collectionRequestVersion) return;

                const message = error?.response?.data?.message || 'Periksa koneksi Anda lalu coba kembali.';

                if (append) this.loadMoreError = message;
                else this.initialError = message;
            } finally {
                if (requestVersion === this.collectionRequestVersion) {
                    this.isLoadingInitial = false;
                    this.isLoadingMore = false;
                }
            }
            // --- step 3 - end - terapkan response hanya jika versi filternya masih aktif
        },

        /**
         * Memuat more untuk halaman audit log.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        loadMore() {
            this.loadAuditLogs({ append: true });
        },

        /**
         * Menjalankan proses build collection params dan menyinkronkan state hasilnya untuk halaman audit log.
         *
         * @param {*} append Nilai append yang diproses oleh function.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi build collection params.
         */
        buildCollectionParams(append) {
            const params = {
                per_page: 20,
            };

            if (this.eventFilter) params.event = this.eventFilter;

            const dateRange = this.resolveDateRange();
            if (dateRange.from) params.from = dateRange.from;
            if (dateRange.to) params.to = dateRange.to;
            if (append && this.nextCursor) params.cursor = this.nextCursor;

            return params;
        },

        /**
         * Menjalankan proses resolve date range dan menyinkronkan state hasilnya untuk halaman audit log.
         *
         * @returns {Object} Object resolve date range yang telah disiapkan.
         */
        resolveDateRange() {
            if (this.timeFilter === 'custom') {
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
         * Menjalankan proses resolve jakarta date value dan menyinkronkan state hasilnya untuk halaman audit log.
         *
         * @param {*} [offsetDays] Nilai offset days yang diproses oleh function.
         *
         * @returns {string} Teks resolve jakarta date value yang telah diformat atau ditentukan.
         */
        resolveJakartaDateValue(offsetDays = 0) {
            // --- step 1 - start - ambil komponen tanggal saat ini dalam timezone aplikasi
            const parts = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Jakarta',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }).formatToParts(new Date());
            const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
            // --- step 1 - end - ambil komponen tanggal saat ini dalam timezone aplikasi

            // --- step 2 - start - hitung offset sebagai hari kalender tanpa konversi timezone browser
            const date = new Date(
                Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day) + offsetDays),
            );

            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');
            // --- step 2 - end - hitung offset sebagai hari kalender tanpa konversi timezone browser

            return `${year}-${month}-${day}`;
        },

        /**
         * Membuka detail untuk halaman audit log.
         *
         * @param {*} audit Nilai audit yang diproses oleh function.
         *
         * @returns {Promise<void>} Promise diselesaikan setelah alur asynchronous selesai.
         */
        async openDetail(audit) {
            this.selectedAudit = { ...audit };
            this.selectedMaskedIp = audit.ip_address || '';
            this.isIpVisible = false;
            this.isPhoneVisible = false;
            this.modal.detail = true;
            await this.loadDetail();
        },

        /**
         * Memuat detail untuk halaman audit log, termasuk penanganan request backend dan response lokal.
         *
         * @returns {Promise<void>} Promise diselesaikan setelah alur asynchronous selesai.
         */
        async loadDetail() {
            // --- step 1 - start - pastikan request detail masih memiliki id target yang valid
            const auditId = this.selectedAudit?.id || '';
            // --- step 1 - end - pastikan request detail masih memiliki id target yang valid

            if (!auditId) return;

            const requestVersion = ++this.detailRequestVersion;
            this.isLoadingDetail = true;
            this.detailError = '';
            this.isIpVisible = false;
            this.isPhoneVisible = false;

            // --- step 2 - start - terapkan response hanya selama modal dan target audit tidak berubah
            try {
                const response = await axios.get(`/audit-logs/${auditId}`);

                if (this.isCurrentDetailRequest(requestVersion, auditId))
                    this.selectedAudit = response.data?.data || this.selectedAudit;
            } catch (error) {
                if (this.isCurrentDetailRequest(requestVersion, auditId)) {
                    this.detailError =
                        error?.response?.data?.message || 'Detail aktivitas belum bisa dimuat. Coba lagi.';
                }
            } finally {
                if (this.isCurrentDetailRequest(requestVersion, auditId)) this.isLoadingDetail = false;
            }
            // --- step 2 - end - terapkan response hanya selama modal dan target audit tidak berubah
        },

        /**
         * Menentukan apakah kondisi current detail request terpenuhi untuk halaman audit log.
         *
         * @param {*} requestVersion Nilai request version yang diproses oleh function.
         * @param {*} auditId Nilai audit id yang diproses oleh function.
         *
         * @returns {boolean} Menunjukkan apakah kondisi is current detail request terpenuhi.
         */
        isCurrentDetailRequest(requestVersion, auditId) {
            return (
                requestVersion === this.detailRequestVersion && this.modal.detail && this.selectedAudit?.id === auditId
            );
        },

        /**
         * Menutup detail untuk halaman audit log.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        closeDetail() {
            this.modal.detail = false;
        },

        /**
         * Mengembalikan detail state ke state awal untuk halaman audit log.
         *
         * @returns {void} Function menerapkan efeknya melalui state komponen atau aplikasi.
         */
        resetDetailState() {
            this.detailRequestVersion += 1;
            this.selectedAudit = null;
            this.selectedMaskedIp = '';
            this.isIpVisible = false;
            this.isPhoneVisible = false;
            this.detailError = '';
            this.isLoadingDetail = false;
        },

        /**
         * Mengembalikan event icon yang ditentukan modul untuk halaman audit log.
         *
         * @param {*} event Event browser atau komponen yang memicu handler.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi event icon.
         */
        eventIcon(event) {
            return (
                {
                    'auth.registered': 'fa-solid fa-user-plus',
                    'auth.logged_in': 'fa-solid fa-right-to-bracket',
                    'auth.logged_out': 'fa-solid fa-arrow-right-from-bracket',
                    'product.created': 'fa-solid fa-box-open',
                    'product.updated': 'fa-solid fa-pen-to-square',
                    'product.deleted': 'fa-solid fa-trash-can',
                    'address.created': 'fa-solid fa-house-circle-check',
                    'address.updated': 'fa-solid fa-house-chimney-crack',
                    'address.deleted': 'fa-solid fa-house-circle-xmark',
                    'address.selected': 'fa-solid fa-map-location-dot',
                    'profile.updated': 'fa-solid fa-user-pen',
                    'profile.image_uploaded': 'fa-solid fa-image',
                    'profile.image_deleted': 'fa-solid fa-image',
                }[event] || 'fa-solid fa-clock-rotate-left'
            );
        },

        /**
         * Mengembalikan event class yang ditentukan modul untuk halaman audit log.
         *
         * @param {*} event Event browser atau komponen yang memicu handler.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi event class.
         */
        eventClass(event) {
            return (
                {
                    'auth.registered': 'is-register',
                    'auth.logged_in': 'is-login',
                    'auth.logged_out': 'is-logout',
                    'product.created': 'is-product-created',
                    'product.updated': 'is-product-updated',
                    'product.deleted': 'is-product-deleted',
                    'address.created': 'is-address-created',
                    'address.updated': 'is-address-updated',
                    'address.deleted': 'is-address-deleted',
                    'address.selected': 'is-address-selected',
                    'profile.updated': 'is-profile-updated',
                    'profile.image_uploaded': 'is-profile-image-uploaded',
                    'profile.image_deleted': 'is-profile-image-deleted',
                }[event] || ''
            );
        },

        /**
         * Menentukan apakah sebuah event audit berasal dari kategori tertentu.
         *
         * Pemeriksaan kategori dibuat generik agar penambahan domain audit berikutnya cukup memakai
         * kategori barunya tanpa menambah predikat khusus per domain.
         *
         * @param {*} audit Nilai audit yang diproses oleh function.
         * @param {string} category Kategori audit yang dibandingkan, misalnya 'product' atau 'address'.
         *
         * @returns {boolean} Menunjukkan apakah audit berada pada kategori yang diminta.
         */
        isAuditCategory(audit, category) {
            return audit?.category === category;
        },

        /**
         * Memilih deskripsi baris kedua kartu audit sesuai kategori eventnya.
         *
         * Setiap kartu audit wajib memiliki tiga baris visual, sehingga function ini selalu
         * mengembalikan teks: ringkasan khusus domain bila tersedia, atau deskripsi event sebagai
         * fallback yang aman.
         *
         * @param {*} audit Event audit yang akan diringkas pada koleksi.
         *
         * @returns {string} Deskripsi baris kedua untuk kartu audit tersebut.
         */
        collectionDescription(audit) {
            switch (audit?.category) {
                case 'product':
                    return this.productCollectionDescription(audit);
                case 'address':
                    return this.addressCollectionDescription(audit);
                case 'profile':
                    return this.profileCollectionDescription(audit);
                default:
                    return audit?.description || '';
            }
        },

        /**
         * Menjalankan proses produk perubahan summary dan menyinkronkan state hasilnya untuk halaman audit log.
         *
         * @param {*} audit Nilai audit yang diproses oleh function.
         *
         * @returns {string} Teks produk perubahan summary yang telah diformat atau ditentukan.
         */
        productChangeSummary(audit) {
            const labels = Array.isArray(audit?.changes)
                ? audit.changes.map((change) => change.label).filter(Boolean)
                : [];

            if (labels.length === 0) return 'Tidak berubah';
            if (labels.length === 1) return `${labels[0]} berubah`;
            if (labels.length === 2) return `${labels[0]} dan ${labels[1]} berubah`;

            return `${labels.slice(0, -1).join(', ')}, dan ${labels.at(-1)} berubah`;
        },

        /**
         * Menggabungkan nama produk dan ringkasan hasil aktivitas menjadi satu baris deskripsi koleksi audit log.
         *
         * Informasi rinci tetap ditampilkan pada modal Detail agar semua tipe aktivitas memiliki tiga baris visual
         * yang konsisten: judul aktivitas, deskripsi produk/hasil, dan metadata perangkat.
         *
         * @param {*} audit Event audit produk yang akan diringkas pada koleksi.
         *
         * @returns {string} Deskripsi singkat produk dan hasil aktivitasnya.
         */
        productCollectionDescription(audit) {
            const productName = audit?.subject?.name || 'Produk';

            if (audit?.event === 'product.updated') {
                return `${productName} • ${this.productUpdateSummary(audit)}`;
            }

            const snapshot = audit?.product_snapshot;
            if (!snapshot) return productName;

            const snapshotSummary = [
                snapshot.price !== null && snapshot.price !== undefined ? this.formatCurrency(snapshot.price) : '',
                snapshot.stock !== null && snapshot.stock !== undefined ? `Stok ${snapshot.stock}` : '',
                snapshot.image_count !== null && snapshot.image_count !== undefined
                    ? `${snapshot.image_count} foto`
                    : '',
            ].filter(Boolean);

            return [productName, ...snapshotSummary].join(' • ');
        },

        /**
         * Membuat satu ringkasan perubahan produk untuk koleksi audit log tanpa mengulang detail yang ada di modal.
         *
         * @param {*} audit Nilai audit yang berisi perubahan data dan metadata foto.
         *
         * @returns {string} Ringkasan singkat perubahan produk untuk satu baris koleksi.
         */
        productUpdateSummary(audit) {
            const parts = [];
            const dataSummary = this.productChangeSummary(audit);

            if (dataSummary !== 'Tidak berubah') parts.push(dataSummary);

            if (audit?.image_changes) {
                const imageSummary = this.productImageChangeSummary(audit.image_changes);

                if (imageSummary !== 'Tidak berubah') {
                    parts.push(imageSummary.startsWith('Foto') ? imageSummary : `Foto ${imageSummary}`);
                }
            }

            return parts.length > 0 ? parts.join(' • ') : 'Tidak ada perubahan';
        },

        /**
         * Menjalankan proses produk gambar perubahan summary dan menyinkronkan state hasilnya untuk halaman audit log.
         *
         * @param {*} imageChanges Nilai gambar changes yang diproses oleh function.
         *
         * @returns {string} Teks produk gambar perubahan summary yang telah diformat atau ditentukan.
         */
        productImageChangeSummary(imageChanges) {
            if (!imageChanges) return 'Informasi tidak tersedia';

            const parts = [];
            if (imageChanges.added_count) parts.push(`${imageChanges.added_count} ditambahkan`);
            if (imageChanges.removed_count) parts.push(`${imageChanges.removed_count} dihapus`);
            if (imageChanges.cover_changed) parts.push('Foto utama berubah');
            if (imageChanges.order_changed) parts.push('Urutan berubah');

            return parts.length > 0 ? parts.join(' • ') : 'Tidak berubah';
        },

        /**
         * Menjalankan proses produk detail perubahan rows dan menyinkronkan state hasilnya untuk halaman audit log, termasuk penanganan request backend dan response lokal.
         *
         * @param {*} audit Nilai audit yang diproses oleh function.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi produk detail perubahan rows.
         */
        productDetailChangeRows(audit) {
            const changes = new Map(
                (Array.isArray(audit?.changes) ? audit.changes : []).map((change) => [change.field, change]),
            );
            const fields = [
                { field: 'name', label: 'Nama produk', value: audit?.subject?.name },
                { field: 'price', label: 'Harga', value: audit?.product_snapshot?.price },
                { field: 'stock', label: 'Stok', value: audit?.product_snapshot?.stock },
            ];
            const rows = fields.map((field) => {
                const change = changes.get(field.field);

                return {
                    field: field.field,
                    label: field.label,
                    before: change?.before ?? field.value,
                    after: change?.after ?? field.value,
                    changed: Boolean(change),
                };
            });

            if (audit?.image_changes) {
                rows.push({
                    field: 'image_count',
                    label: 'Jumlah foto',
                    before: audit.image_changes.before_count ?? null,
                    after: audit.image_changes.after_count ?? null,
                    changed: audit.image_changes.before_count !== audit.image_changes.after_count,
                });
            }

            return rows;
        },

        /**
         * Mengembalikan produk snapshot rows yang ditentukan modul untuk halaman audit log.
         *
         * @param {*} audit Nilai audit yang diproses oleh function.
         *
         * @returns {Array<*>} Kumpulan produk snapshot rows yang telah disiapkan.
         */
        productSnapshotRows(audit) {
            return [
                { field: 'name', label: 'Nama produk', value: audit?.subject?.name },
                { field: 'price', label: 'Harga', value: audit?.product_snapshot?.price },
                { field: 'stock', label: 'Stok', value: audit?.product_snapshot?.stock },
                { field: 'image_count', label: 'Jumlah foto', value: audit?.product_snapshot?.image_count },
            ];
        },

        /**
         * Menjalankan proses produk gambar perubahan items dan menyinkronkan state hasilnya untuk halaman audit log.
         *
         * @param {*} [imageChanges] Nilai gambar changes yang diproses oleh function.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi produk gambar perubahan items.
         */
        productImageChangeItems(imageChanges = {}) {
            const items = [];

            if (imageChanges.added_count) items.push(`${imageChanges.added_count} foto ditambahkan`);
            if (imageChanges.removed_count) items.push(`${imageChanges.removed_count} foto dihapus`);
            if (imageChanges.cover_changed) items.push('Foto utama berubah');
            if (imageChanges.order_changed) items.push('Urutan foto berubah');

            return items;
        },

        /**
         * Memformat produk value untuk ditampilkan untuk halaman audit log.
         *
         * @param {*} field Nilai field yang diproses oleh function.
         * @param {*} value Nilai yang diproses oleh function.
         *
         * @returns {string} Teks format produk value yang telah diformat atau ditentukan.
         */
        formatProductValue(field, value) {
            if (field === 'price') return this.formatCurrency(value);
            if (field === 'image_count') return value === null || value === undefined ? '-' : `${value} foto`;

            return String(value ?? '-');
        },

        /**
         * Menggabungkan label alamat dan ringkasan aktivitasnya menjadi satu baris deskripsi koleksi.
         *
         * Ringkasan dirakit dari field snapshot yang sudah terstruktur, bukan dari hasil mengurai teks
         * alamat, sehingga tampilan tidak bergantung pada format alamat provider peta. Ketika snapshot
         * tidak tersedia, deskripsi event dipakai agar kartu tetap memiliki tiga baris visual.
         *
         * @param {*} audit Event audit alamat yang akan diringkas pada koleksi.
         *
         * @returns {string} Deskripsi singkat alamat dan hasil aktivitasnya.
         */
        addressCollectionDescription(audit) {
            const addressLabel = audit?.subject?.name || 'Alamat';

            if (audit?.event === 'address.updated') {
                return `${addressLabel} • ${this.addressUpdateSummary(audit)}`;
            }

            const snapshot = audit?.address_snapshot;
            if (!snapshot) return audit?.description || addressLabel;

            const snapshotSummary = [
                snapshot.recipient_name || '',
                audit?.event === 'address.selected' ? 'Jadi alamat utama' : snapshot.phone || '',
            ].filter(Boolean);

            return [addressLabel, ...snapshotSummary].join(' • ');
        },

        /**
         * Merangkum field alamat yang berubah pada satu event update.
         *
         * Update yang tidak mengubah nilai apa pun tetap menghasilkan teks eksplisit agar baris kedua
         * kartu tidak pernah kosong dan tidak mengarang perubahan.
         *
         * @param {*} audit Event audit alamat yang sedang diringkas.
         *
         * @returns {string} Ringkasan perubahan alamat untuk baris kedua kartu.
         */
        addressUpdateSummary(audit) {
            const labels = Array.isArray(audit?.changes)
                ? audit.changes.map((change) => change.label).filter(Boolean)
                : [];

            if (labels.length === 0) return 'Tidak ada perubahan';
            if (labels.length === 1) return `${labels[0]} berubah`;
            if (labels.length === 2) return `${labels[0]} dan ${labels[1]} berubah`;

            return `${labels.slice(0, -1).join(', ')}, dan ${labels.at(-1)} berubah`;
        },

        /**
         * Merangkum aktivitas profil agar kartu koleksi menjelaskan perubahan tanpa memuat data sensitif.
         *
         * @param {*} audit Event audit profil yang akan diringkas.
         *
         * @returns {string} Ringkasan aman untuk baris kedua kartu audit profil.
         */
        profileCollectionDescription(audit) {
            if (audit?.event === 'profile.updated') {
                const labels = Array.isArray(audit?.changes)
                    ? audit.changes.map((change) => change.label).filter(Boolean)
                    : [];

                if (labels.length === 0) return 'Tidak ada perubahan';
                if (labels.length === 1) return `${labels[0]} berubah`;
                if (labels.length === 2) return `${labels[0]} dan ${labels[1]} berubah`;

                return `${labels.slice(0, -1).join(', ')}, dan ${labels.at(-1)} berubah`;
            }

            return audit?.description || '';
        },

        /**
         * Menyusun semua field Pengaturan Pengguna untuk tabel detail perubahan.
         *
         * Field yang tidak muncul dalam changes menggunakan snapshot akhir pada kedua kolom agar
         * detail update identik tetap menjelaskan nilai yang tersimpan dengan status Tetap.
         *
         * @param {*} audit Event audit profil yang sedang dibuka.
         *
         * @returns {Array<Object>} Baris detail Pengaturan Pengguna.
         */
        profileDetailChangeRows(audit) {
            const changes = new Map(
                (Array.isArray(audit?.changes) ? audit.changes : []).map((change) => [change.field, change]),
            );
            const snapshot = audit?.profile_snapshot || {};
            const fields = [
                { field: 'phone', label: 'Nomor Telepon', value: snapshot.phone },
                { field: 'tanggal_lahir', label: 'Tanggal Lahir', value: snapshot.tanggal_lahir },
                { field: 'jenis_kelamin', label: 'Jenis Kelamin', value: snapshot.jenis_kelamin },
            ];

            return fields.map((field) => {
                const change = changes.get(field.field);

                return {
                    field: field.field,
                    label: field.label,
                    // Jangan gunakan nullish fallback: null adalah nilai before/after yang valid
                    // dan harus tampil sebagai "-" ketika field baru pertama kali diisi.
                    before: change ? change.before : field.value,
                    after: change ? change.after : field.value,
                    changed: Boolean(change),
                };
            });
        },

        /**
         * Memformat nilai Pengaturan Pengguna untuk tabel detail.
         *
         * @param {string} field Nama field profil yang ditampilkan.
         * @param {*} value Nilai field dari snapshot atau perubahan audit.
         *
         * @returns {string} Nilai yang aman dan mudah dibaca pada tabel detail.
         */
        formatProfileValue(field, value) {
            if (value === null || value === undefined || value === '') return '-';
            if (field !== 'tanggal_lahir') return String(value);

            const date = new Date(`${value}T00:00:00`);

            return Number.isNaN(date.getTime())
                ? String(value)
                : new Intl.DateTimeFormat('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                  }).format(date);
        },

        /**
         * Menyamarkan nomor telepon profil sampai pemilik memilih kontrol reveal pada detail.
         *
         * @param {*} phone Nomor telepon dari detail audit owner-scoped.
         *
         * @returns {string} Nomor penuh setelah reveal atau versi tersamarkan secara default.
         */
        displayedProfilePhone(phone) {
            return this.displayedAddressPhone(phone);
        },

        /**
         * Menyusun baris before/after untuk modal detail event update alamat.
         *
         * Seluruh field alamat selalu ditampilkan, sama seperti detail update produk, sehingga nilai
         * yang tidak berubah tetap terbaca dan ditandai `Tetap`. Nilai before diambil dari daftar
         * perubahan, sedangkan field yang tidak berubah memakai nilai snapshot untuk kedua kolomnya.
         *
         * @param {*} audit Event audit alamat yang sedang dibuka pada modal detail.
         *
         * @returns {Array<Object>} Kumpulan baris perubahan alamat yang siap dirender.
         */
        addressDetailChangeRows(audit) {
            const changes = new Map(
                (Array.isArray(audit?.changes) ? audit.changes : []).map((change) => [change.field, change]),
            );
            const snapshot = audit?.address_snapshot || {};
            const fields = [
                { field: 'place', label: 'Label Alamat', value: snapshot.place },
                { field: 'recipient_name', label: 'Nama Penerima', value: snapshot.recipient_name },
                { field: 'phone', label: 'Nomor Telepon', value: snapshot.phone },
                { field: 'formatted_address', label: 'Lokasi', value: snapshot.formatted_address },
                { field: 'address_detail', label: 'Detail Alamat', value: snapshot.address_detail },
            ];

            return fields.map((field) => {
                const change = changes.get(field.field);

                return {
                    field: field.field,
                    label: field.label,
                    before: change?.before ?? field.value,
                    after: change?.after ?? field.value,
                    changed: Boolean(change),
                };
            });
        },

        /**
         * Menentukan judul kolom nilai pada tabel snapshot alamat.
         *
         * Judul dibedakan per event agar pengguna tidak salah membaca konteks: alamat yang baru
         * dipilih masih berlaku, sedangkan alamat yang dihapus hanya menyisakan kondisi terakhirnya.
         *
         * @param {*} audit Event audit alamat yang sedang dibuka pada modal detail.
         *
         * @returns {string} Judul kolom nilai yang sesuai dengan event tersebut.
         */
        addressSnapshotHeading(audit) {
            switch (audit?.event) {
                case 'address.created':
                    return 'Nilai awal';
                case 'address.selected':
                    return 'Nilai saat ini';
                default:
                    return 'Nilai terakhir';
            }
        },

        /**
         * Menyusun baris snapshot alamat untuk modal detail.
         *
         * Nomor telepon ditandai sebagai field sensitif agar template dapat menyamarkannya sampai
         * pengguna memilih untuk menampilkannya, mengikuti perlakuan yang sama dengan alamat IP.
         *
         * @param {*} audit Event audit alamat yang sedang dibuka pada modal detail.
         *
         * @returns {Array<Object>} Kumpulan baris snapshot alamat yang siap dirender.
         */
        addressSnapshotRows(audit) {
            const snapshot = audit?.address_snapshot || {};

            return [
                { field: 'place', label: 'Label Alamat', value: snapshot.place, sensitive: false },
                { field: 'recipient_name', label: 'Nama Penerima', value: snapshot.recipient_name, sensitive: false },
                { field: 'phone', label: 'Nomor Telepon', value: snapshot.phone, sensitive: true },
                { field: 'formatted_address', label: 'Lokasi', value: snapshot.formatted_address, sensitive: false },
                { field: 'address_detail', label: 'Detail Alamat', value: snapshot.address_detail, sensitive: false },
                {
                    field: 'enable',
                    label: 'Status',
                    value: snapshot.enable ? 'Alamat utama' : 'Bukan alamat utama',
                    sensitive: false,
                },
            ];
        },

        /**
         * Memformat nilai alamat untuk ditampilkan pada modal detail.
         *
         * @param {*} value Nilai field alamat yang akan ditampilkan.
         *
         * @returns {string} Teks nilai alamat yang telah dinormalisasi.
         */
        formatAddressValue(value) {
            if (value === null || value === undefined || value === '') return '-';

            return String(value);
        },

        /**
         * Menyamarkan nomor telepon ketika pengguna belum memilih untuk menampilkannya.
         *
         * Frontend hanya menyamarkan nilai yang sudah diterima dari endpoint detail owner-scoped dan
         * tidak pernah menjadi satu-satunya lapis perlindungan data pribadi.
         *
         * @param {*} phone Nomor telepon dari snapshot alamat.
         *
         * @returns {string} Nomor telepon penuh atau versi yang telah disamarkan.
         */
        displayedAddressPhone(phone) {
            const value = String(phone ?? '').trim();

            if (value === '') return '-';
            if (this.isPhoneVisible) return value;
            if (value.length <= 7) return '*'.repeat(value.length);

            return `${value.slice(0, 4)}****${value.slice(-3)}`;
        },

        /**
         * Memformat mata uang untuk ditampilkan untuk halaman audit log.
         *
         * @param {*} value Nilai yang diproses oleh function.
         *
         * @returns {string} Teks format mata uang yang telah diformat atau ditentukan.
         */
        formatCurrency(value) {
            if (value === null || value === undefined || value === '') return '-';

            const number = Number(value);

            if (!Number.isFinite(number)) return '-';

            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
            }).format(number);
        },

        /**
         * Menjalankan proses device summary dan menyinkronkan state hasilnya untuk halaman audit log.
         *
         * @param {*} [device] Nilai device yang diproses oleh function.
         *
         * @returns {*} Nilai yang dihasilkan oleh operasi device summary.
         */
        deviceSummary(device = {}) {
            return [device.browser, device.operating_system, device.device_type].filter(Boolean).join(' • ');
        },

        /**
         * Memformat occurred at untuk ditampilkan untuk halaman audit log.
         *
         * @param {*} value Nilai yang diproses oleh function.
         *
         * @returns {string} Teks format occurred at yang telah diformat atau ditentukan.
         */
        formatOccurredAt(value) {
            if (!value) return '-';

            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '-';

            const formatted = new Intl.DateTimeFormat('id-ID', {
                timeZone: 'Asia/Jakarta',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23',
            })
                .format(date)
                .replace(/\./g, ':');

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

.audit-header-controls {
    position: relative;
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 8px;
}

.audit-filter-panel {
    display: flex;
    flex: 0 1 auto;
    min-width: 0;
}

.audit-header-actions {
    display: flex;
    align-items: flex-end;
    flex: 0 0 auto;
    gap: 8px;
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

.audit-event-filter-field {
    width: 240px;
}

.audit-time-filter-field {
    position: relative;
}

.audit-time-select-control {
    position: relative;
}

.audit-custom-date-label {
    position: absolute;
    top: 1px;
    right: 34px;
    bottom: 1px;
    left: 1px;
    z-index: 2;
    display: flex;
    align-items: center;
    min-width: 0;
    border-radius: 7px 0 0 7px;
    background: #ffffff;
    color: #1e293b;
    font-size: 14px;
    line-height: 1;
    padding-left: 11px;
    pointer-events: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

:deep(.audit-hidden-date-picker) {
    position: absolute !important;
    top: 100%;
    right: 0;
    z-index: -1;
    width: 1px !important;
    min-width: 0 !important;
    height: 1px !important;
    border: 0 !important;
    padding: 0 !important;
    clip-path: inset(50%);
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
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

.audit-filter-trigger,
.audit-icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    transition: 150ms ease-in-out;
}

.audit-filter-trigger {
    display: none;
    gap: 8px;
    border: 1px solid #c4b5fd;
    background: #f5f3ff;
    color: #7c3aed;
    padding: 0 14px;
}

.audit-filter-trigger:hover {
    border-color: #a78bfa;
    background: #ede9fe;
}

.audit-icon-button {
    width: 42px;
    flex: 0 0 42px;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #64748b;
}

.audit-icon-button:not(:disabled):hover {
    border-color: #c4b5fd;
    background: #f5f3ff;
    color: #7c3aed;
}

:global(.audit-event-filter-popper .el-select-dropdown__wrap) {
    max-height: min(360px, calc(100vh - 160px));
}

:global(.audit-event-filter-popper) {
    min-width: 240px !important;
}

:global(.audit-custom-date-popper[data-popper-placement^='bottom']) {
    margin-top: -8px !important;
}

:global(.audit-custom-date-popper .el-picker-panel__icon-btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin-top: 0;
}

:global(.audit-custom-date-popper .el-picker-panel__icon-btn.d-arrow-left) {
    margin-right: 8px;
}

:global(.audit-custom-date-popper .el-picker-panel__icon-btn.d-arrow-right) {
    margin-left: 8px;
}

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

.audit-event-icon.is-product-created {
    background: #ecfdf5;
    color: #047857;
}

.audit-event-icon.is-product-updated {
    background: #eff6ff;
    color: #2563eb;
}

.audit-event-icon.is-product-deleted {
    background: #fef2f2;
    color: #dc2626;
}

.audit-event-icon.is-address-created {
    background: #ecfdf5;
    color: #047857;
}

.audit-event-icon.is-address-updated {
    background: #eff6ff;
    color: #2563eb;
}

.audit-event-icon.is-address-deleted {
    background: #fef2f2;
    color: #dc2626;
}

.audit-event-icon.is-address-selected {
    background: #f5f3ff;
    color: #7c3aed;
}

.audit-event-icon.is-profile-updated {
    background: #eff6ff;
    color: #2563eb;
}

.audit-event-icon.is-profile-image-uploaded {
    background: #eff6ff;
    color: #2563eb;
}

.audit-event-icon.is-profile-image-deleted {
    background: #fef2f2;
    color: #dc2626;
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

.audit-card-heading h3 {
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

.audit-success-badge {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    border-radius: 999px;
    background: #dcfce7;
    color: #15803d;
    font-size: 10px;
    font-weight: 800;
    padding: 0 8px;
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

.audit-inline-error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid #fecaca;
    border-radius: 8px;
    background: #fffafa;
    color: #b91c1c;
    font-size: 12px;
    padding: 10px 12px;
}

.audit-inline-error button {
    flex: 0 0 auto;
    color: #991b1b;
    font-weight: 700;
    text-decoration: underline;
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
    to {
        background-position: -200% 0;
    }
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
    width: min(720px, calc(100vw - 32px));
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

.audit-product-detail {
    margin-top: 18px;
    border: 1px solid #dbeafe;
    border-radius: 9px;
    background: #f8fbff;
    padding: 14px;
}

.audit-product-detail-heading > span {
    color: #2563eb;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.audit-product-detail-heading h4 {
    margin-top: 2px;
    color: #1e293b;
    font-size: 15px;
    font-weight: 750;
}

.audit-product-detail-heading p,
.audit-no-product-changes {
    margin-top: 5px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.55;
}

.audit-address-detail {
    margin-top: 18px;
    border: 1px solid #dbeafe;
    border-radius: 9px;
    background: #f8fbff;
    padding: 14px;
}

.audit-address-detail-heading > span {
    color: #2563eb;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.audit-address-detail-heading h4 {
    margin-top: 2px;
    color: #1e293b;
    font-size: 15px;
    font-weight: 750;
}

.audit-address-detail-heading p,
.audit-address-reference {
    margin-top: 5px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.55;
}

.audit-address-sensitive-value {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.audit-address-sensitive-value button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex: 0 0 24px;
    border-radius: 6px;
    color: #7c3aed;
}

.audit-address-sensitive-value button:hover {
    background: #f5f3ff;
}

.audit-profile-detail {
    margin-top: 18px;
    border: 1px solid #dbeafe;
    border-radius: 9px;
    background: #f8fbff;
    padding: 14px;
}

.audit-profile-detail-heading > span {
    color: #2563eb;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.audit-profile-detail-heading h4 {
    margin-top: 2px;
    color: #1e293b;
    font-size: 15px;
    font-weight: 750;
}

.audit-profile-image-summary {
    margin-top: 5px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.55;
}

.audit-profile-sensitive-value {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.audit-profile-sensitive-value button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex: 0 0 24px;
    border-radius: 6px;
    color: #7c3aed;
}

.audit-profile-sensitive-value button:hover {
    background: #f5f3ff;
}

.audit-snapshot-table-wrap {
    margin-top: 12px;
    overflow-x: auto;
    border: 1px solid #dbeafe;
    border-radius: 8px;
    background: #ffffff;
}

.audit-snapshot-table {
    width: 100%;
    min-width: 420px;
    border-collapse: collapse;
    table-layout: fixed;
    text-align: left;
}

.audit-snapshot-data-column {
    /* Jaga nilai snapshot tetap sejajar dengan metadata tanpa membuat label berhimpitan. */
    width: 152px;
}

.audit-snapshot-table th,
.audit-snapshot-table td {
    padding: 10px 12px;
    color: #334155;
    font-size: 12px;
}

.audit-snapshot-table thead th {
    background: #eff6ff;
    color: #475569;
    font-size: 11px;
    font-weight: 750;
    white-space: nowrap;
}

.audit-snapshot-table tbody tr + tr {
    border-top: 1px solid #e2e8f0;
}

.audit-snapshot-table tbody th {
    color: #1e293b;
    font-weight: 750;
    white-space: nowrap;
}

.audit-snapshot-table tbody td {
    overflow-wrap: anywhere;
}

.audit-change-table-wrap {
    margin-top: 12px;
    overflow-x: auto;
    border: 1px solid #dbeafe;
    border-radius: 8px;
    background: #ffffff;
}

.audit-change-table {
    width: 100%;
    /* Tetap di bawah lebar isi modal desktop agar scroll horizontal hanya menyala
       pada layar sempit, bukan pada panel detail berukuran penuh. */
    min-width: 620px;
    border-collapse: collapse;
    table-layout: fixed;
    text-align: left;
}

.audit-change-data-column {
    /* Cukup untuk label terpanjang seluruh domain audit, yang sebelumnya meluber ke
       kolom nilai karena label tidak pernah wrap. */
    width: 144px;
}

.audit-change-value-column {
    width: auto;
}

.audit-change-status-column {
    width: 86px;
}

.audit-change-table th,
.audit-change-table td {
    padding: 10px 12px;
    color: #334155;
    font-size: 12px;
}

.audit-change-table thead th {
    background: #eff6ff;
    color: #475569;
    font-size: 11px;
    font-weight: 750;
    white-space: nowrap;
}

.audit-change-table tbody tr + tr {
    border-top: 1px solid #e2e8f0;
}

.audit-change-table tbody th {
    color: #1e293b;
    font-weight: 750;
    white-space: nowrap;
}

.audit-change-table tbody td:nth-child(2),
.audit-change-table tbody td:nth-child(3) {
    overflow-wrap: anywhere;
}

.audit-change-table thead th:last-child,
.audit-change-table tbody td:last-child {
    text-align: center;
}

.audit-change-status {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    border-radius: 999px;
    padding: 0 8px;
    font-size: 10px;
    font-weight: 800;
    white-space: nowrap;
}

.audit-change-status.is-changed {
    background: #dbeafe;
    color: #1d4ed8;
}

.audit-change-status.is-unchanged {
    background: #f1f5f9;
    color: #64748b;
}

.audit-image-change-summary {
    margin-top: 14px;
    border: 1px solid #dbeafe;
    border-radius: 8px;
    background: #ffffff;
    padding: 12px;
}

.audit-image-change-summary h5 {
    color: #1e293b;
    font-size: 12px;
    font-weight: 750;
}

.audit-image-change-summary ul {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin: 8px 0 0;
    padding: 0;
    color: #475569;
    font-size: 12px;
    line-height: 1.55;
    list-style: none;
}

.audit-image-change-summary li {
    border-radius: 999px;
    background: #eff6ff;
    color: #1e40af;
    padding: 5px 9px;
    font-weight: 650;
}

.audit-image-change-summary p {
    margin-top: 5px;
    color: #64748b;
    font-size: 12px;
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

@container settings-header (max-width: 1024px) {
    .audit-header-controls {
        width: auto;
    }

    .audit-filter-trigger {
        display: inline-flex;
    }

    .audit-filter-panel {
        position: absolute;
        top: calc(100% + 8px);
        left: auto;
        right: 0;
        z-index: 30;
        display: none;
        box-sizing: border-box;
        width: 320px;
        min-width: 0;
        max-width: calc(100vw - 24px);
        max-height: calc(100vh - 140px);
        overflow: visible;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: #ffffff;
        padding: 14px;
        box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
    }

    .audit-filter-panel::before {
        position: absolute;
        top: -7px;
        left: auto;
        right: 56px;
        width: 12px;
        height: 12px;
        border-top: 1px solid #e2e8f0;
        border-left: 1px solid #e2e8f0;
        background: #ffffff;
        content: '';
        transform: rotate(45deg);
    }

    .audit-filter-panel.is-open {
        display: block;
    }

    .audit-filter-group {
        align-items: stretch;
        flex-direction: column;
    }

    .audit-filter-field {
        width: 100%;
    }
}

@media (max-width: 640px) {
    .audit-header-controls {
        width: 100%;
    }

    .audit-header-actions {
        width: 100%;
    }

    .audit-filter-trigger {
        display: inline-flex;
        flex: 1 1 auto;
    }

    .audit-filter-panel {
        position: absolute;
        top: calc(100% + 8px);
        left: 12px;
        right: auto;
        z-index: 30;
        display: none;
        box-sizing: border-box;
        width: calc(100% - 24px);
        min-width: 0;
        max-width: none;
        max-height: calc(100vh - 140px);
        overflow: visible;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: #ffffff;
        padding: 14px;
        box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
    }

    .audit-filter-panel::before {
        position: absolute;
        top: -7px;
        left: 24px;
        right: auto;
        width: 12px;
        height: 12px;
        border-top: 1px solid #e2e8f0;
        border-left: 1px solid #e2e8f0;
        background: #ffffff;
        content: '';
        transform: rotate(45deg);
    }

    .audit-filter-panel.is-open {
        display: block;
    }

    .audit-filter-group {
        align-items: stretch;
        flex-direction: column;
    }

    .audit-filter-field {
        width: 100%;
    }
}

@media (max-width: 865px) {
    :global(.audit-custom-date-popper) {
        width: min(480px, calc(100vw - 24px)) !important;
        max-width: calc(100vw - 24px) !important;
        max-height: calc(100vh - 24px);
        overflow-y: auto;
    }

    :global(.audit-custom-date-popper .el-date-range-picker) {
        width: 100%;
        max-width: 100%;
    }

    :global(.audit-custom-date-popper .el-date-range-picker .el-picker-panel__body) {
        min-width: 0;
    }

    :global(.audit-custom-date-popper .el-date-range-picker__content) {
        float: none;
        width: 100%;
    }

    :global(.audit-custom-date-popper .el-date-range-picker__content.is-left) {
        border-right: 0;
        border-bottom: 1px solid var(--el-datepicker-inner-border-color);
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
