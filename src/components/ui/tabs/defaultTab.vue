<template>
  <div>
    <!-- Навигация -->
    <div class="tabs-navigation">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        :class="{ active: selectedTab === tab.name }"
        @click="selectTab(tab.name)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Содержимое выбранного таба -->
    <div class="tabs-content">
      <div
        v-for="tab in tabs"
        :key="tab.name"

      >
        <slot :name="tab.name" v-if="selectedTab === tab.name" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, defineEmits, computed } from "vue";

// Интерфейс для табов
interface Tab {
  name: string;
  label: string;
}

// Пропсы
const props = defineProps({
  tabs: {
    type: Array as () => Tab[],
    required: true,
  },
  initialTab: {
    type: String,
    default: null,
  },
});

// События
const emit = defineEmits(["tab-change"]);

// Состояние
const selectedTab = ref<string | null>(null);

// Установка начального таба
selectedTab.value =
  props.initialTab || (props.tabs.length > 0 ? props.tabs[0].name : null);

// Метод для смены таба
const selectTab = (name: string) => {
  selectedTab.value = name;
  emit("tab-change", name);
};
</script>

<style scoped>
.tabs-navigation {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
button {
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  background-color: #f0f0f0;
  transition: background-color 0.2s, transform 0.1s;
}
button:hover {
  background-color: #e0e0e0;
}
button.active {
  background-color: #007bff;
  color: white;
  transform: scale(1.05);
}
.tabs-content {
  margin-top: 16px;
  /* padding: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9; */
}
</style>
