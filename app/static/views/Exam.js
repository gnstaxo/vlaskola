import ExamQuestion from '../components/ExamQuestion.js'
import ExamAnswerList from '../components/ExamAnswerList.js'

export default {
  template:
    `
    <div class="row">
      <div class="col-sm-12 col-sm-last col-md-2 col-md-first" v-if="$route.query.question">
        <exam-answer-list :answers="answers" @exam-finished="onExamFinished"></exam-answer-list>
      </div>
      <div class="col-sm-12 col-md-10" :class="{ 'col-md-offset-1': !$route.query.question }">
        <div class="card fluid">
          <template v-if="!$route.query.question">
            <h2 class="section double-padded">{{ exam.name }}</h2>
            <div class="section">
              <p>{{ exam.description }}</p>
              <small>Attempts left: {{ exam.attempts_left }}</small>
            </div>
            <router-link class="button Exam-btn-start"
            :to="{ query: { question: 1 }}" v-if="time > new Date()">Continue</router-link>
            <template v-else>
              <button v-if="exam.attempts_left >= 1 && !exam.locked"
              class="Exam-btn-start primary" @click="startExam">Start</button>
              <router-link v-else :to="{name: 'Home'}" class="button Exam-btn-start">Home</router-link>
            </template>
          </template>
          <template v-else>
            <exam-question :question="question"
            @answer-submitted="onAnswerSubmitted" @exam-finished="onExamFinished"></exam-question>
          </template>
        </div>
      </div>
    </div>
    `,
  data() {
    // Stored answers
    var stored_answers = Lockr.get('answers')
    if (!stored_answers)
      stored_answers = new Set([])
    else
      stored_answers = new Set(stored_answers)
    
    var stored_time = Lockr.get('time')
    return {
      exam: {},
      question: {input:{}},
      error: null,
      answers: stored_answers,
      time: new Date(stored_time)
    }
  },
  components: {
    ExamQuestion,
    ExamAnswerList,
  },
  beforeRouteEnter(to, from, next) {
    if (to.query.question) {
      axios
        .get("/api" + to.fullPath, {
          headers: {
            'Authentication-Token': Lockr.get('Authentication-Token')
          }
        })
        .then((response) => {
          next(vm => {
            vm.question = response.data
          })
        })
    }
    else {
      axios
        .get("/api" + to.path, {
          headers: {
            'Authentication-Token': Lockr.get('Authentication-Token')
          }
        })
        .then((response) => {
          next(vm => (vm.exam = response.data))
        })
    }
  },
  async beforeRouteUpdate(to, from) {
    this.question = {input:{}}
    try {
      const res = await axios.get("/api" + to.fullPath, {
          headers: {
            'Authentication-Token': Lockr.get('Authentication-Token')
          }
      })
      if (to.query.question){
        this.question = res.data
      }
      else
        this.exam = res.data
    } catch (error) {
      this.error = error.toString()
    }
  },
  methods: {
    startExam() {
      axios.get("/api" + this.$route.path + "/start", {
        headers: {
          'Content-Type': 'application/json',
          "Authentication-Token": Lockr.get('Authentication-Token')
        }
      })
      .then((response) => {
        // Save time entry for timer.

        Lockr.set('time', new Date(new Date().getTime() + parseInt(response.data.time) * 60 * 1000))
        Lockr.set('max_questions', response.data.max_questions)
        Lockr.set('answers', [])

        this.answers = new Set([])

        // Go to first question
        this.$router.push({query: {question: 1}})
      })
    },
    onAnswerSubmitted(answer){
      this.answers.add(answer)
      Lockr.set('answers', Array.from(this.answers))
    },
    onExamFinished(){
      this.time = undefined
    }
  }
}
