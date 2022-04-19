<template>
  <!-- <Heart v-if="isShowLoad" /> -->
  <div class="flex flex-col items-center h-screen">
    <div class="flex flex-col p-16 items-center w-full">
      <img class="w-32" alt="Vue logo" src="@/../public/images/logo.png">
      <div class="mt-5">
        ICouple
      </div>
    </div>
    <div class="flex flex-col justify-center items-center my-10 w-full h-32">
      <div class="flex flex-col my-2 items-center w-11/12">
        <span class="w-full text-left mb-1">Acoount</span>
        <input type="text" class="w-full h-10 border rounded-xl border-gray-900 px-2" v-model="account" placeholder="EmpNo"/>
      </div>
      <div class="flex flex-col my-2 items-center w-11/12">
        <div class="flex flex-row w-full mb-1">
          <span class="w-full text-left">Password</span>
          <span @click="testClickScope" class="w-full text-right text-blue-600 underline">forget password</span>
        </div>
        <div class="w-full relative">
          <input type="password" class="w-full h-10 border rounded-xl border-gray-900 px-2" v-model="password" placeholder="Password"/>
        </div>
      </div>
      <div class="flex flex-row my-2 items-center w-full justify-evenly mt-10">
        <button class="w-20 border rounded-full border-gray-900 p-2" @click="signUp">Sign up</button>
        <button class="w-20 border rounded-full border-gray-900 p-2" @click="signIn">Sign in</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import Heart from '../components/Loaders/Heart.vue';
// import { post } from '../apis/login';

export default defineComponent({
  name: 'Login',
  components: {
      Heart
  },
  setup() {
    const router = useRouter();
    const isShowLoad = ref(false);
    const loginData = reactive({
      account: '',
      password: ''
    });
    const testClickScope = () => {
      console.log('testClickScope');
    };
    const checkToken = () => {
    let token = localStorage.getItem('token');
    if (!token) {
      isShowLoad.value = true;

      // demo redirect login page when no has token
      setTimeout(() => {
      isShowLoad.value = false;
      router.replace('/login');
      }, 300);
    }
    };
    checkToken();
    const signIn = async () => {
      try {
        isShowLoad.value = true;
        // console.log('account: ' + loginData.account);
        // console.log('password: ' + loginData.password);

        // call api verify loginData
        // let result = await post<{ token: string }>('/login', {
        //     account: loginData.account,
        //     password: loginData.password
        // });

        // response and set storage token data
        let token = btoa(loginData.account + loginData.password);
        // let data = atob(token);
        // localStorage.setItem('token', result.token);
        localStorage.setItem('token', token);

        // redirect to Home page
        router.push('/');
      } catch (err) {
        localStorage.removeItem('token');
        // api fail do something
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
      signIn,
      signUp
    };
  }
});
</script>

<style scoped>

</style>
