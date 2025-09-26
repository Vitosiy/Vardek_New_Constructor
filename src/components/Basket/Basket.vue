<template>
  <div class="basket">
    <div class="basket-header">
      <div v-if="loading" class="basket__loader"></div>
      <div class="basket-header__title">Корзина</div>
      <ClosePopUpButton
        class="basket-header__close-btn" 
        @click="closePopup" 
      />
    </div>
    <div class="basket-container">
      <!-- {{ loading }} -->
      <!-- {{ mainItems }} -->
      <div class="basket-container__main-table">
        <BasketTable
          :key="basketUpdateKey"
          :items="mainItems"
          type="main"
        />
      </div>
      <div class="basket__additional-table">
        <BasketTable
          :key="basketUpdateKey + 'additional'"
          title="Дополнительные товары (Не отображаются на эскизе)"
          :items="additionalItems"
          type="additional"
        />
      </div>
    </div>

    <div class="basket-footer">
      <div class="basket-footer-info">
        <p class="basket__sum">Общая стоимость: <span>{{ totalPrice }}</span></p>
        <p class="basket__sum-no">Общая стоимость без скидки: <span>{{ totalOldPrice }}</span></p>
      </div>
      <div class="basket-footer-buttons">
        <!-- <div class="basket__error">
          <p class="error__title"></p>
          <p class="error__title">1 Ошибка</p>
        </div> -->
        <button class="basket__close" @click="closePopup">Закрыть</button>
        <button class="basket__save">Печать</button>
        <button class="basket__order" @click="setInvoice">Оформить заказ</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePopupStore } from '@/store/appStore/popUpsStore';
import ClosePopUpButton from '../ui/svg/ClosePopUpButton.vue';
import BasketTable from "./BasketTable.vue"
import { useBasketStore } from '@/store/appStore/useBasketStore';
import { computed, onMounted, ref, watch } from 'vue';
import { useEventBus } from '@/store/appliction/useEventBus';

const { basketData, syncBasket, syncInvoce} = useBasketStore();
const popupStore = usePopupStore();
const items = ref<any>(null);
const eventBus: ReturnType<typeof useEventBus> = useEventBus()
const loading = ref(true)
// Ключ для принудительной перерисовки
const basketUpdateKey = ref(0);

const closePopup = () => {
  popupStore.closePopup('basket');
};

// Вычисляемые свойства для данных корзины
const mainItems = computed(() => {
  return items.value?.products?.filter((item: any) => item.product?.TYPE === "scene") || [];
});

const additionalItems = computed(() => {
  return items.value?.products?.filter((item: any) => item.product?.TYPE === "catalog") || [];
});

const totalPrice = computed(() => {
  return items.value?.basket?.sumFormat ?? 0;
});

const totalOldPrice = computed(() => {
  return items.value?.basket?.sumFormatOld ?? 0;
});

const setInvoice = () => {
  console.log('basketData', basketData);
  syncInvoce();
};

// Функция для обновления данных корзины
const updateBasketData = async () => {
  try {
    const basketData = await syncBasket();
    items.value = basketData;
    basketUpdateKey.value++; // Принудительно обновляем ключ для перерисовки
    loading.value = false;
  } catch (error) {
    console.error('Ошибка при обновлении корзины:', error);
  }
};

onMounted(() => {
  console.log('basketData', basketData);
  // Синхронизируем корзину при открытии попапа
  updateBasketData();
});


// Следим за изменениями в хранилище корзины
watch(() => useBasketStore().basketData, (newValue) => {
  console.log('Basket data changed:', newValue);
  items.value = newValue;
  basketUpdateKey.value++;
  loading.value = false;
}, { deep: true });



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
    padding: 15px;
    width: 100%;
    box-sizing: border-box;
    max-height: 80vh; 
    height: 100%;
    max-width: 1447px;
    width: 90vw;
    .basket-header {
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      width: 100%;
      &__title {
        font-weight: 600;
        font-size: 32px;
        line-height: 100%;
        letter-spacing: 0%;
        text-align: center;
      }
      &__close-btn {
        fill: #A3A9B5;
        position: absolute;
        right: 0;
        top: 10px;
        cursor: pointer;
      }
    }

    .basket-container {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      &__main-table {
        margin-bottom: 2rem;
        .basket-table {
          background-color: #F6F5FA;
          border-radius: 15px;
        }
      }
    }

    .basket-footer {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      
      @media (max-width: 768px) {
        flex-direction: column-reverse;
        align-items: stretch;
      }

      &-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      &-buttons {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        
        @media (max-width: 768px) {
          width: 100%;
          justify-content: space-between;
        }

        .basket__error {
          display: flex;
          align-items: center;
          margin-right: 30px;
          color: $red;
          
          @media (max-width: 768px) {
            width: 100%;
            margin-right: 0;
            margin-bottom: 10px;
            justify-content: center;
          }
        }

        button {
          width: 114px;
          height: 50px;
          background: $stroke;
          border-radius: 15px;
          border: none;
          
          @media (max-width: 768px) {
            flex: 1;
            min-width: 100px;
          }
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
          
          @media (max-width: 768px) {
            width: auto;
            flex: 1;
          }
        }

        .basket__order {
          width: 174px;
          color: $white;
          font-weight: 600;
          background-color: $red;
          
          @media (max-width: 768px) {
            width: auto;
            flex: 2;
          }
        }
      }
    }

    &__loader {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      position: absolute;
      top: 1px;
      left: 0;
      animation: rotate 1s linear infinite
    }

    &__loader::before , &__loader::after {
      content: "";
      box-sizing: border-box;
      position: absolute;
      inset: 0px;
      border-radius: 50%;
      border: 5px solid #da444c73;
      animation: prixClipFix 2s linear infinite ;
    }

    &__loader::after{
      border-color: #DA444C;
      animation: prixClipFix 2s linear infinite , rotate 0.5s linear infinite reverse;
      inset: 6px;
    }
  }

  @keyframes rotate {
    0%   {transform: rotate(0deg)}
    100%   {transform: rotate(360deg)}
  }

  @keyframes prixClipFix {
    0%   {clip-path:polygon(50% 50%,0 0,0 0,0 0,0 0,0 0)}
    25%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 0,100% 0,100% 0)}
    50%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,100% 100%,100% 100%)}
    75%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 100%)}
    100% {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 0)}
  }

</style>

