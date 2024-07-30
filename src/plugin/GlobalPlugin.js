import globalData from '@/global';

const GlobalPlugin = {
  install(app) {
    app.config.globalProperties.$global = globalData;
  },
}

export default GlobalPlugin;
