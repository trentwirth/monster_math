import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Import CSS design system
import './assets/styles/base.css'
import './assets/styles/typography.css'
import './assets/styles/animations.css'

// Register rulesets
import './rulesets/dnd5e/index'
import './rulesets/drawsteel/index'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
