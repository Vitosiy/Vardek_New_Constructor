<script setup lang="ts">
import {
  onMounted,
  onBeforeUnmount,
  reactive,
  computed,
  ref,
    Ref,
  toRaw,
  watch,
} from "vue";



const {
  MAX_AREA_WIDTH,
  TOTAL_LENGTH,
  TOTAL_HEIGHT,
  BACKGROUND_COLOR,
  MIN_SECTION_WIDTH,
  MIN_SECTION_HEIGHT,
} = UI_PARAMS;

let shapeAdjuster = null;
const menuStore = useMenuStore();
const productData = ref(false)
const builder = THREETypes.TUniversalGeometryBuilder
const step = ref(1);

const visualizationRef = ref(null);
const module = computed(() => {

  if (productData.value) {
    const PROPS = productData.value.userData.PROPS;
    if(!PROPS.CONFIG.MODULEGRID) {
      let section: GridSection = {
        number: 1,
        width: PROPS.CONFIG.SIZE.width - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2,
        height: PROPS.CONFIG.SIZE.height - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2 - PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"],
        cells: [],
      }
      
      let _module: GridModule = {
        width: PROPS.CONFIG.SIZE.width,
        height: PROPS.CONFIG.SIZE.height,
        moduleThickness: PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] || 18,
        horizont: PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"] || 0,
        sections: [section],
      }

      PROPS.CONFIG.MODULEGRID = _module
    }
    return PROPS.CONFIG.MODULEGRID
  }
})

const tempFilling: Ref<FillingObject> = ref({
  product: 0,
  id: 0,
  type: "any",
  position: new THREE.Vector3(),
  size: new THREE.Vector3(),
  color: 0,
});

const selectedCell = ref({ col: 0, row: 0 });
const correct = ref({ change: false });
const holeOptions = ref(false);
const constructor2dContainer = ref(null);

const getHole = computed(() => {
  const colNdx = selectedCell.value.col;
  const rowNdx = selectedCell.value.row;

  const curRow = module.value.sections[colNdx].cells[rowNdx];

  if (curRow.fillings.length > 0) {
    return curRow.fillings;
  }
  return [];
});

// Получаем текущую секцию
const getCurrentSection = computed(() => {
  const rowNdx = selectedCell.value.row ?? 0;
  const colNdx = selectedCell.value.col ?? 0;

  const currentColl = module.value.sections[colNdx];
  const currentRow = currentColl.cells[rowNdx];
  return { currentRow, currentColl };
});

const getMaxAreaHeight = computed(() => {
    return (TOTAL_HEIGHT * MAX_AREA_WIDTH) / TOTAL_LENGTH;
});

const addSection = (colIndex) => {
  const PROPS = productData.value.userData.PROPS;
  const section = module.value.sections[colIndex];
  const halfWidth = section.width / 2 - module.value.moduleThickness / 2;

  if (halfWidth < PROPS.CONFIG.EXPRESSIONS["#VSECTION_MIN#"] || !((section.width / 2) % 10 == 0))
    return;

  // Обновляем ширину текущей колонки
  section.width = halfWidth;
  section.cells = [];

  // Создаем новую колонку с такими же параметрами
  const newColumn = Object.assign({}, section);
  newColumn.number += 1;

  module.value.splice(colIndex + 1, 0, newColumn);

  // Обновляем рендер
  visualizationRef.value.renderGrid();
};

const addCell = (colIndex, rowIndex) => {
  const section = module.value.sections[colIndex];
  const cell = section.cells[rowIndex];
/*
  cell.forEach((row) => {
    if(row.fillings)
    row.fillings = [];
    row.cellsRows = [];
  });*/

  const halfHeight = Math.floor(cell.height / 2);

  if (halfHeight < 100 || !(cell.height % 10 == 0)) return;

  // Обновляем высоту последней строки
  cell.height = halfHeight;

  // Добавляем новую строку в эту колонку
  cell.push({
    width: cell.width,
    height: cell.height, // Оставшаяся высота
  });

  console.log(cell, "cell");

  // Обновляем рендер
  visualizationRef.value.renderGrid();
};


const createHoleDataToCheck = (type, row, col) => {
  let width, height, radius, tempFilling;

  let extremum = row.width < row.height ? row.width * 0.5 : row.height * 0.5;

  if (extremum > 600) extremum = 300;

  width = extremum;
  height = extremum;
  radius = extremum;

  switch (type) {
    case "rect":
      tempFilling = {
        type: "rect",
        width,
        height,
      };
      break;

    case "circle":
      tempFilling = {
        type: "circle",
        radius,
      };
      break;
  }

  return visualizationRef.value.checkPositionHoleToCreate(tempFilling);
};

