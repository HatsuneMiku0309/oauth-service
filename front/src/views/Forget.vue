<template>
  <cat v-if="isShowLoad" class="w-full h-full opacity-50"/>
  <div class="flex flex-col items-center h-screen bg-gray-800">
    <div class="flex flex-col w-5/12 self-center bg-gray-600 mt-28 rounded-3xl min-w-min">
      <div class="flex flex-col mt-12 items-center w-full">
        <router-link class="flex flex-col items-center" :to="{ path: '/login', query: $route.query }">
          <img class="w-32" alt="Vue logo" src="@/../public/images/ac.png">
          <div class="flex justify-center w-32 mt-3">Authorize Center</div>
        </router-link>
      </div>
      <form class="mx-16 mt-6 p-4" @submit.prevent="checkForm" autocomplete="off">
        <div class="flex flex-col items-center px-12 pb-12">
          <div class="flex flex-col my-2 items-center w-full">
            <span class="required w-full text-left mb-1">Account</span>
            <common-input type="text" v-model="account" required placeholder="Account:" autocomplete="off" />
          </div>
        </div>
        <div class="flex flex-row my-2 items-center w-full justify-center mt-10">
          <common-button class="w-32" :modelValue="'Submit'" type="submit" />
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import Cat from '../components/Loaders/Cat.vue';
import CommonInput from '../components/common/CommonInput.vue';
import CommonButton from '../components/common/CommonButton.vue';
import { post } from '../apis/utils';

export default defineComponent({
  name: 'Forget',
  components: { Cat, CommonInput, CommonButton },
  setup() {
    const isShowLoad = ref(false);
    const account = ref('');
    const route = useRoute();
    const router = useRouter();
    const checkForm = async () => {
      try {
        isShowLoad.value = true;
        await post('/forget', {
          account: account.value
        }, {
          timeout: 10000
        });

        router.push({ path: '/login', query: route.query });
      } catch (err: any) {
        alert(err.response.data.errMsg);
      } finally {
				isShowLoad.value = false;
			}
    }

    return {
      isShowLoad,
      account,
      checkForm
    }
  },
})
</script>

<style scoped>

</style>