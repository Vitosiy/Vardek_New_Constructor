<script setup lang="ts">
import {
  ref,
  onMounted,
  defineEmits,
  defineProps,
  computed,
  onBeforeMount,
} from "vue";
import MainButton from "../ui/buttons/MainButton.vue";

type TDirection = {
  icon: string;
  size: number;
  fontSize: number;
  action: number;
  btnActive: string;
};

type TDirectionMap = {
  smallMap: number[];
  rotateMap: number[];
};
type TDirectionController = TDirection[];

interface Props {
  scale?: number;
  type?: keyof TDirectionMap;
  disactive?: boolean;
  fontSize?: number;
  size?: number;
  maxWidth?: number;
  gap?: number;
  container?: string;
}

const controlBtn = ref<TDirectionController>([
  { btnActive: "", icon: "icon-t-45-l", size: 20, fontSize: 10, action: 0 },
  { btnActive: "", icon: "icon-t-90", size: 25, fontSize: 10, action: 1 },
  { btnActive: "", icon: "icon-t-45-r", size: 20, fontSize: 10, action: 2 },
  { btnActive: "", icon: "icon-l-90", size: 25, fontSize: 15, action: 3 },
  { btnActive: "", icon: "icon-centered", size: 25, fontSize: 25, action: 4 },
  { btnActive: "", icon: "icon-r-90", size: 25, fontSize: 15, action: 5 },
  { btnActive: "", icon: "icon-b-45-l", size: 20, fontSize: 10, action: 6 },
  { btnActive: "", icon: "icon-b-90", size: 25, fontSize: 10, action: 7 },
  { btnActive: "", icon: "icon-b-45-r", size: 20, fontSize: 10, action: 8 },
]);

const diretionMap = ref<TDirectionMap>({
  smallMap: [0, 1, 2, 7],
  rotateMap: [3, 1, 4, 5, 7],
});

const props = withDefaults(defineProps<Props>(), {
  scale: 1,
  disactive: false,
});

const controlsData = ref<TDirectionController | []>([]);

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

const getControlsData = () => {
  const map = diretionMap.value[props.type!];
  console.log(map, "map");
  if (map) {
    const refactor = controlBtn.value.map((el, ndx) => {
      if (map.includes(ndx)) {
        return el;
      } else {
        return {btnActive:"disabled", icon: "", size: 20, fontSize: 10, action: NaN };
      }
    });

    console.log(refactor, "refactor");

    controlsData.value = refactor;
  } else {
    controlsData.value = controlBtn.value;
  }
};

onBeforeMount(() => {
  getControlsData();
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
      v-for="(btn, key) in controlsData"
      :key="key"
      :class="['button__rounded', btn.btnActive]"
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

  &.disabled{
    pointer-events: none;
    opacity: 0;
  }
}
</style>
