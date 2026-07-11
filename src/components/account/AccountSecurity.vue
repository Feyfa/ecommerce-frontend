<template>
    <div class="account-security-card">
        <div class="account-security-header">
            <h2>Keamanan</h2>
        </div>

        <section class="account-security-section">
            <div class="account-section-heading">
                <h3>Ubah Password</h3>
            </div>

            <div class="account-security-grid">
                <div class="input-container flex flex-col w-full">
                    <label for="old-password">Password Lama</label>
                    <el-input
                        id="old-password"
                        v-model="oldPassword"
                        type="password"
                        placeholder="Password Lama"
                        size="large"
                        show-password
                        autocomplete="off"
                        :class="{'is-error': errors.oldPassword}"
                        @input="watchInput('oldpassword')"/>
                    <small v-if="errors.oldPassword" class="text-xs text-red-500 mt-1">{{ errors.oldPassword }}</small>
                </div>

                <div class="input-container flex flex-col w-full">
                    <label for="new-password">Password Baru</label>
                    <el-input
                        id="new-password"
                        v-model="newPassword"
                        type="password"
                        placeholder="Password Baru"
                        size="large"
                        show-password
                        autocomplete="off"
                        :class="{'is-error': errors.newPassword}"
                        @input="watchInput('newpassword')"/>
                    <small v-if="errors.newPassword" class="text-xs text-red-500 mt-1">{{ errors.newPassword }}</small>
                </div>

                <div class="input-container flex flex-col w-full">
                    <label for="confirm-password">Konfirmasi Password Baru</label>
                    <el-input
                        id="confirm-password"
                        v-model="confirmPassword"
                        type="password"
                        placeholder="Konfirmasi Password Baru"
                        size="large"
                        show-password
                        autocomplete="off"
                        :class="{'is-error': errors.confirmPassword}"
                        @input="watchInput('confirmpassword')"/>
                    <small v-if="errors.confirmPassword" class="text-xs text-red-500 mt-1">{{ errors.confirmPassword }}</small>
                </div>
            </div>

            <div class="account-security-action">
                <button
                    type="button"
                    class="account-primary-button"
                    :disabled="isProcessChangePassword"
                    :class="{'opacity-50': isProcessChangePassword}"
                    @click="changePassword">
                    Simpan Password
                    <i v-if="isProcessChangePassword" class="ml-1 fas fa-spinner fa-pulse"></i>
                </button>
            </div>
        </section>

        <div class="account-security-divider"></div>

        <section class="account-security-section account-tfa-section">
            <div class="account-section-heading account-tfa-heading">
                <h3>Two-Factor Authentication</h3>
                <span
                    class="account-tfa-badge"
                    :class="{'is-enabled': tfa != 'F'}">
                    {{ tfaStatusLabel }}
                </span>
            </div>

            <div class="account-tfa-controls">
                <div class="input-container account-tfa-field flex flex-col w-full">
                    <span class="account-field-label">Status TFA</span>
                    <el-select
                        id="security-tfa"
                        v-model="tfa"
                        class="account-tfa-select"
                        size="large"
                        aria-label="Status TFA"
                        :disabled="isProcessUpdateTfa">
                        <el-option label="Off" value="F" />
                        <el-option label="Email" value="Email" />
                        <el-option label="Phone" value="Phone" />
                    </el-select>
                </div>
                <button
                    type="button"
                    class="account-tfa-save-button"
                    :disabled="isProcessUpdateTfa"
                    :class="{'opacity-50': isProcessUpdateTfa}"
                    @click="updateTfa">
                    Simpan TFA
                    <i v-if="isProcessUpdateTfa" class="ml-1 fas fa-spinner fa-pulse"></i>
                </button>
            </div>
        </section>
    </div>
</template>

<script>
import { ElNotification } from 'element-plus';

