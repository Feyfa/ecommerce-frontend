<template>
    <div class="account-page px-4 lg:px-6 w-full pb-10">
        <div v-if="hasAccountUser" class="account-shell">
            <div class="account-header">
                <div>
                    <h1>Akun Saya</h1>
                    <span>{{ accountTypeLabel }}</span>
                </div>
            </div>

            <div class="account-tabbar" role="tablist">
                <button
                    v-for="tab in accountTabs"
                    :key="tab.name"
                    type="button"
                    role="tab"
                    class="account-tab-button"
                    :class="{'is-active': activeTab == tab.name}"
                    @click="changeTab(tab.name)">
                    {{ tab.label }}
                </button>
            </div>

            <div class="account-content">
                <SaldoView v-if="activeTab == 'saldo'" embedded />
                <PaymentView v-if="activeTab == 'rekening'" embedded />
                <template v-if="activeTab == 'profile'">
                    <UserProfileView v-if="isBuyer" embedded :show-alamat="false" />
                    <CompanyProfileView v-else embedded />
                </template>
                <AddressList v-if="activeTab == 'alamat' && isBuyer" flat />
            </div>
        </div>
    </div>
</template>

<script>
import SaldoView from './SaldoView.vue';
import PaymentView from './PaymentView.vue';
import UserProfileView from './buyer/UserProfileView.vue';
import CompanyProfileView from './seller/CompanyProfileView.vue';
import AddressList from '@/components/user-profile/Alamat.vue';

export default {
    components: {
        SaldoView,
        PaymentView,
        UserProfileView,
        CompanyProfileView,
        AddressList,
    },

    data() {
        return {
            activeTab: this.getValidTab(this.$route.query.tab)
        }
    },

    computed: {
        isBuyer() {
            return this.$store.getters.activeAccountMode == 'buyer';
        },

        hasAccountUser() {
            return Boolean(this.$store.getters.user?.id);
        },

        accountTypeLabel() {
            return this.isBuyer ? 'Buyer' : 'Seller';
        },

        profileLabel() {
            return this.isBuyer ? 'User Profile' : 'Company Profile';
        },

        accountTabs() {
            const tabs = [
                { name: 'profile', label: this.profileLabel },
            ];

            if(this.isBuyer) {
                tabs.push({ name: 'alamat', label: 'Alamat' });
            }

            tabs.push(
                { name: 'saldo', label: 'Saldo' },
                { name: 'rekening', label: 'Rekening Bank' },
            );

            return tabs;
        }
    },

    methods: {
        getAvailableTabs() {
            const tabs = ['profile'];
            const isBuyer = this.$store.getters.activeAccountMode == 'buyer';

            if(isBuyer) {
                tabs.push('alamat');
            }

            tabs.push('saldo', 'rekening');

            return tabs;
        },

        getValidTab(tab) {
            const tabs = this.getAvailableTabs();
            return tabs.includes(tab) ? tab : 'profile';
        },

        syncActiveTab(tab) {
            const validTab = this.getValidTab(tab);
            this.activeTab = validTab;

            if(tab != validTab) {
                this.$router.replace({
                    name: 'account',
                    query: { tab: validTab }
                });
            }
        },

        changeTab(tab) {
            this.$router.replace({
                name: 'account',
                query: { tab }
            });
        }
    },

    watch: {
        '$route.query.tab'(tab) {
            this.syncActiveTab(tab);
        },

        isBuyer() {
            this.syncActiveTab(this.activeTab);
        }
    }
}
</script>

<style scoped>
.account-page {
    min-height: calc(100vh - 4.5rem);
    background: #f8fafc;
}

.account-shell {
    width: 100%;
    margin: 0 auto;
    padding-top: 18px;
}

.account-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.account-header h1 {
    color: #111827;
    font-size: 28px;
    font-weight: 700;
}

.account-header span {
    display: inline-flex;
    align-items: center;
    height: 26px;
    margin-top: 6px;
    border-radius: 6px;
    background: #ede9fe;
    color: #6d28d9;
    font-size: 13px;
    font-weight: 600;
    padding: 0 10px;
}

.account-tabbar {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    min-height: 52px;
    overflow-x: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #ffffff;
    padding: 7px;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.05);
    scrollbar-width: none;
}

.account-tabbar::-webkit-scrollbar {
    display: none;
}

.account-tab-button {
    flex: 0 0 auto;
    min-height: 38px;
    border-radius: 7px;
    border: 1px solid transparent;
    background: transparent;
    color: #4b5563;
    font-weight: 600;
    padding: 0 16px;
    transition: 150ms ease-in-out;
}

.account-tab-button:hover {
    background: #f5f3ff;
    color: #7c3aed;
}

.account-tab-button.is-active {
    border-color: #8b5cf6;
    background: #8b5cf6;
    color: #ffffff;
    box-shadow: 0 6px 14px rgba(124, 58, 237, 0.2);
}

.account-content {
    padding-top: 20px;
}

:deep(.shadow),
:deep(.shadow-md) {
    box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
}

:deep(.border-neutral-500),
:deep(.border-neutral-400) {
    border-color: #cbd5e1 !important;
}

