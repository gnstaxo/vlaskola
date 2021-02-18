import Home from './views/Home.js'
import Login from './views/Login.js'
import Register from './views/Register.js'
import AdminExam from './views/AdminExam.js'
import AdminUser from './views/AdminUser.js'
import Exam from './views/Exam.js'
import Result from './views/Result.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  { path: '/admin/exams/',
    name: 'AdminExam',
    component: AdminExam
  },
  { path: '/admin/users/',
    name: 'AdminUser',
    component: AdminUser 
  },
  { path: '/exam/:node_id',
    name: 'Exam',
    component: Exam
  },
  { path: '/exam/:node_id/result',
    name: 'Result',
    component: Result
  },
]

export const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes,
})
