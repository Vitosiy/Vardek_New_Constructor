
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

export interface TechnologistTechList {
  filter: string;
  pager: string;
  loader: boolean;
  elements: [];
  nav: {};
}

export interface TechnologistResponse {
  success: boolean;
  data: TechnologistFormError | boolean;
  message?: string;
}

export interface TechnologistRequest {
  login: string;
  password: string;
  projectId: string;
  phone: string;
  email: string;
  name: string;
  technique: string[];
  sketch: File[];
  photoRoom?: File[];
  metering?: File[];
}

