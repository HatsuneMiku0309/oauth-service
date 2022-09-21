<template>
  <div class="w-full h-full max-h-96">
    <router-link :to="{ name: 'Activity', params: { id: item.id } }">
      <img class="w-1/2 h-1/2 m-auto" alt="Vue logo" src="@/../public/images/ac.png">
      <div class="w-full h-full border-t p-2 truncate whitespace-pre-wrap">
        {{ item.title }}
      </div>
    </router-link>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Card',
  props: ['item'],
  setup() {

  }
}
</script>

<style scoped>
</style>
