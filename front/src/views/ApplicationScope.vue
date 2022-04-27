<template>
  <div class="relative flex flex-col mr-10 overflow-hidden">
    <div class="pl-4 py-2 border border-gray-700 rounded-t-2xl border-b-0 font-bold text-lg">Application Scope</div>
    <div class="flex items-center relative pl-4 py-2 border-l border-r border-gray-700 w-full">
      <input class="bg-transparent border border-gray-700 rounded-xl p-1 focus:outline-none focus:border-2 focus:border-gray-700 focus:shadow-md" type="text" @keyup.exact.enter="search(true)" v-model="query.q" placeholder="Search" />
      <i class="relative right-6 oauth-icon search before:w-4 before:h-4 cursor-pointer" @click="search(true)"></i>
    </div>
    <div class="relative w-full px-4 pb-4 mb-4 border border-t-0 border-gray-700 rounded-2xl rounded-t-none overflow-auto shadow-md" style="height: 700px">
      <cat v-if="isShowLoad" class="w-full h-full top-0 left-0 opacity-75 z-10" />
      <ul class="table-cell w-screen">
        <li class="flex pb-4 px-2 h-14 w-full sticky top-0 bg-gray-700 shadow-lg">
          <div class="flex items-center flex-grow-0 flex-shrink-0 w-10 px-2"><input class="w-4 h-4" type="checkbox" @change="selectAll" v-model="selectedAll"/></div>
          <div class="flex items-center flex-grow-0 flex-shrink-0 w-24 px-2">SYSTEM</div>
          <div class="flex items-center flex-grow-0 flex-shrink-0 w-28 px-2">NAME</div>
          <div class="flex items-center flex-grow px-2">APIS</div>
        </li>
        <li :class="['flex', 'p-2', 'border-t', 'w-full', { 'border-b-0': index === scopes.length - 1 }]" v-for="(scope, index) in scopes" :key="index">
          <div class="flex items-center flex-grow-0 flex-shrink-0 w-10 px-2"><input class="w-4 h-4" type="checkbox" :value="scope.ID" @change="$emit('update:oauth-scope', selectApiScopes)" v-model="selectApiScopes"/></div>
          <div class="flex items-center flex-grow-0 flex-shrink-0 w-24 px-2 break-all">{{ scope.SYSTEM }}</div>
          <div class="flex items-center flex-grow-0 flex-shrink-0 w-28 px-2 break-all">{{ scope.NAME }}</div>
          <div class="flex items-center flex-grow px-2" :title="JSON.stringify(scope.APIS)">{{ scope.APIS }}</div>
        </li>
      </ul>
    </div>
    <pagination :pageList="pageList" @update:change-page="changePage"/>
  </div>
</template>

<script lang="ts">
import { get } from '@/apis/utils';
import { defineComponent, onMounted, reactive, ref, toRefs } from 'vue'
import Pagination from '../components/Pagination.vue';
import Cat from '../components/Loaders/Cat.vue';

export default defineComponent({
  name: 'ApplicationScope',
  components: { Pagination, Cat },
  props: ['oauth_application_id'],
  setup(props, { emit }) {
    let init = true;
    const isShowLoad = ref(false);
    const selectedAll = ref(false);
    const selectApiScopes = ref(<any[]> []);
    const oauthScopes = ref([]);
    const pageList = reactive({ offset: 0, count: 10, pages: 0 });
		const query = reactive({ q: '', ...pageList });
    const scopes = ref([]);
    const { oauth_application_id } = toRefs(props);

    onMounted(async () => {
      try {
        await oatuhScopeSearch();
        await search();
      } catch (err: any) {
        alert(err.response.data.errMsg);
      } finally {
        emit('update:oauth-scope', selectApiScopes.value);
        isShowLoad.value = false;
        init = false;
      }
    });

    const changePage = async (page: number) => {
			query.offset = page - 1;
			await search();
		}

    const selectAll = () => {
      if (selectedAll.value) {
        scopes.value.forEach((scope) => {
          if (!selectApiScopes.value.includes((scope as any ).ID)) {
            selectApiScopes.value.push((scope as any ).ID);
          }
        });
      } else {
        scopes.value.forEach((scope) => {
          let findSelectApiScopeIndex = selectApiScopes.value.findIndex((selectApiScope) => {
            return selectApiScope === (scope as any).ID
          });
          if (findSelectApiScopeIndex !== -1) {
            selectApiScopes.value.splice(findSelectApiScopeIndex, 1);
          }
        });
      }
      emit('update:oauth-scope', selectApiScopes.value);
    };

    const checkSelectAll = () => {
      let tempCount = 0;
      let apiScopeCount = scopes.value.length;
      scopes.value.forEach((scope) => {
        if (selectApiScopes.value.includes((scope as any).ID)) {
          tempCount++;
        }
      });
      if (tempCount === apiScopeCount) {
        selectedAll.value = true;
      } else {
        selectedAll.value = false;
      }
    }

    const oatuhScopeSearch =async () => {
      try {
        oauthScopes.value = [];
        let _oauthScopes = await get('/oauth-app/' + oauth_application_id.value + '/oauth_app_scope');
        oauthScopes.value = _oauthScopes.data.data;
        oauthScopes.value.forEach((oauthScope) => {
          if (!selectApiScopes.value.includes((oauthScope as any).SCOPE_ID)) {
            selectApiScopes.value.push((oauthScope as any).SCOPE_ID);
          }
        });
      } catch (err: any) {
        alert(err.response.data.errMsg);
      }
    }

    const search = async (reload = false) => {
			try {
        !init && (isShowLoad.value = true);
        reload && (query.offset = 0);
        scopes.value = [];
        
        
        let apiScopes = await get('/api-scope', {
          q: query.q,
          count: query.count,
          offset: query.offset
        });
        scopes.value = apiScopes.data.data.datas;
        query.pages = apiScopes.data.data.totalPage;
      } catch (err: any) {
        alert(err.response.data.errMsg);
      } finally {
        Object.assign(pageList, { offset: query.offset, count: query.count, pages: query.pages });
        checkSelectAll();
        isShowLoad.value = false;
      }
		};

    return {
      search,
      selectAll,
      changePage,
      isShowLoad,
      selectedAll,
      pageList,
      query,
      scopes,
      oauthScopes,
      selectApiScopes
    };
  },
})
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
