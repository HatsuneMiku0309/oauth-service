<template>
  <div class="fixed top-0 right-0 left-0 bottom-0 bg-black bg-opacity-70 z-50" @click.self="$emit('update:isShowPopup', false)">
    <div class="relative flex flex-col bg-gray-600 w-5/12 h-auto p-5 mt-20 mx-auto rounded-md popup">
      <div><span class="text-3xl mt-0">Client Secret</span></div>
      <a class="close absolute text-gray-300 
        top-5 right-7 text-3xl font-bold no-underline cursor-default 
        hover:text-white"
        @click.self="$emit('update:isShowPopup', false)">&times;</a>
      <div class="flex flex-col w-full h-full items-start mt-10">
        <div class="text-sm text-red-600">Please keep this information safe, exposure will cause security problems.</div>
        <div class="relative flex w-full h-14 items-center">
          <div class="relative flex items-center h-14 mr-2 w-36"><span class="absolute right-0">Client ID :</span></div>
          <label class="flex items-center w-full p-2 h-4">{{ CLIENT_ID }}</label>
        </div>
        <div class="relative flex h-auto w-full items-center">
          <div class="relative flex self-start mr-2 w-36 pt-2"><span class="absolute right-0">Client Secret :</span></div>
          <label id="secret" class="flex items-center p-2 w-full h-full break-all">{{ CLIENT_SECRET }}</label>
        </div>
        <div class="relative flex h-14 w-full items-center">
          <div class="absolute right-0 top-4">
            <button class="ml-3 mr-3 bg-transparent border-2 rounded-2xl border-gray-700 p-2 hover:bg-gray-700">reload</button>
            <button class="ml-3 mr-3 bg-transparent border-2 rounded-2xl border-gray-700 p-2 hover:bg-gray-700">copy</button>
            <button class="ml-3 mr-3 bg-transparent border-2 rounded-2xl border-gray-700 p-2 hover:bg-gray-700">download</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'

export default defineComponent({
  name: 'MessagePopup',
  props: ['isShowPopup', 'data'],
  setup(props) {
    const { isShowPopup } = toRefs(props);
    const { data } = props;

    return {
      isShowPopup,
      ...toRefs(data),
    };
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
