<script lang="ts" setup>
// @ts-nocheck 31
import { defineProps, ref, computed, defineEmits } from "vue";
import { _URL } from "@/types/constants";
import { useEventBus } from "@/store/appliction/useEventBus";

const props = defineProps({
  glassList: Array,
  tabIndex: Number,
});

const emit = defineEmits(["select_glass"]);

const eventBus = useEventBus();
const selectPatina = ref<any>(null);


const changeGlass = (glass) => {
  eventBus.emit("A:ChangeGlassColor", {
    data: glass.ID,
    fasadeNdx: props.tabIndex,
  });
  emit("select_glass", {
    name: glass.NAME,
    imgSrc: glass.PREVIEW_PICTURE,
  }); // отдает данные в родительский компонент для рендеринга в ConfiguraitonOption
};

</script>

<template>
  <div class="list">
    <!-- Все виды патины -->
    <div
      class="item"
      v-for="glass in props.glassList"
      @click="changeGlass(glass)"
    >
      <img class="item__img" :src="_URL + glass.PREVIEW_PICTURE" alt="" />
      <div class="item__name">{{ glass.NAME }}</div>
    </div>

  </div>
</template>

<style scoped lang="scss">
.search {
  position: absolute;
  top: 10px;
  height: 40px;
  width: 95%;
  border-radius: 5px;
  padding-left: 15px;
}

.list {
  overflow: scroll;
  height: 100%;
  margin-top: 40px;
}

.list::-webkit-scrollbar {
  width: 8px;
}

.item {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  height: 60px;
  // border: 1px solid red;
  border-radius: 5px;
  background-color: #e7e7e7;
  margin-bottom: 4px;
  margin-right: 8px;

  &__img {
    height: 45px;
    border-radius: 5px;
    margin-left: 10px;
  }

  &__name {
    margin-left: 30px;
  }
}
</style>
