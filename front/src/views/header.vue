<template>
  <div class="flex items-center flex-grow-0 flex-shrink-0 w-full bg-gray-700">
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
              <li class="p-1">Modify Profile</li>
              <router-link to="/login"><li class="border-t p-1">Logout</li></router-link>
            </ul>
          </div>
        </transition>
      </i>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, toRefs } from 'vue';

export default defineComponent({
    name: 'OHeader',
    props: ['user'],
    setup(prop) {
      const showSetting = ref(false);
      const user = prop.user;
      const mapStore = inject('mapStore');
      const { state } = <any> mapStore;
      const { navigation } = toRefs(state);

      return {
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
