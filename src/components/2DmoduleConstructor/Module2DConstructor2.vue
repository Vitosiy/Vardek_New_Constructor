<script setup lang="ts">
// @ts-nocheck
import {computed, defineExpose, h, nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref, watch,} from "vue";

import MainInput from "@/components/ui/inputs/MainInput.vue";
import InteractiveSpace from "./InteractiveSpace.vue";
import SectionOptions from "@/components/2DmoduleConstructor/utils/SectionOptions.vue";
import FillingsProductions from "./utils/FillingsProductions.vue";
import FasadesOptions from "@/components/2DmoduleConstructor/utils/FasadesOptions.vue";

import {ShapeAdjuster} from "./utils/Methods";
import {
  FasadeMaterial,
  FasadeObject,
  GridModule,
  GridSection,
} from "@/types/constructor2d/interfaсes.ts";
import * as THREE from "three";
import {useAppData} from "@/store/appliction/useAppData.ts";
import {UI_PARAMS} from "@/components/2DmoduleConstructor/utils/UMConstructorConst.ts";
import {UniversalGeometryBuilder} from "@/Application/Meshes/UniversalModuleUtils/UniversalGeometryBuilder.ts";

const {
  MIN_FASADE_HEIGHT,
  MIN_FASADE_WIDTH,
  MAX_FASADE_WIDTH,
} = UI_PARAMS;

type constructorMode = 'module' | 'fasades' | 'fillings';

const emit = defineEmits(["save-table-data"]);

let shapeAdjuster = null;
const APP = useAppData().getAppData;

const productData = ref(false)
const builder = new UniversalGeometryBuilder({}).buildProduct;

const props = defineProps({
  canvasHeight: {
    type: Number,
    default: 720,
  },
  canvasWidth: {
    type: Number,
    default: 600,
  },
  defaultDepth: {
    type: Number,
    default: 560,
  },
  productData: {
    type: ref,
    default: false,
    required: true,
  },
});

const isMounted = ref(false);
const mode = ref<constructorMode>('module');

const visualizationRef = ref(null);
const optionsRef = ref(null);

const totalHeight = ref(0);
const totalWidth = ref(0);
const totalDepth = ref(0);

const module = computed(() => {

  if (productData.value) {
    const PROPS = productData.value.PROPS;
    if (!PROPS.CONFIG.MODULEGRID || !Object.keys(PROPS.CONFIG.MODULEGRID).length) {

      let FASADE = PROPS.CONFIG.FASADE_POSITIONS[0]
      let FASADE_PROPS = PROPS.CONFIG.FASADE_PROPS[0]

      let fasadeColor = APP.FASADE[FASADE_PROPS.COLOR]
      let fasadePosition = APP.FASADE_POSITION[FASADE_PROPS.POSITION];
      fasadePosition = builder.expressionsReplace(fasadePosition,
          Object.assign(PROPS.CONFIG.EXPRESSIONS,
              {
                "#X#": totalWidth.value,
                "#Y#": totalHeight.value - PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"],
                "#Z#": totalDepth.value,
              }))


      let section: GridSection = {
        number: 1,
        width: totalWidth.value - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2,
        height: totalHeight.value - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2 - PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"],
        cells: [],
        type: "section",
        position: new THREE.Vector2(PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] + (totalWidth.value - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2) / 2,
            PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] + PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"]),
        fasades: [
          [
            <FasadeObject>{
              id: 1,
              width: FASADE.FASADE_WIDTH,
              height: FASADE.FASADE_HEIGHT - FASADE.POSITION_Y,
              position: new THREE.Vector2(FASADE.POSITION_X, FASADE.POSITION_Y),
              material: <FasadeMaterial>{
                ...FASADE_PROPS
              },
              type: "fasade",
              minY: MIN_FASADE_HEIGHT,
              maxY: fasadeColor.MAX_HEIGHT || parseInt(eval(fasadePosition.FASADE_HEIGHT)),
              maxX: fasadeColor.MAX_WIDTH || MAX_FASADE_WIDTH,
              minX: MIN_FASADE_WIDTH
            }
          ]
        ]
      }

      let _module: GridModule = {
        width: totalWidth,
        height: totalHeight,
        depth: totalDepth,
        moduleColor: PROPS.CONFIG.MODULE_COLOR,
        moduleThickness: PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] || 18,
        horizont: PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"] || 0,
        sections: [section],
        type: "module",
      }

      PROPS.CONFIG.MODULEGRID = _module
    }

    return PROPS.CONFIG.MODULEGRID
  }
});

