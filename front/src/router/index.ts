import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Index from '../views/Index.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import Application from '../views/Application.vue';
import ApplicationDetail from '../views/ApplicationDetail.vue';
import { decodeBase64 } from '@/utils';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Index',
    component: Index,
    redirect: { name: 'Dashboard' },
    meta: {
      authentication: true,
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          keepAlive: true,
          authentication: true,
        },
      }, {
        path: 'application',
        name: 'Application',
        component: Application,
        meta: {
          keepAlive: false,
          authentication: true,
        },
      }, {
        path: 'application/:id',
        name: 'ApplicationDetail',
        component: ApplicationDetail,
        meta: {
          parentPageName: ['Application'],
          authentication: true,
        },
      },
    ],
  }, {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      authentication: false,
    },
  }, {
    path: '/signup',
    name: 'SignUp',
    component: Register,
    meta: {
      authentication: false,
    },
  },
];

const router = createRouter({
  // tslint:disable-next-line: whitespace
  history: createWebHistory((import.meta as any).env.VITE_BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (!to.meta.authentication) {
    next();
  } else {
    if (checkToken()) {
      router.replace('/login');
    } else {
      next();
    }
  }
});

const checkToken = () => {
  try {
    let user;
    const userData = localStorage.getItem('user-data');
    const token = localStorage.getItem('token');
    if (!token || !userData) {
      throw new Error('No token or user-data');
    } else {
      user = JSON.parse(decodeBase64(userData));
    }

    return false;
  } catch (err) {
    return true;
  }
};


export default router;
