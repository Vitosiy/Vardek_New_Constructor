<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  container: {
    type: String,
  },
});

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

onMounted(() => {
  console.log(dialogBody.value);
});
</script>

<template>
  <dialog :class="['modal', props.container]" ref="dialogBody">
    <!-- <slot name="modalBody" :onModalClose="closeModal"/> -->
    <!-- <slot name="modalClose" :onModalClose="closeModal" /> -->
    <slot name="modalClose" :onModalClose="closeModal" />
    <slot
      name="modalBody"
      :onModalClose="closeModal"
      :modalCloseSlot="$slots.modalClose"
    />
  </dialog>
  <slot :onModalOpen="openModal" name="modalOpen"></slot>
</template>
<style scoped>
.modal {
  /* display: none;  */
  width: 100%;
  max-width: 85vw;
  padding: 0;
  border: none;
  background-color: transparent;
  transform: scale(0);
  filter: blur(10px);
  transition: all ease-in 0.45s;
}

.modal:focus {
  outline: none;
}

.modal[open] {
  /* display: block; */
  transform: scale(1);
  filter: blur(0px);
  pointer-events: auto;
}

.modal::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}
</style>