const getMinHeight = computed(() => {
  return productData.value.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_HEIGHT_MIN
})

const getMaxHeight = computed(() => {
  return productData.value.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_HEIGHT_MAX
})

const getMinWidth = computed((dimension, minmax) => {
  return productData.value.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_WIDTH_MIN
})

const getMaxWidth = computed((dimension, minmax) => {
  return productData.value.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_WIDTH_MAX
})

const getMinDepth = computed((dimension, minmax) => {
  return productData.value.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_DEPTH_MIN
})

const getMaxDepth = computed((dimension, minmax) => {
  return productData.value.PROPS.CONFIG.SIZE_EDIT.SIZE_EDIT_DEPTH_MAX
})

const selectedCell = ref({sec: 0, cell: 0, row: null});
const selectedFasade = ref({sec: 0, cell: 0, row: 0});
const selectedFilling = ref({sec: 0, cell: 0, row: null, item: 0});

const correct = ref({change: false});
const constructor2dContainer = ref(null);
const step = ref(1);
const timer = ref(false);

const changeConstructorMode = (_mode: constructorMode) => {
  if (_mode) {
    mode.value = _mode;
    visualizationRef.value.changeConstructorMode(_mode);
  }
}

const debounce = (callback, wait) => {
  if (timer.value) {
    clearTimeout(timer.value)
  }

  timer.value = setTimeout(() => {
    callback();
    timer.value = false
  }, wait)
}

//#region Наполнение
const getFillings = computed(() => {
  const objectsMatrix = []

  const productInfo = APP.CATALOG.PRODUCTS[productData.value.globalData]
  const fillingsGroups = Object.keys(productInfo.FILLING_SECTION)

  fillingsGroups.map(groupID => {
    let fillingsGroup = APP.CATALOG.SECTIONS[groupID]

    objectsMatrix.push({
      groupName: fillingsGroup.NAME,
      items: fillingsGroup.PRODUCTS.map(item => {
        return APP.CATALOG.PRODUCTS[item]
      }).filter(item => item)
    })
  })

  return objectsMatrix;
});

const updateFilling = (value, key, type, fillingType) => {
  console.log("ww");
  const {sec, cell, row} = selectedFilling.value

  const gridCopy = Object.assign({}, module.value);

  const section = gridCopy.sections[sec];
  const currentColl = section.cells?.[cell];
  const currentRow = currentColl?.cellsRows?.[row] || currentColl || section;

  const currentfilling = currentRow.fillings[key];

  const prevValue = currentRow.fillings[key][type]; //Предыдущее значение

  let newValue = parseInt(value);
  newValue = newValue > 600 ? 600 : newValue < 150 ? 150 : newValue;

  const fillingData = JSON.parse(JSON.stringify(currentfilling));
  fillingData[type] = newValue;

  console.log(fillingData, "0");

  const pixiSector = currentRow.sector;

  currentfilling[`M${type}`] = 600;

  const check = shapeAdjuster.checkToCollision(pixiSector, fillingType, fillingData);

  if (check) {
    currentfilling[type] = newValue;
    console.log("1");
  } else {
    console.log("2");
    currentfilling[type] = prevValue;
    currentfilling[`M${type}`] = prevValue;
  }

  module.value = gridCopy;

  visualizationRef.value.renderGrid();
};
//#endregion

//#region Фасады
const getFasadePositionMinMax = (fasade) => {
  const PROPS = productData.value.PROPS;
  let fasadeColor = APP.FASADE[fasade.material.COLOR]
  let fasadePosition = APP.FASADE_POSITION[fasade.material.POSITION];

  const getExec = function (obj) {
    Object.entries(obj).forEach(([key, value]) => {
      if (key == "NAME" || key == "drawer" || key == "box_color" || key == "fasade_color") {
        obj[key] = value;
      } else {
        obj[key] = eval(value);
      }
    });
    return obj;
  };

  fasadePosition = getExec(
      builder.expressionsReplace(fasadePosition,
          Object.assign(PROPS.CONFIG.EXPRESSIONS,
              {
                "#X#": totalWidth.value,
                "#Y#": totalHeight.value - module.value.horizont,
                "#Z#": totalDepth.value,
              }))
  )

  return {
    minY: MIN_FASADE_HEIGHT,
    maxY: fasadeColor.MAX_HEIGHT || fasadePosition.FASADE_HEIGHT,
    maxX: fasadeColor.MAX_WIDTH || MAX_FASADE_WIDTH,
    minX: MIN_FASADE_WIDTH,
  }
}

