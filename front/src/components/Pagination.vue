<template>
  <div class="flex items-center justify-end w-full p-1">
    <ul>
      <li class="inline" v-for="(page, index) in pages" :key="index">
        <a v-if="typeof page === 'number' && pageList.offset + 1 !== page" class="p-2 hover:underline cursor-default" @click="$emit('update:change-page', page);">{{ page }}</a>
        <label v-else-if="typeof page === 'number' && pageList.offset + 1 === page" class="p-2 font-bold underline hover:underline cursor-default">{{ page }}</label>
        <label v-else>{{ page }}</label>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, toRefs } from 'vue'

export default defineComponent({
  name: 'Pagination',
  props: ['pageList'],
  setup(props) {
    const { pageList: refPageList } = toRefs(props);
    const pageList = reactive(refPageList.value);
    const pages = computed(function () {
			let result = [];
			const maxShowPage = 10;
			const firstPage = pageList.offset - (Math.ceil(maxShowPage / 2)) <= 0 ? 0 : pageList.offset - (Math.ceil(maxShowPage / 2));
      const lastPage = pageList.offset + (Math.ceil(maxShowPage / 2)) >= pageList.pages - 1 ? pageList.pages : pageList.offset + (Math.ceil(maxShowPage / 2));
      for(let i = 0 ; i < pageList.pages ; ++i) {
				if (i <= lastPage && i >= firstPage) {
					result.push(i + 1);
				}
			}
			if (firstPage !== 0) {
				result.unshift('...');
				result.unshift(1);
			}
			if (lastPage !== pageList.pages) {
				result.push('...');
				result.push(pageList.pages);
			}

			return result;
		});

    return {
      pageList,
      pages
    }
  },
})
</script>

<style scoped>

</style>
