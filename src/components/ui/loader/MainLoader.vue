<template>
  <div class="main-loader">
    <div class="main-loader__logo">
      <img src="@/assets/img/logo_vardek_mebel.png" alt="logo">
    </div>
    <div class="main-loader__container">
      <span class="main-loader__icon">
          <LoaderSVG />
      </span>
      <div class="main-loader__progresbar"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import LoaderSVG from '@/components/ui/svg/LoaderSVG.vue';
</script>

<style lang="scss" scoped>
.main-loader {
  position: fixed;
  top: 0;
  left: 0;
  background-color: #ffffff;
  background-image: url('@/assets/img/background.png');
  width: 100vw;
  height: 100vh;
  z-index: 999;

  
  &__logo {
    width: 100%;
    text-align: center;
    margin: 5rem 0;
    margin-bottom: 225px;
  }
  
  &__container {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
  }
  
  &__icon {
    display: inline-block;
    
    svg {
      animation: rotate 1.5s linear infinite;
      display: block;
    }
  }

  &__progresbar {
    position: absolute;
    bottom: -22px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 5px;
    background-color: #ECEBF1;
    border-radius: 2px;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 0;
      background-color: #131313;
      animation: progress 2.5s ease-in-out infinite;
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes progress {
  0% {
    width: 0;
    left: 0;
  }
  50% {
    width: 100%;
    left: 0;
  }
  100% {
    width: 0;
    left: 100%;
  }
}
</style>