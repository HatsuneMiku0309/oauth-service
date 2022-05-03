import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Index from '../views/Index.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import Application from '../views/Application.vue';
import ApplicationDetail from '../views/ApplicationDetail.vue';
import Authorization from '../views/Authorization.vue';
import { decodeBase64 } from '@/utils';
import { post } from '@/apis/utils';

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
    path: '/oauth/authorization',
    name: 'Authorization',
    component: Authorization,
    meta: {
      authentication: false,
    },
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

router.beforeEach(async(to, from, next) => {
  if (!to.meta.authentication) {
    next();
  } else {
    if (await checkToken()) {
      router.replace('/login');
    } else {
      next();
    }
  }
});

const checkToken = async () => {
  try {
    const initTokenLoginBody = 'e30';
    const userData = localStorage.getItem('user-data');
    const token = localStorage.getItem('token');
    let user = {};
    if (!token || !userData) {
      throw new Error('No token or user-data')
    } else {
      try {
        await post('/login/token', { user_token: userData || initTokenLoginBody });
        user = JSON.parse(decodeBase64(userData));
      } catch (err: any) {
        localStorage.removeItem('user-data');
        localStorage.removeItem('token');
        alert(err.response.data.errMsg);
        return false;
      }
    }

    return false;
  } catch (err) {
    return true;
  }
};


export default router;
