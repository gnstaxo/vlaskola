import VueCountdown from './vue-countdown.js'

export default {
  template:
    `
    <vue-countdown style="display:block; margin:auto; width:max-content;" :time="time" @end="onCountdownEnd" v-slot="{ minutes, seconds }">
      {{ minutes }}:{{ seconds }}
    </vue-countdown>
    <div class="row">
        <div v-for="question in max_questions" class="col-sm-3 col-md-6 col-lg-4">
          <router-link style="text-decoration:none;" :to="{ query: { question: question } }">
            <p class="question-square bordered rounded" :class="{ answered: answers.has(question) }">
              {{ question }}
            </p>
          </router-link>
        </div>
    </div>
    `,
  data() {
    function range(start, end) { return Array.apply(Array, Array(end + 1 - start)).map(function (_, i) { return i + start; }); }
    var max_arr = range(1, Lockr.get('max_questions'))
    // Load exam timer
    const now = new Date();
    const exam_time = new Date(Lockr.get('time'))
    return {
      max_questions: max_arr,
      time: exam_time - now,
    }
  },
  emits: ['exam-finished'],
  props: {
    answers: {
      type: Set,
      required: true
    },
  },
  components: {
    VueCountdown
  },
  methods: {
    onCountdownEnd(){
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
  }
}
