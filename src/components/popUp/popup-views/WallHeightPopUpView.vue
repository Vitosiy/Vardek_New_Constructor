<template>
  <div class="project-params-dialog">
    <h3 class="project-params-dialog__label">Высота стен</h3>
    <ClosePopUpButton class="project-params-dialog__close" @close="onCancel" />

    <div class="project-params-dialog__fields">
      <div class="project-params-dialog__field">
        <label class="project-params-dialog__field-label">Высота, мм</label>
        <input
          v-model="heightInput"
          type="text"
          class="project-params-dialog__input"
          :placeholder="String(DEFAULT_WALL_HEIGHT_MM * 10)"
        />
      </div>
    </div>

    <div class="project-params-dialog__actions">
      <button class="btn btn--confirm" @click="onApply">Изменить</button>
      <button class="btn btn--cancel" @click="onCancel">Отменить</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ClosePopUpButton from '@/components/ui/svg/ClosePopUpButton.vue';
import { usePopupStore } from '@/store/appStore/popUpsStore';
import {
  DEFAULT_WALL_HEIGHT_MM,
  useWallHeightStore,
} from '@/store/constructor2d/store/useWallHeightStore';

const popupStore = usePopupStore();
const wallHeightStore = useWallHeightStore();

const heightInput = ref(String(wallHeightStore.wallHeightMm * 10));

watch(
  () => popupStore.popups.wallHeight,
  (open) => {
    if (open) {
      heightInput.value = String(wallHeightStore.wallHeightMm * 10);
    }
  },
);

const parseHeight = (value: string): number | null => {
  const n = Number(value?.trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
};

const onCancel = () => {
  popupStore.closePopup('wallHeight');
};

const onApply = () => {
  const parsed = parseHeight(heightInput.value);
  if (parsed === null) return;

  wallHeightStore.setWallHeightMm(parsed / 10);
  popupStore.closePopup('wallHeight');

  const c2d = (window as unknown as { C2D?: { updateRoomStore?: () => void } }).C2D;
  c2d?.updateRoomStore?.();
};
</script>

<style scoped lang="scss">
.project-params-dialog {
  position: relative;
  background-color: $white;
  border-radius: 25px;
  padding: 16px;
  max-width: 318px;
  width: 100%;

  &__label {
    display: block;
    font-size: 16px;
    margin-bottom: 8px;
    color: $strong-grey;
    padding-right: 28px;
  }

  &__close {
    position: absolute;
    top: 16px;
    right: 16px;
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__field-label {
    font-size: 14px;
    color: $strong-grey;
  }

  &__input {
    width: 100%;
    padding: 10px 14px;
    border: none;
    border-radius: 10px;
    background-color: $light-stroke;
    font-size: 16px;
    outline: none;
    box-sizing: border-box;
  }

  &__actions {
    display: flex;
    justify-content: flex-start;
    gap: 12px;

    .btn {
      font-size: 16px;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;

      &--confirm {
        background-color: $red;
        color: white;
      }

      &--cancel {
        background-color: transparent;
        color: $strong-grey;
      }
    }
  }
}
</style>
