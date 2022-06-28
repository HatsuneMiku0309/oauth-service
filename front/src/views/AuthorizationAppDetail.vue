<template>
  <Cat v-if="isShowLoad" class="w-full h-full opacity-75" />
  <div class="relative flex flex-col w-full mt-5 mb-5 mx-10 overflow-hidden">
		<div class="relative flex items-center h-12">
			<span class="absolute right-0">
				<common-button type="button" class="p-1 mr-2" @click="approve" :modelValue="'Approve'"/>
				<common-button type="button" class="p-1" @click="reject" :modelValue="'Reject'"/>
			</span>
		</div>
		<div class="table-cell border-2 rounded-lg bg-gray-600 border-gray-700 w-full my-4 overflow-auto shadow-lg">
			<div class="table-cell w-screen">
				<div class="sticky top-0 flex flex-row border-gray-700">
					<div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-20 border-r-2 border-gray-700">Index</div>
					<div class="bg-gray-800 flex flex-shrink-0 p-2 w-44 border-r-2 border-gray-700">System</div>
					<div class="bg-gray-800 flex flex-shrink-0 p-2 w-44 border-r-2 border-gray-700">Name</div>
					<div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-56 border-r-2 border-gray-700">Description</div>
					<div style="min-width: 10rem" class="bg-gray-800 flex flex-grow p-2 border-r-2 border-gray-700 overflow-x-hidden">Scope Apis</div>
				</div>
				<div :class="['flex', 'flex-row', 'items-cente', 'w-full', 'h-16', 'hover:bg-gray-800 hover:bg-opacity-60', {'bg-gray-600': index % 2 === 0, 'bg-gray-700 bg-opacity-80': index %2 !== 0}]" v-for="(app, index) in apps" :key="index">
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'justify-center', 'p-2', 'w-20', 'border-r-2', 'border-gray-500']">
						{{ index + 1 }}
					</div>
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'p-2', 'w-44', 'border-r-2', 'border-gray-500']"><span>{{ app.SCOPE_SYSTEM }}</span></div>
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'p-2', 'w-44', 'border-r-2', 'border-gray-500']"><span>{{ app.SCOPE_NAME }}</span></div>
					<div :class="['flex', 'flex-shrink-0', 'items-center', 'p-2', 'w-56', 'border-r-2', 'border-gray-500']"><span>{{ app.SCOPE_DESCRIPTION }}</span></div>
					<div style="min-width: 10rem" :class="[
						'p-2',
						'border-gray-500', 'overflow-x-hidden']"
					>
						{{app.SCOPE_APIS}}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Cat from '../components/Loaders/Cat.vue';
import Pagination from '../components/Pagination.vue';
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { get, put } from '@/apis/utils';
import { useRoute } from 'vue-router';
import CommonButton from '@/components/common/CommonButton.vue';
import router from '@/router';

export default defineComponent({
  name: 'AuthorizationAppDetail',
  components: { Cat, Pagination, CommonButton },
  setup() {
    const isShowLoad = ref(false);

		const route = useRoute();
		const { id } = route.params;
    const apps = ref([]);
    onMounted(async () => {
      try {
        await search();
      } catch (err: any) {
        alert(err.response.data.errMsg);
      }
    });

    const search = async () => {
			try {
				apps.value = [];
				isShowLoad.value = true;
        let result = await get('/authorization-app/' + id, { }, {
					headers: {
						Authorization: localStorage.getItem('token')
					},
					timeout: 100000
				});

        apps.value = result.data.data;
				if (apps.value.length === 0) {
					router.go(-1);
				}
			} catch (err: any) {
				alert(err.response.data.errMsg);
			} finally {
        isShowLoad.value = false;
			}
		};

		const approve = async () => {
			try {
				isShowLoad.value = true;
				const check = confirm('Are you sure approve the scopes?');
				if (check) {
					let result = await put('/authorization-app/' + id + '/approve-app', {
						description: ''
					}, {
						timeout: 15000
					});

					router.push('/authorization-app');
				}
			} catch (err: any) {
				alert(err.response.data.errMsg);
			} finally {
				isShowLoad.value = false;
			}
		};

		const reject = async () => {
			try {
				isShowLoad.value = true;
				const check = confirm('Are you sure reject the scopes?');
				if (check) {
					let result = await put('/authorization-app/' + id + '/reject-app', {
						description: ''
					}, {
						timeout: 15000
					});

					router.push('/authorization-app');
				}
			} catch (err: any) {
				alert(err.response.data.errMsg);
			} finally {
				isShowLoad.value = false;
			}
		}

    return {
      search,
			approve,
			reject,
      isShowLoad,
      apps
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
