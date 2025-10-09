<script setup lang="ts">
import MaterialSelector from "@/components/right-menu/customiser-pages/ColorRightPage/MaterialSelector.vue";
import SurfaceRedactor from "@/components/right-menu/customiser-pages/ColorRightPage/SurfaceRedactor.vue";

interface Props {
  optionsData: any[];
  currentOptionLabel: string | null;
  getCurrentRedactor: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "select", value: any): void;
}>();

const handleSelect = (value: any) => {
  emit("select", value);
};
</script>

<template>
  <div class="color-select">
    <h1 class="color__title">{{ props.currentOptionLabel }}</h1>

    <SurfaceRedactor
      v-if="props.getCurrentRedactor"
      :materialList="props.optionsData"
      :tempWork="true"
      @select_material="handleSelect"
    />

    <MaterialSelector
      v-else
      :materials="props.optionsData"
      @select="handleSelect"
    />
  </div>
</template>

<style lang="scss" scoped>
.color-select {
  position: absolute;
  left: 575px;
  width: 100%;
  max-width: 373px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
  background: rgba($white, 1);
  box-shadow: 0px 0px 10px 0px #3030301a;
  z-index: -1;
  border-radius: 15px;

  &__container {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    overflow: auto;
  }

  &-item {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: $bg;
    border-radius: 15px;
    gap: 10px;

    &__title {
      font-size: 15px;
      font-weight: 500;
    }
  }
}

.color__title {
  font-size: 18px;
  margin: 0;
}
</style>
