<template>
  <main class="auth-page">
    <div class="auth-page__left">
      <img 
        src="@/assets/img/logo.png" 
        alt="Логотип компании" 
        class="auth-page__logo" 
      />
      <div class="auth-page__box">
        <form 
          class="auth-page__form"
          @submit.prevent="handleSubmit"
        >
          <h1 class="auth-page__title">Авторизация</h1>
          
          <div class="auth-page__input-group">
            <label 
              for="login" 
              class="auth-page__input-placeholder"
              :class="loginLabelTop ? 'active' : ''"
            >
              Логин
            </label>
            <input 
              id="login"
              v-model="form.login"
              name="login" 
              type="text" 
              class="auth-page__input"
              autocomplete="username"
              required
              @focus="handleFocus('login')"
              @blur="handleBlur('login')"
            />
            <UserSVG 
              class="auth-page__icon" 
              aria-label="Иконка пользователя" 
            />
          </div>

          <div class="auth-page__input-group">
            <label 
              for="password" 
              class="auth-page__input-placeholder"
              :class="{ 'active' : passwordLabelTop}"
            >
              Пароль
            </label>
            <input 
              id="password"
              v-model="form.password"
              name="password" 
              :type="showPassword ? 'text' : 'password'" 
              class="auth-page__input"
              autocomplete="current-password"
              required
              @focus="handleFocus('password')"
              @blur="handleBlur('password')"
            />

            <EyeCloseSVG 
              class="auth-page__icon auth-page__eye-icon" 
              aria-label="Иконка глаза"
              @click="togglePasswordVisibility"
              v-if="!showPassword"
            />
            <EyeOpenSVG 
              class="auth-page__icon auth-page__eye-icon" 
              aria-label="Иконка глаза"
              @click="togglePasswordVisibility"
              v-if="showPassword"
            />
          </div>
          
          <button 
            type="submit" 
            class="auth-page__button"
            :disabled="authStore.isSubmitting"
          >
            <span v-if="!authStore.isSubmitting">Войти</span>
            <span v-else>Отправка...</span>
          </button>
          
          <!-- <div class="auth-page__register">
            <div class="register__stroke"></div>
            <router-link 
              to="/forgot-password" 
              class="auth-page__link"
            >
              Забыли пароль?
            </router-link>
            <div class="register__stroke"></div>
          </div> -->
          <div v-if="authStore.error.isError">
            <p class="text-error" v-html="authStore.error.message"></p>
          </div>
        </form>
        <!-- <p class="auth-page__register-text">
          Нет аккаунта? 
          <router-link 
            to="/register" 
            class="auth-page__link"
          >
            Зарегистрироваться
          </router-link>
        </p> -->
      </div>
    </div>
    
    <div class="auth-page__right">
      <div class="auth-page__swiper">
        <ImageSwiper 
        :images="images"
        :autoplay="{ delay: 3000, disableOnInteraction: false }"
      />
      </div>
    </div>

  </main>
  <MainLoader v-if="appDataStore.isLoading" />
</template>

<script setup lang="ts">
  // @ts-nocheck
  import { ref, watch } from 'vue'
  import { useAuthStore } from '@/store/appStore/authStore'
  import ImageSwiper from '@/components/ImageSwiper/ImageSwiper.vue'
  import image1 from '@/assets/img/auth-slide-img.jpg'

  // Иконки
  import EyeOpenSVG from '@/components/ui/svg/auth/EyeOpenSVG.vue'
  import EyeCloseSVG from '@/components/ui/svg/auth/EyeCloseSVG.vue'
  import UserSVG from '@/components/ui/svg/auth/UserSVG.vue'
  import MainLoader from '@/components/ui/loader/MainLoader.vue'
  import { useAppData } from '@/store/appliction/useAppData'

  const authStore = useAuthStore();
  const appDataStore = useAppData();

  const images = ref([
    { src: image1, alt: 'Иллюстрация 1' },
    { src: image1, alt: 'Иллюстрация 2' },
    { src: image1, alt: 'Иллюстрация 3' }
  ])

  const form = ref({
    login: '',
    password: ''
  })

  const loginLabelTop = ref(false)
  const passwordLabelTop = ref(false)
  const showPassword = ref(false)

  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
    setTimeout(()=> showPassword.value = false ,500)
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
      throw new Error('Неизвестный тип ответа от сервера')
    }
  }

  // Watchers
  watch(() => form.value.login, (newVal) => {
    loginLabelTop.value = !!newVal
  })

  watch(() => form.value.password, (newVal) => {
    passwordLabelTop.value = !!newVal
  })
