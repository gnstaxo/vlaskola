import store from './store.js'

export default {
  template:
    `
    <form id="exam-form" enctype="multipart/form-data">
      <fieldset>
        <legend>{{current_action}}</legend>
        <div class="row responsive-label">
          <div class="col-sm-12 col-md-3">
            <label for="ef-name">Name</label>
          </div>
          <div class="col-sm-12 col-md">
            <input id="ef-name" v-model="sharedState.name" type="text" style="width:85%;">
          </div>
        </div>
        <div class="row responsive-label">
          <div class="col-sm-12 col-md-3">
            <label for="ef-desc">Description</label>
          </div>
          <div class="col-sm-12 col-md">
            <input id="ef-desc" v-model="sharedState.description" type="text" style="width:85%;">
          </div>
        </div>
        <div class="row responsive-label">
          <div class="col-sm-12 col-md-3">
            <label for="ef-roles">Roles (comma separate them)</label>
          </div>
          <div class="col-sm-12 col-md">
            <input id="ef-roles" v-model="sharedState.roles" type="text" style="width:85%;">
          </div>
        </div>
        <div class="row responsive-label">
          <div class="col-sm-12 col-md-3">
            <label for="atts">Attempts</label>
          </div>
          <div class="col-sm-12 col-md">
            <input id="atts" v-model="sharedState.atts" type="number" style="width:45%;">
          </div>
        </div>
        <div class="row responsive-label">
          <div class="col-sm-12 col-md-3">
            <label for="time">Time (minutes)</label>
          </div>
          <div class="col-sm-12 col-md">
            <input id="time" v-model="sharedState.time" type="number" style="width:45%;">
          </div>
        </div>
        <div class="row responsive-label">
          <div class="col-sm-12 col-md-3">
            <label for="file_json">Exam JSON</label>
          </div>
          <div class="col-sm-12 col-md">
            <input id="file_json" name="file" @change="addExamFile" type="file" style="width:85%;">
          </div>
        </div>
        <div class="row">
          <div class="col-sm-12">
            <button v-if="current_action == 'Create'" class="primary"
            accept="application/json" @click.prevent="createExam">Save</button>
            <template v-if="current_action == 'Edit'">
              <button class="inverse" @click.prevent="lockExam">{{ lockText }}</button>
              <button class="tertiary" @click.prevent="editExam">Save</button>
              <button class="secondary" @click.prevent="deleteExam">Delete</button>
            </template>
          </div>
        </div>
      </fieldset>
    </form>
    `,
  props: ['current_action', 'selected_exam'],
  data(){
    return {
      file_json: null,
      sharedState: store.state,
    }
  },
  methods: {
    addExamFile() {
      this.file_json = document.querySelector('#file_json');
    },
    createExam(){
      var data = new FormData();
      data.append('name', this.sharedState.name);
      data.append('description', this.sharedState.description);
      data.append('time', this.sharedState.time);
      data.append('roles', this.sharedState.roles);
      data.append('attempts', this.sharedState.atts);
      data.append('file', this.file_json.files[0]);

      axios
        .post('/api/exams/', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authentication-Token': Lockr.get('Authentication-Token')
          }
        })
        .then((response) => (this.$emit('exam-created', response.data)))
    },
    deleteExam() {
      axios
        .delete('/api/exam/' + this.selected_exam.node_id, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authentication-Token': Lockr.get('Authentication-Token')
            }
        })
        .then((response) => ( this.$emit('exam-deleted', this.selected_exam) ))
    },
    editExam() {
      var data = new FormData();
      data.append('name', this.sharedState.name);
      data.append('description', this.sharedState.description);
      data.append('time', this.sharedState.time);
      data.append('roles', this.sharedState.roles);
      data.append('attempts', this.sharedState.atts);

      if (this.file_json)
        data.append('file', this.file_json.files[0]);

      axios
        .put('/api/exam/' + this.selected_exam.node_id, data, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authentication-Token': Lockr.get('Authentication-Token')
            }
        })
        .then((response) => (this.$emit('exam-edited', response.data)))
    },
    lockExam() {

      var data = new FormData();
      data.append('locked', Number(!this.selected_exam.locked));

      axios
        .put('/api/exam/' + this.selected_exam.node_id, data, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authentication-Token': Lockr.get('Authentication-Token')
            }
        })
        .then((response) => (this.$emit('exam-edited', response.data)))
    }
  },
  computed: {
    lockText(){
      return this.selected_exam.locked ? 'Unlock' : 'Lock'
    }
  }
}
