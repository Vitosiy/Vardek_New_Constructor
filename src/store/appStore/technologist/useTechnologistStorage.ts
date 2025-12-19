import { ref } from 'vue'
import {TechnologistFormError, TechnologistTechList} from "@/types/technologist.ts";
import {defineStore} from "pinia";

/*const STORAGE_KEY = 'technologist-data'
const defaultDeal = {
  'dealId': false,
  'dealStatus': false,
  'techProjectId': false,
  'techProject': false,
}*/

export const useTechnologistStorage = defineStore('technologist-data', () => {
  const currentProjectID = ref<number|boolean>(false)
  const techFormError = ref<TechnologistFormError>(<TechnologistFormError>{})
  const techList = ref<TechnologistTechList>(<TechnologistTechList>{filter: 0})
  //const deal = ref(Object.assign({}, defaultDeal))

  const setCurrentProjectID = (id: number) => {
    if(id && currentProjectID.value !== id) {
      currentProjectID.value = id
    }
  }

  const setTechFormError = (error: TechnologistFormError) => {
    if(error) {
      techFormError.value = error
    }
  }

  const getCurrentProjectID = () => {
    return currentProjectID.value;
  }

  const getTechFormError = () => {
    return techFormError.value?.error || {};
  }

  const getTechList = () => {
    return techList.value;
  }
  const clearTechList = () => {
    techList.value = <TechnologistTechList>{filter: 0};
  }

  const clearStorage = () => {
    currentProjectID.value = false
    clearError()
  }

  const clearError = () => {
    techFormError.value = <TechnologistFormError>{}
  }

  return {
    techList,
    setTechFormError,
    getTechFormError,
    getCurrentProjectID,
    setCurrentProjectID,
    clearStorage,
    clearError,
    getTechList,
    clearTechList
  }
})