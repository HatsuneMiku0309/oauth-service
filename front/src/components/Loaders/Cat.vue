<template>
  <div class="z-50 absolute">
    <div class="box h-full">
      <div class="cat">
        <div class="cat__body"></div>
        <div class="cat__body"></div>
        <div class="cat__tail"></div>
        <div class="cat__head"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CatLoader',
  setup() {
    
  },
}
</script>

<style scoped>
.cat {
  position: relative;
  width: 100%;
  max-width: 20em;
  overflow: hidden;
  @apply bg-gray-800;
}

.cat::before {
  content: "";
  display: block;
  padding-bottom: 100%;
}
/* .cat:hover > * {
  -webkit-animation-play-state: paused;
          animation-play-state: paused;
} */
.cat:active > * {
  -webkit-animation-play-state: running;
          animation-play-state: running;
}

.cat__body, .cat__tail, .cat__head {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  -webkit-animation: rotating 2.79s cubic-bezier(0.65, 0.54, 0.12, 0.93) infinite;
          animation: rotating 2.79s cubic-bezier(0.65, 0.54, 0.12, 0.93) infinite;
}

.cat__body::before, .cat__tail::before, .cat__head::before {
  content: "";
  position: absolute;
  width: 50%;
  height: 50%;
  background-size: 200%;
  background-repeat: no-repeat;
  background-image: url("@/assets/images/cute-cat.png");
}

.cat__head::before {
  top: 0;
  right: 0;
  background-position: 100% 0%;
  transform-origin: 0% 100%;
  transform: rotate(80deg);
}

.cat__tail {
  -webkit-animation-delay: 0.2s;
          animation-delay: 0.2s;
}

.cat__tail::before {
  left: 0;
  bottom: 0;
  background-position: 0% 100%;
  transform-origin: 100% 0%;
  transform: rotate(-30deg);
}

.cat__body {
  -webkit-animation-delay: 0.1s;
          animation-delay: 0.1s;
}

.cat__body:nth-of-type(2) {
  -webkit-animation-delay: 0.2s;
          animation-delay: 0.2s;
}

.cat__body::before {
  right: 0;
  bottom: 0;
  background-position: 100% 100%;
  transform-origin: 0% 0%;
}

@-webkit-keyframes rotating {
  from {
    transform: rotate(720deg);
  }
  to {
    transform: none;
  }
}

@keyframes rotating {
  from {
    transform: rotate(720deg);
  }
  to {
    transform: none;
  }
}

.box {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @apply bg-gray-800;
}

.intro {
  width: 90%;
  max-width: 36rem;
  padding-bottom: 1rem;
  margin: 0 auto 1em;
  padding-top: 0.5em;
  font-size: calc(1rem + 2vmin);
  text-transform: capitalize;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.3);
  text-align: center;
}

.intro small {
  display: block;
  opacity: 0.5;
  font-style: italic;
  text-transform: none;
}

.info {
  margin: 0;
  padding: 1em;
  font-size: 0.9em;
  font-style: italic;
  font-family: serif;
  text-align: right;
  opacity: 0.5;
}

.info a {
  color: inherit;
}
</style>