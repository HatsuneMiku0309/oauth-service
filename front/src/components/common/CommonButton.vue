<template>
  <input v-if="'submit' === type" class="
    mx-4 cursor-pointer bg-transparent border rounded-full 
    border-gray-700 p-2 hover:bg-gray-900 hover:text-white" 
    :type="type" :value="modelValue" />
  <button v-else-if="'button' === type" class="
    border rounded-xl border-gray-700 hover:bg-gray-700 hover:text-white"
    @click="isShowPopup = true">
    {{modelValue}}
  </button>
  <router-link v-else-if="'router-link' === type" :to="to" class="
    flex items-center justify-center
    mx-4 cursor-pointer bg-transparent border rounded-full
    border-gray-700 p-2 hover:bg-gray-900 hover:text-white">{{modelValue}}</router-link>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import * as _ from 'lodash';

export default defineComponent({
  name: 'CommonButton',
  props: ['modelValue', 'type', 'to'],
  setup(props) {
    const { modelValue, type, to } = toRefs(props);

    return {
      modelValue, type, to
    };
  },
})
</script>

<style scoped>

</style>
