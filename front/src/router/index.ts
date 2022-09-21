import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Index from '../views/Index.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import Application from '../views/Application.vue';
import ApplicationDetail from '../views/ApplicationDetail.vue';
import Authorization from '../views/Authorization.vue';
import AuthorizationApp from '../views/AuthorizationApp.vue';
import AuthorizationAppDetail from '../views/AuthorizationAppDetail.vue';
import Forget from '../views/Forget.vue';
import ResetPassword from '../views/ResetPassword.vue';
import { decodeBase64, encodeBase64 } from '@/utils';
import { get } from '@/apis/utils';
import Err404 from '../views/Err404.vue';

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
      }, {
        path: 'authorization-app',
        name: 'AuthorizationApp',
        component: AuthorizationApp,
        meta: {
          authentication: true,
        },
      }, {
        path: 'authorization-app/:id',
        name: 'AuthorizationAppDetail',
        component: AuthorizationAppDetail,
        meta: {
          parentPageName: ['AuthorizationApp'],
          authentication: true,
        }
      }
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
    path: '/forget',
    name: 'Forget',
    component: Forget,
    meta: {
      authentication: false,
    }
  }, {
    path: '/reset-password/:resetToken',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: {
      authentication: false,
    }
  }, {
    path: '/signup',
    name: 'SignUp',
    component: Register,
    meta: {
      authentication: false,
    },
  }, {
    path: '/:pathMatch(.*)*',
    name: 'AnyErr404',
    component: Err404,
    meta: {
      authentication: false,
    },
  }, {
    path: '/404',
    name: 'Err404',
    component: Err404,
    meta: {
      authentication: false,
    },
  },
];

// (import.meta as any).env.VITE_BASE_URL
const router = createRouter({
  // tslint:disable-next-line: whitespace
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
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
    const userData = localStorage.getItem('user-data');
    const token = localStorage.getItem('token');
    let user = {};
    if (!token || !userData) {
      throw new Error('No token or user-data');
    } else {
      try {
        const result = await get('/login/token');
        const userDataRes = result.data.data;
        localStorage.setItem('user-data', encodeBase64(JSON.stringify(userDataRes)));
        user = JSON.parse(decodeBase64(userData));
      } catch (err: any) {
        if (err.response.status === 401) {
          localStorage.removeItem('user-data');
          localStorage.removeItem('token');
          alert(err.response.data.errMsg);
          return true;
        }
        return false;
      }
    }

    return false;
  } catch (err) {
    return true;
  }
};


export default router;
