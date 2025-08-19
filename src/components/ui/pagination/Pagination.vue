<template>
  <div class="pagination" v-if="NavPageCount > 1">
    <button 
      @click="goToPage(1)"
      :disabled="currentPage === 1"
      class="pagination-button"
      title="Первая страница"
    >
      &laquo;&laquo;
    </button>
    
    <button 
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="pagination-button"
      title="Предыдущая страница"
    >
      &laquo;
    </button>
    
    <template v-for="page in visiblePages" :key="page">
      <button
        v-if="page === '...'"
        class="pagination-button disabled"
        disabled
      >
        {{ page }}
      </button>
      <button
        v-else
        @click="goToPage(page)"
        :class="{ active: currentPage === page }"
        class="pagination-button"
      >
        {{ page }}
      </button>
    </template>
    
    <button
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage === NavPageCount"
      class="pagination-button"
      title="Следующая страница"
    >
      &raquo;
    </button>
    
    <button
      @click="goToPage(NavPageCount)"
      :disabled="currentPage === NavPageCount"
      class="pagination-button"
      title="Последняя страница"
    >
      &raquo;&raquo;
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  navData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['page-changed']);

// Преобразуем все значения в числа один раз
const currentPage = computed(() => Number(props.navData.NavPageNomer));
const NavPageCount = computed(() => Number(props.navData.NavPageCount));
const nStartPage = computed(() => Number(props.navData.nStartPage));
const nEndPage = computed(() => Number(props.navData.nEndPage));
const nPageWindow = computed(() => Number(props.navData.nPageWindow));

const visiblePages = computed(() => {
  const pages = [];
  const total = NavPageCount.value;
  
  // Всегда показываем первую страницу
  if (nStartPage.value > 1) {
    pages.push(1);
    if (nStartPage.value > 2) {
      pages.push('...');
    }
  }
  
  // Добавляем страницы в текущем окне
  for (let i = nStartPage.value; i <= nEndPage.value; i++) {
    pages.push(i);
  }
  
  // Добавляем последнюю страницу если нужно
  if (nEndPage.value < total) {
    if (nEndPage.value < total - 1) {
      pages.push('...');
    }
    pages.push(total);
  }
  
  return pages;
});

function goToPage(page) {
  const pageNum = Number(page);
  if (pageNum < 1 || pageNum > NavPageCount.value || pageNum === currentPage.value) {
    return;
  }
  emit('page-changed', pageNum);
}
</script>
<style scoped>
.pagination {
  display: flex;
  justify-content: end;
  flex-wrap: wrap;
  gap: 4px;
  margin: 20px 0;
}

.pagination-button {
  min-width: 32px;
  padding: 6px 8px;
  border: 1px solid #C6C6C6;
  background-color: #fff;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  text-align: center;
}

.pagination-button:hover:not(:disabled):not(.disabled) {
  background-color: #f0f0f0;
}

.pagination-button.active {
  background-color: #da444c;
  color: white;
  border-color: #da444c;
}

.pagination-button:disabled,
.pagination-button.disabled {
  color: #ccc;
  cursor: not-allowed;
  background-color: #f9f9f9;
}
</style>