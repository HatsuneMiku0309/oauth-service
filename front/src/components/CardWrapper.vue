<template>
  <div v-for="(item, index) in posts" :key="index" class="w-5/6 h-full m-4 flex flex-col justify-center items-center border rounded-3xl overflow-hidden">
    <Card :item="item" />
  </div>
</template>

<script lang="ts">
import Card from './Card.vue';

export default {
  name: 'CardWrapper',
  props: ['posts'],
  components: {
    Card
  },
  setup() {

  }
}
</script>

<style scoped>
</style>
