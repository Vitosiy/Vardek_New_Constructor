<!-- eslint-disable -->
<template>
  <div class="product-details" v-if="productDetails">
    <button @click="handleBack" class="product-details__back-page">← Назад</button>
    <div v-html="productDetails"></div>
  </div>
</template>

<script setup>
  import { useCatalogStore } from '@/store/appStore/catalogStore';
  import { defineProps, defineEmits, defineExpose, onUnmounted, ref } from 'vue';

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
  
  const productIsInit = ref(false);
  let raspil;


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
          // formElement.addEventListener('input', inputHandler);
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
    catalogInitProduct(
      document.querySelectorAll(".main__product .product__wrapper"),
      catalogElementGetPrice,
      catalogAddToBasket
    );
  }


  function catalogElementGetPrice () { return true };
  function catalogAddToBasket () { return true };
  
  function catalogInitProduct(parent, ElementGetPriceFunc, addToBasketFunc) {
    console.log('работает'); 
    // if (!productIsInit.value)
      catalogInitEvent(ElementGetPriceFunc, addToBasketFunc);
    

    catalogInitElementProps(parent, ElementGetPriceFunc);
    // ElementGetPriceFunc(parent);
  }

  function catalogInitEvent(ElementGetPriceFunc, addToBasketFunc) {
    // Слушатель для выбора фасада
    document.addEventListener("change", function (e) {
      if (e.target.matches("input[name='SELECTFASADE']")) {
        const selected = document.querySelector("input[name='SELECTFASADE']:checked");
        if (selected && selected.value >= 1) {
          let n = selected.value;
          let arrType = ['FACADE', 'MILLING', 'FASADETYPE', 'PALETTE', 'PATINA', 'GLASS'];

          arrType.forEach(type => {
            let codeElem = "CUSTOM_" + type + n;
            let inputElem = document.querySelector(`input[name='${codeElem}']`);
            if (inputElem) {
              let val = inputElem.value;
              let checkElem = document.querySelector(`input[value='${val}']`);
              if (val === "") {
                if (checkElem) checkElem.checked = false;
              } else {
                if (checkElem) checkElem.checked = true;
              }
            }
          });

          arrType.forEach(type => {
            let codeElem = "CUSTOM_" + type + n;
            let inputElem = document.querySelector(`input[name='${codeElem}']`);
            if (inputElem) {
              let checkElem = document.querySelector(`input[value='${inputElem.value}']`);
              if (checkElem) doChangeProps(checkElem);
            }
          });
        }
      }
    });

    // Слушатель для выбора характеристик
    document.addEventListener("change", function (e) {
      if (e.target.matches(
        ".prop-facades input, .prop-colors input, .prop-leg_type input, .prop-milling input, .prop-glass input, .prop-hem input, .prop-fasadesize input, .prop-uslugi input, .prop-filling input, .prop-resize input, .prop-profile input, .prop-handlecolor input, .prop-fasadealign input, .prop-patinacolor input, .prop-tabletop_type input, .prop-option input, .prop-type_showcase input, .prop-fasade_type input, .prop-palette-wrap select"
      )) {
        let elem = e.target;
        doChangeProps(elem);
        let wrapper = elem.closest(".product__wrapper");
        if (wrapper) ElementGetPriceFunc(wrapper);
      }
    });

    // Группы
    document.addEventListener("change", function (e) {
      if (e.target.matches(".prop-group input")) {
        let elem = e.target;
        document.querySelectorAll(".group-consist, .basket-label").forEach(el => el.classList.remove("active"));
        document.querySelectorAll(".group-consist" + elem.dataset.id + ", .basket-label" + elem.dataset.id).forEach(el => el.classList.add("active"));
        let wrapper = elem.closest(".product__wrapper");
        if (wrapper) ElementGetPriceFunc(wrapper);
      }
    });

    // Складушки фасадов
    document.addEventListener("click", function (e) {
      if (e.target.matches(".facade-collaps")) {
        let collapsId = e.target.dataset.href;
        let collapsEl = document.querySelector(collapsId);
        if (collapsEl) {
          let parent = collapsEl.closest(".group");
          if (parent) parent.classList.toggle("collapse_open");
        }
      }
    });

    // Размеры и толщина
    document.addEventListener("change", function (e) {
      if (e.target.matches(".prop-size .values input, .prop-thickness .values input")) {
        let elem = e.target;
        if (elem.checked) {
          elem.parentElement.classList.add("active");

          elem.closest(".values").querySelectorAll("input:checked").forEach(input => {
            if (input.value !== elem.value) {
              input.checked = false;
              input.parentElement.classList.remove("active");
            }
          });

          let wrapper = elem.closest(".product__wrapper");
          if (wrapper) ElementGetPriceFunc(wrapper);
        } else {
          elem.checked = true;
        }
      }
    });

    // Добавить в корзину
    document.addEventListener("click", function (e) {
      if (e.target.matches(".element .add-to-basket .to-basket, .product__cart-button")) {
        addToBasketFunc(e);
        e.preventDefault();
      }
    });

    // Блокировка окна инфо
    document.addEventListener("click", function (e) {
      if (e.target.matches(".windowinfo-btn")) {
        e.preventDefault();
      }
    });

    productIsInit.value = !productIsInit;
  }

  function doChangeProps(elem) {
    const id = elem.id;

    let propsShow = {};
    let propParent = elem.closest('.values');
    let rootPropParent = elem.closest('.prop');
    let formParent = elem.closest('form');

    let enableForm = {};
    let disableProp = [];
    let isseparate = !!formParent.querySelector('input[data-isseparate="1"]:checked');

    let recall = false;

    // === Обработка preview ===
    if (elem.checked) {
      const preview = elem.getAttribute('_preview');
      if (preview) {
        const currentLink = formParent.querySelector('.prop-facades .current a');
        const currentImg = formParent.querySelector('.prop-facades .current img');
        const currentName = formParent.querySelector('.prop-facades .current .name');
        if (currentLink) currentLink.href = elem.parentElement.getAttribute('_pic');
        if (currentImg) currentImg.src = preview;
        if (currentName) currentName.innerHTML = elem.getAttribute('_preview_name');
      }
    }

    // === Основная картинка ===
    const imageData = elem.dataset.image;
    if (imageData) {
      const previewImg = formParent.querySelector('.product__form .preview img');
      const previewLink = formParent.querySelector('.product__form .preview .image');
      if (previewImg) previewImg.src = imageData;
      if (previewLink) previewLink.href = elem.dataset.imagebig;
    }

    // === Группы переключений ===
    const groupRadio = elem.dataset.groupRadio;
    if (groupRadio) {
      const groupList = typeof groupRadio === 'number' ? [groupRadio] : groupRadio.split(',');
      for (const v of groupList) {
        if (elem.checked) {
          const others = formParent.querySelectorAll(`[data-group-radio*="${v}"]`);
          for (const other of others) {
            if (other !== elem) other.checked = false;
          }
        }
      }
    }

    // === Включение/отключение форм ===
    const inputs = formParent.querySelectorAll('input, select');
    for (const k of inputs) {
      const formAction = k.dataset.formAction;
      if (!formAction) continue;

      const form = formParent.querySelector('.' + formAction);
      const hide = formParent.querySelector('.hide-' + formAction);
      const kPropParent = k.closest('.values');

      if (k.checked && !k.disabled) {
        k.parentElement.classList.add('selected');
        enableForm[formAction] = true;

        if (form) {
          form.style.display = 'block';
          const formInputs = form.querySelectorAll('input, select');
          for (const input of formInputs) input.disabled = false;
        }
        if (hide) {
          hide.style.display = 'none';
          const hideInputs = hide.querySelectorAll('input, select');
          for (const input of hideInputs) input.disabled = true;
        }

        if (k.dataset.groupDisable) {
          disableProp.push(...k.dataset.groupDisable.split(','));
        }
      } else if (!enableForm[formAction]) {
        k.parentElement.classList.remove('selected');

        if (form) {
          form.style.display = 'none';
          const formInputs = form.querySelectorAll('input, select');
          for (const input of formInputs) input.disabled = true;
        }
        if (hide) {
          hide.style.display = 'block';
          const hideInputs = hide.querySelectorAll('input, select');
          for (const input of hideInputs) input.disabled = false;
        }
      }
    }

    // === Обработка .prop-uslugi ===
    if (formParent.querySelector('.prop-uslugi')) {
      const allInputs = document.querySelectorAll('input, select');
      for (const k of allInputs) {
        const kPropParent = k.closest('.values');
        const kRootPropParent = k.closest('.prop');
        if (!kRootPropParent) continue;

        const dataRelationsWidth = k.dataset.relationsWidth;
        const dataRelationsDepth = k.dataset.relationsDepth;
        const align = kPropParent?.dataset.align;
        const separated = k.dataset.separated;

        let showCondition = false;

        if (isseparate) {
          if (
            (separated === undefined || separated === '0') &&
            (!align ||
              // (!dataRelationsWidth || safeEval(dataRelationsWidth.replace(/#W#/g, raspil[align]))) &&
              (!dataRelationsWidth || safeEval(dataRelationsWidth.replace(/#W#/g, raspil[align]))) &&
              (!dataRelationsDepth || (document.getElementById('size_edit_depth_input') && safeEval(dataRelationsDepth.replace(/#D#/g, document.getElementById('size_edit_depth_input').value))))
            )
          ) {
            showCondition = true;
          }
        } else {
          if (
            !(align && separated === '0') &&
            (!dataRelationsDepth || (document.getElementById('size_edit_depth_input') && safeEval(dataRelationsDepth.replace(/#D#/g, document.getElementById('size_edit_depth_input').value))))
          ) {
            showCondition = true;
          }
        }

        const group = k.dataset.group;
        if (group && disableProp.includes(group)) showCondition = false;

        if (showCondition) {
          console.log('showCondition', showCondition);
          k.disabled = false;
          if(k.closest('li')) {
            k.closest('li').style.display = 'list-item';
          }
          console.log('kPropParent', kPropParent);
          if (k.dataset.class && k.checked) {
            const target = kPropParent?.dataset.target;
            if (target) document.querySelector(target)?.classList.add(k.dataset.class);
            activateWidthSetting(k);
          } else {
            const target = kPropParent.dataset.target;
            if (target) document.querySelector(target)?.classList.remove(k.dataset.class);
            deactivateWidthSetting(k);
          }
        } else {
          k.disabled = true;
          if(k.closest('li')) {
            k.closest('li').style.display = 'none';
          }

          if (k.dataset.class) {
            const target = kPropParent.dataset.target;
            if (target) document.querySelector(target)?.classList.remove(k.dataset.class);
          }
          deactivateWidthSetting(k);
        }
      }
    }

    // === activateWidthSetting ===
    function activateWidthSetting(elem) {
      const container = elem.closest('.prop-uslugi');
      if (!container) return;
      const widthSettingElem = container.querySelector(`input[data-parent-id="${elem.value}"]`);
      if (!widthSettingElem) return;

      widthSettingElem.disabled = false;
      if(widthSettingElem.closest('.item-width-setting')) {
        widthSettingElem.closest('.item-width-setting').style.display = 'block';
      }
      widthSettingElem.classList.add('active');

      let defaultWidth = 600;
      let step = 10;
      let anotherShow = 0;
      let anotherID = false;

      const raspilKey = elem.closest('.values')?.dataset.align;
      const idInput = raspilKey > 0 ? raspilKey - 1 : null;
      const freeSpaceInput = raspilKey
        ? document.querySelector(`.path-width[data-id="${idInput}"]`)
        : formParent.querySelector('input[name="width"]');
      let freeSpace = parseInt(freeSpaceInput?.value || 0);

      let valInp = parseInt(widthSettingElem.value) || step;
      if (valInp <= step) valInp = step;

      // Поиск соседнего активного еврозапила
      const allWidthInputs = container.querySelectorAll('.list-width-setting input');
      for (const input of allWidthInputs) {
        if (
          input.dataset.parentId !== widthSettingElem.dataset.parentId &&
          !input.disabled &&
          input.classList.contains('active')
        ) {
          anotherID = input.dataset.parentId;
          anotherShow = parseInt(input.value) || 0;
        }
      }

      freeSpace -= anotherShow;
      if (freeSpace < valInp + step) valInp = freeSpace - step;
      if (valInp <= 0 && anotherID !== false) {
        valInp = step;
        anotherShow -= step;
        if (anotherShow < step) {
          deactivateWidthSetting(elem);
          elem.disabled = true;
          if(elem.closest('li')) {
            elem.closest('li').style.display = 'none';
          }
          if (elem.dataset.class) {
            const target = elem.closest('.values')?.dataset.target;
            if (target) document.querySelector(target)?.classList.remove(elem.dataset.class);
          }
        } else {
          const anotherInput = container.querySelector(`input[data-parent-id="${anotherID}"]`);
          if (anotherInput) anotherInput.value = anotherShow;
        }
      }
      widthSettingElem.value = valInp;
    }

    // === deactivateWidthSetting ===
    function deactivateWidthSetting(elem) {
      const container = elem.closest('.prop-uslugi');
      if (!container) return;
      const widthSettingElem = container.querySelector(`input[data-parent-id="${elem.value}"]`);
      if (!widthSettingElem) return;

      widthSettingElem.disabled = true;
      if(widthSettingElem.closest('.item-width-setting')) {
        widthSettingElem.closest('.item-width-setting').style.display = 'none';
      }
      widthSettingElem.classList.remove('active');
    }

    // === Проверка опций ===
    const onlyOpt = document.querySelector('input[data-opt-specific="true"]');
    if (onlyOpt) {
      const onlyOptVal = onlyOpt.dataset.optFasade;
      const notWithOpt = onlyOpt.dataset.optNotwith;

      if (onlyOptVal) {
        const optList = Array.isArray(onlyOptVal) ? onlyOptVal : onlyOptVal.split(',');

        let isOptChecked = false;
        for (const item of optList) {
          const input = document.querySelector(`input[value="${item}"]`);
          if (input?.checked) isOptChecked = true;
        }

        if (isOptChecked) {
          const arrGroup = [];
          const inputs = document.querySelectorAll('input[data-opt-specific="true"]');
          for (const v of inputs) {
            const qwe = v;
            if (elem.name === 'OPTION[]') {
              if (!elem.checked && qwe.dataset.optSpecific === 'true') qwe.checked = true;
            } else {
              const group = qwe.dataset.groupRadio;
              if (!arrGroup.includes(group)) {
                arrGroup.push(group);
                qwe.checked = true;
              } else {
                qwe.checked = false;
              }
            }
            if(qwe.closest('label')) {
              qwe.closest('label').style.display = 'inline-block';
            }
          }

          if (notWithOpt) {
            const notWithList = typeof notWithOpt === 'string' ? notWithOpt.split(',') : [notWithOpt];
            for (const item of notWithList) {
              const input = document.querySelector(`input[value="${item}"]`);
              if (input) {
                input.checked = false;
                if(input.closest('label')) {
                  input.closest('label').style.display = 'none';
                }
              }
            }
          }
        } else {
          onlyOpt.checked = false;
          if(onlyOpt.closest('label')) {
            onlyOpt.closest('label').style.display = 'none';
          }

          if (notWithOpt) {
            const notWithList = typeof notWithOpt === 'string' ? notWithOpt.split(',') : [notWithOpt];
            for (const item of notWithList) {
              const input = document.querySelector(`input[value="${item}"]`);
              if(input) {
                if (input.closest('label')) input.closest('label').style.display = 'inline-block';
              }
            }
          }
        }
      }
    }

    // === FILLING ===
    if (formParent.querySelector("[data-filling]") && formParent.querySelector("input[name='FILLING']")) {
      const fillVal = formParent.querySelector("input[name='FILLING']:checked")?.value;
      const fillRelElems = formParent.querySelectorAll("[data-filling]");
      for (const fillRel of fillRelElems) {
        const filling = fillRel.dataset.filling;
        if (filling) {
          const match = (
            (!isNaN(filling) && filling == fillVal) ||
            (typeof filling === 'string' && filling.includes(fillVal))
          );
          fillRel.disabled = !match;
          if(fillRel.closest('li')) {
            fillRel.closest('li').style.display = match ? 'list-item' : 'none';
          }
        }
      }
    }

    // === relations ===
    const relInputs = formParent.querySelectorAll("input[data-relations]");
    for (const k of relInputs) {
      catalogControlRelation(propsShow, k);
    }

    catalogControlConditions();

    // === propsShow ===
    for (const [k, v] of Object.entries(propsShow)) {
      const rel = formParent.querySelector('.prop-' + k);
      if (!rel || rel.dataset.enable === 'false') continue;

      if (v) {
        rel.classList.remove('disable');
        const inputs = rel.querySelectorAll('input, select');
        if (v === true) {
          for (const input of inputs) {
            input.disabled = false;
            if(input.closest('li')) {
              input.closest('li').style.display = 'list-item';
            }
          }
        } else if (v === 'hide') {
          rel.classList.add('disable');
          for (const input of inputs) {
            input.disabled = true;
            input.checked = false;
            if(input.closest('label')) {
              input.closest('label').classList.remove('selected');
            }
          }
        } else {
          const enablePropVals = v.toString().split(',');
          const selectFasade = formParent.querySelector("input[name='SELECTFASADE']:checked");
          const fasadeNumber = selectFasade?.value;
          let arrFasadeType = [];

          if (fasadeNumber && parseInt(fasadeNumber) >= 1) {
            const fasadeType = formParent.querySelector(`input[name='TYPE_FASADE${fasadeNumber}']`)?.value;
            arrFasadeType = fasadeType?.split(',') || [];
          }

          for (const input of inputs) {
            const val = input.value;
            const inList = enablePropVals.includes(val);
            const inFasadeType = arrFasadeType.length === 0 || arrFasadeType.includes(val);

            if (!inList || !inFasadeType) {
              input.disabled = true;
              input.checked = false;
              if(input.closest('label')) {
                input.closest('label').classList.remove('selected');
              }
              if(input.closest('li')) {
                input.closest('li').style.display = 'none';
              }
            } else {
              input.disabled = false;
              if(input.closest('li')) {
                input.closest('li').style.display = 'list-item';
              }
            }
          }
        }

        const firstEnabled = rel.querySelector('input:enabled, select:enabled');
        const checkedEnabled = rel.querySelector('input:checked:enabled, select:checked:enabled');
        if (!checkedEnabled && firstEnabled) {
          firstEnabled.checked = true;
          firstEnabled.closest('label')?.classList.add('selected');
          recall = true;
        }
      } else {
        rel.classList.add('disable');
        const inputs = rel.querySelectorAll('input, select');
        for (const input of inputs) {
          input.disabled = true;
          input.checked = false;
          input.closest('label')?.classList.remove('selected');
        }
      }
    }

    // === no_fasade ===
    const noFasadeChecked = formParent.querySelector('input:checked[data-no_fasade="1"]');
    const facadesProp = formParent.querySelector('.prop-facades');
    if (facadesProp) {
      if (noFasadeChecked && formParent.querySelector('input[name="FACADE"][data-type="no_fasade"]')) {
        formParent.querySelector('input[name="FACADE"][data-type="no_fasade"]').checked = true;
        facadesProp.classList.add('disable');
      } else {
        facadesProp.classList.remove('disable');
      }
    }

    // === selectpicker refresh ===
    // if (typeof $('.selectpicker') !== 'undefined') {
    //   $('.selectpicker').selectpicker('refresh');
    // }

    if (recall) elem.dispatchEvent(new Event('change'));

    // === SIZEEDITJOINDEPTH ===
    const joinDepthInput = formParent.querySelector("input[name='SIZEEDITJOINDEPTH']");
    if (joinDepthInput) {
      const widthFrame = formParent.querySelector("input[name='SIZEEDITWIDTH']");
      const min = parseInt(joinDepthInput.dataset.min);
      const max = parseInt(joinDepthInput.dataset.max);
      let joinDepthVal = parseInt(joinDepthInput.value);
      let detected = false;
      const typeFasade = formParent.querySelector('input[name="FACADE"]:checked')?.dataset.type;

      if (typeFasade === 'no_fasade') {
        joinDepthInput.disabled = true;
      } else {
        let changeMax = max;
        while (changeMax >= min) {
          const cond = joinDepthInput.dataset.inclCond
            .replace(/#X#/g, widthFrame.value)
            .replace(/#SIZEEDITJOINDEPTH#/g, changeMax);
          if (safeEval(cond)) {
            detected = true;
            break;
          }
          changeMax--;
        }

        if (detected) {
          const objSld = { detected: false };
          if (changeMax <= max) {
            objSld.max = changeMax;
            objSld.detected = true;
          }
          if (changeMax < joinDepthVal) {
            joinDepthVal = changeMax;
            objSld.value = changeMax;
            joinDepthInput.value = changeMax;
            objSld.detected = true;
          }

          const condition = formParent.querySelector("input[name='condition']")
            ?.dataset.width
            .replace(/#X#/g, widthFrame.value)
            .replace(/#SIZEEDITJOINDEPTH#/g, joinDepthVal);
          const result = safeEval(condition);
          const fasadeWidth = formParent.querySelector(".fasade_width");
          if (fasadeWidth) fasadeWidth.textContent = result;

          // if (objSld.detected && typeof $("#size_edit_joindepth_slider").slider !== 'undefined') {
          //   $("#size_edit_joindepth_slider").slider(objSld);
          // }

          joinDepthInput.disabled = false;
          if(joinDepthInput.closest('.prop-resize')) {
            joinDepthInput.closest('.prop-resize').style.display = 'block'; 
          }
        } else {
          joinDepthInput.disabled = true;
          if(joinDepthInput.closest('.prop-resize')) {
            joinDepthInput.closest('.prop-resize').style.display = 'none'; 
          }
        }
      }
    }

    // === MECHANISM ===
    const mechanismInput = formParent.querySelector("input[name='MECHANISM']");
    if (mechanismInput) {
      const activeFasade = formParent.querySelector('input[name="FACADE"]:checked');
      const typeFasade = activeFasade?.dataset.type;
      const mechanismList = formParent.querySelectorAll("input[name='MECHANISM']");

      if (typeFasade === 'no_fasade') {
        deactivateMechanism(mechanismList);
      } else {
        controlMechanism(activeFasade, mechanismList);
      }
    }

    // === Проверка размеров фасада ===
    const ignoreSize = formParent.querySelector("input[name='IGNORE_SIZE']")?.value !== '1';
    if (formParent.querySelector("input[name='FACADE']") && ignoreSize) {
      let width = formParent.querySelector("input[name='SIZEEDITWIDTH']")?.value;
      let height = formParent.querySelector("input[name='SIZEEDITHEIGHT']")?.value;

      if (!width) width = parseInt(formParent.querySelector("input[name='width']")?.value || 0);
      if (!height) height = parseInt(formParent.querySelector("input[name='height']")?.value || 0);

      const condition = formParent.querySelector("input[name='condition']");
      if (condition?.dataset.width) {
        let formula = condition.dataset.width
          .replace(/#X#/g, width)
          .replace(/#SIZEEDITJOINDEPTH#/g, formParent.querySelector("input[name='SIZEEDITJOINDEPTH']")?.value || 0)
          .replace(/#Z#/g, formParent.querySelector("input[name='depth']")?.value || 0);
        width = parseInt(safeEval(formula));
      }
      if (condition?.dataset.height) {
        height = parseInt(safeEval(condition.dataset.height.replace(/#Y#/g, height)));
      }

      const defaultElem = formParent.querySelector('.prop-facades input:first-of-type');
      const selectedElem = formParent.querySelector('.prop-facades input[type="radio"]:checked');
      if (selectedElem) {
        const maxWidth = parseInt(selectedElem.dataset.maxWidth);
        const maxHeight = parseInt(selectedElem.dataset.maxHeight);
        const minHeight = parseInt(selectedElem.dataset.minHeight);
        const minWidth = parseInt(selectedElem.dataset.minWidth);

        if (
          (maxWidth < width || maxHeight < height) ||
          (minHeight > width || minWidth > height)
        ) {
          defaultElem.checked = true;
          defaultElem.closest('label')?.classList.add('selected');
          selectedElem.closest('label')?.classList.remove('selected');
        }
      }

      const fasadeInputs = formParent.querySelectorAll('.prop-facades .group-values input');
      for (const input of fasadeInputs) {
        const maxWidth = parseInt(input.dataset.maxWidth);
        const maxHeight = parseInt(input.dataset.maxHeight);
        const minHeight = parseInt(input.dataset.minHeight);
        const minWidth = parseInt(input.dataset.minWidth);

        if (maxWidth && maxHeight) {
          const hide = (maxWidth < width || maxHeight < height) ||
                      (minWidth && minWidth > width) ||
                      (minHeight && minHeight > height);

          input.closest('li')?.classList.toggle('hiden-fasade', hide);
          input.classList.toggle('err', hide);
          input.disabled = hide;
        }
      }

      const groups = formParent.querySelectorAll('.prop-facades .group');
      for (const group of groups) {
        const inputs = group.querySelectorAll('input');
        const errInputs = group.querySelectorAll('input.err');
        group.style.display = inputs.length === errInputs.length ? 'none' : 'block';
      }
    }

    // === Raspil ===
    const sawPropil = 20;
    const raspilVert = document.getElementById('raspilVert');
    const widthVal = formParent.querySelector("input[name='SIZEEDITWIDTH']")?.value;
    if (raspilVert && widthVal > 0) {
      const value = widthVal / 2 - sawPropil / 2;
      if (value > 0) {
        raspilVert.textContent = `(${value} + ${value})`;
      }
    }

    const raspilHor = document.getElementById('raspilHor');
    const heightVal = formParent.querySelector("input[name='SIZEEDITHEIGHT']")?.value;
    if (raspilHor && heightVal > 0) {
      const value = heightVal / 2 - sawPropil / 2;
      if (value > 0) {
        raspilHor.textContent = `(${value} + ${value})`;
      }
    }

    // === SELECTFASADE ===
    const selectFasade = formParent.querySelector("input[name='SELECTFASADE']:checked");
    if (selectFasade && parseInt(selectFasade.value) >= 1) {
      const numberElem = selectFasade.value;
      const arrType = ['FACADE','MILLING','PALETTE','FASADETYPE','PATINA','GLASS'];
      const name = {
        FACADE: 'Цвет фасада',
        MILLING: 'Фрезеровка',
        PALETTE: 'Цвет палитры',
        FASADETYPE: 'Тип фасада',
        PATINA: 'Патина',
        GLASS: 'Стекло',
      };

      let text = '';
      for (const type of arrType) {
        let typeVal;
        if (type === 'PALETTE') {
          const select = formParent.querySelector(`select[name="${type}"]:enabled`);
          typeVal = select?.value;
          if (typeVal) {
            const optionText = select.options[select.selectedIndex]?.text;
            text += `${name[type]}: ${optionText}<br>`;
          }
        } else {
          const input = formParent.querySelector(`input[name="${type}"]:checked`);
          typeVal = input?.value;
          if (typeVal) {
            const title = input.closest('.selected')?.querySelector('.value-title')?.textContent || '';
            text += `${name[type]}: ${title}<br>`;
          }
        }

        const codeElem = formParent.querySelector(`input[name="CUSTOM_${type}${numberElem}"]`);
        if (codeElem) codeElem.value = typeVal || '';
      }

      const desc = document.getElementById(`selectFasade${numberElem}`);
      if (desc) desc.querySelector('.description').innerHTML = text;
    }
  };

  // === Безопасная замена eval() ===
  function safeEval(expr) {
    try {
      // Разрешаем только простые выражения
      return new Function('return ' + expr)();
    } catch (e) {
      console.warn('Eval failed:', expr, e);
      return false;
    }
  }

  // === Функция: деактивировать механизм ===
  function deactivateMechanism (mechanismList) {
  // mechanismList может быть NodeList, Array или Array-like
  const items = (mechanismList instanceof NodeList || Array.isArray(mechanismList))
    ? mechanismList
    : [mechanismList];

  for (const item of items) {
    item.checked = false;
    const li = item.closest('li');
    if (li) li.style.display = 'none';
  }
  };

  // === Функция: управлять механизмами в зависимости от параметров фасада ===
  function controlMechanism (activeFasade, mechanismList) {
    console.log('activeFasade', activeFasade)
    console.log('mechanismList', mechanismList)
    const activeMilling = document.querySelector('input[name="MILLING"]:checked');

    // Получаем параметры фасада
    const density = parseFloat(activeFasade.getAttribute('density')) || 0;
    const depth = parseFloat(activeFasade.getAttribute('depth')) || 0;
    let weightFasade = parseFloat(activeFasade.getAttribute('weight')) || 0;

    // Если есть фрезеровка — используем её вес
    if (activeMilling && activeMilling.hasAttribute('weight')) {
      weightFasade = parseFloat(activeMilling.getAttribute('weight')) || 0;
    }

    // Если вес не определён — отключаем все механизмы
    if (isNaN(weightFasade) || weightFasade <= 0) {
      deactivateMechanism(mechanismList);
      return false;
    }

    // Получаем размеры рамы
    const objSizeFrame = getElementSize('.catalog-element-form');
    const widthFrame = parseFloat(objSizeFrame.width) || 0;
    const heightFrame = parseFloat(objSizeFrame.height) || 0;

    // Начальные значения
    let allHeight = 0;
    let allWeight = 0;

    // Обработка условий из input[name="conditionnew"]
    const conditionInputs = document.querySelectorAll('input[name="conditionnew"]');
    if (conditionInputs.length > 0) {
      for (const condInput of conditionInputs) {
        const conditionWidth = condInput.getAttribute('width') || '0';
        const conditionHeight = condInput.getAttribute('height') || '0';

        // Подстановка переменных
        const objAxe = {
          '#X#': widthFrame,
          '#Y#': heightFrame
        };

        // Заменяем переменные в строке
        const replaceVars = (str, vars) => {
          let result = str;
          for (const [key, value] of Object.entries(vars)) {
            const regex = new RegExp(key, 'g');
            result = result.replace(regex, value);
          }
          return result;
        };

        const sumCondWidthStr = replaceVars(conditionWidth, objAxe);
        const sumCondHeightStr = replaceVars(conditionHeight, objAxe);

        const sumCondWidth = safeEval(sumCondWidthStr);
        const sumCondHeight = safeEval(sumCondHeightStr);

        allHeight += sumCondHeight;
        allWeight += (sumCondWidth * sumCondHeight / 1_000_000) * weightFasade;
      }
    }

    // Если общий вес <= 0 — отключаем механизмы
    if (allWeight <= 0) {
      deactivateMechanism(mechanismList);
      return false;
    }

    // Округляем вес
    allWeight = parseFloat(allWeight.toFixed(2));

    // Объекты для контроля секций и типов механизмов
    const objSectionMech = {}; // section -> typeMech
    const idsMech = {};        // id -> true если подходит

    // Преобразуем mechanismList в массив (если это NodeList)
    const mechanisms = (mechanismList instanceof NodeList || Array.isArray(mechanismList))
      ? Array.from(mechanismList)
      : [mechanismList];

    for (const mech of mechanisms) {
      const dataCond = mech.getAttribute('data-cond');
      if (!dataCond) continue;

      const arrConditions = dataCond.split(',');
      const typeMech = mech.getAttribute('data-type-mech');
      const sectionMech = mech.getAttribute('data-section');
      const id = mech.value;

      for (const condition of arrConditions) {
        const parts = condition.split('_').map(p => parseFloat(p));
        if (parts.length !== 4) continue; // [minHeight, maxHeight, minWeight, maxWeight]

        const [minHeight, maxHeight, minWeight, maxWeight] = parts;

        if (
          allHeight >= minHeight &&
          allHeight <= maxHeight &&
          allWeight >= minWeight &&
          allWeight <= maxWeight
        ) {
          // Проверка конфликта типов в одной секции
          if (objSectionMech[sectionMech] !== undefined && objSectionMech[sectionMech] !== typeMech) {
            continue; // пропускаем, если тип уже задан и не совпадает
          }

          idsMech[id] = true;
          objSectionMech[sectionMech] = typeMech;
        }
      }
    }

    // Применяем видимость и состояние чекбоксов
    for (const mech of mechanisms) {
      const id = mech.value;
      const li = mech.closest('li');

      if (idsMech[id] === true) {
        if (li) li.style.display = 'list-item';
      } else {
        if (li) li.style.display = 'none';
        mech.checked = false;
      }
    }

    return true;
  };

  function catalogControlConditions() {
    // Получаем все элементы с атрибутом data-conditions
    const elements = document.querySelectorAll('[data-conditions]');
    
    for (const el of elements) {
      const conditionsAttr = el.dataset.conditions;
      
      // Проверяем, что атрибут не пустой
      if (!conditionsAttr || conditionsAttr.trim() === '') continue;

      // Находим форму
      const form = el.closest('form');
      if (!form) continue;

      // Получаем размеры через getElementSize
      const size = getElementSize(form);
      
      // Подставляем значения в выражение
      const conditionVars = {
        '#X#': size.width,
        '#Y#': size.height,
        '#Z#': size.depth,
      };

      // Заменяем переменные в строке
      let expr = conditionsAttr;
      for (const [key, value] of Object.entries(conditionVars)) {
        // Экранируем спецсимволы для RegExp, если нужно (для точного совпадения)
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedKey, 'g');
        expr = expr.replace(regex, value);
      }

      // Безопасная проверка условия
      const conditionResult = safeEval(expr);

      // Управляем состоянием элемента
      if (!conditionResult) {
        el.disabled = true;
        el.checked = false;
        const li = el.closest('li');
        if (li) li.style.display = 'none';
      } else {
        el.disabled = false;
        const li = el.closest('li');
        if (li) li.style.display = 'list-item';
      }

      // Автоматический выбор первого активного элемента в группе
      const propGroup = el.closest('.prop');
      if (propGroup) {
        // Проверяем, что мы не внутри .prop-option (исключаем из автовыбора)
        const isInPropOption = el.closest('.prop-option');
        if (!isInPropOption) {
          const enabledChecked = propGroup.querySelectorAll('input:enabled:checked');
          if (enabledChecked.length === 0) {
            const firstEnabled = propGroup.querySelector('input:enabled');
            if (firstEnabled) {
              firstEnabled.checked = true;
              firstEnabled.parentElement?.classList.add('selected');
              // Генерируем событие change
              firstEnabled.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        }
      }
    }
  };

  function catalogControlRelation(propsShow, k) {
    // Получаем атрибут data-relations и разбиваем на массив
    const relationsStr = k.dataset.relations;
    const relations = relationsStr ? relationsStr.split(',').map(s => s.trim()) : [];

    // Обрабатываем каждую связанную опцию
    for (const v of relations) {
      // Инициализируем, если ещё не существует
      if (propsShow[v] === undefined) {
        propsShow[v] = false;
      }

      // Если элемент отмечен (checked)
      if (k.checked) {
        // Определяем значение по умолчанию
        if (k.dataset[v] === undefined || k.dataset[v] === null) {
          propsShow[v] = true;
        } else {
          // Если data-v равно "false" (строка) или элемент disabled — ставим false
          const dataValue = k.dataset[v];
          const isFalse = dataValue === 'false' || dataValue === false;
          propsShow[v] = !(isFalse || k.disabled) ? dataValue : false;
        }
      }
    }
  };

  function catalogInitElementProps(parent, ElementGetPriceFunc) {
		catalogInitResize(parent, ElementGetPriceFunc);
		catalogInitRaspil();
		// catalogElementFacade(parent);
		// catalogInitImage();
		// catalogInitSelect();
	}

  function catalogInitResize(parent, callback) {
    // Устанавливаем callback по умолчанию
    const cb = typeof callback === 'function' ? callback : () => {};

    const sizeEditOpt = document.getElementById('sizeeditopt');

    if (sizeEditOpt) {
      const resizeInputs = document.querySelectorAll('.prop-resize input');
      const sizeOptionalWrap = document.querySelector('.prop-wrap-sizeoptional');

      // Сначала блокируем все поля
      for (const input of resizeInputs) {
        input.disabled = true;
      }

      // Обработчик изменения состояния чекбокса
      sizeEditOpt.addEventListener('change', function () {
        const isChecked = this.checked;

        // Включаем или отключаем поля
        for (const input of resizeInputs) {
          input.disabled = !isChecked;
        }

        // Показываем или скрываем контейнер
        if (sizeOptionalWrap) {
          if (isChecked) {
            sizeOptionalWrap.classList.remove('disable');
            sizeOptionalWrap.style.display = '';
          } else {
            sizeOptionalWrap.classList.add('disable');
            sizeOptionalWrap.style.display = 'none';
          }
        }

        // Инициализируем пропорции (слайдеры, спиннеры и т.д.)
        if (isChecked) {
          catalogInitResizeProp();
        }

        // Вызываем callback
        cb(parent);
      });

    } else {
      // Если #sizeeditopt нет — сразу инициализируем пропорции
      catalogInitResizeProp();
      cb(parent); // всё равно вызываем callback
    }
  };

  function catalogInitResizeProp() {

      // Находим все элементы .prop-resize
      document.querySelectorAll('.prop-resize').forEach(function (e) {
          const type = e.dataset.type;
          const input = e.querySelector('input');

          if (!input) return;

          const elementBtn = document.getElementById('size_edit_' + type);
          const slideElement = document.getElementById('size_edit_' + type + '_slider');

          if (elementBtn) {
              // Если есть кнопки — просто инициализируем как группу (если нужно)
              // В нативном JS buttonset не нужен, если это просто radio-кнопки
              // Можно оставить как есть, если поведение уже работает
              return;
          }

          if (!slideElement) return;

          const min = slideElement.dataset.min ? parseFloat(slideElement.dataset.min) : 0;
          const max = parseFloat(slideElement.dataset.max);
          const step = slideElement.dataset.step ? parseFloat(slideElement.dataset.step) : 1;
          let value = parseFloat(input.value) || min;

          // === 1. Настройка спиннера (input[type=number]) ===
          input.type = 'number';
          input.min = min;
          input.max = max;
          input.step = step;

          // Ограничиваем ввод
          input.addEventListener('change', function () {
              let val = parseFloat(this.value);
              val = catalogControlSize(val, min, max);
              this.value = val;
              // Синхронизируем слайдер
              if (slideElement.value !== val.toString()) {
                  slideElement.value = val;
                  updateValueLabel(val);
              }
              // Триггерим событие
              dispatchEvent(new Event('change', { bubbles: true }));
              catalogControlConditions();
              handleDepthUpdate(val);
          });

          // При вводе (без ожидания blur)
          input.addEventListener('input', function () {
              let val = parseFloat(this.value);
              if (!isNaN(val)) {
                  val = catalogControlSize(val, min, max);
                  slideElement.value = val;
                  updateValueLabel(val);
              }
          });

          // === 2. Настройка слайдера (input[type=range]) ===
          slideElement.type = 'range';
          slideElement.min = min;
          slideElement.max = max;
          slideElement.step = step;
          slideElement.value = value;

          const valSpan = document.querySelector('#size_edit_' + type + '_slider_wrap span.label');
          if (valSpan) {
              valSpan.textContent = value;
          }

          // При создании — обновляем визуал, если глубина
          if (type === 'depth') {
              updateTableHeight(value);
              document.querySelectorAll('#separate_table .onesize .onesize-depth, #one_table .table_wrap .onesize-depth')
                  .forEach(el => el.textContent = value);
          }

          // Функция обновления метки
          function updateValueLabel(v) {
              if (valSpan) {
                  valSpan.textContent = v;
                  valSpan.style.display = 'inline'; // показываем при движении
              }
          }

          // При движении слайдера
          slideElement.addEventListener('input', function () {
              const val = parseFloat(this.value);
              updateValueLabel(val);
              input.value = val;
              handleDepthUpdate(val);
          });

          // При остановке (отпустили мышь)
          slideElement.addEventListener('change', function () {
              const val = parseFloat(this.value);
              if (valSpan) {
                  valSpan.style.display = 'none'; // скрываем
              }
              const corrected = catalogControlSize(val, min, max);
              input.value = corrected;
              input.dispatchEvent(new Event('change', { bubbles: true }));
              catalogControlConditions();
              handleDepthUpdate(corrected);
          });

          // === Вспомогательная функция для обновления визуала при изменении глубины ===
          function handleDepthUpdate(depth) {
              if (type === 'depth') {
                  updateTableHeight(depth);
                  document.querySelectorAll('#separate_table .onesize .onesize-depth, #one_table .table_wrap .onesize-depth')
                      .forEach(el => el.textContent = depth);
              }
          }

          function updateTableHeight(depth) {
              const height = (200 / 600) * depth;
              document.querySelectorAll('#separate_table .table_wrap, #one_table .table_wrap')
                  .forEach(el => el.style.height = height + 'px');
          }
      });
  };

	function catalogControlSize(value, min, max) {
		return (value > max) ? max : (value < min) ? min : value;
	};

  function getElementSize(form) {
    // Находим элементы по name внутри переданного form
    const getValue = (name) => {
        const el = form.querySelector(`[name="${name}"]`);
        return el ? el.value : null;
    };

    return {
        width: getValue('SIZEEDITWIDTH') || getValue('width'),
        height: getValue('SIZEEDITHEIGHT') || getValue('height'),
        depth: getValue('SIZEEDITDEPTH') || getValue('depth')
    };
  };

  function catalogInitRaspil() {
      const slide = document.getElementById('slider');
      if (!slide) return false;

      const min = parseFloat(slide.dataset.min) || 0;
      const max = parseFloat(slide.dataset.max) || 1000;
      const width = parseFloat(slide.dataset.width) || 1000;
      const step = parseFloat(slide.dataset.step) || 10;
      const maxQuantityPath = parseInt(slide.dataset.sepmax) || 4;
      let propil = parseFloat(slide.dataset.propil) || 0;

      // Округление до шага
      function myRound10(val, i) {
          return Math.round(val / i) * i;
      }

      // Запись всех значений в скрытое поле через *
      function setMainInput() {
          const inputs = document.querySelectorAll('.part-raspil .path-container input');
          const values = new Array(maxQuantityPath).fill(0);
          inputs.forEach(input => {
              const id = parseInt(input.dataset.id);
              values[id] = input.value;
          });
          document.getElementById('USLUGIraspil').value = values.join('*');
      }

      // Обновление визуального отображения (таблица)
      function separateTable() {
          document.querySelectorAll('.part-raspil .path-container input').forEach(input => {
              const w = parseInt(input.value) || 0;
              const id = input.dataset.id;
              const bar = document.querySelector(`#separate_table div[data-id-path="${id}"] .table_wrap`);
              const textEl = document.querySelector(`#separate_table div[data-id-path="${id}"] .onesize-width`);
              if (bar) bar.style.width = (w / width * 100) + '%';
              if (textEl) textEl.textContent = w;
          });
      }

      // Создание объекта raspil
      function createObj() {
          raspil = {};
          document.querySelectorAll('.part-raspil .path-container input').forEach(input => {
              const inpID = parseInt(input.dataset.id) + 1;
              raspil[inpID] = input.value;
          });
          for (let i = 1; i <= maxQuantityPath; i++) {
              if (raspil[i] === undefined) raspil[i] = '0';
          }
      }

      // === ИНИЦИАЛИЗАЦИЯ ===
      createObj();
      separateTable();
      setMainInput();

      // Блокируем submit при клике на ручку слайдера
      slide.addEventListener('click', function (e) {
          if (e.target.classList.contains('ui-slider-handle')) {
              e.preventDefault();
          }
      });

      // === ОБНОВЛЕНИЕ ПРИ ДВИЖЕНИИ СЛАЙДЕРА ===
      function displayWidth(ui) {
          const handles = slide.querySelectorAll('.ui-slider-handle');
          const quantity = handles.length;
          const value = ui.value;
          const idElem = parseInt(ui.handle.dataset.id);

          if (quantity === 1) {
              setVal(0, value);
              setVal(1, width - value);
          } else if (quantity === 2) {
              if (idElem === 0) {
                  setVal(0, value);
                  setVal(1, ui.values[1] - value);
              } else if (idElem === 1) {
                  setVal(1, value - ui.values[0]);
                  setVal(2, width - value);
              }
          } else if (quantity === 3) {
              if (idElem === 0) {
                  setVal(0, value);
                  setVal(1, ui.values[1] - value);
              } else if (idElem === 1) {
                  setVal(1, value - ui.values[0]);
                  setVal(2, ui.values[2] - value);
              } else if (idElem === 2) {
                  setVal(2, value - ui.values[1]);
                  setVal(3, width - value);
              }
          }

          function setVal(id, val) {
              const input = document.querySelector(`.path-container[data-id="${id}"] input`);
              if (input) input.value = Math.round(val);
          }

          separateTable();
          createObj();
          setMainInput();
          doChangeProps(document.querySelectorAll('.prop-uslugi input'));
      }

      // Инициализация slider2 (оставляем как есть)
      if (typeof jQuery !== 'undefined' && jQuery().slider2) {
          jQuery(slide).slider2({
              min: min,
              max: max,
              step: step,
              range: false,
              tooltips: false,
              handles: [{ value: Math.round(width / maxQuantityPath) }],
              showTypeNames: true,
              mainClass: 'sleep',
              slide: function (e, ui) {
                  displayWidth(ui);
              }
          });
      }

      // === ДОБАВЛЕНИЕ ЧАСТИ ===
      document.querySelector('.control-part-raspil .add').addEventListener('click', function (e) {
          e.preventDefault();
          const handles = slide.querySelectorAll('.ui-slider-handle');
          const quantityInput = document.querySelectorAll('.part-raspil .path-container').length;
          const addBtn = this;
          const deleteBtn = document.querySelector('.control-part-raspil .delete');

          if (quantityInput >= maxQuantityPath) return;

          // Разблокируем кнопку удаления
          if (deleteBtn.disabled) deleteBtn.disabled = false;

          // Проверка минимального размера
          const minWidth = (width - quantityInput * propil) / (quantityInput + 1);
          if (minWidth < min) {
              addBtn.disabled = true;
              return;
          }

          const widthNewElem = Math.round(minWidth);
          const container = document.createElement('div');
          container.className = 'path-container';
          container.dataset.id = quantityInput;
          container.innerHTML = `
              <div>Часть <span class="path-number">${quantityInput + 1}</span></div>
              <input type="number" step="10" data-id="${quantityInput}" value="${widthNewElem}" class="path-width">
              <div>mm.</div>
          `;
          document.querySelector('.part-raspil').appendChild(container);

          // Перераспределение ширины
          const inputs = document.querySelectorAll('.part-raspil .path-container input');
          let sum = -propil;
          inputs.forEach((input, i) => {
              if (i === inputs.length - 1) {
                  input.value = width - sum - propil;
              } else {
                  sum += widthNewElem + propil;
                  input.value = widthNewElem;
              }
          });

          // Добавляем ручку в slider2
          if (typeof jQuery !== 'undefined' && jQuery().slider2) {
              jQuery(slide).slider2('addHandle', { value: widthNewElem });
          }

          // Обновляем позиции
          updateSliderValues();

          createObj();
          setMainInput();
          doChangeProps(document.querySelectorAll('.prop-uslugi input'));
          document.querySelector(`#separate_table div[data-id-path="${quantityInput}"]`).style.display = 'block';
          catalogElementGetPrice(document.querySelector(".main__product .product__wrapper"));
          separateTable();

          if (quantityInput + 1 >= maxQuantityPath) {
              addBtn.disabled = true;
          }
      });

      // === УДАЛЕНИЕ ЧАСТИ ===
      document.querySelector('.control-part-raspil .delete').addEventListener('click', function (e) {
          e.preventDefault();
          const containers = document.querySelectorAll('.part-raspil .path-container');
          const lastContainer = containers[containers.length - 1];
          const lastInput = lastContainer.querySelector('input');
          const prevInput = containers[containers.length - 2]?.querySelector('input');
          if (!prevInput) return;

          const newWidth = parseInt(prevInput.value) + parseInt(lastInput.value) + propil;
          prevInput.value = newWidth;

          lastContainer.remove();

          // Удаляем ручку из slider2
          if (typeof jQuery !== 'undefined' && jQuery().slider2) {
              jQuery(slide).slider2('removeHandle', containers.length - 1);
          }

          updateSliderValues();

          const currentInputs = document.querySelectorAll('.part-raspil .path-container input');
          if (currentInputs.length <= 2) {
              this.disabled = true;
          }
          document.querySelector('.control-part-raspil .add').disabled = false;

          createObj();
          setMainInput();
          doChangeProps(document.querySelectorAll('.prop-uslugi input'));
          document.querySelector(`#separate_table div[data-id-path="${containers.length - 1}"]`).style.display = 'none';
          catalogElementGetPrice(document.querySelector(".main__product .product__wrapper"));
          separateTable();
      });

      // === РУЧНОЙ ВВОД В ИНПУТЫ ===
      function changeInpS() {
          document.querySelectorAll('.part-raspil .path-container input').forEach(input => {
              input.removeEventListener('change', inputChangeHandler);
              input.addEventListener('change', inputChangeHandler);
          });
      }

      function inputChangeHandler() {
          const input = this;
          const partRaspil = input.closest('.part-raspil');
          const inputs = partRaspil ? partRaspil.querySelectorAll('input') : [];
          const quantity = inputs.length;
          const targetID = parseInt(input.dataset.id);
          let val = parseInt(input.value);

          if (isNaN(val) || val < min) {
              toastr?.warning(`Часть ${targetID + 1} слишком мала. Минимум: ${min} мм.`);
              input.value = min;
              val = min;
          }

          // Пересчитываем общую сумму
          let total = 0;
          inputs.forEach(inp => total += parseInt(inp.value) || 0);
          const diff = (width - (quantity - 1) * propil) - total;

          if (diff !== 0 && quantity > 1) {
              if (targetID < quantity - 1) {
                  const next = inputs[targetID + 1];
                  const newVal = (parseInt(next.value) + diff);
                  if (newVal >= min) {
                      next.value = newVal;
                  } else {
                      toastr?.warning('Соседняя часть слишком мала.');
                      input.value = parseInt(input.value) - diff;
                  }
              } else {
                  const prev = inputs[targetID - 1];
                  const newVal = (parseInt(prev.value) + diff);
                  if (newVal >= min) {
                      prev.value = newVal;
                  } else {
                      toastr?.warning('Соседняя часть слишком мала.');
                      input.value = parseInt(input.value) - diff;
                  }
              }
          }

          updateSliderValues();
          createObj();
          setMainInput();
          doChangeProps(document.querySelectorAll('.prop-uslugi input'));
          separateTable();
      }

      function updateSliderValues() {
          const inputs = document.querySelectorAll('.part-raspil .path-container input');
          let sum = 0;
          inputs.forEach((input, idx) => {
              const id = parseInt(input.dataset.id);
              const w = parseInt(input.value) || 0;
              sum += w;
              if (typeof jQuery !== 'undefined' && jQuery().slider2) {
                  jQuery(slide).slider2('values', id, sum);
              }
          });
      }

      // === ЗАПРЕТ НЕЧИСЛОВОГО ВВОДА ===
      document.addEventListener('keydown', function (e) {
          const input = e.target;
          if (!input.classList.contains('path-width')) return;
          if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
              e.preventDefault();
          }
      });

      // Инициализация обработчиков
      changeInpS();
      document.querySelectorAll('.part-raspil .path-container input').forEach(input => {
          input.addEventListener('change', inputChangeHandler);
      });
  };

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




