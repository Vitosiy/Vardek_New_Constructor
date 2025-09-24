<template>
  <div class="basket-item">
    <div class="basket-item__picture">
      <div class="basket-item__picture-container">
        <img :src="`${API_URL + item?.product.PREVIEW_PICTURE}`" alt="" class="basket-items__picture_img"/>
        <img src="@/assets/svg/left-menu/question.svg" class="basket-items__picture-question" @click="openPopup(item)">
      </div>
    </div>

    <div class="basket-item__product">
      <h3>{{ item?.product.NAME }}</h3>

      <!-- Секция свойств товара -->
      <div class="basket-item__props" v-if="item?.product.PROPS">
        <div v-for="(propValue, propKey) in item.product.PROPS" :key="propKey">
          
          <div v-if="getPropDefinition(String(propKey))">
            <span class="basket-item__props-lable">{{ getPropLabel(String(propKey)) }}:</span>
            
            <!-- Обработка массивов -->
            <ul v-if="Array.isArray(propValue)" class="basket-item__props-list">
              <li v-for="(propVal, index) in propValue" :key="index">
                <span v-if="shouldShowPropValue(propKey, propVal)" 
                      :class="getErrorClass(propVal, item.product.props_error)">
                  {{ formatPropValue(propKey, propVal) }}
                  <span v-if="hasArticle(propKey, propVal)">
                    - артикул {{ getArticleCode(propKey, propVal) }}
                  </span>
                  {{ getErrorText(propVal, item.product.props_error, item, propKey) }}
                  
                  <!-- Дополнительная информация для PRODUCTS -->
                  <template v-if="getPropDefinition(propKey).type === 'PRODUCTS'">
                    <p v-if="propVal.FASADE && propVal.FASADE.fasade && propVal.FASADE.fasade.COLOR">
                      Цвет: {{ getFasadeSectionName(propVal.FASADE.fasade.COLOR) }} - 
                      {{ getFasadeName(propVal.FASADE.fasade.COLOR) }}
                      <span v-if="propVal.FASADE.fasade.PALETTE"> - {{ getPaletteName(propVal.FASADE.fasade.PALETTE) }};</span>
                    </p>
                    
                    <p v-if="propVal.FASADE && propVal.FASADE.fasade && propVal.FASADE.fasade.MILLING">
                      Фрезеровка: {{ getMillingSectionName(propVal.FASADE.fasade.MILLING) }} - 
                      {{ getMillingName(propVal.FASADE.fasade.MILLING) }}
                    </p>
                  </template>
                </span>
              </li>
            </ul>
            
            <!-- Обработка одиночных значений -->
            <span v-else :class="getErrorClass(propValue, item.product.props_error)">
              <template v-if="getPropDefinition(propKey).val === 'obj_list'">
                <ul>
                  <div v-for="(objItem, objIndex) in propValue" :key="objIndex">
                    <li v-if="isObject(objItem)">
                      Секция {{ objIndex }}:
                      <p v-for="(val, key) in objItem" :key="key">
                        Дверь {{ key }}:
                        <template v-if="isObject(val)">
                          <span v-for="(segment, segmentKey) in val" :key="segmentKey">
                            {{ segmentKey }}: {{ getFasadeSectionName(segment) }} - {{ getFasadeName(segment) }}
                            <span v-if="hasArticleForSegment(segment, segmentKey)"> 
                              - артикул {{ getArticleCodeForSegment(segment, segmentKey) }}
                            </span>
                            {{ hasError(segment, segment.props_error) ? '(НЕДОСТУПНО!)' : '' }};
                          </span>
                        </template>
                        
                        <template v-else-if="Array.isArray(val)">
                          <span v-for="(segment, segmentIndex) in val" :key="segmentIndex">
                            {{ segmentIndex + 1 }}: {{ getFasadeSectionName(segment) }} - {{ getFasadeName(segment) }}
                            <span v-if="hasArticleForSegment(segment, key)"> 
                              - артикул {{ getArticleCodeForSegment(segment, key) }}
                            </span>
                            {{ hasError(segment, segment.props_error) ? '(НЕДОСТУПНО!)' : '' }};
                          </span>
                        </template>
                        
                        <template v-else>
                          {{ getFasadeSectionName(val) }} - {{ getFasadeName(val) }}
                          <span v-if="hasArticleForSegment(val, key)"> 
                            - артикул {{ getArticleCodeForSegment(val, key) }}
                          </span>
                          {{ hasError(val, val.props_error) ? '(НЕДОСТУПНО!)' : '' }};
                        </template>
                      </p>
                    </li>
                    
                    <li v-else>
                      {{ objIndex }}: {{ getFasadeSectionName(objItem) }} - {{ getFasadeName(objItem) }}
                      <span v-if="hasArticleForSegment(objItem, propKey)"> 
                        - артикул {{ getArticleCodeForSegment(objItem, propKey) }}
                      </span>
                      {{ hasError(objItem, objItem.props_error) ? '(НЕДОСТУПНО!)' : '' }};
                    </li>
                  </div>
                </ul>
              </template>
              
              <template v-else-if="getPropDefinition(propKey).val === 'color_obj_list'">
                <ul>
                  <div v-for="(colorItem, colorKey) in propValue" :key="colorKey">
                    <li v-if="String(colorKey) === 'COLOR'">
                      Цвет: {{ getFasadeSectionName(colorItem) }} - {{ getFasadeName(colorItem) }}
                      <span v-if="hasArticleForSegment(colorItem, propKey)"> 
                        - артикул {{ getArticleCodeForSegment(colorItem, propKey) }}
                      </span>
                      <span v-if="propValue.PALETTE"> - {{ getPaletteName(propValue.PALETTE) }}</span>
                      {{ hasError(colorItem, colorItem.props_error) ? '(НЕДОСТУПНО!)' : '' }};
                    </li>
                    
                    <li v-if="String(colorKey) === 'MILLING'">
                      Фрезеровка: {{ getMillingSectionName(colorItem) }} - {{ getMillingName(colorItem) }}
                      {{ hasError(colorItem, colorItem.props_error) ? '(НЕДОСТУПНО!)' : '' }};
                    </li>
                  </div>
                </ul>
              </template>
              
              <template v-else-if="getPropDefinition(propKey).val === 'int' && getPropDefinition(propKey).type">
                {{ getTypeName(getPropDefinition(propKey).type, propValue) }}
                <span v-if="hasArticle(propKey, propValue)"> 
                  - артикул {{ getArticleCode(propKey, propValue) }}
                </span>
                {{ hasError(propValue, item.product.props_error) ? '(НЕДОСТУПНО!)' : '' }}
              </template>
              
              <template v-else-if="getPropDefinition(propKey).val === 'list'">
                {{ getListValue(propKey, propValue) }}
              </template>
              
              <template v-else-if="!getPropDefinition(propKey).type && getPropDefinition(propKey).val === 'int'">
                {{ propValue }}
              </template>
              
              <template v-else>
                {{ propValue }}
              </template>
            </span>

          </div>
        </div>
      </div>
    </div>
    
    
    <div class="basket-item__quantity">
      <button v-if="item?.product.TYPE === 'catalog'" class="basket-item__quantity-btn" @click="decrement(item.product.BASKETID, item?.product.TYPE)">-</button>
      <input type="text" :disabled="item?.product.TYPE !== 'catalog'" class="basket-item__quantity-input" v-model="item.product.quantity" @change="() => updateQuantity(item.product.BASKETID, item?.product.TYPE)" />
      <button v-if="item?.product.TYPE === 'catalog'" class="basket-item__quantity-btn" @click="increment(item.product.BASKETID, item?.product.TYPE)">+</button>
    </div>

    <div class="basket-item__price">
      {{ item.product.unitPriceFormat }}
    </div>

    <div class="basket-item__price basket-item__total">
      {{ item.product.allPriceFormat }}
    </div>

    <div class="basket-item__price basket-item__old-total">
      <span>{{ item.product.allPriceOldFormat }}</span>
    </div>

    <div class="basket-item__price basket-item__action">
      <DeleteBasketButton @click="deleteProductInBusket(item.product.BASKETID, item?.product.TYPE)" />
    </div>
    <InfoPopUp v-if="isShowInfoPopup" @close="closeInfoPopup" v-bind="currentProductInfo" />

  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { useBasketStore } from "@/store/appStore/useBasketStore"
