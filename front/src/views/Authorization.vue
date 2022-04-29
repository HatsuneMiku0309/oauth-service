<template>
  <div class="flex flex-col items-center h-screen bg-gray-900">
    <div v-if="oauthObj.APP" class="flex flex-col items-center w-full">
      <div class="oauth-icon relative flex flex-row items-center mt-12 justify-between w-1/2">
        <div class="flex items-center left-0 rounded-full z-10 bg-gray-700">
          <img class="w-32 rounded-full" alt="Vue logo" src="@/../public/images/logo.png">
        </div>
        <div class="flex justify-center items-center left-0 z-10 h-8 w-8 bg-green-600 rounded-full">
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="fill-current text-white">
              <path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
          </svg>
        </div>
        <div class="flex items-center left-0 rounded-full z-10 bg-gray-700">
          <img class="w-32 rounded-full" alt="Vue logo" src="@/../public/images/logo.png">
        </div>
      </div>
      <div class="flex items-center h-16 text-2xl">
          授權 {{oauthObj.APP.NAME}}
      </div>
    </div>
    <div class="flex flex-col w-96">
      <div v-if="oauthObj.APP" class="flex flex-col w-full p-6 self-center bg-black border border-gray-700 border-b-0 mt-5 rounded-t-lg min-w-min">
        <div class="flex flex-row items-center w-full h-10 mb-4">
          <span><img class="w-10 bg-white rounded-full" alt="Vue logo" src="@/../public/images/logo.png"></span>
          <div class="flex flex-col ml-4 w-full">
            <span><label class="font-semibold">{{oauthObj.APP.NAME}}</label> by <a class="text-blue-400 font-semibold hover:underline" target="_self" :href="oauthObj.APP.HOMEPAGE_URL">{{oauthObj.APP.USER_ACCOUNT}}</a></span>
            <small class="text-gray-400">wants to access your <label class="font-semibold">{{ oauthObj.CLIENT_ACCOUNT }}</label> account</small>
          </div>
        </div>
        <div v-for="(scope, index) in oauthObj.SCOPES" :key="index" class="flex flex-row items-center w-full h-26 py-1">
          <span><img class="w-10 bg-white rounded-full" alt="Vue logo" src="@/../public/images/logo.png"></span>
          <div class="flex flex-col ml-4 w-full">
            <span><label class="text-gray-100">{{scope.SYSTEM}} / {{scope.NAME}}</label></span>
            <small class="text-gray-400 break-all whitespace-pre-wrap">{{scope.DESCRIPTION}}</small>
          </div>
        </div>
      </div>
      <div class="flex flex-col w-full px-5 pb-5 self-center bg-black border border-gray-700 rounded-b-lg">
        <form class="mt-1 p-4" @submit.prevent="checkForm" autocomplete="off">
          <div class="flex flex-row my-2 items-center w-full justify-center">
            <common-button type="router-link" to="/signup" :modelValue="'Sign up'" />
            <common-button type="submit" :modelValue="'Sign in'" />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, reactive, ref, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Cat from '../components/Loaders/Cat.vue';
import { get } from '../apis/utils';
import CommonInput from '../components/common/CommonInput.vue';
import CommonButton from '../components/common/CommonButton.vue';

export default defineComponent({
  name: 'OauthLogin',
  components: { Cat, CommonInput, CommonButton },
  setup() {
    const isShowLoad = ref(false);
    const route = useRoute();
    const router = useRouter();
    const oauthObj = ref({ });

    onBeforeMount(async () => {
      if (!('client_id' in route.query)) {
        // 404 page
      } else {
        const client_id = route.query.client_id;
        let result = await get('/oauth/' + client_id);
        oauthObj.value = result.data.data;
      }
    });

    return {
      isShowLoad,
      oauthObj
    }
  },
})
</script>

<style scoped>
.required:before {
  content: "*";
  display: inline-flex;
  color: red;
  margin-right: 0.3rem;
}

.oauth-icon:before {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 0);
  width: 80%;
  content: "";
  border-bottom: 2px dashed white;
  z-index: 0;
}
</style>
