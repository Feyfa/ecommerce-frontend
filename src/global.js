import { reactive } from 'vue';

const global = reactive({
  isClickDropdown: {
    profile: false,
    company: false,
    product: false,
    userSetting: false,
  },
  isSidebarOpen: false,
  isFilterOpen: false,
  isAuth: false,
  showUserProfileView: {
    allComponent: false,
    userSetting: false,
    alamat: false,
  },
  showCompanyProfileView: {
    allComponent: false,
    companySetting: false,
  },
  globalTemplate: {
    loading: false,
  },
  globalContainer: {
    ref: '',
    loading: false,
  },
  modals: {
    addProduct: false,
    editProduct: false,
  }
});

export default global;
