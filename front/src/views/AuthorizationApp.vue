<template>
  <Cat v-if="isShowLoad" class="w-full h-full opacity-75" />
  <div class="relative flex flex-col w-full mt-5 mb-5 mx-10 overflow-hidden">
		<div class="relative flex items-center">
			<input class="
				border border-gray-700 
				focus:outline-none focus:border-2 focus:border-gray-700 focus:shadow-md
				rounded-xl p-2 bg-transparent w-96"
				type="text" placeholder="Search" @keyup.exact.enter="search(true)" v-model="query.q"/>
			<i class="relative right-6 oauth-icon search before:w-4 before:h-4 cursor-pointer" @click="search(true)"></i>
			<div class="flex items-center w-full h-full">
				<span class="absolute right-0">
					<button class="border rounded-xl border-gray-700 p-1 hover:bg-gray-700 hover:text-white" @click="isShowPopup = true">Create</button>
				</span>
			</div>
		</div>
		<div class="table-cell border-2 rounded-lg bg-gray-600 border-gray-700 w-full my-4 overflow-auto shadow-lg">
			<div class="table-cell w-screen">
				<div class="sticky top-0 flex flex-row border-gray-700">
					<div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-20 border-r-2 border-gray-700">Index</div>
					<div class="bg-gray-800 flex flex-shrink-0 p-2 w-44 border-r-2 border-gray-700">Name</div>
					<div class="bg-gray-800 flex flex-shrink-0 p-2 w-44 border-r-2 border-gray-700">Account</div>
					<div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-56 border-r-2 border-gray-700">Email</div>
					<div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-56 border-r-2 border-gray-700">Phone</div>
					<div style="min-width: 10rem" class="bg-gray-800 flex flex-grow p-2 border-r-2 border-gray-700 overflow-x-hidden">Homepage URL</div>
				</div>
				<div :class="['flex', 'flex-row', 'items-cente', 'w-full', 'h-16', 'hover:bg-gray-800 hover:bg-opacity-60', {'bg-gray-600': index % 2 === 0, 'bg-gray-700 bg-opacity-80': index %2 !== 0}]" v-for="(app, index) in apps" :key="index">
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'justify-center', 'p-2', 'w-20', 'border-r-2', 'border-gray-500']">
						<router-link class="flex items-center justify-center hover:underline w-full h-full" :to="{ name: 'AuthorizationAppDetail', params: { id: app.ID } }"><span class="p-4">{{ index + 1 + (10 * query.offset) }}</span></router-link>
					</div>
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'p-2', 'w-44', 'border-r-2', 'border-gray-500']">
						<router-link class="flex items-center hover:underline w-full h-full" :to="{ name: 'AuthorizationAppDetail', params: { id: app.ID } }"><span>{{ app.NAME }}</span></router-link>
					</div>
          <div :class="['flex', 'flex-shrink-0', 'items-center', 'p-2', 'w-44', 'border-r-2', 'border-gray-500']"><span>{{ app.USER_ACCOUNT }}</span></div>
          <div :class="['flex', 'flex-shrink-0', 'items-center', 'p-2', 'w-56', 'border-r-2', 'border-gray-500']"><span>{{ app.USER_EMAIL }}</span></div>
          <div :class="['flex', 'flex-shrink-0', 'items-center', 'p-2', 'w-56', 'border-r-2', 'border-gray-500']"><span>{{ app.USER_PHONE }}</span></div>
					<div style="min-width: 10rem" :class="[
						'flex', 'items-center', 'flex-grow', 'p-2',
						'border-gray-500', 'overflow-x-hidden']"
					>
						<a target="_blank" class="text-blue-500 underline italic hover:text-blue-400 hover:font-bold" :href="app.HOMEPAGE_URL">
							<span>{{ app.HOMEPAGE_URL }}</span>
						</a>
					</div>
				</div>
			</div>
		</div>
		<pagination :pageList="pageList" @update:change-page="changePage"/>
	</div>
</template>

<script lang="ts">
import Cat from '../components/Loaders/Cat.vue';
import Pagination from '../components/Pagination.vue';
import { defineComponent, inject, onMounted, reactive, ref } from 'vue'
import { get } from '@/apis/utils';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'AuthorizationApps',
  components: { Cat, Pagination },
  setup() {
		const mapStore = inject('mapStore');
		const { changeNavigation } = <any> mapStore;
		changeNavigation(useRoute());
    const isShowLoad = ref(false);

    const apps = ref([]);
    const pageList = reactive({ offset: 0, count: 10, pages: 0 });
		const query = reactive({ q: '', ...pageList });
    onMounted(async () => {
      try {
        await search();
      } catch (err: any) {
        alert(err.response.data.errMsg);
      }
    });

    const changePage = async (page: number) => {
			query.offset = page - 1;
			await search();
		};

    const search = async (reload = false) => {
			try {
        reload && (query.offset = 0);
				apps.value = [];
				isShowLoad.value = true;
        let result = await get('/authorization-app', {
					q: query.q,
					offset: query.offset,
					count: query.count
				}, {
					headers: {
						Authorization: localStorage.getItem('token')
					},
					timeout: 100000
				});

        query.pages = result.data.data.totalPage;
        apps.value = result.data.data.datas;
			} catch (err: any) {
				alert(err.response.data.errMsg);
			} finally {
        Object.assign(pageList, { offset: query.offset, count: query.count, pages: query.pages });

        isShowLoad.value = false;
			}
		};

    return {
      search,
      changePage,
      isShowLoad,
      apps,
      query,
      pageList
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
</style>
