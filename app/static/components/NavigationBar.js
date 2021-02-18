export default {
  template:
    `
    <header class="row">
      <router-link :to="{name: 'Home'}" class="logo col-sm-3">vlaskola</router-link>
      <template v-if="$route.name != 'Login' && $route.name != 'Register'">
        <router-link v-if="$route.name == 'AdminExam'" :to="{name: 'AdminUser'}" class="button col-sm-3">Admin</router-link>
        <router-link v-else :to="{name: 'AdminExam'}" class="button col-sm-3">Admin</router-link>
        <button @click="logOut" :to="{name: 'Home'}" class="col-sm-3">Logout</button>
      </template>
    </header>
    `,
  methods: {
    logOut() {
      axios
        .get('/api/accounts/logout', {
          headers: {
            'Content-Type': 'application/json',
            "Authentication-Token": Lockr.get('Authentication-Token')
          }
        })
        .then((response) => {
          Lockr.rm('Authentication-Token')
          this.$router.push({name: 'Login'})
        })
    }
  }
}
