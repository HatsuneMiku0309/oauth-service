<template>
  <cat v-if="isShowLoad" class="w-full h-full opacity-75 z-50" />
  <transition name="message-popup">
    <!-- <message-popup v-if="isShowPopup" @update:isShowPopup="newValue => isShowPopup = newValue"> -->
    <message-popup v-if="isShowUpdateCheckPopup" v-model="isShowUpdateCheckPopup">
      <template v-slot:title>
        <span class="text-3xl mt-0">Update Check</span>
      </template>
      <template #default>
        <div class="">If you want update the App, you will likely need to re-audit the registered api scope!</div>
        <div class="mt-5">Are sure?</div>
        <div class="relative flex h-14 w-full items-center">
          <div class="absolute right-0 top-4">
            <common-button class="p-2" type="button" :modelValue="'Cancel'" @click="isShowUpdateCheckPopup = false"/>
            <common-button class="p-2 ml-3 mr-3" type="button" :modelValue="'Sure'" @click="checkUpdate"/>
          </div>
        </div>
      </template>
    </message-popup>
  </transition>
  <transition name="message-popup">
    <!-- <message-popup v-if="isShowPopup" @update:isShowPopup="newValue => isShowPopup = newValue"> -->
    <message-popup v-if="isShowPopup" v-model="isShowPopup">
      <template v-slot:title>
        <span class="text-3xl mt-0">Application Secret</span>
      </template>
      <template #default>
        <div class="text-sm text-red-600">Please keep this information safe, exposure will cause security problems.</div>
        <div class="relative w-full py-1">
          <div class="relative inline-block float-left w-28"><span class="absolute right-0">Client ID :</span></div>
          <label class="ml-32 block p-2 select-all bg-gray-700 text-xs">{{ app.CLIENT_ID }}</label>
        </div>
        <div class="relative w-full py-1">
          <div class="relative inline-block float-left w-28"><span class="absolute right-0">Client Secret :</span></div>
          <label id="secret" class="ml-32 block p-2 break-all select-all bg-gray-700 text-xs">{{ app.CLIENT_SECRET }}</label>
        </div>
        <div class="relative w-full py-1">
          <div class="relative inline-block float-left w-28"><span class="absolute right-0">API Key :</span></div>
          <label id="secret" :title="app.API_KEY" class="h-32 overflow-y-auto ml-32 block p-2 break-all select-all bg-gray-700 text-xs">{{ app.API_KEY }}</label>
        </div>
        <div class="relative flex h-14 w-full items-center">
          <div class="absolute right-0 top-4">
            <common-button class="p-2" type="button" :modelValue="'Reload'" @click="reloadSecret"/>
            <common-button id="download-config" class="p-2 ml-3 mr-3" type="button" :modelValue="'Download'" @click="downloadConfig"/>
            <a id="downloadEE" style="display:none"></a>
          </div>
        </div>
      </template>
    </message-popup>
  </transition>
  <transition name="message-popup">
    <message-popup v-if="isShowRemovePopup" v-model="isShowRemovePopup">
      <template v-slot:title>
        <span class="text-3xl mt-0">Are you sure remove?</span>
      </template>
      <template #default>
        <form class="w-full" @submit.prevent="remove">
          <div class="text-sm">Please enter your app_id <label class="bg-gray-700 p-1 select-all">{{app.ID}}</label> to make sure you know to remove</div>
          <div class="mt-4"><input class="
              bg-transparent border rounded-xl border-gray-700 p-2
              focus:outline-none focus:border-2 focus:border-gray-700 w-96"
              type="text" maxlength="36" required v-model="tempRemoveID"/></div>
          <div class="relative flex mt-5 w-full justify-center items-center">
            <button class="mx-10 text-red-600 bg-transparent border-2 rounded-2xl border-gray-700 p-2 hover:bg-gray-700" @click="submit">remove</button>
            <button class="mx-10 bg-transparent border-2 rounded-2xl border-gray-700 p-2 hover:bg-gray-700" @click.prevent="isShowRemovePopup = false">cancel</button>
          </div>
        </form>
      </template>
    </message-popup>
  </transition>
  <div class=" w-full h-full overflow-x-hidden overflow-y-auto">
    <div class="w-full h-14 flex items-center relative">
      <div class="absolute left-10">
        <button class="border rounded-xl border-gray-700 p-1 text-red-600 hover:bg-gray-700" @click="isShowRemovePopup = true">Remove</button>
      </div>
      <div class="absolute right-10">
        <button class="border rounded-xl border-gray-700 p-1 hover:bg-gray-700 hover:text-white" @click="isShowPopup = true">Get Client</button>
      </div>
    </div>
    <div class="flex w-full h-auto overflow-y-hidden overflow-x-auto">
      <div class="flex flex-col flex-shrink-0 w-1/2 h-full overflow-hidden" style="min-width: 450px;">
      <div class="w-full h-14 flex items-center relative">
        <div class="ml-10">User Count: {{users.length}}</div>
      </div>
        <div class="flex flex-col w-auto mb-12 mx-10 overflow-hidden">
          <form @submit.prevent="checkForm">
            <div class="flex h-14 items-center my-2">
              <div class="relative flex flex-shrink-0 items-center mr-2 w-40"><span class="required absolute right-0">Application Name :</span></div>
              <common-input v-model.trim="app.NAME" type="text" maxlength="100" required />
            </div>
            <div class="relative flex h-14 items-center my-2">
              <div class="relative flex flex-shrink-0 items-center mr-2 w-40"><span class="required absolute right-0">Homepage URL :</span></div>
              <common-input v-model.trim="app.HOMEPAGE_URL" type="url" pattern="https?://.+" maxlengh="255" required />
            </div>
            <div class="relative flex h-auto my-2">
              <div class="relative flex flex-shrink-0 items-start mr-2 w-40"><span class="absolute right-0">Description :</span></div>
              <common-input v-model.trim="app.APPLICATION_DESCRIPTION" type="textarea" />
            </div>
            <div class="relative flex h-14 items-center my-2">
              <div class="relative flex flex-shrink-0 items-center mr-2 w-40"><span class="required absolute right-0">Redirect URI :</span></div>
              <common-input v-model.trim="app.REDIRECT_URI" type="url" maxlength="100" pattern="https?://.+" maxlengh="255" required />
            </div>
            <div class="relative flex h-14 items-center my-2">
              <div class="relative flex flex-shrink-0 items-center mr-2 w-40"><span class="absolute right-0">EXPIRES :</span></div>
              <common-input v-model="app.EXPIRES_DATE" type="text" placeholder="YYYY-MM-DD HH:mm:ss" />
            </div>
            <div class="relative flex h-14 items-center my-2">
              <div class="relative flex flex-shrink-0 items-center mr-2 w-40"><span class="absolute right-0">NOT BEFORE :</span></div>
              <common-input v-model="app.NOT_BEFORE" type="text" placeholder="YYYY-MM-DD HH:mm:ss" />
            </div>
            <div class="relative flex h-14 items-center my-2">
              <div class="relative flex flex-shrink-0 items-center mr-2 w-40"><span class="absolute right-0">DISABLED :</span></div>
              <common-input v-model="app.IS_DISABLED" type="checkbox" />
            </div>
            <div class="relative flex h-14 items-center my-2">
              <div class="relative flex flex-shrink-0 items-center mr-2 w-40"><span class="absolute right-0">EXPIRES :</span></div>
              <common-input v-model="app.IS_EXPIRES" type="checkbox" />
            </div>
            <div class="relative flex h-14 items-center my-2">
              <div class="relative flex flex-shrink-0 items-center mr-2 w-40"><span class="absolute right-0">CHECKED :</span></div>
              <common-input :modelValue="app.IS_CHECKED" type="checkbox" onclick="return false;"/>
            </div>
            <div class="relative flex h-14 items-center my-2">
              <div class="relative flex flex-shrink-0 items-center mr-2 w-40"><span class="absolute right-0">UPDATE TIME :</span></div>
              <common-input v-model="app.UPDATE_TIME" type="text" readonly />
            </div>
            <div class="relative flex justify-center mt-8">
              <common-button class="w-32" :modelValue="'submit'" type="submit" />
              <common-button class="w-32" :modelValue="'back'" type="router-link" to="/application" />
            </div>
          </form>
        </div>
      </div>
      <div class="w-1/2 h-full overflow-hidden" style="min-width: 450px;">
        <application-scope v-if="app.ID" :oauth_application_id="app.ID" @update:oauth-scope="syncOauthScope" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import Cat from '../components/Loaders/Cat.vue';
