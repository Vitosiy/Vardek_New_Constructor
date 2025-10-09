//@ts-nocheck
import { IBasket, IBasketFacade } from "@/types/basket";
// export function createFacadeProps(objProps: any): IBasketFacade[] {
//   return objProps.CONFIG.FASADE_PROPS 
//     ? objProps.CONFIG.FASADE_PROPS.map((fp: any, index: number) => ({
//         COLOR: fp.COLOR ?? null,
//         MILLING: fp.MILLING ?? null,
//         PALETTE: fp.PALETTE ?? null,
//         SHOWCASE: fp.SHOWCASE ?? null,
//         ALUM: fp.ALUM ?? null,
//         GLASS: fp.GLASS ?? null,
//         PATINA: fp.PATINA ?? null,
//         TYPE: fp.TYPE ?? null,
//         SIZE: {
//           WIDTH: objProps.FASADE[index]?.object?.userData?.trueSize?.WIDTH ?? null,
//           HEIGHT: objProps.FASADE[index]?.object?.userData?.trueSize?.HEIGHT ?? null,
//           DEPTH: objProps.FASADE[index]?.object?.userData?.trueSize?.DEPTH ?? null,
//         },
//         HEANDLES: [],
//       }))
//     : [];
// }

export function createFacadeProps(objProps: any): IBasketFacade[] {
  return objProps.CONFIG.FASADE_PROPS 
    ? objProps.CONFIG.FASADE_PROPS.map((fp: any, index: number) => {
        const facade = objProps.FASADE[index];
        const trueSize = facade?.object?.userData?.trueSize;
        
        const result: any = {};
        
        // Добавляем свойства только если они имеют значения
        if (fp.COLOR != null) result.COLOR = fp.COLOR;
        if (fp.MILLING != null) result.MILLING = fp.MILLING;
        if (fp.PALETTE != null) result.PALETTE = fp.PALETTE;
        if (fp.SHOWCASE != null) result.SHOWCASE = fp.SHOWCASE;
        if (fp.ALUM != null) result.ALUM = fp.ALUM;
        if (fp.GLASS != null) result.GLASS = fp.GLASS;
        if (fp.PATINA != null) result.PATINA = fp.PATINA;
        if (fp.TYPE != null) result.TYPE = fp.TYPE;
        
        // Добавляем SIZE только если есть хотя бы одно измерение
        const size: any = {};
        if (trueSize?.WIDTH != null) size.WIDTH = trueSize.WIDTH;
        if (trueSize?.HEIGHT != null) size.HEIGHT = trueSize.HEIGHT;
        if (trueSize?.DEPTH != null) size.DEPTH = trueSize.DEPTH;
        
        // Если есть хотя бы одно измерение, добавляем объект SIZE
        if (Object.keys(size).length > 0) {
          result.SIZE = size;
        }
        
        // Добавляем HEANDLES только если массив не пустой
        if (fp.HEANDLES && Array.isArray(fp.HEANDLES) && fp.HEANDLES.length > 0) {
          result.HEANDLES = fp.HEANDLES;
        }
        
        return result;
      })
    : [];
}

export function createBodyProps(objProps: any) {
  const trueSize = objProps.BODY?.object?.userData?.trueSize;
  
  return {
    COLOR: objProps.CONFIG.MODULE_COLOR ?? null,
    SIZE: {
      WIDTH: trueSize?.BODY_WIDTH?.toFixed(0) ?? null,
      HEIGHT: trueSize?.BODY_HEIGHT?.toFixed(0) ?? null,
      DEPTH: trueSize?.BODY_DEPTH?.toFixed(0) ?? null,
    },
  };
}
export function createOptionsProps(objProps: any) {
  const options:any[] = [];
  (objProps.CONFIG.OPTIONS || []).map(el =>{
    if(el.active) options.push(el.id);
  });
  return options;
}

