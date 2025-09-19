<template>
  <main class="auth-page">

    <div class="auth-page__left">
      <AuthForm ref="authForm" />
    </div>
    
    <div class="auth-page__right">
      <AuthSlider ref="authSlider" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import AuthForm from '@/components/authorization/AuthForm.vue'
import AuthSlider from '@/components/authorization/AuthSlider.vue'
import { useAuthStore } from '@/store/appStore/authStore'
import { useAppData } from '@/store/appliction/useAppData'
import { useRouter } from 'vue-router'

const authForm = ref()
const authSlider = ref()
const isLoading = ref(true);
const authStore = useAuthStore();
const appDataStore = useAppData()
const router = useRouter()

watchEffect(async () => {
  if (authStore.isAuthenticated && !appDataStore.isLoading) {
    await router.push('/2d')
  }
});

onMounted(async () => {
  try {
    await Promise.all([
      authSlider.value?.fetchNews?.()
    ])
  } catch (error) {
    console.error('Ошибка инициализации:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style lang="scss" scoped>
.auth-page {
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr 2fr;
  background: url("@/assets/img/background.png") no-repeat center/cover;
  
  &__left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    justify-self: center;
  }
  
  &__right {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }
}

@media (max-width: 992px) {
  .auth-page {
    grid-template-columns: 1fr;
    
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