<script setup lang="ts">
import { ref, watch } from "vue";
import MainInput from "@/components/ui/inputs/MainInput.vue";
import MainButton from "@/components/ui/buttons/MainButton.vue";

const props = defineProps<{ clampHeight: number | null }>();
const emit = defineEmits<{ (e: "apply", value: number | null): void }>();

const localHeight = ref<number | null>(props.clampHeight ?? null);

watch(
  () => props.clampHeight,
  (val) => {
    localHeight.value = val ?? null;
  }
);

const apply = () => {
  emit("apply", localHeight.value);
};
</script>

<template>
  <div class="room-modheight">
    <MainInput
      v-model="localHeight"
      :min="500"
      :max="3000"
      class="input__search"
      type="number"
      placeholder="3000"
    />
    <MainButton :className="'red__button right-menu'" @click="apply">
      Применить
    </MainButton>
  </div>
</template>

<style lang="scss" scoped>
.room-modheight {
  display: flex;
  align-items: center;
  gap: 15px;
}

.input__search {
  width: 140px;
}
</style>
