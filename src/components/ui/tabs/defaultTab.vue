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

    <!-- Содержимое выбранного таба -->
    <!-- 
      <div class="tabs-content">
        <div
        v-for="tab in tabs"
        :key="tab.name"
  
        >
          <slot :name="tab.name" v-if="selectedTab === tab.name" />
        </div>
      </div>
   -->
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
  margin-bottom: 16px;
  box-sizing: border-box;
  // border: 1px solid red;
}
button {
  border: none;
  border-radius: 15px;
  font-size: 16px;
  padding: 15px 25px;
  min-width: 120px;
  font-weight: 600;
  outline: none;
  background: $bg;
  color: $strong-grey;
  transition: background-color 0.2s, transform 0.1s;
}
button:hover {
  background-color: #e0e0e0;
}

button.active {
  // background-color: #007bff;
  // color: white;
  
  background: $red;
  color: $white;

}
.tabs-content {
  margin-top: 16px;
  /* padding: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9; */
}
</style>
