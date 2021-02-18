import os
import json
from flask_restful import Resource, reqparse, marshal_with, marshal, fields
from flask_security import roles_required, auth_token_required, current_user
import werkzeug
from datetime import datetime, timedelta
from app.api import api
from app.models import Exam, Attempt

exam_fields = {
    'id': fields.Integer,
    'node_id': fields.String,
    'name': fields.String,
    'description': fields.String,
    'time': fields.Integer,
    'roles': fields.String,
    'attempts': fields.Integer,
    'json_file': fields.String,
    'locked': fields.Boolean
}

class ExamList(Resource):

    @roles_required("admin")
    @marshal_with(exam_fields)
    def get(self):
        return list(Exam.select().order_by(Exam.id.desc()))

    @roles_required("admin")
    @marshal_with(exam_fields)
    def post(self):

        parser = reqparse.RequestParser()

        parser.add_argument('name')
        parser.add_argument('description')
        parser.add_argument('roles', type=str)
        parser.add_argument('time', type=int)
        parser.add_argument('attempts', type=int)
        parser.add_argument('file', location='files',
            type=werkzeug.datastructures.FileStorage)

        args = parser.parse_args()
        file = args['file']
        exam = Exam(**args)

        # Check if file exists, rename if so
        filename = werkzeug.utils.secure_filename(file.filename)

        if os.path.isfile(f'uploads/{filename}'):
            filename = str(int(datetime.now().timestamp())) + "-" + filename

        exam.json_file = filename
        exam.roles = args['roles']

        file.save(f"uploads/{filename}")
        exam.save()
        return exam

class ExamPublicList(Resource):

    @auth_token_required
    @marshal_with(exam_fields)
    def get(self):

        exams = Exam.select()

        user_exams =  [ exam for exam in exams\
            for role in exam.roles.split(",")\
            if current_user.has_role(role) and not exam.locked ]

        return user_exams

class ExamDetail(Resource):

    @auth_token_required
    def get(self, node_id):

        parser = reqparse.RequestParser()
        parser.add_argument('question',
            type=int, location='args', required=False)

        args = parser.parse_args()

        exam = Exam.get_or_none(Exam.node_id == node_id) 

        attempt = Attempt.get_or_none(
            (Attempt.user == current_user.id) & (Attempt.exam == exam))

        # Get a question
        question_id = args.get('question')
        if question_id is not None:
            
            if attempt is None:
                return "You have not started your attempt."

            if attempt.times > exam.attempts:
                return "Number of attempts exceeded."

            if attempt.time_start < datetime.now() - timedelta(minutes=exam.time):
                return {"timeUp": True}

            with open(f"uploads/{exam.json_file}", "r") as json_file:
                data = json.load(json_file)
                question = data[question_id - 1]
                del question['answer']

                if data.index(question) == (len(data)-1):
                    question['last'] = True

            return question

        exam_dict = marshal(exam, exam_fields)

        if attempt is not None:
            exam_dict["attempts_left"] = exam.attempts - attempt.times
        else:
            exam_dict["attempts_left"] = exam.attempts

        return exam_dict

    @auth_token_required
    def post(self, node_id):

        parser = reqparse.RequestParser()

        parser.add_argument('answer', type=str)
        parser.add_argument('question', type=int, location='args')

        args = parser.parse_args()
        question_id = args['question']

        exam = Exam.get_or_none(Exam.node_id == node_id)

        current_attempt = Attempt.get_or_none(
            (Attempt.user == current_user.id) & (Attempt.exam == exam))

        with open(f"uploads/{exam.json_file}", "r") as json_file:
            data = json.load(json_file)

            if args['answer'] == data[question_id - 1]['answer']:

                current_attempt.correct += 1

            else: current_attempt.incorrect += 1

        user_answers = json.loads(current_attempt.answers)
        user_answers[str(question_id)] = args['answer']

        current_attempt.answers = json.dumps(user_answers)

        current_attempt.save()

        return user_answers

    @roles_required("admin")
    @marshal_with(exam_fields)
    def put(self, node_id):

        parser = reqparse.RequestParser()

        parser.add_argument('name', required=False)
        parser.add_argument('description', required=False)
        parser.add_argument('roles', type=str, required=False)
        parser.add_argument('time', type=int, required=False)
        parser.add_argument('attempts', type=int, required=False)
        parser.add_argument('file', location='files', required=False,
            type=werkzeug.datastructures.FileStorage)

        parser.add_argument('locked', required=False, type=int)

        exam = Exam.get(Exam.node_id == node_id)
        args = parser.parse_args()


        if args['locked'] is not None:
            exam.locked = args['locked']

        else:
            exam.name = args['name']
            exam.description = args['description']
            exam.time = args['time']
            exam.attempts = args['attempts']
            exam.roles = args['roles'].strip(",").replace(" ","")

            file = args['file']
            if file is not None:

                # Check if file exists, rename if so
                filename = werkzeug.utils.secure_filename(file.filename)

                if os.path.isfile(f'uploads/{filename}'):
                    filename = str(int(datetime.now().timestamp())) + "-" + filename

                exam.json_file = filename
                file.save(f"uploads/{filename}")

        exam.save()

        return exam

    @roles_required("admin")
    def delete(self, node_id):

        exam = Exam.get(Exam.node_id == node_id)

        os.remove('uploads/' + exam.json_file) 

        exam.delete_instance()

        return f"Deleted ID {exam.id}."