import { useAppData } from "@/store/appliction/useAppData"
import { ref, computed } from "vue"
import DeleteBasketButton from "../ui/buttons/basket/DeleteBasketButton.vue";
import axios from "axios";
import InfoPopUp from "../popUp/InfoPopUp.vue";
import { _URL } from "@/types/constants";
const API_URL = ref('https://dev.vardek.online');

interface Props {
  item: any
}

const isShowInfoPopup = ref(false);

const currentProductInfo = ref({
  title: '',
  description: '',
  image: ''
});


const props = defineProps<Props>();
const basketStore = useBasketStore();
const appDataStore = useAppData();
const quantity = ref(props.item.product.quantity);

// Получаем данные из store
const appData = computed(() => appDataStore.getAppData);

// Определения свойств (перенесено из Angular кода)
const propsLabel = {
  COLOR: {type: "COLOR", val: "int", NAME: "Цвет", SORT: 300},
  MODULECOLOR: {type: "FASADE", val: "int", NAME: "Цвет корпуса", SORT: 300},
  SIZE: {type: "SIZE", val: "int", NAME: "Размер", SORT: 400},
  THICKNESS: {type: "THICKNESS", val: "int", NAME: "Толщина", SORT: 500},
  OPTION: {type: "OPTION", val: "array", NAME: "Опции", SORT: 600},
  SIZEEDITHEIGHT: {type: false, val: "int", NAME: "Высота", SORT: 800},
  SIZEEDITDEPTH: {type: false, val: "int", NAME: "Глубина", SORT: 800},
  SIZEEDITWIDTH: {type: false, val: "int", NAME: "Ширина", SORT: 800},
  HEM: {type: "HEM", val: "int", NAME: "Кромка", SORT: 900},
  SHELFQUANT: {type: false, val: "int", NAME: "Количество полок", SORT: 900},
  SIZEEDITJOINDEPTH: {
    type: false,
    val: "int",
    NAME: "Глубина пристыковочного модуля",
    SORT: 1000,
  },
  BACKWALL: {type: "FASADE", val: "color_obj_list", NAME: "Задняя стенка", SORT: 100},
  LEFTSIDECOLOR: {type: "FASADE", val: "color_obj_list", NAME: "Левая стенка", SORT: 100},
  RIGHTSIDECOLOR: {type: "FASADE", val: "color_obj_list", NAME: "Правая стенка", SORT: 100},
  TOPFASADECOLOR: {type: "FASADE", val: "color_obj_list", NAME: "Накладка на крышку", SORT: 100},

  DOORS: {type: "FASADE", val: "obj_list", NAME: "Двери", SORT: 100},
  FACADE: {type: "FASADE", val: "int", NAME: "Цвет фасада", SORT: 100},
  FASADE1: {type: "FASADE", val: "int", NAME: "Цвет фасада 1", SORT: 1000},
  FASADE2: {type: "FASADE", val: "int", NAME: "Цвет фасада 2", SORT: 1100},
  FASADE3: {type: "FASADE", val: "int", NAME: "Цвет фасада 3", SORT: 1200},
  FASADE4: {type: "FASADE", val: "int", NAME: "Цвет фасада 4", SORT: 1300},
  FASADE5: {type: "FASADE", val: "int", NAME: "Цвет фасада 5", SORT: 1300},

  FASADEWIDTH: {type: false, val: "int", NAME: "Ширина фасада", SORT: 1360},
  FASADESIZE: {type: "FASADESIZE", val: "int", NAME: "Высота фасада", SORT: 1350},
  FASADESIZE1: {
    type: "FASADESIZE",
    val: "int",
    NAME: "Размер фасада 1",
    SORT: 1350,
  },
  FASADESIZE2: {
    type: "FASADESIZE",
    val: "int",
    NAME: "Размер фасада 2",
    SORT: 1350,
  },
  FASADESIZE3: {
    type: "FASADESIZE",
    val: "int",
    NAME: "Размер фасада 3",
    SORT: 1350,
  },
  FASADESIZE4: {
    type: "FASADESIZE",
    val: "int",
    NAME: "Размер фасада 4",
    SORT: 1350,
  },
  FASADESIZE5: {
    type: "FASADESIZE",
    val: "int",
    NAME: "Размер фасада 5",
    SORT: 1350,
  },

  FASADESIZEWIDTH1: {
    type: false,
    val: "int",
    NAME: "Ширина фасада 1",
    SORT: 1350,
  },
  FASADESIZEWIDTH2: {
    type: false,
    val: "int",
    NAME: "Ширина фасада 2",
    SORT: 1350,
  },
  FASADESIZEWIDTH3: {
    type: false,
    val: "int",
    NAME: "Ширина фасада 3",
    SORT: 1350,
  },
  FASADESIZEWIDTH4: {
    type: false,
    val: "int",
    NAME: "Ширина фасада 4",
    SORT: 1350,
  },
  FASADESIZEWIDTH5: {
    type: false,
    val: "int",
    NAME: "Ширина фасада 5",
    SORT: 1350,
  },

  GLASS: {type: "GLASS", val: "int", NAME: "Стекло", SORT: 700},
  GLASS1: {type: "GLASS", val: "int", NAME: "Стекло 1", SORT: 1400},
  GLASS2: {type: "GLASS", val: "int", NAME: "Стекло 2", SORT: 1500},
  GLASS3: {type: "GLASS", val: "int", NAME: "Стекло 3", SORT: 1600},
  GLASS4: {type: "GLASS", val: "int", NAME: "Стекло 4", SORT: 1700},
  GLASS5: {type: "GLASS", val: "int", NAME: "Стекло 5", SORT: 1700},

  PATINA: {type: "PATINA", val: "int", NAME: "Патина", SORT: 1800},
  PATINA1: {type: "PATINA", val: "int", NAME: "Патина 1", SORT: 1800},
  PATINA2: {type: "PATINA", val: "int", NAME: "Патина 2", SORT: 1800},
  PATINA3: {type: "PATINA", val: "int", NAME: "Патина 3", SORT: 1800},
  PATINA4: {type: "PATINA", val: "int", NAME: "Патина 4", SORT: 1800},
  PATINA5: {type: "PATINA", val: "int", NAME: "Патина 5", SORT: 1800},

  SHOWCASE: {type: "SHOWCASE", val: "int", NAME: "Тип витрины", SORT: 1800},
  SHOWCASE1: {type: "SHOWCASE", val: "int", NAME: "Тип витрины 1", SORT: 1800},
  SHOWCASE2: {type: "SHOWCASE", val: "int", NAME: "Тип витрины 2", SORT: 1800},
  SHOWCASE3: {type: "SHOWCASE", val: "int", NAME: "Тип витрины 3", SORT: 1800},
  SHOWCASE4: {type: "SHOWCASE", val: "int", NAME: "Тип витрины 4", SORT: 1800},
  SHOWCASE5: {type: "SHOWCASE", val: "int", NAME: "Тип витрины 5", SORT: 1800},

  PALETTE: {type: "PALETTE", val: "int", NAME: "Палитра", SORT: 1800},
  PALETTE1: {type: "PALETTE", val: "int", NAME: "Палитра 1", SORT: 1800},
  PALETTE2: {type: "PALETTE", val: "int", NAME: "Палитра 2", SORT: 1800},
  PALETTE3: {type: "PALETTE", val: "int", NAME: "Палитра 3", SORT: 1800},
  PALETTE4: {type: "PALETTE", val: "int", NAME: "Палитра 4", SORT: 1800},
  PALETTE5: {type: "PALETTE", val: "int", NAME: "Палитра 5", SORT: 1800},

  FASADEALIGN: {
    type: "FASADEALIGN",
    val: "list",
    NAME: "Сторона открывания",
    SORT: 1800,
    VALUE: {left: "Левая", right: "Правая"},
  },
  FASADEALIGN1: {
    type: "FASADEALIGN",
    val: "list",
    NAME: "Сторона открывания 1",
    SORT: 1800,
  },
  FASADEALIGN2: {
    type: "FASADEALIGN",
    val: "list",
    NAME: "Сторона открывания 2",
    SORT: 1800,
  },
  FASADEALIGN3: {
    type: "FASADEALIGN",
    val: "list",
    NAME: "Сторона открывания 3",
    SORT: 1800,
  },
  FASADEALIGN4: {
    type: "FASADEALIGN",
    val: "list",
    NAME: "Сторона открывания 4",
    SORT: 1800,
  },
  FASADEALIGN5: {
    type: "FASADEALIGN",
    val: "list",
    NAME: "Сторона открывания 5",
    SORT: 1800,
  },

  FASADEFIRST: {
    type: "FASADEFIRST",
    val: "list",
    NAME: "Передний фасад",
    SORT: 1800,
    VALUE: {left: "Левый", right: "Правый"},
  },

  MILLING: {type: "MILLING", val: "int", NAME: "Фрезеровка", SORT: 200},
  MILLING1: {type: "MILLING", val: "int", NAME: "Фрезеровка 1", SORT: 1800},
  MILLING2: {type: "MILLING", val: "int", NAME: "Фрезеровка 2", SORT: 1900},
  MILLING3: {type: "MILLING", val: "int", NAME: "Фрезеровка 3", SORT: 2000},
  MILLING4: {type: "MILLING", val: "int", NAME: "Фрезеровка 4", SORT: 2100},
  MILLING5: {type: "MILLING", val: "int", NAME: "Фрезеровка 5", SORT: 2100},

  USLUGI: {type: "USLUGI", val: "array", NAME: "Услуга", SORT: 2110},
  USLUGIL: {type: "USLUGI", val: "array", NAME: "Услуга левая часть", SORT: 2120},
  USLUGIR: {
    type: "USLUGI",
    val: "array",
    NAME: "Услуга правая часть",
    SORT: 2130,
  },
  USLUGI1: {type: "USLUGI", val: "array", NAME: "Услуга 1", SORT: 2201},
  USLUGI2: {type: "USLUGI", val: "array", NAME: "Услуга 2", SORT: 2202},
  USLUGI3: {type: "USLUGI", val: "array", NAME: "Услуга 3", SORT: 2203},
  USLUGI4: {type: "USLUGI", val: "array", NAME: "Услуга 4", SORT: 2204},
  USLUGI5: {type: "USLUGI", val: "array", NAME: "Услуга 5", SORT: 2205},

  USLUGIraspil: {type: false, val: "str", NAME: "Распил", SORT: 2300},

  PROFILE: {type: "USLUGI", val: "int", NAME: "Тип завала", SORT: 2200},
  FILLING: {type: "FILLING", val: "int", NAME: "Вариант компоновки", SORT: 2400},

  FASADETYPE: {type: "FASADETYPE", val: "int", NAME: "Тип фасада", SORT: 2500},
  FASADETYPE1: {type: "FASADETYPE", val: "int", NAME: "Тип фасада 1", SORT: 2510},
  FASADETYPE2: {type: "FASADETYPE", val: "int", NAME: "Тип фасада 2", SORT: 2520},
  FASADETYPE3: {type: "FASADETYPE", val: "int", NAME: "Тип фасада 3", SORT: 2530},
  FASADETYPE4: {type: "FASADETYPE", val: "int", NAME: "Тип фасада 4", SORT: 2540},
  FASADETYPE5: {type: "FASADETYPE", val: "int", NAME: "Тип фасада 5", SORT: 2550},

  SECTIONS: {type: false, val: "int", NAME: "Размер секции", SORT: 2550},
  SECTIONS1: {type: false, val: "int", NAME: "Размер секции 1", SORT: 2550},
  SECTIONS2: {type: false, val: "int", NAME: "Размер секции 2", SORT: 2550},
  SECTIONS3: {type: false, val: "int", NAME: "Размер секции 3", SORT: 2550},
  SECTIONS4: {type: false, val: "int", NAME: "Размер секции 4", SORT: 2550},
  SECTIONS5: {type: false, val: "int", NAME: "Размер секции 5", SORT: 2550},

  SHELFPOSITION: {type: false, val: "int", NAME: "Позиции полок", SORT: 2550},
  SHELFPOSITION1: {type: false, val: "int", NAME: "Позиции полок 1", SORT: 2550},
  SHELFPOSITION2: {type: false, val: "int", NAME: "Позиции полок 2", SORT: 2550},
  SHELFPOSITION3: {type: false, val: "int", NAME: "Позиции полок 3", SORT: 2550},
  SHELFPOSITION4: {type: false, val: "int", NAME: "Позиции полок 4", SORT: 2550},
  SHELFPOSITION5: {type: false, val: "int", NAME: "Позиции полок 5", SORT: 2550},
  SHELFPOSITION6: {type: false, val: "int", NAME: "Позиции полок 6", SORT: 2550},
  SHELFPOSITION7: {type: false, val: "int", NAME: "Позиции полок 7", SORT: 2550},
  SHELFPOSITION8: {type: false, val: "int", NAME: "Позиции полок 8", SORT: 2550},
  SHELFPOSITION9: {type: false, val: "int", NAME: "Позиции полок 9", SORT: 2550},
  SHELFPOSITION10: {
    type: false,
    val: "int",
    NAME: "Позиции полок 10 ",
    SORT: 2550,
  },

  SECTIONSFILLING: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции",
    SORT: 2550,
  },
  SECTIONSFILLING1: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 1",
    SORT: 2550,
  },
  SECTIONSFILLING2: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 2",
    SORT: 2550,
  },
  SECTIONSFILLING3: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 3",
    SORT: 2550,
  },
  SECTIONSFILLING4: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 4",
    SORT: 2550,
  },
  SECTIONSFILLING5: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 5",
    SORT: 2550,
  },
  SECTIONSFILLING6: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 6",
    SORT: 2550,
  },
  SECTIONSFILLING7: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 7",
    SORT: 2550,
  },
  SECTIONSFILLING8: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 8",
    SORT: 2550,
  },
  SECTIONSFILLING9: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 9",
    SORT: 2550,
  },
  SECTIONSFILLING10: {
    type: "PRODUCTS",
    val: "int",
    NAME: "Наполнение секции 10",
    SORT: 2550,
  },
  MECHANISM: {
    type: "MECHANISM",
    val: "int",
    NAME: "Подъемный механизм",
    SORT: 2560,
  },
};


