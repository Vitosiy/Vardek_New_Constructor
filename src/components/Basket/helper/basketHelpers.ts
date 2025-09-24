import { IBasket, IBasketFacade } from "@/types/basket";

export function createFacadeProps(objProps: any): IBasketFacade[] {
  if(objProps.CONFIG.FASADE_PROPS) {
    return objProps.CONFIG.FASADE_PROPS.map((fp: any, index: number) => ({
      COLOR: fp.COLOR ?? null,
      MILLING: fp.MILLING ?? null,
      PALETTE: fp.PALETTE ?? null,
      SHOWCASE: fp.SHOWCASE ?? null,
      ALUM: fp.ALUM ?? null,
      GLASS: fp.GLASS ?? null,
      PATINA: fp.PATINA ?? null,
      TYPE: fp.TYPE ?? null,
      SIZE: {
        WIDTH: objProps.FASADE[index]?.object?.userData?.trueSize?.WIDTH ?? null,
        HEIGHT: objProps.FASADE[index]?.object?.userData?.trueSize?.HEIGHT ?? null,
        DEPTH: objProps.FASADE[index]?.object?.userData?.trueSize?.DEPTH ?? null,
      },
      HEANDLES: [],
    }));
  };
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

export function createBasketItem(objProps: any, index: number, key: any = ''): IBasket {
//   const objProps = obj.object.userData.PROPS;
  
  return {
    BASKETID: key,
    PRODUCT: objProps.CONFIG.ID,
    PROPS: {
      FASADE: createFacadeProps(objProps),
      BODY: createBodyProps(objProps),
      OPTIONS: [],
      UNIFORM_TEXTURE: createUniformTexture(objProps),
      // USLUGI: [
      //   98683, 249713, 1467341, 1467342, 4722755, 
      //   251698, 251699, 251701, 732170, 1458340, 
      //   1920165, 4169375
      // ],
      USLUGI: [
        98683, 249713, 1467341
      ],
      TABLETOP:  (objProps),
    },
    QUANTITY: 1,
    TYPE: "scene",
  };
}