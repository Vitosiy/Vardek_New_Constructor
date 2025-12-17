
export interface TechnologistFormItem {
  id: string;
  phone: string;
  email: string;
  name: string;
  technique: string[];
}

export interface TechnologistFormError {
  id: string;
  phone: string;
  email: string;
  sketch: string;
  name: string;
}

export interface TechnologistTechList {
  filter: string;
  pager: string;
  loader: boolean;
  elements: [];
  nav: {};
}

export interface TechnologistResponse {
  type: "success" | "error";
}

export interface TechnologistRequest {
  TYPE_PRICE: number
}