const openPopup = async (item) => {
  try {
    const {data} = await axios.post(`/api/modeller/product/getbyid/`, {
      ID: item.product.ID
    })

    const { NAME, DETAIL_TEXT, DETAIL_PICTURE, PREVIEW_PICTURE, PREVIEW_TEXT, PROPERTY_IMAGES_VALUE, PROPERTY_VIDEO_VALUE, PROPERTY_VIDEO_IMAGE_VALUE } = data.DATA.response;

    currentProductInfo.value = {
    title: NAME,
    detailText: DETAIL_TEXT,
    previewText: PREVIEW_TEXT,
    image: getImageUrl(DETAIL_PICTURE),
    images: PROPERTY_IMAGES_VALUE,
    videoUrl: PROPERTY_VIDEO_VALUE,
    videoPoster: getImageUrl(PROPERTY_VIDEO_IMAGE_VALUE)
  };
    isShowInfoPopup.value = true;
  } catch (error) {
    console.error('API Error:', error);
  }



};

const closeInfoPopup = () => {
  isShowInfoPopup.value = false;
  currentProductInfo.value = {
    title: '',
    description: '',
    image: ''
  };
};

const getImageUrl = (imageName: string) => {
  return ` ${_URL}${imageName}`;
};

// Вспомогательные функции
const getPropDefinition = (key: string) => {
  return propsLabel[key as keyof typeof propsLabel];
};