const updateFasades = () => {
  const correctFasadeHeight = module.value.height - module.value.horizont - 4;
  module.value.sections.forEach((section, secIndex) => {
    const drawersFasades = []
    if (section.fasades?.[0]) {
      const countDoors = section.fasades.length;

      const correctSectionFasadeWidth =
          module.value.sections.length > 1 ?
              secIndex > 0 && secIndex < module.value.sections.length - 1 ? section.width + module.value.moduleThickness - 4 :
                  section.width + (module.value.moduleThickness - 2) + (module.value.moduleThickness / 2 - 2) :
              module.value.width - 4;

      const correctSectionFasadeWidthDoor = correctSectionFasadeWidth / countDoors - ((countDoors - 1) * 2);

      const sumDoorsWidth = section.fasades.reduce(
          (accumulator, item, index) => accumulator + item[0].width + (index > 0 ? 4 : 0),
          0) / countDoors - ((countDoors - 1) * 2);
      const sumDoorsHeight = section.fasades[0].reduce(
          (accumulator, item, index) => accumulator + item.height + (index > 0 ? 4 : 0),
          0);

      const deltaWidth = correctSectionFasadeWidthDoor - sumDoorsWidth;
      const deltaHeight = correctFasadeHeight - sumDoorsHeight;

      if (deltaWidth !== 0) {
        section.fasades.forEach((door, doorIndex) => {
          door.forEach((segment, segmentIndex) => {

            let fasadeMinMax = getFasadePositionMinMax(segment)
            Object.entries(fasadeMinMax).forEach(([key, value]) => {
              segment[key] = value;
            })

            segment.width += deltaWidth;

            if (secIndex !== 0) {
              segment.position.x = section.position.x - section.width / 2 - module.value.moduleThickness / 2 + 2 + ((section.width + 4) * doorIndex);
            } else if (doorIndex > 0) {
              segment.position.x += deltaWidth;
            }

            if (segment.width < segment.minX || segment.height < segment.minY)
              segment.error = true
            else
              delete segment.error;
          })
        })
      }

      if (deltaHeight !== 0) {
        section.fasades.forEach((door, doorIndex) => {

          door.forEach((segment, segmentIndex) => {
            let fasadeMinMax = getFasadePositionMinMax(segment)
            Object.entries(fasadeMinMax).forEach(([key, value]) => {
              segment[key] = value;
            })
          })

          let lastSegment = door[0]
          lastSegment.height += deltaHeight;

          if (lastSegment.height < lastSegment.minY || lastSegment.width < lastSegment.minX)
            lastSegment.error = true
          else
            delete lastSegment.error;
        })
      }
    }
  })
};
//#endregion

//#region Модуль
const updateHorizont = (value) => {
  debounce(() => {
    const PROPS = productData.value.PROPS;
    PROPS.CONFIG.HORIZONT = PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"] = parseInt(value);
    reset();
  }, 1000)
};

const updateTotalHeight = (value) => {
  debounce(() => {
    totalHeight.value = parseInt(value);
    //visualizationRef.value.updateTotalHeight(value);
    visualizationRef.value.updateTotalSize(value, "height");
    reset();
    visualizationRef.value.selectCell("module", 0, null);

  }, 1000)
};

const updateTotalWidth = (value) => {
  debounce(() => {
    totalWidth.value = parseInt(value);

    //visualizationRef.value.updateTotalWidth(value);
    visualizationRef.value.updateTotalSize(value, "width");
    reset();
    visualizationRef.value.selectCell("module", 0, null);

  }, 1000)
};

const updateTotalDepth = (value) => {
  debounce(() => {
    totalDepth.value = parseInt(value)
    const PROPS = productData.value.PROPS;

    PROPS.CONFIG.SIZE.depth = parseInt(value);
    reset();
  }, 1000)
};

