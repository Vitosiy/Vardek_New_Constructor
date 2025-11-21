<script setup lang="ts">
// @ts-nocheck
import {computed, defineExpose, nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref, watch,} from "vue";

import MainInput from "@/components/ui/inputs/MainInput.vue";
import InteractiveSpace from "./InteractiveSpace.vue";
import SectionOptions from "@/components/2DmoduleConstructor/utils/SectionOptions.vue";
import FillingsProductions from "./utils/FillingsProductions.vue";
import FasadesOptions from "@/components/2DmoduleConstructor/utils/FasadesOptions.vue";

import {ShapeAdjuster} from "./utils/Methods";
import {FasadeMaterial, FasadeObject, GridModule, GridSection, LOOPSIDE,} from "@/types/constructor2d/interfaсes.ts";
import * as THREE from "three";
import {useAppData} from "@/store/appliction/useAppData.ts";
import {UI_PARAMS} from "@/components/2DmoduleConstructor/utils/UMConstructorConst.ts";
import {UniversalGeometryBuilder} from "@/Application/Meshes/UniversalModuleUtils/UniversalGeometryBuilder.ts";
import ModuleMaterialsConfig from "@/components/2DmoduleConstructor/utils/ModuleMaterialsConfig.vue";
import Toggle from "@vueform/toggle";
import RailsRightPage from "@/components/right-menu/customiser-pages/RailsRightPage/RailsRightPage.vue";

const {
  MIN_FASADE_HEIGHT,
  MIN_FASADE_WIDTH,
  MAX_FASADE_WIDTH,
  MAX_SECTION_WIDTH,
  MIN_SECTION_WIDTH,
  NO_FASADE_ID,
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
    type: [ref, Object],
    default: false,
    required: true,
  },
});

const isMounted = ref(false);
const mode = ref<constructorMode>('module');

const visualizationRef = ref(null);
const optionsRef = ref(null);
const materialConfRef = ref(null);
const optionsManagerRef = ref(null);

const totalHeight = ref(0);
const totalWidth = ref(0);
const totalDepth = ref(0);
const onHorizont = ref<boolean>(true);
const onSideProfile = ref<boolean>(false);

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


      const isSlidingDoors = !PROPS.CONFIG.LOOPS;
      let fasades;

      let section: GridSection = {
        number: 1,
        width: totalWidth.value - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2,
        height: totalHeight.value - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2 - PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"],
        cells: [],
        type: "section",
        position: new THREE.Vector2(PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] + (totalWidth.value - PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] * 2) / 2,
            PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] + PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"]),
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
        productID: productData.value.globalData,
        isSlidingDoors,
      }

      if(PROPS.CONFIG.isHiTech)
        _module.isHiTech = true

      if(PROPS.CONFIG.isRestrictedModule)
        _module.isRestrictedModule = true

      PROPS.CONFIG.MODULEGRID = _module

      if (isSlidingDoors) {
        let FASADE_PROPS_2 = PROPS.CONFIG.FASADE_PROPS[1]

        fasadePosition = calcSlideDoor(FASADE_PROPS.POSITION, 1)
        let fasadePosition2 = calcSlideDoor(FASADE_PROPS_2.POSITION, 2)

        fasades = [
          [
            <FasadeObject>{
              id: 1,
              width: fasadePosition.FASADE_WIDTH,
              height: fasadePosition.FASADE_HEIGHT,
              position: new THREE.Vector3(fasadePosition.POSITION_X, fasadePosition.POSITION_Y, fasadePosition.POSITION_Z),
              material: <FasadeMaterial>{
                ...FASADE_PROPS
              },
              type: "fasade",
              minY: MIN_FASADE_HEIGHT,
              maxY: fasadeColor.MAX_HEIGHT || fasadePosition.FASADE_HEIGHT,
              maxX: fasadeColor.MAX_WIDTH || MAX_FASADE_WIDTH,
              minX: MIN_FASADE_WIDTH
            }
          ],
          [
            <FasadeObject>{
              id: 2,
              width: fasadePosition2.FASADE_WIDTH,
              height: fasadePosition2.FASADE_HEIGHT,
              position: new THREE.Vector3(fasadePosition2.POSITION_X, fasadePosition2.POSITION_Y, fasadePosition2.POSITION_Z),
              material: <FasadeMaterial>{
                ...FASADE_PROPS_2
              },
              type: "fasade",
              minY: MIN_FASADE_HEIGHT,
              maxY: fasadeColor.MAX_HEIGHT || fasadePosition2.FASADE_HEIGHT,
              maxX: fasadeColor.MAX_WIDTH || MAX_FASADE_WIDTH,
              minX: MIN_FASADE_WIDTH
            }
          ]
        ]
        _module.fasades = fasades
      }
      else {
        fasades = [
          [
            <FasadeObject>{
              id: 1,
              width: FASADE.FASADE_WIDTH,
              height: FASADE.FASADE_HEIGHT - (_module.isRestrictedModule ? 0 : _module.horizont),
              position: new THREE.Vector2(FASADE.POSITION_X, FASADE.POSITION_Y),
              material: <FasadeMaterial>{
                ...FASADE_PROPS
              },
              loopsSide: LOOPSIDE["left"],
              type: "fasade",
              minY: MIN_FASADE_HEIGHT,
              maxY: fasadeColor.MAX_HEIGHT || parseInt(eval(fasadePosition.FASADE_HEIGHT)),
              maxX: fasadeColor.MAX_WIDTH || MAX_FASADE_WIDTH,
              minX: MIN_FASADE_WIDTH
            }
          ]
        ];
        section.fasades = fasades
        calcLoops(0, _module)
        section.loopsSides = {0: LOOPSIDE["left"]}
      }

    }

    return PROPS.CONFIG.MODULEGRID
  }
});

