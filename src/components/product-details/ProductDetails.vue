<template>
  <div class="product-details" v-if="productDetails">
    <button @click="handleBack" class="product-details__back-page">← Назад</button>
    <div v-html="productDetails"></div>
  </div>
</template>

<script setup>
  import { useCatalogStore } from '@/store/appStore/catalogStore';
  import { defineProps, defineEmits, defineExpose, onUnmounted } from 'vue';

  const props = defineProps({
    productDetails: {
      type: String,
      required: true,
    },
  });
  const catalogStore = useCatalogStore();

  const emits = defineEmits(['back']);

  const handleBack = () => {
    emits('back');
  };

  // Обработчики для демонстрации альтернативного подхода
  const clickHandler = (e) => {
    e.preventDefault();
    console.log('Add to cart clicked');
    // Логика добавления в корзину
  };

  const inputHandler = (e) => {
    console.log('Form input changed:', e.target);
    const formElement = e.currentTarget;
    console.log(formElement);
    catalogStore.fetchProductPrice(formElement);
  };

  const getProductHTML = (id) => {
    try {
      const formData = new FormData();
      formData.append('ID', id.toString());
      formData.append('custom_price_type', false);
      
      catalogStore.fetchProductDetails(formData).then(async (res) => {
        const formElement = document.querySelector('.product__form');
        if (formElement) {
          formElement.addEventListener('input', inputHandler);
        }
        
        const addToCartButton = document.querySelector('.product__cart-button');
        if (addToCartButton) {
          addToCartButton.addEventListener('click', clickHandler);
        }
        
        await catalogStore.fetchProductPrice(formElement);  
        initAddLisiner();
        
      });
    } catch (error) {
      console.error('Error loading product details:', error);
      // Можно добавить обработку ошибки (например, показать уведомление)
    }
  };


  defineExpose({
    getProductHTML,
  });

  // Удаляем обработчики при размонтировании
  onUnmounted(() => {
    const formElement = document.querySelector('.product__form.catalog-element-form');
    const addToCartButton = document.querySelector('.product__cart-button');
    
    if (formElement) {
      formElement.removeEventListener('input', inputHandler);
    }
    
    if (addToCartButton) {
      addToCartButton.removeEventListener('click', clickHandler);
    }
  });



  const initAddLisiner = () => {
    document.addEventListener('click', handleFacadeToggleClick);
    setupColorSwitcher();
    setupFacadeSwitcher();
    setupFacadeSizeSwitcher();
    initFacadeSizeSliders();
    initCustomSizeSystem();

  }

  function handleFacadeToggleClick(e) {
    // Проверяем, был ли клик по элементу с классом facade-collaps
    const toggleButton = e.target.closest('.facade-collaps');
    if (!toggleButton) return;
    
    e.preventDefault();
    
    // Находим родительский ul
    const list = toggleButton.closest('ul.group-values');
    if (!list) return;
    
    // Переключаем видимость элементов
    console.log('list', list);
    toggleHiddenFacades(list);
    
    // Переключаем текст кнопки
    console.log('toggleButton', toggleButton);
    toggleButtonText(toggleButton);
    
    // Функция для переключения видимости скрытых элементов
    function toggleHiddenFacades(list) {
      const hiddenItems = list.querySelectorAll('.hiddenfacade');
      
      hiddenItems.forEach(item => {
        if (item.style.display === 'block') {
          item.style.display = 'none'; // Если элемент видим, скрываем его
        } else {
          item.style.display = 'block'; // Если скрыт, показываем
        }
      });
    }

    // Функция для переключения текста кнопки
    function toggleButtonText(button) {
      console.log('button', button)
      const showText = button.querySelector('.facade-more-show');
      const hideText = button.querySelector('.facade-more-hide');
      
      if (showText.style.display === 'none') {
        showText.style.display = 'block';
        hideText.style.display = 'none';
      } else {
        showText.style.display = 'none';
        hideText.style.display = 'block';
      }
    }
  }
  
  function setupColorSwitcher() {
    // Находим все радиокнопки с именем MODULECOLOR
    const colorRadios = document.querySelectorAll('input[name="MODULECOLOR"]');
    
    // Для каждой радиокнопки добавляем обработчик события change
    colorRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        // Удаляем класс selected со всех label
        document.querySelectorAll('.prop-colors label').forEach(label => {
          label.classList.remove('selected');
        });
        
        // Добавляем класс selected к label текущей выбранной радиокнопки
        if (this.checked) {
          this.closest('label').classList.add('selected');
        }
      });
    });
  }

  function setupFacadeSwitcher() {
    // Находим контейнер с выбором фасада
    const facadeContainer = document.querySelector('.prop-facades');
    if (!facadeContainer) return;

    // Вешаем обработчик события change на контейнер (делегирование)
    facadeContainer.addEventListener('change', function(e) {
      // Проверяем, что событие произошло на нужном input
      if (e.target && e.target.matches('input[name="FACADE"]')) {
        // Удаляем класс selected со всех label в этом контейнере
        const allLabels = facadeContainer.querySelectorAll('label');
        allLabels.forEach(label => label.classList.remove('selected'));
        
        // Добавляем класс selected к текущему выбранному label
        e.target.closest('label').classList.add('selected');
        
      }
    });

    // Инициализация - отмечаем выбранный элемент при загрузке
    const selectedInput = facadeContainer.querySelector('input[name="FACADE"]:checked');
    if (selectedInput) {
      selectedInput.closest('label').classList.add('selected');
    }
  }

  function setupFacadeSizeSwitcher() {
    // Находим контейнер с выбором размеров фасадов
    const facadeSizeContainer = document.querySelector('.prop-fasadesize');
    if (!facadeSizeContainer) return;

    // Вешаем обработчик события change на контейнер (делегирование)
    facadeSizeContainer.addEventListener('change', function(e) {
      // Проверяем, что событие произошло на input с именем, начинающимся на FASADESIZE
      if (e.target && e.target.matches('input[name^="FASADESIZE"]')) {
        const radioName = e.target.name;
        
        // Удаляем класс selected со всех label с таким же именем группы
        const allLabels = facadeSizeContainer.querySelectorAll(`input[name="${radioName}"]`);
        allLabels.forEach(input => {
          input.closest('label').classList.remove('selected');
        });
        
        // Добавляем класс selected к текущему выбранному label
        e.target.closest('label').classList.add('selected');
        
        // Обработка нестандартных размеров (показываем/скрываем блоки ввода)
        handleCustomSizeSelection(e.target);
      }
    });

    // Инициализация - отмечаем выбранные элементы при загрузке
    const selectedInputs = facadeSizeContainer.querySelectorAll('input[name^="FASADESIZE"]:checked');
    selectedInputs.forEach(input => {
      input.closest('label').classList.add('selected');
      handleCustomSizeSelection(input);
    });
    
    // Функция для обработки выбора нестандартного размера
    function handleCustomSizeSelection(selectedInput) {
      const formAction = selectedInput.getAttribute('data-form-action');
      const customSizeBlock = document.querySelector(`.${formAction}`);
      
      // Скрываем все блоки ввода нестандартных размеров
      document.querySelectorAll('.form-action').forEach(block => {
        block.style.display = 'none';
      });
      
      // Показываем только нужный блок
      if (formAction && customSizeBlock) {
        customSizeBlock.style.display = 'block';
      }
    }
  }

