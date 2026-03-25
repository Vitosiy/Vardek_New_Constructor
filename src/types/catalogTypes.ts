interface NavigationData {
    NavFirstRecordShow?: number;
    NavLastRecordShow?: number;
    NavNum?: number;
    NavPageCount?: number;
    NavPageNomer?: string;
    NavPageSize?: number;
    NavQueryString?: string;
    NavRecordCount?: string;
    NavShowAll?: boolean;
    NavShowAlways?: boolean;
    NavTitle?: boolean;
    add_anchor?: string;
    bDescPageNumbering?: boolean;
    bSavePage?: boolean;
    bShowAll?: boolean;
    nEndPage?: number;
    nPageWindow?: number;
    nStartPage?: number;
    sUrlPath?: string;
    sUrlPathParams?: string;
}

interface CatalogSectionItem {
    CODE?: string;
    DEPTH_LEVEL?: string;
    EXTERNAL_ID?: string;
    GLOBAL_ACTIVE?: "Y" | "N";
    IBLOCK_CODE?: string;
    IBLOCK_EXTERNAL_ID?: string;
    IBLOCK_ID?: string;
    IBLOCK_SECTION_ID?: string;
    IBLOCK_TYPE_ID?: string;
    ID?: string;
    NAME?: string;
    SECTION_PAGE_URL?: string;
    SORT?: string;
    UF_ADDITIONAL_LINK?: null;
    UF_ADD_LINK?: null;
    UF_BIG_PREV?: string;
    UF_BTN_BYTXT?: string;
    UF_CITY?: any[]; 
    UF_CUSTOM_LINK?: boolean;
    UF_DE_DESCRIPTION?: string;
    UF_DE_NAME?: string;
    UF_DISABLE_IN_MENU?: string;
    UF_EN_DESCRIPTION?: string;
    UF_EN_NAME?: string;
    UF_FILTER2?: null;
    UF_FILTER3?: null;
    UF_FILTER8?: null;
    UF_FILTER10?: null;
    UF_FILTER11?: null;
    UF_HIDEMAINPAGE?: null;
    UF_HIDE_IN_3D?: string;
    UF_HIDE_IN_CONSTRUCT?: any[];
    UF_HIDE_SITE?: boolean;
    UF_KP_NAME?: string;
    UF_LINK_SECTION?: null;
    UF_NOT_AVAILABLE?: string;
    UF_ONLY_DILER?: string;
    UF_RECL?: string;
    UF_RIGHT_PANEL?: string;
    UF_SHOW_SIBLINK?: string;
    UF_TEMPLATE?: null;
    UF_TEMPLATE_ELEMENT?: null;
    UF_TEST?: null;
    hidden?: boolean;
}

interface ProductItem {
    DATA_PETROVICH?: null;
    ID?: string;
    IMG?: string;
    NAME?: string;
    PRICE?: string;
    SORT?: string;
}

interface ProductRequestData {
  [key: string]: string | number | boolean
}

interface CatalogResponse {
  items: ProductItem[] | null
  pager: NavigationData | false
  sections: CatalogSectionItem[] | []
} 

interface ProductDetailsResponse {
  data: any
  success: boolean
}

interface ProductPriceResponse {
  data: any
  success: boolean
}

type CatalogListParams = {
  idSection?: string | number | false
  page?: string | number
  query?: string | false
  config?: string | number
  style?: string | number
}

