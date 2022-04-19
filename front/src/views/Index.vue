<template>
  <!-- <Heart v-if="isShowLoad" /> -->
  <div name="main" class="relative flex flex-col h-full w-full">
    <div class="flex flex-row h-12 flex-shrink-0 items-center absolute">
      <div class="w-screen">
        <div class="absolute left-3 top-2 inline-block z-50">
          <router-link :to="{ name: 'Setting', params: { preRouter: $route.name } }">
            <i class="couple-icon setting before:bg-cover before:bg-no-repeat before:w-6 before:h-6 md:before:w-8 md:before:h-8"></i>
          </router-link>
        </div>
        <div class="absolute right-3 top-2 inline-block z-50" @click="showNotify(isShowNotify.data)"
          ><i class="couple-icon notify before:bg-cover before:bg-no-repeat before:w-6 before:h-6 md:before:w-8 md:before:h-8"></i>
        </div>
        <DropDown :isShowNotify="isShowNotify"/>
      </div>
    </div>
    <div id="container" class="relative flex-grow overflow-hidden pb-3">
      <router-view @touchstart.stop.passive="touchStartHandler" @touchend.stop="touchEndHandler" id="content" class="h-full w-full"/>
    </div>
    <Menu />
  </div>
</template>

<script lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import Heart from '../components/Loaders/Heart.vue';
import Menu from '../components/Menu.vue';
import DropDown from '../components/DropDown.vue';
// import { addDoc, collection, doc, getDocs, getFirestore, setDoc, getDoc } from 'firebase/firestore/lite';
// import { app } from '../apis/utils';

export default {
  name: 'Index',
  components: { Heart, Menu, DropDown },
  setup() {

    // const callapi = async () => {
    //   const db = getFirestore(app);
    //   const a = collection(db, 'USERS');
    //   const b = await getDocs(a);
    //   console.log(b);
    //   const qaq = doc(db, 'USERS', b.docs[0].id);
    //   const bbb = await getDoc(qaq);
    //   console.log(bbb);
    //   // await addDoc(a, { test: 1 });
    //   // await setDoc(qaq, { aaaaa: 321 }, { merge: true });
    //   // const c = b.docs.map((d) => d.data());
    //   // console.log(c);
    //   // console.log(c[0].CREATE_TIME.seconds);
    //   // console.log(new Date(c[0].CREATE_TIME.seconds * 1000));
    //   // console.log(a);
    // }
    // callapi();
    enum RefreshStatus {
      non,
      doing
    };
    let refreshStatus = RefreshStatus.non;
    let startOffset = 0;
    let endOffset = 0;
    let contentElem: HTMLElement;
    const router = useRouter();
    const isShowLoad = ref(false);
    const checkToken = () => {
      let token = localStorage.getItem('token');
      if (!token) {
        isShowLoad.value = true;

        // demo redirect login page when no has token
        setTimeout(() => {
          isShowLoad.value = false;
          router.replace('/login');
        }, 300);
      }
    };
    checkToken();

    const isShowNotify = reactive({ data: false});
    const showNotify = (show: boolean) => {
      isShowNotify.data = !show;
    };
    const move = (e: any) => {
      if (refreshStatus === RefreshStatus.doing) {
        endOffset = e.targetTouches[0].clientY;
        let diffOffset = endOffset - startOffset;
        if (diffOffset > 0) {
          contentElem.style.top = diffOffset >= 0 ? `${diffOffset }px` : '0px';
          contentElem.style.height = `calc(100% - ${diffOffset}px)`;
        }
      }
    }
    const touchStartHandler = (e: any) => {
      refreshStatus = RefreshStatus.non
      startOffset = e.targetTouches[0].clientY;
      contentElem = <HTMLElement> document.getElementById('content');
      if (contentElem.scrollTop === 0) {
        refreshStatus = RefreshStatus.doing
        contentElem.addEventListener('touchmove', move, { passive: true });
      }
    };
    const touchEndHandler = (e: any) => {
      contentElem.removeEventListener('touchmove', move)
      refreshStatus = RefreshStatus.non
      let diffOffset = endOffset - startOffset;
      endOffset = 0;
      startOffset = 0;
      if (diffOffset > 300) {
        console.log(router.go(0));
      }
      contentElem!.style.top = '0px';
      contentElem.style.height = '100%';
    };

    return {
      isShowLoad,
      isShowNotify,
      showNotify,
      touchStartHandler,
      touchEndHandler
    }
  }
};
</script>


<style scoped>
.couple-icon:before {
  content: "";
  display: flex;
  justify-content: center;
  align-items: center;
}

.couple-icon.notify::before {
  background-image: url("@/assets/images/svg/fi-rr-bell.svg");
}

.couple-icon.setting::before {
  background-image: url("@/assets/images/svg/fi-rr-settings.svg");
}

::-webkit-scrollbar {
  display: none;
}
</style>