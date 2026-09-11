import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/base.css'
import App from './App.vue'
import { initializeLibraryData } from './utils/libraryStorage.js'
import router from './router/index.js'

const app = createApp(App)

initializeLibraryData()
app.use(createPinia())
app.use(ElementPlus)
app.use(router)
app.mount('#app')
