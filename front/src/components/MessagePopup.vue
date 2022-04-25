<template>
  <div class="fixed top-0 right-0 left-0 bottom-0 bg-black bg-opacity-70 z-50" @click.self="$emit('update:modelValue', false)">
    <div class="relative flex flex-col bg-gray-600 w-5/12 h-auto p-5 mt-20 mx-auto rounded-md popup">
      <div><slot name="title"><span class="text-3xl mt-0">Message Title</span></slot></div>
      <!-- <a class="close absolute text-gray-100
        top-5 right-7 text-3xl font-bold no-underline cursor-default 
        hover:text-gray-400"
        @click.self="$emit('update:isShowPopup', false)">&times;</a> -->
      <a class="close absolute text-gray-100
        top-5 right-7 text-3xl font-bold no-underline cursor-default 
        hover:text-gray-400"
        @click.self="$emit('update:modelValue', false)">&times;</a>
      <div class="flex flex-col w-full h-full items-start mt-10">
        <slot><label class="text-red-600 font-bold">Please insert your slot</label></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'

export default defineComponent({
  name: 'MessagePopup',
  setup() {

    return { };
  },
})
</script>

<style scoped>
.popup {
  transition: all 5s ease-in-out;
}

.popup .close {
  transition: all 200ms;
}

</style>