const getPropLabel = (key: string) => {
  const propDef = getPropDefinition(key);
  return propDef ? propDef.NAME + parsePropIndex(key) : '';
};

const parsePropIndex = (key: string) => {
  // Извлекаем числовой индекс из ключа (если есть)
  const match = key.match(/\d+$/);
  return match ? ` ${match[0]}` : '';
};

const shouldShowPropValue = (key: string, propVal: any) => {
  const propDef = getPropDefinition(key);
  return propDef && propDef.type && propDef.type !== 'PRODUCT';
};

const formatPropValue = (key: string, propVal: any) => {
  const propDef = getPropDefinition(key);
  if (propDef && propDef.type === 'PRODUCTS') {
    if (propVal.ID) {
      return propVal.VALUE === null 
        ? getProductInfo(propVal.ID).NAME 
        : `${getProductInfo(propVal.ID).NAME} - поз. ${propVal.VALUE} мм.`;
    } else {
      return getProductInfo(propVal).NAME;
    }
  }
  return getTypeName(propDef?.type, propVal);
};

const getErrorClass = (propVal: any, propsError: any) => {
  // Здесь должна быть логика определения классов ошибок
  // Это упрощенная версия, нужно адаптировать под вашу логику
  if (propsError && propsError.includes(propVal)) {
    return 'error-background';
  }
  return '';
};

