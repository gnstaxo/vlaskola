export default {
  template:
    `
    <div class="row">
      <div class="col-sm-12 col-lg-8">
        <table>
          <caption>Users</caption>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Roles</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" @click="selectUser(user)">
              <td data-label="Id">{{ user.id }}</td>
              <td data-label="Email">{{ user.email }}</td>
              <td data-label="Roles"> {{ user.roles.map((item) => item.name).join(", ") }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-sm-12 col-lg-4">
        <div class="row">
          <div class="col-sm-12">
            <div class="card fluid">
              <h4 class="section">Edit user</h4>
              <div class="section">
                <form>
                  <div class="input-group vertical">
                    <label for="user_id">ID</label>
                    <input v-model="user_id" type="number" id="user_id"/>
                  </div>
                  <div class="input-group vertical">
                    <label for="roles">Roles</label>
                    <input v-model="roles" type="text" id="roles"/>
                  </div>
                  <button @click.prevent="saveUser" type="submit" class="primary small">Save</button>
                  <button @click.prevent="deleteUser" type="submit" class="secondary small">Delete</button>
                </form>
              </div>
            </div>
            <div class="card fluid">
              <h4 class="section">Register</h4>
              <div class="section">
                <form>
                  <div class="input-group vertical">
                    <label for="email">Email</label>
                    <input v-model="email" type="text" id="email"/>
                  </div>
                  <div class="input-group vertical">
                    <label for="password">Password</label>
                    <input v-model="password" type="password" id="password"/>
                  </div>
                  <button @click.prevent="registerUser" type="submit" class="small">Register</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
  data() {
    return {
      users: [],
      user_id: 0,
      user: null,
      roles: "",
      password: "",
      email: "",
    }
  },
  beforeRouteEnter(to, from, next) {
    axios
      .get('/api/users/', {
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': Lockr.get('Authentication-Token')
        }
      })
      .then((response) => {
        next((vm) => {
          vm.users = response.data
        })
      })
      .catch((response) => {
        this.$router.push({name: 'Home'})
      })
  },
  methods: {
    selectUser(user){
      this.user = user
      this.user_id = user.id
      this.roles = user.roles.map((role) => role.name)
    },
    saveUser(){

      var data = new FormData();
      data.append('roles', this.roles);

      axios
        .put('/api/user/' + this.user.id, data, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': Lockr.get('Authentication-Token')
          }
        })
        .then((response) => {
          var idx = this.users.indexOf(this.user)
          this.users[idx] = response.data
        })
    },
    deleteUser(){
      axios
        .delete('/api/user/' + this.user.id, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': Lockr.get('Authentication-Token')
          }
        })
        .then((response) => {
          var idx = this.users.indexOf(this.user);
          this.users.splice(idx, 1)
        })
    },
    registerUser(){

      var data = new FormData();
      data.append('email', this.email);
      data.append('password', this.password);

      axios
        .post('/api/users/', data, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': Lockr.get('Authentication-Token')
          }
        })
        .then((response) => ( this.users.unshift(response.data) ))
    }
  }
}