export function createRaspilData(objProps: any) {
  if (!objProps.RASPIL?.data) return {};
  
  const raspilData = objProps.RASPIL.data.flat().map((el: any) => ({
    height: el.height,
    width: el.width,
    depth: objProps.RASPIL.modelHeight,
    serviseData: (el.serviseData || [])
      .filter((service: any) => service.value === true)
      .map(({ NAME, value, error, ...rest }: any) => rest),
    holes: el.holes,
    roundCut: el.roundCut
  }));

  return {
    RASPIL_COUNT: objProps.RASPIL_COUNT,
    RASPIL: raspilData,
  };
}

export function createUniformTexture(objProps: any) {
  const texture = objProps.CONFIG.UNIFORM_TEXTURE;
  
  return {
    GROUP: texture?.group ?? null,
    LEVEL: texture?.level ?? null,
    INDEX: texture?.index ?? null,
    column_INDEX: texture?.column_index ?? null,
  };
}



export function creatSectionFilling(arr: any[] | null | undefined): any[] {
  if (!arr || !Array.isArray(arr)) {
    return [];
  }

  return arr.map(el => ({
    ID: el.id, // ID товара полки
    PATH: false,
    MATERIAL_ID: el.material, // Материал полки
    type: el.type,
    SIZE: { // Размеры
      width: el.size?.x || 0,
      height: el.size?.z || 0,
      depth: el.size?.y || 0
    },
    ADDITIVES: el.ADDITIVES || {},
  }));
}

export function convertModuleToLegacyFormat(newModuleObject: any): any {
  if (!newModuleObject?.CONFIG) {
    return {};
  }

  const { CONFIG } = newModuleObject;
  const legacyProps: any = {
    SIZEEDITWIDTH: CONFIG.SIZE?.width || 0,
    SIZEEDITHEIGHT: CONFIG.SIZE?.height || 0,
    SIZEEDITDEPTH: CONFIG.SIZE?.depth || 0,
    MODULECOLOR: CONFIG.MODULE_COLOR || 0,
    BACKWALL: CONFIG.BACKWALL || {},
    HORIZONT: CONFIG.MODULEGRID?.horizont || 0,
    LEFTSIDECOLOR: CONFIG.LEFTSIDECOLOR,
    RIGHTSIDECOLOR: CONFIG.RIGHTSIDECOLOR,
    TOPFASADECOLOR: CONFIG.TOPFASADECOLOR,
    OPTION: createOptionsProps(newModuleObject),
    LOOPS: CONFIG.LOOPS || {},
    DOORS: CONFIG.FASADE_PROPS || {}
  };

  // Динамически добавляем секции из MODULEGRID
  if (CONFIG.MODULEGRID?.sections && Array.isArray(CONFIG.MODULEGRID.sections)) {
    CONFIG.MODULEGRID.sections.forEach((section: any, index: number) => {
      const sectionNumber = index + 1;
      legacyProps[`SECTIONS${sectionNumber}`] = section.width || 0;
    });
  }

  // Динамически добавляем заполнения секций
  if (CONFIG.SECTIONS) {
    Object.keys(CONFIG.SECTIONS).forEach(sectionKey => {
      const section = CONFIG.SECTIONS[sectionKey];
      if (section?.fillings) {
        legacyProps[`SECTIONSFILLING${sectionKey}`] = creatSectionFilling(section.fillings);
      }
    });
  }

  // Динамически добавляем фасады
  if (CONFIG.FASADES) {
    Object.keys(CONFIG.FASADES).forEach((fasadeKey, index) => {
      const fasadeNumber = index + 1;
      const fasade = CONFIG.FASADES[fasadeKey];
      
      legacyProps[`FASADESIZES${fasadeNumber}`] = fasade.sizes || {};
      legacyProps[`FASADEWIDTH${fasadeNumber}`] = fasade.width || 0;
    });
  }

  // Добавляем петли сбоку, если есть
  if (CONFIG.LOOPS_SIDE) {
    legacyProps.LOOPSSIDE = CONFIG.LOOPS_SIDE;
  }

  return legacyProps;
}

// Пример использования:
// const legacyModule = convertModuleToLegacyFormat(newModuleObject);

// export function createBasketItem(objProps: any, index: number, key: any = ''): IBasket {
//   // const objProps = obj.object.userData.PROPS;
//   console.log('createBasketItem', objProps)

