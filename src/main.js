import './assets/style/style.css'

import { createApp } from 'vue'
import { clerkPlugin } from '@clerk/vue'
import App from './App.vue'
import router from './router'
import store from './store'
import GlobalPlugin from "./plugin/GlobalPlugin"
import { getClerkPluginOptions, isClerkEnabled } from './clerk'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/style/select-element-ui.css'

const app = createApp(App)

/* step 1: aktifkan Clerk hanya jika env publishable key sudah tersedia */
if(isClerkEnabled) {
  app.use(clerkPlugin, getClerkPluginOptions());
}
/* step 1 */

app.use(router)
app.use(store);
app.use(ElementPlus);
app.use(GlobalPlugin);

app.mount('#app')