function initFacadeSizeSliders() {
  // Ищем все контейнеры для слайдеров
  const sliderContainers = document.querySelectorAll('[id^="size_edit_fasadesizewidth"]');
  console.log('sliderContainers', sliderContainers);
  if (sliderContainers.length === 0) {
    console.log('Слайдеры не найдены - проверьте селектор');
    return;
  }

  sliderContainers.forEach(sliderContainer => {
    console.log('Обрабатываем контейнер:', sliderContainer.id);
    
    // Получаем параметры из data-атрибутов
    const min = parseInt(sliderContainer.dataset.min) || 0;
    const max = parseInt(sliderContainer.dataset.max) || 1000;
    const step = parseInt(sliderContainer.dataset.step) || 1;
    
    // Находим связанный input
    const inputId = sliderContainer.id.replace('_slider', '_input');
    console.log('inputId', inputId)
    const inputWrapper = document.querySelector(`.${inputId}`);
    
    if (!inputWrapper) {
      console.log('Не найден input для контейнера', sliderContainer.id);
      return;
    }
    
    const input = inputWrapper.querySelector('input');
    if (!input) {
      console.log('Не найден input внутри wrapper', inputId);
      return;
    }

    console.log(`Создаем слайдер для ${inputId} (min: ${min}, max: ${max}, step: ${step})`);

    // Создаем элемент слайдера
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = input.value || min;
    slider.className = 'custom-slider';
    
    // Очищаем контейнер и добавляем слайдер
    sliderContainer.innerHTML = '';
    sliderContainer.appendChild(slider);
    
    // Связываем слайдер с input
    slider.addEventListener('input', function() {
      input.value = this.value;
      console.log('Значение слайдера изменено:', this.value);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    // Обрабатываем изменения в input
    input.addEventListener('change', function() {
      let value = parseInt(this.value);
      if (isNaN(value)) value = min;
      value = Math.max(min, Math.min(max, value));
      slider.value = value;
      this.value = value; // Корректируем значение
      console.log('Значение input изменено:', value);
    });
    
    // Разблокируем input
    input.readOnly = false;
    input.disabled = false;
    
    console.log('Слайдер успешно создан');
  });
}


function initCustomSizeSystem() {
  // 1. Инициализация чекбокса
  const sizeCheckbox = document.querySelector('#sizeeditopt');
  const sizeWrapper = document.querySelector('.prop-wrap-sizeoptional');
  
  if (sizeCheckbox && sizeWrapper) {
    // Скрываем блок при загрузке, если чекбокс не отмечен
    sizeWrapper.style.display = sizeCheckbox.checked ? 'block' : 'none';
    
    // Обработчик изменения чекбокса
    sizeCheckbox.addEventListener('change', function() {
      sizeWrapper.style.display = this.checked ? 'block' : 'none';
      if (this.checked) {
        initSizeSliders(); // Инициализируем слайдеры при показе
      }
    });
  }

  // 2. Инициализация всех слайдеров размеров
  function initSizeSliders() {
    document.querySelectorAll('.prop-resize[data-type]').forEach(resizeBlock => {
      const type = resizeBlock.dataset.type;
      const sliderWrap = resizeBlock.querySelector(`#size_edit_${type}_slider_wrap`);
      const sliderContainer = resizeBlock.querySelector(`#size_edit_${type}_slider`);
      const input = resizeBlock.querySelector(`#size_edit_${type}_input`);
      
      if (!sliderContainer || !input) return;
      
      // Проверяем, не инициализирован ли уже слайдер
      if (sliderContainer.querySelector('.custom-slider')) return;
      
      const min = parseInt(input.dataset.min) || parseInt(sliderContainer.dataset.min) || 0;
      const max = parseInt(input.dataset.max) || parseInt(sliderContainer.dataset.max) || 1000;
      const step = parseInt(sliderContainer.dataset.step) || 1;
      const value = parseInt(input.value) || min;

      // Создаем кастомный слайдер
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.className = 'custom-slider';
      slider.min = min;
      slider.max = max;
      slider.step = step;
      slider.value = value;
      
      // Очищаем контейнер и добавляем слайдер
      sliderContainer.innerHTML = '';
      sliderContainer.appendChild(slider);
      
      // Связываем слайдер с input
      slider.addEventListener('input', function() {
        input.value = this.value;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      // Обрабатываем изменения в input
      input.addEventListener('change', function() {
        let val = parseInt(this.value) || min;
        val = Math.max(min, Math.min(max, val));
        slider.value = this.value = val;
      });
      
      // Разблокируем input при активации нестандартных размеров
      input.readOnly = !sizeCheckbox.checked;
    });
  }
}

</script>

<style lang="scss">
  @import '@/assets/styles/product.css';

  .product-details {
    overflow-y: auto;
    &__back-page {
      background: #F6F5FA;
      width: 108px;
      height: 50px;
      border-radius: 15px;
      padding: 15px;
      gap: 10px;
      opacity: 1;
      border: none;
      outline: none;
      transition: all 0.3s ease;
      &:hover {
        background: #E8E7F2;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      &:active {
        box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
      }
    }
  }

</style>