//  if(objProps.CONFIG.SECTIONS) {
//     return {
//      BASKETID: key,
//      PRODUCT: objProps.CONFIG.ID,
//      PROPS: convertModuleToLegacyFormat(objProps.CONFIG),
//      QUANTITY: 1,
//      TYPE: "scene",
//     }
//  } else {
//    return {
//      BASKETID: key,
//      PRODUCT: objProps.CONFIG.ID,
//      PROPS: {
//        FASADE: createFacadeProps(objProps),
//        BODY: createBodyProps(objProps),
//        OPTION: createOptionsProps(objProps),
//        UNIFORM_TEXTURE: createUniformTexture(objProps),
//        MODULECOLOR: objProps.CONFIG.MODULE_COLOR,
//        // USLUGI: [
//        //   98683, 249713, 1467341, 1467342, 4722755, 
//        //   251698, 251699, 251701, 732170, 1458340, 
//        //   1920165, 4169375
//        // ],
//        USLUGI: [],
//        // USLUGI: [
//        //   98683, 249713, 1467341
//        // ],
//        // TABLETOP:  (objProps),
//        TABLETOP:  null,
//      },
//      QUANTITY: 1,
//      TYPE: "scene",
//    };
//  }
// }
export function createBasketItem(objProps: any, index: number, key: any = ''): IBasket {
  console.log('createBasketItem', objProps);

  const props: any = {};

  // Добавляем свойства только если они существуют и не пустые
  const facadeProps = createFacadeProps(objProps);
  if (facadeProps && facadeProps.length > 0) {
    props.FASADE = facadeProps;
  }

  const bodyProps = createBodyProps(objProps);
  if (bodyProps && Object.keys(bodyProps).length > 0) {
    props.BODY = bodyProps;
  }

  const optionsProps = createOptionsProps(objProps);
  if (optionsProps && Object.keys(optionsProps).length > 0) {
    props.OPTION = optionsProps;
  }

  const uniformTexture = createUniformTexture(objProps);
  if (uniformTexture != null) {
    props.UNIFORM_TEXTURE = uniformTexture;
  }

  if (objProps.CONFIG.MODULE_COLOR != null) {
    props.MODULECOLOR = objProps.CONFIG.MODULE_COLOR;
  }


  if(objProps.CONFIG.SECTIONS) {
    return {
      BASKETID: key,
      PRODUCT: objProps.CONFIG.ID,
      PROPS:convertModuleToLegacyFormat(objProps),
      QUANTITY: 1,
      TYPE: "umscene",
    };
  } else {
    return {
      BASKETID: key,
      PRODUCT: objProps.CONFIG.ID,
      PROPS: props,
      QUANTITY: 1,
      TYPE: "scene",
    };
  }
}