:deep(.bg-neutral-50) {
    background-color: #ffffff !important;
}

:deep(.rounded) {
    border-radius: 8px;
}

:deep(.input-container) {
    gap: 6px;
}

:deep(.input-container label) {
    color: #334155;
    font-size: 14px;
    font-weight: 500;
}

:deep(input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.el-input__inner):not(.el-range-input):not(.el-select__input)),
:deep(select),
:deep(textarea) {
    width: 100%;
    min-height: 44px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background-color: #ffffff;
    color: #0f172a;
    font-size: 16px;
    outline: none;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out, background-color 150ms ease-in-out;
}

:deep(input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.el-input__inner):not(.el-range-input):not(.el-select__input)) {
    height: 44px;
    padding: 0 12px;
}

:deep(select) {
    height: 44px;
    padding: 0 36px 0 12px;
}

:deep(textarea) {
    min-height: 92px;
    padding: 10px 12px;
}

:deep(input:not(.el-input__inner):not(.el-range-input):not(.el-select__input)::placeholder),
:deep(textarea::placeholder) {
    color: #94a3b8;
}

:deep(input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.el-input__inner):not(.el-range-input):not(.el-select__input):focus),
:deep(select:focus),
:deep(textarea:focus) {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 2px #ede9fe, 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

:deep(input:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.el-input__inner):not(.el-range-input):not(.el-select__input):disabled),
:deep(select:disabled),
:deep(textarea:disabled),
:deep(.input-disabled) {
    background-color: #f8fafc;
    color: #475569;
    -webkit-text-fill-color: #475569;
    opacity: 1;
}

:deep(button.bg-violet-500) {
    border-color: #7c3aed;
    background-color: #8b5cf6;
    color: #ffffff;
    font-weight: 500;
}

:deep(button.bg-violet-500:not(:disabled):hover) {
    background-color: #7c3aed;
}

:deep(button.bg-red-600) {
    border-color: #dc2626;
    background-color: #ef4444;
    color: #ffffff;
    font-weight: 500;
}

:deep(button.bg-red-600:not(:disabled):hover) {
    background-color: #dc2626;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper),
:deep(.el-date-editor.el-input__wrapper) {
    height: 44px;
    min-height: 44px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
    background-color: #ffffff;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05) !important;
    transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out, background-color 150ms ease-in-out;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper.is-focus),
:deep(.el-input__wrapper:focus-within),
:deep(.el-select__wrapper:hover),
:deep(.el-select__wrapper.is-focused),
:deep(.el-select__wrapper:focus-within),
:deep(.el-date-editor.el-input__wrapper:hover),
:deep(.el-date-editor.el-input__wrapper.is-active),
:deep(.el-date-editor.el-input__wrapper:focus-within) {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 2px #ede9fe, 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

:deep(.el-input__inner),
:deep(.el-select__input),
:deep(.el-select__placeholder),
:deep(.el-date-editor .el-range-input) {
    color: #0f172a;
    font-size: 16px;
}

:deep(.el-input__inner),
:deep(.el-select__input),
:deep(.el-date-editor .el-range-input) {
    min-height: 0;
    border: 0 !important;
    border-radius: 0;
    background: transparent;
    box-shadow: none !important;
}

:deep(.el-input__inner::placeholder),
:deep(.el-date-editor .el-range-input::placeholder) {
    color: #94a3b8;
}

:deep(.el-input.is-disabled .el-input__wrapper),
:deep(.el-select.is-disabled .el-select__wrapper),
:deep(.el-date-editor.is-disabled) {
    background-color: #f8fafc;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

:deep(.border-red-500),
:deep(.is-error .el-input__wrapper) {
    border-color: #ef4444 !important;
}

:deep(.border-red-500:focus),
:deep(input.is-error-field:not([type="checkbox"]):not([type="radio"]):not([type="file"]):not(.el-input__inner):not(.el-range-input):not(.el-select__input):focus),
:deep(.setting-card input.is-error-field),
:deep(.setting-card input.is-error-field:focus),
:deep(.setting-card input.is-error-field.border-red-500:focus),
:deep(.setting-card textarea.is-error-field),
:deep(.setting-card textarea.is-error-field:focus),
:deep(.setting-card textarea.is-error-field.border-red-500:focus),
:deep(.alamat-modal input.is-error-field),
:deep(.alamat-modal input.is-error-field:focus),
:deep(.alamat-modal input.is-error-field.border-red-500:focus),
:deep(.alamat-modal textarea.is-error-field),
:deep(.alamat-modal textarea.is-error-field:focus),
:deep(.alamat-modal textarea.is-error-field.border-red-500:focus),
:deep(.is-error .el-input__wrapper.is-focus),
:deep(.is-error .el-input__wrapper:focus-within) {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 2px #fee2e2, 0 1px 2px rgba(15, 23, 42, 0.05) !important;
}

@media (max-width: 640px) {
    .account-header h1 {
        font-size: 24px;
    }

    .account-tabbar {
        gap: 4px;
        padding: 6px;
    }

    .account-tab-button {
        min-height: 36px;
        padding: 0 10px;
        font-size: 12px;
    }
}
</style>
