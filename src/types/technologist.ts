
export interface TechnologistFormItem {
  id: string;
  phone: string;
  email: string;
  technique: string[];
}

export interface TechnologistFormError {
  id: string;
  phone: string;
  email: string;
  sketch: string;
}

export interface TechnologistResponse {
  type: "success" | "error";
}

export interface TechnologistRequest {
  TYPE_PRICE: number
}

