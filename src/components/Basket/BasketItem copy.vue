<template>
  {{ item?.product.PROPS }}
  <div class="basket-item">
    <div class="basket-item__image">
      <img :src="`${API_URL + item?.product.PREVIEW_PICTURE}`" alt="" />
    </div>

    <div class="basket-item__name">{{ item?.product.NAME }}</div>
    <div class="basket-item__quantity">
      <button v-if="item?.product.TYPE === 'catalog'" class="basket-item__quantity-btn" @click="decrement(item.product.BASKETID, item?.product.TYPE)">-</button>
      <input type="text" :disabled="item?.product.TYPE !== 'catalog'" class="basket-item__quantity-input" v-model="item.product.quantity" @change="updateQuantity" />
      <button  v-if="item?.product.TYPE === 'catalog'"  class="basket-item__quantity-btn" @click="increment(item.product.BASKETID, item?.product.TYPE)">+</button>
    </div>

    <div class="basket-item__price">
      {{ item.product.unitPriceFormat }}
    </div>

    <div class="basket-item__total">
        {{ item.product.allPriceFormat }}
    </div>

    <div class="basket-item__old-total">
        {{ item.product.allPriceOldFormat }}
    </div>

    <div class="basket-item__action">
        <DeleteBasketButton @click="deleteProductInBusket(item.product.BASKETID, item?.product.TYPE)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBasketStore } from "@/store/appStore/useBasketStore"
import { ref } from "vue"
import DeleteBasketButton from "../ui/buttons/basket/DeleteBasketButton.vue";

  const API_URL = ref('https://dev.vardek.online');

interface Props {
  item: any
}

const props = defineProps<Props>();
const basketStore = useBasketStore();
const quantity = ref(props.item.product.quantity);

function increment(id: string, type: string) {
  quantity.value++
  updateQuantity(id, type)
}
function decrement(id: string, type: string) {
  if (quantity.value > 1) {
    quantity.value--
    updateQuantity(id, type)
  }
}
function updateQuantity(id: string, type: string) {
  // Логика обновления количества
  basketStore.updateQuantityFromBaske(id, type, quantity);
}

const deleteProductInBusket = (id: string, type: string) => {
  basketStore.removeFromBasket(id, type);
}

</script>

<style scoped lang="scss">
.basket-item {
  display: grid;
  grid-template-columns: 100px 1fr 120px 120px 120px 120px 42px;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 12px;
    border: 1px solid #eee;
    border-radius: 10px;
    background: #fafafa;
  }

  &__image img {
    max-width: 80px;
    border-radius: 8px;
  }

  &__quantity {
    display: flex;
    align-items: center;
    gap: 6px;

    &-input {
      width: 38px;
      height: 38px;
      text-align: center;
      background-color: #F6F5FA;
      border: 1px solid #ECEBF1
    }
    &-btn {
      background-color: transparent;
      border: none;
      color: #A3A9B5;
      font-size: 2rem;
    }
  }
}
</style>


          <!-- &-amount {
            width: 130px;
            display: flex;
            align-items: center;
            gap: 10px;
            
            @media (max-width: 768px) {
              width: 100%;
              justify-content: flex-start;
            }

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
            .amount__btn {
              background-color: transparent;
              border: none;
            }
          } -->