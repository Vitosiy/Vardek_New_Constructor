<template>
  <main class="auth-page">
    <div class="auth-page__left">
      <AuthForm ref="authForm" />
    </div>
    
    <div class="auth-page__right">
      <AuthSlider ref="authSlider" />
    </div>

    <MainLoader v-if="isLoading" />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AuthForm from '@/components/authorization/AuthForm.vue'
import AuthSlider from '@/components/authorization/AuthSlider.vue'
import MainLoader from '@/components/ui/loader/MainLoader.vue'
import { useAppData } from '@/store/appliction/useAppData'

const authForm = ref()
const authSlider = ref()
const isLoading = ref(true)
const appDataStore = useAppData()

onMounted(async () => {
  try {
    // Инициализация приложения
    await appDataStore.initAppData()
  } catch (error) {
    console.error('Ошибка инициализации приложения:', error)
  } finally {
    isLoading.value = false
    // document.querySelector('#main-loader').style.display = 'none';
  }
})
</script>

<style lang="scss" scoped>
.auth-page {
  width: 100%;
  height: 100vh;
  display: flex;
  background: url("@/assets/img/background.png") no-repeat center/cover;
  
  &__left {
    flex: 1;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px 44px;
  }
  
  &__right {
    flex: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }
}

@media (max-width: 992px) {
  .auth-page {
    flex-direction: column;
    
    &__left {
      max-width: 100%;
      padding: 20px;
    }
    
    &__right {
      display: none;
    }
  }
}
</style>