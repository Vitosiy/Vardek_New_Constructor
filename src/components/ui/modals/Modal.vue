<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onMounted, defineExpose } from "vue";

const props = defineProps<{
  container?: string;
  to?: string;
}>();

const emit = defineEmits(["open-modal", "close-modal"]);

const dialogBody = ref(null);

const openModal = () => {
  dialogBody.value?.showModal();
  emit("open-modal", true);
};

const closeModal = () => {

  dialogBody.value?.close();
  emit("close-modal", false);
};

const teleportComponent = computed(() => {
  return props.to ? { name: "Teleport", props: { to: props.to } } : "div";
});

defineExpose({ openModal, closeModal }); 

onMounted(() => {
});
</script>

<template>
  <!-- <component :is="teleportComponent"> -->
    <dialog :class="['modal', props.container || 'modal--default-size']" ref="dialogBody">
      <slot name="modalClose" :onModalClose="closeModal" />
      <slot
        name="modalBody"
        :onModalClose="closeModal"
        :modalCloseSlot="$slots.modalClose"
        :modalContainer="dialogBody"
      />
    </dialog>
  <!-- </component> -->

  <slot :onModalOpen="openModal" name="modalOpen"></slot>
</template>
<style scoped lang="scss">
.modal {
  /* display: none;  */
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 0;
  border: none;
  background-color: transparent;
  transform: scale(0);
  opacity: 0;
  filter: blur(10px);
  transition: all ease-in 0.25s;

  &--default-size {
    max-width: 85vw;
  }
}

.modal:focus {
  outline: none;
}

.modal[open] {
  /* display: block; */
  transform: scale(1);
  opacity: 1;
  filter: blur(0px);
  pointer-events: auto;
}

.modal::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}
</style>
