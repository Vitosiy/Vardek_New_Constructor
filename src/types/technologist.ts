//#region Интерфейсы для формы заявки
export interface TechnologistFormItem {
  projectId: string;
  phone: string;
  email: string;
  fio: string;
  technique: string[];
  sketch: File[];
  photoRoom?: File[];
  metering?: File[];
  comments?: string;
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
    fio: TechnologistFormErrorItem;
    technique: TechnologistFormErrorItem;
    projectId: TechnologistFormErrorItem;
  };
}

export interface TechnologistFormResponse {
  CODE: number;
  DATA: TechnologistFormError | boolean;
}

//#endregion

//#region Интерфейсы для окна технолога
export interface TechnologistResponse {
  CODE: number;
  DATA: TechnologistResponseData | boolean;
}

export interface TechnologistCommentsResponse {
  CODE: number;
  DATA: TechnologistCommentsItem[] | boolean;
}

export interface TechListElementsItem {
  id: string; //ID заявки
  projectId: string;  //ID проекта дизайнера
  projectTechId: string,  //ID проекта технолога
  statusId: string; //Код статуса сделки
  mail: string;  //E-mail дизайнера
  name: string; //Имя заявки
}

export interface TechnologistTechList {
  filter: number | string;
  pager: number | string;
  loader: boolean;
  elements: TechListElementsItem[];
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

export interface TechnologistCommentsItem {
  ID: string;
  ENTITY_ID: number;
  ENTITY_TYPE: string;
  CREATED: string;
  COMMENT: string;
  AUTHOR_ID: string;
  FILES: {
    [key: string]: TechnologistCommentsFile;
  };
}

export interface TechnologistCommentsFile {
  id: number;
  date: string;
  type: string;
  name: string;
  size: number;
  image: {
    width: number;
    height: number;
  };
  authorId: number;
  authorName: string;
  urlPreview: string;
  urlShow: string;
  urlDownload: string;
  customLink: string;
}

export interface TechnologistFormReview {
  id: string; //ID заявки
  projectId: string;  //ID проекта дизайнера
  projectTechId: string,  //ID проекта технолога
  statusId: string; //Код статуса сделки
  message: string;
  result: {
    success?: boolean;
    error?: String[];
  };
  commentsFiles?: File[];
  comments?: TechnologistCommentsItem[]
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
//#endregion
