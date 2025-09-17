<template>
  <div class="auth-slider" >
    <ImageSwiper 
      :images="images"
      v-if="!newsStore.isLoading"
      :autoplay="{ delay: 3000, disableOnInteraction: false }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue'
import { useNewsStore } from '@/store/appStore/useNewsStore'
import ImageSwiper from '@/components/ImageSwiper/ImageSwiper.vue'

const newsStore = useNewsStore();
const images = ref([]) as Ref<{name: string; src: string; alt: string}[]>;

const fetchNews = async () => {
  await newsStore.fetchNews().then(() => {
    images.value = newsStore.newsList.map(item => {
      return {
        name: item.NAME,
        src: item.PREVIEW_PICTURE,
        alt: item.PREVIEW_TEXT,
      }
    })
  })
}

defineExpose({
  images,
  fetchNews
})
</script>

<style lang="scss" scoped>
  .auth-slider {
    max-width: 100%;
    height: 100%;
    margin: 0 auto;
    background-image: url("@/assets/img/auth-bg-img.jpg");
    width: 100%;
    height: 100%;
    background-size:cover;
    border-radius: 16px;
  }
</style>

