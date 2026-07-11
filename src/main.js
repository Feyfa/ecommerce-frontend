import './assets/style/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import GlobalPlugin from "./plugin/GlobalPlugin"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/style/select-element-ui.css'

const app = createApp(App)

app.use(router)
app.use(store);
app.use(ElementPlus);
app.use(GlobalPlugin);

app.mount('#app')