export default {
    data() {
        return {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
            tfa: 'F',
            isProcessChangePassword: false,
            isProcessUpdateTfa: false,
            touched: {
                confirmPassword: false
            },
            errors: {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            }
        }
    },

    computed: {
        tfaStatusLabel() {
            return this.tfa == 'F' ? 'Off' : this.tfa;
        }
    },

    mounted() {
        this.syncTfaFromStore();
    },

    methods: {
        syncTfaFromStore() {
            const user = this.$store.getters.user || {};
            this.tfa = user.tfa || 'F';
        },

        watchInput(type) {
            if(type == 'oldpassword') {
                this.errors.oldPassword = this.oldPassword.trim().length > 0 ? '' : 'old password required';
            } else if(type == 'newpassword') {
                this.errors.newPassword = this.newPassword.trim().length > 0 ? '' : 'new password required';
                if(this.touched.confirmPassword || this.confirmPassword.trim().length > 0) {
                    this.validateConfirmPassword();
                }
            } else if(type == 'confirmpassword') {
                this.touched.confirmPassword = true;
                this.validateConfirmPassword();
            }
        },

        validateConfirmPassword() {
            if(this.confirmPassword.trim().length <= 0) {
                this.errors.confirmPassword = 'confirm password required';
            } else if(this.confirmPassword != this.newPassword) {
                this.errors.confirmPassword = 'confirm password must match';
            } else {
                this.errors.confirmPassword = '';
            }
        },

        validateForm() {
            this.watchInput('oldpassword');
            this.watchInput('newpassword');
            this.touched.confirmPassword = true;
            this.watchInput('confirmpassword');

            return !this.errors.oldPassword && !this.errors.newPassword && !this.errors.confirmPassword;
        },

        resetForm() {
            this.oldPassword = '';
            this.newPassword = '';
            this.confirmPassword = '';
            this.touched.confirmPassword = false;
            this.errors.oldPassword = '';
            this.errors.newPassword = '';
            this.errors.confirmPassword = '';
        },

        changePassword() {
            if(!this.validateForm()) return;

            this.isProcessChangePassword = true;

            this.$store.dispatch('changePassword', {
                id: this.$store.getters.user.id,
                oldPassword: this.oldPassword,
                newPassword: this.newPassword,
            })
            .then(response => {
                this.isProcessChangePassword = false;

                if(response.data.result == 'success') {
                    this.resetForm();
                    ElNotification({ type: 'success', title: 'Success', message: response.data.message });
                }
            })
            .catch(error => {
                this.isProcessChangePassword = false;

                if(error.response?.data?.result == 'error' && error.response?.data?.error_type == 'old_password_invalid') {
                    ElNotification({ type: 'error', title: 'Error', message: error.response.data.message });
                    return;
                }

                const message = error.response?.data?.message;
                if(typeof message == 'object') {
                    Object.keys(message).forEach(key => {
                        ElNotification({ type: 'error', title: 'Error', message: message[key][0] });
                    });
                } else {
                    ElNotification({ type: 'error', title: 'Error', message: message ?? 'Something Wrong' });
                }
            });
        },

        updateTfa() {
            if(this.isProcessUpdateTfa) return;

            const user = this.$store.getters.user || {};
            this.isProcessUpdateTfa = true;

            this.$store.dispatch('updateUser', {
                id: user.id,
                name: user.name,
                email: user.email,
                jenis_kelamin: user.jenis_kelamin,
                tanggal_lahir: user.tanggal_lahir,
                phone: user.phone,
                tfa: this.tfa,
            })
            .then(response => {
                this.isProcessUpdateTfa = false;

                if(response.data.status == 200) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));

                    this.$store.dispatch('fetchTokenFromLocalStorage');
                    this.$store.dispatch('fetchUserFromLocalStorage');
                    this.$store.dispatch('fetchCompanyFromLocalStorage');

                    ElNotification({ type: 'success', title: 'Success', message: response.data.message });
                }
            })
            .catch(error => {
                this.isProcessUpdateTfa = false;

                const message = error.response?.data?.message;
                if(typeof message == 'object') {
                    Object.keys(message).forEach(key => {
                        ElNotification({ type: 'error', title: 'Error', message: message[key][0] });
                    });
                } else {
                    ElNotification({ type: 'error', title: 'Error', message: message ?? 'Something Wrong' });
                }
            });
        }
    }
}
</script>