const addHole = (type) => {
  const col = module.value[selectedCell.value.col];
  const row = col[selectedCell.value.row];

  const startHoleData = createHoleDataToCheck(type, row, col);

  if (!startHoleData) {
    alert("Позиция не найдена");
    return;
  }

  if (selectedCell.value.col === null || selectedCell.value.row === null) {
    alert("Пожалуйста, выберите секцию для добавления прямоугольного выреза");
    return;
  }

  let preperedData;

  switch (type) {
    case "rect":
      preperedData = {
        ...startHoleData,
        lable: "Прямоугольный разрез",
        holeId: row.fillings.length,
        Mwidth: 600,
        Mheight: 600,
      };
      break;
    case "circle":
      preperedData = {
        ...startHoleData,
        lable: "Круглый разрез",
        holeId: row.fillings.length,
        Mradius: 600,
      };
      break;
  }

  row.fillings.push(preperedData);

  console.log(preperedData);
  // // Обновляем рендер
  visualizationRef.value.renderGrid();
};


const showServices = () => {
  console.log("showServices");
};


const updateWidth = (value) => {
  const newValue = parseInt(value);
  let adjustedValue;

  if (!isNaN(newValue) && visualizationRef.value) {
    adjustedValue = visualizationRef.value.adjustSizeFromExternal({
      dimension: "width",
      value: newValue,
    });
  }
  // Обновляем значение в module для синхронизации
  const clone = Object.assign({}, module.value);

  if (adjustedValue) {
    clone.width = newValue;
  }
  module.value = clone;
};

const updateHeight = (value) => {
  const newValue = parseInt(value);
  let adjustedValue;

  if (!isNaN(newValue) && visualizationRef.value) {
    adjustedValue = visualizationRef.value.adjustSizeFromExternal({
      dimension: "height",
      value: newValue,
    });
  }
  // Обновляем значение в module для синхронизации
  const clone = Object.assign({}, module.value);
  if (adjustedValue) {
    clone.height = newValue;
  }
  module.value = clone;
};

const updateSectionWidth = (value, colIndex) => {
  const newValue = parseInt(value);
  let adjustedValue;

  if (!isNaN(newValue) && visualizationRef.value) {
    adjustedValue = visualizationRef.value.adjustSizeFromExternal({
      dimension: "width",
      value: newValue,
      col: colIndex,
    });
  }
  // Обновляем значение в module для синхронизации
  const clone = module.value.map((item) => item);
  if (adjustedValue) {
    clone.sections[colIndex].forEach((row) => (row.width = adjustedValue));
  }
  module.value = clone;
};

const updateSectionHeight = (value, colIndex, rowIndex) => {
  const newValue = parseInt(value);
  let adjustedValue;

  if (!isNaN(newValue) && visualizationRef.value) {
    adjustedValue = visualizationRef.value.adjustSizeFromExternal({
      dimension: "height",
      value: newValue,
      col: colIndex,
      row: rowIndex,
    });
  }
  // Обновляем значение в module для синхронизации
  const clone = module.value.map((item) => item);
  if (adjustedValue) {
    module.value[colIndex].cells[rowIndex].height = adjustedValue;
  }
  module.value = clone;
};

const updateHole = (event, key, type, holeType) => {
  const rowNdx = selectedCell.value.row;
  const colNdx = selectedCell.value.col;

  const gridCopy = module.value.map((item) => item);
  // const gridCopy = module.value
  const currentColl = gridCopy[colNdx];
  const currentRow = currentColl[rowNdx];

  const currenthole = currentRow.fillings[key];

  const prevValue = currentRow.fillings[key][type]; //Предыдущее значение

  let newValue = parseInt(event.target.value);
  newValue = newValue > 600 ? 600 : newValue < 150 ? 150 : newValue;

  const holeData = JSON.parse(JSON.stringify(currenthole));
  holeData[type] = newValue;

  const pixiSector = currentRow.sector;

  currenthole[`M${type}`] = 600;

  const check = shapeAdjuster.checkToCollision(pixiSector, holeType, holeData);

  if (check) {
    currenthole[type] = newValue;
  } else {
    currenthole[type] = prevValue;
    currenthole[`M${type}`] = prevValue;
  }

  module.value = gridCopy;

  visualizationRef.value.renderGrid();
};