const getErrorText = (propVal: any, propsError: any, _item?: any, _propKey?: any) => {
  // Здесь должна быть полная логика определения текста ошибки
  // Это упрощенная версия
  if (propsError && propsError.includes(propVal)) {
    return '(НЕДОСТУПНО!)';
  }
  return '';
};

const hasArticle = (_key: string, _propVal: any) => {
  // Логика проверки наличия артикула
  return false; // Заглушка
};

const getArticleCode = (_key: string, _propVal: any) => {
  // Логика получения кода артикула
  return ''; // Заглушка
};

const isObject = (value: any) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const hasArticleForSegment = (_segment: any, _key: string) => {
  // Логика проверки наличия артикула для сегмента
  return false; // Заглушка
};

const getArticleCodeForSegment = (_segment: any, _key: string) => {
  // Логика получения кода артикула для сегмента
  return ''; // Заглушка
};

const hasError = (value: any, propsError: any) => {
  // Логика проверки ошибки
  return propsError && propsError.includes(value);
};

const getTypeName = (type: any, value: any) => {
  // Получаем имя из store данных
  if (appData.value && appData.value[type] && appData.value[type][value]) {
    return appData.value[type][value].NAME || `[${type}:${value}]`;
  }
  return `[${type}:${value}]`;
};

