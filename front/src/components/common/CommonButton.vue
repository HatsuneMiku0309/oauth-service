<template>
  <input v-if="'submit' === type" class="
    mx-4 cursor-pointer w-32 bg-transparent border rounded-full 
    border-gray-700 p-2 hover:bg-gray-900"
    :type="type" :value="modelValue" />
  <button v-else-if="button" class="
    border rounded-xl border-gray-700 p-1 hover:bg-gray-700 hover:text-white"
    @click="isShowPopup = true">
    {{modelValue}}
  </button>
  <router-link v-else-if="'router-link' === type" class="
    flex items-center justify-center
    mx-4 cursor-pointer w-32 bg-transparent border rounded-full
    border-gray-700 p-2 hover:bg-gray-900">{{modelValue}}</router-link>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import * as _ from 'lodash';

export default defineComponent({
  name: 'CommonButton',
  props: ['modelValue', 'type'],
  setup(props) {
    const { type } = toRefs(props);
    if (type === 'router-link') {
      console.log(props)
    }
    return {
      modelValue: props.modelValue,
      type
    };
  },
})
</script>

<style scoped>

</style>
