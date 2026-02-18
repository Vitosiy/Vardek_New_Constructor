<script setup lang="ts">
// @ts-nocheck
import {computed, defineExpose, nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref, watch,} from "vue";

import MainInput from "@/components/ui/inputs/MainInput.vue";
import InteractiveSpace from "./InteractiveSpace.vue";
import SectionOptions from "@/components/2DmoduleConstructor/utils/SectionOptions.vue";
import FillingsProductions from "./utils/FillingsProductions.vue";
import FasadesOptions from "@/components/2DmoduleConstructor/utils/FasadesOptions.vue";

import {ShapeAdjuster} from "./utils/Methods";
import {
  ErrorItem, ErrorsMessage, ErrorsType,
  FasadeMaterial,
  FasadeObject, FillingObject,
  GridCell, GridCellsRow,
  GridModule, GridRowExtra,
  GridSection,
  LOOPSIDE,
} from "@/types/constructor2d/interfaсes.ts";
import * as THREE from "three";
import {useAppData} from "@/store/appliction/useAppData.ts";
import {UI_PARAMS} from "@/components/2DmoduleConstructor/utils/UMConstructorConst.ts";
import {UniversalGeometryBuilder} from "@/Application/Meshes/UniversalModuleUtils/UniversalGeometryBuilder.ts";
import ModuleMaterialsConfig from "@/components/2DmoduleConstructor/utils/ModuleMaterialsConfig.vue";
import Toggle from "@vueform/toggle";
import RailsRightPage from "@/components/right-menu/customiser-pages/RailsRightPage/RailsRightPage.vue";
import {useModelState} from "@/store/appliction/useModelState.ts";
import {useConversationActions} from "@/components/right-menu/actions/useConversationActions.ts";
import {TFasadeTrueSizes} from "@/types/types.ts";
import {useEventBus} from "@/store/appliction/useEventBus.ts";
import {useToast} from "@/features/toaster/useToast.ts";

const {
  MIN_FASADE_HEIGHT,
  MIN_SECTION_HEIGHT,
  MIN_FASADE_WIDTH,
  MAX_FASADE_WIDTH,
  MAX_SECTION_WIDTH,
  MIN_SECTION_WIDTH,
  NO_FASADE_ID,
} = UI_PARAMS;

const {
  createFasadeConversations,
  checkConversations,
  checkFasadeConversations,
  filterFasadeConversations,
} = useConversationActions();

type constructorMode = 'module' | 'fasades' | 'fillings';

const emit = defineEmits(["save-table-data"]);

let shapeAdjuster = null;
const APP = useAppData().getAppData;
const modelState = useModelState()
const eventBus = useEventBus()
const toaster = useToast();

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
const noBottom = ref<boolean>(false);
const noBackwall = ref<boolean>(false);
const noLoops = ref<boolean>(false);

const module = ref(false);
const computeModule = () => {
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
        leftWallThickness: PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] || 18,
        rightWallThickness: PROPS.CONFIG.EXPRESSIONS["#MATERIAL_THICKNESS#"] || 18,
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

        if(_module.isRestrictedModule) {
          let fasade_width = (FASADE.FASADE_WIDTH / 2) - 2
          fasades = [
            [
              <FasadeObject>{
                id: 1,
                width: fasade_width,
                height: FASADE.FASADE_HEIGHT,
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
            ],
            [
              <FasadeObject>{
                id: 1,
                width: fasade_width,
                height: FASADE.FASADE_HEIGHT,
                position: new THREE.Vector2(FASADE.POSITION_X + fasade_width + 4 , FASADE.POSITION_Y),
                material: <FasadeMaterial>{
                  ...FASADE_PROPS
                },
                loopsSide: LOOPSIDE["right"],
                type: "fasade",
                minY: MIN_FASADE_HEIGHT,
                maxY: fasadeColor.MAX_HEIGHT || parseInt(eval(fasadePosition.FASADE_HEIGHT)),
                maxX: fasadeColor.MAX_WIDTH || MAX_FASADE_WIDTH,
                minX: MIN_FASADE_WIDTH
              }
            ]
          ];
        }
        else
          fasades = [
            [
              <FasadeObject>{
                id: 1,
                width: FASADE.FASADE_WIDTH,
                height: FASADE.FASADE_HEIGHT - _module.horizont,
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

    module.value = PROPS.CONFIG.MODULEGRID
  }
  else
    module.value = false
}
const getModule = computed(() => {
  return module
})

const checkOptionsChanged = () => {
  const {PROPS} = modelState.getCurrentModel.userData;

  PROPS.CONFIG.OPTIONS.forEach(option => {
    switch (+option.id) {
      case 5738924:
        if(option.active) {
          noBottom.value = true
          module.value.noBottom = true
          module.value.horizont = PROPS.CONFIG.HORIZONT = 0
        }
        else {
          noBottom.value = false
          delete module.value.noBottom
        }
        break;
      case 1795067: //Опция без петель
        if(option.active) {
          noLoops.value = true
          module.value.noLoops = true
        }
        else {
          noLoops.value = false
          delete module.value.noLoops
        }
        break;
      default:
        break;
    }
  })

  checkNoBackwall()
  reset()
}


const checkNoBackwall = () => {
  const {PROPS} = modelState.getCurrentModel.userData;

  if(!PROPS.CONFIG.BACKWALL?.COLOR){
    noBackwall.value = true
    module.value.noBackwall = true
  }
  else {
    noBackwall.value = false
    module.value.noBackwall = false
  }

  return noBackwall.value
}

const checkOptionWithoutBottom = () => {
  const {PROPS} = modelState.getCurrentModel.userData;

  if(PROPS.CONFIG.OPTIONS.find((opt, index) => {
    if (+opt.id === 5738924 && opt.active)
      return opt;
  })) {
    noBottom.value = true
    module.value.noBottom = true
    module.value.horizont = PROPS.CONFIG.HORIZONT = 0
  }
  else {
    noBottom.value = false
    delete module.value.noBottom
  }

  checkNoBackwall()

  return noBottom.value
}

const getMinMaxModuleSize = (_dimension, _minmax) => {
  const dimension = _dimension.toUpperCase()
  const minmax = _minmax.toUpperCase()

  return +productData.value.PROPS.CONFIG.SIZE_EDIT[`SIZE_EDIT_` + dimension + `_` + minmax];
}

const selectedCell = ref({sec: 0, cell: 0, row: null, extra: null});
const selectedFasade = ref({sec: 0, cell: 0, row: 0});
const selectedFilling = ref({sec: 0, cell: 0, row: null, extra: null, item: 0});

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
      groupID: fillingsGroup.ID,
      items: fillingsGroup.PRODUCTS.map(item => {
        return APP.CATALOG.PRODUCTS[item]
      }).filter(item => item)
    })
  })

  return objectsMatrix;
});

