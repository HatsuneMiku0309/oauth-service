<template>
	<Cat v-if="isShowLoad" class="w-full h-full opacity-75" />
	<keep-alive name="application_create">
		<message-popup v-if="isShowPopup" v-model="isShowPopup">
			<template #title>
				<span class="text-3xl mt-0">Application Create</span>
			</template>
			<template #default>
				<div class="flex flex-col w-full overflow-y-auto max-h-96">
				<form class="p-2" @submit.prevent="checkForm">
					<div class="flex = h-14 items-center my-2">
						<div class="relative flex items-center mr-2 w-52"><span class="required absolute right-0">Name :</span></div>
						<common-input v-model.trim="app.NAME" type="text" maxlength="100" required />
					</div>
					<div class="relative flex h-14 items-center my-2">
						<div class="relative flex items-center mr-2 w-52"><span class="required absolute right-0">Homepage URL :</span></div>
						<common-input v-model.trim="app.HOMEPAGE_URL" type="url" pattern="https?://.+" maxlengh="255" required />
					</div>
					<div class="relative flex h-auto my-2">
						<div class="relative flex items-start mr-2 w-52"><span class="absolute right-0">Description :</span></div>
						<common-input v-model.trim="app.APPLICATION_DESCRIPTION" type="textarea" />
					</div>
					<div class="relative flex h-14 items-center my-2">
						<div class="relative flex items-center mr-2 w-52"><span class="required absolute right-0">Redirect URI :</span></div>
						<common-input v-model.trim="app.REDIRECT_URI" type="url" maxlength="100" pattern="https?://.+" maxlengh="255" required />
					</div>
					<div class="relative flex h-14 items-center my-2">
						<div class="relative flex items-center mr-2 w-52"><span class="absolute right-0">Expires :</span></div>
						<common-input v-model="app.EXPIRES_DATE" type="text" placeholder="YYYY-MM-DD HH:mm:ss" />
					</div>
					<div class="relative flex h-14 items-center my-2">
						<div class="relative flex items-center mr-2 w-52"><span class="absolute right-0">Not Before :</span></div>
						<common-input v-model="app.NOT_BEFORE" type="text" placeholder="YYYY-MM-DD HH:mm:ss" />
					</div>
					<div class="relative flex h-14 items-center my-2">
						<div class="relative flex items-center mr-2 w-52"><span class="absolute right-0">Disabled :</span></div>
						<common-input v-model="app.IS_DISABLED" type="checkbox" />
					</div>
					<div class="relative flex h-14 items-center my-2">
						<div class="relative flex items-center mr-2 w-52"><span class="absolute right-0">Expires :</span></div>
						<common-input v-model="app.IS_EXPIRES" type="checkbox" />
					</div>
					<div class="relative flex mt-8">
						<div>
							<input type="submit" class="
								mx-4 cursor-pointer w-32 bg-transparent border rounded-full 
								border-gray-700 p-2 hover:bg-gray-900" value="submit" />
						</div>
					</div>
				</form>
			</div>
			</template>
		</message-popup>
	</keep-alive>
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
					<div style="min-width: 10rem" class="bg-gray-800 flex flex-grow p-2 border-r-2 border-gray-700 overflow-x-hidden">Homepage URL</div>
					<div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-28 border-r-2 border-gray-700">Checked</div>
					<div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-28 border-r-2 border-gray-700">Disabled</div>
					<div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-28 border-r-2 border-gray-700">Expires</div>
					<div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-32 border-gray-700">Update Time</div>
				</div>
				<div :class="['flex', 'flex-row', 'items-cente', 'w-full', 'h-16', 'hover:bg-gray-800 hover:bg-opacity-60', {'bg-gray-600': index % 2 === 0, 'bg-gray-700 bg-opacity-80': index %2 !== 0}]" v-for="(app, index) in apps" :key="index">
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'justify-center', 'p-2', 'w-20', 'border-r-2', 'border-gray-500']">
						<router-link class="flex items-center justify-center hover:underline w-full h-full" :to="{ name: 'ApplicationDetail', params: { id: app.ID } }"><span class="p-4">{{ index + 1 + (10 * query.offset) }}</span></router-link>
					</div>
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'p-2', 'w-44', 'border-r-2', 'border-gray-500']">
						<router-link class="flex items-center hover:underline w-full h-full" :to="{ name: 'ApplicationDetail', params: { id: app.ID } }"><span class="flex items-center"><div class="w-2 h-2 mr-2" :style="{ 'background-color': '#' + app.COLOR }"></div>{{ app.NAME }}</span></router-link>
					</div>
					<div style="min-width: 10rem" :class="[
						'flex', 'items-center', 'flex-grow', 'p-2', 'border-r-2',
						'border-gray-500', 'overflow-x-hidden']"
					>
						<a target="_blank" class="text-blue-500 underline italic hover:text-blue-400 hover:font-bold" :href="app.HOMEPAGE_URL">
							<span>{{ app.HOMEPAGE_URL }}</span>
						</a>
					</div>
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'justify-center', 'p-2', 'w-28', 'border-r-2', 'border-gray-500']"><span>{{ app.IS_CHECKED }}</span></div>
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'justify-center', 'p-2', 'w-28', 'border-r-2', 'border-gray-500']"><span>{{ app.IS_DISABLED }}</span></div>
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'justify-center', 'p-2', 'w-28', 'border-r-2', 'border-gray-500']"><span>{{ app.IS_EXPIRES }}</span></div>
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'justify-center', 'p-2', 'w-32', 'border-gray-500']"><span>{{ app.UPDATE_TIME }}</span></div>
				</div>
			</div>
		</div>
		<pagination :pageList="pageList" @update:change-page="changePage"/>
	</div>