<style scoped>
.account-security-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    padding: 20px;
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
}

.account-security-header {
    border-bottom: 1px solid #eef2f7;
    padding-bottom: 14px;
}

.account-security-header h2 {
    color: #111827;
    font-size: 20px;
    font-weight: 600;
}

.account-security-grid {
    display: grid;
    gap: 16px;
    margin-top: 12px;
}

.account-security-section {
    padding-top: 18px;
}

.account-section-heading h3 {
    color: #111827;
    font-size: 17px;
    font-weight: 600;
}

.account-field-label {
    color: #334155;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.25;
    cursor: default;
}

.account-security-action {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.account-primary-button,
.account-secondary-button,
.account-tfa-save-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    min-width: 180px;
    border-radius: 7px;
    font-weight: 500;
    padding: 0 18px;
    transition: 150ms ease-in-out;
}

.account-primary-button {
    border: 1px solid #7c3aed;
    background: #8b5cf6;
    color: #ffffff;
}

.account-primary-button:not(:disabled):hover {
    background: #7c3aed;
}

.account-secondary-button {
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #374151;
}

.account-secondary-button:not(:disabled):hover {
    background: #f3f4f6;
}

.account-security-divider {
    margin-top: 24px;
    border-top: 1px solid #eef2f7;
    padding-top: 18px;
}

.account-tfa-section {
    padding-top: 0;
}

.account-tfa-heading {
    display: flex;
    align-items: center;
    gap: 10px;
}

.account-tfa-badge {
    display: inline-flex;
    align-items: center;
    min-height: 26px;
    border-radius: 6px;
    background: #f3f4f6;
    color: #4b5563;
    font-size: 12px;
    font-weight: 700;
    padding: 0 9px;
}

.account-tfa-badge.is-enabled {
    background: #ede9fe;
    color: #6d28d9;
}

.account-tfa-controls {
    display: flex;
    align-items: flex-end;
    gap: 14px;
    margin-top: 12px;
}

.account-tfa-field {
    max-width: 420px;
}

.account-tfa-select {
    width: 100%;
}

.account-tfa-save-button {
    min-width: 136px;
    border: 1px solid #7c3aed;
    background: #8b5cf6;
    color: #ffffff;
}

.account-tfa-save-button:not(:disabled):hover {
    background: #7c3aed;
}

:deep(.el-input__wrapper) {
    height: 44px;
    min-height: 44px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper.is-focus),
:deep(.el-input__wrapper:focus-within),
:deep(.el-select__wrapper:hover),
:deep(.el-select__wrapper.is-focused),
:deep(.el-select__wrapper:focus-within) {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 2px #ede9fe, 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

.account-tfa-select :deep(.el-select__wrapper) {
    height: 44px;
    min-height: 44px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

.is-error :deep(.el-input__wrapper),
.is-error :deep(.el-input__wrapper:hover),
.is-error :deep(.el-input__wrapper.is-focus),
.is-error :deep(.el-input__wrapper:focus-within) {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 2px #fee2e2, 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

@media (min-width: 768px) {
    .account-security-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 767px) {
    .account-security-action {
        align-items: stretch;
        flex-direction: column;
    }

    .account-primary-button {
        width: 100%;
    }

    .account-tfa-controls {
        align-items: stretch;
        flex-direction: column;
    }

    .account-tfa-field {
        max-width: none;
    }

    .account-tfa-save-button {
        width: 100%;
    }
}
</style>
