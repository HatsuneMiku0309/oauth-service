<template>
  <input v-if="!['checkbox', 'radio', 'submit', 'textarea', 'router-link'].includes(type)" class="
    bg-transparent border rounded-xl border-gray-700 p-2
    focus:outline-none focus:border-2 focus:border-gray-700 focus:shadow-md w-full"
    :type="type" v-model="modelValue" @input="$emit('update:modelValue', modelValue)" />
  <input v-else-if="'checkbox' === type" class="
    bg-transparent border rounded-xl border-gray-700 p-2 w-full h-4
    focus:border-2 focus:border-gray-700"
    :type="type" v-model="modelValue" @input="$emit('update:modelValue', modelValue)" />
  <textarea v-else-if="'textarea' === type" class="
    bg-transparent border rounded-xl border-gray-700 p-2
    focus:outline-none focus:border-2 focus:border-gray-700 focus:shadow-md w-full h-24"
    v-model="modelValue" @input="$emit('update:modelValue', modelValue)" />
  <input v-else-if="'submit' === type" class="
    mx-4 cursor-pointer w-32 bg-transparent border rounded-full 
    border-gray-700 p-2 hover:bg-gray-900"
    :type="type" :value="modelValue" />
  <router-link v-else-if="'router-link' === type" class="
    flex items-center justify-center
    mx-4 cursor-pointer w-32 bg-transparent border rounded-full
    border-gray-700 p-2 hover:bg-gray-900">{{modelValue}}</router-link>
</template>

<script lang="ts">
import { defineComponent, onUpdated, toRefs } from 'vue';
import * as _ from 'lodash';

export default defineComponent({
  name: 'CommonInput',
  props: ['modelValue', 'type'],
  setup(props) {
    const { modelValue, type } = toRefs(props);
    return {
      modelValue,
      type
    };
  },
})
</script>

<style scoped>

</style>
