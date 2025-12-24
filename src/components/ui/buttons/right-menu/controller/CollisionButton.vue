<template>
  <button class="right-menu__button bottom-b" :class="getActiveCollision" @click="toggleCollision">
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_83_12334)">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M7.76379 1.49426L9.2577 2.98855L5.09758 7.14852C2.80953 9.43648 0.9375 11.3258 0.9375 11.3471C0.9375 11.3683 1.17906 11.6277 1.47434 11.9236L2.01113 12.4614L6.74758 7.72508L11.4841 2.98871L10.7717 2.27562L10.0594 1.5625H14.2484H18.4375V5.75156V9.94063L17.7244 9.22828L17.0113 8.51594L12.2749 13.2524L7.53859 17.9889L8.07645 18.5257C8.37227 18.8209 8.63168 19.0625 8.65293 19.0625C8.67418 19.0625 10.5635 17.1905 12.8515 14.9024L17.0114 10.7423L18.5057 12.2362L20 13.7301V6.86504V0H13.135H6.26992L7.76379 1.49426ZM4.16016 12.5179L-0.0195312 16.6752L0.546875 17.2214L1.11328 17.7676L5.27336 13.6104L9.4334 9.45328L8.88664 8.90699L8.33984 8.3607L4.16016 12.5179ZM6.37992 14.7363L2.23262 18.8867L2.77754 19.4531L3.32246 20.0195L7.48812 15.847L11.6538 11.6743L11.1106 11.1302C10.8119 10.8308 10.5584 10.5859 10.5473 10.5859C10.5363 10.5859 8.66094 12.4536 6.37992 14.7363Z"
          fill="#A3A9B5"
        />
      </g>
      <defs>
        <clipPath id="clip0_83_12334">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  </button>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import { useCustomiserStore } from "@/store/appStore/useCustomiserStore";
import { useMenuStore } from "@/store/appStore/useMenuStore";
import { useModelState } from "@/store/appliction/useModelState";
const modelState = useModelState();

// const customiserStore = useCustomiserStore();
// const menuStore = useMenuStore();

const toggleCollision = () => {
  modelState.getCurrentModel.userData.disableRaycast =
    !modelState.getCurrentModel.userData.disableRaycast;

  // customiserStore.showCustomiserPopup();
  // menuStore.closeAllMenus();
};

const getActiveCollision = computed(()=>{
  if(!modelState.getCurrentModel) return
  return {'active': modelState.getCurrentModel.userData.disableRaycast}
});
</script>
<style lang="scss" scoped>
.bottom-b {
  bottom: 0px;
  right: 0px;
  pointer-events: auto;
}
</style>
