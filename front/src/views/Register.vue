<template>
  <Cat v-if="isShowLoad" />
  <div class="flex flex-col">
    <router-link class="flex justify-end pr-4 mt-2 underline" to="/login">Sign in ></router-link>
    <div class="flex flex-col p-16 items-center w-full">
      <img class="w-32" alt="Vue logo" src="@/../public/images/logo.png">
      <div class="mt-5">
        ICouple
      </div>
    </div>
    <form @submit.prevent="checkForm" autocomplete="nope">
      <div class="flex flex-col items-center m-4">
        <div class="flex my-2 items-center w-1/2">
          <input type="text" autocomplete="nope" required class="w-full h-10 border rounded-xl border-gray-900 px-2" v-model="accountObj.account" placeholder="Account:"/>
        </div>
        <div class="flex my-2 items-center w-1/2">
          <input type="password" autocomplete="off" required class="w-full h-10 border rounded-xl border-gray-900 px-2" v-model="accountObj.password" placeholder="Password:"/>
        </div>
        <div class="flex my-2 items-center w-1/2">
          <input type="email" required class="w-full h-10 border rounded-xl border-gray-900 px-2" v-model="accountObj.email" placeholder="Email:"/>
        </div>
        <div class="flex my-2 items-center w-1/2">
          <input type="text" required class="w-full h-10 border rounded-xl border-gray-900 px-2" v-model="accountObj.phone" placeholder="Phone:"/>
        </div>
      </div>
      <div class="flex flex-row my-2 items-center w-full justify-evenly mt-10">
        <input type="submit" class="w-32 border rounded-full border-gray-900 p-2" value="Sign up"/>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import Cat from '../components/Loaders/Cat.vue';
import { reactive, ref } from '@vue/reactivity';
import { post } from '../apis/login';
import router from '@/router';

export default {
  name: 'Register',
  components: { Cat },
  setup() {
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
}
</script>

<style scoped>

</style>