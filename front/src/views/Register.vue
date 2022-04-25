<template>
  <Cat v-if="isShowLoad" />
  <div class="flex flex-col h-screen w-screen bg-gray-800">
    <router-link class="absolute text-sm right-0 flex justify-end pr-4 mt-2 underline" to="/login">Sign in ></router-link>
    <div class="flex flex-col w-5/12 self-center bg-gray-600 mt-28 rounded-3xl min-w-min">
      <div class="flex flex-col mt-12 items-center w-full">
        <router-link class="flex flex-col items-center" to="/login">
          <img class="w-32" alt="Vue logo" src="@/../images/logo.png">
          <div class="flex justify-center w-32 mt-3">ICouple</div>
        </router-link>
      </div>
      <form class="mx-16 mt-6 p-4" @submit.prevent="checkForm" autocomplete="nope">
        <div class="flex flex-col items-center px-12 pb-12">
          <div class="flex my-2 items-center w-full">
            <input type="text" autocomplete="nope" required class="w-full h-10 border rounded-xl border-gray-700 px-2 bg-transparent focus:shadow-md focus:outline-none" v-model="accountObj.account" placeholder="Account:" />
          </div>
          <div class="flex my-2 items-center w-full">
            <input type="password" autocomplete="off" required class="w-full h-10 border rounded-xl border-gray-700 px-2 bg-transparent focus:shadow-md focus:outline-none" v-model="accountObj.password" placeholder="Password:" />
          </div>
          <div class="flex my-2 items-center w-full">
            <input type="email" required class="w-full h-10 border rounded-xl border-gray-700 px-2 bg-transparent focus:shadow-md focus:outline-none" v-model="accountObj.email" placeholder="Email:" />
          </div>
          <div class="flex my-2 items-center w-full">
            <input type="text" required class="w-full h-10 border rounded-xl border-gray-700 px-2 bg-transparent focus:shadow-md focus:outline-none" v-model="accountObj.phone" placeholder="Phone:" />
          </div>
        </div>
        <div class="flex flex-row my-2 items-center w-full justify-center">
          <input type="submit" class="w-32 cursor-pointer bg-transparent border rounded-full border-gray-900 p-2 hover:bg-green-400" value="Sign up" />
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import Cat from '../components/Loaders/Cat.vue';
import { defineComponent, reactive, ref } from 'vue';
import { post } from '../apis/utils';
import router from '@/router';

export default defineComponent({
  name: 'Register',
  components: { Cat },
  setup() {
    localStorage.removeItem('token');
    const isShowLoad = ref(false);
    const accountObj: {
      account?: string;
      password?: string;
      email?: string;
      phone?: string;
    } = reactive({});
    const checkForm = async (e: any) => {
      try {
        isShowLoad.value = true;
        let data = await post('/register', {
          account: accountObj.account,
          password: accountObj.password,
          email: accountObj.email,
          phone: accountObj.phone
        });
        router.push('/login');
      } catch (err: any) {
        const { status, data: { errMsg, extErrMsg, info } } = err.response
        alert(errMsg);
      } finally {
        isShowLoad.value = false;
      }
    }

    return {
      checkForm,
      isShowLoad,
      accountObj
    }
  },
});
</script>

<style scoped>

</style>