import MessagePopup from '../components/MessagePopup.vue';
import ApplicationScope from './ApplicationScope.vue';
import { get, put, del } from '../apis/utils';
import dayjs from 'dayjs';
import CommonInput from '../components/common/CommonInput.vue';
import CommonButton from '../components/common/CommonButton.vue';

export default defineComponent({
  components: { Cat, MessagePopup, ApplicationScope, CommonInput, CommonButton },
  setup() {
    const users = ref([]);
    const app = ref({ });
    const route = useRoute();
    const mapStore = inject('mapStore');
		const { changeNavigation } = <any> mapStore;
		changeNavigation(useRoute());

    const router = useRouter();
    const tempRemoveID = ref();
    const isShowUpdateCheckPopup = ref(false);
    const isShowLoad = ref(true);
    const isShowPopup = ref(false);
    const isShowRemovePopup = ref(false);

    onBeforeMount(async () => {
      try {
        let result = await get('/oauth-app/' + route.params.id);
        app.value = convertDate(result.data.data);

        result = await get('/oauth-app/' + route.params.id + '/oauth_application_user');
        users.value = result.data.data.datas;
      } catch (err: any) {
        alert(err.response.data.errMsg);
        router.replace('/application');
      } finally {
        isShowLoad.value = false;
      }
    });

    const convertDate = (data: any) => {
      data.EXPIRES_DATE = data.EXPIRES_DATE
        ? dayjs(data.EXPIRES_DATE).format('YYYY-MM-DD HH:mm:ss')
        : undefined;
      data.NOT_BEFORE = data.NOT_BEFORE
        ? dayjs(data.NOT_BEFORE).format('YYYY-MM-DD HH:mm:ss')
        : undefined;
      data.CREATE_TIME = data.CREATE_TIME
        ? dayjs(data.CREATE_TIME).format('YYYY-MM-DD HH:mm:ss')
        : undefined;
      data.UPDATE_TIME = data.UPDATE_TIME
        ? dayjs(data.UPDATE_TIME).format('YYYY-MM-DD HH:mm:ss')
        : undefined;

      return data;
    }

    const syncOauthScope = (scopeIds: string[]) => {
      (app.value as any).SCOPE_IDS = scopeIds;
    };

    const checkUpdate = async () => {
      try {
        isShowUpdateCheckPopup.value = false;
        isShowLoad.value = true;
        const putData = <any> app.value;
        let result = await put('/oauth-app/' + route.params.id, {
          name: putData.NAME,
          homepage_url: putData.HOMEPAGE_URL,
          application_description: putData.APPLICATION_DESCRIPTION,
          redirect_uri: putData.REDIRECT_URI,
          expires_date: putData.EXPIRES_DATE,
          not_before: putData.NOT_BEFORE,
          is_disabled: putData.IS_DISABLED,
          is_expires: putData.IS_EXPIRES,
          is_checked: putData.IS_CHECKED,
          scope_ids: putData.SCOPE_IDS
        });
        router.go(0);
      } catch (err: any) {
        alert(err.response.data.errMsg);
        isShowLoad.value = false;
      }
    }

    const checkForm = async () => {
      isShowUpdateCheckPopup.value = true;
    };

    const remove = async () => {
      try {
        if (tempRemoveID.value !== (app.value as any).ID) {
          alert('enter app_id error');

          return false;
        }
        isShowLoad.value = true;
        await del('/oauth-app/' + tempRemoveID.value);
        router.replace('/application');
      } catch (err: any) {
        alert(err.response.data.errMsg);
      } finally {
        isShowLoad.value = false;
      }
    };

    const reloadSecret = () => {
      alert('Not yet implemented');
    }

    const downloadConfig = () => {
      const _app: any = app.value;
      const config = {
        web: {
          client_id: _app.CLIENT_ID,
          application_id: _app.ID,
          auth_uri: window.location.protocol + '//' + window.location.host + '/oauth/authorization',
          token_uri: window.location.protocol + '//' + window.location.host + '/api/oauth/access-token',
          client_secret: _app.CLIENT_SECRET,
          redirect_uri: _app.REDIRECT_URI
        }
      };
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config));
      const downloadElem = document.getElementById('downloadEE');
      downloadElem?.setAttribute("href", dataStr);
      downloadElem?.setAttribute("download", "client_secret" + _app.CLIENT_ID + ".json");
      downloadElem?.click();
    }

    return {
      checkForm,
      checkUpdate,
      remove,
      syncOauthScope,
      reloadSecret,
      downloadConfig,
      isShowUpdateCheckPopup,
      isShowLoad,
      isShowPopup,
      isShowRemovePopup,
      tempRemoveID,
      app,
      users
    };
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

.message-popup-enter-active,
.message-popup-leave-active {
  transition: all 0.3s ease-in-out;
}

.message-popup-enter-from,
.message-popup-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

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
</style>