// Определения свойств (перенесено из Angular кода)
export const propsLabel = {
  COLOR: {type: "COLOR", val: "int", NAME: "Цвет", SORT: 300},
  MODULECOLOR: {type: "FASADE", val: "int", NAME: "Цвет корпуса", SORT: 300},
  SIZE: {type: "SIZE", val: "int", NAME: "Размер", SORT: 400},
  THICKNESS: {type: "THICKNESS", val: "int", NAME: "Толщина", SORT: 500},
  OPTION: {type: "OPTION", val: "array", NAME: "Опции", SORT: 600},
  SIZEEDITHEIGHT: {type: false, val: "int", NAME: "Высота", SORT: 800},
  SIZEEDITDEPTH: {type: false, val: "int", NAME: "Глубина", SORT: 800},
  SIZEEDITWIDTH: {type: false, val: "int", NAME: "Ширина", SORT: 800},
  HEM: {type: "HEM", val: "int", NAME: "Кромка", SORT: 900},
  SHELFQUANT: {type: false, val: "int", NAME: "Количество полок", SORT: 900},
  SIZEEDITJOINDEPTH: {
    type: false,
    val: "int",
    NAME: "Глубина пристыковочного модуля",
    SORT: 1000,
  },
  BACKWALL: {type: "FASADE", val: "color_obj_list", NAME: "Задняя стенка", SORT: 100},
  LEFTSIDECOLOR: {type: "FASADE", val: "color_obj_list", NAME: "Левая стенка", SORT: 100},
  RIGHTSIDECOLOR: {type: "FASADE", val: "color_obj_list", NAME: "Правая стенка", SORT: 100},
  TOPFASADECOLOR: {type: "FASADE", val: "color_obj_list", NAME: "Накладка на крышку", SORT: 100},
 
  DOORS: {type: "FASADE", val: "obj_list", NAME: "Двери", SORT: 100},
  FACADE: {type: "FASADE", val: "int", NAME: "Цвет фасада", SORT: 100},
  FASADE: {type: "FASADE", val: "int", NAME: "Цвет фасада", SORT: 100},
  FASADE1: {type: "FASADE", val: "int", NAME: "Цвет фасада 1", SORT: 1000},
  FASADE2: {type: "FASADE", val: "int", NAME: "Цвет фасада 2", SORT: 1100},
  FASADE3: {type: "FASADE", val: "int", NAME: "Цвет фасада 3", SORT: 1200},
  FASADE4: {type: "FASADE", val: "int", NAME: "Цвет фасада 4", SORT: 1300},
  FASADE5: {type: "FASADE", val: "int", NAME: "Цвет фасада 5", SORT: 1300},

  FASADEWIDTH: {type: false, val: "int", NAME: "Ширина фасада", SORT: 1360},
  FASADESIZE: {type: "FASADESIZE", val: "int", NAME: "Высота фасада", SORT: 1350},
  FASADESIZE1: {
    type: "FASADESIZE",
    val: "int",
    NAME: "Размер фасада 1",
    SORT: 1350,
  },
  FASADESIZE2: {
    type: "FASADESIZE",
    val: "int",
    NAME: "Размер фасада 2",
    SORT: 1350,
  },
  FASADESIZE3: {
    type: "FASADESIZE",
    val: "int",
    NAME: "Размер фасада 3",
    SORT: 1350,
  },
  FASADESIZE4: {
    type: "FASADESIZE",
    val: "int",
    NAME: "Размер фасада 4",
    SORT: 1350,
  },
  FASADESIZE5: {
    type: "FASADESIZE",
    val: "int",
    NAME: "Размер фасада 5",
    SORT: 1350,
  },

  FASADESIZEWIDTH1: {
    type: false,
    val: "int",
    NAME: "Ширина фасада 1",
    SORT: 1350,
  },
  FASADESIZEWIDTH2: {
    type: false,
    val: "int",
    NAME: "Ширина фасада 2",
    SORT: 1350,
  },
  FASADESIZEWIDTH3: {
    type: false,
    val: "int",
    NAME: "Ширина фасада 3",
    SORT: 1350,
  },
  FASADESIZEWIDTH4: {
    type: false,
    val: "int",
    NAME: "Ширина фасада 4",
    SORT: 1350,
  },
  FASADESIZEWIDTH5: {
    type: false,
    val: "int",
    NAME: "Ширина фасада 5",
    SORT: 1350,
  },

  GLASS: {type: "GLASS", val: "int", NAME: "Стекло", SORT: 700},
  GLASS1: {type: "GLASS", val: "int", NAME: "Стекло 1", SORT: 1400},
  GLASS2: {type: "GLASS", val: "int", NAME: "Стекло 2", SORT: 1500},
  GLASS3: {type: "GLASS", val: "int", NAME: "Стекло 3", SORT: 1600},
  GLASS4: {type: "GLASS", val: "int", NAME: "Стекло 4", SORT: 1700},
  GLASS5: {type: "GLASS", val: "int", NAME: "Стекло 5", SORT: 1700},

  PATINA: {type: "PATINA", val: "int", NAME: "Патина", SORT: 1800},
  PATINA1: {type: "PATINA", val: "int", NAME: "Патина 1", SORT: 1800},
  PATINA2: {type: "PATINA", val: "int", NAME: "Патина 2", SORT: 1800},
  PATINA3: {type: "PATINA", val: "int", NAME: "Патина 3", SORT: 1800},
  PATINA4: {type: "PATINA", val: "int", NAME: "Патина 4", SORT: 1800},
  PATINA5: {type: "PATINA", val: "int", NAME: "Патина 5", SORT: 1800},

  SHOWCASE: {type: "SHOWCASE", val: "int", NAME: "Тип витрины", SORT: 1800},
  SHOWCASE1: {type: "SHOWCASE", val: "int", NAME: "Тип витрины 1", SORT: 1800},
  SHOWCASE2: {type: "SHOWCASE", val: "int", NAME: "Тип витрины 2", SORT: 1800},
  SHOWCASE3: {type: "SHOWCASE", val: "int", NAME: "Тип витрины 3", SORT: 1800},
  SHOWCASE4: {type: "SHOWCASE", val: "int", NAME: "Тип витрины 4", SORT: 1800},
  SHOWCASE5: {type: "SHOWCASE", val: "int", NAME: "Тип витрины 5", SORT: 1800},

  PALETTE: {type: "PALETTE", val: "int", NAME: "Палитра", SORT: 1800},
  PALETTE1: {type: "PALETTE", val: "int", NAME: "Палитра 1", SORT: 1800},
  PALETTE2: {type: "PALETTE", val: "int", NAME: "Палитра 2", SORT: 1800},
  PALETTE3: {type: "PALETTE", val: "int", NAME: "Палитра 3", SORT: 1800},
  PALETTE4: {type: "PALETTE", val: "int", NAME: "Палитра 4", SORT: 1800},
  PALETTE5: {type: "PALETTE", val: "int", NAME: "Палитра 5", SORT: 1800},

  FASADEALIGN: {
    type: "FASADEALIGN",
    val: "list",
    NAME: "Сторона открывания",
    SORT: 1800,
    VALUE: {left: "Левая", right: "Правая"},
  },
  FASADEALIGN1: {
    type: "FASADEALIGN",
    val: "list",
    NAME: "Сторона открывания 1",
    SORT: 1800,
  },
  FASADEALIGN2: {
    type: "FASADEALIGN",
    val: "list",
    NAME: "Сторона открывания 2",
    SORT: 1800,
  },
  FASADEALIGN3: {
    type: "FASADEALIGN",
    val: "list",
    NAME: "Сторона открывания 3",
    SORT: 1800,
  },
  FASADEALIGN4: {
    type: "FASADEALIGN",
    val: "list",
    NAME: "Сторона открывания 4",
    SORT: 1800,
  },
  FASADEALIGN5: {
    type: "FASADEALIGN",
    val: "list",
    NAME: "Сторона открывания 5",
    SORT: 1800,
  },

  FASADEFIRST: {
    type: "FASADEFIRST",
    val: "list",
    NAME: "Передний фасад",
    SORT: 1800,
    VALUE: {left: "Левый", right: "Правый"},
  },

  MILLING: {type: "MILLING", val: "int", NAME: "Фрезеровка", SORT: 200},
  MILLING1: {type: "MILLING", val: "int", NAME: "Фрезеровка 1", SORT: 1800},
  MILLING2: {type: "MILLING", val: "int", NAME: "Фрезеровка 2", SORT: 1900},
  MILLING3: {type: "MILLING", val: "int", NAME: "Фрезеровка 3", SORT: 2000},
  MILLING4: {type: "MILLING", val: "int", NAME: "Фрезеровка 4", SORT: 2100},
  MILLING5: {type: "MILLING", val: "int", NAME: "Фрезеровка 5", SORT: 2100},

  USLUGI: {type: "USLUGI", val: "array", NAME: "Услуга", SORT: 2110},
  USLUGIL: {type: "USLUGI", val: "array", NAME: "Услуга левая часть", SORT: 2120},
  USLUGIR: {
    type: "USLUGI",
    val: "array",
    NAME: "Услуга правая часть",
    SORT: 2130,
  },
  USLUGI1: {type: "USLUGI", val: "array", NAME: "Услуга 1", SORT: 2201},
  USLUGI2: {type: "USLUGI", val: "array", NAME: "Услуга 2", SORT: 2202},
  USLUGI3: {type: "USLUGI", val: "array", NAME: "Услуга 3", SORT: 2203},
  USLUGI4: {type: "USLUGI", val: "array", NAME: "Услуга 4", SORT: 2204},
  USLUGI5: {type: "USLUGI", val: "array", NAME: "Услуга 5", SORT: 2205},

  USLUGIraspil: {type: false, val: "str", NAME: "Распил", SORT: 2300},

  PROFILE: {type: "USLUGI", val: "int", NAME: "Тип завала", SORT: 2200},
  FILLING: {type: "FILLING", val: "int", NAME: "Вариант компоновки", SORT: 2400},

  FASADETYPE: {type: "FASADETYPE", val: "int", NAME: "Тип фасада", SORT: 2500},
  FASADETYPE1: {type: "FASADETYPE", val: "int", NAME: "Тип фасада 1", SORT: 2510},
  FASADETYPE2: {type: "FASADETYPE", val: "int", NAME: "Тип фасада 2", SORT: 2520},
  FASADETYPE3: {type: "FASADETYPE", val: "int", NAME: "Тип фасада 3", SORT: 2530},
  FASADETYPE4: {type: "FASADETYPE", val: "int", NAME: "Тип фасада 4", SORT: 2540},
  FASADETYPE5: {type: "FASADETYPE", val: "int", NAME: "Тип фасада 5", SORT: 2550},

  SECTIONS: {type: false, val: "int", NAME: "Размер секции", SORT: 2550},
  SECTIONS1: {type: false, val: "int", NAME: "Размер секции 1", SORT: 2550},
  SECTIONS2: {type: false, val: "int", NAME: "Размер секции 2", SORT: 2550},
  SECTIONS3: {type: false, val: "int", NAME: "Размер секции 3", SORT: 2550},
  SECTIONS4: {type: false, val: "int", NAME: "Размер секции 4", SORT: 2550},
  SECTIONS5: {type: false, val: "int", NAME: "Размер секции 5", SORT: 2550},

  SHELFPOSITION: {type: false, val: "int", NAME: "Позиции полок", SORT: 2550},
  SHELFPOSITION1: {type: false, val: "int", NAME: "Позиции полок 1", SORT: 2550},
  SHELFPOSITION2: {type: false, val: "int", NAME: "Позиции полок 2", SORT: 2550},
  SHELFPOSITION3: {type: false, val: "int", NAME: "Позиции полок 3", SORT: 2550},
  SHELFPOSITION4: {type: false, val: "int", NAME: "Позиции полок 4", SORT: 2550},
  SHELFPOSITION5: {type: false, val: "int", NAME: "Позиции полок 5", SORT: 2550},
  SHELFPOSITION6: {type: false, val: "int", NAME: "Позиции полок 6", SORT: 2550},
  SHELFPOSITION7: {type: false, val: "int", NAME: "Позиции полок 7", SORT: 2550},
  SHELFPOSITION8: {type: false, val: "int", NAME: "Позиции полок 8", SORT: 2550},
  SHELFPOSITION9: {type: false, val: "int", NAME: "Позиции полок 9", SORT: 2550},
  SHELFPOSITION10: {
    type: false,
    val: "int",
    NAME: "Позиции полок 10 ",
    SORT: 2550,
  },

  SECTIONSFILLING: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции",
    SORT: 2550,
  },
  SECTIONSFILLING1: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 1",
    SORT: 2550,
  },
  SECTIONSFILLING2: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 2",
    SORT: 2550,
  },
  SECTIONSFILLING3: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 3",
    SORT: 2550,
  },
  SECTIONSFILLING4: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 4",
    SORT: 2550,
  },
  SECTIONSFILLING5: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 5",
    SORT: 2550,
  },
  SECTIONSFILLING6: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 6",
    SORT: 2550,
  },
  SECTIONSFILLING7: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 7",
    SORT: 2550,
  },
  SECTIONSFILLING8: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 8",
    SORT: 2550,
  },
  SECTIONSFILLING9: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 9",
    SORT: 2550,
  },
  SECTIONSFILLING10: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 10",
    SORT: 2550,
  },
  MECHANISM: {
    type: "MECHANISM",
    val: "int",
    NAME: "Подъемный механизм",
    SORT: 2560,
  },
};