const updateFilling = (value, currentfilling, type, render = false) => {
  const {sec, cell, row, extra, item} = currentfilling

  const gridCopy = Object.assign({}, module.value);

  const section = gridCopy.sections[sec];
  const currentCell = section.cells?.[cell];
  const currentRow = currentCell?.cellsRows?.[row];
  const currentExtra =  currentRow?.extras?.[extra];

  const current = currentExtra || currentRow || currentCell || section;
  const prevValue = currentfilling[type]; //Предыдущее значение
  let newValue = parseInt(value);
  const delta = prevValue - newValue

  let tmpSector = currentfilling.sector
  delete currentfilling.sector

  const fillingData = JSON.parse(JSON.stringify(currentfilling));
  fillingData[type] = newValue;
  fillingData.sector = tmpSector;

  const pixiSector = current.sector;

  const check = pixiSector ? shapeAdjuster.checkToCollision(pixiSector, currentfilling.type, fillingData) : true;

  if (check && (newValue < MAX_SECTION_WIDTH || newValue > MIN_SECTION_WIDTH)) {
    delete currentfilling.error
    currentfilling[type] = newValue;

    if(type === "width") {
      currentfilling.size.x = newValue
      currentfilling.position.x = current.position.x - newValue / 2;
    }
    if(type === "height") {
      currentfilling.size.y = newValue
      currentfilling.position.y = current.position.y;
      currentfilling.distances.bottom = 0;
      currentfilling.distances.top = 0;
    }

  } else {
    currentfilling.error = true
    currentfilling[type] = prevValue;
  }

  if(currentfilling.type === 'vertical_shelf') {
    currentfilling.width = module.value.moduleThickness
    currentfilling.size.x = module.value.moduleThickness
  }

  if(currentfilling.type === 'shelf') {
    currentfilling.height = module.value.moduleThickness
    currentfilling.size.y = module.value.moduleThickness
  }

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
  const {PROPS} = modelState.getCurrentModel.userData;
  const {PRODUCT} = PROPS

  let productInfo = APP.CATALOG.PRODUCTS[PRODUCT];
  let fasadePosition = getFasadePosition(productInfo.FASADE_POSITION[0]);

  const correctFasadeHeight = fasadePosition.FASADE_HEIGHT;
  const leftWidth = module.value.leftWallThickness || module.value.moduleThickness;
  const rightWidth = module.value.rightWallThickness || module.value.moduleThickness;

  if (!module.value.isSlidingDoors)
    module.value.sections.forEach((section, secIndex) => {

      if (section.fasades?.[0]) {
        const countDoors = section.fasades.length;

        const correctSectionFasadeWidth =
            module.value.sections.length > 1 ?
                secIndex > 0 && secIndex < module.value.sections.length - 1 ? section.width + module.value.moduleThickness - 4 :
                    section.width + ((secIndex == 0 ? leftWidth : rightWidth) - 2) + (module.value.moduleThickness / 2 - 2) :
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

              const checkConversation = checkFasadeConversations(
                  segment.material.COLOR,
                  <TFasadeTrueSizes>{FASADE_WIDTH: segment.width, FASADE_HEIGHT: segment.height}
              );

              if (!checkConversation || segment.width < segment.minX || segment.height < segment.minY)
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

              const checkConversation = checkFasadeConversations(
                  lastSegment.material.COLOR,
                  <TFasadeTrueSizes>{FASADE_WIDTH: lastSegment.width, FASADE_HEIGHT: lastSegment.height}
              );

              if (!checkConversation || lastSegment.height < lastSegment.minY || lastSegment.width < lastSegment.minX)
                lastSegment.error = true
              else
                delete lastSegment.error;
            }
          })
        }

      }

      if (section.fasadesDrawers?.length || section.hiTechProfiles?.length) {
        calcDrawersFasades(secIndex)
      }

      calcLoops(secIndex)
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

          const checkConversation = checkFasadeConversations(
              segment.material.COLOR,
              <TFasadeTrueSizes>{FASADE_WIDTH: segment.width, FASADE_HEIGHT: segment.height}
          );

          if (!checkConversation || segment.width < segment.minX || segment.height < segment.minY)
            segment.error = true
          else
            delete segment.error;
        })
    })
  }
};

