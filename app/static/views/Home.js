export default {
  template:
    `
    <div class="row">
      <div v-for="exam in exams" class="col-sm-12 col-md-6 col-lg-3">
        <div class="card fluid">
          <h3 class="section">{{ exam.name }}</h3>
          <p class="section">{{ exam.description }}</p>
          <div class="section">
            <router-link :to="{ name: 'Exam', params: { node_id: exam.node_id } }" class="button small primary">View</router-link>
          </div>
        </div>
      </div>
    </div>
    `,
  data() {
    return {
      exams: []
    }
  },
  beforeRouteEnter(to, from, next) {
    axios
      .get('/api/exams/public/', {
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': Lockr.get('Authentication-Token')
        }
      })
      .then((response) => {
        next((vm) => ( vm.exams = response.data ))
      })
      .catch((err) => {
        next((vm) => ( vm.$router.push({name: 'Login'}) ))
      })
  }
}
