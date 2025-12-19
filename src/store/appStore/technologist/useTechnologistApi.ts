//@ts-nocheck

import { readonly, ref } from 'vue'
import { TechnologistService} from "@/services/technologistService.ts";
import {TechnologistFormItem, TechnologistResponse, TechnologistRequest} from "@/types/technologist.ts";
import {useTechnologistStorage} from "@/store/appStore/technologist/useTechnologistStorage.ts";

export const useTechnologistApi = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const technologistStorage = useTechnologistStorage();

  const submitTechForm = async (formItem: FormData): Promise<TechnologistResponse | null> => {
    loading.value = true
    error.value = null

    try {
      /*const request: TechnologistRequest = {
        ...formItem
      }*/
      const response = await TechnologistService.submitTechForm(formItem)

      if (response.DATA.error) {
        technologistStorage.setTechFormError(response.DATA)
      } else {
        technologistStorage.setTechFormError({})
      }

      return { ...response.DATA }
    }
    catch (err: any) {
      error.value = err.message || 'Ошибка при отправке заявки'
      return null
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    submitTechForm,
  }
}