import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Index from '../views/Index.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Main',
    component: Index
  }, {
    path: '/login',
    name: 'Login',
    component: Login,
  }, {
    path: '/signup',
    name: 'SignUp',
    component: Register,
  }
];

const router = createRouter({
  history: createWebHistory((<any> import.meta).env.VITE_BASE_URL),
  routes,
});

export default router;
