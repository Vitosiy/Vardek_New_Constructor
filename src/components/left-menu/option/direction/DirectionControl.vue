<script setup lang="ts">
import { ref, onMounted, defineEmits, defineProps, computed } from "vue";
import MainButton from "../ui/buttons/MainButton.vue";

type TDirection = {
icon: string, size: number, fontSize: number, action: number 
}
type TDirectionController = TDirection[]

const controlBtn = ref<TDirectionController>([
  { icon: "icon-t-45-l", size: 20, fontSize: 10, action: 0 },
  { icon: "icon-t-90", size: 25, fontSize: 10, action: 1 },
  { icon: "icon-t-45-r", size: 20, fontSize: 10, action: 2 },
  { icon: "icon-l-90", size: 25, fontSize: 15, action: 3 },
  { icon: "icon-centered", size: 25, fontSize: 25, action: 4 },
  { icon: "icon-r-90", size: 25, fontSize: 15, action: 5 },
  { icon: "icon-b-45-l", size: 20, fontSize: 10, action: 6 },
  { icon: "icon-b-90", size: 25, fontSize: 10, action: 7 },
  { icon: "icon-b-45-r", size: 20, fontSize: 10, action: 8 },
]);

const props = defineProps({
  scale: {
    type: Number,
    default: 1,
  },
  smallController: {
    type: Boolean,
    default: false,
  },
  disactive: {
    type: Boolean,
    default: false,
  },
  fontSize: {
    type: Number,
  },

  size: {
    type: Number,
  },

  maxWidth: {
    type: Number,
  },

  gap: {
    type: Number,
  },

  container: {
    type: String,
  },
});

const directionBtn = ref<InstanceType<typeof MainButton>[]>([]);
const emit = defineEmits<{
  (e: "changeDirectionPos", value: string | number): void;
}>();

const changeDirectionPos = (value: number) => {
  emit("changeDirectionPos", value);
  //   eventBus.emit("A:ChangeDirectionPos", value);
};

const getContainerWidth = computed(() => {
  return {
    "max-width": props.maxWidth + "px",
    gap: props.gap + "px",
  };
});

const getControlsData = computed(() => {
  const smallMap = [0, 1, 2, 7];
  if (props.smallController) {
    const controller = controlBtn.value.filter((el, ndx) => {
      if (smallMap.includes(ndx)) {
        return el;
      }
    });
    return controller;
  }
  return controlBtn.value;
});

onMounted(() => {
  directionBtn.value.forEach((el, key) => {
    const size = props.size ?? controlBtn.value[key].size;
    const fontSize = props.fontSize ?? controlBtn.value[key].fontSize;
    el.style.setProperty("--value", `${size * props.scale}px`);
    el.style.setProperty("--font", `${fontSize * props.scale}px`);
  });
});
</script>

<template>
  <div
    :class="['direction-control', props.container]"
    :style="getContainerWidth"
    v-if="!disactive"
  >
  
    <button
      v-for="(btn, key) in getControlsData"
      :key="key"
      class="button__rounded"
      ref="directionBtn"
      @click="changeDirectionPos(btn.action)"
    >
      <div :class="['icon', btn.icon]"></div>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.direction-control {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  max-width: 170px;

  //   &.active {
  //     pointer-events: all;
  //     opacity: 1;
  //     filter: blur(0);
  //   }

  &.card {
    padding: 5px;
    border-radius: 15px;
    box-shadow: 4px 4px 4px 4px rgba(34, 60, 80, 0.11);
  }
}

.icon {
  font-size: var(--font);
}

.button__rounded {
  padding: var(--value);
}
</style>
