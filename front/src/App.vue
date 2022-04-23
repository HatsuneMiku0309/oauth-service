<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent, provide } from 'vue'
import store from './store/header';

export default defineComponent({
  setup() {
    provide('mapStore', store);
  },
})
</script>


<style>
  html, body, #app {
    height: 100%;
    width: 100vw;
    overflow: hidden;
  }
</style>
