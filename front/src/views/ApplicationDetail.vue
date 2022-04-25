<template>
  <Cat v-if="isShowLoad" class="w-full h-full opacity-75" />
  <transition name="message-popup">
    <!-- <message-popup v-if="isShowPopup" @update:isShowPopup="newValue => isShowPopup = newValue"> -->
    <message-popup v-if="isShowPopup" v-model="isShowPopup">
      <template v-slot:title>
        <span class="text-3xl mt-0">Application Secret</span>
      </template>
      <template #default>
        <div class="text-sm text-red-600">Please keep this information safe, exposure will cause security problems.</div>
        <div class="relative flex w-full h-14 items-center">
          <div class="relative flex items-center h-14 mr-2 w-36"><span class="absolute right-0">Client ID :</span></div>
          <label class="flex items-center w-full p-2 h-4">{{ app.CLIENT_ID }}</label>
        </div>
        <div class="relative flex h-auto w-full items-center">
          <div class="relative flex self-start mr-2 w-36 pt-2"><span class="absolute right-0">Client Secret :</span></div>
          <label id="secret" class="flex items-center p-2 w-full h-full break-all">{{ app.CLIENT_SECRET }}</label>
        </div>
        <div class="relative flex h-14 w-full items-center">
          <div class="absolute right-0 top-4">
            <button class="ml-3 mr-3 bg-transparent border-2 rounded-2xl border-gray-700 p-2 hover:bg-gray-700">reload</button>
            <button class="ml-3 mr-3 bg-transparent border-2 rounded-2xl border-gray-700 p-2 hover:bg-gray-700">copy</button>
            <button class="ml-3 mr-3 bg-transparent border-2 rounded-2xl border-gray-700 p-2 hover:bg-gray-700">download</button>
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
        <form @submit.prevent="remove">
          <div class="text-sm">Please enter your app_id <label class="bg-gray-700 p-1">{{app.ID}}</label> to make sure you know to remove</div>
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
  <div class="w-full h-full overflow-x-hidden overflow-y-auto">
    <div class="w-full h-14 flex items-center relative">
      <div class="absolute left-10">
        <button class="border rounded-xl border-gray-700 p-1 text-red-600 hover:bg-gray-700" @click="isShowRemovePopup = true">Remove</button>
      </div>
      <div class="absolute right-10">
        <button class="border rounded-xl border-gray-700 p-1 hover:bg-gray-700 hover:text-white" @click="isShowPopup = true">Get Client</button>
      </div>
    </div>
    <div class="w-full h-14 flex items-center relative">
      <div class="ml-10">User Count: {{users.length}}</div>
    </div>
    <div class="flex flex-col w-full mb-12 mx-10 overflow-hidden">
      <form @submit.prevent="checkForm">
        <div class="flex h-14 items-center my-2">
          <div class="relative flex items-center mr-2 w-40"><span class="absolute right-0">Application Name :</span></div>
          <input class="
            bg-transparent border rounded-xl border-gray-700 p-2
            focus:outline-none focus:border-2 focus:border-gray-700 focus:shadow-md w-96"
            type="text" maxlength="100" required v-model="app.NAME" />
        </div>
        <div class="relative flex h-14 items-center my-2">
          <div class="relative flex items-center mr-2 w-40"><span class="absolute right-0">Homepage URL :</span></div>
          <input class="
            bg-transparent border rounded-xl border-gray-700 p-2
            focus:outline-none focus:border-2 focus:border-gray-700 focus:shadow-md w-96"
            type="url" pattern="https://.*" maxlengh="255" required v-model="app.HOMEPAGE_URL" />
        </div>
        <div class="relative flex h-auto my-2">
          <div class="relative flex items-start mr-2 w-40"><span class="absolute right-0">Description :</span></div>
          <textarea class="
            bg-transparent border rounded-xl border-gray-700 p-2
            focus:outline-none focus:border-2 focus:border-gray-700 focus:shadow-md w-96 h-24" v-model="app.APPLICATION_DESCRIPTION"></textarea>
        </div>
        <div class="relative flex h-14 items-center my-2">
          <div class="relative flex items-center mr-2 w-40"><span class="absolute right-0">Redirect URI :</span></div>
          <input class="
            bg-transparent border rounded-xl border-gray-700 p-2
            focus:outline-none focus:border-2 focus:border-gray-700 focus:shadow-md w-96"
            type="url" maxlength="100" pattern="https://.*" maxlengh="255" required v-model="app.REDIRECT_URI" />
        </div>
        <div class="relative flex h-14 items-center my-2">
          <div class="relative flex items-center mr-2 w-40"><span class="absolute right-0">EXPIRES :</span></div>
          <input class="
            bg-transparent border rounded-xl border-gray-700 p-2
            focus:outline-none focus:border-2 focus:border-gray-700 focus:shadow-md w-96"
            type="text" v-model="app.EXPIRES_DATE" />
        </div>
        <div class="relative flex h-14 items-center my-2">
          <div class="relative flex items-center mr-2 w-40"><span class="absolute right-0">NOT BEFORE :</span></div>
          <input class="
            bg-transparent border rounded-xl border-gray-700 p-2
            focus:outline-none focus:border-2 focus:border-gray-700 focus:shadow-md w-96"
            type="text" v-model="app.NOT_BEFORE" />
        </div>
        <div class="relative flex h-14 items-center my-2">
          <div class="relative flex items-center mr-2 w-40"><span class="absolute right-0">DISABLED :</span></div>
          <input class="
            bg-transparent border rounded-xl border-gray-700 p-2 w-96 h-4
            focus:border-2 focus:border-gray-700"
            type="checkbox" v-model="app.IS_DISABLED" />
        </div>
        <div class="relative flex h-14 items-center my-2">
          <div class="relative flex items-center mr-2 w-40"><span class="absolute right-0">EXPIRES :</span></div>
          <input class="
            bg-transparent border rounded-xl border-gray-700 p-2 w-96 h-4
            focus:border-2 focus:border-gray-700"
            type="checkbox" v-model="app.IS_EXPIRES" />
        </div>
        <div class="relative flex h-14 items-center my-2">
          <div class="relative flex items-center mr-2 w-40"><span class="absolute right-0">CHECKED :</span></div>
          <input class="
            bg-transparent border rounded-xl border-gray-700 p-2 w-96 h-4
            focus:border-2 focus:border-gray-700"
            type="checkbox" v-model="app.IS_CHECKED" />
        </div>
        <div class="relative flex h-14 items-center my-2">
          <div class="relative flex items-center mr-2 w-40"><span class="absolute right-0">UPDATE TIME :</span></div>
          <input class="
            bg-transparent border rounded-xl border-gray-700 p-2
            focus:outline-none focus:border-2 focus:border-gray-700 focus:shadow-md w-96"
            type="text" v-model="app.UPDATE_TIME" />
        </div>
        <div class="relative flex mt-8">
          <div>
            <input type="submit" class="
              mx-4 cursor-pointer w-32 bg-transparent border rounded-full 
              border-gray-700 p-2 hover:bg-gray-900" value="submit" />
          </div>
          <div>
            <router-link class="
              flex items-center justify-center
              mx-4 cursor-pointer w-32 bg-transparent border rounded-full 
              border-gray-700 p-2 hover:bg-gray-900" to="/application">back</router-link>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, ref, toHandlerKey } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import Cat from '../components/Loaders/Cat.vue';
import MessagePopup from '../components/MessagePopup.vue';
import { get, put, del } from '../apis/utils';
import dayjs from 'dayjs';

export default defineComponent({
  components: { Cat, MessagePopup },
  setup() {
    const users = ref([]);
    const app = ref({ });
    const route = useRoute();
    const mapStore = inject('mapStore');
		const { changeNavigation } = <any> mapStore;
		changeNavigation(useRoute());

    const router = useRouter();
    const tempRemoveID = ref();
    const isShowLoad = ref(true);
    const isShowPopup = ref(false);
    const isShowRemovePopup = ref(false);

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

    const checkForm = async () => {
      try {
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
          is_checked: putData.IS_CHECKED
        });
        result = await get('/oauth-app/' + result.data.data.ID);
        let data = convertDate(result.data.data);
        
        app.value = data;
      } catch (err: any) {
        alert(err.response.data.errMsg);
      } finally {
        isShowLoad.value = false;
      }
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
    }

    onMounted(async () => {
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

    return {
      checkForm,
      remove,
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
