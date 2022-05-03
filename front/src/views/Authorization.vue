<template>
  <cat v-if="isShowLoad" class="w-full h-full opacity-75"/>
  <div class="h-screen bg-gray-900">
    <div class="mx-auto my-0" style="max-width: 540px">
      <div v-if="oauthObj.APP" class="flex flex-col items-center w-full">
        <div class="oauth-icon relative flex flex-row items-center mt-12 justify-between w-96">
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
        <div class="flex items-center justify-center h-16 text-2xl whitespace-pre-wrap">
            授權 {{oauthObj.APP.NAME}}
        </div>
      </div>
      <div class="mx-auto my-0">
        <div v-if="oauthObj.APP" class="flex flex-col p-6 self-center bg-black border border-gray-700 border-b-0 mt-5 rounded-t-lg min-w-min overflow-y-auto overflow-x-hidden" style="max-height: 300px;">
          <div class="mb-4">
            <img class="w-8 bg-white rounded-full inline-block float-left mt-1 mr-3" alt="Vue logo" src="@/../public/images/logo.png">
            <div class="ml-11">
              <span class="block">
                <label class="font-semibold">{{oauthObj.APP.NAME}}</label> by 
                <label class="font-semibold">{{oauthObj.APP.USER_ACCOUNT}}</label>
              </span>
              <small class="text-gray-400">wants to access your <label class="font-semibold">{{ oauthObj.CLIENT_ACCOUNT }}</label> account</small>
            </div>
          </div>
          <div v-for="(scope, index) in oauthObj.SCOPES" :key="index" class="items-center h-26 py-4 relative">
            <svg height="32" aria-hidden="true" viewBox="0 0 24 24" version="1.1" width="32" data-view-component="true" class="w-8 rounded-full inline-block float-left mt-1 mr-3 fill-current text-gray-400">
              <path fill-rule="evenodd" d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zM2.513 11.5h4.745c.1-3.037 1.1-5.49 2.093-7.204.39-.672.78-1.233 1.119-1.673C6.11 3.329 2.746 7 2.513 11.5zm4.77 1.5H2.552a9.505 9.505 0 007.918 8.377 15.698 15.698 0 01-1.119-1.673C8.413 18.085 7.47 15.807 7.283 13zm1.504 0h6.426c-.183 2.48-1.02 4.5-1.862 5.951-.476.82-.95 1.455-1.304 1.88L12 20.89l-.047-.057a13.888 13.888 0 01-1.304-1.88C9.807 17.5 8.969 15.478 8.787 13zm6.454-1.5H8.759c.1-2.708.992-4.904 1.89-6.451.476-.82.95-1.455 1.304-1.88L12 3.11l.047.057c.353.426.828 1.06 1.304 1.88.898 1.548 1.79 3.744 1.89 6.452zm1.476 1.5c-.186 2.807-1.13 5.085-2.068 6.704-.39.672-.78 1.233-1.118 1.673A9.505 9.505 0 0021.447 13h-4.731zm4.77-1.5h-4.745c-.1-3.037-1.1-5.49-2.093-7.204-.39-.672-.78-1.233-1.119-1.673 4.36.706 7.724 4.377 7.957 8.877z"></path>
            </svg>
            <div class="ml-11">
              <label class="block"><label class="font-semibold">{{scope.SYSTEM}} / {{scope.NAME}}</label></label>
              <small class="text-gray-400 break-all whitespace-pre-wrap">{{scope.DESCRIPTION}}</small>
            </div>
          </div>
        </div>
        <div v-if="oauthObj.APP" class="p-6 self-center bg-black border border-gray-700 rounded-b-lg">
          <div>
            <form class="" @submit.prevent="checkForm">
              <div class="flex justify-center">
                <common-button class="w-full inline-block mx-0 mr-2" type="router-link" to="/" :modelValue="'Cancel'" />
                <common-button class="w-full inline-block mx-0 bg-green-700 text-white whitespace-pre-wrap" type="submit" :modelValue="'Authorize ' + oauthObj.APP.NAME" />
              </div>
            </form>
          </div>
          <div class="w-full mt-2">
            <p class="text-xs text-center mb-0">
              Authorizing will redirect to
              <br />
              <strong>{{oauthObj.APP.HOMEPAGE_URL}}</strong>
            </p>
          </div>
        </div>
      </div>
      <div v-if="oauthObj.APP" class="border rounded-md border-gray-700 px-4 py-4 text-xs mt-4 text-gray-400 table w-full">
        <div>
          <div class="w-1/3 px-2 float-left">
            <div class="relative pl-5 whitespace-pre-wrap">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="inline-block overflow-visible align-text-bottom fill-current absolute left-0">
                <path fill-rule="evenodd" d="M1.5 8a6.5 6.5 0 0110.535-5.096l-9.131 9.131A6.472 6.472 0 011.5 8zm2.465 5.096a6.5 6.5 0 009.131-9.131l-9.131 9.131zM8 0a8 8 0 100 16A8 8 0 008 0z"></path>
              </svg>
              <strong>Not</strong> owned or operated by AC
            </div>
          </div>
          <div class="w-1/3 px-2 float-left">
            <div class="relative pl-5 whitespace-pre-wrap">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="inline-block overflow-visible align-text-bottom fill-current absolute left-0">
                <path fill-rule="evenodd" d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zm.5 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 00.471.696l2.5 1a.75.75 0 00.557-1.392L8.5 7.742V4.75z"></path>
              </svg> Created
              <strong class="d-inline-block">{{oauthObj.APP.CREATE_TIME}}</strong>
            </div>
          </div>
          <div class="w-1/3 px-2 float-left">
            <div class="relative pl-5 whitespace-pre-wrap">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="inline-block overflow-visible align-text-bottom fill-current absolute left-0">
                <path fill-rule="evenodd" d="M1.5 14.25c0 .138.112.25.25.25H4v-1.25a.75.75 0 01.75-.75h2.5a.75.75 0 01.75.75v1.25h2.25a.25.25 0 00.25-.25V1.75a.25.25 0 00-.25-.25h-8.5a.25.25 0 00-.25.25v12.5zM1.75 16A1.75 1.75 0 010 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 00.25-.25V8.285a.25.25 0 00-.111-.208l-1.055-.703a.75.75 0 11.832-1.248l1.055.703c.487.325.779.871.779 1.456v5.965A1.75 1.75 0 0114.25 16h-3.5a.75.75 0 01-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 01-.75-.75V14h-1v1.25a.75.75 0 01-.75.75h-3zM3 3.75A.75.75 0 013.75 3h.5a.75.75 0 010 1.5h-.5A.75.75 0 013 3.75zM3.75 6a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM3 9.75A.75.75 0 013.75 9h.5a.75.75 0 010 1.5h-.5A.75.75 0 013 9.75zM7.75 9a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM7 6.75A.75.75 0 017.75 6h.5a.75.75 0 010 1.5h-.5A.75.75 0 017 6.75zM7.75 3a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5z"></path>
              </svg>
              <strong>{{oauthObj.APP.USER_COUNT}}</strong> <span class="d-inline-block">AC users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, reactive, ref, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Cat from '../components/Loaders/Cat.vue';
