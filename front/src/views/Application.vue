<template>
	<Cat v-if="isShowLoad" class="w-full h-full opacity-75" />
	<div class="flex flex-col w-full mt-5 mb-12 mx-10 overflow-hidden">
		<div class="flex items-center">
			<input class="
				border border-gray-600 
				focus:outline-none focus:border-2 focus:border-gray-700 
				rounded-xl p-2 bg-transparent w-96"
				type="search" placeholder="Search" @keyup.exact.enter="search" v-model="q"/>
			<i class="relative right-6 oauth-icon search before:w-4 before:h-4 cursor-pointer" @click="search"></i>
		</div>
		<div class="table-cell border-2 rounded-lg bg-gray-600 border-gray-700 w-full my-4 overflow-auto">
			<div class="table-cell w-screen">
				<div class="sticky top-0 flex flex-row border-gray-700">
					<div class="bg-gray-800 flex flex-shrink-0 p-2 w-12 border-r-2 border-gray-700"></div>
					<div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-20 border-r-2 border-gray-700">INDEX</div>
					<div class="bg-gray-800 flex flex-shrink-0 p-2 w-44 border-r-2 border-gray-700">NAME</div>
					<div style="min-width: 10rem" class="bg-gray-800 flex flex-grow p-2 border-r-2 border-gray-700 overflow-x-hidden">HOMEPAGE_URL</div>
					<div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-28 border-r-2 border-gray-700">CHECKED</div>
					<div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-28 border-r-2 border-gray-700">DISABLED</div>
					<div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-28 border-r-2 border-gray-700">EXPIRES</div>
					<div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-32 border-r-2 border-gray-700">UPDATE_TIME</div>
					<div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-28">UPDATE_BY</div>
				</div>
				<div :class="['flex', 'flex-row', 'items-cente', 'w-full', 'h-16', 'hover:bg-gray-800 hover:bg-opacity-60', {'bg-gray-600': index % 2 === 0, 'bg-gray-700': index %2 !== 0}]" v-for="(app, index) in apps" :key="index">
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'justify-center', 'p-2', 'w-12', 'border-r-2', 'border-gray-500', { 'border-t-gray-700': index === 0}]">
						<input class="
							w-4 h-4 cursor-pointer appearance-none border rounded-md 
							checked:bg-green-500 hover:checked:bg-green-400 hover:bg-green-300"
							type="checkbox" :value="app.ID" v-model="selectIDs" />
					</div>
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'justify-center', 'p-2', 'w-20', 'border-r-2', 'border-gray-500', { 'border-t-gray-700': index === 0}]">
						<router-link class="flex items-center justify-center hover:underline w-full h-full" :to="{ name: 'ApplicationDetail', params: { id: app.ID } }"><span class="p-4">{{ index }}</span></router-link>
					</div>
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'p-2', 'w-44', 'border-r-2', 'border-gray-500', { 'border-t-gray-700': index === 0}]"><span>{{ app.NAME }}</span></div>
					<div style="min-width: 10rem" :class="[
						'flex', 'items-center', 'flex-grow', 'p-2', 'border-r-2',
						'border-gray-500', 'overflow-x-hidden', { 'border-t-gray-700': index === 0}]"
					>
						<a target="_blank" class="text-blue-500 underline italic hover:text-blue-400 hover:font-bold" :href="app.HOMEPAGE_URL">
							<span>{{ app.HOMEPAGE_URL }}</span>
						</a>
					</div>
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'justify-center', 'p-2', 'w-28', 'border-r-2', 'border-gray-500', { 'border-t-gray-700': index === 0}]"><span>{{ app.IS_CHECKED }}</span></div>
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'justify-center', 'p-2', 'w-28', 'border-r-2', 'border-gray-500', { 'border-t-gray-700': index === 0}]"><span>{{ app.IS_DISABLED }}</span></div>
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'justify-center', 'p-2', 'w-28', 'border-r-2', 'border-gray-500', { 'border-t-gray-700': index === 0}]"><span>{{ app.IS_EXPIRES }}</span></div>
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'justify-center', 'p-2', 'w-32', 'border-r-2', 'border-gray-500', { 'border-t-gray-700': index === 0}]"><span>{{ app.UPDATE_TIME }}</span></div>
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'justify-center', 'w-28', 'border-gray-500', { 'border-t-gray-700': index === 0}]"><span>{{ app.UPDATE_BY }}</span></div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { get } from '../apis/utils';
import Cat from '../components/Loaders/Cat.vue';

export default defineComponent({
	components: { Cat },
	setup() {
		const mapStore = inject('mapStore');
		const { changeNavigation } = <any> mapStore;
		changeNavigation(useRoute());

		const q = ref('');
		const apps = ref([]);
		const selectIDs = ref([]);
		const isShowLoad = ref(false);
		onMounted(async() => {
			try {
				let result = await get('/oauth-app');

				apps.value = result.data.data;
			} catch (err: any) {
				alert(err.response.data.errMsg)
			}
		});

		const search = async () => {
			try {
				isShowLoad.value = true;
				let result = await get('/oauth-app', { q: q.value }, {
					headers: {
						Authorization: localStorage.getItem('token')
					}
				});

				apps.value = result.data.data;
			} catch (err: any) {
				alert(err.response.data.errMsg);
			} finally {
				isShowLoad.value = false;
			}
		}

		return {
			isShowLoad,
			apps,
			selectIDs,
			search,
			q
		}
	},
});
</script>

<style scoped>
.oauth-icon:before {
  content: "";
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.oauth-icon.search::before {
  background-image: url("@/assets/images/svg/fi-rr-search.svg");
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