const handleCellSelect = (secIndex, cellIndex, type, rowIndex = null, item = null) => {
  switch (type) {
    case "fasades":
      selectedFasade.value = {sec: secIndex, cell: cellIndex, row: rowIndex};
      break;
    case "fillings":
      selectedFilling.value = {sec: secIndex, cell: cellIndex, row: rowIndex, item: item};
      selectedCell.value = {sec: secIndex, cell: cellIndex, row: rowIndex};
      break;
    default:
      selectedCell.value = {sec: secIndex, cell: cellIndex, row: rowIndex};
      break;
  }

  optionsRef.value.handleCellSelect?.(secIndex, cellIndex, rowIndex, item);
};

//#endregion

const reset = (reset = false) => {
  const PROPS = productData.value.PROPS;

  let sectionsTotalWidth = totalWidth.value - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2 - (module.value.sections.length - 1) * PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"];
  let sectionsTotalHeight = totalHeight.value - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2 - PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"];
  let sectionsWidthSum = 0;

  module.value.sections.forEach((section, secIndex) => {
    sectionsWidthSum += section.width;
  })

  if (sectionsTotalWidth - sectionsWidthSum !== 0) {
    let deltaWidth = sectionsTotalWidth - sectionsWidthSum;
    let lastSection = module.value.sections[module.value.sections.length - 1];

    lastSection.position.x = lastSection.position.x - lastSection.width / 2 + (lastSection.width + deltaWidth) / 2

    lastSection.width += deltaWidth

    lastSection.cells.forEach((cell, cellIndex) => {

      if (cell.cellsRows) {
        let lastRow = cell.cellsRows[cell.cellsRows.length - 1]
        lastRow.position.x = lastRow.position.x - lastRow.width / 2 + (lastRow.width + deltaWidth) / 2
        lastRow.width += deltaWidth;
        if (lastRow.fillings?.length)
          lastRow.fillings.forEach((filling, index) => {
            updateFilling(filling, index, 'width')
          })
      }
      cell.width = lastSection.width;
      cell.position.x += lastSection.position.x

      if (cell.fillings?.length)
        cell.fillings.forEach((filling, index) => {
          updateFilling(filling, index, 'width')
        })
    })

    if (lastSection.fillings?.length)
      lastSection.fillings.forEach((filling, index) => {
        updateFilling(filling, index, 'width')
      })

  }


  if (sectionsTotalHeight - module.value.sections[0].height !== 0) {
    let deltaHeight = sectionsTotalHeight - module.value.sections[0].height;

    module.value.sections.forEach((section, secIndex) => {

      if (section.cells?.length) {
        let lastCell = section.cells[section.cells.length - 1]

        if (lastCell.cellsRows) {
          let lastRow = lastCell.cellsRows[lastCell.cellsRows.length - 1]
          lastRow.height += deltaHeight;
        }

        lastCell.height += deltaHeight;
      }
      section.height += deltaHeight;
    })
  }

  let _module: GridModule = {
    ...module.value,
    width: totalWidth,
    height: totalHeight,
    depth: totalDepth,
  }

  PROPS.CONFIG.MODULEGRID = module.value = _module
  updateFasades();

  visualizationRef.value.renderGrid();
  if (reset) {
    visualizationRef.value.selectCell("module", 0, null);
  }
};

const saveGrid = () => {
  const garbage = ["sector", "shapesBond", "maxX", "maxY", "minX", "minY", "xOffset", "yOffset"];
  const garbageFasades = ["sector", "shapesBond", "xOffset", "yOffset"];
  const nesting = ["cells", "sections", "cellsRows", "fasades", "fillings"];

  //Рекурсивная очистка сетки от "технических" полей 2D конструктора
  const removeGarbage = (object) => {
    if (typeof object === "object" && !Array.isArray(object)) {

      let objectType = object.type || false
      object = Object.entries(object).map(([key, value]) => {

        if (nesting.includes(key)) {
          value = value.map(item => {
            return removeGarbage(item)
          })
        }

        return [key, value]
      })

      if (objectType === "fasade")
        object = object.filter(([key, value]) => !garbageFasades.includes(key))
      else
        object = object.filter(([key, value]) => !garbage.includes(key))

      object = Object.fromEntries(object)
    }

    return object;
  }

  let tmpClone = Object.assign({}, module.value)
  tmpClone = removeGarbage(tmpClone)

  return tmpClone;

  /*const data = {
    canvasHeight: totalHeight.value,
    canvasWidth: totalWidth.value,
    data: tmpClone,
  };*/

  //return data;
};

defineExpose({
  saveGrid,
});