const changeHolePositionX = (event, key, type, holeType, value) => {
  const rowNdx = selectedCell.value.row;
  const colNdx = selectedCell.value.col;

  const gridCopy = module.value.map((item) => item);
  const currentColl = gridCopy[colNdx];
  const currentRow = currentColl[rowNdx];

  const currenthole = currentRow.fillings[key];

  const prevValue = currentRow.fillings[key].x; //Предыдущее значение

  const newValue = prevValue + value;

  const holeData = JSON.parse(JSON.stringify(currenthole));
  holeData.x = newValue;

  const pixiSector = currentRow.sector;

  const check = shapeAdjuster.checkToCollision(pixiSector, holeType, holeData);

  if (check) {
    currenthole.x = newValue;
  } else {
    currenthole.x = prevValue;
  }

  module.value = gridCopy;

  visualizationRef.value.renderGrid();
};

const changeHolePositionY = (event, key, type, holeType, value) => {
  const rowNdx = selectedCell.value.row;
  const colNdx = selectedCell.value.col;

  const gridCopy = module.value.map((item) => item);
  const currentColl = gridCopy[colNdx];
  const currentRow = currentColl[rowNdx];

  const currenthole = currentRow.fillings[key];

  const prevValue = currentRow.fillings[key].y; //Предыдущее значение

  const newValue = prevValue + value;

  const holeData = JSON.parse(JSON.stringify(currenthole));
  holeData.y = newValue;

  const pixiSector = currentRow.sector;

  // Проверяем коллизию
  const check = shapeAdjuster.checkToCollision(pixiSector, holeType, holeData);

  if (check) {
    currenthole.y = newValue;
  } else {
    currenthole.y = prevValue;
  }

  module.value = gridCopy;

  visualizationRef.value.renderGrid();
};

const deleteVerticalCut = (colIndex) => {
  const current = module.value[colIndex];
  const next = module.value[colIndex + 1];
  const prev = module.value[colIndex - 1];

  const combinedWidth = next
      ? current[0].width + next[0].width
      : current[0].width + prev[0].width;

  if (next) {
    next.forEach((elem) => {
      elem.width = combinedWidth;
    });
  } else {
    prev.forEach((elem) => {
      elem.width = combinedWidth;
    });
  }

  if (module.value.length > 1) {
    module.value.splice(colIndex, 1);
  }

  selectedCell.value.row = 0;
  selectedCell.value.col = 0;

  visualizationRef.value.renderGrid();
};

const deleteHorizontalCut = (rowIndex, colIndex) => {
  // const cell = module.value[colIndex];
  const clone = module.value.map((item) => item);
  const currentCol = clone[colIndex];
  const currentRow = currentCol[rowIndex];

  const next = currentCol[rowIndex + 1];
  const prev = currentCol[rowIndex - 1];

  const combinedWidth = next
      ? currentRow.height + next.height
      : currentRow.height + prev.height;

  next ? (next.height = combinedWidth) : (prev.height = combinedWidth);

  if (currentCol.length > 1) {
    currentCol.splice(rowIndex, 1);
  }

  currentCol.forEach((row) => {
    row.roundCut = {};
  });

  module.value = clone;

  // Обновляем текущий сектор
  selectedCell.value.row = 0;
  selectedCell.value.col = colIndex;

  visualizationRef.value.renderGrid();
};

const deleteHole = (ndx) => {
  const colNdx = selectedCell.value.col;
  const rowNdx = selectedCell.value.row;
  const curRow = module.value[colNdx][rowNdx];

  curRow.fillings = curRow.fillings.filter((el, index) => {
    return index !== ndx;
  });

  visualizationRef.value.renderGrid();
};

const handleCellSelect = (colIndex, rowIndex, type) => {
  selectedCell.value = { col: colIndex, row: rowIndex };
  const roundSector = module.value[colIndex].cells[rowIndex];
  if ("radius" in roundSector.roundCut) {
    holeOptions.value = false;
  }
};