class ExamAttempt(Resource):
    def get(self, node_id):

        exam = Exam.get_or_none(Exam.node_id == node_id) 

        if exam is None:
            return '', 406

        if exam.locked:
            return "Locked.", 423

        last_attempt = Attempt.get_or_none((Attempt.user == current_user.id) &
            (Attempt.exam == exam))

        if last_attempt is None:
            time_start=datetime.now()
            attempt = Attempt(user=current_user.id, exam=exam, time_start=time_start)
            attempt.save()

        elif (last_attempt.time_start > datetime.now() - timedelta(minutes=exam.time)):

            return {"message": "There's a valid attempt still going.",
                    "time_start": last_attempt.time_start.ctime()}
        else:

            if last_attempt.times > exam.attempts:
                return "Number of attempts exceeded."

            last_attempt.correct = 0
            last_attempt.incorrect = 0

            time_start = datetime.now()
            last_attempt.time_start = time_start

            last_attempt.times += 1
            last_attempt.answers = '{}'

            last_attempt.save()

        with open(f"uploads/{exam.json_file}", "r") as json_file:
            data = json.load(json_file)

        return {"time": exam.time, "max_questions": len(data)}

class ExamFinish(Resource):
    @auth_token_required
    def get(self, node_id):

        exam = Exam.get_or_none(Exam.node_id == node_id) 

        if exam is None:
            return '', 406

        current_attempt = Attempt.get(
            (Attempt.user == current_user.id) & (Attempt.exam == exam))

        current_attempt.time_start -= timedelta(minutes=exam.time)
        current_attempt.save()

        return "Finished."

class AnswerSet(fields.Raw):
    def format(self, value):
        return json.loads(value)

result_fields = {
    "user": fields.Nested({"email": fields.String}),
    "answers": AnswerSet,
    "correct": fields.Integer,
    "incorrect": fields.Integer
}

class ExamResult(Resource):
    @roles_required("admin")
    def get(self, node_id):

        exam = Exam.get_or_none(Exam.node_id == node_id) 

        submitters = list(Attempt.select())

        if exam is None:
            return '', 406

        with open(f"uploads/{exam.json_file}", "r") as json_file:
            data = json.load(json_file)

        return {"submitters": marshal(submitters, result_fields),
                "max_questions": len(data)}

api.add_resource(ExamList, '/exams/')
api.add_resource(ExamPublicList, '/exams/public/')
api.add_resource(ExamDetail, '/exam/<string:node_id>')
api.add_resource(ExamAttempt, '/exam/<string:node_id>/start')
api.add_resource(ExamFinish, '/exam/<string:node_id>/finish')
api.add_resource(ExamResult, '/exam/<string:node_id>/result')