import { get, post } from '../apis/utils';
import CommonInput from '../components/common/CommonInput.vue';
import CommonButton from '../components/common/CommonButton.vue';

export default defineComponent({
  name: 'OauthLogin',
  components: { Cat, CommonInput, CommonButton },
  setup() {
    const isShowLoad = ref(true);
    const route = useRoute();
    const router = useRouter();
    const oauthObj = ref({ });
    const client_id = route.query.client_id;

    onBeforeMount(async () => {
      if (!('client_id' in route.query)) {
        isShowLoad.value = false;
        // 404 page
      } else {
        try {
          let result = await get('/oauth/' + client_id);
          oauthObj.value = result.data.data;
          let createDate = new Date((oauthObj.value as any).APP.CREATE_TIME);
          let year = createDate.getFullYear();
          let month = (createDate.getMonth() + 1).toString().padStart(2, '0');
          let date = createDate.getDate();
          (oauthObj.value as any).APP.CREATE_TIME = `${year}-${month}-${date}`;
        } catch (err) {
          // 404 page
        } finally {
          isShowLoad.value = false;
        }
      }
    });

    const checkForm = async () => {
      try {
        isShowLoad.value = true;
        const response_type = route.query.response_type;
        let result = await post('/oauth/grant-code-token', {
          response_type,
          client_id
        });
        let redirectQuery = [];
        for(let key in result.data.data) {
          redirectQuery.push(key + '=' + result.data.data[key]);
        }
        if (redirectQuery.length === 0) {
          throw new Error('go 404 page');
        }
        window.location.href = result.data.data.redirect_uri + '?' + redirectQuery.join('&');
      } catch (err) {
        // 404 page
        console.log('404 page');
      } finally {
        isShowLoad.value = false;
      }
    }

    return {
      checkForm,
      isShowLoad,
      oauthObj
    }
  },
})
</script>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
	height: 8px;
  border-radius: 8px;
}

/* Track */
::-webkit-scrollbar-track {
	@apply opacity-20;
	@apply bg-gray-600;
}

/* Handle */
::-webkit-scrollbar-thumb {
	@apply opacity-40;
	@apply bg-gray-700;
	@apply rounded-full;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
	@apply opacity-70;
	@apply bg-gray-500;
}

.oauth-icon:before {
  top: 50%;
  left: 50%;
  width: 80%;
  content: "";
  @apply absolute;
  @apply border-b-2;
  @apply border-dashed;
  @apply border-gray-600;
  @apply z-0;
  @apply -translate-x-1/2;
}
</style>
