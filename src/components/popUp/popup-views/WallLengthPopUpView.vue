<template>
  <div class="project-params-dialog">
    <h3 class="project-params-dialog__label">Длина стены</h3>
    <ClosePopUpButton class="project-params-dialog__close" @close="onCancel" />

    <div class="project-params-dialog__fields">
      <div class="project-params-dialog__field">
        <label class="project-params-dialog__field-label">При выборе значения длины, которая создаст угол, равный 50 гр. или меньше - изменение недоступно</label>
        <label class="project-params-dialog__field-label">Длина, мм</label>
        <input
          v-model="lengthInput"
          type="text"
          class="project-params-dialog__input"
          :placeholder="lengthPlaceholder"
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
import { computed, ref, watch } from 'vue';
import ClosePopUpButton from '@/components/ui/svg/ClosePopUpButton.vue';
import { usePopupStore } from '@/store/appStore/popUpsStore';
import { useWallLengthEditorStore } from '@/store/constructor2d/store/useWallLengthEditorStore';

const popupStore = usePopupStore();
const wallLengthStore = useWallLengthEditorStore();

const lengthInput = ref('');

const getCurrentWallLengthMm = (): number | null => {
  const c2d = (window as unknown as {
    C2D?: {
      layers?: {
        planner?: {
          getWallProperty?: <T extends 'width'>(id: string | number, propName: T) => number | null;
        };
      };
    };
  }).C2D;
  const id = wallLengthStore.wallId;
  if (id == null) return null;
  const widthPlan = c2d?.layers?.planner?.getWallProperty?.(id, 'width');
  if (typeof widthPlan !== 'number' || !Number.isFinite(widthPlan)) return null;
  return Math.round(widthPlan * 10);
};

const lengthPlaceholder = computed(() => {
  const current = getCurrentWallLengthMm();
  return current == null ? '' : String(current);
});

watch(
  () => popupStore.popups.wallLength,
  (open) => {
    if (open) {
      const current = getCurrentWallLengthMm();
      lengthInput.value = current == null ? '' : String(current);
    } else {
      wallLengthStore.clear();
    }
  },
);

const parseLength = (value: string): number | null => {
  const n = Number(String(value ?? '').trim().replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
};

const onCancel = () => {
  popupStore.closePopup('wallLength');
};

const onApply = () => {
  const id = wallLengthStore.wallId;
  if (id == null) return;
  const parsed = parseLength(lengthInput.value);
  if (parsed == null) return;

  const c2d = (window as unknown as {
    C2D?: {
      layers?: {
        planner?: {
          applyWallLengthMm?: (wallId: string | number, lengthMm: number) => boolean;
        };
      };
      updateRoomStore?: () => void;
    };
  }).C2D;

  const ok = c2d?.layers?.planner?.applyWallLengthMm?.(id, parsed);
  if (!ok) return;
  c2d?.updateRoomStore?.();
  popupStore.closePopup('wallLength');
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
