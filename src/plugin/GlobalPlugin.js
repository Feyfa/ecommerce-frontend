import { reactive } from "vue";
import PersonImage from "@/assets/img/person.png";

const GlobalPlugin = {
  install(app) {
    // membuat attribute nya menjadi reactive, jadi saat berbeda file maka attribute nya juga berubah juga
    const globalData = reactive({
      personImage: PersonImage,
      isCLickDropdown: {
        profile: false,
        product: false
      }
    });

    app.config.globalProperties.$global = globalData;
  }
}

export default GlobalPlugin;