const save = (event) => {
  try {
    localStorage.setItem("module", JSON.stringify(module.value));

    this.mouse.x = ((event.clientX - this.canvas.getBoundingClientRect().left) / this.canvas.clientWidth) * 2 - 1;
    this.mouse.y = -((event.clientY - this.canvas.getBoundingClientRect().top) / this.canvas.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects([...this.roomManager._roomWalls, this.roomManager._roomFloor]);

    const point = intersects[0].point;
    const surface = intersects[0].object;

    builder.createModel(productData, (object) => {

      object.userData.MOUSE_POSITION = {
        x: point.clone().project(this.camera).x * this.trafficManager._sizes.width * 0.5,
        y: point.clone().project(this.camera).y * this.trafficManager._sizes.height * -0.5,
      };

      let config = object.userData.PROPS.CONFIG;

      this.setObject.create({
        scene: this.scene,
        config,
        object,
        point,
        roomManager: this.roomManager,
        trafficManager: this.trafficManager,
        boxHelper: this.boxHelper,
        wall: surface
      });
    });

  } catch (error) {
    console.error('Error build:', error);
  }

  menuStore.closeMenu('2dModuleConstructor')
};

const close = () => {
  console.log("Закрытие окна");
};

onMounted(() => {
  shapeAdjuster = new ShapeAdjuster();
});

onBeforeUnmount(() => {
  shapeAdjuster = null;
});

watch(menuStore, () => {
  if(menuStore.openMenus == '2dModuleConstructor' && menuStore.catalogFilterProductsId[0])
    productData.value = menuStore.catalogFilterProductsId[0]
})
</script>

<template>
  <div class="constructor2d-wrapper" v-if="menuStore.openMenus == '2dModuleConstructor'">

    <div
        class="constructor2d-container"
    >
      <div
          class="constructor2d-container constructor2d-container--left"
          ref="constructor2dContainer"
      >
        <h1>Редактор модуля</h1>

        <div class="constructor2d-content">
          <InteractiveSpace
              ref="visualizationRef"
              :grid="module"
              :correct="correct"
              :container="constructor2dContainer"
              :tempFilling="tempFilling"
              @cell-selected="handleCellSelect"
              :step="step"
              :max-area-height="module.height"
          />
        </div>

        <section class="actions-wrapper">
          <div
              class="actions-container"
          >
            <div class="actions-items--width">
              <div class="actions-inputs">
                <p class="actions-title">Ширина</p>
                <div
                    :class="[
                      'actions-input--container'
                    ]"
                >
                  <input
                      type="number"
                      :step="step"
                      :min="productData.userData.PROPS.CONFIG.SIZE_EDIT_WIDTH_MIN"
                      :max="productData.userData.PROPS.CONFIG.SIZE_EDIT_WIDTH_MAX"
                      class="actions-input"
                      :value="module.width"
                      @input="updateWidth($event.target.value)"
                  />
                </div>
              </div>
              <div class="actions-inputs">
                <p class="actions-title">Высота</p>
                <div
                    :class="[
                      'actions-input--container'
                    ]"
                >
                  <input
                      type="number"
                      :step="step"
                      :min="productData.userData.PROPS.CONFIG.SIZE_EDIT_HEIGHT_MIN"
                      :max="productData.userData.PROPS.CONFIG.SIZE_EDIT_HEIGHT_MAX"
                      class="actions-input"
                      :value="module.height"
                      @input="updateHeight($event.target.value)"
                  />
                </div>
              </div>
            </div>
          </div>
          <div
              class="actions-container"
              v-for="(section, colIndex) in module.sections"
              :key="colIndex"
          >
            <div class="actions-header" v-if="selectedCell.col === colIndex">
              <button
                  v-if="module.length > 1"
                  class="actions-btn actions-icon"
                  @click="deleteVerticalCut(colIndex)"
              >
                <img
                    class="actions-icon--delite"
                    src="../../assets/svg/trash.svg"
                    alt=""
                />
              </button>
              <p class="actions-title actions-title--part">
                {{ colIndex + 1 }} часть
              </p>
            </div>

            <div
                class="actions-items--wrapper"
                v-if="selectedCell.col === colIndex"
            >
              <article class="actions-items actions-items--left">
                <div class="actions-items--width">
                  <div class="actions-inputs">
                    <p class="actions-title">Ширина</p>
                    <div
                        :class="[
                      'actions-input--container'
                    ]"
                    >
                      <input
                          type="number"
                          step="10"
                          min="150"
                          class="actions-input"
                          :value="section.width"
                          @input="updateSectionWidth($event.target.value, colIndex)"
                      />
                    </div>
                  </div>
                </div>

                <!-- Высота -->
                <div class="actions-items--height-wrapper">
                  <div class="actions-items--height">
                    <button
                        class="actions-btn cancel-btn"
                        v-if="!section.cells.length"
                        @click="addCell(colIndex, 0)"
                    >
                      Доб. полку
                    </button>
                    <div
                        class="actions-items--height-item"
                        v-for="(cell, rowIndex) in section.cells"
                        :key="rowIndex"
                    >

                      <button
                          class="actions-btn cancel-btn"
                          @click="addCell(colIndex, rowIndex)"
                      >
                        Доб. полку
                      </button>
                      <button
                          v-if="section.cells.length > 1"
                          @click="deleteHorizontalCut(rowIndex, colIndex)"
                          class="actions-btn actions-icon actions-icon--bottom"
                      >
                        <img
                            class="actions-icon--delite actions-icon--delite-center"
                            src="../../assets/svg/trash.svg"
                            alt=""
                        />
                      </button>

                      <div class="actions-inputs">
                        <p class="actions-title">
                          Высота {{ colIndex + 1 }}.{{ rowIndex + 1 }}
                        </p>
                        <div
                            :class="[
                          'actions-input--container'
                        ]"
                        >
                          <input
                              type="number"
                              step="10"
                              min="150"
                              class="actions-input"
                              :value="section.height"
                              @input="
                            updateSectionHeight(
                              $event.target.value,
                              colIndex,
                              rowIndex
                            )
                          "
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <article class="actions-items actions-items--right">
                <div class="actions-items--right-items">
                  <button
                      class="actions-btn add-divider-btn"
                      @click="addSection(colIndex)"
                  >
                    Раздел. секцию
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>

      <div
          class="constructor2d-container constructor2d-container--right"
      >
        <h1>Опции</h1>

        <ProductOptions
            v-if="holeOptions"
            :fillings="getHole"
            @cut-addHole="addHole"
            @cut-deleteHole="deleteHole"
            @cut-updateHole="updateHole"
            @cut-toggleHoleOptions="toggleHoleOptions"
            @cut-changePositionX="changeHolePositionX"
            @cut-changePositionY="changeHolePositionY"
        />
      </div>

    </div>

    <button
        class="actions-btn add-divider-btn save-btn"
        @click="save"
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
    font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",
    sans-serif;
    position: absolute;
    top: 95px;
    right: 10px;
    width: 100%;
    height: 90%;
    max-height: 100vh;
    max-width: 1715px;
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
    }

    &--right {
      flex-direction: column;
      max-width: 15vw;
      max-height: 80vh;
      overflow: hidden;
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
}

