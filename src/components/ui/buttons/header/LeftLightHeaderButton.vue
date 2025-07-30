<template>
  <button class="light-radial__button">
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.8333 4.16671L10.8333 9.16671L18.3333 9.16671L18.3333 10.8334L10.8333 10.8334L10.8333 15.8334L1.66668 10L10.8333 4.16671Z"
      />
    </svg>
  </button>
</template>

<script setup lang="ts"></script>
<style lang="scss" scoped>
.light-radial {
  &__button {
    border-color: #131313;
    path {
      fill: #131313;
    }

    &.disabled {
      border-color: #a3a9b5 !important;
      path {
        fill: #a3a9b5;
      }
    }
  }
}
</style>
