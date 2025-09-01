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
    console.log(formElement.type);
    catalogStore.fetchProductPrice(formElement);
    // if(formElement.type !== "range") {
    // }
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
    initSizeSliders();
    // initUslugiRaspil();
    initColorSelector();
    initUslugiRaspilDlinnomer(); // Распил длинномера
    initSizeEditOptionalVisibility();
    initUslugiRaspilNew(); // 


    
    // // Пример использования событий
    // document.querySelector('.prop-colors').addEventListener('colorChange', function(e) {
    //     console.log('Выбран цвет:', e.detail);
    //     // Здесь можно добавить логику обновления цены, изображения и т.д.
    // });

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

  function initSizeSliders() {
    const sliders = [
      { type: 'height', inputId: 'size_edit_height_input', sliderId: 'size_edit_height_slider' },
      { type: 'width', inputId: 'size_edit_width_input', sliderId: 'size_edit_width_slider' },
      { type: 'depth', inputId: 'size_edit_depth_input', sliderId: 'size_edit_depth_slider' }
    ];

    sliders.forEach(sliderConfig => {
      const input = document.getElementById(sliderConfig.inputId);
      const sliderContainer = document.getElementById(sliderConfig.sliderId);
      
      if (!input || !sliderContainer) return;
      
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
      const updateInput = () => {
        input.value = slider.value;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      };
      
      slider.addEventListener('input', updateInput);
      slider.addEventListener('change', updateInput);
      
      // Обрабатываем изменения в input
      input.addEventListener('change', function() {
        let val = parseInt(this.value) || min;
        val = Math.max(min, Math.min(max, val));
        slider.value = this.value = val;
      });
      
      // Разблокируем input
      input.readOnly = false;
    });
  }

  function initUslugiRaspil() {
    // Ищем все контейнеры услуг
    const uslugiContainers = document.querySelectorAll('.prop-uslugi');
    console.log('uslugiContainers', uslugiContainers);
    
    if (uslugiContainers.length === 0) {
        console.log('Контейнеры услуг не найдены');
        return;
    }

    uslugiContainers.forEach(container => {
        console.log('Обрабатываем контейнер:', container);
        
        // Находим чекбокс распила
        const raspilCheckbox = container.querySelector('input[data-form-action="uslugi-form-raspil"]');
        if (!raspilCheckbox) {
            console.log('Чекбокс распила не найден');
            return;
        }

        // Находим форму распила
        const form = document.getElementById(raspilCheckbox.dataset.formAction);
        if (!form) {
            console.log('Форма распила не найдена');
            return;
        }

        console.log('Инициализируем функционал распила для:', form.id);

        // Получаем все необходимые элементы
        const hiddenInput = form.querySelector('#USLUGIraspil');
        const partsContainer = form.querySelector('.part-raspil');
        const addButton = form.querySelector('.add');
        const deleteButton = form.querySelector('.delete');
        const slider = form.querySelector('#slider');

        if (!hiddenInput || !partsContainer || !addButton || !deleteButton) {
            console.log('Не все необходимые элементы найдены');
            return;
        }

        // Получаем параметры из слайдера
        const MAX_PARTS = 20; // Максимальное количество частей
        const min = parseInt(slider?.dataset.min) || 10;
        const max = parseInt(slider?.dataset.max) || 4090;
        const totalWidth = parseInt(slider?.dataset.width) || 4100;
        const step = parseInt(slider?.dataset.step) || 10;
        const sepMax = parseInt(slider?.dataset.sepmax) || 20; // Погрешность/допуск
        const propil = parseInt(slider?.dataset.propil) || 5; // Ширина пропила

        console.log('Параметры распила:', { min, max, totalWidth, step, sepMax, propil });

        // Переменная для отслеживания, была ли нажата кнопка добавления
        let isAddingPart = false;

        // Функция для равномерного распределения значений
        function redistributeValues() {
            const inputs = partsContainer.querySelectorAll('.path-width');
            const partsCount = inputs.length;
            
            if (partsCount === 0) return;

            // Рассчитываем доступную ширину (общая ширина минус пропилы)
            const availableWidth = totalWidth - ((partsCount - 1) * propil);
            
            // Рассчитываем равное значение для каждой части
            const equalValue = Math.floor(availableWidth / partsCount);
            
            // Нормализуем значение до шага
            const normalizedValue = Math.round(equalValue / step) * step;
            
            // Устанавливаем значения для всех input'ов
            inputs.forEach(input => {
                input.value = normalizedValue;
            });
            
            updateHiddenInput();
        }

        // Функция для обновления состояния кнопок
        function updateButtonsState() {
            const parts = partsContainer.querySelectorAll('.path-container');
            deleteButton.disabled = parts.length <= 2;
            addButton.disabled = parts.length >= MAX_PARTS;
        }

        // Функция для расчета общей суммы частей
        function calculateTotal() {
            const inputs = partsContainer.querySelectorAll('.path-width');
            let total = 0;
            
            inputs.forEach(input => {
                const value = parseInt(input.value);
                if (!isNaN(value)) {
                    total += value;
                }
            });
            
            return total;
        }

        // Функция для расчета общей суммы с учетом пропилов
        function calculateTotalWithPropil() {
            const inputs = partsContainer.querySelectorAll('.path-width');
            let total = 0;
            const partsCount = inputs.length;
            
            inputs.forEach(input => {
                const value = parseInt(input.value);
                if (!isNaN(value)) {
                    total += value;
                }
            });
            
            // Добавляем ширину пропилов (между частями)
            const propilWidth = (partsCount - 1) * propil;
            return total + propilWidth;
        }

        // Функция для проверки допустимости общей суммы
        function isTotalValid() {
            const totalWithPropil = calculateTotalWithPropil();
            const allowedMax = totalWidth + sepMax; // Учитываем погрешность
            
            return totalWithPropil <= allowedMax;
        }

        // Функция для показа предупреждения
        function showWarning(message) {
            // Удаляем предыдущее предупреждение
            const existingWarning = form.querySelector('.total-warning');
            if (existingWarning) {
                existingWarning.remove();
            }
            
            if (message) {
                const warning = document.createElement('div');
                warning.className = 'total-warning';
                warning.style.color = 'red';
                warning.style.marginTop = '10px';
                warning.style.fontSize = '14px';
                warning.textContent = message;
                form.appendChild(warning);
            }
        }

        // Функция для валидации input
        function validateInput(input) {
            const value = parseInt(input.value);
            
            if (isNaN(value)) {
                input.value = '';
                return;
            }

            if (value < min) {
                input.value = min;
            } else if (value > max) {
                input.value = max;
            }
        }

        // Функция для нормализации input
        function normalizeInput(input) {
            const value = parseInt(input.value);
            
            if (!isNaN(value)) {
                const normalizedValue = Math.round(value / step) * step;
                input.value = normalizedValue;
            }
        }

        // Функция для обновления скрытого поля
        function updateHiddenInput() {
            if (!raspilCheckbox.checked) return;

            const values = [];
            const inputs = partsContainer.querySelectorAll('.path-width');
            
            inputs.forEach(input => {
                if (input.value) {
                    values.push(input.value);
                }
            });

            hiddenInput.value = values.join('*');
            console.log('Скрытое поле обновлено:', hiddenInput.value);
            
            // Проверяем общую сумму
            const totalWithPropil = calculateTotalWithPropil();
            const allowedMax = totalWidth + sepMax;
            
            if (totalWithPropil > allowedMax) {
                showWarning(`Внимание: Общая сумма с учетом пропилов (${totalWithPropil}mm) превышает допустимую (${allowedMax}mm)`);
            } else {
                showWarning(null);
            }
            
            // Можно вызвать здесь пересчет цены
            updatePrice();
        }

        // Функция для обновления цены (заглушка)
        function updatePrice() {
            console.log('Цена обновлена для распилов:', hiddenInput.value);
            // Добавьте здесь логику пересчета цены
        }

        // Функция для добавления части распила
        function addPart(e) {
            if (e) e.preventDefault();
            
            const parts = partsContainer.querySelectorAll('.path-container');
            if (parts.length >= MAX_PARTS) {
                console.log('Достигнуто максимальное количество частей:', MAX_PARTS);
                return;
            }
            
            isAddingPart = true;
            
            const lastPart = parts[parts.length - 1];
            const newId = parts.length;
            
            const newPart = lastPart.cloneNode(true);
            newPart.dataset.id = newId;
            
            const numberSpan = newPart.querySelector('.path-number');
            const input = newPart.querySelector('.path-width');
            
            numberSpan.textContent = newId + 1;
            input.dataset.id = newId;
            input.value = min; // Устанавливаем минимальное значение по умолчанию
            
            partsContainer.appendChild(newPart);
            updateButtonsState();
            
            // Перераспределяем значения равномерно
            redistributeValues();
            
            // Сбрасываем флаг через небольшой промежуток времени
            setTimeout(() => {
                isAddingPart = false;
            }, 100);
        }

        // Функция для удаления части распила
        function deletePart(e) {
            if (e) e.preventDefault();
            
            const parts = partsContainer.querySelectorAll('.path-container');
            if (parts.length > 2) {
                parts[parts.length - 1].remove();
                updateButtonsState();
                
                // Перераспределяем значения после удаления
                redistributeValues();
            }
        }

        // Функция для переключения видимости формы
        function toggleForm() {
            const isChecked = raspilCheckbox.checked;
            form.style.display = isChecked ? 'block' : 'none';
            hiddenInput.disabled = !isChecked;
            
            if (isChecked) {
                updateHiddenInput();
            } else {
                showWarning(null);
            }
        }

        // Обработчик нажатия клавиш для отмены добавления по Enter
        function handleKeyPress(e) {
            if (e.key === 'Enter' && isAddingPart) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Добавление отменено по нажатию Enter');
                isAddingPart = false;
                return false;
            }
        }

        // Навешиваем обработчики событий
        raspilCheckbox.addEventListener('change', toggleForm);
        addButton.addEventListener('click', addPart);
        deleteButton.addEventListener('click', deletePart);

        partsContainer.addEventListener('input', (e) => {
            if (e.target.classList.contains('path-width')) {
                validateInput(e.target);
                updateHiddenInput();
            }
        });

        partsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('path-width')) {
                normalizeInput(e.target);
                updateHiddenInput();
            }
        });

        // Добавляем обработчик нажатия клавиш
        document.addEventListener('keydown', handleKeyPress, true);

        // Инициализируем начальное состояние
        updateButtonsState();
        toggleForm();

        console.log('Функционал распила успешно инициализирован для:', form.id);
    });
  }

  function initColorSelector(containerSelector = '.prop-colors') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const labels = container.querySelectorAll('label');
    const inputs = container.querySelectorAll('input[type="radio"]');
    const popups = container.querySelectorAll('.popup');

    // Функция для скрытия всех попапов
    function hideAllPopups() {
        popups.forEach(popup => {
            popup.style.display = 'none';
        });
    }

    // Функция для снятия выделения со всех label
    function deselectAllLabels() {
        labels.forEach(label => {
            label.classList.remove('selected');
        });
    }

    // Обработчик для наведения на label
    function handleMouseEnter() {
        hideAllPopups();
        const popup = this.querySelector('.popup');
        if (popup) {
            popup.style.display = 'block';
        }
    }

    // Обработчик для ухода мыши
    function handleMouseLeave() {
        hideAllPopups();
    }

    // Обработчик клика по label
    function handleClick() {
        deselectAllLabels();
        this.classList.add('selected');
        const input = this.querySelector('input');
        if (input) {
            input.checked = true;
        }
        hideAllPopups();
        
        // Генерируем кастомное событие изменения цвета
        const changeEvent = new CustomEvent('colorChange', {
            detail: {
                value: input.value,
                colorName: this.querySelector('.value-title')?.textContent.trim(),
                colorImage: this.querySelector('.popup img')?.src
            }
        });
        container.dispatchEvent(changeEvent);
    }

    // Добавляем обработчики событий
    labels.forEach(label => {
        label.addEventListener('mouseenter', handleMouseEnter);
        label.addEventListener('mouseleave', handleMouseLeave);
        label.addEventListener('click', handleClick);
    });

    // Инициализация начального состояния
    hideAllPopups();
    
    // Возвращаем объект с методами для управления
    return {
        getSelectedColor: function() {
            const selectedInput = container.querySelector('input:checked');
            if (!selectedInput) return null;
            
            const selectedLabel = selectedInput.closest('label');
            return {
                value: selectedInput.value,
                colorName: selectedLabel.querySelector('.value-title')?.textContent.trim(),
                colorImage: selectedLabel.querySelector('.popup img')?.src
            };
        },
        
        setSelectedColor: function(value) {
            const input = container.querySelector(`input[value="${value}"]`);
            if (input) {
                input.checked = true;
                deselectAllLabels();
                const label = input.closest('label');
                if (label) {
                    label.classList.add('selected');
                }
            }
        },
        
        destroy: function() {
            labels.forEach(label => {
                label.removeEventListener('mouseenter', handleMouseEnter);
                label.removeEventListener('mouseleave', handleMouseLeave);
                label.removeEventListener('click', handleClick);
            });
        }
    };
  }

  function initUslugiRaspilDlinnomer() {
    // Ищем все контейнеры услуг
    const uslugiContainers = document.querySelectorAll('.prop-uslugi');
    console.log('uslugiContainers для длинномера', uslugiContainers);
    
    if (uslugiContainers.length === 0) {
        console.log('Контейнеры услуг не найдены');
        return;
    }

    uslugiContainers.forEach(container => {
        console.log('Обрабатываем контейнер длинномера:', container);
        
        // Находим чекбокс распила длинномера
        const raspilCheckbox = container.querySelector('input[value="1920165"]');
        if (!raspilCheckbox) {
            console.log('Чекбокс распила длинномера не найден');
            return;
        }

        // Находим форму распила
        const formAction = raspilCheckbox.dataset.formAction;
        const form = document.getElementById(formAction);
        if (!form) {
            console.log('Форма распила длинномера не найдена');
            return;
        }

        console.log('Инициализируем функционал распила длинномера для:', form.id);

        // Получаем все необходимые элементы
        const hiddenInput = form.querySelector('#USLUGIraspil');
        const partsContainer = form.querySelector('.part-raspil');
        const slider = form.querySelector('#slider');
        const separateTable = document.getElementById('separate_table');
        const oneTable = document.getElementById('one_table'); // Основной блок который нужно скрывать

        if (!hiddenInput || !partsContainer || !slider || !separateTable) {
            console.log('Не все необходимые элементы найдены для длинномера');
            return;
        }

        // Получаем параметры из слайдера
        const min = parseInt(slider?.dataset.min) || 10;
        const max = parseInt(slider?.dataset.max) || 3980;
        const totalWidth = parseInt(slider?.dataset.width) || 3990;
        const step = parseInt(slider?.dataset.step) || 10;
        const propil = parseInt(slider?.dataset.propil) || 0;

        console.log('Параметры распила длинномера:', { min, max, totalWidth, step, propil });

        // Создаем range-слайдер
        function createRangeSlider() {
            // Проверяем, есть ли уже кастомный слайдер
            let rangeSlider = form.querySelector('.custom-range-slider');
            
            if (!rangeSlider) {
                rangeSlider = document.createElement('input');
                rangeSlider.type = 'range';
                rangeSlider.className = 'custom-range-slider';
                rangeSlider.min = min;
                rangeSlider.max = max;
                rangeSlider.step = step;
                rangeSlider.value = parseInt(partsContainer.querySelector('.path-width').value) || min;
                
                // Добавляем слайдер после контейнера с частями
                partsContainer.parentNode.insertBefore(rangeSlider, partsContainer.nextSibling);
                
                console.log('Кастомный range-слайдер создан');
            }
            
            return rangeSlider;
        }

        // Функция для обновления визуального отображения в блоках
        function updateVisualBlocks() {
            const inputs = partsContainer.querySelectorAll('.path-width');
            const separateItems = separateTable.querySelectorAll('.separate_item');
            
            inputs.forEach((input, index) => {
                const value = input.value;
                const separateItem = separateItems[index];
                
                if (separateItem) {
                    // Обновляем ширину в блоке
                    const widthSpan = separateItem.querySelector('.onesize-width');
                    if (widthSpan) {
                        widthSpan.textContent = value;
                    }
                    
                    // Обновляем ширину визуального блока
                    const tableWrap = separateItem.querySelector('.table_wrap');
                    if (tableWrap && totalWidth > 0) {
                        const percentage = (value / totalWidth) * 100;
                        tableWrap.style.width = percentage + '%';
                    }
                    
                    // Показываем/скрываем блок в зависимости от значения
                    if (value > 0) {
                        separateItem.style.display = 'block';
                    } else {
                        separateItem.style.display = 'none';
                    }
                }
            });
        }

        // Функция для синхронизации значений между двумя частями
        function synchronizeParts() {
            const inputs = partsContainer.querySelectorAll('.path-width');
            if (inputs.length !== 2) {
                console.log('Ожидается ровно 2 части для длинномера');
                return;
            }

            const input1 = inputs[0];
            const input2 = inputs[1];
            const rangeSlider = createRangeSlider();
            
            // Обновляем значения при изменении range-слайдера
            rangeSlider.addEventListener('input', function() {
                const sliderValue = parseInt(this.value);
                input1.value = sliderValue;
                
                // Автоматически рассчитываем второе значение
                const value2 = totalWidth - sliderValue - propil;
                input2.value = value2;
                
                updateHiddenInput();
                updateVisualBlocks();
            });
            
            // При изменении первого input'а, обновляем слайдер
            input1.addEventListener('input', function() {
                const value1 = parseInt(this.value) || 0;
                const value2 = totalWidth - value1 - propil;
                
                // Проверяем границы
                if (value2 < min) {
                    input2.value = min;
                    input1.value = totalWidth - min - propil;
                    rangeSlider.value = totalWidth - min - propil;
                } else if (value2 > max) {
                    input2.value = max;
                    input1.value = totalWidth - max - propil;
                    rangeSlider.value = totalWidth - max - propil;
                } else {
                    input2.value = value2;
                    rangeSlider.value = value1;
                }
                
                updateHiddenInput();
                updateVisualBlocks();
            });

            // При изменении второго input'а
            input2.addEventListener('input', function() {
                const value2 = parseInt(this.value) || 0;
                const value1 = totalWidth - value2 - propil;
                
                // Проверяем границы
                if (value1 < min) {
                    input1.value = min;
                    input2.value = totalWidth - min - propil;
                    rangeSlider.value = min;
                } else if (value1 > max) {
                    input1.value = max;
                    input2.value = totalWidth - max - propil;
                    rangeSlider.value = max;
                } else {
                    input1.value = value1;
                    rangeSlider.value = value1;
                }
                
                updateHiddenInput();
                updateVisualBlocks();
            });

            // Нормализация при изменении
            inputs.forEach(input => {
                input.addEventListener('change', function() {
                    const value = parseInt(this.value);
                    if (!isNaN(value)) {
                        const normalizedValue = Math.round(value / step) * step;
                        this.value = normalizedValue;
                        
                        // После нормализации одного, пересчитываем второй
                        if (this === input1) {
                            const newValue2 = totalWidth - normalizedValue - propil;
                            input2.value = Math.round(newValue2 / step) * step;
                            rangeSlider.value = normalizedValue;
                        } else {
                            const newValue1 = totalWidth - normalizedValue - propil;
                            input1.value = Math.round(newValue1 / step) * step;
                            rangeSlider.value = newValue1;
                        }
                        
                        updateHiddenInput();
                        updateVisualBlocks();
                    }
                });
            });
        }

        // Функция для инициализации существующего слайдера (если он активен)
        function initExistingSlider() {
            const sliderHandles = slider.querySelectorAll('.ui-slider-handle');
            if (sliderHandles.length > 0) {
                console.log('Существующий слайдер обнаружен, настраиваем взаимодействие');
                
                // Обновляем слайдер при изменении input'ов
                const inputs = partsContainer.querySelectorAll('.path-width');
                inputs.forEach((input, index) => {
                    input.addEventListener('input', function() {
                        const value = parseInt(this.value) || 0;
                        const percentage = (value / totalWidth) * 100;
                        
                        if (sliderHandles[index]) {
                            sliderHandles[index].style.left = percentage + '%';
                            sliderHandles[index].dataset.value = value;
                        }
                    });
                });
            }
        }

        // Функция для валидации input
        function validateInput(input) {
            const value = parseInt(input.value);
            
            if (isNaN(value)) {
                input.value = min;
                return;
            }

            if (value < min) {
                input.value = min;
            } else if (value > max) {
                input.value = max;
            }
        }

        // Функция для обновления скрытого поля
        function updateHiddenInput() {
            if (!raspilCheckbox.checked) return;

            const values = [];
            const inputs = partsContainer.querySelectorAll('.path-width');
            
            inputs.forEach(input => {
                if (input.value) {
                    values.push(input.value);
                }
            });

            hiddenInput.value = values.join('*');
            console.log('Скрытое поле длинномера обновлено:', hiddenInput.value);
        }

        // Функция для переключения видимости формы и блоков
        function toggleForm() {
            const isChecked = raspilCheckbox.checked;
            
            // Управление видимостью формы распила
            form.style.display = isChecked ? 'block' : 'none';
            
            // Управление видимостью таблицы разделенных частей
            separateTable.style.display = isChecked ? 'block' : 'none';
            
            // Скрываем/показываем основной блок one_table
            if (oneTable) {
                oneTable.style.display = isChecked ? 'none' : 'block';
            }
            
            hiddenInput.disabled = !isChecked;
            
            if (isChecked) {
                updateHiddenInput();
                updateVisualBlocks();
            }
        }

        // Инициализация начальных значений
        function initializeValues() {
            const inputs = partsContainer.querySelectorAll('.path-width');
            if (inputs.length === 2) {
                // Устанавливаем равные значения по умолчанию
                const equalValue = Math.floor((totalWidth - propil) / 2);
                const normalizedValue = Math.round(equalValue / step) * step;
                
                inputs[0].value = normalizedValue;
                inputs[1].value = normalizedValue;
                
                // Устанавливаем значение range-слайдера
                const rangeSlider = form.querySelector('.custom-range-slider');
                if (rangeSlider) {
                    rangeSlider.value = normalizedValue;
                }
                
                updateHiddenInput();
                updateVisualBlocks();
            }
        }

        // Навешиваем обработчики событий
        raspilCheckbox.addEventListener('change', toggleForm);

        // Инициализируем
        synchronizeParts();
        initializeValues();
        initExistingSlider();
        toggleForm(); // Вызываем сразу для установки начального состояния

        console.log('Функционал распила длинномера успешно инициализирован для:', form.id);
    });
  }

  function initSizeEditOptionalVisibility() {
      // Находим все чекбоксы нестандартных размеров
      const sizeEditCheckboxes = document.querySelectorAll('input[name="sizeeditopt"]');
      console.log('Найдено чекбоксов для управления видимостью:', sizeEditCheckboxes.length);
      
      if (sizeEditCheckboxes.length === 0) {
          console.log('Чекбоксы нестандартных размеров не найдены');
          return;
      }

      // Обрабатываем каждый чекбокс
      sizeEditCheckboxes.forEach((checkbox, index) => {
          console.log(`Обрабатываем чекбокс #${index + 1}`);
          
          // Находим соответствующий контейнер с опциями размеров
          // Ищем следующий элемент с классом prop-wrap-sizeoptional после родительского .prop
          const propElement = checkbox.closest('.prop');
          if (!propElement) {
              console.log('Родительский .prop элемент не найден для чекбокса', index);
              return;
          }
          
          let nextElement = propElement.nextElementSibling;
          let propWrap = null;
          
          // Ищем следующий элемент с нужным классом
          while (nextElement) {
              if (nextElement.classList.contains('prop-wrap-sizeoptional')) {
                  propWrap = nextElement;
                  break;
              }
              nextElement = nextElement.nextElementSibling;
          }

          if (!propWrap) {
              console.log('Контейнер prop-wrap-sizeoptional не найден для чекбокса', index);
              return;
          }

          // Функция для переключения видимости
          function toggleVisibility() {
              const isChecked = checkbox.checked;
              propWrap.style.display = isChecked ? 'block' : 'none';
              
              // Также управляем классом selected у родительского div
              const sizeEditOptDiv = checkbox.closest('.sizeeditopt');
              if (sizeEditOptDiv) {
                  if (isChecked) {
                      sizeEditOptDiv.classList.add('selected');
                  } else {
                      sizeEditOptDiv.classList.remove('selected');
                  }
              }
              
              console.log(`Блок #${index + 1} ${isChecked ? 'показан' : 'скрыт'}`);
          }

          // Навешиваем обработчик события
          checkbox.addEventListener('change', toggleVisibility);
          
          // Инициализируем начальное состояние
          toggleVisibility();

          console.log(`Управление видимостью для блока #${index + 1} настроено`);
      });
  }



  // function initUslugiRaspilNew() {
  //     // Ищем все контейнеры услуг
  //     const uslugiContainers = document.querySelectorAll('.prop-uslugi');
  //     console.log('uslugiContainers для нового распила', uslugiContainers);
      
  //     if (uslugiContainers.length === 0) {
  //         console.log('Контейнеры услуг не найдены');
  //         return;
  //     }

  //     uslugiContainers.forEach(container => {
  //         console.log('Обрабатываем контейнер нового распила:', container);
          
  //         // Находим чекбокс распила (новый value)
  //         const raspilCheckbox = container.querySelector('input[value="98683"]');
  //         if (!raspilCheckbox) {
  //             console.log('Чекбокс распила не найден');
  //             return;
  //         }

  //         // Находим форму распила
  //         const formAction = raspilCheckbox.dataset.formAction;
  //         const form = document.getElementById(formAction);
  //         if (!form) {
  //             console.log('Форма распила не найдена');
  //             return;
  //         }

  //         console.log('Инициализируем функционал нового распила для:', form.id);

  //         // Получаем все необходимые элементы
  //         const hiddenInput = form.querySelector('#USLUGIraspil');
  //         const partsContainer = form.querySelector('.part-raspil');
  //         const slider = form.querySelector('#slider');
  //         const separateTable = document.getElementById('separate_table');
  //         const oneTable = document.getElementById('one_table');
  //         const addButton = form.querySelector('.add');
  //         const deleteButton = form.querySelector('.delete');

  //         if (!hiddenInput || !partsContainer || !slider || !separateTable || !oneTable || !addButton || !deleteButton) {
  //             console.log('Не все необходимые элементы найдены для нового распила');
  //             return;
  //         }

  //         // Получаем параметры из слайдера
  //         const min = parseInt(slider?.dataset.min) || 10;
  //         const max = parseInt(slider?.dataset.max) || 2990;
  //         const totalWidth = parseInt(slider?.dataset.width) || 3000;
  //         const step = parseInt(slider?.dataset.step) || 10;
  //         const propil = parseInt(slider?.dataset.propil) || 0;
  //         const maxParts = parseInt(slider?.dataset.sepmax) || 4;

  //         console.log('Параметры нового распила:', { min, max, totalWidth, step, propil, maxParts });

  //         // Переменные для управления частями
  //         let currentParts = 2; // Начинаем с 2 частей

  //         // Функция для создания визуального слайдера
  //         function createVisualSlider() {
  //             // Удаляем существующий кастомный слайдер, если есть
  //             const existingSlider = form.querySelector('.custom-range-slider-container');
  //             if (existingSlider) {
  //                 existingSlider.remove();
  //             }

  //             // Создаем контейнер для слайдера
  //             const sliderContainer = document.createElement('div');
  //             sliderContainer.className = 'custom-range-slider-container';
  //             sliderContainer.style.margin = '15px 0';
  //             sliderContainer.style.padding = '0 10px';

  //             // Создаем сам слайдер
  //             const rangeSlider = document.createElement('input');
  //             rangeSlider.type = 'range';
  //             rangeSlider.className = 'custom-range-slider';
  //             rangeSlider.min = min;
  //             rangeSlider.max = max;
  //             rangeSlider.step = step;
  //             rangeSlider.style.width = '100%';
              
  //             // Устанавливаем начальное значение для 2 частей
  //             if (currentParts === 2) {
  //                 const firstInput = partsContainer.querySelector('.path-width');
  //                 rangeSlider.value = firstInput ? parseInt(firstInput.value) || min : min;
  //             }
              
  //             // Добавляем подписи для слайдера
  //             const labelsContainer = document.createElement('div');
  //             labelsContainer.className = 'slider-labels';
  //             labelsContainer.style.display = 'flex';
  //             labelsContainer.style.justifyContent = 'space-between';
  //             labelsContainer.style.marginTop = '5px';
  //             labelsContainer.style.fontSize = '12px';
              
  //             const minLabel = document.createElement('span');
  //             minLabel.textContent = min + 'mm';
              
  //             const maxLabel = document.createElement('span');
  //             maxLabel.textContent = max + 'mm';
              
  //             labelsContainer.appendChild(minLabel);
  //             labelsContainer.appendChild(maxLabel);
              
  //             sliderContainer.appendChild(rangeSlider);
  //             sliderContainer.appendChild(labelsContainer);
              
  //             // Добавляем слайдер после контейнера с частями
  //             partsContainer.parentNode.insertBefore(sliderContainer, partsContainer.nextSibling);
              
  //             console.log('Визуальный слайдер создан');
  //             return rangeSlider;
  //         }

  //         // Функция для обновления визуального отображения в блоках
  //         function updateVisualBlocks() {
  //             const inputs = partsContainer.querySelectorAll('.path-width');
  //             const separateItems = separateTable.querySelectorAll('.separate_item');
              
  //             inputs.forEach((input, index) => {
  //                 const value = input.value;
  //                 const separateItem = separateItems[index];
                  
  //                 if (separateItem) {
  //                     // Обновляем ширину в блоке
  //                     const widthSpan = separateItem.querySelector('.onesize-width');
  //                     if (widthSpan) {
  //                         widthSpan.textContent = value;
  //                     }
                      
  //                     // Обновляем ширину визуального блока
  //                     const tableWrap = separateItem.querySelector('.table_wrap');
  //                     if (tableWrap && totalWidth > 0) {
  //                         const percentage = (value / totalWidth) * 100;
  //                         tableWrap.style.width = percentage + '%';
  //                     }
                      
  //                     // Показываем/скрываем блок в зависимости от значения
  //                     if (value > 0 && index < currentParts) {
  //                         separateItem.style.display = 'block';
  //                     } else {
  //                         separateItem.style.display = 'none';
  //                     }
  //                 }
  //             });
  //         }

  //         // Функция для добавления нового распила
  //         function addNewCut(event) {
  //             // ПРЕДОТВРАЩАЕМ СТАНДАРТНОЕ ПОВЕДЕНИЕ КНОПКИ
  //             event.preventDefault();
  //             event.stopPropagation();
              
  //             if (currentParts >= maxParts) {
  //                 alert(`Максимальное количество распилов: ${maxParts}`);
  //                 return;
  //             }

  //             currentParts++;
              
  //             // Создаем новую часть в форме
  //             const newPart = document.createElement('div');
  //             newPart.className = 'path-container';
  //             newPart.dataset.id = currentParts - 1;
              
  //             newPart.innerHTML = `
  //                 <div>Часть <span class="path-number">${currentParts}</span></div>
  //                 <input autocomplete="off" step="${step}" data-id="${currentParts - 1}" value="${Math.floor(totalWidth / currentParts)}" class="path-width">
  //                 <div>mm.</div>
  //             `;
              
  //             partsContainer.appendChild(newPart);
              
  //             // Добавляем обработчики для нового input'а
  //             const newInput = newPart.querySelector('.path-width');
  //             newInput.addEventListener('input', function() {
  //                 const value = parseInt(this.value) || 0;
  //                 if (value < min) {
  //                     this.value = min;
  //                 } else if (value > max) {
  //                     this.value = max;
  //                 }
  //                 updateHiddenInput();
  //                 updateVisualBlocks();
  //             });
              
  //             newInput.addEventListener('change', function() {
  //                 const value = parseInt(this.value);
  //                 if (!isNaN(value)) {
  //                     const normalizedValue = Math.round(value / step) * step;
  //                     this.value = normalizedValue;
  //                     updateHiddenInput();
  //                     updateVisualBlocks();
  //                 }
  //             });
              
  //             // Показываем блок удаления
  //             deleteButton.disabled = false;
              
  //             // Если достигли максимума, скрываем кнопку добавления
  //             if (currentParts >= maxParts) {
  //                 addButton.disabled = true;
  //             }
              
  //             // Перераспределяем значения
  //             redistributeValues();
  //             updateHiddenInput();
  //             updateVisualBlocks();
              
  //             console.log(`Добавлена часть ${currentParts}`);
  //         }

  //         // Функция для удаления распила
  //         function deleteCut(event) {
  //             // ПРЕДОТВРАЩАЕМ СТАНДАРТНОЕ ПОВЕДЕНИЕ КНОПКИ
  //             event.preventDefault();
  //             event.stopPropagation();
              
  //             if (currentParts <= 2) {
  //                 alert('Минимальное количество распилов: 2');
  //                 return;
  //             }

  //             // Удаляем последнюю часть
  //             const lastPart = partsContainer.querySelector(`.path-container[data-id="${currentParts - 1}"]`);
  //             if (lastPart) {
  //                 lastPart.remove();
  //             }
              
  //             currentParts--;
              
  //             // Скрываем блок удаления если минимальное количество
  //             if (currentParts <= 2) {
  //                 deleteButton.disabled = true;
  //             }
              
  //             // Показываем кнопку добавления
  //             addButton.disabled = false;
              
  //             // Перераспределяем значения
  //             redistributeValues();
  //             updateHiddenInput();
  //             updateVisualBlocks();
              
  //             console.log(`Удалена часть, осталось: ${currentParts}`);
  //         }

  //         // Функция для перераспределения значений между частями
  //         function redistributeValues() {
  //             const inputs = partsContainer.querySelectorAll('.path-width');
  //             const equalValue = Math.floor((totalWidth - (propil * (currentParts - 1))) / currentParts);
  //             const normalizedValue = Math.round(equalValue / step) * step;
              
  //             inputs.forEach((input, index) => {
  //                 if (index < currentParts) {
  //                     input.value = normalizedValue;
  //                 }
  //             });
  //         }

  //         // Функция для синхронизации значений между частями
  //         function synchronizeParts() {
  //             const rangeSlider = createVisualSlider();
  //             const inputs = partsContainer.querySelectorAll('.path-width');
              
  //             // Обновляем значения при изменении range-слайдера
  //             rangeSlider.addEventListener('input', function() {
  //                 const sliderValue = parseInt(this.value);
                  
  //                 // Для двух частей
  //                 if (currentParts === 2 && inputs.length >= 2) {
  //                     inputs[0].value = sliderValue;
  //                     const secondValue = totalWidth - sliderValue - propil;
  //                     inputs[1].value = Math.max(min, Math.min(max, secondValue));
  //                 }
                  
  //                 updateHiddenInput();
  //                 updateVisualBlocks();
  //             });
              
  //             // Обработчики для каждого input'а
  //             inputs.forEach(input => {
  //                 input.addEventListener('input', function() {
  //                     const value = parseInt(this.value) || 0;
                      
  //                     // Проверяем границы
  //                     if (value < min) {
  //                         this.value = min;
  //                     } else if (value > max) {
  //                         this.value = max;
  //                     }
                      
  //                     // Для двух частей синхронизируем вторую часть
  //                     if (currentParts === 2) {
  //                         const inputs = partsContainer.querySelectorAll('.path-width');
  //                         if (inputs.length >= 2) {
  //                             if (this === inputs[0]) {
  //                                 const secondValue = totalWidth - value - propil;
  //                                 inputs[1].value = Math.max(min, Math.min(max, secondValue));
  //                                 rangeSlider.value = value;
  //                             } else if (this === inputs[1]) {
  //                                 const firstValue = totalWidth - value - propil;
  //                                 inputs[0].value = Math.max(min, Math.min(max, firstValue));
  //                                 rangeSlider.value = firstValue;
  //                             }
  //                         }
  //                     }
                      
  //                     updateHiddenInput();
  //                     updateVisualBlocks();
  //                 });
                  
  //                 input.addEventListener('change', function() {
  //                     const value = parseInt(this.value);
  //                     if (!isNaN(value)) {
  //                         const normalizedValue = Math.round(value / step) * step;
  //                         this.value = normalizedValue;
                          
  //                         updateHiddenInput();
  //                         updateVisualBlocks();
  //                     }
  //                 });
  //             });
  //         }

  //         // Функция для обновления скрытого поля
  //         function updateHiddenInput() {
  //             if (!raspilCheckbox.checked) return;

  //             const values = [];
  //             const inputs = partsContainer.querySelectorAll('.path-width');
              
  //             inputs.forEach((input, index) => {
  //                 if (index < currentParts && input.value) {
  //                     values.push(input.value);
  //                 }
  //             });

  //             hiddenInput.value = values.join('*');
  //             console.log('Скрытое поле обновлено:', hiddenInput.value);
  //         }

  //         // Функция для переключения видимости формы и блоков
  //         function toggleForm() {
  //             const isChecked = raspilCheckbox.checked;
              
  //             // Управление видимостью формы распила
  //             form.style.display = isChecked ? 'block' : 'none';
              
  //             // Управление видимостью таблицы разделенных частей
  //             separateTable.style.display = isChecked ? 'block' : 'none';
              
  //             // Скрываем/показываем основной блок one_table
  //             oneTable.style.display = isChecked ? 'none' : 'block';
              
  //             hiddenInput.disabled = !isChecked;
              
  //             if (isChecked) {
  //                 updateHiddenInput();
  //                 updateVisualBlocks();
  //             }
  //         }

  //         // Функция для инициализации начальных значений
  //         function initializeValues() {
  //             const inputs = partsContainer.querySelectorAll('.path-width');
              
  //             // Устанавливаем равные значения по умолчанию
  //             const equalValue = Math.floor((totalWidth - propil) / currentParts);
  //             const normalizedValue = Math.round(equalValue / step) * step;
              
  //             inputs.forEach((input, index) => {
  //                 if (index < currentParts) {
  //                     input.value = normalizedValue;
  //                 }
  //             });
              
  //             updateHiddenInput();
  //             updateVisualBlocks();
  //         }

  //         // Навешиваем обработчики событий
  //         raspilCheckbox.addEventListener('change', toggleForm);
          
  //         // ИСПРАВЛЕНИЕ: Добавляем обработчики с предотвращением стандартного поведения
  //         addButton.addEventListener('click', addNewCut);
  //         deleteButton.addEventListener('click', deleteCut);
          
  //         // Также меняем тип кнопок на button чтобы они не отправляли форму
  //         addButton.type = 'button';
  //         deleteButton.type = 'button';

  //         // Инициализируем
  //         synchronizeParts();
  //         initializeValues();
  //         toggleForm(); // Вызываем сразу для установки начального состояния

  //         console.log('Функционал нового распила успешно инициализирован для:', form.id);
  //     });
  // }


  function initUslugiRaspilNew() {
    // Ищем все контейнеры услуг
    const uslugiContainers = document.querySelectorAll('.prop-uslugi');
    console.log('uslugiContainers для нового распила', uslugiContainers);
    
    if (uslugiContainers.length === 0) {
        console.log('Контейнеры услуг не найдены');
        return;
    }

    uslugiContainers.forEach(container => {
        console.log('Обрабатываем контейнер нового распила:', container);
        
        // Находим чекбокс распила (новый value)
        const raspilCheckbox = container.querySelector('input[value="98683"]');
        if (!raspilCheckbox) {
            console.log('Чекбокс распила не найден');
            return;
        }

        // Находим форму распила
        const formAction = raspilCheckbox.dataset.formAction;
        const form = document.getElementById(formAction);
        if (!form) {
            console.log('Форма распила не найдена');
            return;
        }

        console.log('Инициализируем функционал нового распила для:', form.id);

        // Получаем все необходимые элементы
        const hiddenInput = form.querySelector('#USLUGIraspil');
        const partsContainer = form.querySelector('.part-raspil');
        const slider = form.querySelector('#slider');
        const separateTable = document.getElementById('separate_table');
        const oneTable = document.getElementById('one_table');
        const addButton = form.querySelector('.add');
        const deleteButton = form.querySelector('.delete');

        if (!hiddenInput || !partsContainer || !slider || !separateTable || !oneTable || !addButton || !deleteButton) {
            console.log('Не все необходимые элементы найдены для нового распила');
            return;
        }

        // Получаем параметры из слайдера
        const min = parseInt(slider?.dataset.min) || 10;
        const max = parseInt(slider?.dataset.max) || 2990;
        const totalWidth = parseInt(slider?.dataset.width) || 3000;
        const step = parseInt(slider?.dataset.step) || 10;
        const propil = parseInt(slider?.dataset.propil) || 0;
        const maxParts = parseInt(slider?.dataset.sepmax) || 4;

        console.log('Параметры нового распила:', { min, max, totalWidth, step, propil, maxParts });

        // Переменные для управления частями
        let currentParts = 2; // Начинаем с 2 частей

        // Функция для создания визуального слайдера
        function createVisualSlider() {
            // Удаляем существующий кастомный слайдер, если есть
            const existingSlider = form.querySelector('.custom-range-slider-container');
            if (existingSlider) {
                existingSlider.remove();
            }

            // Создаем контейнер для слайдера
            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'custom-range-slider-container';
            sliderContainer.style.margin = '15px 0';
            sliderContainer.style.padding = '0 10px';

            // Создаем сам слайдер
            const rangeSlider = document.createElement('input');
            rangeSlider.type = 'range';
            rangeSlider.className = 'custom-range-slider';
            rangeSlider.min = min;
            rangeSlider.max = max;
            rangeSlider.step = step;
            rangeSlider.style.width = '100%';
            
            // Устанавливаем начальное значение для 2 частей
            if (currentParts === 2) {
                const firstInput = partsContainer.querySelector('.path-width');
                rangeSlider.value = firstInput ? parseInt(firstInput.value) || min : min;
            }
            
            // Добавляем подписи для слайдера
            const labelsContainer = document.createElement('div');
            labelsContainer.className = 'slider-labels';
            labelsContainer.style.display = 'flex';
            labelsContainer.style.justifyContent = 'space-between';
            labelsContainer.style.marginTop = '5px';
            labelsContainer.style.fontSize = '12px';
            
            const minLabel = document.createElement('span');
            minLabel.textContent = min + 'mm';
            
            const maxLabel = document.createElement('span');
            maxLabel.textContent = max + 'mm';
            
            labelsContainer.appendChild(minLabel);
            labelsContainer.appendChild(maxLabel);
            
            sliderContainer.appendChild(rangeSlider);
            sliderContainer.appendChild(labelsContainer);
            
            // Добавляем слайдер после контейнера с частями
            partsContainer.parentNode.insertBefore(sliderContainer, partsContainer.nextSibling);
            
            console.log('Визуальный слайдер создан');
            return rangeSlider;
        }

        // Функция для обновления визуального отображения в блоках
        function updateVisualBlocks() {
            const inputs = partsContainer.querySelectorAll('.path-width');
            const separateItems = separateTable.querySelectorAll('.separate_item');
            
            // Сначала скрываем все разделы
            separateItems.forEach(item => {
                item.style.display = 'none';
            });
            
            // Показываем только активные разделы
            inputs.forEach((input, index) => {
                const value = input.value;
                const separateItem = separateItems[index];
                
                if (separateItem && index < currentParts) {
                    // Обновляем ширину в блоке
                    const widthSpan = separateItem.querySelector('.onesize-width');
                    if (widthSpan) {
                        widthSpan.textContent = value;
                    }
                    
                    // Обновляем номер части в заголовке
                    const heading = separateItem.querySelector('.panel-heading');
                    if (heading) {
                        heading.textContent = `Часть ${index + 1}`;
                    }
                    
                    // Обновляем ширину визуального блока
                    const tableWrap = separateItem.querySelector('.table_wrap');
                    if (tableWrap && totalWidth > 0) {
                        const percentage = (value / totalWidth) * 100;
                        tableWrap.style.width = percentage + '%';
                    }
                    
                    // Показываем блок
                    separateItem.style.display = 'block';
                }
            });
        }

        // Функция для добавления нового распила
        function addNewCut(event) {
            event.preventDefault();
            event.stopPropagation();
            
            if (currentParts >= maxParts) {
                alert(`Максимальное количество распилов: ${maxParts}`);
                return;
            }

            currentParts++;
            
            // Создаем новую часть в форме
            const newPart = document.createElement('div');
            newPart.className = 'path-container';
            newPart.dataset.id = currentParts - 1;
            
            newPart.innerHTML = `
                <div>Часть <span class="path-number">${currentParts}</span></div>
                <input autocomplete="off" step="${step}" data-id="${currentParts - 1}" value="${Math.floor(totalWidth / currentParts)}" class="path-width">
                <div>mm.</div>
            `;
            
            partsContainer.appendChild(newPart);
            
            // Добавляем обработчики для нового input'а
            const newInput = newPart.querySelector('.path-width');
            newInput.addEventListener('input', function() {
                const value = parseInt(this.value) || 0;
                if (value < min) {
                    this.value = min;
                } else if (value > max) {
                    this.value = max;
                }
                updateHiddenInput();
                updateVisualBlocks();
            });
            
            newInput.addEventListener('change', function() {
                const value = parseInt(this.value);
                if (!isNaN(value)) {
                    const normalizedValue = Math.round(value / step) * step;
                    this.value = normalizedValue;
                    updateHiddenInput();
                    updateVisualBlocks();
                }
            });
            
            // Показываем блок удаления
            deleteButton.disabled = false;
            
            // Если достигли максимума, скрываем кнопку добавления
            if (currentParts >= maxParts) {
                addButton.disabled = true;
            }
            
            // Перераспределяем значения
            redistributeValues();
            updateHiddenInput();
            updateVisualBlocks();
            
            console.log(`Добавлена часть ${currentParts}`);
        }

        // Функция для удаления распила
        function deleteCut(event) {
            event.preventDefault();
            event.stopPropagation();
            
            if (currentParts <= 2) {
                alert('Минимальное количество распилов: 2');
                return;
            }

            // Удаляем последнюю часть из формы
            const lastPart = partsContainer.querySelector(`.path-container[data-id="${currentParts - 1}"]`);
            if (lastPart) {
                lastPart.remove();
            }
            
            currentParts--;
            
            // Скрываем блок удаления если минимальное количество
            if (currentParts <= 2) {
                deleteButton.disabled = true;
            }
            
            // Показываем кнопку добавления
            addButton.disabled = false;
            
            // Перераспределяем значения
            redistributeValues();
            updateHiddenInput();
            
            // ОБНОВЛЯЕМ ВИЗУАЛЬНЫЕ БЛОКИ - ЭТО КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ
            updateVisualBlocks();
            
            console.log(`Удалена часть, осталось: ${currentParts}`);
        }

        // Функция для перераспределения значений между частями
        function redistributeValues() {
            const inputs = partsContainer.querySelectorAll('.path-width');
            const equalValue = Math.floor((totalWidth - (propil * (currentParts - 1))) / currentParts);
            const normalizedValue = Math.round(equalValue / step) * step;
            
            inputs.forEach((input, index) => {
                if (index < currentParts) {
                    input.value = normalizedValue;
                }
            });
        }

        // Функция для синхронизации значений между частями
        function synchronizeParts() {
            const rangeSlider = createVisualSlider();
            const inputs = partsContainer.querySelectorAll('.path-width');
            
            // Обновляем значения при изменении range-слайдера
            rangeSlider.addEventListener('input', function() {
                const sliderValue = parseInt(this.value);
                
                // Для двух частей
                if (currentParts === 2 && inputs.length >= 2) {
                    inputs[0].value = sliderValue;
                    const secondValue = totalWidth - sliderValue - propil;
                    inputs[1].value = Math.max(min, Math.min(max, secondValue));
                }
                
                updateHiddenInput();
                updateVisualBlocks();
            });
            
            // Обработчики для каждого input'а
            inputs.forEach(input => {
                input.addEventListener('input', function() {
                    const value = parseInt(this.value) || 0;
                    
                    // Проверяем границы
                    if (value < min) {
                        this.value = min;
                    } else if (value > max) {
                        this.value = max;
                    }
                    
                    // Для двух частей синхронизируем вторую часть
                    if (currentParts === 2) {
                        const inputs = partsContainer.querySelectorAll('.path-width');
                        if (inputs.length >= 2) {
                            if (this === inputs[0]) {
                                const secondValue = totalWidth - value - propil;
                                inputs[1].value = Math.max(min, Math.min(max, secondValue));
                                rangeSlider.value = value;
                            } else if (this === inputs[1]) {
                                const firstValue = totalWidth - value - propil;
                                inputs[0].value = Math.max(min, Math.min(max, firstValue));
                                rangeSlider.value = firstValue;
                            }
                        }
                    }
                    
                    updateHiddenInput();
                    updateVisualBlocks();
                });
                
                input.addEventListener('change', function() {
                    const value = parseInt(this.value);
                    if (!isNaN(value)) {
                        const normalizedValue = Math.round(value / step) * step;
                        this.value = normalizedValue;
                        
                        updateHiddenInput();
                        updateVisualBlocks();
                    }
                });
            });
        }

        // Функция для обновления скрытого поля
        function updateHiddenInput() {
            if (!raspilCheckbox.checked) return;

            const values = [];
            const inputs = partsContainer.querySelectorAll('.path-width');
            
            inputs.forEach((input, index) => {
                if (index < currentParts && input.value) {
                    values.push(input.value);
                }
            });

            hiddenInput.value = values.join('*');
            console.log('Скрытое поле обновлено:', hiddenInput.value);
        }

        // Функция для переключения видимости формы и блоков
        function toggleForm() {
            const isChecked = raspilCheckbox.checked;
            
            // Управление видимостью формы распила
            form.style.display = isChecked ? 'block' : 'none';
            
            // Управление видимостью таблицы разделенных частей
            separateTable.style.display = isChecked ? 'block' : 'none';
            
            // Скрываем/показываем основной блок one_table
            oneTable.style.display = isChecked ? 'none' : 'block';
            
            hiddenInput.disabled = !isChecked;
            
            if (isChecked) {
                updateHiddenInput();
                updateVisualBlocks();
            }
        }

        // Функция для инициализации начальных значений
        function initializeValues() {
            const inputs = partsContainer.querySelectorAll('.path-width');
            
            // Устанавливаем равные значения по умолчанию
            const equalValue = Math.floor((totalWidth - propil) / currentParts);
            const normalizedValue = Math.round(equalValue / step) * step;
            
            inputs.forEach((input, index) => {
                if (index < currentParts) {
                    input.value = normalizedValue;
                }
            });
            
            updateHiddenInput();
            updateVisualBlocks();
        }

        // Навешиваем обработчики событий
        raspilCheckbox.addEventListener('change', toggleForm);
        addButton.addEventListener('click', addNewCut);
        deleteButton.addEventListener('click', deleteCut);
        
        // Меняем тип кнопок на button чтобы они не отправляли форму
        addButton.type = 'button';
        deleteButton.type = 'button';

        // Инициализируем
        synchronizeParts();
        initializeValues();
        toggleForm();

        console.log('Функционал нового распила успешно инициализирован для:', form.id);
    });
}

// Вызываем функцию после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    initUslugiRaspilNew();
});


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




