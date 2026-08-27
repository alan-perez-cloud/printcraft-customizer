import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import './assets/theme.css'

import { createPinia } from 'pinia'
createApp(App).use(createPinia()).mount('#app')


