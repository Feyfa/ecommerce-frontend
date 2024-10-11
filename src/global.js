import { reactive } from 'vue';
import PersonImage from '@/assets/img/person.png';

const global = reactive({
  personImage: PersonImage,
  isCLickDropdown: {
    profile: false,
    product: false
  },
  isSidebarOpen: false,
  isFilterOpen: false,
  isAuth: false,
  isConnectedAccountComplete: false,
});

export default global;