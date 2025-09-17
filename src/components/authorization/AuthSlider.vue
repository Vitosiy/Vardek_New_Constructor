<template>
  <div class="auth-slider">
    <div class="auth-slider__container">
      <ImageSwiper 
        :images="images"
        :autoplay="{ delay: 3000, disableOnInteraction: false }"
        class="auth-slider__swiper"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNewsStore } from '@/store/appStore/useNewsStore'
import ImageSwiper from '@/components/ImageSwiper/ImageSwiper.vue'

const newsStore = useNewsStore()
const images = ref([])

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

onMounted(() => {
  fetchNews()
})

defineExpose({
  images,
  fetchNews
})
</script>

<style lang="scss" scoped>
.auth-slider {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  
  &__container {
    width: 100%;
    height: 100%;
    max-width: 100%;
    margin: 0 auto;
  }
  
  &__swiper {
    width: 100%;
    height: 100%;
    border-radius: 16px;
    overflow: hidden;
  }
}

@media (max-width: 992px) {
  .auth-slider {
    display: none;
  }
}
</style>