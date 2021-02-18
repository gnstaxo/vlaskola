export default {
  template:
    `
    <div class="row">
      <div class="col-sm-12">
        <table>
          <caption>Results</caption>
          <thead>
            <tr>
              <th>Email</th>
              <th>C/I</th>
              <th>Index</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="submitter in submitters">
              <td data-label="Email">{{ submitter.user.email }}</td>
              <td data-label="C/I">{{ submitter.correct}}/{{ submitter.incorrect }}</td>
              <td data-label="Index">{{ Math.floor((submitter.correct/max_questions) * 100) }}%</td>
            </tr>
          </tbody>
        </table> 
      </div>
    </div>
    `,
  data() {
    return {
      submitters: [],
      max_questions: 0
    }
  },
  beforeRouteEnter(to, from, next) {
    axios
      .get('/api' + to.path, {
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': Lockr.get('Authentication-Token')
        }
      })
      .then((response) => {
        next((vm) => {
          vm.submitters = response.data.submitters
          vm.max_questions = response.data.max_questions
        })
      })
  },
}
