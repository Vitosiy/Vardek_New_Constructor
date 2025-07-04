<script setup lang="ts">
// @ts-nocheck
import {useEventBus} from "@/store/appliction/useEventBus";
import {computed, defineExpose, h, nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref, watch,} from "vue";

import MainInput from "@/components/ui/inputs/MainInput.vue";
import InteractiveSpace from "./InteractiveSpace.vue";
import {ShapeAdjuster} from "./utils/Methods";
import ProductOptions from "./utils/ProductOptions.vue";
import {useMenuStore} from "@/store/appStore/useMenuStore";
import * as THREETypes from "@/types/types";
import {
  DrawerFasadeObject,
  FasadeMaterial,
  FasadeObject,
  FillingObject,
  GridCell,
  GridCellsRow,
  GridModule,
  GridSection,
  MANUFACTURER
} from "@/types/constructor2d/interfaсes.ts";
import * as THREE from "three";
import {useAppData} from "@/store/appliction/useAppData.ts";
import {UI_PARAMS} from "@/components/2DmoduleConstructor/utils/UMConstructorConst.ts";
import {UniversalGeometryBuilder} from "@/Application/Meshes/UniversalModuleUtils/UniversalGeometryBuilder.ts";

const {
  MIN_SECTION_WIDTH,
  MIN_SECTION_HEIGHT,
  MAX_SECTION_WIDTH,
  MIN_FASADE_HEIGHT,
  MIN_FASADE_WIDTH,
  MAX_FASADE_WIDTH,
} = UI_PARAMS;

const eventBus = useEventBus();
type constructorMode = 'module' | 'fasades' | 'fillings';

const emit = defineEmits(["save-table-data"]);

let shapeAdjuster = null;
const menuStore = useMenuStore();
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
});

const isMounted = ref(false);
const mode = ref<constructorMode>('module');
const visualizationRef = ref(null);

const totalHeight = ref(0);
const totalWidth = ref(0);
const totalDepth = ref(0);

