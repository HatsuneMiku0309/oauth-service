<template>
  <Cat v-if="isShowLoad" class="w-full h-full opacity-50"/>
  <div class="flex flex-col items-center h-screen">
    <div class="flex flex-col w-5/12 self-center bg-green-300 mt-28 border-2 border-green-600 rounded-3xl min-w-min">
      <div class="flex flex-col mt-12 items-center w-full">
        <router-link class="flex flex-col items-center" to="/login">
          <img class="w-32" alt="Vue logo" src="@/../images/logo.png">
          <div class="flex justify-center w-32 mt-3">
            ICouple
          </div>
        </router-link>
      </div>
      <form class="mx-16 mt-6 p-4" @submit.prevent="checkForm" autocomplete="nope">
        <div class="flex flex-col items-center px-12 pb-12">
          <div class="flex flex-col my-2 items-center w-11/12">
            <span class="w-full text-left mb-1">Acoount</span>
            <input type="text" class="w-full h-10 border rounded-xl border-gray-900 px-2" @keyup.exact.enter="submit" v-model="account" required placeholder="Account:" />
          </div>
          <div class="flex flex-col my-2 items-center w-11/12">
            <div class="flex flex-row w-full mb-1">
              <span class="w-full text-left">Password</span>
              <span @click="testClickScope" class="w-full text-right text-blue-600 underline">forget password</span>
            </div>
            <div class="w-full relative">
              <input type="password" class="w-full h-10 border rounded-xl border-gray-900 px-2" @keyup.exact.enter="submit" v-model="password" required placeholder="Password:" />
            </div>
          </div>
        </div>
        <div class="flex flex-row my-2 items-center w-full justify-center mt-10">
          <router-link to="/signup" class="cursor-pointer mx-4 w-32 border rounded-full border-gray-900 p-2 hover:bg-green-400 text-center">Sign up</router-link>
          <input type="submit" class="mx-4 cursor-pointer w-32 bg-transparent border rounded-full border-gray-900 p-2 hover:bg-green-400" value="Sign in" />
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import Cat from '../components/Loaders/Cat.vue';
import { post } from '../apis/utils';
import { encodeBase64 } from '../utils';

export default defineComponent({
  name: 'Login',
  components: {
      Cat
  },
  setup() {
    localStorage.removeItem('user-data');
    localStorage.removeItem('token');

    const router = useRouter();
    const isShowLoad = ref(false);
    const loginData = reactive({
      account: '',
      password: ''
    });
    const testClickScope = () => {
      console.log('testClickScope');
    };
    const checkForm = async (e: Event) => {
      try {
        isShowLoad.value = true;
        // call api verify loginData
        let result = await post('/login', {
            account: loginData.account,
            password: loginData.password
        });
        console.log(result);
        let userData = result.data;
        let token = result.headers.authorization || '';
        if (token === '') {
          throw new Error('token is empty');
        }

        localStorage.setItem('user-data', encodeBase64(JSON.stringify(userData)));
        localStorage.setItem('token', token);

        // redirect to Home page
        router.push('/');
      } catch (err: any) {
        localStorage.removeItem('user-data');
        localStorage.removeItem('token');
        alert(err.response.data.errMsg);
      } finally {
        isShowLoad.value = false;
      }
    };
    const signUp = () => {
      router.push('/signup');
    }

    return {
      isShowLoad,
      ...toRefs(loginData),
      testClickScope,
      checkForm,
      signUp
    };
  }
});
</script>

<style scoped>

</style>