const getListValue = (key: string, value: any) => {
  const propDef = getPropDefinition(key);
  return (propDef as any)?.VALUE ? (propDef as any).VALUE[value] : value;
};

const getFasadeSectionName = (id: any) => {
  // Получаем название секции фасада из store данных
  if (appData.value && appData.value.FASADE_SECTION && appData.value.FASADE_SECTION[id]) {
    return appData.value.FASADE_SECTION[id].NAME || `Секция фасада ${id}`;
  }
  return `Секция фасада ${id}`;
};

const getFasadeName = (id: any) => {
  // Получаем название фасада из store данных
  if (appData.value && appData.value.FASADE && appData.value.FASADE[id]) {
    return appData.value.FASADE[id].NAME || `Фасад ${id}`;
  }
  return `Фасад ${id}`;
};

const getPaletteName = (id: any) => {
  // Получаем название палитры из store данных
  if (appData.value && appData.value.PALETTE && appData.value.PALETTE[id]) {
    return appData.value.PALETTE[id].NAME || `Палитра ${id}`;
  }
  return `Палитра ${id}`;
};

const getMillingSectionName = (id: any) => {
  // Получаем название секции фрезеровки из store данных
  if (appData.value && appData.value.MILLING && appData.value.MILLING[id]) {
    return appData.value.MILLING[id].SECTION_NAME || `Секция фрезеровки ${id}`;
  }
  return `Секция фрезеровки ${id}`;
};

