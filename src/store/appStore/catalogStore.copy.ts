import { defineStore } from 'pinia'
import { ref } from 'vue'
import { CatalogService } from '@/services/catalogService'

export const useCatalogStore = defineStore('catalog', () => {
  // State
  const levelOneCategories = ref<any[]>([])
  const levelTwoCategories = ref<any[]>([])
  const products = ref<any[]>([])
  const productDetails = ref<any>(null)
  const isLoading = ref(false)
  const error = ref<any>(null)
  const currentLevelOneId = ref<number | string | null>(null) // ID level 1
  const currentLevelTwoId = ref<number | string | null>(null) // ID 
	const depthLevel =  ref<any>(null); // текущий левел
	const breadcrumb =  ref<any[]>([]); // 
 
	const searchProducts = ref<any>({})
	const pagination = ref<any>({})

  // Actions
  const fetchInitialCatalog = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await CatalogService.getCatalogList()
      
      if (!response?.sections) {
        throw new Error('Invalid server response: missing sections')
      }
      
      levelOneCategories.value = response.sections
    } catch (err) {
      error.value = err
      console.error('Error loading initial catalog:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchCatalogData = async (id: number | string) => {
    try {
      isLoading.value = true
      error.value = null
      pagination.value = {}

      const response = await CatalogService.getCatalogList(id);
      console.log(response);
      if (!response) {
        throw new Error('Invalid server response');
      }

      pagination.value = response.pager;
      if(response.pager) {
      }

      if (response.sections?.length > 0) {
        depthLevel.value = response.sections[0].DEPTH_LEVEL;

        if (depthLevel.value === '1') {
          levelOneCategories.value = response.sections
          currentLevelOneId.value = id
        } else {
          levelTwoCategories.value = response.sections
          currentLevelTwoId.value = id
        }
        

      }
 
      
      products.value = response.items || []

    } catch (err) {
      error.value = err
      console.error('Error loading catalog data:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchSearchProducts = async (value: any | string, section: any = false, page:any = '1') => {
    try {
      
      const details = await CatalogService.getSearchProducts(value, section, page)
      
      if (!details) {
        throw new Error('Product details not found')
      }

      // resetCatalogData();
      // searchProducts.value = details
			pagination.value = details.pager;
			products.value = details.items || []

      return details
    } catch (err) {
      error.value = err
      console.error('Error loading product details:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchProductDetails = async (id: number | string, customPriceType: boolean = false) => {
    try {
      isLoading.value = true
      error.value = null
      productDetails.value = null
      
      const details = await CatalogService.getProductDetails(id, customPriceType)
      
      if (!details) {
        throw new Error('Product details not found')
      }

      productDetails.value = details
      pagination.value = details.pager;
      return details
    } catch (err) {
      error.value = err
      console.error('Error loading product details:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

	

  // Helpers
  const resetLevelTwoAndProducts = () => {
    levelTwoCategories.value = []
    products.value = []
    currentLevelTwoId.value = null
  }

  const resetCatalogData = () => {
    levelTwoCategories.value = [];
    products.value = [];
    currentLevelOneId.value = null;
    currentLevelTwoId.value = null;
		breadcrumb.value = [];
    // pagination.value = {};
  }

  const clearProductDetails = () => {
    productDetails.value = null
  }

	const setID = (id: any, level: string, name: string) => {
		const levelNum = parseInt(level);
		
		// Оставляем только крошки до текущего уровня
		breadcrumb.value = breadcrumb.value.slice(0, levelNum - 1);
		
		// Добавляем новую крошку
		breadcrumb.value.push({
			name,
			level,
			id,
		});
		
		// Обновляем текущие ID
		if (level === '1') currentLevelOneId.value = id;
		if (level !== '1') currentLevelTwoId.value = id;

		// console.log('breadcrumb', breadcrumb.value)

	}	


	
  return {
    // State
    levelOneCategories,
    levelTwoCategories,
    products,
    productDetails,
    isLoading,
    error,
    currentLevelOneId,
    currentLevelTwoId,
		breadcrumb,
		pagination,
    
    // Actions
    fetchInitialCatalog,
    fetchCatalogData,
    fetchProductDetails,
		fetchSearchProducts,
    resetLevelTwoAndProducts,
    resetCatalogData,
    clearProductDetails,
		setID

  }
})