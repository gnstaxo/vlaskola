import { router } from './router.js'
import NavigationBar from './components/NavigationBar.js'

Lockr.prefix = 'lockr_';

export const app = Vue.createApp({
  components: {
    NavigationBar
  }
})

app.use(router)

app.mount('#app')