const getMillingName = (id: any) => {
  // Получаем название фрезеровки из store данных
  if (appData.value && appData.value.MILLING && appData.value.MILLING[id]) {
    return appData.value.MILLING[id].NAME || `Фрезеровка ${id}`;
  }
  return `Фрезеровка ${id}`;
};

const getProductInfo = (id: any) => {
  // Получаем информацию о продукте из store данных
  if (appData.value && appData.value.CATALOG && appData.value.CATALOG.PRODUCTS && appData.value.CATALOG.PRODUCTS[id]) {
    return { NAME: appData.value.CATALOG.PRODUCTS[id].NAME || `Продукт ${id}` };
  }
  return { NAME: `Продукт ${id}` };
};

function increment(id: string, type: string) {
  quantity.value++
  updateQuantity(id, type)
}

function decrement(id: string, type: string) {
  if (quantity.value > 1) {
    quantity.value--
    updateQuantity(id, type)
  }
}

function updateQuantity(id: string, type: string) {
  basketStore.updateQuantityFromBaske(id, type, quantity);
}

const deleteProductInBusket = (id: string, type: string) => {
  basketStore.removeFromBasket(id, type);
}
</script>

<style scoped lang="scss">
.basket-item {
  display: grid;
  grid-template-columns: 150px 1fr 120px 120px 120px 120px 42px;
  align-items: center;
  gap: 10px;
  padding: 15px 0;
  &:not(:last-child) {
    border-bottom: 1px solid #eee;
  }

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 12px;
    border: 1px solid #eee;
    border-radius: 10px;
    background: #fafafa;
  }
  // &__picture-img {
  //   max-width: 130px;
  //   border-radius: 8px;
  // }
  // &__picture-question {
  //   position: absolute;
  //   right: 10px;
  //   top: 10px;
  // }
  &__picture {
    margin-bottom: auto;
    text-align: center;
    max-width: 130px;
    max-height: 130px;
    border-radius: 8px;
    overflow: hidden;
    
    &-container {
      position: relative;
    }
    & img:first-child {
      width: 100%;
    }
    & img:last-child {
      position: absolute;
      right: 7px;
      top: 10px;
      cursor: pointer;
    }
  }

  &__product h3 {
    color: #111B21;
    font-size: 15px;
    margin-bottom: 4px;
  }

  &__props {
    grid-column: 1 / -1;
    color: #111B21;
    &-lable {
      font-weight: 600;
      font-size: 15px;
      line-height: 100%;
      letter-spacing: 0%;
      color: #A3A9B5 !important;
      margin-right: 4px;
    }
    span {
      color: #111B21;
            font-weight: 600;

    }
    ul {
      margin: 0;
      padding-left: 20px;
    }

    li {
      position: relative;
      margin-bottom: 4px;
      font-size: 0.9rem;
      font-weight: 600;
      line-height: 100%;
      letter-spacing: 0%;
      &::after {
        content: "";
        display: block;
        width: 4px;
        height: 4px;
        background-color: #111B21;
        position: absolute;
        top: 6px;
        left: -10px;
        border-radius: 50%;
      }
    }
    
    .error-background {
      background-color: red;
      color: white;
      padding: 2px 4px;
    }
  }

  &__quantity {
    display: flex;
    align-items: center;
    gap: 6px;

    &-input {
      width: 38px;
      height: 38px;
      text-align: center;
      background-color: #F6F5FA;
      border: 1px solid #ECEBF1;
      font-weight: 500;
      font-style: Medium;
      font-size: 15px;
      line-height: 100%;
      letter-spacing: 0%;
      vertical-align: middle;
      color: #111B21
    }
    &-btn {
      background-color: transparent;
      border: none;
      color: #A3A9B5;
      font-size: 2rem;
    }
  }
  &__price {
    font-weight: 500;
    font-style: Medium;
    font-size: 15px;
    line-height: 100%;
    letter-spacing: 0%;
    vertical-align: middle;
    color: #111B21
  }
  &__old-total span {
    display: inline-block;
    position: relative;
    &::after {
      content: '';
      display: block;
      width: 100%;
      height: 1px;
      background-color: #111B21;
      position: absolute;
      top: 7px;
      left: 0;
    }
  }
}

</style>