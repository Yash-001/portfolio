import { createApp } from 'vue'
import App from './App.vue'

import { router } from '@/router'
import { pinia } from '@/plugins/pinia'
import { primevue } from '@/plugins/primevue'
import { gsapPlugin } from '@/plugins/gsap'

import '@/styles/main.css'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(primevue)
app.use(gsapPlugin)

app.mount('#app')