const module = computed(() => {

  if (productData.value) {
    const PROPS = productData.value.PROPS;
    if (!PROPS.CONFIG.MODULEGRID) {

      let FASADE = PROPS.CONFIG.FASADE_POSITIONS[0]
      let FASADE_PROPS = PROPS.CONFIG.FASADE_PROPS[0]
      totalDepth.value = PROPS.CONFIG.SIZE.depth

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


// Получаем текущую секцию
const getCurrentSection = computed(() => {
  if (!isMounted.value) return;
  const cellIndex = selectedCell.value.cell ?? 0;
  const secIndex = selectedCell.value.sec ?? 0;
  const rowIndex = selectedCell.value.row ?? 0;

  const currentSec = module.value.sections[secIndex];
  const currentCell = currentSec.cells?.[cellIndex];
  const currentRow = currentCell?.cellsRows?.[rowIndex];

  return {currentSec, currentCell, currentRow};
});

// Получаем текущий фасад
const getCurrentFasade = computed(() => {
  if (!isMounted.value)
    return;

  const rowIndex = selectedFasade.value.row ?? 0;
  const secIndex = selectedFasade.value.sec ?? 0;
  const cellIndex = selectedFasade.value.cell ?? 0;

  const currentSec = module.value.sections[secIndex];
  const currentDoor = currentSec.fasades?.[cellIndex];
  const currentCell = currentDoor?.[rowIndex];

  return {currentSec, currentDoor, currentCell};
});

// Получаем данные услуг секции
const getCurrentSectionServiseData = computed(() => {
  if (!isMounted.value) return;
  return getCurrentSection.value.currentRow.serviseData ?? [];
});

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

const fillingsOptions = ref({show: false, section: selectedFilling});

const getFilling = computed(() => {
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

const createFillingDataToCheck = (product, currentSpace) => {

  let width = product.width
  let height = product.height

  if (height > currentSpace.height || product.ACTUAL_DEPT > totalDepth.value) {
    return false
  }

  if (width !== currentSpace.width)
    width = currentSpace.width;

  let tempFilling = {
    width,
    height,
    data: product,
  };

  return visualizationRef.value.checkPositionFillingToCreate(tempFilling);
};

const addFilling = (type, product, oldFillingObject = false) => {

  const {sec, cell, row} = selectedCell.value

  const currentSection = module.value.sections[selectedCell.value.sec];
  const currentCell = sec.cells?.[selectedCell.value.cell];
  const currentRow = cell?.cellsRows?.[selectedCell.value.row];

  let currentFillingsArray = currentRow || currentCell || currentSection

  const startFillingData = createFillingDataToCheck(product, currentFillingsArray);

  if (!startFillingData) {
    alert("Позиция не найдена");
    return;
  }

  if (row === null && cell === null && sec === null) {
    alert("Пожалуйста, выберите секцию для добавления наполнения");
    return;
  }


  if (!currentFillingsArray.fillings)
    currentFillingsArray.fillings = []
  currentFillingsArray = currentFillingsArray.fillings

  let fillingObject = <FillingObject>{
    product: product.ID,
    id: currentFillingsArray.length + 1,
    name: product.NAME,
    image: product.PREVIEW_PICTURE,
    type: "any",
    position: new THREE.Vector2(startFillingData.x, startFillingData.y),
    size: new THREE.Vector3(startFillingData.width, startFillingData.height, product.depth),
    width: startFillingData.width,
    height: startFillingData.height,
    color: productData.value.PROPS.CONFIG.MODULE_COLOR,
    sec: selectedCell.value.sec,
    cell: selectedCell.value.cell,
    row: selectedCell.value.row,
  };

  currentFillingsArray.push(fillingObject);

  if (product.MIN_FASADE_SIZE) {
    let baseFasade = sec.fasades[0][0] || module.value.sections[0].fasades[0][0]
    let manufacturer_name = product.EN_NAME?.toLowerCase().split(/\s|,/).shift() || product.NAME?.toLowerCase().split(/\s|,/).shift();
    let manufacturerOffset = MANUFACTURER[manufacturer_name]

    fillingObject.type = "drawer"
    fillingObject.fasade = <DrawerFasadeObject>{
      id: 1,
      width: baseFasade.width,
      height: product.MIN_FASADE_SIZE,
      minHeight: product.MIN_FASADE_SIZE,
      maxHeight: product.MAX_FASADE_SIZE,
      position: new THREE.Vector2(baseFasade.position.x, startFillingData.y - manufacturerOffset),
      material: <FasadeMaterial>{
        ...baseFasade.material,
      },
      type: "fasade",
      manufacturerOffset,
      item: currentFillingsArray.length - 1,
      sec: selectedCell.value.sec || null,
      cell: selectedCell.value.cell || null,
      row: selectedCell.value.row || null,
    }

    updateFasades()
  }

  visualizationRef.value.selectCell("fillings", sec, cell, true, row, currentFillingsArray.length - 1);

  // // Обновляем рендер
  visualizationRef.value.renderGrid();
};

const deleteFilling = (secIndex, itemIndex, cellIndex = null, rowIndex = null) => {
  const sec = module.value.sections[secIndex];
  const cell = sec.cells?.[cellIndex];
  const row = cell?.cellsRows?.[rowIndex];

  const curRow = row || cell || sec;
  let needFasadesUpdate = false

  curRow.fillings = curRow.fillings.filter((el, index) => {
    if (index === itemIndex && el.fasades)
      needFasadesUpdate = true

    return index !== itemIndex;
  });

  if (needFasadesUpdate)
    updateFasades()

  visualizationRef.value.renderGrid();
};

const updateFilling = (event, key, type, fillingType) => {
  console.log("ww");
  const {sec, cell, row} = selectedCell.value

  const gridCopy = Object.assign({}, module.value);

  const section = gridCopy.sections[sec];
  const currentColl = section.cells?.[cell];
  const currentRow = currentColl?.cellsRows?.[row] || currentColl || section;

  const currentfilling = currentRow.fillings[key];

  const prevValue = currentRow.fillings[key][type]; //Предыдущее значение

  // let newValue = parseInt(event.target.value);
  let newValue = parseInt(event);
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

const toggleFillingOptions = (colIndex, rowIndex) => {
  fillingsOptions.value.show = !fillingsOptions.value.show;
};

const changeFillingPositionY = (event, value, key, secIndex, cellIndex = null, rowIndex = null) => {
  visualizationRef.value.selectCell("fillings", secIndex, cellIndex, true, rowIndex, key);

  const gridCopy = Object.assign({}, module.value);

  const sec = gridCopy.sections[secIndex];
  const currentColl = sec.cells?.[cellIndex];
  const currentRow = currentColl?.cellsRows?.[rowIndex] || currentColl || sec;

  const currentfilling = currentRow.fillings[key];
  const prevValue = currentfilling.position.y; //Предыдущее значение

  let delta = +value - currentfilling.distances.bottom
  const newValue = prevValue - delta

  const fillingData = JSON.parse(JSON.stringify(currentfilling));
  fillingData.position.y = newValue;

  const pixiSector = currentRow.sector;

  // Проверяем коллизию
  const check = shapeAdjuster.checkToCollision(pixiSector, false, fillingData);

  if (check) {
    currentfilling.position.y = fillingData.position.y;
  } else {
    currentfilling.position.y = prevValue;
  }

  module.value = gridCopy;

  visualizationRef.value.renderGrid();
};

const showFillingOptions = (secIndex, cellIndex = null, rowIndex = null, itemIndex = 0) => {
  visualizationRef.value.selectCell("fillings", secIndex, cellIndex, true, rowIndex, itemIndex);

  fillingsOptions.value.show = true;
  fillingsOptions.value.section.sec = cellIndex;
  fillingsOptions.value.section.cell = cellIndex;
  fillingsOptions.value.section.row = rowIndex;
  fillingsOptions.value.section.item = itemIndex;
};

const getFillingOptionsActive = computed(() => {
  return (sec, cell, row, item) => {
    if (!isMounted.value)
      return;
    const {section, show} = fillingsOptions.value;
    return {active: sec === section.sec && cell === section.cell && row === section.row && item === section.item && show};
  };
});

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

const showCurrentFasade = (secIndex) => {
  selectedFasade.value = {sec: secIndex, cell: 0, row: 0};
  visualizationRef.value.selectCell("fasades", secIndex, 0, 0);
};

const addDoor = (secIndex) => {
  const PROPS = productData.value.PROPS;
  const FASADE = PROPS.CONFIG.FASADE_POSITIONS[0]
  const FASADE_PROPS = PROPS.CONFIG.FASADE_PROPS[0]

  const section = module.value.sections[secIndex];
  const width = section.fasades[0]?.[0] ? Math.floor((section.fasades[0][0].width) / 2 - 2) :
      secIndex > 0 && secIndex < module.value.sections.length - 1 ? section.width + module.value.moduleThickness - 4 :
          section.width + (module.value.moduleThickness - 2) + (module.value.moduleThickness / 2 - 2);

  let firstFasade, newDoorPosition;
  if (section.fasades[0]) {
    section.fasades[0].map(item => {
      item.width = width
    })

    firstFasade = section.fasades[0][0];
    newDoorPosition = new THREE.Vector2(firstFasade.position.x + width + 4, firstFasade.position.y)
  } else {
    let startX = section.position.x - section.width / 2 - module.value.moduleThickness / 2 + 2;
    newDoorPosition = new THREE.Vector2(startX, FASADE.POSITION_Y)
    firstFasade = <FasadeObject>{
      id: 0,
      width,
      height: module.value.height - module.value.horizont - 4,
      position: newDoorPosition,
      type: "fasade",
      material: <FasadeMaterial>{
        ...FASADE_PROPS
      }
    }
    let fasadeMinMax = getFasadePositionMinMax(firstFasade)
    firstFasade = Object.assign(firstFasade, fasadeMinMax)
  }

  if (width < firstFasade.minX)
    firstFasade.error = true
  else
    delete firstFasade.error

  // Создаем новую колонку с такими же параметрами
  const newDoor: FasadeObject = {
    ...firstFasade,
    number: firstFasade.number + 1,
    position: newDoorPosition,
  }
  newDoor.height = module.value.height - module.value.horizont - 4; //TODO: костыль из-за прописанной в БД позиции фасада

  section.fasades.push([newDoor]);

  // Обновляем рендер
  visualizationRef.value.renderGrid();
};

const splitFasade = (secIndex, doorIndex = 0, segmentIndex = 0) => {
  selectedFasade.value.sec = secIndex;
  selectedFasade.value.cell = doorIndex;
  selectedFasade.value.row = segmentIndex;

  visualizationRef.value.selectCell("fasades", secIndex, doorIndex, true, segmentIndex);

  let segment = module.value.sections[secIndex].fasades[doorIndex][segmentIndex];
  const halfHeight = Math.floor((segment.height - 4) / 2);
  // Обновляем высоту последней строки

  if (halfHeight < segment.minY || segment.width < segment.minX)
    segment.error = true
  else
    delete segment.error;

  segment.height = halfHeight;

  // Добавляем новую строку в эту колонку
  module.value.sections[secIndex].fasades[doorIndex].splice(segmentIndex, 0, <FasadeObject>{
    ...segment,
    position: new THREE.Vector2(segment.position.x, segment.position.y + 4 + segment.height),
  });

  // Обновляем рендер
  visualizationRef.value.renderGrid();
};

const deleteDoor = (secIndex, doorIndex) => {
  const current = module.value.sections[secIndex].fasades[doorIndex];
  const prev = module.value.sections[secIndex].fasades[doorIndex - 1];

  const combinedWidth = prev
      ? current[0].width + prev[0].width + 4
      : current.width;

  if (prev) {
    prev.forEach((segment, index) => {
      segment.width = combinedWidth;

      if (segment.width < segment.minX || segment.height < segment.minY)
        segment.error = true
      else
        delete segment.error;
    })
  }

  module.value.sections[secIndex].fasades.splice(doorIndex, 1);

  selectedFasade.value.cell = 0;
  selectedFasade.value.sec = 0;

  visualizationRef.value.renderGrid();
};

const removeFasadeSegment = (secIndex, doorIndex, segmentIndex) => {
  const clone = Object.assign({}, module.value);
  const currentSection = clone.sections[secIndex].fasades[doorIndex];
  const currentSegment = currentSection[segmentIndex];

  const next = currentSection[segmentIndex + 1];
  const prev = currentSection[segmentIndex - 1];

  const combinedHeight = next
      ? currentSegment.height + next.height + 4
      : currentSegment.height + prev.height + 4;

  next ? (next.height = combinedHeight) : (prev.height = combinedHeight);

  let tmpSegment = next || prev
  if (tmpSegment.width < tmpSegment.minX || tmpSegment.height < tmpSegment.minY)
    tmpSegment.error = true
  else
    delete tmpSegment.error;


  if (currentSection.length > 1) {
    currentSection.splice(segmentIndex, 1);
  }

  module.value = clone;

  // Обновляем текущий сектор
  selectedFasade.value.row = 0;
  selectedFasade.value.cell = 0;
  selectedFasade.value.sec = secIndex;

  visualizationRef.value.renderGrid();
};

const updateFasadeHeight = (value, secIndex, doorIndex, segmentIndex) => {
  const newValue = parseInt(value);
  let adjustedValue;
  // Обновляем выбранную секцию для визуального отображения
  selectedFasade.value = {sec: secIndex, cell: doorIndex, row: segmentIndex};
  visualizationRef.value.selectCell("fasades", secIndex, doorIndex, segmentIndex);

  if (!isNaN(newValue) && visualizationRef.value) {
    adjustedValue = visualizationRef.value.adjustSizeFromExternal({
      dimension: "height",
      value: newValue,
      sec: secIndex,
      cell: doorIndex,
      row: segmentIndex,
      type: 'fasades',
    });
  }
  // Обновляем значение в module для синхронизации
  const clone = Object.assign({}, module.value);
  if (adjustedValue) {
    let curCell = clone.sections[secIndex].fasades[doorIndex][segmentIndex];
    let prevCell = clone.sections[secIndex].fasades[doorIndex][segmentIndex - 1];
    let nextCell = clone.sections[secIndex].fasades[doorIndex][segmentIndex + 1];
    let delta = curCell.height - adjustedValue

    curCell.height = adjustedValue

    if (curCell.width < curCell.minX || curCell.height < curCell.minY)
      curCell.error = true
    else
      delete curCell.error;

    if (prevCell) {
      prevCell.height += delta;
      prevCell.position.y += (-delta);
    } else if (nextCell) {
      nextCell.height += delta
      curCell.position.y += delta;
    }

    let tmpSegment = prevCell || nextCell || {}
    if (tmpSegment.width < tmpSegment.minX || tmpSegment.height < tmpSegment.minY)
      tmpSegment.error = true
    else
      delete tmpSegment.error;

  }
  module.value = clone;

  visualizationRef.value.renderGrid();

};

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

const showCurrentCol = (secIndex) => {
  selectedCell.value = {sec: secIndex, cell: null, row: null};
  visualizationRef.value.selectCell("module", secIndex, null);
  fillingsOptions.value.show = false;
};

const addSection = (secIndex) => {
  const section = module.value.sections[secIndex];
  const halfWidth = Math.floor((section.width - module.value.moduleThickness) / 2);

  if (halfWidth < MIN_SECTION_WIDTH)
    return;

  // Обновляем ширину текущей колонки
  section.cells.forEach((cell) => {
    cell.width = halfWidth;
    cell.cellsRows = []
    cell.fillings = []
  });

  section.position.x = section.position.x - (section.width / 2 - halfWidth / 2)
  section.width = halfWidth;
  section.fillings = []

  // Создаем новую колонку с такими же параметрами

  const newColumn: GridSection = {
    ...section,
    number: section.number + 1,
    width: halfWidth,
    cells: [],
    fasades: [],
    fillings: [],
    position: new THREE.Vector2(section.position.x + section.width / 2 + module.value.moduleThickness + halfWidth / 2, section.position.y),
  }
  module.value.sections.splice(secIndex + 1, 0, newColumn);
  updateFasades();

  // Обновляем рендер
  visualizationRef.value.renderGrid();
  console.log(module.value.sections, "55555");
};

const addCell = (secIndex, cellIndex = null) => {
  selectedCell.value.sec = secIndex;
  selectedCell.value.cell = cellIndex;
  visualizationRef.value.selectCell("module", secIndex, cellIndex, true);

  let section = module.value.sections[secIndex];

  let cell;
  if (section.cells.length > 0) {
    cell = section.cells[cellIndex]
  } else {
    cell = <GridCell>{
      number: 1,
      width: section.width,
      height: section.height,
      type: "cell",
      position: new THREE.Vector2(section.position.x, section.position.y),
    };

    if (section.fillings?.length) {
      cell.fillings = [...section.fillings];
      section.fillings.length = 0
    }

    section.cells.push(cell);
  }

  if (cell.cellsRows)
    delete cell.cellsRows

  const halfHeight = Math.floor((cell.height - module.value.moduleThickness) / 2);

  if (halfHeight < MIN_SECTION_HEIGHT)
    return;

  // Обновляем высоту последней строки
  cell.height = halfHeight;

  let newFillings = []
  cell.fillings?.filter((filling, index) => {
    if (filling.position.y >= cell.position.y + cell.height + module.value.moduleThickness) {
      newFillings.push(filling);
    } else {
      filling.cell += 1
    }
    return filling.position.y + filling.height <= cell.position.y + cell.height;
  })

  // Добавляем новую строку в эту колонку
  section.cells.splice(cellIndex || 0, 0, {
    ...cell,
    number: cell.number + 1,
    position: new THREE.Vector2(cell.position.x, cell.position.y + halfHeight + module.value.moduleThickness),
    fillings: newFillings,
  });

  // Обновляем рендер
  visualizationRef.value.renderGrid();
};

const addRowCell = (secIndex, cellIndex, rowIndex = 0) => {
  selectedCell.value.sec = secIndex;
  selectedCell.value.cell = cellIndex;
  selectedCell.value.row = rowIndex;
  visualizationRef.value.selectCell("module", secIndex, cellIndex, true, rowIndex);

  const cell = module.value.sections[secIndex].cells[cellIndex]

  let row;
  if (cell.cellsRows?.length > 0) {
    row = cell.cellsRows[rowIndex];
  } else {
    cell.cellsRows = []
    row = <GridCellsRow>{
      number: 1,
      width: cell.width,
      height: cell.height,
      type: "rowCell",
      fillings: [],
      position: new THREE.Vector2(cell.position.x, cell.position.y),
    }
    cell.cellsRows.push(row);
  }

  const halfWidth = Math.floor((row.width - module.value.moduleThickness) / 2);

  if (halfWidth < MIN_SECTION_WIDTH)
    return;

  if (row.fillings?.length)
    delete row.fillings

  // Обновляем высоту последней строки
  row.position.x = row.position.x - (row.width / 2 - halfWidth / 2)
  row.width = halfWidth;

  // Добавляем новую строку в эту колонку
  cell.cellsRows.splice(rowIndex + 1, 0, {
    ...row,
    number: row.number + 1,
    position: new THREE.Vector2(row.position.x + row.width / 2 + module.value.moduleThickness + halfWidth / 2, row.position.y),
  });

  // Обновляем рендер
  visualizationRef.value.renderGrid();
};

const updateSectionWidth = (value, secIndex) => {
  const newValue = parseInt(value);
  let adjustedValue;

  // Обновляем выбранную секцию для визуального отображения
  selectedCell.value = {sec: secIndex, cell: null, row: null};
  visualizationRef.value.selectCell("module", secIndex, null);

  if (!isNaN(newValue) && visualizationRef.value) {
    adjustedValue = visualizationRef.value.adjustSizeFromExternal({
      dimension: "width",
      value: newValue,
      sec: secIndex,
    });
  }
  // Обновляем значение в module для синхронизации
  const clone = Object.assign({}, module.value);
  if (adjustedValue) {
    let curSection = clone.sections[secIndex]
    let nextSection = clone.sections[secIndex + 1] || clone.sections[secIndex - 1]
    let delta = curSection.width - adjustedValue

    curSection.width = adjustedValue
    curSection.position.x += (-delta) / 2

    curSection.cells.forEach((cell, cellIndex) => {

      if (cell.cellsRows) {
        let lastRow = cell.cellsRows[cell.cellsRows.length - 1]
        lastRow.width += delta;
        lastRow.position.x += (-delta) / 2
      }
      cell.position.x = curSection.position.x
      cell.width = adjustedValue;
    })

    if (nextSection) {
      nextSection.width += delta
      nextSection.position.x += (-delta) / 2

      nextSection.cells.forEach((cell, cellIndex) => {

        if (cell.cellsRows) {
          let lastRow = cell.cellsRows[cell.cellsRows.length - 1]
          lastRow.width += delta;
          lastRow.position.x += (-delta) / 2
        }

        cell.position.x = nextSection.position.x
        cell.width = nextSection.width;
      })
    }
  }
  module.value = clone;
  updateFasades();
  visualizationRef.value.renderGrid();

};

const updateCellHeight = (value, secIndex, cellIndex) => {
  const newValue = parseInt(value);
  let adjustedValue;
  // Обновляем выбранную секцию для визуального отображения
  selectedCell.value = {sec: secIndex, cell: cellIndex, row: null};
  visualizationRef.value.selectCell("module", secIndex, cellIndex);

  if (!isNaN(newValue) && visualizationRef.value) {
    adjustedValue = visualizationRef.value.adjustSizeFromExternal({
      dimension: "height",
      value: newValue,
      sec: secIndex,
      cell: cellIndex,
    });
  }
  // Обновляем значение в module для синхронизации
  const clone = Object.assign({}, module.value);
  if (adjustedValue) {
    let curCell = clone.sections[secIndex].cells[cellIndex]
    let nextIndex = clone.sections[secIndex].cells[cellIndex + 1] ? cellIndex + 1 : cellIndex - 1;
    let nextCell = clone.sections[secIndex].cells[nextIndex]
    let delta = curCell.height - adjustedValue

    curCell.height = adjustedValue

    if (nextCell?.position?.y < curCell.position.y)
      curCell.position.y += delta

    curCell.cellsRows?.forEach((row, rowIndex) => {
      row.height = adjustedValue;
      if (row.position.y < curCell.position.y)
        row.position.y += delta

      row.fillings?.filter((filling, index) => {
        return filling.position.y + filling.height <= row.position.y + row.height;
      })
    })

    if (nextCell) {
      nextCell.height += delta

      if (nextCell.position.y > curCell.position.y)
        nextCell.position.y -= delta

      nextCell.cellsRows?.forEach((row, rowIndex) => {
        row.height = adjustedValue;
        if (row.position.y > curCell.position.y)
          row.position.y += delta

        row.fillings?.filter((filling, index) => {
          return filling.position.y + filling.height <= row.position.y + row.height;
        })
      })

      nextCell.fillings?.filter((filling, index) => {
        if (filling.position.y + filling.height <= nextCell.position.y - module.value.moduleThickness) {
          filling.cell = cellIndex
          curCell.push(filling);
          return false
        } else if (filling.position.y >= nextCell.position.y + nextCell.height + module.value.moduleThickness) {
          filling.cell = cellIndex
          curCell.push(filling);
          return false
        } else
          return true
      })
    }

    curCell.fillings?.filter((filling, index) => {
      if (filling.position.y + filling.height <= curCell.position.y - module.value.moduleThickness) {
        if (nextCell) {
          filling.cell = nextIndex
          nextCell.push(filling);
        }
        return false
      } else if (filling.position.y >= curCell.position.y + curCell.height + module.value.moduleThickness) {
        if (nextCell) {
          filling.cell = nextIndex
          nextCell.push(filling);
        }
        return false
      } else
        return true
    })
  }
  module.value = clone;
  visualizationRef.value.renderGrid();

};

const updateCellRowWidth = (value, secIndex, cellIndex, rowIndex) => {
  const newValue = parseInt(value);
  let adjustedValue;

  // Обновляем выбранную секцию для визуального отображения
  selectedCell.value = {sec: secIndex, cell: cellIndex, row: rowIndex};
  visualizationRef.value.selectCell("module", secIndex, cellIndex, false, rowIndex);

  if (!isNaN(newValue) && visualizationRef.value) {
    adjustedValue = visualizationRef.value.adjustSizeFromExternal({
      dimension: "width",
      value: newValue,
      sec: secIndex,
      cell: cellIndex,
      row: rowIndex,
    });
  }
  // Обновляем значение в module для синхронизации
  const clone = Object.assign({}, module.value);
  if (adjustedValue) {
    let curRow = clone.sections[secIndex].cells[cellIndex].cellsRows[rowIndex]
    let nextRow = clone.sections[secIndex].cells[cellIndex].cellsRows[rowIndex + 1] ||
        clone.sections[secIndex].cells[cellIndex].cellsRows[rowIndex - 1]
    let delta = curRow.width - adjustedValue

    curRow.width = adjustedValue
    curRow.position.x -= delta / 2

    if (nextRow) {
      nextRow.width += delta
      nextRow.position.x += delta / 2
    }
  }
  module.value = clone;
  visualizationRef.value.renderGrid();

};

const deleteSection = (secIndex) => {
  const current = module.value.sections[secIndex];
  const next = module.value.sections[secIndex + 1];
  const prev = module.value.sections[secIndex - 1];

  const combinedWidth = next
      ? current.width + next.width
      : current.width + prev.width;

  if (next) {
    next.position.x = next.position.x - next.width / 2 + combinedWidth / 2
    next.width = combinedWidth;
    next.cells?.forEach((elem) => {
      elem.position.x = next.position.x
      elem.width = combinedWidth;
      if (elem.cellsRows)
        delete elem.cellsRows
    });
  } else {
    prev.position.x = prev.position.x - prev.width / 2 + combinedWidth / 2
    prev.width = combinedWidth;
    prev.cells?.forEach((elem) => {
      elem.position.x = prev.position.x
      elem.width = combinedWidth;
      if (elem.cellsRows)
        delete elem.cellsRows
    });
  }

  if (module.value.sections.length > 1) {
    module.value.sections.splice(secIndex, 1);
  }

  selectedCell.value.cell = 0;
  selectedCell.value.sec = 0;
  updateFasades();

  visualizationRef.value.renderGrid();
};

const deleteCell = (cellIndex, secIndex) => {
  const clone = Object.assign({}, module.value);
  const currentSection = clone.sections[secIndex];
  const currentCell = currentSection.cells[cellIndex];

  const next = currentSection.cells[cellIndex + 1];
  const prev = currentSection.cells[cellIndex - 1];

  const combinedHeight = next
      ? currentCell.height + next.height
      : currentCell.height + prev.height;

  next ? (next.height = combinedHeight) : (prev.height = combinedHeight);

  if (currentCell.fillings?.length) {
    let newFillings = next || prev

    if (!newFillings.fillings)
      newFillings.fillings = []

    let startIndex = newFillings.fillings.length
    currentCell.fillings.forEach((filling) => {
      filling.id = startIndex
      filling.cell = next ? cellIndex + 1 : cellIndex - 1
      startIndex += 1
    })
    newFillings.push(...currentCell.fillings)
  }

  if (currentSection.cells.length > 1) {
    currentSection.cells.splice(cellIndex, 1);
  }

  if (currentSection.cells.length <= 1)
    currentSection.cells.length = 0

  module.value = clone;

  // Обновляем текущий сектор
  selectedCell.value.cell = 0;
  selectedCell.value.sec = secIndex;

  visualizationRef.value.renderGrid();
};

const deleteRowCell = (cellIndex, secIndex, rowIndex) => {
  const clone = Object.assign({}, module.value);
  const currentSection = clone.sections[secIndex];
  const currentCell = currentSection.cells[cellIndex];
  const currentRow = currentCell.cellsRows[rowIndex];

  const next = currentCell.cellsRows[rowIndex + 1];
  const prev = currentCell.cellsRows[rowIndex - 1];

  const combinedWidth = next
      ? currentCell.width + next.width
      : currentCell.width + prev.width;


  next ? (next.position.x = next.position.x - next.width / 2 + combinedWidth / 2) : (prev.position.x = prev.position.x - prev.width / 2 + combinedWidth / 2);
  next ? (next.width = combinedWidth) : (prev.width = combinedWidth);

  if (currentCell.cellsRows.length > 1) {
    currentCell.cellsRows.splice(rowIndex, 1);
  }

  next ? (delete next.fillings) : (delete prev.fillings);

  if (currentCell.cellsRows.length <= 1)
    delete currentCell.cellsRows

  module.value = clone;

  // Обновляем текущий сектор
  selectedCell.value.cell = cellIndex;
  selectedCell.value.sec = secIndex;
  selectedCell.value.row = null;

  visualizationRef.value.renderGrid();
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
  fillingsOptions.value = {show: false, section: selectedFilling};
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

  const data = {
    canvasHeight: totalHeight.value,
    canvasWidth: totalWidth.value,
    data: tmpClone,
  };

  productData.value.PROPS.CONFIG.MODULEGRID = tmpClone

  eventBus.emit("A:UM-update", tmpClone);
  menuStore.closeMenu('2dModuleConstructor')
  return data;
};

defineExpose({
  saveGrid,
});

onBeforeMount(() => {
  console.log('onBeforeMount')
  productData.value = menuStore.catalogFilterProductsId[0]

  totalHeight.value = productData.value.PROPS?.CONFIG.MODULEGRID?.height || props.canvasHeight;
  totalWidth.value = productData.value.PROPS?.CONFIG.MODULEGRID?.width || props.canvasWidth;

  console.log(totalHeight.value, totalWidth.value)

  totalDepth.value = 0
  // Делаем клон для реактивности
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
        class="constructor2d-container"
    >
      <div
          class="constructor2d-container constructor2d-container--left"
          ref="constructor2dContainer"
      >
        <div class="constructor2d-header">
          <div class="constructor2d-header--title"><h1>Редактор модуля</h1></div>

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

        </div>

        <div class="constructor2d-content">

          <div
              class="constructor2d-container--left-module-sizes"
          >
            <div
                class="constructor2d-container constructor2d-container--left-module-sizes--module-size"
            >
              <div class="actions-inputs">
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
              <div class="actions-inputs">
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

              <div class="actions-inputs">
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

              <div class="actions-inputs">
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

        <section class="actions-wrapper" v-if="mode === 'module'">
          <div class="actions-header">
            <div
                :class="[
              'actions-header--container',
              { active: secIndex === selectedCell.sec },
            ]"
                v-for="(section, secIndex) in module.sections"
                :key="secIndex"
            >
              <button
                  v-if="module.sections.length > 1"
                  class="actions-btn actions-icon"
                  @click="deleteSection(secIndex)"
              >
                <img
                    class="actions-icon--delete"
                    src="/icons/delite.svg"
                    alt=""
                />
              </button>
              <p
                  class="actions-title actions-title--part"
                  @click="showCurrentCol(secIndex)"
              >
                {{ secIndex + 1 }} секция
              </p>
            </div>
          </div>

          <div
              class="actions-container"
              v-for="(section, secIndex) in module.sections"
              :key="secIndex"
          >
            <div
                class="actions-items--wrapper"
                v-if="selectedCell.sec === secIndex"
            >
              <div class="actions-items--width">
                <div class="actions-inputs">
                  <p class="actions-title">Ширина</p>
                  <div
                      :class="['actions-input--container']"
                  >
                    <input
                        type="number"
                        :step="step"
                        :min="MIN_SECTION_WIDTH"
                        class="actions-input"
                        :value="section.width"
                        @input="
                            debounce(() => updateSectionWidth(
                              $event.target.value,
                              secIndex
                            ), 1000)
                          "
                    />
                  </div>
                </div>
              </div>

              <div class="actions-items--height">
                <div class="actions-inputs">
                  <p class="actions-title">
                    Высота
                  </p>
                  <div
                      :class="['actions-input--container']"
                  >
                    <input
                        type="number"
                        :step="step"
                        :min="MIN_SECTION_HEIGHT"
                        class="actions-input"
                        :value="section.height"
                        disabled
                    />
                  </div>
                </div>
              </div>

              <div
                  v-for="(cell, cellIndex) in section.cells"
                  :key="cellIndex"
                  :class="[
                'actions-items--container',
                {
                  active:
                    cellIndex === selectedCell.cell &&
                    secIndex === selectedCell.sec,
                },
              ]"
              >
                <article class="actions-items actions-items--left">
                  <div class="actions-items--left-wrapper">

                    <div class="actions-items--title">
                      <button
                          v-if="section.cells.length > 1"
                          class="actions-btn actions-icon"
                          @click="deleteCell(cellIndex, secIndex)"
                      >
                        <img
                            class="actions-icon--delete"
                            src="/icons/delite.svg"
                            alt=""
                        />
                      </button>
                      <p class="actions-title actions-title--part">
                        {{ secIndex + 1 }}.{{ cellIndex + 1 }} часть
                      </p>
                    </div>

                    <div class="actions-items--width">
                      <div class="actions-inputs">
                        <p class="actions-title">Ширина</p>
                        <div
                            :class="['actions-input--container']"
                        >
                          <input
                              type="number"
                              :step="step"
                              :min="MIN_SECTION_WIDTH"
                              class="actions-input"
                              :value="section.width"
                              disabled
                          />
                        </div>
                      </div>
                    </div>

                    <div class="actions-items--height">
                      <div class="actions-inputs">
                        <p class="actions-title">
                          Высота
                        </p>
                        <div
                            :class="['actions-input--container']"
                        >
                          <input
                              type="number"
                              :step="step"
                              :min="MIN_SECTION_HEIGHT"
                              class="actions-input"
                              :value="cell.height"
                              @input="
                            debounce(() => updateCellHeight(
                              $event.target.value,
                              secIndex,
                              cellIndex
                            ), 1000)
                          "
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </article>

                <article class="actions-items actions-items--right">
                  <div class="actions-items--right-items">
                    <button
                        :class="[
                      'actions-btn actions-btn--default'
                    ]"
                        @click="addCell(secIndex, cellIndex)"
                    >
                      Добавить ячейку
                    </button>

                    <button
                        v-if="!cell.cellsRows?.length"
                        :class="[
                      'actions-btn actions-btn--default'
                    ]"
                        @click="addRowCell(secIndex, cellIndex, 0)"
                    >
                      Верт. разделитель
                    </button>
                  </div>
                </article>

                <div
                    v-for="(row, rowIndex) in cell.cellsRows"
                    :key="rowIndex"
                    :class="[
                'actions-items--container',
                {
                  active:
                    cellIndex === selectedCell.cell &&
                    secIndex === selectedCell.sec && rowIndex === selectedCell.row,
                },
              ]"
                >
                  <article class="actions-items actions-items--left">
                    <div class="actions-items--left-wrapper">

                      <div class="actions-items--title">
                        <button
                            v-if="cell.cellsRows.length > 1"
                            class="actions-btn actions-icon"
                            @click="deleteRowCell(cellIndex, secIndex, rowIndex)"
                        >
                          <img
                              class="actions-icon--delete"
                              src="/icons/delite.svg"
                              alt=""
                          />
                        </button>
                        <p class="actions-title actions-title--part">
                          {{ secIndex + 1 }}.{{ cellIndex + 1 }}.{{ rowIndex + 1 }} часть
                        </p>
                      </div>

                      <div class="actions-items--width">
                        <div class="actions-inputs">
                          <p class="actions-title">Ширина</p>
                          <div
                              :class="['actions-input--container']"
                          >
                            <input
                                type="number"
                                :step="step"
                                :min="MIN_SECTION_WIDTH"
                                class="actions-input"
                                :value="row.width"
                                @input="
                            debounce(() => updateCellRowWidth(
                              $event.target.value,
                              secIndex,
                              cellIndex,
                              rowIndex
                            ), 1000)
                          "
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </article>

                  <article class="actions-items actions-items--right">
                    <div class="actions-items--right-items">
                      <button
                          :class="[
                      'actions-btn actions-btn--default'
                    ]"
                          @click="addRowCell(secIndex, cellIndex, rowIndex)"
                      >
                        Верт. разделитель
                      </button>
                    </div>
                  </article>

                </div>

              </div>
            </div>

            <article class="actions-items actions-items--right">
              <div
                  class="actions-items--right-items"
                  v-if="secIndex == selectedCell.sec"
              >
                <button
                    :class="[
                      'actions-btn actions-btn--default'
                    ]"
                    @click="addSection(secIndex)"
                >
                  Добавить секцию
                </button>

                <button
                    v-if="!section.cells.length"
                    :class="[
                      'actions-btn actions-btn--default'
                    ]"
                    @click="addCell(secIndex, null)"
                >
                  Добавить ячейку
                </button>
              </div>
            </article>

          </div>
        </section>

        <section class="actions-wrapper" v-if="mode === 'fasades'">

          <div class="actions-header">
            <div
                :class="[
              'actions-header--container',
              { active: secIndex === selectedFasade.sec },
            ]"
                v-for="(section, secIndex) in module.sections"
                :key="secIndex"
            >
              <p
                  class="actions-title actions-title--part"
                  @click="showCurrentFasade(secIndex)"
              >
                {{ secIndex + 1 }} секция
              </p>
            </div>
          </div>

          <div
              class="actions-container"
              v-for="(section, secIndex) in module.sections"
              :key="secIndex"
          >
            <div
                class="actions-items--wrapper"
                v-if="selectedFasade.sec === secIndex"
            >
              <div
                  v-for="(door, doorIndex) in section.fasades"
                  :key="doorIndex"
                  :class="[
                    'actions-container'
                  ]"
              >

                <article class="actions-items actions-items--left">
                  <div class="actions-items--left-wrapper">
                    <div class="actions-items--title">
                      <button
                          v-if="section.fasades.length > 0"
                          class="actions-btn actions-icon"
                          @click="deleteDoor(secIndex, doorIndex)"
                      >
                        <img
                            class="actions-icon--delete"
                            src="/icons/delite.svg"
                            alt=""
                        />
                      </button>
                      <p class="actions-title actions-title--part">
                        Дверь №{{ doorIndex + 1 }}
                      </p>
                    </div>
                  </div>
                </article>

                <div
                    v-for="(segment, segmentIndex) in door"
                    :key="segmentIndex"
                    :class="[
                      'actions-items--container'
                    ]"
                >
                  <article class="actions-items actions-items--left">
                    <div class="actions-items--left-wrapper">

                      <div class="actions-items--title">
                        <button
                            v-if="door.length > 1"
                            class="actions-btn actions-icon"
                            @click="removeFasadeSegment(secIndex, doorIndex, segmentIndex)"
                        >
                          <img
                              class="actions-icon--delete"
                              src="/icons/delite.svg"
                              alt=""
                          />
                        </button>
                        <p class="actions-title actions-title--part">
                          Сегмент №{{ secIndex + 1 }}.{{ doorIndex + 1 }}.{{ segmentIndex + 1 }}
                        </p>
                      </div>

                      <div class="actions-items--width">
                        <div class="actions-inputs">
                          <p class="actions-title">
                            Ширина
                          </p>
                          <div
                              :class="['actions-input--container']"
                          >
                            <input
                                type="number"
                                :step="step"
                                min="150"
                                class="actions-input"
                                :value="segment.width"
                                disabled
                            />
                          </div>
                        </div>
                      </div>

                      <div class="actions-items--height">
                        <div class="actions-inputs">
                          <p class="actions-title">
                            Высота
                          </p>
                          <div
                              :class="['actions-input--container']"
                          >
                            <input
                                type="number"
                                :step="step"
                                min="150"
                                class="actions-input"
                                :value="segment.height"
                                @input="
                            debounce(() => updateFasadeHeight(
                              $event.target.value,
                              secIndex,
                              doorIndex,
                              segmentIndex
                            ), 1000)
                          "
                            />
                          </div>
                        </div>
                      </div>

                    </div>

                  </article>

                  <article class="actions-items actions-items--right">
                    <div class="actions-items--right-items">
                      <button
                          :class="[
                            'actions-btn actions-btn--default'
                          ]"
                          @click="splitFasade(secIndex, doorIndex, segmentIndex)"
                      >
                        Разделить фасад
                      </button>
                    </div>
                  </article>

                </div>

              </div>

            </div>

            <article class="actions-items actions-items--right">
              <div
                  class="actions-items--right-items"
                  v-if="secIndex == selectedFasade.sec"
              >
                <button
                    v-if="section.fasades.length < 2"
                    :class="[
                      'actions-btn actions-btn--default'
                    ]"
                    @click="addDoor(secIndex)"
                >
                  Добавить дверь
                </button>

              </div>
            </article>

          </div>
        </section>

        <section class="actions-wrapper" v-if="mode === 'fillings'">
          <div class="actions-header">
            <div
                :class="[
              'actions-header--container',
              { active: secIndex === selectedCell.sec },
            ]"
                v-for="(section, secIndex) in module.sections"
                :key="secIndex"
            >
              <p
                  class="actions-title actions-title--part"
                  @click="showCurrentCol(secIndex)"
              >
                {{ secIndex + 1 }} секция
              </p>
            </div>
          </div>

          <div
              class="actions-container"
              v-for="(section, secIndex) in module.sections"
              :key="secIndex"
          >
            <div
                class="actions-items--wrapper"
                v-if="selectedCell.sec === secIndex"
            >

              <div
                  v-for="(filling, fillingIndex) in section.fillings"
                  :key="fillingIndex"
                  :class="[
                'actions-items--container',
                {
                  active:
                    secIndex === selectedFilling.sec &&
                    fillingIndex === selectedFilling.item
                },
              ]"
              >
                <article class="actions-items actions-items--left">
                  <div class="actions-items--left-wrapper">

                    <div class="actions-items--title">
                      <button
                          class="actions-btn actions-icon"
                          @click="deleteFilling(secIndex, fillingIndex)"
                      >
                        <img
                            class="actions-icon--delete"
                            src="/icons/delite.svg"
                            alt=""
                        />
                      </button>
                      <p class="actions-title actions-title--part">
                        {{ filling.name }} №{{ filling.id }}
                      </p>
                    </div>

                    <div class="actions-items--width">
                      <div class="actions-inputs">
                        <p class="actions-title">Позиция</p>
                        <div
                            :class="['actions-input--container']"
                        >
                          <input
                              type="number"
                              :step="1"
                              :max="section.height - filling.height"
                              min="0"
                              class="actions-input"
                              :value="filling.distances.bottom"
                              @input="debounce((event) => {
                                changeFillingPositionY(
                                    $event,
                                    $event.target.value,
                                    fillingIndex,
                                    secIndex,
                                    )
                                }, 1000)"
                          />
                        </div>
                      </div>
                    </div>

                    <div
                        v-if="filling.fasade"
                        class="actions-items--height">
                      <div class="actions-inputs">
                        <p class="actions-title">
                          Высота фасада
                        </p>
                        <div
                            :class="['actions-input--container']"
                        >
                          <input
                              type="number"
                              :step="step"
                              min="150"
                              class="actions-input"
                              :value="filling.fasade.height"
                              disabled
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </article>
              </div>

              <div
                  v-for="(cell, cellIndex) in section.cells"
                  :key="cellIndex"
                  :class="[
                'actions-items--container',
                {
                  active:
                    cellIndex === selectedCell.cell &&
                    secIndex === selectedCell.sec,
                },
              ]"
              >
                <div class="actions-items--title">
                  <p class="actions-title actions-title--part">
                    {{ secIndex + 1 }}.{{ cellIndex + 1 }} часть
                  </p>
                </div>

                <div
                    v-for="(filling, fillingIndex) in cell.fillings"
                    :key="fillingIndex"
                    :class="[
                'actions-items--container',
                {
                  active:
                    secIndex === selectedFilling.sec &&
                    cellIndex === selectedFilling.cell &&
                    fillingIndex === selectedFilling.item
                },
              ]"
                >
                  <article class="actions-items actions-items--left">
                    <div class="actions-items--left-wrapper">

                      <div class="actions-items--title">
                        <button
                            class="actions-btn actions-icon"
                            @click="deleteFilling(secIndex, fillingIndex, cellIndex)"
                        >
                          <img
                              class="actions-icon--delete"
                              src="/icons/delite.svg"
                              alt=""
                          />
                        </button>
                        <p class="actions-title actions-title--part">
                          {{ filling.name }} №{{ filling.id }}
                        </p>
                      </div>

                      <div class="actions-items--width">
                        <div class="actions-inputs">
                          <p class="actions-title">Позиция</p>
                          <div
                              :class="['actions-input--container']"
                          >
                            <input
                                type="number"
                                :step="1"
                                :max="section.height - filling.height"
                                min="0"
                                class="actions-input"
                                :value="filling.distances.bottom"
                                @input="debounce((event) => {
                                changeFillingPositionY(
                                    $event,
                                    $event.target.value,
                                    fillingIndex,
                                    secIndex,
                                    cellIndex
                                    )
                                }, 1000)"
                            />
                          </div>
                        </div>
                      </div>

                      <div
                          v-if="filling.fasade"
                          class="actions-items--height">
                        <div class="actions-inputs">
                          <p class="actions-title">
                            Высота фасада
                          </p>
                          <div
                              :class="['actions-input--container']"
                          >
                            <input
                                type="number"
                                :step="step"
                                min="150"
                                class="actions-input"
                                :value="filling.fasade.height"
                                disabled
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </article>

                </div>

                <div
                    v-for="(row, rowIndex) in cell.cellsRows"
                    :key="rowIndex"
                    :class="[
                'actions-items--container',
                {
                  active:
                    cellIndex === selectedCell.cell &&
                    secIndex === selectedCell.sec && rowIndex === selectedCell.row,
                },
              ]"
                >
                  <div class="actions-items--title">
                    <p class="actions-title actions-title--part">
                      {{ secIndex + 1 }}.{{ cellIndex + 1 }}.{{ rowIndex + 1 }} часть
                    </p>
                  </div>

                  <div
                      v-for="(filling, fillingIndex) in row.fillings"
                      :key="fillingIndex"
                      :class="[
                      'actions-items--container',
                      {
                        active:
                          secIndex === selectedFilling.sec &&
                          cellIndex === selectedFilling.cell &&
                          rowIndex === selectedFilling.row &&
                          fillingIndex === selectedFilling.item
                      },
                    ]"
                  >

                    <article class="actions-items actions-items--left">
                      <div class="actions-items--left-wrapper">

                        <div class="actions-items--title">
                          <button
                              class="actions-btn actions-icon"
                              @click="deleteFilling(secIndex, fillingIndex, cellIndex, rowIndex)"
                          >
                            <img
                                class="actions-icon--delete"
                                src="/icons/delite.svg"
                                alt=""
                            />
                          </button>
                          <p class="actions-title actions-title--part">
                            {{ filling.name }} №{{ filling.id }}
                          </p>
                        </div>

                        <div class="actions-items--width">
                          <div class="actions-inputs">
                            <p class="actions-title">Позиция</p>
                            <div
                                :class="['actions-input--container']"
                            >
                              <input
                                  type="number"
                                  :step="1"
                                  :max="section.height - filling.height"
                                  min="0"
                                  class="actions-input"
                                  :value="filling.distances.bottom"
                                  @input="debounce((event) => {
                                changeFillingPositionY(
                                    $event,
                                    $event.target.value,
                                    fillingIndex,
                                    secIndex,
                                    cellIndex,
                                    rowIndex
                                    )
                                }, 1000)"
                              />
                            </div>
                          </div>
                        </div>

                        <div
                            v-if="filling.fasade"
                            class="actions-items--height">
                          <div class="actions-inputs">
                            <p class="actions-title">
                              Высота фасада
                            </p>
                            <div
                                :class="['actions-input--container']"
                            >
                              <input
                                  type="number"
                                  :step="step"
                                  min="150"
                                  class="actions-input"
                                  :value="filling.fasade.height"
                                  disabled
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </article>

                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

      </div>

      <div
          class="constructor2d-container constructor2d-container--right"
      >
        <div
            v-if="mode === 'fillings'"
        >
          <h1>Наполнение</h1>

          <ProductOptions
              class="constructor2d-container--right--content"
              :fillings="getFilling"
              :step="step"
              @product-addFilling="addFilling"
              @product-deleteFilling="deleteFilling"
              @product-updateFilling="updateFilling"
              @product-toggleFillingOptions="toggleFillingOptions"
              @product-changePositionY="changeFillingPositionY"
          />
          <!--          v-if="fillingsOptions.show"-->
        </div>

      </div>
    </div>

    <button
        class="actions-btn add-divider-btn save-btn"
        @click="saveGrid"
    >
      Сохранить
    </button>

    <button
        class="actions-btn add-divider-btn clos-btn"
        @click="menuStore.closeMenu('2dModuleConstructor')"
    >
      Отмена
    </button>

  </div>
</template>

<style lang="scss" scoped>
.constructor2d {
  &-wrapper {
    display: flex;
    gap: 1rem;
    justify-content: center;
    width: 100%;
    height: 90vh;
    max-width: 84vw;

    font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",
    sans-serif;
    position: absolute;
    top: 95px;
    left: 320px;
  }

  &-container {
    display: flex;
    flex-direction: row;
    gap: 1rem;

    width: 100%;

    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;

    &--left {
      flex-direction: column;
      max-width: 70vw;
      overflow: hidden;


      &-module-sizes {
        position: absolute;
        left: 5vh;

        &--module-size {
          display: flex;
          flex-direction: column;
        }
      }
    }

    &--right {
      flex-direction: column;
      max-width: 15vw;
      max-height: 80vh;
      overflow: hidden;

      &--content {
        max-height: 75vh;
        overflow: auto;
      }

    }
  }

  &-content {
    display: flex;
    justify-content: center;
  }

  &-title {
    font-weight: 400;
    color: #131313;
  }

  &-header {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-direction: row;

    &--title {
      display: flex;
      align-items: end;
      justify-content: center;
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
