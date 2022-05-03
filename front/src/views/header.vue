<template>
  <div class="flex items-center flex-grow-0 flex-shrink-0 w-full bg-gray-700">
    <transition name="message-popup">
      <message-popup v-if="isShowApps" v-model="isShowApps">
        <template v-slot:title>
          <span class="text-3xl mt-0">Authorization Apps</span>
        </template>
        <template #default>
          <ul class="w-full">
            <li class="p-2" v-for="(profileApp, index) in profileApps" :key="index">
              <span><common-button class="p-1 text-red-600" type="button" :modelValue="'Remove'" @click="removeApp(profileApp.ID)" /></span>
              <span class="ml-3">{{profileApp.APP_NAME}}</span>
            </li>
          </ul>
        </template>
      </message-popup>
    </transition>
    <div class="flex flex-shrink-0 text-2xl ml-4 font-bold hover:text-gray-400"><router-link to="/">Oauth</router-link></div>
    <div class="flex ml-12">
      <div class="flex" v-for="(value, index) in navigation" :key="index">
        <div class="flex" v-for="(parent, _index) in value.parents" :key="_index">
          <router-link class="py-2 px-1 hover:underline" :to="{ name: parent }">{{ parent }}</router-link>
          <span class="py-2 px-2" v-if="value.parents && value.parents.length !== 0">&gt;</span>
        </div>
        <router-link v-if="navigation.length > (index + 1)" class="py-2 px-1 hover:underline" :to="value.path">{{ value.name }}</router-link>
        <span v-if="navigation.length === (index + 1)" class="py-2 px-1">{{ value.name }}</span>
        <span class="py-2 px-2" v-if="navigation.length > (index + 1)">&gt;</span>
      </div>
    </div>
    <div class="flex flex-grow justify-end">
      <div class="w-20">{{user.ACCOUNT}}</div>
      <i class="oauth-icon setting before:w-6 before:h-6 mr-2 cursor-pointer" title="Setting" @click.self="showSetting = !showSetting">
        <transition name="setting">
          <div v-if="showSetting" class="absolute top-11 right-6 z-40">
            <ul v-if="showSetting" class="absolute w-40 bg-gray-700 border border-gray-800 -right-4 top-2 rounded-md not-italic p-1">
              <li class="p-1" @click.stop="getProfile">Modify Profile</li>
              <li class="p-1" @click.stop="getUserApps">Apps</li>
              <a @click="logout"><li class="border-t p-1">Logout</li></a>
            </ul>
          </div>
        </transition>
      </i>
    </div>
  </div>
</template>

<script lang="ts">
import { del, get } from '@/apis/utils';
import CommonButton from '@/components/common/CommonButton.vue';
import { defineComponent, inject, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import MessagePopup from '../components/MessagePopup.vue';

export default defineComponent({
    name: 'OHeader',
    components: { CommonButton, MessagePopup },
    props: ['user'],
    setup(prop) {
      const profileApps = ref([]);
      const isShowApps = ref(false);
      const isShowProfile = ref(false);
      const router = useRouter();
      const showSetting = ref(false);
      const { user } = toRefs(prop);
      const mapStore = inject('mapStore');
      const { state } = <any> mapStore;
      const { navigation } = toRefs(state);
      const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user-data');
        router.replace('/login');
      };

      const getUserApps = async () => {
        try {
          let result = await get('/oauth-app/profile/oauth_application_user');
          profileApps.value = result.data.data;
          isShowApps.value = true;
        } catch (err: any) {
          alert(err.response.data.errMsg);
        }
      };

      const removeApp = async (oau_id: string) => {
        try {
          let checked = confirm('Are you sure you want to remove?');
          if (checked) {
            await del('/oauth-app/profile/oauth_application_user/' + oau_id);
            await getUserApps();
          }
        } catch (err: any) {
          alert(err.response.data.errMsg);
        }
      };

      const getProfile = async () => {
        try {
          console.log('profile');
          isShowProfile.value = true;
        } catch (err: any) {
          alert(err.response.data.errMsg);
        }
      }

      return {
        logout,
        getUserApps,
        getProfile,
        removeApp,
        profileApps,
        isShowApps,
        isShowProfile,
        showSetting,
        user,
        navigation
      };
    },
});
</script>

<style scoped>
.setting-enter-active,
.setting-leave-active {
  transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}

.setting-enter-from,
.setting-leave-to {
  transform: translateX(20px);
  opacity: 0;
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

.oauth-icon:before {
  content: "";
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.oauth-icon.setting::before {
  background-image: url("@/assets/images/svg/fi-rr-settings.svg");
}

</style>
