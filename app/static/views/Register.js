export default {
  template:
    `
    <div class="row">
      <div class="col-sm-6 col-sm-offset-3">
        <div class="card fluid">
          <form method="post" @submit.prevent="onSubmit">
            <fieldset>
              <legend>Register</legend>
              <div class="row responsive-label">
                <div class="col-sm-12">
                  <input type="email" v-model="email" placeholder="Email" style="width:100%;"/>
                </div>
              </div>
              <div class="row responsive-label">
                <div class="col-sm-12">
                  <input type="password" v-model="password" placeholder="Password" style="width: 100%;"/>
                </div>
              </div>
              <div class="row responsive-label">
                <div class="col-sm-12">
                  <input type="password" v-model="password_confirm" placeholder="Confirm password" style="width: 100%;"/>
                </div>
              </div>
              <input type="submit" value="Register"/>
              <router-link :to="{name: 'Login'}">Have an account?</router-link>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
    `,
  data() {
    return {
      email: "",
      password: "",
      password_confirm: ""
    }
  },
  methods: {
    onSubmit(){
      axios
        .post('/api/accounts/register?include_auth_token=True', {
          email: this.email,
          password: this.password,
          password_confirm: this.password_confirm
        })
        .then(response => {
          Lockr.set('Authentication-Token', response.data.response.user.authentication_token)
          this.$router.push({name: 'Home'})
        })
    }
  }
}
