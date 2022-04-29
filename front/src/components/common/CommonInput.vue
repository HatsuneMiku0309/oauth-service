<template>
  <input v-if="!['checkbox', 'radio', 'textarea'].includes(type)" class="
    bg-transparent border rounded-xl border-gray-700 p-2
    focus:outline-none focus:border-2 focus:border-gray-700 focus:shadow-md w-full"
    :type="type" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
  <input v-else-if="'checkbox' === type" class="
    bg-transparent border rounded-xl border-gray-700 p-2 w-full h-4
    focus:border-2 focus:border-gray-700"
    :type="type" :checked="modelValue" @change="$emit('update:modelValue', $event.target.checked)" />
  <textarea v-else-if="'textarea' === type" class="
    bg-transparent border rounded-xl border-gray-700 p-2
    focus:outline-none focus:border-2 focus:border-gray-700 focus:shadow-md w-full h-24"
    :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
  name: 'CommonInput',
  props: ['modelValue', 'type'],
  setup(props) {
    const { modelValue, type } = toRefs(props);

    return {
      modelValue, type
    };
  },
})
</script>

<style scoped>

</style>
