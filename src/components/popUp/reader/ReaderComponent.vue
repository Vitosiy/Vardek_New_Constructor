
<script lang="ts" setup>
// @ts-nocheck 31

import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/swiper-bundle.css'
import { Pagination, Navigation } from 'swiper/modules'
// Данные для слайдера и видео
const videoUrl = ref('path-to-video.mp4')
const images = ref([
  'path-to-image1.jpg',
  'path-to-image2.jpg',
  'path-to-image3.jpg'
])
</script>

<template>
  <div class="reader">
    <div class="reader-imtext">
      <img src="@/assets/img/read-img.png" class="reader-imtext__image" />
      <p class="reader-text">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
        reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
        deserunt mollit anim id est laborum.Lorem
        ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
        aliqua. Ut enim ad minim veniam, quis
        nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
    </div>
    <swiper v-if="images.length" :modules="[Pagination, Navigation]" navigation pagination class="reader-slider">
      <swiper-slide v-for="(image, index) in images" :key="index">
        <img :src="image" alt="Slide image" class="slide-image" />
      </swiper-slide>
    </swiper>
  </div>
    <p class="reader-text">
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
      sint occaecat cupidatat non proident,
      sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing
      elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
      ex ea commodo consequat. Duis aute irure
      dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui
      officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
      eiusmod tempor incididunt ut labore et dolore
      magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat. Duis aute irure dolor in
      reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
      non proident, sunt in culpa qui officia
      deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
      incididunt ut labore et dolore magna
      aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
      consequat.
    </p>
    <div class="reader-video">
      <!-- <video
        controls
        :src="videoUrl"
        poster="path-to-poster.jpg"
        class="video-player"
      ></video> -->
    </div>
</template>

<style lang="scss" scoped>
.reader {
  display: flex;
  flex-direction: column;
  gap: 15px;

  .reader-text {
    font-size: 16px;
  }

  .reader-imtext {
    display: flex;
    gap: 20px;

    &__image {
      max-width: 260px;
    }
  }

  .reader-slider {
    width: 100%;
    height: 200px;
    .my-swiper {
      width: 100%;
      max-width: 600px;
    }

    .slide-image {
      width: 100%;
      border-radius: 8px;
    } 
  }
}
</style>
