<template>
  <div class="auth-page">
    <div class="auth-page__left">
      <img src="@/assets/img/logo.png" alt="Логотип" class="auth-page__logo" />
      <div class="auth-page__box">
        <form class="auth-page__form">
          <h1 class="auth-page__title">Авторизация</h1>
          <div class="auth-page__input-group">
            <input type="text" class="auth-page__input" />
            <p class="auth-page__input-placeholder">Логин</p>
            <svg class="auth-page__icon" viewBox="0 0 20 20">
              <!-- SVG иконка для поля логина -->
            </svg>
          </div>
          <div class="auth-page__input-group">
            <input type="password" class="auth-page__input" />
            <p class="auth-page__input-placeholder">Пароль</p>
            <svg class="auth-page__icon" viewBox="0 0 20 20">
              <!-- SVG иконка для поля пароля -->
            </svg>
          </div>
          <button type="submit" class="auth-page__button">Войти</button>
          <div class="auth-page__register">
            <div class="regiser__stroke"></div>
            <a href="#" class="auth-page__link">Забыли пароль?</a>
            <div class="regiser__stroke"></div>
          </div>
        </form>
        <p class="auth-page__register-text">Нет аккаунта? <a href="#" class="auth-page__link">Зарегистрироваться</a></p>
      </div>
    </div>
    <div class="auth-page__right">
      <!-- <img src="image.png" alt="Картинка" class="auth-page__image" /> -->
    </div>
  </div>
</template>

<script></script>

<style lang="scss" scoped>
.auth-page {
  width: 100%;
  height: 100vh;
  display: flex;
  background: url("@/assets/img/background.png");
  &__left {
    width: 757px;
    display: flex;
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
        width: 441px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 10px;
        .auth-page__title {
          font-size: 44px;
          margin-bottom: 20px;
        }
        .auth-page__input-group {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          .auth-page__input {
            width: 100%;
            height: 60px;
            padding: 0 40px 0 20px;
            font-size: 18px;
            background: #f6f5fa;
            border: 1px solid $dark-grey;
            border-radius: 15px;
            box-sizing: border-box;
          }

          .auth-page__input-placeholder {
            position: absolute;
            left: 20px;
            font-size: 14px;
            color: $dark-grey;
            pointer-events: none;
          }
          .auth-page__icon {
            position: absolute;
            width: 20px;
            height: 20px;
            right: 10px;
          }
        }
      }
    }

    .auth-page__button {
      width: 100%;
      margin: 10px 0 20px 0;
      border: none;
      border-radius: 15px;
      height: 50px;
      font-size: 16px;
      background-color: $red;
      color: white;
      font-size: 16px;
      cursor: pointer;
    }

    .auth-page__register {
      display: flex;
      align-items: center;
      gap: 15px;
      .auth-page__link {
        font-size: 16px;
        color: $dark-grey;
      }
      .regiser__stroke {
        width: 100%;
        max-width: 143px;
        height: 1px;
        background: $dark-grey;
      }
    }
    .auth-page__register-text {
      color: $dark-grey;
      .auth-page__link {
        position: relative;
        color: $black;
        background-image: $black;
        font-size: 16px;
        &:after {
          content: "";
          width: 100%;
          position: absolute;
          bottom: 0;
          left: 0;
          height: 0;
          border-bottom: 1px solid $black;
        }
      }
    }
  }

  &__right {
    width: 1163px;
    display: flex;
    justify-content: center;
    align-items: center;

    &__image {
      width: 100%;
      height: auto;
    }
  }
}
</style>
