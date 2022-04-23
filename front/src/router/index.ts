import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Index from '../views/Index.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import Application from '../views/Application.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Index',
    component: Index,
    redirect: { name: 'Dashboard' },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          keepAlive: true,
        },
      }, {
        path: 'application',
        name: 'Application',
        component: Application,
        meta: {
          keepAlive: false,
        },
      }, {
        path: 'application/:id',
        name: 'ApplicationDetail',
        component: () => import('../views/ApplicationDetail.vue'),
        meta: {
          parentPageName: ['Application'],
        },
      },
    ],
  }, {
    path: '/login',
    name: 'Login',
    component: Login,
  }, {
    path: '/signup',
    name: 'SignUp',
    component: Register,
  },
];

const router = createRouter({
  // tslint:disable-next-line: whitespace
  history: createWebHistory((import.meta as any).env.VITE_BASE_URL),
  routes,
});

export default router;
