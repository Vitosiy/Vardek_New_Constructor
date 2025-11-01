<script setup lang="ts">
//@ts-nocheck
import { computed } from "vue";
import { _URL } from "@/types/constants";
import {
  TOptionsMap,
  TPalitte,
  TOptionItem,
  TMilling,
  TFasadeItem,
} from "@/types/types";

interface Props {
  // palitte: TPalitte[] | null;
  options: TOptionsMap;
  getOptionImg: (id: number | string, type: string) => string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "toSelect", key: keyof TOptionsMap, title: string): void;
  (
    e: "toPalitteSelect",
    palitteTitle: string,
    key: keyof TOptionsMap,
    palitteData: TPalitte[]
  ): void;
  (
    e: "toMillingSelect",
    millingTitle: string,
    key: keyof TOptionsMap,
    millingData: TMilling[]
  ): void;
  (
    e: "toPlinthSelect",
    plinthTitle: string,
    key: keyof TOptionsMap,
    plinthData: TFasadeItem[]
  ): void;

  (e: "toToggle", event: Event, key: keyof TOptionsMap): void;
}>();

const handleSelect = (key: keyof TOptionsMap, title: string) => {
  emit("toSelect", key, title);
};

const palitteSelect = (
  palitteTitle: string,
  key: keyof TOptionsMap,
  palitteData: TPalitte[]
) => {
  emit("toPalitteSelect", palitteTitle, key, palitteData);
};

const millingSelect = (
  millingTitle: string,
  key: keyof TOptionsMap,
  millingData: TMilling[]
) => {
  emit("toMillingSelect", millingTitle, key, millingData);
};

const plinthSelect = (
  plinthTitle: string,
  key: keyof TOptionsMap,
  plinthData: TFasadeItem[]
) => {
  emit("toPlinthSelect", plinthTitle, key, plinthData);
};

const handleToggle = (event: Event, key: keyof TOptionsMap) => {
  emit("toToggle", event, key);
};

const getPalitteIcon = computed(() => {
  return (id: number | string, palitteData: TPalitte[]) => {
    let cur;
    if (palitteData) {
      cur = palitteData.find((el) => el.ID === id);
      return cur?.HTML;
    }
    return "";
  };
});

const getPaliteName = computed(() => {
  return (id: number | string, palitteData: TPalitte[]) => {
    let cur;
    if (palitteData) {
      cur = palitteData.find((el) => el.ID == id);
      return cur?.UNAME;
    }
    return "";
  };
});

const getMillingIcon = computed(() => {
  return (id: number | string, millingData: TMilling[]) => {
    let cur;
    if (millingData) {
      cur = millingData.find((el) => el.ID === id);
      return cur?.PREVIEW_PICTURE;
    }
    return "";
  };
});

const getMillineName = computed(() => {
  return (id: number | string, millingData: TMilling[]) => {
    let cur;
    if (millingData) {
      cur = millingData.find((el) => el.ID === id);
      return cur?.NAME;
    }
    return "";
  };
});

const getPlinthIcon = computed(() => {
  return (id: number | string, plinthData: TFasadeItem[]) => {
    let cur;
    if (plinthData) {
      cur = plinthData.find((el) => el.ID === id);
      return cur?.PREVIEW_PICTURE;
    }
    return "";
  };
});

const getPlinthName = computed(() => {
  return (id: number | string, plinthData: TFasadeItem[]) => {
    let cur;
    if (plinthData) {
      cur = plinthData.find((el) => el.ID === id);
      return cur?.NAME;
    }
    return "";
  };
});

const getContainerType = computed(() => {
  return (type: string) => {
    if (type.includes("fasad") || type.includes("plinth")) {
      return "option-full";
    }
    return "option-small";
  };
});
</script>

<template>
  <div class="room-options">
    <div
      v-for="(item, key) in props.options"
      :key="key"
      :class="getContainerType(key)"
    >
      <div class="option-container">
        <div
          class="option-label"
          @click="handleSelect(key as keyof TOptionsMap, item.title)"
        >
          <img
            class="label__img"
            :src="_URL + props.getOptionImg(item.id, key as string)"
            alt=""
          />
          <p class="label__text">{{ item.title }}</p>
        </div>

        <div
          v-if="item?.palitte"
          class="option-label"
          @click="
            palitteSelect(
              item.palitteTitle!,
              key as keyof TOptionsMap,
              item.palitteData!
            )
          "
        >
          <div
            class="label__color"
            :style="{ backgroundColor: `#${getPalitteIcon(item.palitte, item.palitteData!)}` }"
          ></div>

          <p class="label__text">
            {{ getPaliteName(item.palitte, item.palitteData!) }}
          </p>
        </div>

        <div
          v-if="item?.milling"
          class="option-label"
          @click="
            millingSelect(
              item.millingTitle!,
              key as keyof TOptionsMap,
              item.millingData!
            )
          "
        >
          <img
            class="label__img"
            :src="_URL + getMillingIcon(item?.milling, item.millingData!)"
            alt=""
          />

          <p class="label__text">
            {{ getMillineName(item?.milling, item.millingData!) }}
          </p>
        </div>

        <div
          v-if="item?.plinthSurfase"
          class="option-label"
          @click="
            plinthSelect(
              item.plinthTitle!,
              key as keyof TOptionsMap,
              item.plinthData!
            )
          "
        >
          <img
            class="label__img"
            :src="_URL + getPlinthIcon(item?.plinthSurfase, item.plinthData!)"
            alt=""
          />

          <p class="label__text">
            {{ getPlinthName(item?.plinthSurfase, item.plinthData!) }}
          </p>
        </div>
        
      </div>

      <div class="option__checkbox">
        <label class="control control-checkbox">
          <input
            type="checkbox"
            :checked="item.global"
            @change="handleToggle($event, key as keyof TOptionsMap)"
          />
          <span class="control_indicator"></span>
          <span class="text-lg text-gray-800 font-medium">{{
            item.label
          }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.room-options {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.option {
  &-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
  }
  &-full,
  &-small {
    padding: 10px;
    border-radius: 15px;
    background-color: $bg;
  }
  &-full {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
  }
  &-small {
    flex: 46%;
    padding: 10px;
  }
}

.option-label {
  width: calc(100% / 2 - 15px);
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  border-radius: 15px;
  transition: background-color 0.25s ease;
  cursor: pointer;

  @media (hover: hover) {
    &:hover {
      .label__text {
        color: $black;
      }
    }
  }
}

.option__checkbox {
  display: flex;
  align-items: center;
}

.label__img {
  height: 60px;
  width: 60px;
  padding: 5px;
  border-radius: 15px;
  background-color: #ffffff;
}

.label__text {
  font-size: 15px;
  font-weight: 600;
  color: $strong-grey;
}
.label__color {
  height: 60px;
  width: 60px;
  border-radius: 12px;
  cursor: pointer;
}
</style>
