<template>
  <div class="auth-form">
    <img 
      src="@/assets/img/logo.png" 
      alt="Логотип компании" 
      class="auth-form__logo" 
    />
    
    <form 
      class="auth-form__form"
      @submit.prevent="handleSubmit"
    >
      <h1 class="auth-form__title">Авторизация</h1>
      
      <div class="auth-form__input-group">
        <label 
          for="login" 
          class="auth-form__input-placeholder"
          :class="loginLabelTop ? 'active' : ''"
        >
          Логин
        </label>
        <input 
          id="login"
          v-model="form.login"
          name="login" 
          type="text" 
          class="auth-form__input"
          autocomplete="username"
          required
          @focus="handleFocus('login')"
          @blur="handleBlur('login')"
        />
        <UserSVG 
          class="auth-form__icon" 
          aria-label="Иконка пользователя" 
        />
      </div>

      <div class="auth-form__input-group">
        <label 
          for="password" 
          class="auth-form__input-placeholder"
          :class="{ 'active' : passwordLabelTop}"
        >
          Пароль
        </label>
        <input 
          id="password"
          v-model="form.password"
          name="password" 
          :type="showPassword ? 'text' : 'password'" 
          class="auth-form__input"
          autocomplete="current-password"
          required
          @focus="handleFocus('password')"
          @blur="handleBlur('password')"
        />

        <EyeCloseSVG 
          class="auth-form__icon auth-form__eye-icon" 
          aria-label="Иконка глаза"
          @click="togglePasswordVisibility"
          v-if="!showPassword"
        />
        <EyeOpenSVG 
          class="auth-form__icon auth-form__eye-icon" 
          aria-label="Иконка глаза"
          @click="togglePasswordVisibility"
          v-if="showPassword"
        />
      </div>
      
      <button 
        type="submit" 
        class="auth-form__button"
        :disabled="authStore.isSubmitting"
      >
        <span v-if="!authStore.isSubmitting">Войти</span>
        <span v-else>Отправка...</span>
      </button>
      
      <div v-if="authStore.error.isError">
        <p class="text-error" v-html="authStore.error.message"></p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/store/appStore/authStore'
import EyeOpenSVG from '@/components/ui/svg/auth/EyeOpenSVG.vue'
import EyeCloseSVG from '@/components/ui/svg/auth/EyeCloseSVG.vue'
import UserSVG from '@/components/ui/svg/auth/UserSVG.vue'

const authStore = useAuthStore();

const form = ref({
  login: '',
  password: ''
})

const loginLabelTop = ref(false)
const passwordLabelTop = ref(false)
const showPassword = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
  setTimeout(() => showPassword.value = false, 500)
}

const handleFocus = (field: 'login' | 'password') => {
  if (field === 'login') loginLabelTop.value = true
  if (field === 'password') passwordLabelTop.value = true
}

const handleBlur = (field: 'login' | 'password') => {
  if (field === 'login') loginLabelTop.value = !!form.value.login
  if (field === 'password') passwordLabelTop.value = !!form.value.password
}

const handleSubmit = async () => {
  try {
    await authStore.login({
      login: form.value.login,
      password: form.value.password
    })
  } catch (error) {
    console.error('Ошибка авторизации:', error)
  }
}

// Watchers
watch(() => form.value.login, (newVal) => {
  loginLabelTop.value = !!newVal
})

watch(() => form.value.password, (newVal) => {
  passwordLabelTop.value = !!newVal
})

defineExpose({
  form,
  loginLabelTop,
  passwordLabelTop,
  showPassword
})
</script>

<style lang="scss" scoped>
.auth-form {
  --input-height: 60px;
  --border-radius: 15px;
  --transition-duration: 0.3s;
  
  width: 100%;
  max-width: 441px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &__logo {
    width: 154px;
    margin-bottom: 40px;
    align-self: flex-start;
  }
  
  &__form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  &__title {
    font-size: 44px;
    margin-bottom: 20px;
    color: $black;
    text-align: left;
  }
  
  &__input-group {
    width: 100%;
    position: relative;
    
    .auth-form__input {
      width: 100%;
      height: var(--input-height);
      padding: 0 40px 0 20px;
      font-size: 18px;
      background: #f6f5fa;
      border: 1px solid $dark-grey;
      border-radius: var(--border-radius);
      box-sizing: border-box;
      transition: border-color var(--transition-duration);
      
      &:focus {
        outline: none;
        border-color: $red;
      }
    }

    .auth-form__input-placeholder {
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
      color: $dark-grey;
      pointer-events: none;
      transition: all var(--transition-duration);
      
      &.active {
        top: 0;
        transform: translateY(-50%);
        font-size: 12px;
        background: white;
        padding: 0 5px;
      }
    }
    
    .auth-form__input:focus + .auth-form__input-placeholder,
    .auth-form__input:not(:placeholder-shown) + .auth-form__input-placeholder {
      top: 0;
      transform: translateY(-50%);
      font-size: 12px;
      background: white;
      padding: 0 5px;
    }
    
    .auth-form__icon {
      position: absolute;
      width: 20px;
      height: 20px;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      color: $dark-grey;
    }
  }
  
  &__button {
    width: 100%;
    margin: 10px 0 20px 0;
    border: none;
    border-radius: var(--border-radius);
    height: 50px;
    font-size: 16px;
    background-color: $red;
    color: white;
    cursor: pointer;
    transition: background-color var(--transition-duration);
    
    &:hover:not(:disabled) {
      background-color: darken($red, 10%);
    }
    
    &:active:not(:disabled) {
      transform: scale(0.98);
    }
    
    &:disabled {
      background-color: lighten($red, 20%);
      cursor: not-allowed;
    }
  }
  
  &__eye-icon {
    cursor: pointer;
    left: auto;
    right: 15px;
    
    &:hover {
      opacity: 0.8;
    }
  }
}

.text-error {
  color: $red;
  text-align: center;
  font-size: 14px;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .auth-form {
    padding: 0 20px;
    
    &__title {
      font-size: 36px;
    }
    
    &__logo {
      margin-bottom: 30px;
    }
  }
}
</style>