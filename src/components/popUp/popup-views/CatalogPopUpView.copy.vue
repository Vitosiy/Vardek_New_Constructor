<template>
  <div class="catalog-popup">
    <header class="catalog-popup__header">
      <h2 class="catalog-popup__title">Общий каталог</h2>
      <ClosePopUpButton 
        class="catalog-popup__close-btn" 
        @click="closePopup" 
      />
    </header>

    <!-- <div>Тест: ID {{ currentLevelTwoId }}</div> -->

    <div class="catalog-popup__search">
      <input
        class="catalog-popup__search-input"
        type="text"
        placeholder="Поиск..."
        v-model="searchQuery"
        @input="(e) => handleSearch(e)"
        name="search"
        style="max-width: 100%"
      />
      <div class="catalog-popup__search-icon">
        <SearchSVG />
      </div>
    </div>

    <div v-if="!catalogStore.productDetails" class="catalog-popup__sections">
      <div class='catalog-popup__sections_left'>
        <div 
          v-for="section in levelOneCategories" 
          :key="section.ID"
          class="catalog-section"
          :class="{ 'active': currentLevelOneId === section.ID }"
          @click="handleLevelOneClick(section)"
          v-memo="[section.ID, currentLevelOneId === section.ID]"
        >
          <h3 
            class="catalog-section__title" 
          >
            {{ section.NAME }}
          </h3>
        </div>
      </div>

      <div class='catalog-popup__sections_right'>
        <div v-if="breadcrumb.length > 0" class="breadcrumb-container">
          <div class="breadcrumb">
            <template v-for="(item, index) in breadcrumb" :key="item.id">
              <span class="breadcrumb__separator" v-if="index > 0">/</span>
              <span 
                class="breadcrumb__item" 
                :class="{ 'active': index === breadcrumb.length - 1 }"
              >
                {{ item.name }}
              </span>
            </template>
          </div>
        </div>
        <div
          class="catalog-popup__level-two"
          v-if="levelTwoCategories.length > 0">
          <div 
            v-for="subsection in levelTwoCategories" 
            :key="subsection.ID"
            class="catalog-section-sub"
            :class="{ 'active': currentLevelTwoId === subsection.ID }"
            @click="handleLevelTwoClick(subsection)"
            v-memo="[subsection.ID, currentLevelTwoId === subsection.ID]"
          >
            <h3 class="catalog-section__title">
              {{ subsection.NAME }}
            </h3>
          </div>
        </div>
          
        <div v-if="products.length > 0" class="products-grid">
          <div 
            v-for="product in products" 
            :key="product.ID"
            class="product-item"
            v-memo="[product.ID, product.NAME, product.PRICE, product.IMG]"
          >
            <div class="product-item__img">
              <img 
                v-if="product?.IMG" 
                :src="`https://dev.vardek.online${product.IMG}`" 
                :alt="product?.NAME || 'Product image'"
                loading="lazy"
              >
            </div>
            <div class="product-item__wrapper">
              <h4 class="product-item__title">{{ product.NAME }}</h4>
              <div class="product-item__price">{{ product.PRICE }}</div>
              <!-- Дополнительная информация о товаре -->
              <button class="product-item__basket" @click="handleProductClick(Number(product.ID))">В корзину</button>
            </div>
          </div>
        </div>
        <div v-else class="product-none">
          В данном разделе товаров не найдено
        </div>



        
        <div style="margin-top: auto;" v-if="catalogStore.pagination"> 
          <Pagination
            :nav-data="catalogStore.pagination"
            @page-changed="handlePageChange"
          />
        </div>
        <!-- <div v-if="isLoading" class="catalog-popup__loading">
          Загрузка данных...
        </div> -->

      </div>
    </div>

    <div 
      class="product-details-content" 
      v-html="catalogStore.productDetails"
      v-if="catalogStore.productDetails"
    ></div>

    <div v-if="isLoading" class="catalog-popup__loader"></div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { storeToRefs } from "pinia";