onBeforeMount(() => {
  console.log('onBeforeMount')
  productData.value = props.productData //menuStore.catalogFilterProductsId[0]

  totalHeight.value = productData.value.PROPS?.CONFIG.MODULEGRID?.height || productData.value.PROPS?.CONFIG.SIZE.height || props.canvasHeight;
  totalWidth.value = productData.value.PROPS?.CONFIG.MODULEGRID?.width || productData.value.PROPS?.CONFIG.SIZE.width || props.canvasWidth;
  totalDepth.value = productData.value.PROPS?.CONFIG.MODULEGRID?.depth || productData.value.PROPS?.CONFIG.SIZE.depth || 0;

  console.log(totalHeight.value, totalWidth.value)
});

onMounted(() => {
  console.log('onMounted')
  shapeAdjuster = new ShapeAdjuster({});
  nextTick().then(() => {
    isMounted.value = true;
  });
});

onBeforeUnmount(() => {
  console.log("close");
  shapeAdjuster = null;
  module.value = null;
});

watch(visualizationRef, () => {
  if (visualizationRef.value) {
    shapeAdjuster = new ShapeAdjuster(
        {
          getMmWidth: visualizationRef.value.getMmWidth,
          getMmHeight: visualizationRef.value.getMmHeight,
          getPixelHeight: visualizationRef.value.getPixelHeight,
          getPixelWidth: visualizationRef.value.getPixelWidth
        }
    );
  }
})

</script>

