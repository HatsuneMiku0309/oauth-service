<template>
  <cat v-if="isShowLoad" class="w-full h-full opacity-75" />
  <div class="flex flex-col h-screen w-screen bg-gray-800">
    <router-link class="absolute text-sm right-0 flex justify-end pr-4 mt-2 underline hover:text-white" to="/login">Sign in ></router-link>
    <div class="flex flex-col w-5/12 self-center bg-gray-600 mt-28 rounded-3xl min-w-min">
      <div class="flex flex-col mt-12 items-center w-full">
        <router-link class="flex flex-col items-center" to="/login">
          <img class="w-32" alt="Vue logo" src="@/../public/images/logo.png">
          <div class="flex justify-center w-32 mt-3">Authorize Center</div>
        </router-link>
      </div>
      <form class="mx-16 mt-6 p-4" @submit.prevent="checkForm" autocomplete="off">
        <div class="flex flex-col items-center px-12 pb-12">
          <div class="my-2 items-center w-full">
            <span class="required mr-2">Account: </span>
            <common-input type="text" v-model="accountObj.account" required placeholder="Account:" autocomplete="off" />
          </div>
          <div class="my-2 items-center w-full">
            <span class="required mr-2">Password: </span>
            <common-input type="password" v-model="accountObj.password" required placeholder="Password:" autocomplete="off" />
          </div>
          <div class="my-2 items-center w-full">
            <span class="required mr-2">Email: </span>
            <common-input type="email" v-model="accountObj.email" required placeholder="Email:" autocomplete="off" />
          </div>
          <div class="my-2 items-center w-full">
            <span class="mr-2">Phone: </span>
            <common-input type="text" v-model="accountObj.phone" required placeholder="Phone:" autocomplete="off" />
          </div>
        </div>
        <div class="flex flex-row my-2 items-center w-full justify-center">
          <common-button class="w-32" type="submit" :modelValue="'Sign up'" />
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
import CommonInput from '../components/common/CommonInput.vue';
import CommonButton from '../components/common/CommonButton.vue';

export default defineComponent({
  name: 'Register',
  components: { Cat, CommonInput, CommonButton },
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
});
</script>

<style scoped>
.required:before {
  content: "*";
  display: inline-flex;
  color: red;
  margin-right: 0.3rem;
}
</style>
