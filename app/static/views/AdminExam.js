import ExamForm from '../components/ExamForm.js'
import store from '../components/store.js'

export default {
  template:
    `
    <template v-if="authorized">
    <div class="row">
      <div class="col-sm-12 col-sm-last col-lg-4 col-lg-first" id="exam-list-sidebar">
        <button @click="onCreateButton">Create</button>
        <div v-for="exam in exams" class="row">
          <div class="col-sm-12" >
            <div class="card fluid ">
              <h4 class="section exam-list-item" @click="selectExam(exam)">{{ exam.name}}</h4>
              <p class="section">{{ exam.description }}</p>
              <div class="section">
                <router-link :to="{ name: 'Exam', params: { node_id:exam.node_id }}">{{ exam.node_id }}</router-link> |
                <router-link :to="{ name: 'Result', params: { node_id:exam.node_id }}">See results</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-sm-12 col-lg-8">
        <exam-form :exams="exams" :current_action="current_action" :selected_exam="selected_exam"
        @exam-created="onExamCreated" @exam-deleted="onExamDeleted" @exam-edited="onExamEdited"></exam-form>
      </div>
    </div>
    </template>
    `,
  components: {
    'exam-form': ExamForm
  },
  data() {
    return {
      exams: [],
      current_action: "Create",
      authorized: false,
      selected_exam: null,
      sharedState: store.state
    }
  },
  created() {
    axios
      .get('/api/exams/', {
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': Lockr.get('Authentication-Token')
        }
      })
      .then((response) => {
        this.exams = response.data
        this.authorized = true
      })
      .catch((response) => {
        this.$router.push({name: 'Home'})
      })
  },
  methods: {
    onCreateButton(){
      this.current_action = "Create"
      this.sharedState.name = ""
      this.sharedState.description = ""
      this.sharedState.roles = ""
      this.sharedState.time = 10
      this.sharedState.atts = 2
    },
    selectExam(exam){
      this.current_action = "Edit"
      this.selected_exam = exam
      this.sharedState.name = exam.name
      this.sharedState.description = exam.description
      this.sharedState.roles = exam.roles
      this.sharedState.time = exam.time
      this.sharedState.atts = exam.attempts
    },
    onExamCreated(exam) {
      this.exams.unshift(exam)
      this.current_action = "Create"
      this.sharedState.name = ""
      this.sharedState.description = ""
      this.sharedState.roles = ""
      this.sharedState.time = 10
      this.sharedState.atts = 2
    },
    onExamDeleted(exam) {
      var idx = this.exams.indexOf(exam)
      this.exams.splice(idx, 1)
      this.current_action = "Create"
      this.sharedState.name = ""
      this.sharedState.description = ""
      this.sharedState.roles = ""
      this.sharedState.time = 10
      this.sharedState.atts = 2
    },
    onExamEdited(exam) {
      this.selected_exam = exam
      var idx = this.exams.indexOf(this.selected_exam)
      this.exams[idx] = exam
    }
  }
}