<template>
  <div class="constructor2d-wrapper">

    <div
        class="constructor2d-container constructor2d-container--left"
    >
      <div
          class="constructor2d-container--left-module-sizes"
      >
        <div
            class="constructor2d-container--left-module-sizes--module-size"
        >
          <div class="constructor2d-container--left-module-sizes--module-size-item actions-inputs">
            <p class="actions-title">Высота модуля</p>
            <div class="actions-input--container">
              <MainInput
                  @update:modelValue="updateTotalHeight"
                  :inputClass="'actions-input'"
                  :modelValue="totalHeight"
                  :min="getMinHeight"
                  :max="getMaxHeight"
                  :type="'number'"
              />
            </div>
          </div>
          <div class="constructor2d-container--left-module-sizes--module-size-item actions-inputs">
            <p class="actions-title">Ширина модуля</p>
            <div class="actions-input--container">
              <MainInput
                  @update:modelValue="updateTotalWidth"
                  :inputClass="'actions-input'"
                  :modelValue="totalWidth"
                  :min="getMinWidth"
                  :max="getMaxWidth"
                  :type="'number'"
              />
            </div>
          </div>

          <div class="constructor2d-container--left-module-sizes--module-size-item actions-inputs">
            <p class="actions-title">Глубина модуля</p>
            <div class="actions-input--container">
              <MainInput
                  @update:modelValue="updateTotalDepth"
                  :inputClass="'actions-input'"
                  :modelValue="totalDepth"
                  :min="getMinDepth"
                  :max="getMaxDepth"
                  :type="'number'"
              />
            </div>
          </div>
          <div class="constructor2d-container--left-module-sizes--module-size-item actions-inputs">
            <p class="actions-title">Глубина модуля</p>
            <div class="actions-input--container">
              <MainInput
                  @update:modelValue="updateTotalDepth"
                  :inputClass="'actions-input'"
                  :modelValue="productData.PROPS.CONFIG.SIZE.depth"
                  :min="getMinDepth"
                  :max="getMaxDepth"
                  :type="'number'"
              />
            </div>
          </div>

          <div class="constructor2d-container--left-module-sizes--module-size-item actions-inputs">
            <p class="actions-title">Цоколь</p>
            <div class="actions-input--container">
              <MainInput
                  @update:modelValue="updateHorizont"
                  :inputClass="'actions-input'"
                  :modelValue="productData.PROPS.CONFIG.EXPRESSIONS['#HORIZONT#']"
                  min="0"
                  max="150"
                  :type="'number'"
                  placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

    </div>

    <div
        class="constructor2d-container constructor2d-container--mid"
        ref="constructor2dContainer"
    >
      <div class="constructor2d-header">
        <div class="constructor2d-header--title"><h1>Редактор модуля</h1></div>
      </div>

      <div
          class="constructor2d-container constructor2d-header--mode-selector"
      >
        <article class="actions-items actions-items--right">
          <div class="actions-items--right-items">
            <button
                :class="[
                      'actions-btn actions-btn--default', {
                      active:
                        mode === 'module'
                      }
                    ]"
                @click="changeConstructorMode('module')"
            >
              Модуль
            </button>
            <button
                :class="[
                      'actions-btn actions-btn--default', {
                      active:
                        mode === 'fillings'
                      }
                    ]"
                @click="changeConstructorMode('fillings')"
            >
              Наполнение
            </button>
            <button
                :class="[
                      'actions-btn actions-btn--default', {
                      active:
                        mode === 'fasades'
                      }
                    ]"
                @click="changeConstructorMode('fasades')"
            >
              Фасады
            </button>
          </div>
        </article>
      </div>

      <div class="constructor2d-content">
        <InteractiveSpace
            ref="visualizationRef"
            :mode="mode"
            :step="step"
            :module="module"
            :correct="correct"
            :container="constructor2dContainer"
            :max-area-height="totalHeight"
            :max-area-width="totalWidth"
            @cell-selected="handleCellSelect"
        />
      </div>

      <section class="actions-footer">
        <div class="actions-footer--save">
          <slot name="save"></slot>
          <slot name="close"></slot>
        </div>
      </section>

    </div>

    <div
        class="constructor2d-container constructor2d-container--right"
    >
      <div
          v-if="mode === 'module'"
      >
        <h1>Секции</h1>

        <SectionOptions
            ref="optionsRef"
            class="constructor2d-container--right--content"
            :visualizationRef="visualizationRef"
            :module="module"
            :step="step"
            @product-updateFasades="updateFasades"
            @product-updateFilling="updateFilling"
        />
      </div>

      <div
          v-if="mode === 'fasades'"
      >
        <h1>Фасады</h1>

        <FasadesOptions
            ref="optionsRef"
            class="constructor2d-container--right--content"
            :visualizationRef="visualizationRef"
            :module="module"
            :moduleProps="productData.PROPS"
            :step="step"
            @product-updateFasades="updateFasades"
            @product-getFasadePositionMinMax="getFasadePositionMinMax"
         />
      </div>

      <div
          v-if="mode === 'fillings'"
      >
        <h1>Наполнение</h1>

        <FillingsProductions
            ref="optionsRef"
            class="constructor2d-container--right--content"
            :visualizationRef="visualizationRef"
            :module="module"
            :fillings="getFillings"
            :step="step"
            @product-updateFilling="updateFilling"
            @product-updateFasades="updateFasades"
        />
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.constructor2d {
  &-wrapper {
    display: flex;
    gap: 1rem;
    justify-content: center;
    width: 100%;
    max-width: 95vw;
    height: 95vh;

    font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",
    sans-serif;
  }

  &-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    width: 100%;

    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;

    &--left {
      flex-direction: column;
      max-height: 56vh;
      max-width: 8vw;
      overflow: hidden;

      &-module-sizes {
        position: absolute;
        overflow: scroll;
        max-height: 55vh;

        &--module-size {
          display: flex;
          flex-direction: column;

          &-item {
            padding-bottom: 15px;
          }
        }
      }
    }

    &--mid {
      flex-direction: column;
      max-width: 75vw;
      overflow: hidden;
    }

    &--right {
      max-width: 20vw;
      overflow: hidden;

      &--content {
        max-height: 90vh;
      }

    }
  }

  &-content {
    display: flex;
    justify-content: center;
    height: 55vh;
    right: 3vw;
  }

  &-title {
    font-weight: 400;
    color: #131313;
  }

  &-header {
    display: flex;
    justify-content: center;
    gap: 2rem;

    &--title {
      display: flex;
      align-items: end;
    }

    &--mode-selector {
      display: flex;
      align-items: end;
      justify-content: center;
    }

    .actions-inputs {
      max-width: 150px;
    }
  }
}