// Components
import MainInput from "@/components/ui/inputs/MainInput.vue";
import ClosePopUpButton from "@/components/ui/svg/ClosePopUpButton.vue";
import MainButton from "@/components/ui/buttons/MainButton.vue";

// Stores
import { usePopupStore } from '@/store/appStore/popUpsStore';
import { useCatalogStore } from '@/store/appStore/catalogStore';
import Pagination from "@/components/ui/pagination/Pagination.vue";
import SearchSVG from "@/components/ui/svg/SearchSVG.vue";
import { CatalogService } from "@/services/catalogService";

const API_URL = 'https://dev.vardek.online'

const popupStore = usePopupStore();
const catalogStore = useCatalogStore();

// State from store
const { 
  levelOneCategories, 
  levelTwoCategories, 
  products, 
  isLoading, 
  error,
  currentLevelOneId,
  currentLevelTwoId,
  breadcrumb
} = storeToRefs(catalogStore);

const searchQuery = ref('');

// Доступ к данным товара
console.log(catalogStore.productDetails)
// Computed

// // Общая функция для фильтрации
// const filterSections = (sections, query) => {
//   if (!sections) return [];
  
//   return sections.filter(section => 
//     !section.hidden && // Проверка на hidden
//     (!query || section.NAME.toLowerCase().includes(query.toLowerCase()))
//   );
// };

// // Оптимизированные computed-свойства
// const filteredLevelOne = computed(() => 
//   filterSections(levelOneCategories.value, searchQuery.value)
// );

// const filteredLevelTwo = computed(() => 
//   filterSections(levelTwoCategories.value, searchQuery.value)
// );

const filteredLevelOne = computed(() => {
  if (!searchQuery.value) return levelOneCategories.value;
  return levelOneCategories.value.filter(section => 
    section.NAME.toLowerCase().includes(searchQuery.value.toLowerCase()))
});

const filteredLevelTwo = computed(() => {
  if (!searchQuery.value) return levelTwoCategories.value;
  return levelTwoCategories.value.filter(section => 
    section.NAME.toLowerCase().includes(searchQuery.value.toLowerCase()))
});

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  return products.value.filter(product => 
    product.NAME.toLowerCase().includes(searchQuery.value.toLowerCase()))
});



// Lifecycle hooks
onMounted(async () => {
  await catalogStore.fetchInitialCatalog();
  catalogStore.clearProductDetails()
});

// Methods
const handleLevelOneClick = async (data) => {
  // catalogStore.resetLevelTwoAndProducts();
  catalogStore.setID(data.ID, data.DEPTH_LEVEL, data.NAME)
  await catalogStore.fetchCatalogData(data.ID);
};

const handleLevelTwoClick = async (data) => {
  console.log('levelTwoCategories.value', levelTwoCategories.value);
  catalogStore.setID(data.ID, data.DEPTH_LEVEL, data.NAME)
  await catalogStore.fetchCatalogData(data.ID);
};

const handleProductClick = async (productId) => {

  console.log('Product clicked:', catalogStore.productDetails);
  try {
    const details = await catalogStore.fetchProductDetails(productId).then(async (res)=> {
      console.log('res', res)
      if(res) {
        const data = await CatalogService.getPrice();
        if(data) {
          document.querySelector('.spinner__loader_price').style.display = 'none';
          document.querySelector('.product__price-text').innerHTML = data;
          document.querySelector('.product__price').style.display = 'block';
          document.querySelector('.product__price.not__discount').style.display = 'block';

          // Получаем коэффициент из скрытого поля
          const discountCoefficient = parseFloat(document.querySelector('[name="NOT_DISCOUNT"]').value) || 1;

          // Извлекаем число из строки "53 634 руб" (удаляем пробелы и "руб")
          const originalPrice = parseFloat(data.replace(/\s+/g, '').replace('руб', ''));

          // Вычисляем новую цену
          const newPrice = originalPrice * discountCoefficient;

          // Форматируем число с пробелами между тысячами и добавляем "руб"
          const formattedPrice = newPrice.toLocaleString('ru-RU') + ' руб';

          // Вставляем отформатированную цену
          document.querySelector('.product__price-notdiscount').innerHTML = formattedPrice;

        }
      }
    })
    console.log('Product details:', details)
  } catch (error) {
    console.error('Failed to load product:', error)
  }
};



