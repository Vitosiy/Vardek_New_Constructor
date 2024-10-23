<template>
  <div>
    <div class="basket">
      <div class="basket__title">Корзина</div>
      <div class="basket__container">
        <div class="basket-inlist">
          <div class="basket-inlist-names">
            <div class="names__title">Фото</div>
            <div class="names__title-big">Наименование</div>
            <div class="names__title">Количество</div>
            <div class="names__title">Цена</div>
            <div class="names__title">Сумма</div>
            <div class="names__title">Сумма без скидки</div>
            <div class="names__title"></div>
          </div>
          <div class="basket-inlist-table">
            <div v-for="(item, index) in 5" :key="index" class="basket-item">
              <div class="basket-item-image">
                <img class="" src="https://via.placeholder.com/120x120" />
                <!-- <div class="">p</div> -->
              </div>

              <div class="basket-item-text" style="width: 500px">
                <span class="text__title">2000187991625 Столешница Орех Лион, Срез дерева</span>
                <div class="text-item-list">
                  <p>Услуга:</p>
                  <ul>
                    <li>Левый скос</li>
                  </ul>
                </div>
                <div class="text-item-red">
                  <p>Цвет фасада 1: <span>Матовый (НЕДОСТУПНО)</span></p>
                </div>
              </div>
              <div class="basket-item-amount">
                -
                <input type="text" class="amount__input" />
                +
              </div>
              <p class="basket-item-cost__text">12 348 руб.</p>
              <p class="basket-item-cost__text">12 348 руб.</p>
              <p class="basket-item-cost__text">12 348 руб.</p>
              <p class="basket-item-edit">svgd svgd</p>
            </div>
          </div>
        </div>
      </div>
      <div class="basket-footer">
        <div class="basket-footer-info">
          <p class="basket__sum">Общая стоимость: <span>12 348 руб.</span></p>
          <p class="basket__sum-no">Общая стоимость без скидки: <span>12 348 руб.</span></p>
        </div>
        <div class="basket-footer-buttons">
          <div class="basket__error">
            <p class="error__title"></p>
            <p class="error__title">1 Ошибка</p>
          </div>
          <button class="basket__close" @click="closePopup">Закрыть</button>
          <button class="basket__save">Печать</button>
          <button class="basket__order">Оформить заказ</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { usePopupStore } from '@/store/appStore/popUpsStore';

const popupStore = usePopupStore();

const closePopup = () => {
  popupStore.closePopup('basket');
};
</script>
<style lang="scss" scoped>
.basket {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  background: white;
  border-radius: 15px;
  &__title {
    text-align: center;
    color: $black;
    font-size: 32px;
    font-weight: 600;
    word-wrap: break-word;
  }
  &__container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 20px 10px;
    background: #f6f5fa;
    border-radius: 15px;
    gap: 30px;
    .basket-inlist {
      height: 70vh;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 10px;
      overflow-y: auto;
      &-names {
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        padding-left: 10px;
        padding-right: 10px;
        gap: 20px;
        .names__title {
          width: 130px;
          color: $dark-grey;
          font-size: 15px;
          font-family: Gilroy;
          font-weight: 400;
          word-wrap: break-word;
        }
        .names__title-big {
          width: 500px;
          color: $dark-grey;
          font-size: 15px;
          font-family: Gilroy;
          font-weight: 400;
          word-wrap: break-word;
        }
      }
      &-table {
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        display: flex;
        .basket-item {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          padding: 15px 10px;
          border-top: 1px $stroke solid;
          gap: 20px;
          &-image {
            width: 130px;
            height: 130px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            background: white;
            border-radius: 10px;
          }
          &-text {
            display: flex;
            flex-direction: column;
            .text__title {
              font-size: 15px;
              font-weight: 600;
            }
            .text__info {
              display: flex;
              align-items: center;
              gap: 10px;
              &__result {
              }
            }
          }
          &-amount {
            width: 130px;
            display: flex;
            align-items: center;
            gap: 10px;
            .amount__input {
              width: 38px;
              height: 38px;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              background: none;
              border-radius: 10px;
              border: 1px solid $stroke;
            }
          }
          &-cost__text {
            width: 130px;
            font-weight: 500;
            font-size: 15px;
          }
          &-edit {
            width: 94px;
          }
        }
      }
      &::-webkit-scrollbar {
        width: 3px;
        border-radius: 15px;
      }

      &::-webkit-scrollbar-track {
      }
      
      &::-webkit-scrollbar-thumb {
        background-color: $dark-grey;
        transform: translateX(-5px);
        box-shadow: inset 0 0 1px $dark-grey;
        border-radius: 15px;

      }
    }
  }
  .basket-footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    &-buttons {
      display: flex;
      align-items: center;
      gap: 10px;
      .basket__error {
        display: flex;
        align-items: center;
        margin-right: 30px;
        color: $red;
      }
      button {
        width: 114px;
        height: 50px;
        background: $stroke;
        border-radius: 15px;
        border: none;
      }
      .basket__close {
        color: $strong-grey;
        font-weight: 600;
      }
      .basket__save {
        width: 132px;
        color: $white;
        font-weight: 600;
        background-color: $black;
      }
      .basket__order {
        width: 174px;
        color: $white;
        font-weight: 600;
        background-color: $red;
      }
    }
  }
}
</style>
