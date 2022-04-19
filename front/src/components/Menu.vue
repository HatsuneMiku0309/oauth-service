<template>
  <div class="relative flex flex-row flex-grow-0 flex-shrink-0 w-full justify-around h-14 bg-green-300 items-center">
    <router-link v-for="(item, index) in menuList" :key= "index" @click="selectMenu(index)" :class="{ active: item.isActive }" class="relative flex justify-center items-end p-2" :to="item.to">
      <i :class="{ [item.icon]: true, active: item.isActive }" class="relative block z-50 couple-icon before:bg-cover before:bg-no-repeat before:w-7 before:h-7 md:before:w-8 md:before:h-8 before:relative before:inline-block"></i>
      <span :class="{ active: item.isActive }" class="absolute text text-lg">{{item.title}}</span>
    </router-link>
    <div class="
      indicator bg-green-300 w-16 h-16 rounded-full border-8 border-white
      before:w-7 before:h-7 before:absolute before:bg-green-300
      after:w-7 after:h-7 after:absolute after:bg-green-300
    "></div>
  </div>
</template>

<script>
import { reactive } from 'vue';

export default {
  setup() {
    let menuList = reactive([
      { icon: 'home', title: 'Home', to: '/', isActive: true },
      { icon: 'fate', title: 'Fate', to: '/fate', isActive: false },
      { icon: 'chat', title: 'Chat', to: '/', isActive: false },
      { icon: 'date', title: 'Date', to: '/', isActive: false },
      { icon: 'me', title: 'Me', to: '/', isActive: false }
    ]);
    menuList.forEach((item) => {
      item.isActive = false;
      if (document.location.pathname === item.to) {
        item.isActive = true;
      }
    })
    const selectMenu = (index) => {
      menuList.forEach(item => {
        item.isActive = false;
      });
      menuList[index].isActive = true;
    }

    return {
      menuList,
      selectMenu
    };
  },
}
</script>

<style scoped>
div a:nth-child(1).active ~ .indicator {
  transform: translateX(calc((100vw / 5) * -2));
}

div a:nth-child(2).active ~ .indicator {
  transform: translateX(calc((100vw / 5) * -1));
}

div a:nth-child(3).active ~ .indicator {
  transform: translateX(calc((100vw / 5) * 0));
}

div a:nth-child(4).active ~ .indicator {
  transform: translateX(calc((100vw / 5) * 1));
}

div a:nth-child(5).active ~ .indicator {
  transform: translateX(calc((100vw / 5) * 2));
}

.indicator {
  position: absolute;
  top: -55%;
  transition: 0.5s;
  transform: translateX(-150px);
}

.indicator::before {
  content: '';
  top: 1.43rem;
  left: -1.85rem;
  border-top-right-radius: 1.75rem;
  /* box-shadow: 0 -0.6rem 0 0 white; */
}

.indicator::after {
  content: '';
  top: 1.43rem;
  right: -1.85rem;
  border-top-left-radius: 1.75rem;
  /* box-shadow: 0 -0.6rem 0 0 white; */
}

.couple-icon.active {
  transform: translateY(-30px);
}

.text {
  opacity: 0;
  top: 50%;
  transition: 0.5s;
}

.active.text {
  opacity: 1;
}

.couple-icon {
  transform: translateY(0px);
  transition: 0.5s;
}

.couple-icon:before {
  content: "";
  display: flex;
  justify-content: center;
  align-items: center;
}

.couple-icon.home::before {
  background-image: url("@/assets/images/svg/fi-rr-home.svg");
}

.couple-icon.fate::before {
  background-image: url("@/assets/images/svg/fi-rr-following.svg");
}

.couple-icon.chat::before {
  background-image: url("@/assets/images/svg/fi-rr-comment-heart.svg");
}

.couple-icon.date::before {
  background-image: url("@/assets/images/svg/fi-rr-hand-holding-heart.svg");
}

.couple-icon.me::before {
  background-image: url("@/assets/images/svg/fi-rr-comment-user.svg");
}

::-webkit-scrollbar {
  display: none;
}
</style>