const retryLoading = () => {
  catalogStore.fetchInitialCatalog();
};

const handleSearch = async () => {
  catalogStore.resetCatalogData();
  await catalogStore.fetchSearchProducts(searchQuery.value, false)
  // if(currentLevelTwoId.value === null) {
  //   await catalogStore.fetchSearchProducts(searchQuery.value, false)
  // } else {
  //   await catalogStore.fetchSearchProducts(searchQuery.value, currentLevelTwoId.value);
  // }

  if(!searchQuery.value.length) {
    catalogStore.resetCatalogData();
  } 
};

const handlePageChange = async (page) => {
  console.log('currentLevelTwoId.value', currentLevelTwoId.value);
  // await catalogStore.fetchSearchProducts(searchQuery.value, false, page)
  if(currentLevelTwoId.value === null) {
    await catalogStore.fetchSearchProducts(searchQuery.value, false, page)
  } else {
    await catalogStore.fetchSearchProducts(searchQuery.value, currentLevelTwoId.value, page)
  }
};


const closePopup = () => {
  catalogStore.resetCatalogData();
  popupStore.closePopup('catalog');
};



</script>

<style lang="scss" scoped>
.catalog-popup {
  position: relative;
  width: 1500px;
  // padding: 20px;
  border-radius: 8px;
  box-sizing: border-box;
  height: 851px; // Ограничиваем максимальную высоту попапа
  display: flex;
  flex-direction: column;
  
    @media (min-width: 992px) {
      width: 900px;
    }
    @media (min-width: 1440px) {
      width: 1300px;
    }
    @media (min-width: 1700px) {
      width: 1500px;
    }

  &__header {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 16px;
    flex-shrink: 0; // Запрещаем сжатие заголовка
  }

  &__title {
    font-weight: 600;
    font-size: 32px;
    line-height: 100%;
    letter-spacing: 0%;
    text-align: center;
  }
  
  &__close-btn {
    position: absolute;
    right: 0px;
    top: 11px;
    cursor: pointer;
  }

  &__search {
    position: relative;
    margin: 15px auto;
    width: 100%;

    &-icon {
      width: 20px;
      height: 20px;
      position: absolute;
      left: 18px;
      top: 16px;
    }
    &-input {
      // max-width: 500px;
      width: 100%;

      flex-shrink: 0; // Запрещаем сжатие поиска
      padding: 15px;
      padding-left: 45px;
    }
  }

  &__sections {
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    gap: 20px;
    flex-grow: 1; // Занимаем всё доступное пространство
    overflow: hidden; // Скрываем переполнение
    // overflow-y: auto; // Добавляем скролл при необходимости

    @media (min-width: 768px) {
      flex-direction: row;
    }

    &_left {
      width: 100%;
      min-width: 320px;
      display: flex;
      flex-direction: column;     
      overflow-y: auto; // Добавляем скролл при необходимости
      gap: 10px;
      padding-right: 8px;
      box-sizing: border-box;
      flex-shrink: 0; // Фиксируем ширину
      min-height: 0;
      @media (min-width: 768px) {
        width: 20%;
        height: 100%; // Занимаем всю высоту родителя
      }
    }

    &_right {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 15px;
      box-sizing: border-box;
      flex-grow: 1; // Занимаем оставшееся пространство
      // height: 100%; // Занимаем всю высоту родителя
      min-height: 0;
      padding-right: .5rem;

      @media (min-width: 768px) {
        width: 80%;
      }
    }
  }

  &__level-two {
    display: flex;
    flex-wrap: wrap;
    
    gap: 10px; // Используем gap вместо margin для более предсказуемого поведения
    margin-bottom: 15px;

    .catalog-section {
      width: calc(50% - 0.5rem);

      @media (min-width: 576px) {
        width: calc(33.333% - 0.666rem);
      }

      @media (min-width: 992px) {
        width: calc(25% - 0.75rem);
      }
    }
  }


  &__loader {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    position: absolute;
    top: 1px;
    left: 0;
    animation: rotate 1s linear infinite
  }
  &__loader::before , &__loader::after {
    content: "";
    box-sizing: border-box;
    position: absolute;
    inset: 0px;
    border-radius: 50%;
    border: 5px solid #da444c73;
    animation: prixClipFix 2s linear infinite ;
  }
  &__loader::after{
    border-color: #DA444C;
    animation: prixClipFix 2s linear infinite , rotate 0.5s linear infinite reverse;
    inset: 6px;
  }

}