.actions {
  &-wrapper {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-right: 0.5rem;
  }

  &-footer {
    display: flex;
    justify-content: space-between;
    margin-top: auto;

    &--save {
      display: flex;
      gap: 1rem;
    }
  }

  &-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-height: 450px;
    overflow-y: scroll;
    padding-right: 0.5rem;

    &::-webkit-scrollbar {
      width: 5px;
      /* Ширина скроллбара */
    }

    &::-webkit-scrollbar-button {
      display: none;
      /* Убираем стрелки */
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
      /* Цвет ползунка */
      border-radius: 4px;
    }
  }

  &-header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    width: 100%;
    padding: 1rem 0;
    border-bottom: 1px solid #ecebf1;
    border-top: 1px solid #ecebf1;

    &--container {
      display: flex;
      align-items: center;
      // gap: 0.5rem;
      padding-right: 0.5rem;
      border-right: 1px solid #ecebf1;
      border-bottom: 1px solid transparent;
      cursor: pointer;

      &.active {
        border-bottom: 1px solid #da444c;
      }
    }
  }

  &-items {
    display: flex;
    flex-wrap: wrap;
    // gap: 1rem;
    align-items: center;

    &--wrapper {
      display: flex;
      flex-direction: column;

      width: 100%;
      padding: 0 0 1rem 0;
    }

    &--container {
      display: flex;
      width: 100%;
      padding: 1rem 0;
      border-bottom: 1px solid #ecebf1;

      // &:first-child {
      //   padding-top: 0;
      // }

      &.active {
        background-color: #f1f1f5;
      }
    }

    &--left,
    &--right {
      width: 100%;
    }

    &--left {
      align-items: start;
      max-width: 45%;

      &-wrapper {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-left: 1rem;
        // max-width: calc(50% - 1rem);
      }
    }

    &--right {
      max-width: calc(65% - 1rem);
      margin-left: 1rem;

      &-items {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
    }

    &--height,
    &--diametr,
    &--width {
      display: flex;
      width: fit-content;

      &-item {
        display: flex;
        align-items: flex-start;
        height: fit-content;
        // gap: 0.5rem;
      }
    }

    &--title {
      display: flex;
      align-items: center;
      align-self: end;
      margin-bottom: 0.5rem;
    }
  }

  &-title {
    font-size: 1rem;
    color: #a3a9b5;
  }

  &-inputs {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    max-width: 100px;
  }

  &-input {
    padding: 0.5rem 1rem;
    width: 100%;
    max-width: 125px;
    border: none;
    border-radius: 15px;
    background-color: #ecebf1;
    color: #6d6e73;
    font-size: 1rem;
    font-weight: 600;

    &:focus {
      outline: none;
    }

    &--container {
      position: relative;

      &::before {
        content: "mm";
        display: block;
        position: absolute;
        top: 50%;
        left: 60px;
        transform: translate(0, -50%);
        pointer-events: none;
        z-index: 0;
        font-size: 0.75rem;
        font-weight: 600;
        color: #6d6e73;
      }
    }
  }

  &-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #ecebf1;
    border-radius: 15px;
    background-color: #ffffff;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: bold;
    color: #5d6069;
    outline: none;

    &--default,
    &--footer {
      transition-property: background-color, color, border;
      transition-timing-function: ease;
      transition-duration: 0.25s;
      @media (hover: hover) {
        /* when hover is supported */
        &:hover {
          color: white;
          background-color: #da444c;
          border: 1px solid transparent;
        }
      }

      &.active {
        border-color: #da444c;
      }

    }

    &--footer {
      background-color: #ecebf1;
    }

    &:focus {
      outline: none;
    }

    &.acthnive {
      border-color: #da444c;
      color: #181818;
      transition-property: background-color, color, border;
      transition-timing-function: ease;
      transition-duration: 0.25s;

      @media (hover: hover) {
        /* when hover is supported */
        &:hover {
          color: white;
          background-color: #da444c;
        }
      }
    }
  }

  &-icon {
    border: none;
    background-color: transparent;
    padding: 0 5px;

    &--delite,
    &--close,
    &--help {
      width: 18px;
      height: 18px;
    }

    &--add {
      width: 12px;
      height: 12px;
    }

    &--delite {
      &-center {
        margin-bottom: 0.5rem;
      }
    }

    &--bottom {
      align-self: flex-end;
      padding: 5px;
    }

    &--position {
      width: 25px;
      height: 25px;
    }
  }
}

.disable {
  pointer-events: none;
  cursor: auto;
}

.clos-btn {
  width: 150px;
  position: absolute;
  bottom: 15px;
  right: 15px;
  color: white;
  background: #fc1a1a;
  font-size: 1rem;
}

.save-btn {
  width: 150px;
  position: absolute;
  bottom: 15px;
  right: 175px;
  color: white;
  background: #33de0c;
  font-size: 1rem;
}


</style>