</script>
<style lang="scss" scoped>
  .auth-page {
    --input-height: 60px;
    --border-radius: 15px;
    --transition-duration: 0.3s;
    
    
    width: 100%;
    height: 100vh;
    display: flex;
    background: url("@/assets/img/background.png") no-repeat center/cover;
    
    &__left {
      flex: 1;
      max-width: 500px;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 44px;

      .auth-page__logo {
        width: 154px;
        margin-bottom: 159px;
      }
      
      .auth-page__box {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        
        .auth-page__form {
          width: 100%;
          max-width: 441px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 20px;
          
          .auth-page__title {
            font-size: 44px;
            margin-bottom: 20px;
            color: $black;
          }
          
          .auth-page__input-group {
            width: 100%;
            position: relative;
            
            .auth-page__input {
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

            .auth-page__input-placeholder {
              position: absolute;
              left: 20px;
              top: 50%;
              transform: translateY(-50%);
              font-size: 14px;
              color: $dark-grey;
              pointer-events: none;
              transition: all var(--transition-duration);
              &.active {
                top: 15px;
                transform: translateY(-50%);
                font-size: 12px;
              }
            }
            
            .auth-page__input:focus + .auth-page__input-placeholder,
            .auth-page__input:not(:placeholder-shown) + .auth-page__input-placeholder {
              top: 0;
              transform: translateY(-50%);
              font-size: 12px;
              background: white;
              padding: 0 5px;
            }
            
            .auth-page__icon {
              position: absolute;
              width: 20px;
              height: 20px;
              right: 20px;
              top: 50%;
              transform: translateY(-50%);
              color: $dark-grey;
            }
          }
        }
      }

      .auth-page__button {
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

      .auth-page__register {
        display: flex;
        align-items: center;
        gap: 15px;
        margin: 20px 0;
        
        .auth-page__link {
          font-size: 16px;
          color: $dark-grey;
          text-decoration: none;
          transition: color var(--transition-duration);
          
          &:hover {
            color: $red;
          }
        }
        
        .register__stroke {
          flex: 1;
          height: 1px;
          background: $dark-grey;
        }
      }
      
      .auth-page__register-text {
        color: $dark-grey;
        text-align: center;
        
        .auth-page__link {
          position: relative;
          color: $black;
          text-decoration: none;
          
          &::after {
            content: "";
            width: 100%;
            position: absolute;
            bottom: 0;
            left: 0;
            height: 0;
            border-bottom: 1px solid $black;
            transition: border-color var(--transition-duration);
          }
          
          &:hover::after {
            border-color: $red;
          }
        }
      }

      .auth-page__eye-icon {
        cursor: pointer;
        left: auto;
        right: 15px;
        
        
        &:hover {
          opacity: 0.8;
        }
      }
    }

    &__right {
      width: 100%;
      flex: 2;
      position: relative;
      // flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
      overflow-y: auto;
    }
    &__swiper {
      max-width: 100%;
      margin: 0 auto;
      background-image: url("@/assets/img/auth-bg-img.jpg");
      width: 100%;
      height: 100%;
      background-size:cover;
      border-radius: 16px;
    }
  }

  @media (max-width: 992px) {
    .auth-page {
      flex-direction: column;
      
      &__left {
        max-width: 100%;
        padding: 20px;
        
        .auth-page__logo {
          margin-bottom: 50px;
        }
      }
      
      &__right {
        display: none;
      }
    }
  }

  .text-error {
    color: $red;
    text-align: center;
  }

  </style>