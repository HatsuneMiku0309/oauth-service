<template>
  <cat v-if="isShowLoad" class="w-full h-full opacity-50"/>
  <div class="flex flex-col items-center h-screen bg-gray-800">
    <div class="flex flex-col w-5/12 self-center bg-gray-600 mt-28 rounded-3xl min-w-min">
      <div class="flex flex-col mt-12 items-center w-full">
        <router-link class="flex flex-col items-center" to="/login">
          <img class="w-32" alt="Vue logo" src="@/../public/images/ac.png">
          <div class="flex justify-center w-32 mt-3">Authorize Center</div>
        </router-link>
      </div>
      <form class="mx-16 mt-6 p-4" @submit.prevent="checkForm" autocomplete="off">
        <div class="flex flex-col items-center px-12 pb-12">
          <div class="flex flex-col my-2 items-center w-full">
            <span class="required w-full text-left mb-1">Account</span>
            <common-input type="text" v-model="account" required placeholder="Account:" autocomplete="off" />
          </div>
          <div class="flex flex-col my-2 items-center w-full">
            <div class="flex flex-row w-full mb-1">
              <span class="required w-full text-left">Password</span>
              <span @click="testClickScope" class="w-full text-right text-blue-500 underline hover:text-blue-400 hover:cursor-default">forget password</span>
            </div>
            <div class="w-full relative">
              <common-input type="password" v-model="password" required placeholder="Password:" autocomplete="off" />
            </div>
          </div>
        </div>
        <div class="flex flex-row my-2 items-center w-full justify-center mt-10">
          <common-button class="w-32" v-if="'return_to' in $route.query" type="router-link" :to="{ path: '/signup', query: $route.query }" :modelValue="'Sign up'" />
          <common-button class="w-32" v-else type="router-link" to="/signup" :modelValue="'Sign up'" />
          <common-button class="w-32" :modelValue="'Sign in'" type="submit" />
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Cat from '../components/Loaders/Cat.vue';
import { get, post } from '../apis/utils';
import { encodeBase64 } from '../utils';
import CommonInput from '../components/common/CommonInput.vue';
import CommonButton from '../components/common/CommonButton.vue';

export default defineComponent({
  name: 'Login',
  components: { Cat, CommonInput, CommonButton },
  setup() {
    const token = localStorage.getItem('token');
    const isShowLoad = ref(false);
    const route = useRoute();
    const router = useRouter();
    const condGoPage = () => {
      const { return_to = '' } = route.query; 
      if (return_to === '/oauth/authorization') {
        let query = [];
        for(let key in route.query) {
          query.push(key + '=' + route.query[key]);
        }
        // console.log('/oauth/authorization?' + query.join('&'));
        router.push({ path: '/oauth/authorization', query: route.query });
      } else {
        router.push('/');
      }
    }

    if (token) {
      (async () => {
        try {
          let result = await get('/login/token');
          let userDataRes = result.data.data;
          localStorage.setItem('user-data', encodeBase64(JSON.stringify(userDataRes)));
          condGoPage();
        } catch (err: any) {
          localStorage.removeItem('user-data');
          localStorage.removeItem('token');
          alert(err.response.data.errMsg);
          router.go(0);
        } finally {
          isShowLoad.value = false;
        }
      })();      
    } else {
      const loginData = reactive({
        account: '',
        password: ''
      });
      const testClickScope = () => {
        router.push({ path: '/forget', query: route.query });
      };
      const checkForm = async (e: Event) => {
        try {
          isShowLoad.value = true;
          // call api verify loginData
          let result = await post('/login', {
              account: loginData.account,
              password: loginData.password
          });
          let userDataRes = result.data.data;
          let token = result.headers.authorization;

          localStorage.setItem('user-data', encodeBase64(JSON.stringify(userDataRes)));
          localStorage.setItem('token', token);

          condGoPage();
        } catch (err: any) {
          localStorage.removeItem('user-data');
          localStorage.removeItem('token');
          alert(err.response.data.errMsg);
        } finally {
          isShowLoad.value = false;
        }
      };

      return {
        isShowLoad,
        ...toRefs(loginData),
        testClickScope,
        checkForm
      };
    }
  }
});
</script>

<style scoped>

</style>
