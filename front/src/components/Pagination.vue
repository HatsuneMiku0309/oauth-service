<template>
  <div class="w-full h-auto">
    <div class="absolute right-0">
      <ul>
        <li class="inline" v-for="(page, index) in pages" :key="index">
          <a v-if="typeof page === 'number' && offset + 1 !== page" class="p-2 hover:underline cursor-default" @click="$emit('update:offset', page - 1); $emit('update:search');">{{ page }}</a>
          <label v-else-if="typeof page === 'number' && offset + 1 === page" class="p-2 font-bold underline hover:underline cursor-default">{{ page }}</label>
          <label v-else>{{ page }}</label>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'

export default defineComponent({
  name: 'Pagination',
  props: ['pages', 'offset'],
  setup(props) {

    return {
      ...toRefs(props)
    }
  },
})
</script>

<style scoped>

</style>
