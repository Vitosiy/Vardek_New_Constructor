//#region Интерфейсы для формы заявки
export interface TechnologistFormItem {
  projectId: string;
  phone: string;
  email: string;
  name: string;
  technique: string[];
  sketch: File[];
  photoRoom?: File[];
  metering?: File[];
}

interface TechnologistFormErrorItem {
  text: string;
  code: string;
}

export interface TechnologistFormError {
  error: {
    id: TechnologistFormErrorItem;
    phone: TechnologistFormErrorItem;
    email: TechnologistFormErrorItem;
    sketch: TechnologistFormErrorItem;
    name: TechnologistFormErrorItem;
    technique: TechnologistFormErrorItem;
    projectId: TechnologistFormErrorItem;
  };
}

export interface TechnologistFormResponse {
  CODE: number;
  DATA: TechnologistFormError | boolean;
}

//#endregion

export interface TechnologistResponse {
  CODE: number;
  DATA: TechnologistResponseData | boolean;
}

export interface TechnologistTechList {
  filter: number | string;
  pager: number | string;
  loader: boolean;
  elements: [];
  nav: {};
}

export interface TechnologistFormReview {
  projectId: number;
  projectTechId: number,
  statusId: string;
  message: string;
  result: {
    success?: boolean;
    error?: String[];
  };
  commentsFiles?: File[];
  comments?: {
    COMMENT: string;
    fileBx: File[];
  }
}

export interface TechnologistResponseData {
  items: {} | null;
  nav?: {
    NavPageNomer?: string | number;
    NavPageCount?: number;
    NavPageSize?: number;
    NavRecordCount?: string | number;
    nStartPage?: number;
    nEndPage?: number;
    nPageWindow?: number;
    [key: string]: any;
  };
}