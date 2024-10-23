<template>
  <button :class="className + ` ` + size" @click="handleClick">
    <slot></slot>
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

// Определение пропсов
const props = defineProps({
  className: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

// Определение событий
const emit = defineEmits(["click"]);

const handleClick = () => {
  if (!props.disabled) {
    emit("click");
  }
};
</script>

<style lang="scss" scoped>
button {
  border: none;
  border-radius: 15px;
  font-size: 16px;
  padding: 15px 25px;
  font-weight: 600;
  &.right-menu {
    padding: 10px 15px;
  }
}
.red__button {
  background: $red;
  color: $white;
}

.grey__button {
  background: $bg;
  color: $strong-grey;
}

.blue__button {
  background: $blue;
  color: $white;
}
</style>