.actions {
  &-wrapper {
    display: flex;
    flex-direction: column;
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

  &-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    // border-bottom: 1px solid #ecebf1;

    &:first-child {
      // border-top: 1px solid #ecebf1;
    }

    // transform: scale(0.7);
  }

  &-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    width: 100%;
    padding: 1rem 0;
    border-bottom: 1px solid #ecebf1;
    border-top: 1px solid #ecebf1;
  }

  &-items {
    display: flex;
    flex-wrap: wrap;
    // gap: 1rem;
    align-items: center;

    &--wrapper {
      display: flex;
      width: 100%;
      padding: 1rem 0;
    }

    &--left,
    &--right {
      width: 100%;
      // max-width: 50%;
    }

    &--left {
      align-items: start;
      max-width: 75%;
    }

    &--right {
      display: block;
      max-width: calc(25% - 1rem);
      margin-left: 1rem;

      &-items {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
    }

    &--height {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;

      &-wrapper {
        max-width: calc(50% - 1rem);
      }

      &-item {
        display: flex;
        align-items: flex-start;
        height: fit-content;
        // gap: 0.5rem;
      }
    }

    &--diametr {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;

      &-wrapper {
        max-width: 25%;
      }

      &-item {
        display: flex;
        align-items: flex-start;
        width: 100%;
        height: fit-content;
        // gap: 0.5rem;
      }
    }

    &--width {
      display: flex;
      gap: 1rem;
      align-items: start;
      flex-wrap: wrap;
      width: 100%;
      max-width: 20%;
      height: 100%;
      border-right: 1px solid #ecebf1;
    }

    &--diametr,
    &--height {
      &-wrapper {
        height: 100%;
        width: 100%;
        margin-left: 1rem;
        border-right: 1px solid #ecebf1;
      }
    }
  }

  &-title {
    font-size: 1rem;
    color: #a3a9b5;

    // &--part {
    //   margin-bottom: 0.5rem;
    // }
  }

  &-inputs {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  &-input {
    padding: 0.5rem 1rem;
    width: 100%;
    max-width: 110px;
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

    &:focus {
      outline: none;
    }

    &.active {
      border-color: red;
      color: #181818;
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