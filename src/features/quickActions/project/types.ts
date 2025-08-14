export type AnyRecord = Record<string, any>

export interface ProjectListItem {
  id: string
  name?: string
  previewUrl?: string
  updatedAt?: string
  [key: string]: any
}

export interface Project {
  id: string
  name?: string
  data?: AnyRecord
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}


