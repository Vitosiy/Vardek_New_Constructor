<template>
  <div class="basket-table" v-if="items.length || type === 'main'">
    <div v-if="title && items.length" class="basket-table__title">{{ title }}</div>
    <div class="basket-table__table" v-if="items.length || type === 'main'">
      <div class="basket-table__head">
        <span>Фото</span>
        <span>Наименование</span>
        <span>Количество</span>
        <span>Цена</span>
        <span>Сумма</span>
        <span>Сумма без скидки</span>
      </div>
  
      <div class="basket-table__body">
        <BasketItem
          v-for="item in items"
          :key="item.BASKETID || item.id"
          :item="item"
        />
      </div>
    </div>
    <p v-if="type === 'main' && !items.length" class="basket-table__none-text">Товаров в корзине пока нет</p>
  </div>
</template>

<script setup lang="ts">
import BasketItem from "./BasketItem.vue"

interface Props {
  title?: string;
  items: any[];
  type: string;
}

defineProps<Props>()
</script>

<style scoped lang="scss">
  .basket-table {
    width: 100%;
    background: white;
    border-radius: 12px;
    padding: 10px;
    min-height: 47vh;
    
    &__title {
      font-weight: 600;
      margin-bottom: 10px;
    }

    &__table {
    }

    &__head {
      display: grid;
      grid-template-columns: 100px 1fr 120px 120px 120px 120px 42px;
      gap: 10px;
      font-weight: 500;
      font-size: 14px;
      color: #666;
      border-bottom: 1px solid #eee;
      padding-bottom: 6px;

      @media (max-width: 768px) {
        display: none; // прячем шапку, оставляем карточки
      }
    }

    &__body {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    &__none-text {
      height: 27vh;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
  }
</style>
