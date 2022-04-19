<template>
  <div :class="{ show: isShowNotify.data }" class="absolute notify-popup top-0 right-0 z-50">
    <div class="w-56 min-h-0 max-h-48 absolute top-11 md:top-14 right-1 rounded-lg bg-green-300 overflow-y-auto">
      <ul class="p-2 w-full">
        <li v-for="(notify, index) in notifys" :key="index">
          <div class="flex pb-4">
            <a class="flex w-full overflow-hidden" :href="'/notify/message/' + notify.id">
              <i class="couple-icon notify-message smile before:mt-2 before:bg-cover before:bg-no-repeat before:w-5 before:h-5 before:mr-2"></i>
              <div class="overflow-hidden">
                <div class="font-bold whitespace-nowrap overflow-ellipsis w-full overflow-hidden" :title="notify.title">
                  {{notify.title}}
                </div>
                <div class="items-center text-xs font-semibold text-gray-600 overflow-ellipsis w-full overflow-hidden">
                  {{notify.message}}
                </div>
                <div class="flex text-xs text-gray-500 mt-3 font-light w-full">
                  <div class="">{{notify.date}}</div>
                  <div class="absolute right-2">{{'@' + notify.from}}</div>
                </div>
              </div>
            </a>
          </div>
        </li>
      </ul>
    </div>
    <div class="absolute top-9 md:top-11 right-2 triangle"></div>
  </div>
</template>

<script>
import { reactive } from '@vue/reactivity';

export default {
  name: "DropDown",
  props: ["isShowNotify"],
  setup(props) {
    const isShowNotify = props.isShowNotify;
    const notifys = reactive([{
      id: '111',
      from: 'System',
      title: '好友申請',
      message: '有人加了您1234asdfasadfdsfsdasdfasdfasdfsadffasd',
      date: '2022-01-10 08:52'
    }, {
      id: '222',
      from: 'System',
      title: '好友申請',
      message: '有人加了您2345',
      date: '2022-01-10 08:52'
    }, {
      id: '333',
      from: 'System',
      title: '好友申請',
      message: '有人加了您3456',
      date: '2022-01-10 08:52'
    }]);

    return {
      // setIsShowNotify,
      isShowNotify,
      notifys
    };
  }
}
</script>

<style scoped>
.notify-popup.show {
  transform: translate(0px, 0px);
  transition: 0.5s;
}
.notify-popup {
  transition: 0.5s;
  transform: translate(1000px, -1000px);
}

.triangle {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 1rem 1rem 1rem;
  border-color: transparent transparent rgba(110, 231, 183) transparent;
}

.couple-icon:before {
  content: "";
  display: flex;
  justify-content: center;
  align-items: center;
}

.couple-icon.smile::before {
  background-image: url("@/assets/images/svg/fi-rr-laugh.svg");
}

.couple-icon.notify-message::before {
    opacity: 0.5;
}

::-webkit-scrollbar {
  background: rgba(110, 231, 183);
  border-radius: 999px;
  width: 5px;
}

::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.2);
  border-radius: 999px;
}

</style>