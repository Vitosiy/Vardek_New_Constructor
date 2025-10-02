export interface IBasket {
  BASKETID: string;
  PRODUCT: number;
  PROPS: {
    FASADE: IBasketFacade[];
    BODY: {
      COLOR: string | null;
      SIZE: {
        WIDTH: string | null;
        HEIGHT: string | null;
        DEPTH: string | null;
      };
    };
    OPTIONS: any[];
    UNIFORM_TEXTURE: {
      GROUP: string | null;
      LEVEL: string | null;
      INDEX: string | null;
      column_INDEX: string | null;
    };
    USLUGI: number[];
    TABLETOP: any;
  };
  QUANTITY: number;
  TYPE: string;
}

export interface IBasketFacade {
  COLOR: string | null;
  MILLING: string | null;
  PALETTE: string | null;
  SHOWCASE: string | null;
  ALUM: string | null;
  GLASS: string | null;
  PATINA: string | null;
  TYPE: string | null;
  SIZE: {
    WIDTH: number | null;
    HEIGHT: number | null;
    DEPTH: number | null;
  };
  HEANDLES: any[];
}

export interface IRoomObject {
  object: {
    userData: {
      PROPS: {
        CONFIG: {
          ID: number;
          FASADE_PROPS: any[];
          MODULE_COLOR?: string;
          UNIFORM_TEXTURE?: {
            group?: string;
            level?: string;
            index?: string;
            column_index?: string;
          };
        };
        FASADE: any[];
        BODY: any;
        RASPIL: {
          data: any[][];
          modelHeight: number;
        };
        RASPIL_COUNT: number;
      };
    };
  };
}

