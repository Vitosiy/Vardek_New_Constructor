<template>
  <div>
    <!-- Навигация -->
    <div class="tabs-navigation">
      <button
        v-for="(tab, i) in tabs"
        :key="tab.name"
        :class="{ active: selectedTab === tab.name }"
        @click="selectTab(tab.name, i)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
//@ts-nocheck
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
const selectTab = (name: string, index: number) => {
  selectedTab.value = name;
  emit("tab-change", {index: index, name: name});
};
</script>

<style scoped lang="scss">
.tabs-navigation {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  box-sizing: border-box;
}

button {
  border: none;
  border-radius: 15px;
  font-size: 16px;
  padding: 10px 20px;
  min-width: 60px;
  font-weight: 600;
  font-size: small;
  outline: none;
  background: $bg;
  color: $strong-grey;
  transition: background-color 0.2s, transform 0.1s;

  @media (min-width: 1500px) { 
    font-size: medium;
    padding: 15px 25px;
  }
}

button:hover {
  background-color: #e0e0e0;
}

button.active {
  background: $red;
  color: $white;
}
.tabs-content {
  margin-top: 16px;
}

</style>
