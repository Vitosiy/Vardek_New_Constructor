<script setup lang="ts">
//@ts-nocheck

import "@/components/UMconstructor/styles/UM.scss"
import {ref, onMounted, toRefs, onBeforeUnmount} from "vue";
import UMconstructorClass from "@/components/UMconstructor/ts/UMconstructorClass.ts";
import {BacklightItem, BacklightSide, TSelectedCell} from "@/components/UMconstructor/types/UMtypes.ts";
import MaterialSelector from "@/components/right-menu/customiser-pages/ColorRightPage/MaterialSelector.vue";
import BacklightOption from "@/components/right-menu/customiser-pages/UMPages/BacklightOption.vue";
import MainButton from "@/components/ui/buttons/MainButton.vue";

const props = defineProps({
  module: {
    type: Object,
    default: {},
    required: true,
  },
  currentBacklight: {
    type: Object,
    default: {},
  },
  visualizationRef: {
    type: [ref, Object],
  },
  UMconstructor: {
    type: UMconstructorClass,
    required: true,
  },
});

const {module, currentBacklight, UMconstructor, visualizationRef} = toRefs(props)
const currentCell = ref<TSelectedCell | boolean>(false);
const currentBacklightData = ref<BacklightItem | boolean>(<BacklightItem>{})
const optionsList = ref([])
const currentEditableOption = ref<String>("sides");

const defaultApprovedBacklightsSides = {
  left: {
    front: true,
    mid: true,
    back: true,
  },
  right: {
    front: true,
    mid: true,
    back: true,
  },
  top: {
    front: true,
    mid: true,
    back: true,
  },
  bottom: {
    front: true,
    mid: true,
    back: true,
  },
}

enum OPPOSITE_SIDES {
  'left' = 'right',
  'right' = 'left',
  'top' = 'bottom',
  'bottom' = 'top',
}

const nearestCells = ref(false)
const approvedBacklightsSides = ref(defaultApprovedBacklightsSides)



const setCurrentEditableOption = (name: String) => {
  currentEditableOption.value = name;
  getOptionsList()
};

const createBacklightsData = () => {
  let sides = []
  if (!nearestCells.value)
    nearestCells.value = UMconstructor?.value?.BACKLIGHTS.getNearestCells(currentCell.value)

  Object.entries(approvedBacklightsSides.value).forEach(([side, deepness]) => {
    if (nearestCells.value[side]) {
      let cells = nearestCells.value[side];
      cells.forEach((cell) => {
          if(cell.backlight && cell.backlight.sides[OPPOSITE_SIDES[side]]) {
            deepness[side] = false
          }
      })

      if(Object.values(deepness).find(item => item)) {
        sides.push({
          side,
          deepness: Object.fromEntries(Object.entries(deepness).filter(item => item[1])),
        })
      }
    }
    else {
      sides.push({
        side,
        deepness: {
          front: true,
          mid: true,
          back: true,
        },
      })
    }
  })

  return sides
}

const getOptionsList = () => {
  switch (currentEditableOption.value) {
    case "sides":
      optionsList.value = createBacklightsData()
      break;
    case "deepness":
    case "profileType":
    case "profileColor":
    case "diffuser":
    case "lightColor":
    default:
      optionsList.value = []
      break;
  }
}

const checkPossibleAddBacklight = () => {
  return false
}

const addBacklight = () => {
  currentCell.value.backlight = <BacklightItem>{
    sides: <BacklightSide>[],
    profileColor: null,
    profileType: null,
    diffuser: null,
    lightColor: null,
  }
  approvedBacklightsSides.value = defaultApprovedBacklightsSides

  let sides = createBacklightsData()
  let  firstSide = sides[0]
  currentCell.value.backlight.sides.push(<BacklightSide>{
    side: firstSide.side,
    deepness: firstSide.deepness,
    position: UMconstructor?.value?.BACKLIGHTS.calcBacklightPosition({side: firstSide.side, deepness: Object.keys(firstSide.deepness)[0]}, currentCell.value, module.value)
  })

  //TODO: получить с БД доступные: Цвет профиля, Цвет подсветки, Тип профиля, диффузор
  // и присвоить новому currentCell.value.backlight

  currentBacklightData.value = currentCell.value.backlight
}

const removeBacklight = () => {
    delete currentCell.value.backlight
    currentBacklightData.value = false
}

const onSelect = (data) => {
  console.log(data, 'data')
  currentBacklightData.value[currentEditableOption.value] = data
}

onMounted(() => {
  currentCell.value = UMconstructor?.value?.getCurrenGridData();
  currentBacklightData.value = currentBacklight.value || currentCell.value?.backlight || false;
})

onBeforeUnmount(() => {
  currentCell.value = false
  currentBacklightData.value = false
  optionsList.value = []
  nearestCells.value = false
  approvedBacklightsSides.value = defaultApprovedBacklightsSides
})
</script>

<template>
  <div class="backlight">

    <MainButton
        v-if="!currentBacklightData"
        @click="addBacklight"
    >
      Добавить подсветку
    </MainButton>

    <div v-if="currentBacklightData">
      <MainButton
          @click.stop="removeBacklight"
      >
        Удалить подсветку
      </MainButton>

      <!-- Сторона профиля -->
      <div class="backlight--wrapper">
        <h1 class="backlight__title">Позиционирование</h1>

        <div class="backlight--wrapper-items">
          <BacklightOption
              :type="'sides'"
              :data="currentBacklightData.sides"
              @choose-option="setCurrentEditableOption"
          />

          <BacklightOption
              :type="'deepness'"
              :data="currentBacklightData.deepness"
              @choose-option="setCurrentEditableOption"
          />
        </div>
      </div>

      <div class="backlight--wrapper">
        <h1 class="backlight__title">Параметры</h1>

        <div class="backlight--wrapper-items">
          <BacklightOption
              :type="'profileType'"
              :data="currentBacklightData.profileType"
              :disable-delete-choice="true"
              @choose-option="setCurrentEditableOption"
          />
          <BacklightOption
              :type="'profileColor'"
              :data="currentBacklightData.profileColor"
              :disable-delete-choice="true"
              @choose-option="setCurrentEditableOption"
          />
          <BacklightOption
              :type="'diffuser'"
              :data="currentBacklightData.diffuser"
              :disable-delete-choice="true"
              @choose-option="setCurrentEditableOption"
          />
          <BacklightOption
              :type="'lightColor'"
              :data="currentBacklightData.lightColor"
              :disable-delete-choice="true"
              @choose-option="setCurrentEditableOption"
          />
        </div>
      </div>

      <div class="backlight--wrapper">
        <MaterialSelector
            :materials="optionsList"
            @select="onSelect"
        />
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">
.backlight {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
  align-content: space-around;
  gap: 2rem;
  overflow-x: hidden;
  overflow-y: scroll;
  &__title {
    color: #a3a9b5;
    font-size: 18px;
    margin: 0;
  }

  &--wrapper {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1rem;

    &-items {
      display: flex;
      flex-direction: row;
      align-content: flex-start;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: center;
      gap: 1rem;
    }
  }

}
</style>