export interface IBasketFacadeHeandles {
  ID: number | string | null,
  POSITION: string | null
};
export interface IBasketFacade {
  COLOR: number | string | null,
  MILLING: number | null,
  PALETTE: number | null,
  SHOWCASE: number | null,
  ALUM: number | null,
  GLASS: number | null,
  PATINA: number | null,
  TYPE: number | null,
  SIZE: {
    WIDTH: number | null,
    HEIGHT: number | null,
    DEPTH: number | null
  } | null,
  HEANDLES: IBasketFacadeHeandles[]
};

export interface IBasket {
  PRODUCT: number,
  PROPS: {
    FASADE: IBasketFacade[],
    BODY: {
      COLOR: number | string | null,
      SIZE: {
        WIDTH: number | null,
        HEIGHT: number | null,
        DEPTH: number | null
      }
    },
    OPTIONS: Number[],
    UNIFORM_TEXTURE: {
      GROUP: number | null,
      LEVEL: number | null,
      INDEX: number | null,
      column_INDEX: number | null
    }
  },
  QUANTITY: number;
};