const getMinMaxModuleSize = (_dimension, _minmax) => {
  const dimension = _dimension.toUpperCase()
  const minmax = _minmax.toUpperCase()

  return +productData.value.PROPS.CONFIG.SIZE_EDIT[`SIZE_EDIT_` + dimension + `_` + minmax];
}

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

const updateFilling = (value, currentfilling, type, render = false) => {
  const {sec, cell, row} = currentfilling

  const gridCopy = Object.assign({}, module.value);

  const section = gridCopy.sections[sec];
  const currentColl = section.cells?.[cell];
  const currentRow = currentColl?.cellsRows?.[row] || currentColl || section;

  const prevValue = currentfilling[type]; //Предыдущее значение

  let newValue = parseInt(value);

  let tmpSector = currentfilling.sector
  delete currentfilling.sector

  const fillingData = JSON.parse(JSON.stringify(currentfilling));
  fillingData[type] = newValue;
  fillingData.sector = tmpSector;

  const pixiSector = currentRow.sector;

  const check = shapeAdjuster.checkToCollision(pixiSector, currentfilling.type, fillingData);
  currentfilling[type] = newValue;

  if (check) {
    delete currentfilling.error
  } else {
    currentfilling.error = true
  }

  if (newValue > MAX_SECTION_WIDTH || newValue < MIN_SECTION_WIDTH)
    currentfilling.error = true
  else
    delete currentfilling.error

  currentfilling.sector = tmpSector;
  module.value = gridCopy;

  if (render)
    visualizationRef.value.renderGrid();
};
//#endregion

//#region Фасады
const getFasadePosition = (_position) => {

  const PROPS = productData.value.PROPS;
  let fasadePosition = APP.FASADE_POSITION[_position];

  if (!fasadePosition)
    return {}

  fasadePosition = builder.getExec(
      builder.expressionsReplace(fasadePosition,
          Object.assign(PROPS.CONFIG.EXPRESSIONS,
              {
                "#X#": totalWidth.value,
                "#Y#": totalHeight.value - (module.value.isRestrictedModule ? 0 : module.value.horizont),
                "#Z#": totalDepth.value,
              }))
  )

  return fasadePosition
}

const getFasadePositionMinMax = (fasade) => {
  const fasadeColor = APP.FASADE[fasade.material.COLOR]
  const fasadePosition = getFasadePosition(fasade.material.POSITION)

  return {
    minY: MIN_FASADE_HEIGHT,
    maxY: fasadeColor.MAX_HEIGHT || fasadePosition.FASADE_HEIGHT,
    maxX: fasadeColor.MAX_WIDTH || MAX_FASADE_WIDTH,
    minX: MIN_FASADE_WIDTH,
  }
}

