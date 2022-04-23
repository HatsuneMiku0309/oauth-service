<template>
  <Cat v-if="isShowLoad" class="w-full h-full opacity-75" />
  <transition name="message-popup">
    <MessagePopup v-if="isShowPopup" :data="app" :isShowPopup="isShowPopup" @update:isShowPopup="newValue => isShowPopup = newValue" />
  </transition>
  <div class="w-full h-full overflow-x-hidden overflow-y-auto">
    <div class="absolute right-8 top-3">
      <button class="border rounded-xl border-gray-700 p-1 hover:bg-gray-700 hover:text-white" @click="isShowPopup = true">Get Client</button>
    </div>
    <div class="flex flex-col w-full mt-12 mb-12 mx-10 overflow-hidden">
      <form @submit.prevent="checkForm">
        <div class="flex h-14 items-center my-2">
          <div class="relative flex items-center mr-2 w-40"><span class="absolute right-0">Application Name :</span></div>
          <input class="
            bg-transparent border rounded-xl border-gray-700 p-2
            focus:outline-none focus:border-2 focus:border-gray-700 w-96"
            type="text" maxlength="100" required v-model="app.NAME" />
        </div>
        <div class="relative flex h-14 items-center my-2">
          <div class="relative flex items-center mr-2 w-40"><span class="absolute right-0">Homepage URL :</span></div>
          <input class="
            bg-transparent border rounded-xl border-gray-700 p-2
            focus:outline-none focus:border-2 focus:border-gray-700 w-96"
            type="url" pattern="https://.*" maxlengh="255" required v-model="app.HOMEPAGE_URL" />
        </div>
        <div class="relative flex h-auto my-2">
          <div class="relative flex items-start mr-2 w-40"><span class="absolute right-0">Description :</span></div>
          <textarea class="
            bg-transparent border rounded-xl border-gray-700 p-2
            focus:outline-none focus:border-2 focus:border-gray-700 w-96 h-24" v-model="app.APPLICATION_DESCRIPTION"></textarea>
        </div>
        <div class="relative flex h-14 items-center my-2">
          <div class="relative flex items-center mr-2 w-40"><span class="absolute right-0">Redirect URI :</span></div>
          <input class="
            bg-transparent border rounded-xl border-gray-700 p-2
            focus:outline-none focus:border-2 focus:border-gray-700 w-96"
            type="url" maxlength="100" pattern="https://.*" maxlengh="255" required v-model="app.REDIRECT_URI" />
        </div>
        <div class="relative flex h-14 items-center my-2">
          <div class="relative flex items-center mr-2 w-40"><span class="absolute right-0">EXPIRES :</span></div>
          <input class="
            bg-transparent border rounded-xl border-gray-700 p-2
            focus:outline-none focus:border-2 focus:border-gray-700 w-96"
            type="text" v-model="app.EXPIRES_DATE" />
        </div>
        <div class="relative flex h-14 items-center my-2">
          <div class="relative flex items-center mr-2 w-40"><span class="absolute right-0">NOT BEFORE :</span></div>
          <input class="
            bg-transparent border rounded-xl border-gray-700 p-2
            focus:outline-none focus:border-2 focus:border-gray-700 w-96"
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
            focus:outline-none focus:border-2 focus:border-gray-700 w-96"
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
import { defineComponent, inject, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router';
import Cat from '../components/Loaders/Cat.vue';
import MessagePopup from '../components/MessagePopup.vue';
import { get, put } from '../apis/utils';
import dayjs from 'dayjs';

export default defineComponent({
  components: { Cat, MessagePopup },
  setup() {
    const app = ref({ });
    const route = useRoute();
    const mapStore = inject('mapStore');
		const { changeNavigation } = <any> mapStore;
		changeNavigation(useRoute());

    const isShowLoad = ref(true);
    const isShowPopup = ref(false);
    
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

    onMounted(async () => {
      try {
        let result = await get('/oauth-app/' + route.params.id);
        let data = convertDate(result.data.data);
        
        app.value = data;
      } catch (err: any) {
        alert(err.response.data.errMsg);
      } finally {
        isShowLoad.value = false;
      }
    });

    return {
      checkForm,
      isShowLoad,
      isShowPopup,
      app
    };
  },
})
</script>

<style scoped>
.message-popup-enter-active,
.message-popup-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
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
