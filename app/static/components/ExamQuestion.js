export default {
  template:
    `
    <div class="section">
      <p>{{ question.question }}</p>
    </div>
    <div class="section">
      <progress :value="question.id" :max="max_questions"></progress>
      <form id="question-form" method="POST" @submit.prevent="submitAnswer">
        <div class="row responsive-label" v-if="question.input.type == 'text'">
          <div class="col-sm-12 col-md">
            <input type="text" v-model="answer" style="width:100%;"/>
          </div>
        </div>
        <template v-for="(option, index) in question.input.options">
        <div class="row responsive-label" v-if="question.input.type == 'selection'">
          <div>
            <input :id="'sel-' + index"
              type="radio" v-model="answer" :value="option"
              v-if="question.input.type == 'selection'"/>
          </div>
          <div class="col-sm-12 col-md">
            <label :for="'sel-' + index">{{ option }}</label>
          </div>
        </div>
        </template>
        <input class="Exam-btn-start" type="submit" :value="submitAnswerButtonText"/>
      </form>
    </div>
    `,
  props: ['question'],
  emits: ['answer-submitted', 'exam-finished'],
  data(){
    const max_questions = Lockr.get('max_questions')
    return {
      max_questions: max_questions,
      answer: ""
    }
  },
  computed: {
    submitAnswerButtonText(){
      return this.question.last ? 'Finish' : 'Next' 
    }
  },
  methods: {
    finishExam(){
      this.$emit('exam-finished')
      axios
        .get('/api' + this.$route.path + '/finish', {
        headers: {
          "Authentication-Token": Lockr.get('Authentication-Token')
        }
      })
      .then((response) => {

        Lockr.rm('max_questions')
        Lockr.rm('time')
        Lockr.rm('answers')

        this.$router.push({path: this.$route.path})
      })
    },
    submitAnswer(){
      axios
        .post('/api' + this.$route.fullPath, {answer: this.answer},{
          headers: {
            "Authentication-Token": Lockr.get('Authentication-Token')
          },
        })
        .then((response) => {
          this.$emit('answer-submitted', this.question.id)
          if (this.submitAnswerButtonText == "Next"){
            // Go to next question
            this.answer = ""
            this.$router.push({query: {question: this.question.id + 1}})
          } else {
            // Route after finishing exam (button)
            this.finishExam()
          }
        })
    },
  },
}