</template>

<script lang="ts">
import MessagePopup from '@/components/MessagePopup.vue';
import { defineComponent, inject, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { get, post } from '../apis/utils';
import Cat from '../components/Loaders/Cat.vue';
import Pagination from '../components/Pagination.vue';
import CommonInput from '../components/common/CommonInput.vue';
import CommonButton from '../components/common/CommonButton.vue';
import Input from '@/components/common/Input.vue';

export default defineComponent({
	components: { Cat, MessagePopup, Pagination, CommonInput, CommonButton },
	setup() {
		const mapStore = inject('mapStore');
		const { changeNavigation } = <any> mapStore;
		changeNavigation(useRoute());

		const pageList = reactive({ offset: 0, count: 10, pages: 0 });
		const query = reactive({ q: '', ...pageList });
		let app: any = reactive({});
		const apps = ref([]);
		const selectIDs = ref([]);
		const isShowLoad = ref(false);
		const isShowPopup = ref(false);
		onMounted(async() => {
			try {
				await search();
			} catch (err: any) {
				alert(err.response.data.errMsg)
			}
		});

		const changePage = async (page: number) => {
			query.offset = page - 1;
			await search();
		}

		const search = async (reload = false) => {
			try {
				reload && (query.offset = 0);
				apps.value = [];
				isShowLoad.value = true;
				let result = await get('/oauth-app', {
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

		const checkForm = async () => {
			try {
				isShowLoad.value = false;
				await post('/oauth-app', {
					name: app.NAME,
					homepage_url: app.HOMEPAGE_URL,
					application_description: app.APPLICATION_DESCRIPTION,
					redirect_uri: app.REDIRECT_URI,
					expires_date: app.EXPIRES_DATE,
					not_before: app.NOT_BEFORE,
					is_disabled: app.IS_DISABLED,
					is_expires: app.IS_EXPIRES
				});
				for (let key in app) {
					delete app[key];
				}
				isShowPopup.value = false;
				await search();
			} catch (err: any) {
				alert(err.response.data.errMsg);
			} finally {
				isShowLoad.value = false;
			}
		}

		return {
			isShowPopup,
			isShowLoad,
			app,
			apps,
			selectIDs,
			search,
			checkForm,
			changePage,
			query,
			pageList,
		}
	},
});
</script>

<style scoped>
.required:before {
  content: "*";
  display: inline-flex;
  color: red;
  margin-right: 0.3rem;
}

.oauth-icon:before {
  content: "";
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: cover;
  background-repeat: no-repeat;
	flex-shrink: 0;
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
