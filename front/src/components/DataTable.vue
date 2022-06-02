<template>
  <div>
    <div class="table-cell border-2 rounded-lg bg-gray-600 border-gray-700 w-full my-4 overflow-auto shadow-lg">
      <div class="table-cell w-screen">
        <div class="sticky top-0 flex flex-row border-gray-700">
          <div
            v-for="(column, index) in columns" :key="index"
            class="bg-gray-800 flex flex-shrink-0 justify-center p-2 border-gray-700"
            :class="column.customClass"
          >
            {{column.name}}
          </div>
          <div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-20 border-r-2 border-gray-700">INDEX</div>
          <div class="bg-gray-800 flex flex-shrink-0 p-2 w-44 border-r-2 border-gray-700">NAME</div>
          <div style="min-width: 10rem" class="bg-gray-800 flex flex-grow p-2 border-r-2 border-gray-700 overflow-x-hidden">HOMEPAGE_URL</div>
          <div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-28 border-r-2 border-gray-700">CHECKED</div>
          <div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-28 border-r-2 border-gray-700">DISABLED</div>
          <div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-28 border-r-2 border-gray-700">EXPIRES</div>
          <div class="bg-gray-800 flex flex-shrink-0 justify-center p-2 w-32border-gray-700">UPDATE_TIME</div>
        </div>
        <div :class="['flex', 'flex-row', 'items-cente', 'w-full', 'h-16', 'hover:bg-gray-800 hover:bg-opacity-60', {'bg-gray-600': index % 2 === 0, 'bg-gray-700 bg-opacity-80': index %2 !== 0}]" v-for="(app, index) in apps" :key="index">
          <div :class="['flex', 'flex-shrink-0', 'items-center', 'justify-center', 'p-2', 'w-20', 'border-r-2', 'border-gray-500']">
            <router-link class="flex items-center justify-center hover:underline w-full h-full" :to="{ name: 'ApplicationDetail', params: { id: app.ID } }"><span class="p-4">{{ index + 1 + (10 * query.offset) }}</span></router-link>
          </div>
          <div :class="['flex', 'flex-shrink-0', 'items-center', 'p-2', 'w-44', 'border-r-2', 'border-gray-500']">
            <router-link class="flex items-center hover:underline w-full h-full" :to="{ name: 'ApplicationDetail', params: { id: app.ID } }"><span>{{ app.NAME }}</span></router-link>
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
  <div>
</template>

<script lang="ts">
/** todo-cosmo: 需求不明確，暫時停止 */
import { defineComponent, toRefs } from 'vue'

class Column {
  constructor(public name: string, public customClass: string[]) { }
}

class Data {
  constructor(public value: any, public customClass: string[]) { }
}

export default defineComponent({
  name: 'DataTable',
  props: {
    columns: {
      type: Array(Column),
      required: true
    },
    datas: {
      type: Array(Data),
      default: []
    }
  },
  setup(props) {
    const { columns, datas } = toRefs(props);

    return {
      columns,
      datas
    }
  },
})
</script>

<template>
  
</template>
