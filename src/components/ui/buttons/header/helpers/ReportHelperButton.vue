<template>
  <button class="grey-radial__button" @click="openPopup('error')">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_53_201)">
        <path
          d="M0.687744 17.2009H19.0211L9.85441 1.36761L0.687744 17.2009ZM10.6877 14.7009H9.02108V13.0343H10.6877V14.7009ZM10.6877 11.3676H9.02108V8.03428H10.6877V11.3676Z"
          fill="#5D6069"
        />
      </g>
      <defs>
        <clipPath id="clip0_53_201">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  </button>
</template>

<script lang="ts" setup>
import { usePopupStore } from '@/store/appStore/popUpsStore';

const popupStore = usePopupStore();

const openPopup = (popupName: keyof typeof popupStore.popups) => {
  popupStore.openPopup(popupName);
};
</script>
<style lang="scss" scoped></style>