.catalog-section-sub,
.catalog-section {
  padding: 15px 20px;
  border: 1px solid #C6C6C6;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;

  &.active {
    border-color: #131313;
    border: 1px solid #131313;
  }

  &:hover {
    color: #131313;
    border: 1px solid #131313;
    // transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &__title {
    font-weight: 600;
    font-size: 17px;
    line-height: 100%;
    letter-spacing: 0%;
    color: #5D6069;
  }
}

.catalog-section-sub {
  padding: 10px 15px;
  border-radius: 15px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  overflow-y: auto; // Добавляем скролл при необходимости
  padding-right: .5rem;
}

.product-item {
  padding: 12px;
  border-radius: 6px;
  transition: all 0.2s;
  background-color: #F6F5FA;
  display: flex;


  &:hover {
    // border-color: $primary;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &__img {
    min-width: 160px;
    max-width: 160px;
    width: 100%;
    height: 160px;
    margin-right: 20px;
    border-radius: 8px;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain; // или cover, в зависимости от потребностей
      display: block;
      transition: transform 0.3s ease;
    }
  }
  &__wrapper {
    display: flex;
    flex-direction: column;
  }
  &__price,
  &__title {
    font-weight: 600;
    font-size: 18px;
    line-height: 100%;
    letter-spacing: 0%;
    color: #111B21;
    margin-bottom: 4px;
  }

  &__basket {
    margin-top: auto;
  }

  &__basket {
    width: 153px;
    height: 44px;
    opacity: 1;
    border-radius: 15px;
    padding: 12px 25px;
    background: #DA444C;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: none;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    color: white; /* если есть текст */
    font-family: inherit; /* или укажите нужный шрифт */
    font-size: 14px; /* примерный размер, подберите под ваш дизайн */
    transition: background 0.3s ease; /* плавное изменение фона */
  }

  &__basket:hover {
    background: #c03a42; /* немного темнее при наведении */
  }

  &__basket::before {
    content: "";
    display: inline-block;
    width: 20px; /* размер иконки */
    height: 20px; /* размер иконки */
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }
  
}

.product-none {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  line-height: 100%;
  letter-spacing: 0%;
  vertical-align: middle;
  color: #A3A9B5;
}

.breadcrumb {
  display: inline-flex;
  &__separator {
    margin: 0 10px;
    position: relative;
    bottom: 3px;
  }
  &__item {
    font-size: 16px;
    line-height: 100%;
    letter-spacing: 0%;
    color: #A3A9B5;
    &.active {
      font-weight: 600;
      color: #131313;
    }
  }
}

.product-details-content {
  overflow-y: auto;
}

  @keyframes rotate {
    0%   {transform: rotate(0deg)}
    100%   {transform: rotate(360deg)}
  }

  @keyframes prixClipFix {
      0%   {clip-path:polygon(50% 50%,0 0,0 0,0 0,0 0,0 0)}
      25%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 0,100% 0,100% 0)}
      50%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,100% 100%,100% 100%)}
      75%  {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 100%)}
      100% {clip-path:polygon(50% 50%,0 0,100% 0,100% 100%,0 100%,0 0)}
  }
</style>