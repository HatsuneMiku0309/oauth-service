<template>
  <cat v-if="isShowLoad" class="w-full h-full opacity-75" />
  <div class="flex flex-col h-screen overflow-hidden">
    <o-header class="header border-b border-gray-500 shadow-xl" :user="user" />
    <div class="flex flex-grow main">
      <left-side />
      <main-container class="border-l border-gray-500"/>
    </div>
  </div>
</template>

<script lang="ts">
// import { post } from '@/apis/utils';
import { defineComponent, onBeforeMount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Cat from '../components/Loaders/Cat.vue';
import { decodeBase64 } from '../utils';
import OHeader from './header.vue';
import LeftSide from './LeftSide.vue';
import MainContainer from './MainContainer.vue';

export default defineComponent({
  name: 'Index',
  components: { Cat, OHeader, LeftSide, MainContainer },
  setup() {
    const initTokenLoginBody = 'e30';
    const router = useRouter();
    const isShowLoad = ref(false);
    const showSetting = ref(false);
    let user = ref({ });
    let userData = <string> localStorage.getItem('user-data');
    user.value = JSON.parse(decodeBase64(userData));

    // const checkToken = async () => {
    //   try {
    //     let userData = localStorage.getItem('user-data');
    //     let token = localStorage.getItem('token');
    //     if (!token || !userData) {
    //       throw new Error('No token or user-data')
    //     } else {
    //       try {
    //         await post('/login/token', { user_token: userData || initTokenLoginBody });
    //         user.value = JSON.parse(decodeBase64(userData))
    //       } catch (err: any) {
    //         localStorage.removeItem('user-data');
    //         localStorage.removeItem('token');
    //         alert(err.response.data.errMsg);
    //         router.replace('/login');
    //       }
    //     }

    //     return false;
    //   } catch (err) {
    //     return true;
    //   }
    // };

    // onBeforeMount(async () => {
    //   if (await checkToken()) {
    //     router.replace('/login');
    //   }
    // })

    return {
      isShowLoad,
      user,
      showSetting
    }
  }
});
</script>


<style scoped>
.header {
  height: 6vh;
}

.main {
  height: 94vh;
}

::-webkit-scrollbar {
  width: 8px;
  border-radius: 8px;
}

/* Track */
::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.2);
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.4);
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.7);
}
</style>
