<template>
  <!-- <magic-card class="h-screen w-screen absolute z-10"/> -->
  <div class="flex items-center">
    <div id="magic-card" @touchstart.stop.passive="touchStartHandler" @touchend.stop="touchEndHandler" class="card mt-14">
      <div class="flex flex-col w-full h-full overflow-y-hidden">
        <div class="h-full flex justify-center items-center relative">
          <img class="h-5/6 w-5/6 object-none rounded-full z-10" :src="'./images/' + post.image" alt="">
          <img class="absolute h-full w-full object-none rounded-full blur-md border-2" :src="'./images/' + post.image" alt="">
        </div>
        <span class="w-full mt-4 font-bold">{{ post.title }}</span>
        <span class="flex-grow flex-shrink w-full h-full text-sm whitespace-pre-wrap overflow-y-scroll">
          {{ post.description }}
        </span>
        <div class="flex justify-around">
          <router-link to="/"><span>details</span></router-link>
          <router-link to="/"><span>details2</span></router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'MagicCard',
  props: ['post', 'touchEnabled'],
  setup(props) {
    // 弧度
    // const RAD = 57.29577951;
    let contentElem: HTMLElement;
    let touchEndHandler, touchStartHandler;
    if (props.touchEnabled) {
      let startOffset = 0;
      let endOffset = 0;
      const move = (e: any) => {
        endOffset = e.targetTouches[0].clientX;
        let diffOffset = endOffset - startOffset;
        if (Math.abs(diffOffset) <= 40) {
          contentElem.style.transform = 'none';

          return false;
        };
        const degrees = diffOffset * 0.086;
        const rad = degrees * (Math.PI / 180);
        const xOffset = rad * 250;
        const yOffset = Math.abs(rad * 25);
        contentElem.style.transform = `rotate(${degrees}deg) translateX(${xOffset}%) translateY(-${yOffset}%)`;
        // .card-reverse {
        //     transform: rotate(-25deg) translateX(-45%) translateY(-5%);
        // }

        // .card-firward {
        //     transform: rotate(25deg) translateX(45%) translateY(-5%);
        // }


        // if (refreshStatus === RefreshStatus.doing) {
        //     endOffset = e.targetTouches[0].clientY;
        //     let diffOffset = endOffset - startOffset;
        //     if (diffOffset > 0) {
        //     contentElem.style.top = diffOffset >= 0 ? `${diffOffset }px` : '0px';
        //     contentElem.style.height = `calc(100% - ${diffOffset}px)`;
        //     }
        // }
      }
      touchStartHandler = (e: any) => {
        startOffset = e.targetTouches[0].clientX;
        endOffset = 0;
        contentElem = <HTMLElement> document.getElementById('magic-card');
        contentElem.addEventListener('touchmove', move, { passive: true });
      };
      touchEndHandler = (e: any) => {
        startOffset = 0;
        endOffset = 0;
        contentElem.removeEventListener('touchmove', move)
        contentElem.style.transform = 'none';
      };
    }

    return {
        touchStartHandler,
        touchEndHandler,
    }
  },
}
</script>

<style lang="css">
@property --rotate {
  syntax: "<angle>";
  initial-value: 132deg;
  inherits: false;
}

:root {
  --card-height: 50vh;
  --card-width: calc(var(--card-height) * 3.7);
}

@media (max-width:414px){
  :root {
    --card-height: 75vh;
    --card-width: calc(var(--card-height) * 0.5);
  }
}

.card {
  background: #191c29;
  width: var(--card-width);
  height: var(--card-height);
  padding: 3px;
  position: relative;
  border-radius: 6px;
  justify-content: center;
  align-items: center;
  text-align: center;
  display: flex;
  font-size: 1.5em;
  color: rgb(88 199 250 / 100%);
  cursor: pointer;
}

/*
.card:hover {
  color: rgb(88 199 250 / 100%);
  transition: color 1s;
}
.card:hover:before, .card:hover:after {
  animation: none;
  opacity: 0;
}
*/

.card::before {
  content: "";
  width: 104%;
  height: 102%;
  border-radius: 8px;
  background-image: linear-gradient(
    var(--rotate)
    , #5ddcff, #3c67e3 43%, #4e00c2);
    position: absolute;
    z-index: -1;
    top: -1%;
    left: -2%;
    animation: spin 2.5s linear infinite;
}

.card::after {
  position: absolute;
  content: "";
  top: calc(var(--card-height) / 6);
  left: 0;
  right: 0;
  z-index: -1;
  height: 100%;
  width: 100%;
  margin: 0 auto;
  transform: scale(0.8);
  filter: blur(calc(var(--card-height) / 6));
  background-image: linear-gradient(
    var(--rotate)
    , #5ddcff, #3c67e3 43%, #4e00c2);
    opacity: 1;
  transition: opacity .5s;
  animation: spin 2.5s linear infinite;
}

@keyframes spin {
  0% {
    --rotate: 0deg;
  }
  100% {
    --rotate: 360deg;
  }
}
</style>