const calcDrawersFasades = (secIndex, fillingData = false) => {

  if (fillingData) {
    if(fillingData.fasade) {
      fillingData.fasade.position.y = module.value.height - (fillingData.position.y + fillingData.height + fillingData.fasade.manufacturerOffset)

      let drawerInfoId = module.value.sections[secIndex].fasadesDrawers.findIndex(item => item.item == fillingData.id)
      module.value.sections[secIndex].fasadesDrawers[drawerInfoId] = fillingData.fasade
    }

    if(fillingData.isProfile){
      let profileInfoId = module.value.sections[secIndex].hiTechProfiles.findIndex(item => item.id == fillingData.id)
      module.value.sections[secIndex].hiTechProfiles[profileInfoId] = fillingData
    }
  }

  const leftWidth = module.value.leftWallThickness || module.value.moduleThickness;
  const rightWidth = module.value.rightWallThickness || module.value.moduleThickness;
  const currentSection = module.value.sections[secIndex];
  const correctSectionFasadeWidth =
      module.value.sections.length > 1 ?
          secIndex > 0 && secIndex < module.value.sections.length - 1 ? currentSection.width + module.value.moduleThickness - 4 :
              currentSection.width + ((secIndex == 0 ? leftWidth : rightWidth) - 2) + (module.value.moduleThickness / 2 - 2) :
          module.value.width - 4;


  let fasadePosition = getFasadePosition()
  let baseFasade = module.value.sections[secIndex]?.fasades?.[0]?.find(item => !item.manufacturerOffset)

  if(!baseFasade) {
    const PROPS = productData.value.PROPS;

    const FASADE_PROPS = PROPS.CONFIG.FASADE_PROPS[0];
    const FASADE = getFasadePosition(FASADE_PROPS.POSITION);

    const width = currentSection.fasades[0]?.[0] ? Math.floor(currentSection.fasades[0][0].width / 2 - 2) :
        module.value.sections.length === 1 ? module.value.width - 4 :
            (secIndex > 0 && secIndex < module.value.sections.length - 1) ? currentSection.width + module.value.moduleThickness - 4 :
                currentSection.width + ((secIndex == 0 ? leftWidth : rightWidth) - 2) + (module.value.moduleThickness / 2 - 2);

    let startX = secIndex > 0 ? currentSection.position.x - currentSection.width / 2 - module.value.moduleThickness / 2 + 2 : FASADE.POSITION_X;

    let newDoorPosition = new THREE.Vector2(startX, module.value.isRestrictedModule ? FASADE.POSITION_Y : module.value.horizont + 2);
    baseFasade = <FasadeObject>{
      id: 1,
      width,
      height: module.value.height - module.value.horizont - 4,
      position: newDoorPosition,
      type: "fasade",
      material: <FasadeMaterial>{
        ...FASADE_PROPS,
      },
    };
    let fasadeMinMax = getFasadePositionMinMax(baseFasade);
    baseFasade = Object.assign(baseFasade, fasadeMinMax);
    baseFasade.loopsSide = LOOPSIDE['none']
  }

  let baseFasade2 = module.value.sections[secIndex].fasades[1]?.find(item => !item.manufacturerOffset)
  let fasadesDrawers = module.value.sections[secIndex].fasadesDrawers || []

  let baseDrawerFasade = fasadesDrawers[0]
  let fasadesList = calcDrawersFasadesPositons(secIndex) || []

  module.value.sections[secIndex].fasades[0] = []
  if (module.value.sections[secIndex].fasades[1])
    module.value.sections[secIndex].fasades[1] = []

  module.value.sections[secIndex].fasadesDrawers = fasadesDrawers.sort((a, b) => a.position.y - b.position.y)

  let drawerIndex = 0
  fasadesList = fasadesList.filter((item) => {
    return item.type != "profile"
  })

  fasadesList.forEach((item, index) => {

    switch (item.type) {
      case "drawer":
        fasadesDrawers[drawerIndex].id = index + 1
        fasadesDrawers[drawerIndex].width = correctSectionFasadeWidth
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
          fasadeClone2.loopsSide = baseFasade2.loopsSide

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
  const curGrid = grid || module.value

  if (!CONFIG.LOOPS)
    return

  const curSection = curGrid.sections[secIndex]

  if(curGrid.noLoops){
    delete curSection.loops
    delete curSection.loopsSides
    return;
  }

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

  const errorItem =  <ErrorItem>{
    type: ErrorsType['loops'],
    message: ErrorsMessage['loops'],
    sections: {}
  }

  let loopsSectors = {}
  Object.entries(loops).forEach(([doorKey, doorLoops]) => {
    loopsSectors[doorKey] = {}
    doorLoops.forEach((_loops, fasadeKey) => {
      loopsSectors[doorKey][fasadeKey] = []
      _loops.coords.forEach((coord, key) => {
        loopsSectors[doorKey][fasadeKey].push({
          id: key,
          minY: coord - _loops.height / 2,
          maxY: coord + _loops.height / 2,
          minX: _loops.positionX,
          maxX: _loops.positionX + _loops.width,
        })
      })
    })
  })

  const checkLoop = (_loops, cell) => {
    let result = []
    _loops.forEach(loop => {
      if (
          ((loop.minY < (cell.position.y - moduleThickness) && loop.maxY > (cell.position.y - moduleThickness)) ||
          (loop.minY < cell.position.y && loop.maxY > cell.position.y))
          &&
          ((loop.minX <= (cell.position.x - cell.width / 2) && loop.maxX >= (cell.position.x - cell.width / 2)) ||
          (loop.minX <= (cell.position.x + cell.width / 2) && loop.maxX >= (cell.position.x + cell.width / 2)))
      ) {
        result.push(loop.id)
      }
      else if(cell.fillings?.length) {
        cell.fillings.forEach((filling) => {
          let filling_pos = new THREE.Vector2(filling.position.x, module.value.height - filling.position.y - filling.height)
          if(
              (
                (loop.minY < (filling_pos.y + filling.height) && loop.maxY > (filling_pos.y + filling.height)) ||
                (loop.minY < filling_pos.y && loop.maxY > filling_pos.y) ||
                (loop.minY > filling_pos.y && loop.maxY < (filling_pos.y + filling.height))
              )
              &&
              ((loop.minX <= (filling_pos.x + filling.width) && loop.maxX >= (filling_pos.x + filling.width)) ||
                  (loop.minX <= (filling_pos.x) && loop.maxX >= (filling_pos.x)))
          ) {
            result.push(loop.id)
          }
        })
      }

    })

    return result;
  }

  if (currentSector.cells?.length) {
    Object.entries(loopsSectors).forEach(([doorKey, fasades]) => {
      Object.entries(fasades).forEach(([fasadeKey, _loops]) => {
        loops[doorKey][fasadeKey].errors = []

        currentSector.cells.forEach((cell, cellKey) => {

          let check = checkLoop(_loops, cell)
          check.forEach((id) => {
            if (!loops[doorKey]?.[fasadeKey]?.errors.includes(id))
              loops[doorKey][fasadeKey].errors.push(id)
          })

          cell.cellsRows?.forEach((cellRow) => {

            if(cellRow.extras?.length) {
              cellRow.extras.forEach((extraRow) => {
                let check = checkLoop(_loops, extraRow)
                check.forEach((id) => {
                  if (!loops[doorKey]?.[fasadeKey]?.errors.includes(id))
                    loops[doorKey][fasadeKey].errors.push(id)
                })
              })
            }

          })

        })

        if(loops[doorKey][fasadeKey].errors.length) {
          if(!errorItem.sections[secIndex])
            errorItem.sections[secIndex] = []

          errorItem.sections[secIndex].push(loops[doorKey][fasadeKey].errors)
        }
      })
    })
  }
  else {
    Object.entries(loopsSectors).forEach(([doorKey, fasades]) => {
      Object.entries(fasades).forEach(([fasadeKey, _loops]) => {
        loops[doorKey][fasadeKey].errors = []

        let check = checkLoop(_loops, currentSector)
        check.forEach((id) => {
          if (!loops[doorKey]?.[fasadeKey]?.errors.includes(id))
            loops[doorKey][fasadeKey].errors.push(id)
        })

        if(loops[doorKey][fasadeKey].errors.length) {
          if(!errorItem.sections[secIndex])
            errorItem.sections[secIndex] = []

          errorItem.sections[secIndex].push(loops[doorKey][fasadeKey].errors)
        }

      })
    })
  }

  if (Object.entries(errorItem.sections).length) {
    if(!module.value.errors)
      module.value.errors = {}

    if(!module.value.errors[ErrorsType['loops']])
      module.value.errors[ErrorsType['loops']] = <ErrorItem>{
        type: ErrorsType['loops'],
        message: ErrorsMessage['loops'],
        sections: {}
      }

    module.value.errors[ErrorsType['loops']].sections = Object.assign(module.value.errors[ErrorsType['loops']].sections, errorItem.sections)
  }
  else if(module.value.errors?.[ErrorsType['loops']]?.sections?.[secIndex]?.length) {
    delete module.value.errors[ErrorsType['loops']].sections[secIndex]
  }

  if(module.value.errors?.[ErrorsType['loops']] && !Object.entries(module.value.errors[ErrorsType['loops']].sections).length)
    delete module.value.errors?.[ErrorsType['loops']]

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

const handleCellSelect = (secIndex, cellIndex, type, rowIndex = null, item = null, extraIndex = null) => {
  switch (type) {
    case "fasades":
      selectedFasade.value = {sec: secIndex, cell: cellIndex, row: rowIndex};
      break;
    default:
      selectedFilling.value = {sec: secIndex, cell: cellIndex, row: rowIndex, extra: extraIndex, item: item};
      selectedCell.value = {sec: secIndex, cell: cellIndex, row: rowIndex, extra: extraIndex};
      break;
  }

  optionsRef.value.handleCellSelect?.(secIndex, cellIndex, rowIndex, extraIndex, item);
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

const timerReset = ref(false);
const reset = (reset = false) => {
  if (timerReset.value) {
    clearTimeout(timerReset.value)
  }

  const {PROPS} = modelState.getCurrentModel.userData;
  let moduleGrid = Object.assign({}, module.value)

  moduleGrid.moduleColor = PROPS.CONFIG.MODULE_COLOR;
  moduleGrid.moduleThickness =  APP.FASADE[moduleGrid.moduleColor]?.DEPTH || 18;
  moduleGrid.horizont = PROPS.CONFIG.EXPRESSIONS["#HORIZONT#"] || 0;
  delete moduleGrid.errors

  const leftWidth = APP.FASADE[PROPS.CONFIG.LEFTSIDECOLOR?.COLOR]?.DEPTH || moduleGrid.moduleThickness;
  const rightWidth = APP.FASADE[PROPS.CONFIG.RIGHTSIDECOLOR?.COLOR]?.DEPTH || moduleGrid.moduleThickness;

  moduleGrid.leftWallThickness = leftWidth
  moduleGrid.rightWallThickness = rightWidth

  let NOBOTTOM = checkOptionWithoutBottom()

  let sectionsTotalWidth = totalWidth.value - leftWidth - rightWidth - (moduleGrid.sections.length - 1) * moduleGrid.moduleThickness;
  let sectionsTotalHeight = totalHeight.value - moduleGrid.moduleThickness * (NOBOTTOM ? 1 : 2) - moduleGrid.horizont;

  let deltaHeight = sectionsTotalHeight - moduleGrid.sections[0].height;  //Величина, на которую нужно увеличить высоту секций
  let newSectionsArray = <GridSection>[]

  let startPositionSections = new THREE.Vector2(leftWidth, moduleGrid.horizont + moduleGrid.moduleThickness)

  const recalcSection = (section, positionSections) => {

    let newSection = <GridSection>{...section, position: new THREE.Vector2(section.position.x, section.position.y)}
    newSection.position.copy(positionSections.clone())
    newSection.position.x += newSection.width / 2

    if (newSection.cells?.length) {
      let newCellsArray = <GridCell>[]
      let positionCells = newSection.position.clone()

      let lastCellHeight = newSection.height

      let tmpCells = newSection.cells.slice().reverse()
      for (let i = 0; i < tmpCells.length; i++) {
        let newCell = <GridCell>{...tmpCells[i], position: new THREE.Vector2(tmpCells[i].position.x, tmpCells[i].position.y)}

        newCell.width = newSection.width;
        newCell.position.copy(positionCells.clone())

        if(newCell.position.y - moduleGrid.moduleThickness > newSection.height){
          break;
        }

        lastCellHeight -= newCell.height

        if (i === tmpCells.length - 1 || lastCellHeight <= 0) {
          newCell.height += lastCellHeight

          if(newCell.height < MIN_SECTION_HEIGHT){
            newCellsArray[newCellsArray.length - 1].height += newCell.height + moduleGrid.moduleThickness
            break;
          }
        }
        else {
          lastCellHeight -= moduleGrid.moduleThickness
        }

        if (newCell.cellsRows?.length) {
          let newCellsRowArray = <GridCellsRow>[]
          let positionCellsRow = new THREE.Vector2(newCell.position.x - newCell.width / 2, newCell.position.y)

          newCell.cellsRows.forEach((row, rowIndex) => {
            let newRow = <GridCellsRow>{...row, position: new THREE.Vector2(row.position.x, row.position.y)}

            newRow.position.copy(positionCellsRow.clone())
            newRow.position.x += newRow.width / 2
            newRow.height = newCell.height;

            if (newRow.fillings?.length) {
              newRow.fillings = <FillingObject>[...newRow.fillings]
              newRow.fillings.forEach((filling, index) => {
                if(filling.isVerticalItem){
                  updateFilling(newRow.height, filling, 'height')
                }
                else {
                  if(filling.isProfile) {
                    updateFilling((module.value.profilesConfig.onSectionSize || filling.isProfile.isBottomHiTechProfile) ? newSection.width : totalWidth.value, filling, 'width')
                  }
                  else
                    updateFilling(newRow.width, filling, 'width')
                }

              })
            }

            newCellsRowArray.push(newRow)
            positionCellsRow.x += newRow.width + moduleGrid.moduleThickness

            if (row.extras?.length) {
              let newRowExtrasArray = <GridRowExtra>[]
              let positionRowExtras = new THREE.Vector2(newRow.position.x, newRow.position.y)
              let lastExtraHeight = newRow.height

              let extras = row.extras.slice().sort((a, b) => a.position.y - b.position.y)
              for (let j = 0; j < extras.length; j++) {
                let extra = extras[j]

                let newExtra = <GridRowExtra>{...extra, position: new THREE.Vector2(extra.position.x, extra.position.y)}

                newExtra.position.copy(positionRowExtras.clone())
                newExtra.width = newRow.width;

                lastExtraHeight -= newExtra.height

                if (j === extras.length - 1 || lastExtraHeight <= 0) {
                  newExtra.height += lastExtraHeight

                  if(newExtra.height < MIN_SECTION_HEIGHT){
                    newRowExtrasArray[newRowExtrasArray.length - 1].height += newExtra.height + moduleGrid.moduleThickness
                    break;
                  }
                }
                else {
                  lastExtraHeight -= moduleGrid.moduleThickness
                }

                if (newExtra.fillings?.length) {
                  newExtra.fillings = <FillingObject>[...newExtra.fillings]
                  newExtra.fillings.forEach((filling, index) => {
                    if(filling.isVerticalItem) {
                      updateFilling(newExtra.height, filling, 'height')
                    }
                    else {
                      if(filling.isProfile) {
                        updateFilling((module.value.profilesConfig.onSectionSize || filling.isProfile.isBottomHiTechProfile) ? newSection.width : totalWidth.value, filling, 'width')
                      }
                      else
                        updateFilling(newExtra.width, filling, 'width')
                    }
                  })
                }

                newRowExtrasArray.push(newExtra)
                positionRowExtras.y += newExtra.height + moduleGrid.moduleThickness
              }

              newRow.extras = newRowExtrasArray.slice().sort((a, b) => b.position.y - a.position.y)
            }
          })

          let cellsRowWidthSum = 0;
          newCellsRowArray.forEach((row, rowIndex) => {
            cellsRowWidthSum += row.width;
          })
          cellsRowWidthSum += (newCellsRowArray.length - 1) * moduleGrid.moduleThickness;

          let deltaWidth = newCell.width - cellsRowWidthSum;   //Величина, на которую нужно изменить ширину последней ячейки
          if (deltaWidth !== 0){
            let lastRow = newCellsRowArray[newCellsRowArray.length - 1]
            lastRow.width += deltaWidth
            lastRow.position.x += -deltaWidth / 2

            if (lastRow.fillings?.length) {
              lastRow.fillings = <FillingObject>[...lastRow.fillings]
              lastRow.fillings.forEach((filling, index) => {
                if(filling.isVerticalItem) {
                  updateFilling(lastRow.height, filling, 'height')
                }
                else {
                  if (filling.isProfile) {
                    updateFilling((module.value.profilesConfig.onSectionSize || filling.isProfile.isBottomHiTechProfile) ? newSection.width : totalWidth.value, filling, 'width')
                  } else
                    updateFilling(lastRow.width, filling, 'width')
                }
              })
            }
          }

          newCell.cellsRows = newCellsRowArray.slice()
        }

        positionCells.y += newCell.height + moduleGrid.moduleThickness

        if (newCell.fillings?.length) {
          newCell.fillings = <FillingObject>[...newCell.fillings]
          newCell.fillings.forEach((filling, index) => {
            if(filling.isVerticalItem) {
              updateFilling(newCell.height, filling, 'height')
            }
            else {
              if (filling.isProfile) {
                updateFilling((module.value.profilesConfig.onSectionSize || filling.isProfile.isBottomHiTechProfile) ? newSection.width : totalWidth.value, filling, 'width')
              } else
                updateFilling(newCell.width, filling, 'width')
            }
          })
        }

        newCellsArray.push(newCell)
      }

      newSection.cells = newCellsArray.slice().sort((a, b) => b.position.y - a.position.y)
    }

    positionSections.x += newSection.width + moduleGrid.moduleThickness

    if (newSection.fillings?.length) {
      newSection.fillings = <FillingObject>[...newSection.fillings]
      newSection.fillings.forEach((filling, index) => {
        if(filling.isVerticalItem) {
          updateFilling(newSection.height, filling, 'height')
        }
        else {
          if (filling.isProfile) {
            updateFilling((module.value.profilesConfig.onSectionSize || filling.isProfile.isBottomHiTechProfile) ? newSection.width : totalWidth.value, filling, 'width')
          } else
            updateFilling(newSection.width, filling, 'width')
        }
      })
    }

    return newSection
  }

  moduleGrid.sections.forEach((section, secIndex) => {
    section.height += deltaHeight;

    let newSection = recalcSection(section, startPositionSections)
    newSectionsArray.push(newSection)
  })

  moduleGrid.sections = newSectionsArray.slice()

  let _module: GridModule = {
    ...moduleGrid,
    width: totalWidth,
    height: totalHeight,
    depth: totalDepth,
  }
  module.value = _module;

  let sectionsWidthSum = 0;
  module.value.sections.forEach((section, secIndex) => {
    sectionsWidthSum += section.width;
  })

  let deltaWidth = sectionsTotalWidth - sectionsWidthSum;
  if(deltaWidth !== 0) {
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
      startPositionSections.copy(lastSection.position.clone())
      startPositionSections.x -= lastSection.width / 2
      module.value.sections[module.value.sections.length - 1] = recalcSection(lastSection, startPositionSections)
    }
  }

  updateFasades()

  timerReset.value = setTimeout(()=>{
    timerReset.value = false;
    visualizationRef.value.renderGrid(/*module.value*/);
  }, 100)

};

const saveGrid = () => {
  if(module.value.errors && Object.keys(module.value.errors).length > 0) {
    Object.values(module.value.errors).forEach(item => {
      alert(item.message)
    })

    return false
  }
  else
    alert('Модуль сохранен')
    toaster.success('Модуль сохранен')
    return Object.assign({}, module.value);
};

defineExpose({
  saveGrid,
});

onBeforeMount(() => {
  productData.value = modelState.getCurrentModel.userData
  totalHeight.value = productData.value.PROPS?.CONFIG.MODULEGRID?.height || productData.value.PROPS?.CONFIG.SIZE.height || props.canvasHeight;
  totalWidth.value = productData.value.PROPS?.CONFIG.MODULEGRID?.width || productData.value.PROPS?.CONFIG.SIZE.width || props.canvasWidth;
  totalDepth.value = productData.value.PROPS?.CONFIG.MODULEGRID?.depth || productData.value.PROPS?.CONFIG.SIZE.depth || 0;
  onHorizont.value = productData.value.PROPS?.CONFIG.EXPRESSIONS["#HORIZONT#"] > 0;
  onSideProfile.value = !!productData.value.PROPS?.CONFIG.MODULEGRID?.profilesConfig?.sideProfile;
  computeModule()
  checkOptionWithoutBottom()
});

onMounted(() => {
  shapeAdjuster = new ShapeAdjuster({});
  nextTick().then(() => {
    isMounted.value = true;
  });

  eventBus.on("A:SelectModelOption", checkOptionsChanged)
  reset()
});

onBeforeUnmount(() => {
  shapeAdjuster = null;
  module.value = false;
  onHorizont.value = false
  onSideProfile.value = false
  eventBus.off("A:SelectModelOption", checkOptionsChanged)
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


watch(() => modelState.getCurrentModel.userData.PROPS.CONFIG.HORIZONT, () => {

  let newHorizont = modelState.getCurrentModel.userData.PROPS.CONFIG.HORIZONT
  checkOptionWithoutBottom()

  if (newHorizont > 0) {
    onHorizont.value = true
    updateHorizont(newHorizont)
  }
  else {
    onHorizont.value = false
    updateHorizont(newHorizont)
  }
});

//Изменение толщины левого бока и прилегающей к нему секции
watch(() => modelState.getCurrentModel.userData.PROPS.CONFIG.LEFTSIDECOLOR, () => {

  const oldLeftWidth = module.value.leftWallThickness || module.value.moduleThickness;
  const newLeftWidth = APP.FASADE[modelState.getCurrentModel.userData.PROPS.CONFIG.LEFTSIDECOLOR?.COLOR]?.DEPTH || module.value.moduleThickness

  const delta = oldLeftWidth - newLeftWidth

  if (delta !== 0) {
    reset()
  }

});

//Изменение толщины левого бока и прилегающей к нему секции
watch(() => modelState.getCurrentModel.userData.PROPS.CONFIG.RIGHTSIDECOLOR, () => {

  const oldRightWidth = module.value.rightWallThickness || module.value.moduleThickness;
  const newRightWidth = APP.FASADE[modelState.getCurrentModel.userData.PROPS.CONFIG.RIGHTSIDECOLOR?.COLOR]?.DEPTH || module.value.moduleThickness

  const delta = newRightWidth - oldRightWidth

  if (delta !== 0) {
    reset()
  }

});

//Изменение толщины левого бока и прилегающей к нему секции
watch(() => modelState.getCurrentModel.userData.PROPS.CONFIG.BACKWALL, () => {

  let tmp = noBackwall.value
  checkOptionWithoutBottom()

  if(tmp !== noBackwall.value)
    reset()

});

//Изменение цвета модуля
watch(() => modelState.getCurrentModel.userData.PROPS.CONFIG.MODULE_COLOR, () => {

  const oldThickness = module.value.moduleThickness;
  const newThickness = APP.FASADE[modelState.getCurrentModel.userData.PROPS.CONFIG.MODULE_COLOR].DEPTH

  const delta = newThickness - oldThickness

  if (delta !== 0) {
    reset()
  }

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

        <div class="no-select actions-sections-header">
          <h1>Размеры модуля</h1>
        </div>

        <div
            class="constructor2d-container--left--module-configs--module-size"
        >

          <div class="constructor2d-container--left--module-configs--module-size-item actions-inputs">
            <p class="no-select actions-title">Высота <img v-if="mode !== 'module'" class="cut-icon" src="/icons/lock.svg" alt="" title="Редактирование размеров доступно только в режиме 'Модуль'" /></p>
            <p class="no-select item__label text-grey">
              Мин: {{ getMinMaxModuleSize('height', 'min') ?? "н/о" }}
            </p>
            <p class="no-select item__label text-grey">
              Макс: {{ getMinMaxModuleSize('height', 'max') ?? "н/о" }}
            </p>
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
            <p class="no-select actions-title">Ширина <img v-if="mode !== 'module'" class="cut-icon" src="/icons/lock.svg" alt="" title="Редактирование размеров доступно только в режиме 'Модуль'" /> </p>
            <p class="no-select item__label text-grey">
              Мин: {{ getMinMaxModuleSize('width', 'min') ?? "н/о" }}
            </p>
            <p class="no-select item__label text-grey">
              Макс: {{ getMinMaxModuleSize('width', 'max') ?? "н/о" }}
            </p>
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
            <p class="no-select actions-title">Глубина <img v-if="mode !== 'module'" class="cut-icon" src="/icons/lock.svg" alt="" title="Редактирование размеров доступно только в режиме 'Модуль'" /></p>
            <p class="no-select item__label text-grey">
              Мин: {{ getMinMaxModuleSize('depth', 'min') ?? "н/о" }}
            </p>
            <p class="no-select item__label text-grey">
              Макс: {{ getMinMaxModuleSize('depth', 'max') ?? "н/о" }}
            </p>
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
            <p class="no-select actions-title">Цоколь
              <img v-if="mode !== 'module' || noBottom" class="cut-icon" src="/icons/lock.svg" alt="" title="Редактирование заблокировано режимом работы или опцией!" />
              <Toggle v-else v-model="onHorizont"/>
            </p>

            <p v-if="!noBottom" class="no-select item__label text-grey">
              Мин: 50
            </p>
            <p v-if="!noBottom" class="no-select item__label text-grey">
              Макс: 300
            </p>

            <div class="actions-input--container">
              <MainInput
                  @update:modelValue="updateHorizont"
                  :inputClass="'actions-input'"
                  :modelValue="productData.PROPS.CONFIG.EXPRESSIONS['#HORIZONT#']"
                  min="50"
                  max="300"
                  :type="'number'"
                  placeholder="0"
                  :disabled="mode !== 'module' || productData.PROPS.CONFIG.EXPRESSIONS['#HORIZONT#'] === 0 || noBottom"
              />
            </div>
          </div>

          <div
              v-if="productData.PROPS.CONFIG.isHiTech"
              class="constructor2d-container--left--module-configs--module-size-item actions-inputs"
          >
            <p class="actions-title">Боковой профиль</p>
            <img v-if="module.sections[0].hiTechProfiles?.length" class="cut-icon" src="/icons/lock.svg" alt="" title="Нельзя добавить боковой профиль вместе с горизонтальными!" />
            <Toggle
                v-else
                v-model="onSideProfile"
                @change="initSideProfile"
            />
          </div>

        </div>

        <div class="no-select actions-sections-header">
          <h1>Параметры модуля</h1>
        </div>

        <div
            class="constructor2d-container--left--module-configs--module-color"
        >
          <ModuleMaterialsConfig
              ref="materialConfRef"
              :visualizationRef="visualizationRef"
              :module="getModule"
              :objectData="productData"
              @product-reset="reset"
          />
        </div>

        <div class="no-select actions-sections-header">
          <h1>Опции</h1>
        </div>

        <RailsRightPage class="no-select" style="margin-top: 5px"/>

      </div>

    </div>

    <div
        id="midAreaUM2Dconstructor"
        class="constructor2d-container constructor2d-container--mid"
        ref="constructor2dContainer"
    >
      <div class="no-select constructor2d-header">
        <div class="constructor2d-header--title"><h1>{{productData.PROPS.NAME}}</h1></div>
      </div>

      <div
          class="constructor2d-container constructor2d-header--mode-selector"
      >
        <article class="actions-items actions-items--right">
          <div class="actions-items--right-items">
            <button
                :class="[
                      'no-select actions-btn actions-btn--default', {
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
                      'no-select actions-btn actions-btn--default', {
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
                      'no-select actions-btn actions-btn--default', {
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
            @checkLoopsCollision="checkLoopsCollision"
            @module-reset="reset"
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
        <h1 class="no-select">Секции</h1>

        <SectionOptions
            ref="optionsRef"
            class="constructor2d-container--right--content"
            :visualizationRef="visualizationRef"
            :module="getModule"
            :step="step"
            @product-updateFasades="updateFasades"
            @product-calcLoops="calcLoops"
            @product-checkLoopsCollision="checkLoopsCollision"
            @product-reset="reset"
        />
      </div>

      <div
          v-if="mode === 'fasades'"
      >
        <h1 class="no-select">Фасады</h1>

        <FasadesOptions
            ref="optionsRef"
            class="constructor2d-container--right--content"
            :visualizationRef="visualizationRef"
            :module="getModule"
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
        <h1 class="no-select">Наполнение</h1>

        <FillingsProductions
            ref="optionsRef"
            class="constructor2d-container--right--content"
            :visualizationRef="visualizationRef"
            :module="getModule"
            :shapeAdjuster="shapeAdjuster"
            :fillings="getFillings"
            :step="step"
            @product-updateFilling="updateFilling"
            @product-updateFasades="updateFasades"
            @product-calcDrawersFasades="calcDrawersFasades"
            @product-checkLoopsCollision="checkLoopsCollision"
        />
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.constructor2d {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none;     /* IE 10+ и Edge */
  user-select: none;         /* Стандарт: Chrome, Firefox, Opera, Edge */

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

.no-select {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none;     /* IE 10+ и Edge */
  user-select: none;         /* Стандарт: Chrome, Firefox, Opera, Edge */
}

.actions {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none;     /* IE 10+ и Edge */
  user-select: none;         /* Стандарт: Chrome, Firefox, Opera, Edge */

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
    color: #a3a9b5;
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