const updateFasades = () => {
  const correctFasadeHeight = getFasadePosition(module.value.sections[0].fasades[0][0].material.POSITION).FASADE_HEIGHT;
  if (!module.value.isSlidingDoors)
    module.value.sections.forEach((section, secIndex) => {
      if (section.fasadesDrawers?.length || section.hiTechProfiles?.length) {
        calcDrawersFasades(secIndex)
      } else if (section.fasades?.[0]) {
        const countDoors = section.fasades.length;

        const correctSectionFasadeWidth =
            module.value.sections.length > 1 ?
                secIndex > 0 && secIndex < module.value.sections.length - 1 ? section.width + module.value.moduleThickness - 4 :
                    section.width + (module.value.moduleThickness - 2) + (module.value.moduleThickness / 2 - 2) :
                module.value.width - 4;

        const correctSectionFasadeWidthDoor = Math.floor(correctSectionFasadeWidth / countDoors - ((countDoors - 1) * 2));

        const sumDoorsWidth = Math.floor(section.fasades.reduce(
            (accumulator, item, index) => accumulator + item[0].width + (index > 0 ? 4 : 0),
            0) / countDoors - ((countDoors - 1) * 2));
        const sumDoorsHeight = section.fasades[0].reduce(
            (accumulator, item, index) => accumulator + item.height + (index > 0 ? 4 : 0),
            0);

        const deltaWidth = correctSectionFasadeWidthDoor - sumDoorsWidth;
        const deltaHeight = correctFasadeHeight - sumDoorsHeight;

        if (deltaWidth !== 0) {
          section.fasades.forEach((door, doorIndex) => {
            door.forEach((segment) => {

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
          section.fasades.forEach((door) => {
            door.forEach((segment) => {
              let fasadeMinMax = getFasadePositionMinMax(segment)
              Object.entries(fasadeMinMax).forEach(([key, value]) => {
                segment[key] = value;
              })
            })

            let lastSegment = door[0]
            if (!lastSegment.manufacturerOffset) {
              lastSegment.height += deltaHeight;

              if (lastSegment.height < lastSegment.minY || lastSegment.width < lastSegment.minX)
                lastSegment.error = true
              else
                delete lastSegment.error;
            }
          })
        }

        calcLoops(secIndex)
      }

    })
  else {
    module.value.fasades.forEach((door, doorIndex) => {
      let tmp_fasadePosition = calcSlideDoor(door[0].material.POSITION, doorIndex + 1)

      const sumDoorsHeight = door.reduce(
          (accumulator, item) => accumulator + item.height,
          0);
      const deltaHeight = tmp_fasadePosition.FASADE_HEIGHT - sumDoorsHeight;

      door[door.length - 1].height += deltaHeight;
      if (door[door.length - 1].height < door[door.length - 1].minY) {
        door[0].height = tmp_fasadePosition.FASADE_HEIGHT
        door = [door[0]]
        return;
      } else
        door.forEach((segment) => {
          let fasadeMinMax = getFasadePositionMinMax(segment)
          Object.entries(fasadeMinMax).forEach(([key, value]) => {
            segment[key] = value;
          })

          segment.width = tmp_fasadePosition.FASADE_WIDTH
          segment.position.x = tmp_fasadePosition.POSITION_X
          segment.position.z = tmp_fasadePosition.POSITION_Z

          if (segment.width < segment.minX || segment.height < segment.minY)
            segment.error = true
          else
            delete segment.error;
        })
    })
  }
};

const calcDrawersFasades = (secIndex, fillingData = false) => {

  if (fillingData?.fasade) {
      fillingData.fasade.position.y = module.value.height - (fillingData.position.y + fillingData.height + fillingData.fasade.manufacturerOffset)
  }

  let baseFasade = module.value.sections[secIndex].fasades[0].find(item => !item.manufacturerOffset)
  let baseFasade2 = module.value.sections[secIndex].fasades[1]?.find(item => !item.manufacturerOffset)
  let fasadesDrawers = module.value.sections[secIndex].fasadesDrawers || []

  let baseDrawerFasade = fasadesDrawers[0]
  let fasadesList = calcDrawersFasadesPositons(secIndex) || []

  module.value.sections[secIndex].fasades[0] = []
  if (module.value.sections[secIndex].fasades[1])
    module.value.sections[secIndex].fasades[1] = []

  module.value.sections[secIndex].fasadesDrawers = fasadesDrawers.sort((a, b) => a.position.y - b.position.y)

  let drawerIndex = 0
  fasadesList.forEach((item, index) => {

    switch (item.type) {
      case "drawer":
        fasadesDrawers[drawerIndex].id = index + 1
        drawerIndex += 1
        break;
      case "fasade":
        let fasadeClone = Object.assign(<FasadeObject>{}, baseFasade)
        fasadeClone.id = index + 1
        fasadeClone.height = item.height
        fasadeClone.material = {...baseFasade.material}

        fasadeClone.position = new THREE.Vector2(baseFasade.position.x, item.y)

        if (fasadeClone.height < fasadeClone.minY || fasadeClone.width < fasadeClone.minX)
          fasadeClone.error = true
        else
          delete fasadeClone.error;

        module.value.sections[secIndex].fasades[0].push(fasadeClone)

        if (baseFasade2) {
          let fasadeClone2 = Object.assign(<FasadeObject>{}, fasadeClone)
          fasadeClone2.position = new THREE.Vector2(baseFasade2.position.x, item.y)
          fasadeClone2.material = {...fasadeClone.material}

          module.value.sections[secIndex].fasades[1].push(Object.assign(<FasadeObject>{}, fasadeClone2))
        }
        break
      default:
        break;
    }
  })

  calcLoops(secIndex)
};

const calcDrawersFasadesPositons = (secIndex) => {
  const fasadeList = []
  const CONFIG = productData.value.PROPS.CONFIG

  let moduleThickness = module.value.moduleThickness || 18
  moduleThickness = !module.value.horizont ? -2 : moduleThickness - 2

  //Ящики с фасадами
  const BOX_FASADE = module.value.sections[secIndex].fasadesDrawers || []
  const HI_TECH_PROFILES = module.value.sections[secIndex].hiTechProfiles || []

  const boxesArray = []
  BOX_FASADE.forEach((box, box_key) => {
    if (!box.position) {
      box.position = new THREE.Vector3()
    }
    boxesArray.push(box)
  })

  HI_TECH_PROFILES.forEach((_profile, box_key) => {
    let profile = Object.assign({}, _profile)
    if (!profile.position) {
      profile.position = new THREE.Vector3()
    }
    else {
      profile.position = {
        x: profile.position.x,
        y: module.value.height - (profile.position.y + profile.height + profile.isProfile.manufacturerOffset)
      }
    }
    boxesArray.push(profile)
  })

  const sortedBoxesByIncrease = boxesArray.sort((a, b) => a.position.y - b.position.y)

  let fasadePosition = getFasadePosition(APP.CATALOG.PRODUCTS[productData.value.globalData].FASADE_POSITION[0])
  if (!fasadePosition)
    return

  const otstup = 4

  let fullFasadelSize = fasadePosition.FASADE_HEIGHT
  let bottomFasadePosition = module.value.horizont + 2
  const firstFasadePosition = bottomFasadePosition

  if (!sortedBoxesByIncrease.length) {
    fasadeList.push({
      y: firstFasadePosition,
      height: fullFasadelSize,
      type: "fasade",
    })

    return fasadeList
  }

  const firstBox = sortedBoxesByIncrease[0] //нижний ящик
  if ((firstBox.position.y - (firstBox.isProfile ? 0 : otstup)) > bottomFasadePosition) {
    let firstFasadeSize = Math.abs(firstBox.position.y - (firstBox.isProfile ? 0 : otstup) - bottomFasadePosition)

    fasadeList.push({
      y: firstFasadePosition,
      height: firstFasadeSize,
      type: "fasade",
    })

    fullFasadelSize = fullFasadelSize - firstFasadeSize - (firstBox.isProfile ? 0 : otstup)
    bottomFasadePosition = bottomFasadePosition + firstFasadeSize + (firstBox.isProfile ? 0 : otstup)
  }

  for (let index = 0; index < sortedBoxesByIncrease.length; index++) {
    let box = sortedBoxesByIncrease[index]

    if (!box.position?.y) {
      box.position = new THREE.Vector3()
    }

    const boxFasadeHeight = box.isProfile && box.isProfile.offsetFasades ? box.isProfile.offsetFasades : box.height

    fasadeList.push({
      y: bottomFasadePosition,
      height: boxFasadeHeight,
      type: box.isProfile ? "profile" : "drawer",
    })

    const topBox = sortedBoxesByIncrease[index + 1]
    let upperFasadeSize = false

    fullFasadelSize = fullFasadelSize - boxFasadeHeight - (box.isProfile || topBox?.isProfile ? 0 : otstup)
    bottomFasadePosition = bottomFasadePosition + boxFasadeHeight + (box.isProfile || topBox?.isProfile ? 0 : otstup)

    //Условие для нижней планки
    if (topBox) {
      upperFasadeSize = Math.abs(topBox.position.y - bottomFasadePosition)

      if ((!box.isProfile && topBox.isProfile) && upperFasadeSize > 4) {
        bottomFasadePosition += otstup
        upperFasadeSize -= 4
      } else if ((!box.isProfile && !topBox.isProfile) && upperFasadeSize > 0) {
        upperFasadeSize -= 4
      }
    } else {
      upperFasadeSize = Math.abs(totalHeight.value - 2 - bottomFasadePosition)
    }

    if (upperFasadeSize >= MIN_FASADE_HEIGHT)
      fasadeList.push({
        y: bottomFasadePosition,
        height: upperFasadeSize,
        type: "fasade",
      })

    //Если между ящиками расстояние <= 4мм, то туда фасад не нужен, НО если информациб об этом "фасаде" не положить - сломется
    //логика приложения. Поэтому, если у нас такой промежуток есть, то мы кладём его размер и позицию, но не смещаем её и не уменьшаем\
    //общий фасад, тогда фасады отобразятся корректно.
    if (upperFasadeSize > 0) {
      fullFasadelSize = fullFasadelSize - upperFasadeSize - (box.isProfile || topBox?.isProfile ? 0 : otstup)
      bottomFasadePosition = bottomFasadePosition + upperFasadeSize + (box.isProfile || topBox?.isProfile ? 0 : otstup)
    }
  }

  if (fullFasadelSize >= MIN_FASADE_HEIGHT)
    fasadeList.push({
      y: bottomFasadePosition,
      height: fullFasadelSize,
      type: "fasade",
    })

  return fasadeList
}

const calcSlideDoor = (fasadePositionID, doorNumber, callback) => {
  const PROPS = productData.value.PROPS;

  const fasadeThickness = module.value?.moduleThickness || 18

  const doorsCount = module.value?.fasades?.length || 2
  const doorsPortalWidth = totalWidth.value - fasadeThickness * 2
  const horizont = module.value?.horizont || 78

  let fasadePosition = Object.assign({}, APP.FASADE_POSITION[fasadePositionID]);

  let fasade_width
  switch (doorsCount) {
    case 4:
      fasade_width = (doorsPortalWidth + 25 * 2) / 4
      break;
    default:
      fasade_width = (doorsPortalWidth + 25 * (doorsCount - 1)) / doorsCount
      break;
  }
  fasade_width = Math.ceil(fasade_width)

  fasadePosition = builder.getExec(
      builder.expressionsReplace(
          fasadePosition,
          Object.assign(PROPS.CONFIG.EXPRESSIONS,
              {
                "#X#": fasade_width,
                "#Y#": totalHeight.value - horizont,
                "#Z#": totalDepth.value,
                "#FASADE_THICKNESS#": fasadeThickness || 0,
              })
      )
  );

  //Вычитаем размеры направляющих в дверях-купе
  fasadePosition.FASADE_HEIGHT -= fasadeThickness * 2
  fasadePosition.DOORS_OVERFLOW = Math.abs(doorsPortalWidth - fasadePosition.FASADE_WIDTH * doorsCount) / (doorsCount - 1)

  fasadePosition.POSITION_Y = 11

  fasadePosition.POSITION_Y += horizont + fasadeThickness
  fasadePosition.POSITION_X += fasadeThickness

  if (doorNumber > 1) {
    switch (doorsCount) {
      case 4:
        switch (doorNumber) {
          case 4:
            fasadePosition.POSITION_X -= 50
            break;
          default:
            fasadePosition.POSITION_X -= 25
            break;
        }
        break;
      default:
        fasadePosition.POSITION_X -= 25 * (doorNumber - 1)
        break;
    }
  }

  if (doorNumber && fasadePosition.FASADE_NUMBER != doorNumber) {
    fasadePosition.FASADE_NUMBER = doorNumber
  }

  if (doorNumber > 1) {
    fasadePosition.POSITION_X += fasadePosition.FASADE_WIDTH * (doorNumber - 1)
  }

  if (callback)
    callback(fasadePosition)
  else
    return fasadePosition
}
//#endregion

//#region Петли
const calcLoops = (secIndex, grid = false) => {
  const CONFIG = productData.value.PROPS.CONFIG

  if (!CONFIG.LOOPS)
    return

  const curSection = grid ? grid.sections[secIndex] : module.value.sections[secIndex]
  const FASADES = curSection.fasades || []
  curSection.loops = []

  FASADES.forEach((door, doorKey) => {
    const additional_fasades = []

    door.forEach((fasade, key) => {
      additional_fasades.push(fasade)
    })

    let loopsPos = calcLoopPositions(additional_fasades, curSection)

    if (loopsPos.length)
      curSection.loops.push(loopsPos)
  })

  if (!curSection.loops.length)
    delete curSection.loops
  else if (!grid)
    checkLoopsCollision(secIndex)
}

const calcLoopPositions = (fasades, section) => {

  let allLoops = []

  const defaultPos = 102
  const lowSizePos1 = 74
  const lowSizePos2 = 93

  fasades.forEach((fasade, key) => {

    const fasadeLoops = {
      side: fasade.loopsSide,
      coords: [],
      errors: [],
      height: 82,
      width: 38,
      type: 'loop',
      positionX: LOOPSIDE[fasade.loopsSide]?.includes("left") ? section.position.x - section.width / 2 : section.position.x + section.width / 2 - 38,
    }

    const fasadeSize = fasade.height;
    const quarterPos = fasadeSize / 4
    const oneThirdPos = fasadeSize / 3
    const secondPos = fasadeSize / 2

    const position = fasade.position.y

    //исключения по размерам
    if (fasadeSize === 2036) {
      //Отступ 658 от краев фасада
      fasadeLoops.coords = []
      fasadeLoops.coords.push((position + defaultPos).toFixed(1))
      fasadeLoops.coords.push((position + 658).toFixed(1))
      fasadeLoops.coords.push((position + fasadeSize - 658).toFixed(1))
      fasadeLoops.coords.push((position + fasadeSize - defaultPos).toFixed(1))
    } else if (fasadeSize === 536) {
      //Отступ 93 от краев фасада
      fasadeLoops.coords = []
      fasadeLoops.coords.push((position + lowSizePos2).toFixed(1))
      fasadeLoops.coords.push((position + fasadeSize - lowSizePos2).toFixed(1))
    }//
    else if (fasadeSize >= 2064) {
      fasadeLoops.coords.push((position + defaultPos).toFixed(1))
      fasadeLoops.coords.push((position + quarterPos).toFixed(1))
      fasadeLoops.coords.push((position + quarterPos * 2).toFixed(1))
      fasadeLoops.coords.push((position + quarterPos * 3).toFixed(1))
      fasadeLoops.coords.push((position + fasadeSize - defaultPos).toFixed(1))
    } else if (fasadeSize < 2064 && fasadeSize > 1500) {
      fasadeLoops.coords.push((position + defaultPos).toFixed(1))
      fasadeLoops.coords.push((position + oneThirdPos).toFixed(1))
      fasadeLoops.coords.push((position + oneThirdPos * 2).toFixed(1))
      fasadeLoops.coords.push((position + fasadeSize - defaultPos).toFixed(1))
    } else if (fasadeSize <= 1500 && fasadeSize > 1000) {
      fasadeLoops.coords.push((position + defaultPos).toFixed(1))
      fasadeLoops.coords.push((position + secondPos).toFixed(1))
      fasadeLoops.coords.push((position + fasadeSize - defaultPos).toFixed(1))
    } else if (fasadeSize <= 1000 && fasadeSize > 400) {
      fasadeLoops.coords.push((position + defaultPos).toFixed(1))
      fasadeLoops.coords.push((position + fasadeSize - defaultPos).toFixed(1))
    } else if (400 >= fasadeSize && fasadeSize >= 360) {
      fasadeLoops.coords.push((position + lowSizePos1).toFixed(1))
      fasadeLoops.coords.push((position + fasadeSize - lowSizePos1).toFixed(1))
    }

    fasadeLoops.coords = fasadeLoops.coords.map((item) => parseInt(item))
    allLoops.push(fasadeLoops)
  })

  return allLoops
}

const checkLoopsCollision = (secIndex, cellIndex = null, rowIndex = null, fasadeSegmentIndex = null) => {
  const CONFIG = productData.value.PROPS.CONFIG

  if (!CONFIG.LOOPS)
    return

  const currentSection = module.value.sections[secIndex];
  const currentCol = currentSection.cells?.[cellIndex];
  const currentRow = currentCol?.cellsRows?.[rowIndex];
  const currentFasade = currentSection.fasades?.[cellIndex]?.[fasadeSegmentIndex];
  const moduleThickness = module.value.moduleThickness

  const currentSector = currentFasade || currentRow || currentCol || currentSection
  const loops = currentSection.loops

  if (!loops)
    return

  let loopsSectors = {}
  Object.entries(loops).forEach(([doorKey, doorLoops]) => {
    loopsSectors[doorKey] = {}
    doorLoops.forEach((fasade, fasadeKey) => {
      loopsSectors[doorKey][fasadeKey] = []
      fasade.coords.forEach((coord, key) => {
        loopsSectors[doorKey][fasadeKey].push({
          id: key,
          minY: coord,
          maxY: coord + fasade.height,
          minX: fasade.positionX,
          maxX: fasade.positionX + fasade.width,
        })
      })
    })
    /*
        loopsSectors[doorKey] = loopsSectors[doorKey].sort((a, b) => {
          return a.minY - b.minY
        })*/
  })

  if (currentSector.cells?.length) {
    Object.entries(loopsSectors).forEach(([doorKey, fasades]) => {
      Object.entries(fasades).forEach(([fasadeKey, _loops]) => {
        loops[doorKey][fasadeKey].errors = []
        currentSector.cells.forEach((cell, cellKey) => {
          _loops.forEach(loop => {
            if (
                (loop.minY <= (cell.position.y - moduleThickness) && loop.maxY >= (cell.position.y - moduleThickness)) ||
                (loop.minY <= cell.position.y && loop.maxY >= cell.position.y)
            ) {
              if (!loops[doorKey]?.[fasadeKey]?.errors.includes(loop.id))
                loops[doorKey][fasadeKey].errors.push(loop.id)
            }
          })
        })
      })
    })
  } else {
    Object.entries(loopsSectors).forEach(([doorKey, fasades]) => {
      Object.entries(fasades).forEach(([fasadeKey, _loops]) => {
        loops[doorKey][fasadeKey].errors = []
        _loops.forEach(loop => {
          if (
              (loop.minY <= (currentSector.position.y - moduleThickness) && loop.maxY >= (currentSector.position.y - moduleThickness)) ||
              (loop.minY <= currentSector.position.y && loop.maxY >= currentSector.position.y)
          ) {
            if (!loops[doorKey]?.[fasadeKey]?.errors.includes(loop.id))
              loops[doorKey][fasadeKey].errors.push(loop.id)
          }
        })
      })
    })
  }

  return loops;

}

//#endregion

//#region Модуль
const updateHorizont = (value) => {
  debounce(() => {
    const PROPS = productData.value.PROPS;

    let delta = parseInt(value) - PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"]
    module.value.sections.forEach((section, secIndex) => {
      section.position.y += delta
      section.fasades.forEach((door) => {
        door.forEach((segment) => {
          segment.position.y += delta;
        })
      })
    })

    module.value.horizont = PROPS.CONFIG.HORIZONT = PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"] = parseInt(value);
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
      selectedFilling.value = {sec: secIndex, cell: cellIndex, row: rowIndex, item: item};
      break;
  }

  optionsRef.value.handleCellSelect?.(secIndex, cellIndex, rowIndex, item);
};

const initSideProfile = () => {
  if (!module.value.profilesConfig?.sideProfile) {

    const product = APP.CATALOG.PRODUCTS[6513251] //C - образный профиль
    let profileData = {}

    if (!module.value.profilesConfig) {
      module.value.profilesConfig = {COLOR: product.COLOR[0] != null ? product.COLOR[0] : module.value.moduleColor}
      module.value.profilesConfig.colorsList = [...product.COLOR]
      productData.value.PROPS.CONFIG['PROFILECOLOR'] = module.value.profilesConfig.COLOR
    }

    profileData.COLOR = module.value.profilesConfig?.COLOR ? module.value.profilesConfig?.COLOR : module.value.moduleColor

    let typeProfile = product.NAME.toLowerCase().split("-")[0].replace(/\s/g, '')
    if (typeProfile !== "c" && typeProfile !== "l")
      typeProfile = typeProfile.split(",").pop().replace(/\s/g, '')

    profileData.isProfile = true
    profileData.TYPE_PROFILE = typeProfile
    profileData.offsetFasades = typeProfile == "c" ? 36 : typeProfile == "l" ? 38 : 0
    profileData.manufacturerOffset = typeProfile == "c" ? -18.5 : typeProfile == "l" ? -19.5 : 0
    profileData.size = {x: module.value.height, y: product.height, z: product.depth}
    profileData.product = 6513251

    profileData.side = LOOPSIDE[module.value.sections[0].loopsSides[0]]?.includes("left") ? "left" : "right"
    const profileSidesMap = {
      "right": new THREE.Vector2( -profileData.manufacturerOffset - profileData.size.y / 2, 0),
      "left": new THREE.Vector2( module.value.width + profileData.manufacturerOffset + profileData.size.y / 2, 0),
    }
    const profileRotationMap = {
      "right": Math.PI / 2,
      "left": -Math.PI / 2,
    }

    profileData.position = profileSidesMap[profileData.side];
    profileData.rotation = new THREE.Vector3(0, 0, profileRotationMap[profileData.side]);

    module.value.profilesConfig.sideProfile = profileData
    onSideProfile.value = true
  }
  else {
    delete module.value.profilesConfig.sideProfile
    onSideProfile.value = false
  }

}
//#endregion

const reset = (reset = false, moduleGrid = false) => {
  const PROPS = productData.value.PROPS;

  module.value.moduleColor = PROPS.CONFIG.MODULE_COLOR;
  module.value.moduleThickness = PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] || 18;
  module.value.horizont = PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"] || 0;

  let sectionsTotalWidth = totalWidth.value - module.value.moduleThickness * 2 - (module.value.sections.length - 1) * module.value.moduleThickness;
  let sectionsTotalHeight = totalHeight.value - module.value.moduleThickness * 2 - PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"];
  let sectionsWidthSum = 0;

  module.value.sections.forEach((section, secIndex) => {
    sectionsWidthSum += section.width;
  })

  if (sectionsTotalWidth - sectionsWidthSum !== 0) {
    let deltaWidth = sectionsTotalWidth - sectionsWidthSum;
    let lastSection = module.value.sections[module.value.sections.length - 1];

    lastSection.position.x = lastSection.position.x - lastSection.width / 2 + (lastSection.width + deltaWidth) / 2

    lastSection.width += deltaWidth

    if (lastSection.width > MAX_SECTION_WIDTH) {
      let countSections = Math.floor(lastSection.width / MAX_SECTION_WIDTH);
      optionsRef.value.addSection?.(module.value.sections.length - 1, countSections)
    }
    else if (lastSection.width < MIN_SECTION_WIDTH) {
      while (module.value.sections[module.value.sections.length - 1].width < MIN_SECTION_WIDTH) {
        optionsRef.value.deleteSection?.(module.value.sections.length - 1)
      }
    }
    else {
      lastSection.cells.forEach((cell, cellIndex) => {

        if (cell.cellsRows) {
          let lastRow = cell.cellsRows[cell.cellsRows.length - 1]
          lastRow.position.x = lastRow.position.x - lastRow.width / 2 + (lastRow.width + deltaWidth) / 2
          lastRow.width += deltaWidth;
          if (lastRow.fillings?.length)
            lastRow.fillings.forEach((filling, index) => {
              updateFilling(lastRow.width, filling, 'width')
            })
        }
        cell.width = lastSection.width;
        cell.position.x += lastSection.position.x

        if (cell.fillings?.length)
          cell.fillings.forEach((filling, index) => {
            updateFilling(cell.width, filling, 'width')
          })
      })

      if (lastSection.fillings?.length) {
        lastSection.fillings.forEach((filling, index) => {
          updateFilling(lastSection.width, filling, 'width')
        })
      }
    }

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
  return Object.assign({}, module.value);
};

defineExpose({
  saveGrid,
});

onBeforeMount(() => {
  productData.value = props.productData //menuStore.catalogFilterProductsId[0]

  totalHeight.value = productData.value.PROPS?.CONFIG.MODULEGRID?.height || productData.value.PROPS?.CONFIG.SIZE.height || props.canvasHeight;
  totalWidth.value = productData.value.PROPS?.CONFIG.MODULEGRID?.width || productData.value.PROPS?.CONFIG.SIZE.width || props.canvasWidth;
  totalDepth.value = productData.value.PROPS?.CONFIG.MODULEGRID?.depth || productData.value.PROPS?.CONFIG.SIZE.depth || 0;
  onHorizont.value = productData.value.PROPS?.CONFIG.EXPRESSIONS["#HORIZONT#"] > 0;
  onSideProfile.value = !!productData.value.PROPS?.CONFIG.MODULEGRID?.profilesConfig?.sideProfile;
});

onMounted(() => {
  shapeAdjuster = new ShapeAdjuster({});
  nextTick().then(() => {
    isMounted.value = true;
  });
});

onBeforeUnmount(() => {
  shapeAdjuster = null;
  module.value = null;
  onHorizont.value = false
  onSideProfile.value = false
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

watch(onHorizont, () => {

  if (!onHorizont.value)
    updateHorizont(0)
  else
    updateHorizont(78)
});
</script>

<template>
  <div class="constructor2d-wrapper">

    <div
        class="constructor2d-container constructor2d-container--left"
    >

      <div
          class="constructor2d-container--left--module-configs"
      >

        <div class="actions-sections-header">
          <h1>Размеры модуля</h1>
        </div>

        <div
            class="constructor2d-container--left--module-configs--module-size"
        >

          <div class="constructor2d-container--left--module-configs--module-size-item actions-inputs">
            <p class="actions-title">Высота модуля <img v-if="mode !== 'module'" class="cut-icon" src="/icons/lock.svg" alt="" title="Редактирование размеров доступно только в режиме 'Модуль'" /></p>
            <div class="actions-input--container">
              <MainInput
                  :disabled="mode !== 'module'"
                  @update:modelValue="updateTotalHeight"
                  :inputClass="'actions-input'"
                  :modelValue="totalHeight"
                  :min="getMinMaxModuleSize('height', 'min')"
                  :max="getMinMaxModuleSize('height', 'max')"
                  :type="'number'"
              />
            </div>
          </div>

          <div class="constructor2d-container--left--module-configs--module-size-item actions-inputs">
            <p class="actions-title">Ширина модуля <img v-if="mode !== 'module'" class="cut-icon" src="/icons/lock.svg" alt="" title="Редактирование размеров доступно только в режиме 'Модуль'" /> </p>
            <div class="actions-input--container">
              <MainInput
                  :disabled="mode !== 'module'"
                  @update:modelValue="updateTotalWidth"
                  :inputClass="'actions-input'"
                  :modelValue="totalWidth"
                  :min="getMinMaxModuleSize('width', 'min')"
                  :max="getMinMaxModuleSize('width', 'max')"
                  :type="'number'"
              />
            </div>
          </div>

          <div class="constructor2d-container--left--module-configs--module-size-item actions-inputs">
            <p class="actions-title">Глубина модуля <img v-if="mode !== 'module'" class="cut-icon" src="/icons/lock.svg" alt="" title="Редактирование размеров доступно только в режиме 'Модуль'" /></p>
            <div class="actions-input--container">
              <MainInput
                  :disabled="mode !== 'module'"
                  @update:modelValue="updateTotalDepth"
                  :inputClass="'actions-input'"
                  :modelValue="totalDepth"
                  :min="getMinMaxModuleSize('depth', 'min')"
                  :max="getMinMaxModuleSize('depth', 'max')"
                  :type="'number'"
              />
            </div>
          </div>

          <div
              v-if="!module.isRestrictedModule"
              class="constructor2d-container--left--module-configs--module-size-item actions-inputs"
          >
            <p class="actions-title">Цоколь
              <img v-if="mode !== 'module'" class="cut-icon" src="/icons/lock.svg" alt="" title="Редактирование размеров доступно только в режиме 'Модуль'" />
              <Toggle v-else v-model="onHorizont"/>
            </p>

            <div class="actions-input--container">
              <MainInput
                  @update:modelValue="updateHorizont"
                  :inputClass="'actions-input'"
                  :modelValue="productData.PROPS.CONFIG.EXPRESSIONS['#HORIZONT#']"
                  min="78"
                  max="300"
                  :type="'number'"
                  placeholder="0"
                  :disabled="mode !== 'module' || productData.PROPS.CONFIG.EXPRESSIONS['#HORIZONT#'] === 0"
              />
            </div>
          </div>

          <div
              v-if="productData.PROPS.CONFIG.isHiTech"
              class="constructor2d-container--left--module-configs--module-size-item actions-inputs"
          >
            <p class="actions-title">Боковой профиль</p>
            <Toggle
                v-model="onSideProfile"
                @change="initSideProfile"
            />
          </div>

        </div>

        <div class="actions-sections-header">
          <h1>Параметры модуля</h1>
        </div>

        <div
            class="constructor2d-container--left--module-configs--module-color"
        >
          <ModuleMaterialsConfig
              ref="materialConfRef"
              :visualizationRef="visualizationRef"
              :module="module"
              :objectData="productData"
              @product-reset="reset"
          />
        </div>

        <div class="actions-sections-header">
          <h1>Опции</h1>
        </div>

        <RailsRightPage style="margin-top: 5px"/>

      </div>

    </div>

    <div
        id="midAreaUM2Dconstructor"
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
            @calcDrawersFasades="calcDrawersFasades"
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
            @product-calcLoops="calcLoops"
            @product-checkLoopsCollision="checkLoopsCollision"
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
            @product-calcLoops="calcLoops"
            @product-checkLoopsCollision="checkLoopsCollision"
            @product-calcDrawersFasades="calcDrawersFasades"
            @product-getFasadePositionMinMax="getFasadePositionMinMax"
            @product-calcSlideDoor="calcSlideDoor"
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
            :shapeAdjuster="shapeAdjuster"
            :fillings="getFillings"
            :step="step"
            @product-updateFilling="updateFilling"
            @product-updateFasades="updateFasades"
            @product-calcDrawersFasades="calcDrawersFasades"
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
      max-width: 20vw;
      overflow: hidden;

      &--module-configs {
        position: absolute;
        overflow: scroll;
        max-height: 90vh;
        width: 18.5vw;

        &--module-size {
          display: flex;
          flex-direction: row;
          gap: 1.5rem;
          flex-wrap: wrap;
          justify-content: flex-start;
          align-items: center;
          align-content: space-between;
          margin-top: 5px;
          &-item {
            padding-bottom: 15px;
          }
        }

        &--module-color {
          display: flex;
          flex-direction: column;
        }

        &::-webkit-scrollbar {
          width: 2px;
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
    }

    &--mid {
      flex-direction: column;
      max-width: 60vw;
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
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
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
