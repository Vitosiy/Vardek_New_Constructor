// "use strict";

// (function (factory) {
//   if (typeof define === "function" && define.amd) {
//     define(["../widgets/datepicker"], factory);
//   } else {
//     factory(jQuery.datepicker);
//   }
// })(function (datepicker) {
//   datepicker.regional.ru = {
//     closeText: "Закрыть",
//     prevText: "&#x3C;Пред",
//     nextText: "След&#x3E;",
//     currentText: "Сегодня",
//     monthNames: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
//     monthNamesShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
//     dayNames: ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
//     dayNamesShort: ["вск", "пнд", "втр", "срд", "чтв", "птн", "сбт"],
//     dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
//     weekHeader: "Нед",
//     dateFormat: "dd.mm.yy",
//     firstDay: 1,
//     isRTL: false,
//     showMonthAfterYear: false,
//     yearSuffix: ""
//   };
//   datepicker.setDefaults(datepicker.regional.ru);
//   return datepicker.regional.ru;
// });

function CatalogApp() {
  var self = this;
  var apiPath = '/ajax';
  this.minBasketTimer = 0;
  this.UpMenuTimer = 0;
  this.getPriceTimer = 0;
  this.productIsInit = false;

  this.start = function () {
    self.initCallBackForm();
    self.initEvents();
    self.initOrderDatePicker();
    self.catalogInitProduct(document.querySelectorAll(".main__product .product__wrapper"), self.catalogElementGetPrice, self.catalogAddToBasket);
  };

  this.initEvents = function () {
    document.addEventListener("click", function(e) {
      // Обработка кликов по вкладкам каталога
      if (e.target.closest(".catalog-collections .tabs-title li a")) {
        var link = e.target.closest(".catalog-collections .tabs-title li a");
        var parent = link.parentElement;
        var index = Array.from(parent.parentElement.children).indexOf(parent);
        
        var activeElements = document.querySelectorAll(".catalog-collections .tabs-title .active");
        activeElements.forEach(function(el) {
          el.classList.remove("active");
        });
        
        parent.classList.add("active");
        
        var tabContents = document.querySelectorAll(".catalog-collections .tabs-content .tab-content");
        tabContents.forEach(function(content) {
          content.style.display = "none";
        });
        
        tabContents[index].style.display = "block";
        e.preventDefault();
      }
      
      // Обработка кликов по вкладкам элемента каталога
      else if (e.target.closest(".catalog-element .lists .tabs a")) {
        var link = e.target.closest(".catalog-element .lists .tabs a");
        var parent = link.parentElement;
        var index = Array.from(parent.parentElement.children).indexOf(parent);
        
        var currentElements = document.querySelectorAll(".catalog-element .lists .tabs li.current");
        currentElements.forEach(function(el) {
          el.classList.remove("current");
        });
        
        parent.classList.add("current");
        
        var tabContents = document.querySelectorAll(".catalog-element .lists .tabs-content .tab-content");
        tabContents.forEach(function(content) {
          content.style.display = "none";
        });
        
        tabContents[index].style.display = "block";
        e.preventDefault();
      }
      
      // Обработка удаления из корзины
      else if (e.target.closest(".basket-wrap .basket .delete, .basket__remove")) {
        if (!confirm("Вы действительно хотите удалить из корзины этот товар?")) {
          e.preventDefault();
        }
      }
      
      // Обработка кнопок минус/плюс в корзине
      else if (e.target.closest(".basket-wrap .basket .quantity .minus, .basket__button-cnt--minus")) {
        var input = e.target.closest('.input-group').querySelector("input");
        var v = parseInt(input.value) - 1;
        if (v < 1) v = 1;
        input.value = v;
        self.catalogBasketItemQuantityUpdate(input.getAttribute("_id"), input.value);
        e.preventDefault();
      }
      else if (e.target.closest(".basket-wrap .basket .quantity .plus, .basket__button-cnt--plus")) {
        var input = e.target.closest('.input-group').querySelector("input");
        var v = parseInt(input.value) + 1;
        input.value = v;
        self.catalogBasketItemQuantityUpdate(input.getAttribute("_id"), input.value);
        e.preventDefault();
      }
      
      // Обработка кнопки добавления в корзину
      else if (e.target.closest(".product__cart-button")) {
        self.catalogAddToBasket(e);
        e.preventDefault();
      }
      
      // Обработка кнопки информации
      else if (e.target.closest(".windowinfo-btn")) {
        e.preventDefault();
      }
    });

    // Обработка изменения количества в корзине
    document.addEventListener("blur", function(e) {
      if (e.target.closest(".basket-wrap .basket .quantity input, .basket__button-cnt--center")) {
        var input = e.target.closest("input");
        var v = parseInt(input.value) || 1;
        if (v < 1) v = 1;
        input.value = v;
        self.catalogBasketItemQuantityUpdate(input.getAttribute("_id"), input.value);
      }
    });

    // Обработка изменения опций доставки
    document.addEventListener("change", function(e) {
      if (e.target.closest(".shipping_expedited input")) {
        var checkbox = e.target;
        if (checkbox.checked) {
          self.initOrderDatePicker(checkbox.dataset.shipmentStart, checkbox.dataset.shipmentPeriod);
        } else {
          self.initOrderDatePicker();
        }
      }
      
      // Обработка изменения опций в корзине
      else if (e.target.closest(".basket-wrap .basket .options input")) {
        var checkbox = e.target;
        var group = checkbox.getAttribute("_groups").split(",");
        
        if (checkbox.checked) {
          if (group.length == 2) {
            document.querySelectorAll(".basket-wrap .basket .options input:checked").forEach(function(el) {
              if (el.value != checkbox.value) {
                var this_group = el.getAttribute("_groups").split(",");
                if (this_group.length == 1) {
                  for (var i in group) {
                    if (group[i] == this_group[0]) {
                      el.checked = false;
                      break;
                    }
                  }
                }
              }
            });
          } else {
            document.querySelectorAll(".basket-wrap .basket .options input:checked").forEach(function(el) {
              if (el.value != checkbox.value) {
                var this_group = el.getAttribute("_groups").split(",");
                for (var i in this_group) {
                  if (this_group[i] == group[0]) {
                    el.checked = false;
                    break;
                  }
                }
              }
            });
          }
          
          self.catalogBasketOptionsChange(checkbox.value, true);
        } else {
          self.catalogBasketOptionsChange(checkbox.value, false);
        }
      }
    });

    // Настройка toastr
    if (typeof toastr !== 'undefined') {
      toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "3000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
      };
    }
  };

  this.catalogAddToBasket = function (e) {
    var form = e.currentTarget.closest(".product__wrapper").querySelector(".product__form");
    var formData = new FormData(form);
    
    var xhr = new XMLHttpRequest();
    xhr.open("POST", apiPath + "/API/catalog.element.addtobasket.php", true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        var msg = JSON.parse(xhr.responseText);
        if (msg && msg.type == 'error') {
          self.toastmessage(msg.data, 'error');
        } else {
          var popups = document.querySelectorAll(".popup-wrap");
          popups.forEach(function(popup) {
            popup.style.display = "none";
          });
          self.catalogBasketUpdate(true);
          self.toastmessage('Товар успешно добавлен в корзину.', "success");
        }
      }
    };
    
    var params = new URLSearchParams();
    for (var pair of formData.entries()) {
      params.append(pair[0], pair[1]);
    }
    
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params.toString());
  };

  this.catalogInitProduct = function (parent, ElementGetPriceFunc, addToBasketFunc) {
    if (!self.productIsInit) {
      self.catalogInitEvent(ElementGetPriceFunc, addToBasketFunc);
    }

        // Преобразуем parent в первый элемент, если это коллекция
    var parentElement = (parent instanceof NodeList || Array.isArray(parent)) ? parent[0] : parent;

    self.catalogInitElementProps(parentElement, ElementGetPriceFunc);
    ElementGetPriceFunc(parentElement);
  };

  this.doChangeProps = function (elem) {
    var id = elem.id;
    var propsShow = {};
    var prop_parent = elem.closest('.values');
    var root_prop_parent = elem.closest('.prop');
    var form_parent = elem.closest('.product__form');
    var enableForm = {};
    var disableProp = [];
    var isseparate = !!document.querySelector('input[data-isseparate="1"]:checked');
    var recall = false;

    if (elem.checked) {
      // Если есть доп-картинка
      if (elem.getAttribute("_preview")) {
        var currentPreview = document.querySelector(".prop-facades .current a");
        var currentImg = document.querySelector(".prop-facades .current img");
        var currentName = document.querySelector(".prop-facades .current .name");
        
        if (currentPreview) currentPreview.href = elem.parentElement.getAttribute("_pic");
        if (currentImg) currentImg.src = elem.getAttribute("_preview");
        if (currentName) currentName.innerHTML = elem.getAttribute("_preview_name");
      }
    }

    // Если есть основная картинка
    if (elem.dataset.image) {
      var previewImg = document.querySelector('.product__form .preview img');
      var previewLink = document.querySelector('.product__form .preview .image');
      if (previewImg) previewImg.src = elem.dataset.image;
      if (previewLink) previewLink.href = elem.dataset.imagebig;
    }

    // Если назначены группы переключений
    if (elem.dataset.groupRadio) {
      var strRadio = elem.dataset.groupRadio;
      var group_radio = typeof strRadio == 'number' ? [strRadio] : strRadio.split(',');
      
      group_radio.forEach(function(v) {
        if (elem.checked) {
          var inputs = prop_parent.querySelectorAll("[data-group-radio*='" + v + "']");
          inputs.forEach(function(input) {
            if (input != elem) input.checked = false;
          });
        }
      });
    }

    // Обработка всех input и select в форме
    var inputs = form_parent.querySelectorAll("input, select");
    inputs.forEach(function(input) {
      // Если включена доп. форма
      var formAction = input.dataset.formAction;
      console.log('formAction', formAction);
      if (formAction) {
        var form = form_parent.querySelector("." + formAction);
        var hide = form_parent.querySelector(".hide-" + formAction);
        
        if (input.checked && !input.disabled) {
          input.parentElement.classList.add("selected");
          
          if (formAction) {
            enableForm[formAction] = true;
            if (form) form.style.display = "block";
            if (hide) hide.style.display = "none";
            
            var formInputs = form.querySelectorAll("input, select");
            formInputs.forEach(function(formInput) {
              formInput.disabled = false;
            });
            
            var hideInputs = hide.querySelectorAll("input, select");
            hideInputs.forEach(function(hideInput) {
              hideInput.disabled = true;
            });
          }

          if (input.dataset.groupDisable) {
            disableProp = disableProp.concat(input.dataset.groupDisable.split(","));
          }
        } else if (enableForm[formAction] != true || enableForm[formAction] == undefined) {
          input.parentElement.classList.remove("selected");
          
          if (formAction) {
            if (form) form.style.display = "none";
            if (hide) hide.style.display = "block";
            
            var formInputs = form.querySelectorAll("input, select");
            formInputs.forEach(function(formInput) {
              formInput.disabled = true;
            });
            
            var hideInputs = hide.querySelectorAll("input, select");
            hideInputs.forEach(function(hideInput) {
              hideInput.disabled = false;
            });
          }
        }
      }
    });

    // Обработка услуг
    if (form_parent.querySelector(".prop-uslugi")) {
      inputs.forEach(function(input) {
        var k_prop_parent = input.closest('.values');
        var k_root_prop_parent = k_prop_parent ? k_prop_parent.closest('.prop') : null;

        if (k_root_prop_parent) {
          var shouldDisable = false;
          
          if (isseparate && (input.dataset.separated === undefined || input.dataset.separated == 0) && 
              (k_prop_parent.dataset.align && (!input.dataset.relationsWidth || 
               eval(input.dataset.relationsWidth.split('#W#').join(self.raspil[k_prop_parent.dataset.align]))) && 
              (!input.dataset.relationsDepth || document.getElementById('size_edit_depth_input') && 
               eval(input.dataset.relationsDepth.split('#D#').join(document.getElementById('size_edit_depth_input').value))) || 
              !k_prop_parent.dataset.align)) {
            shouldDisable = false;
          } else if (!isseparate && !(k_prop_parent.dataset.align && input.dataset.separated == 0) && 
                     (!input.dataset.relationsDepth || document.getElementById('size_edit_depth_input') && 
                      eval(input.dataset.relationsDepth.split('#D#').join(document.getElementById('size_edit_depth_input').value)))) {
            shouldDisable = false;
          } else {
            shouldDisable = true;
          }

          if (input.dataset.group && disableProp.indexOf(input.dataset.group) != -1) {
            shouldDisable = true;
          }

          if (!shouldDisable) {
            input.disabled = false;
            if (input.parentElement.tagName == 'LI') input.parentElement.style.display = "list-item";
            
            if (input.dataset.class && input.checked) {
              var target = k_prop_parent.dataset.target;
              if (target) {
                var targetElements = document.querySelectorAll(target);
                targetElements.forEach(function(el) {
                  el.classList.add(input.dataset.class);
                });
              }
              self.activateWidthSetting(input);
            } else {
              var target = k_prop_parent.dataset.target;
              if (target) {
                var targetElements = document.querySelectorAll(target);
                targetElements.forEach(function(el) {
                  el.classList.remove(input.dataset.class);
                });
              }
              self.deactivateWidthSetting(input);
            }
          } else {
            input.disabled = true;
            if (input.parentElement.tagName == 'LI') input.parentElement.style.display = "none";
            
            if (input.dataset.class) {
              var target = k_prop_parent.dataset.target;
              if (target) {
                var targetElements = document.querySelectorAll(target);
                targetElements.forEach(function(el) {
                  el.classList.remove(input.dataset.class);
                });
              }
            }
            self.deactivateWidthSetting(input);
          }
        }
      });
    }

    // Активация ширины еврозапила
    function activateWidthSetting(elem) {
      var parentUslugi = elem.closest('.prop-uslugi');
      if (!parentUslugi) return;
      
      var widthSettingElem = parentUslugi.querySelector('input[data-parent-id="' + elem.value + '"]');
      if (!widthSettingElem) return;
      
      widthSettingElem.disabled = false;
      var itemWidthSetting = widthSettingElem.closest('.item-width-setting');
      if (itemWidthSetting) itemWidthSetting.style.display = "block";
      widthSettingElem.classList.add('active');
      
      var defaultWidth = 600,
          step = 10,
          anotherShow = 0,
          anotherID = false,
          raspilKey = elem.closest('.values').dataset.align > 0 ? elem.closest('.values').dataset.align : false,
          idInput = raspilKey - 1,
          valInp = widthSettingElem.value,
          freeSpace;
      
      if (raspilKey) {
        var pathWidth = document.querySelector('.path-width[data-id="' + idInput + '"]');
        freeSpace = pathWidth ? pathWidth.value : document.querySelector('input[name="width"]').value;
      } else {
        freeSpace = document.querySelector('input[name="width"]').value;
      }
      
      valInp = parseInt(valInp);
      freeSpace = parseInt(freeSpace);

      if (valInp <= step || isNaN(valInp)) {
        valInp = step;
      }

      // Ищем соседний элемент еврозапила если он есть
      var listWidthSetting = widthSettingElem.closest('.list-width-setting');
      if (listWidthSetting) {
        var inputs = listWidthSetting.querySelectorAll('input');
        inputs.forEach(function(input) {
          if (input.dataset.parentId != widthSettingElem.dataset.parentId && !input.disabled && input.classList.contains('active')) {
            anotherID = input.dataset.parentId;
            anotherShow = parseInt(input.value);
          }
        });
      }
      
      freeSpace = freeSpace - anotherShow;

      if (freeSpace < valInp + step) {
        valInp = freeSpace - step;
      }

      if (valInp <= 0 && anotherID !== false) {
        valInp = step;
        anotherShow = anotherShow - step;

        if (anotherShow < step) {
          deactivateWidthSetting(elem);
          elem.disabled = true;
          if (elem.parentElement.tagName == 'LI') elem.parentElement.style.display = "none";
          
          if (elem.dataset.class) {
            var target = elem.closest('.values').dataset.target;
            if (target) {
              var targetElements = document.querySelectorAll(target);
              targetElements.forEach(function(el) {
                el.classList.remove(elem.dataset.class);
              });
            }
          }
        } else {
          var anotherInput = listWidthSetting.querySelector('input[data-parent-id="' + anotherID + '"]');
          if (anotherInput) anotherInput.value = anotherShow;
        }
      }

      widthSettingElem.value = valInp;
    }

    // Деактивация ширины еврозапила
    function deactivateWidthSetting(elem) {
      var parentUslugi = elem.closest('.prop-uslugi');
      if (!parentUslugi) return;
      
      var widthSettingElem = parentUslugi.querySelector('input[data-parent-id="' + elem.value + '"]');
      if (!widthSettingElem) return;
      
      widthSettingElem.disabled = true;
      var itemWidthSetting = widthSettingElem.closest('.item-width-setting');
      if (itemWidthSetting) itemWidthSetting.style.display = "none";
      widthSettingElem.classList.remove('active');
    }

    // Проверка на опции алрамки
    var onlyOpt = form_parent.querySelector('input[data-opt-specific="true"]');
    if (onlyOpt && onlyOpt.value) {
      var onlyOptVal = onlyOpt.dataset.optFasade;
      var notWithOpt = onlyOpt.dataset.optNotwith;

      if (onlyOptVal) {
        // Проверяет с чем включать
        var optList = onlyOptVal.toString().includes(',') ? onlyOptVal.split(',') : [onlyOptVal];
        var isOptChecked = false;
        
        optList.forEach(function(item) {
          var input = form_parent.querySelector("input[value='" + item + "']");
          if (input && input.checked) {
            isOptChecked = true;
          }
        });

        if (isOptChecked) {
          var arrGroup = [];
          
          form_parent.querySelectorAll('input[data-opt-specific="true"]').forEach(function(v) {
            if (elem.getAttribute('name') == 'OPTION[]') {
              if (elem.checked === false && elem.getAttribute('data-opt-specific') == 'true') {
                elem.checked = true;
              }
            } else {
              if (arrGroup.indexOf(v.getAttribute('data-group-radio')) == -1) {
                arrGroup.push(v.getAttribute('data-group-radio'));
                v.checked = true;
              } else {
                v.checked = false;
              }
            }
            
            var label = v.closest('label');
            if (label) label.style.display = "block";
          });

          if (notWithOpt) {
            var notWithList = typeof notWithOpt == 'string' ? notWithOpt.split(',') : [notWithOpt];
            
            notWithList.forEach(function(item) {
              var input = form_parent.querySelector("input[value='" + item + "']");
              if (input) {
                input.checked = false;
                var label = input.closest('label');
                if (label) label.style.display = "none";
              }
            });
          }
        } else {
          form_parent.querySelectorAll('input[data-opt-specific="true"]').forEach(function(input) {
            input.checked = false;
            var label = input.closest('label');
            if (label) label.style.display = "none";
          });

          if (notWithOpt) {
            var notWithList = typeof notWithOpt == 'string' ? notWithOpt.split(',') : [notWithOpt];
            
            notWithList.forEach(function(item) {
              var input = form_parent.querySelector("input[value='" + item + "']");
              if (input) {
                var label = input.closest('label');
                if (label) label.style.display = "block";
              }
            });
          }
        }
      }
    }

    // Проверка заполнения
    if (form_parent.querySelector("[data-filling]") && form_parent.querySelector("input[name='FILLING']")) {
      var fillVal = form_parent.querySelector('input[name="FILLING"]:checked').value;
      
      form_parent.querySelectorAll("[data-filling]").forEach(function(fillRel) {
        if (fillRel.dataset.filling) {
          var shouldDisable = false;
          
          if (typeof fillRel.dataset.filling == 'number' && fillVal == fillRel.dataset.filling || 
              typeof fillRel.dataset.filling == 'string' && fillRel.dataset.filling.indexOf(fillVal) != -1) {
            shouldDisable = false;
          } else {
            shouldDisable = true;
          }
          
          fillRel.disabled = shouldDisable;
          if (fillRel.parentElement.tagName == 'LI') {
            fillRel.parentElement.style.display = shouldDisable ? "none" : "list-item";
          }
        }
      });
    }

    // Обработка отношений
    form_parent.querySelectorAll("input[data-relations]").forEach(function(input) {
      self.catalogControlRelation(propsShow, input);
    });
    
    self.catalogControlConditions();
    
    // Применение свойств
    Object.keys(propsShow).forEach(function(k) {
      var rel = form_parent.querySelector('.prop-' + k);
      if (!rel) return;
      
      var relEnable = rel.dataset.enable;
      if (relEnable == 'false') {
        if (propsShow[k]) {
          rel.classList.remove('disable');
          
          if (propsShow[k] === true) {
            rel.querySelectorAll('input, select').forEach(function(el) {
              el.disabled = false;
              if (el.parentElement.tagName == 'LI') el.parentElement.style.display = "list-item";
            });
          } else if (propsShow[k] == 'hide') {
            rel.classList.add('disable');
            rel.querySelectorAll('input, select').forEach(function(el) {
              el.disabled = true;
              el.checked = false;
              el.parentElement.classList.remove('selected');
            });
          } else {
            var enablePropVals = propsShow[k].toString().split(',');
            rel.querySelectorAll('input, select').forEach(function(el) {
              var selectFasade = form_parent.querySelector("input[name='SELECTFASADE']:checked");
              
              if (selectFasade && selectFasade.value >= 1 && k == 'fasade_type') {
                var fasadeNumber = selectFasade.value;
                var fasadeType = form_parent.querySelector("input[name='TYPE_FASADE" + fasadeNumber + "']").value;
                var arrFasadeType = fasadeType.toString().split(',');
                
                if (enablePropVals.indexOf(el.value) == -1 || arrFasadeType.indexOf(el.value) == -1) {
                  el.disabled = true;
                  el.checked = false;
                  el.parentElement.classList.remove('selected');
                  if (el.parentElement.tagName == 'LI') el.parentElement.style.display = "none";
                } else {
                  el.disabled = false;
                  if (el.parentElement.tagName == 'LI') el.parentElement.style.display = "list-item";
                }
              } else {
                if (enablePropVals.indexOf(el.value) == -1) {
                  el.disabled = true;
                  el.checked = false;
                  el.parentElement.classList.remove('selected');
                  if (el.parentElement.tagName == 'LI') el.parentElement.style.display = "none";
                } else {
                  el.disabled = false;
                  if (el.parentElement.tagName == 'LI') el.parentElement.style.display = "list-item";
                }
              }
            });
          }
          
          var first = rel.querySelector('input:enabled:not([aria-label="Search"])');
          if (!rel.querySelector('input:checked:enabled') && first) {
            first.checked = true;
            first.parentElement.classList.add('selected');
            recall = true;
          }
        } else {
          rel.classList.add('disable');
          rel.querySelectorAll('input, select').forEach(function(el) {
            el.disabled = true;
            el.checked = false;
            el.parentElement.classList.remove('selected');
          });
        }
      }
    });

    // Проверка фасада
    var noFasadeChecked = form_parent.querySelector('input:checked[data-no_fasade="1"]');
    if (noFasadeChecked) {
      var facadeChecked = form_parent.querySelector('input:checked[name="FACADE"]');
      if (facadeChecked && facadeChecked.dataset.type != 'no_fasade') {
        var noFacadeInput = form_parent.querySelector("input[name='FACADE'][data-type='no_fasade']");
        if (noFacadeInput) noFacadeInput.checked = true;
      }
      
      var propFacades = form_parent.querySelector('.prop-facades');
      if (propFacades) propFacades.classList.add('disable');
    } else {
      var propFacades = form_parent.querySelector('.prop-facades');
      if (propFacades) propFacades.classList.remove('disable');
    }

    // Проверка механизма
    if (form_parent.querySelector("input[name='MECHANISM']")) {
      var activeFasade = form_parent.querySelector('input[name="FACADE"]:checked');
      var typeFasade = activeFasade ? activeFasade.getAttribute('data-type') : null;
      var mechanismList = form_parent.querySelectorAll("input[name='MECHANISM']");

      if (typeFasade == 'no_fasade') {
        self.deactivateMechanism(mechanismList);
      } else {
        self.controlMechanism(activeFasade, mechanismList);
      }
    }

    // Проверка витрины
    if (form_parent.querySelector("input[name='SHOWCASE']")) {
      var activeFasade = form_parent.querySelector('input[name="FACADE"]:checked');
      var typeFasade = activeFasade ? activeFasade.getAttribute('data-type') : null;
      var activeShowCase = form_parent.querySelector('input[name="SHOWCASE"]:checked');
      var showCaseList = form_parent.querySelectorAll("input[name='SHOWCASE']");

      if (typeFasade == 'no_fasade') {
        self.deactivateShowCase(showCaseList);
      } else {
        var showCase = activeFasade.getAttribute('data-type_showcase');
        if (showCase === undefined) {
          self.deactivateShowCase(showCaseList);
        } else {
          var arrShowCase = activeFasade.getAttribute('data-type_showcase').split(',');
          var e = arrShowCase.indexOf(activeShowCase.value);
          if (e < 0) {
            self.deactivateShowCase(showCaseList);
          }
        }
      }
    }

    // Проверка глубины соединения
    var joinDepth = form_parent.querySelector("input[name='SIZEEDITJOINDEPTH']");
    if (joinDepth) {
      var widthFrame = form_parent.querySelector("input[name='SIZEEDITWIDTH']");
      var _min = parseInt(joinDepth.getAttribute('data-min'));
      var _max = parseInt(joinDepth.getAttribute('data-max'));
      var joinDepthVal = parseInt(joinDepth.value);
      var detected = false;
      var typeFasade = form_parent.querySelector('input[name="FACADE"]:checked').getAttribute('data-type');

      for (var changeMax = _max; changeMax >= _min; changeMax--) {
        detected = self.expressionsReplace(joinDepth.getAttribute('data-incl-cond'), {
          '#X#': widthFrame.value,
          '#SIZEEDITJOINDEPTH#': changeMax
        });
        detected = eval(detected);

        if (detected) {
          break;
        }
      }

      if (typeFasade == 'no_fasade') {
        joinDepth.disabled = true;
      }

      if (detected) {
        var objSld = {
          'detected': false
        };

        if (changeMax <= _max) {
          objSld['max'] = changeMax;
          objSld.detected = true;
        }

        if (changeMax < joinDepthVal) {
          joinDepthVal = changeMax;
          objSld['value'] = changeMax;
          joinDepth.value = changeMax;
          objSld.detected = true;
        }

        var condition = self.expressionsReplace(form_parent.querySelector("input[name='condition']").getAttribute('width'), {
          '#X#': widthFrame.value,
          '#SIZEEDITJOINDEPTH#': joinDepthVal
        });
        condition = eval(condition);
        
        var fasadeWidthElements = form_parent.querySelectorAll(".fasade_width");
        fasadeWidthElements.forEach(function(el) {
          el.textContent = condition;
        });

        if (objSld.detected) {
          var slideElement = document.getElementById("size_edit_joindepth_slider");
          if (slideElement && slideElement.slider) {
            slideElement.slider(objSld);
          }
        }

        joinDepth.disabled = false;
        var propResize = joinDepth.closest('.prop-resize');
        if (propResize) propResize.style.display = "block";
      } else {
        joinDepth.disabled = true;
        var propResize = joinDepth.closest('.prop-resize');
        if (propResize) propResize.style.display = "none";
      }
    }

    // Проверка фасада и размеров
    if (form_parent.querySelector("input[name='FACADE']") && form_parent.querySelector("input[name='IGNORE_SIZE']").value != '1') {
      var widthInput = form_parent.querySelector("input[name='SIZEEDITWIDTH']");
      var width = widthInput ? widthInput.value : form_parent.querySelector('input[name="width"]').value;
      
      var heightInput = form_parent.querySelector("input[name='SIZEEDITHEIGHT']");
      var height = heightInput ? heightInput.value : form_parent.querySelector('input[name="height"]').value;
      
      width = parseInt(width);
      height = parseInt(height);

      var conditionInput = form_parent.querySelector('input[name="condition"]');
      if (conditionInput && conditionInput.getAttribute('width') != '') {
        var formulaWidth = conditionInput.getAttribute('width');

        var joinDepthInput = form_parent.querySelector('input[name="SIZEEDITJOINDEPTH"]');
        if (joinDepthInput) {
          formulaWidth = formulaWidth.split('#SIZEEDITJOINDEPTH#').join(joinDepthInput.value);
        }

        var depthInput = form_parent.querySelector('input[name="depth"]');
        if (depthInput) {
          formulaWidth = formulaWidth.split('#Z#').join(depthInput.value);
        }

        formulaWidth = formulaWidth.split('#X#').join(width);
        width = eval(formulaWidth);
        width = parseInt(width);
      }

      if (conditionInput && conditionInput.getAttribute('height') != '') {
        height = eval(conditionInput.getAttribute('height').split('#Y#').join(height));
        height = parseInt(height);
      }

      var defaultElem = form_parent.querySelector('.prop-facades input:first-child');
      var selectedElem = form_parent.querySelector('.prop-facades input[type="radio"]:checked');
      
      var selectedElemWidth = selectedElem ? parseInt(selectedElem.getAttribute('max-width')) : 0;
      var selectedElemHeight = selectedElem ? parseInt(selectedElem.getAttribute('max-height')) : 0;
      var selectedElemMinHeight = selectedElem ? parseInt(selectedElem.getAttribute('min-height')) : 0;
      var selectedElemMinWidth = selectedElem ? parseInt(selectedElem.getAttribute('min-width')) : 0;

      if (selectedElem && (selectedElemWidth < width || selectedElemHeight < height || 
          isNaN(selectedElemMinHeight) || isNaN(selectedElemMinWidth) || 
          selectedElemMinWidth > width || selectedElemMinHeight > height)) {
        if (defaultElem) {
          defaultElem.checked = true;
          defaultElem.closest('label').classList.add('selected');
        }
        if (selectedElem) {
          selectedElem.closest('label').classList.remove('selected');
        }
      }

      form_parent.querySelectorAll('.prop-facades .group-values input').forEach(function(input) {
        var sizeCheckWidth = input.getAttribute('max-width');
        var sizeCheckHeight = input.getAttribute('max-height');
        var sizeCheckMinHeight = input.getAttribute('min-height');
        var sizeCheckMinWidth = input.getAttribute('min-width');

        if (sizeCheckWidth !== undefined && sizeCheckHeight !== undefined) {
          sizeCheckWidth = parseInt(sizeCheckWidth);
          sizeCheckHeight = parseInt(sizeCheckHeight);

          var shouldHide = false;
          
          if ((sizeCheckWidth < width || sizeCheckHeight < height) && 
              (sizeCheckMinHeight === undefined && sizeCheckMinHeight === undefined)) {
            shouldHide = true;
          } else if ((sizeCheckWidth < width || sizeCheckHeight < height || 
                     sizeCheckMinWidth > width || sizeCheckMinHeight > height)) {
            shouldHide = true;
          }

          var li = input.closest('li');
          if (li) {
            if (shouldHide) {
              li.classList.add('hiden-fasade');
              input.classList.add('err');
              input.disabled = true;
            } else {
              li.classList.remove('hiden-fasade');
              input.classList.remove('err');
              input.disabled = false;
            }
          }
        }
      });

      form_parent.querySelectorAll('.prop-facades .group').forEach(function(group) {
        var inputs = group.querySelectorAll('input');
        var errInputs = group.querySelectorAll('input.err');
        
        if (inputs.length == errInputs.length) {
          group.style.display = "none";
        } else {
          group.style.display = "block";
        }
      });
    }

    // Обновление распила
    var sawPropil = 20;
    var raspilVert = document.getElementById("raspilVert");
    if (raspilVert) {
      var widthInput = form_parent.querySelector("input[name='SIZEEDITWIDTH']");
      if (widthInput) {
        var value = parseInt(widthInput.value) / 2 - sawPropil / 2;
        if (value > 0) {
          raspilVert.textContent = '(' + value + ' + ' + value + ')';
        }
      }
    }

    var raspilHor = document.getElementById("raspilHor");
    if (raspilHor) {
      var heightInput = form_parent.querySelector("input[name='SIZEEDITHEIGHT']");
      if (heightInput) {
        var value = parseInt(heightInput.value) / 2 - sawPropil / 2;
        if (value > 0) {
          raspilHor.textContent = '(' + value + ' + ' + value + ')';
        }
      }
    }

    // Обновление выбранного фасада
    var selectFasade = form_parent.querySelector("input[name='SELECTFASADE']:checked");
    if (selectFasade && parseInt(selectFasade.value) >= 1) {
      var numberElem = selectFasade.value;
      var arrType = ['FACADE','MILLING','PALETTE','FASADETYPE','PATINA','GLASS'];
      var name = {
        FACADE: 'Цвет фасада',
        MILLING: 'Фрезеровка',
        PALETTE: 'Цвет палитры',
        FASADETYPE: 'Тип фасада',
        PATINA: 'Патина',
        GLASS: 'Стекло'
      };
      var text = '';

      arrType.forEach(function(type) {
        var typeVal;
        if (type == 'PALETTE') {
          var select = form_parent.querySelector("select:enabled[name='" + type + "'] option:selected");
          if (select) {
            typeVal = select.value;
            text += name[type] + ': ' + select.textContent + '<br>';
          }
        } else {
          var input = form_parent.querySelector("input[name='" + type + "']:checked");
          if (input) {
            typeVal = input.value;
            var valueTitle = input.closest('.selected').querySelector('.value-title');
            text += name[type] + ': ' + (valueTitle ? valueTitle.textContent : '') + '<br>';
          }
        }

        var codeElem = "CUSTOM_" + type + numberElem;
        var hiddenInput = form_parent.querySelector("input[name='" + codeElem + "']");
        if (hiddenInput) {
          hiddenInput.value = typeVal || '';
        }
      });

      var selectFasadeElement = document.getElementById("selectFasade" + numberElem);
      if (selectFasadeElement) {
        var description = selectFasadeElement.querySelector('.description');
        if (description) description.innerHTML = text;
      }
    }

    if (recall) {
      var event = new Event('change');
      elem.dispatchEvent(event);
    }
  };

  this.deactivateShowCase = function (showCaseList) {
    var propTypeShowcase = document.querySelector('.prop-type_showcase');
    if (propTypeShowcase) propTypeShowcase.classList.add('disable');
    
    showCaseList.forEach(function(showCase) {
      showCase.checked = false;
      var li = showCase.closest('li');
      if (li) li.style.display = "none";
    });
  };

  this.deactivateMechanism = function (mechanismList) {
    mechanismList.forEach(function(mechanism) {
      mechanism.checked = false;
      var li = mechanism.closest('li');
      if (li) li.style.display = "none";
    });
  };

  this.controlMechanism = function (activeFasade, mechanismList) {
    var activeMilling = activeFasade.closest('form').querySelector('input[name="MILLING"]:checked');
    var density = parseFloat(activeFasade.getAttribute('density'));
    var depth = parseFloat(activeFasade.getAttribute('depth'));
    var weightFasade = parseFloat(activeFasade.getAttribute('weight'));
    var allWidth = 0;
    var allHeight = 0;
    var allWeight = 0;

    if (activeMilling && activeMilling.getAttribute('weight') !== undefined) {
      weightFasade = parseFloat(activeMilling.getAttribute('weight'));
    }

    if (isNaN(weightFasade)) {
      self.deactivateMechanism(mechanismList);
      return false;
    }

    var objSizeFrame = self.getElementSize('.catalog-element-form');
    var widthFrame = parseFloat(objSizeFrame.width);
    var heightFrame = parseFloat(objSizeFrame.height);

    var conditionNewInputs = activeFasade.closest('form').querySelectorAll('input[name="conditionnew"]');
    if (conditionNewInputs.length > 0) {
      conditionNewInputs.forEach(function(conditionNew) {
        var conditionWidth = conditionNew.getAttribute('width');
        var conditionHeight = conditionNew.getAttribute('height');
        var objAxe = {
          '#X#': widthFrame,
          '#Y#': heightFrame
        };

        var sumCondWidth = self.expressionsReplace(conditionWidth, objAxe);
        sumCondWidth = eval(sumCondWidth);
        var sumCondHeight = self.expressionsReplace(conditionHeight, objAxe);
        sumCondHeight = eval(sumCondHeight);
        allHeight += sumCondHeight;
        allWeight += sumCondWidth * sumCondHeight / 1000000 * weightFasade;
      });
    }

    if (allWeight <= 0) {
      self.deactivateMechanism(mechanismList);
      return false;
    }

    allWeight = parseFloat(allWeight.toFixed(2));
    var objSectionMech = {};
    var idsMech = {};
    
    mechanismList.forEach(function(mechanism) {
      if (mechanism.getAttribute('data-cond') !== undefined) {
        var arrConditions = mechanism.getAttribute('data-cond').split(',');
        var typeMech = mechanism.getAttribute('data-type-mech');
        var sectionMech = mechanism.getAttribute('data-section');
        var cond = [];
        var id = mechanism.value;

        arrConditions.forEach(function(condition, q) {
          cond[q] = condition.split('_');
          cond[q] = cond[q].map(function(val) { return parseFloat(val); });

          if (allHeight >= cond[q][0] && allHeight <= cond[q][1] && 
              allWeight >= cond[q][2] && allWeight <= cond[q][3]) {
            if (objSectionMech[sectionMech] !== undefined) {
              if (objSectionMech[sectionMech] != typeMech) {
                return;
              }
            }

            idsMech[id] = true;
            objSectionMech[sectionMech] = typeMech;
          }
        });
      }
    });

    mechanismList.forEach(function(mechanism) {
      var typeMech = mechanism.getAttribute('data-type-mech');
      var sectionMech = mechanism.getAttribute('data-section');
      var id = mechanism.value;
      var li = mechanism.closest('li');

      if (idsMech[id] === true) {
        if (li) li.style.display = "list-item";
      } else {
        if (li) li.style.display = "none";
        mechanism.checked = false;
      }
    });
  };

  this.catalogInitEvent = function (ElementGetPriceFunc, addToBasketFunc) {
    // Обработка изменения выбора фасада
    document.addEventListener("change", function(e) {
      if (e.target.closest("input[name='SELECTFASADE']")) {
        var selectFasade = e.target;
        if (parseInt(selectFasade.value) >= 1) {
          var n = selectFasade.value;
          var arrType = ['FACADE','MILLING', 'FASADETYPE', 'PALETTE','PATINA','GLASS'];

          arrType.forEach(function(type) {
            var codeElem = "CUSTOM_" + type + n;
            var hiddenInput = selectFasade.closest('form').querySelector("input[name='" + codeElem + "']");
            if (hiddenInput) {
              var inputToCheck = selectFasade.closest('form').querySelector("input[value='" + hiddenInput.value + "']");
              if (inputToCheck) {
                if (hiddenInput.value == '') {
                  inputToCheck.checked = false;
                } else {
                  inputToCheck.checked = true;
                }
              }
            }
          });

          arrType.forEach(function(type) {
            var codeElem = "CUSTOM_" + type + n;
            var hiddenInput = selectFasade.closest('form').querySelector("input[name='" + codeElem + "']");
            if (hiddenInput && hiddenInput.value) {
              var inputToCheck = selectFasade.closest('form').querySelector("input[value='" + hiddenInput.value + "']");
              if (inputToCheck) {
                self.doChangeProps(inputToCheck);
              }
            }
          });
        }
      }
      
      // Обработка изменения свойств товара
      else if (e.target.closest(".tabs-swiper__option-item input, .tabs-swiper__slider-item input, .prop-facades input, .prop-colors input, .prop-leg_type input, .prop-milling input, .prop-glass input, .prop-hem input, .prop-fasadesize input, .prop-uslugi input, .prop-filling input, .prop-milling input, .prop-resize input, .prop-profile input, .prop-handlecolor input, .prop-fasadealign input, .prop-patinacolor input, .prop-tabletop_type input, .prop-option input, .prop-type_showcase input, .prop-fasade_type input, .prop-palette-wrap select")) {
        var elem = e.target;
        var type = elem.type === 'checkbox' ? 'checkbox' : false;
        self.doChangeProps(elem);

        var changeEvent = new CustomEvent('changeoption', {
          detail: {
            optGroup: elem.name,
            optText: elem.dataset.text,
            optSrc: elem.dataset.src,
            optSrcset: elem.dataset.srcset,
            type: type
          }
        });
        document.dispatchEvent(changeEvent);
        
        var productWrapper = elem.closest(".product__wrapper");
        if (productWrapper) {
          ElementGetPriceFunc(productWrapper);
        }
      }
      
      // Обработка изменения группы
      else if (e.target.closest(".prop-group input")) {
        var elem = e.target;
        document.querySelectorAll('.group-consist, .basket-label').forEach(function(el) {
          el.classList.remove('active');
        });
        
        document.querySelectorAll('.group-consist' + elem.dataset.id + ', .basket-label' + elem.dataset.id).forEach(function(el) {
          el.classList.add('active');
        });
        
        var productWrapper = elem.closest(".product__wrapper");
        if (productWrapper) {
          ElementGetPriceFunc(productWrapper);
        }
      }
      
      // Обработка изменения размера или толщины
      else if (e.target.closest(".prop-size .values input, .prop-thickness .values input")) {
        var elem = e.target;
        if (elem.checked) {
          elem.parentElement.classList.add('active');
          
          var inputs = elem.closest(".values").querySelectorAll("input:checked");
          inputs.forEach(function(input) {
            if (input.value != elem.value) {
              input.checked = false;
              input.parentElement.classList.remove('active');
            }
          });
          
          var productWrapper = elem.closest(".product__wrapper");
          if (productWrapper) {
            ElementGetPriceFunc(productWrapper);
          }
        } else {
          elem.checked = true;
        }
      }
    });

    // Обработка кликов по фасаду
    document.addEventListener("click", function(e) {
      if (e.target.closest('.facade-collaps')) {
        var collapsLink = e.target.closest('.facade-collaps');
        var collapsId = collapsLink.dataset.href;
        var parent = document.querySelector(collapsId).closest('.group');
        parent.classList.toggle('collapse_open');
      }
    });
    
    self.productIsInit = true;
  };

  this.catalogControlRelation = function (propsShow, input) {
    var relations = input.dataset.relations ? input.dataset.relations.split(',') : [];
    relations.forEach(function(v) {
      if (propsShow[v] === undefined) {
        propsShow[v] = false;
      }
      
      if (input.checked) {
        propsShow[v] = input.dataset[v] === undefined ? true : 
                      input.dataset[v] == 'false' || input.disabled ? false : input.dataset[v];
      }
    });
  };

  this.catalogControlConditions = function () {
    document.querySelectorAll("[data-conditions]").forEach(function(el) {
      if (el.dataset.conditions.length) {
        var form = el.closest('form');
        var size = self.getElementSize(form);
        var condition = {
          "#X#": size.width,
          "#Y#": size.height,
          "#Z#": size.depth
        };

        if (!eval(self.expressionsReplace(el.dataset.conditions, condition))) {
          el.disabled = true;
          el.checked = false;
          var li = el.closest('li');
          if (li) li.style.display = "none";
        } else {
          el.disabled = false;
          var li = el.closest('li');
          if (li) li.style.display = "list-item";
        }

        var prop = el.closest('.prop');
        if (prop && !prop.querySelector('input:enabled:checked') && !prop.classList.contains('prop-option')) {
          var firstEnabled = prop.querySelector('input:enabled');
          if (firstEnabled) {
            firstEnabled.checked = true;
            firstEnabled.dispatchEvent(new Event('change'));
            firstEnabled.parentElement.classList.add('selected');
          }
        }
      }
    });
  };

  this.getElementSize = function (formSelector) {
    var form = typeof formSelector === 'string' ? document.querySelector(formSelector) : formSelector;
    var widthInput = form.querySelector('[name=SIZEEDITWIDTH]') || form.querySelector('[name=width]');
    var heightInput = form.querySelector('[name=SIZEEDITHEIGHT]') || form.querySelector('[name=height]');
    var depthInput = form.querySelector('[name=SIZEEDITDEPTH]') || form.querySelector('[name=depth]');
    
    return {
      'width': widthInput ? widthInput.value : 0,
      'height': heightInput ? heightInput.value : 0,
      'depth': depthInput ? depthInput.value : 0
    };
  };

  this.expressionsReplace = function (obj, expressions) {
    Object.keys(expressions).forEach(function(k) {
      obj = obj.split(k).join(expressions[k]);
    });
    return obj;
  };

  this.catalogInitResizeProp = function () {
    document.querySelectorAll('.prop-resize').forEach(function(e) {
      var type = e.dataset.type;
      var elementBtn = document.getElementById("size_edit_" + type);
      var input = e.querySelector("input");

      if (elementBtn) {
        // Инициализация buttonset (если используется jQuery UI)
        if (typeof jQuery !== 'undefined' && jQuery.fn.buttonset) {
          jQuery(elementBtn).buttonset();
        }
      } else {
        var slideElement = document.getElementById("size_edit_" + type + "_slider");
        if (!slideElement) return;
        
        var min = parseInt(slideElement.dataset.min);
        var max = parseInt(slideElement.dataset.max);
        var step = slideElement.dataset.step ? parseInt(slideElement.dataset.step) : 1;
        var value = input ? parseInt(input.value) : min;
        var val_span = document.querySelector('#size_edit_' + type + '_slider_wrap span.label');

        // Инициализация spinner (если используется jQuery UI)
        if (typeof jQuery !== 'undefined' && jQuery.fn.spinner) {
          jQuery(input).spinner({
            step: step,
            min: min,
            max: max,
            change: function() {
              var v = self.catalogControlSize(parseInt(this.value), min, max);
              if (jQuery.fn.slider) {
                jQuery(slideElement).slider({
                  value: v
                });
              }
            },
            stop: function() {
              var v = self.catalogControlSize(parseInt(this.value), min, max);
              if (jQuery.fn.slider) {
                jQuery(slideElement).slider({
                  value: v
                });
              }
              this.value = v;
              this.dispatchEvent(new Event('change'));
              self.catalogControlConditions();

              if (type == 'depth') {
                document.querySelectorAll("#separate_table .table_wrap").forEach(function(el) {
                  el.style.height = (200 / 600 * v) + 'px';
                });
                document.querySelectorAll("#one_table .table_wrap").forEach(function(el) {
                  el.style.height = (200 / 600 * v) + 'px';
                });
                document.querySelectorAll('#separate_table .onesize .onesize-depth').forEach(function(el) {
                  el.textContent = v;
                });
                document.querySelectorAll('#one_table .table_wrap .onesize-depth').forEach(function(el) {
                  el.textContent = v;
                });
              }
            }
          });
        }

        // Инициализация slider (если используется jQuery UI)
        if (typeof jQuery !== 'undefined' && jQuery.fn.slider) {
          jQuery(slideElement).slider({
            min: min,
            max: max,
            step: step,
            range: "min",
            value: value,
            create: function() {
              if (val_span) val_span.textContent = value;

              if (type == 'depth') {
                document.querySelectorAll("#separate_table .table_wrap").forEach(function(el) {
                  el.style.height = (200 / 600 * value) + 'px';
                });
                document.querySelectorAll("#one_table .table_wrap").forEach(function(el) {
                  el.style.height = (200 / 600 * value) + 'px';
                });
                document.querySelectorAll('#separate_table .onesize .onesize-depth').forEach(function(el) {
                  el.textContent = value;
                });
                document.querySelectorAll('#one_table .table_wrap .onesize-depth').forEach(function(el) {
                  el.textContent = value;
                });
              }
            },
            slide: function(event, ui) {
              if (val_span) {
                val_span.textContent = ui.value;
                val_span.style.display = "block";
              }

              if (type == 'depth') {
                document.querySelectorAll("#separate_table .table_wrap").forEach(function(el) {
                  el.style.height = (200 / 600 * ui.value) + 'px';
                });
                document.querySelectorAll("#one_table .table_wrap").forEach(function(el) {
                  el.style.height = (200 / 600 * ui.value) + 'px';
                });
                document.querySelectorAll('#separate_table .onesize .onesize-depth').forEach(function(el) {
                  el.textContent = ui.value;
                });
                document.querySelectorAll('#one_table .table_wrap .onesize-depth').forEach(function(el) {
                  el.textContent = ui.value;
                });
              }
            },
            stop: function(event, ui) {
              if (val_span) {
                val_span.textContent = ui.value;
                val_span.style.display = "none";
              }
              if (input) {
                input.value = self.catalogControlSize(ui.value, min, max);
                input.dispatchEvent(new Event('change'));
              }
              self.catalogControlConditions();
            }
          });
        }
      }
    });
  };

  this.controlSizeFasade = function (init, value, type) {
    init = init || false;
    value = value || false;
    type = type || false;
    
    var height, width;
    
    if (type == 'height' || (type == 'width' && !init)) {
      if (type == 'width') {
        width = value;
        var heightInput = document.getElementById('size_edit_height_input');
        height = heightInput ? parseInt(heightInput.value) : 0;
      } else {
        height = value;
        var widthInput = document.getElementById('size_edit_width_input');
        width = widthInput ? parseInt(widthInput.value) : 0;
      }

      if (isNaN(height)) {
        var heightInput = document.querySelector('input[name="height"]');
        height = heightInput ? parseInt(heightInput.value) : 0;
      }

      if (isNaN(width)) {
        var widthInput = document.querySelector('input[name="width"]');
        width = widthInput ? parseInt(widthInput.value) : 0;
      }

      var conditionInput = document.querySelector('input[name="condition"]');
      if (conditionInput && conditionInput.getAttribute('width') != '') {
        var formulaWidth = conditionInput.getAttribute('width');

        var joinDepthInput = document.querySelector('input[name="SIZEEDITJOINDEPTH"]');
        if (joinDepthInput) {
          formulaWidth = formulaWidth.split('#SIZEEDITJOINDEPTH#').join(joinDepthInput.value);
        }

        formulaWidth = formulaWidth.split('#X#').join(width);
        width = eval(formulaWidth);
      }

      if (conditionInput && conditionInput.getAttribute('height') != '') {
        height = eval(conditionInput.getAttribute('height').split('#Y#').join(height));
      }

      var defaultElem = document.querySelector('.prop-facades input:first-child');
      var selectedElem = document.querySelector('.prop-facades input[type="radio"]:checked');
      
      var selectedElemWidth = selectedElem ? parseInt(selectedElem.getAttribute('max-width')) : 0;
      var selectedElemHeight = selectedElem ? parseInt(selectedElem.getAttribute('max-height')) : 0;
      var selectedElemMinHeight = selectedElem ? parseInt(selectedElem.getAttribute('min-height')) : 0;
      var selectedElemMinWidth = selectedElem ? parseInt(selectedElem.getAttribute('min-width')) : 0;

      if (selectedElem && (selectedElemWidth < width || selectedElemHeight < height || 
          isNaN(selectedElemMinHeight) || isNaN(selectedElemMinWidth) || 
          selectedElemWidth < width || selectedElemHeight < height || 
          selectedElemMinHeight > width || selectedElemMinWidth > height)) {
        if (defaultElem) {
          defaultElem.checked = true;
          defaultElem.closest('label').classList.add('selected');
        }
        if (selectedElem) {
          selectedElem.closest('label').classList.remove('selected');
        }
        
        self.catalogInitElementProps(document.querySelector(".main__product .product__wrapper"), self.catalogElementGetPrice);
        
        var propResize = document.querySelector('.prop.prop-resize[data-type="' + type + '"]');
        if (propResize) {
          var error = document.createElement('p');
          error.style.color = "red";
          error.className = "error";
          error.textContent = "Цвет фасада был сброшен. Несоответствует размерам.";
          propResize.appendChild(error);
          
          setTimeout(function() {
            var errors = propResize.querySelectorAll('.error');
            errors.forEach(function(el) {
              el.remove();
            });
          }, 4000);
        }
      }

      document.querySelectorAll('.prop-facades .group-values input').forEach(function(input) {
        var sizeCheckWidth = input.getAttribute('max-width');
        var sizeCheckHeight = input.getAttribute('max-height');
        var sizeCheckMinHeight = input.getAttribute('min-height');
        var sizeCheckMinWidth = input.getAttribute('min-width');
        var li = input.closest('li');

        if (sizeCheckWidth !== undefined && sizeCheckHeight !== undefined) {
          sizeCheckWidth = parseInt(sizeCheckWidth);
          sizeCheckHeight = parseInt(sizeCheckHeight);

          var shouldHide = false;
          
          if ((sizeCheckWidth < width || sizeCheckHeight < height) && 
              (sizeCheckMinHeight === undefined && sizeCheckMinHeight === undefined)) {
            shouldHide = true;
          } else if ((sizeCheckWidth < width || sizeCheckHeight < height || 
                     sizeCheckMinWidth > width || sizeCheckMinHeight > height)) {
            shouldHide = true;
          }

          if (li) {
            if (shouldHide) {
              li.classList.add('hiden-fasade');
              input.classList.add('err');
              input.disabled = true;
            } else {
              li.classList.remove('hiden-fasade');
              input.classList.remove('err');
              input.disabled = false;
            }
          }
        }
      });

      document.querySelectorAll('.prop-facades .group').forEach(function(group) {
        var inputs = group.querySelectorAll('input');
        var errInputs = group.querySelectorAll('input.err');
        
        if (inputs.length == errInputs.length) {
          group.style.display = "none";
        } else {
          group.style.display = "block";
        }
      });
    } else if (init) {
      if (type == 'width') {
        width = value;
        var heightInput = document.getElementById('size_edit_height_input');
        height = heightInput ? parseInt(heightInput.value) : 0;
      } else {
        height = value;
        var widthInput = document.getElementById('size_edit_width_input');
        width = widthInput ? parseInt(widthInput.value) : 0;
      }

      if (isNaN(height)) {
        var heightInput = document.querySelector('input[name="height"]');
        height = heightInput ? parseInt(heightInput.value) : 0;
      }

      if (isNaN(width)) {
        var widthInput = document.querySelector('input[name="width"]');
        width = widthInput ? parseInt(widthInput.value) : 0;
      }

      var conditionInput = document.querySelector('input[name="condition"]');
      if (conditionInput && conditionInput.getAttribute('width') != '') {
        var formulaWidth = conditionInput.getAttribute('width');

        var joinDepthInput = document.querySelector('input[name="SIZEEDITJOINDEPTH"]');
        if (joinDepthInput) {
          formulaWidth = formulaWidth.split('#SIZEEDITJOINDEPTH#').join(joinDepthInput.value);
        }

        formulaWidth = formulaWidth.split('#X#').join(width);
        width = eval(formulaWidth);
      }

      if (conditionInput && conditionInput.getAttribute('height') != '') {
        height = eval(conditionInput.getAttribute('height').split('#Y#').join(height));
      }

      document.querySelectorAll('.prop-facades .group-values input').forEach(function(input) {
        var sizeCheckWidth = input.getAttribute('max-width');
        var sizeCheckHeight = input.getAttribute('max-height');
        var sizeCheckMinHeight = input.getAttribute('min-height');
        var sizeCheckMinWidth = input.getAttribute('min-width');
        var li = input.closest('li');

        if (sizeCheckWidth !== undefined && sizeCheckHeight !== undefined) {
          sizeCheckWidth = parseInt(sizeCheckWidth);
          sizeCheckHeight = parseInt(sizeCheckHeight);

          var shouldHide = false;
          
          if (sizeCheckWidth < width || sizeCheckHeight < height) {
            shouldHide = true;
          }

          if (li) {
            if (shouldHide) {
              li.classList.add('hiden-fasade');
              input.classList.add('err');
            } else {
              li.classList.remove('hiden-fasade');
              input.classList.remove('err');
            }
          }
        }

        if (sizeCheckMinHeight !== undefined && sizeCheckMinWidth !== undefined) {
          sizeCheckMinWidth = parseInt(sizeCheckMinWidth);
          sizeCheckMinHeight = parseInt(sizeCheckMinHeight);

          var shouldHide = false;
          
          if (sizeCheckMinWidth > width || sizeCheckMinHeight > height) {
            shouldHide = true;
          }

          if (li) {
            if (shouldHide) {
              li.classList.add('hiden-fasade');
              input.classList.add('err');
            } else {
              li.classList.remove('hiden-fasade');
              input.classList.remove('err');
            }
          }
        }
      });

      document.querySelectorAll('.prop-facades .group').forEach(function(group) {
        var inputs = group.querySelectorAll('input');
        var errInputs = group.querySelectorAll('input.err');
        
        if (inputs.length == errInputs.length) {
          group.style.display = "none";
        } else {
          group.style.display = "block";
        }
      });
    }
  };

  this.catalogControlSize = function (value, min, max) {
    return value > max ? max : value < min ? min : value;
  };

  this.catalogInitResize = function (parent, callback) {
    callback = callback || function () {};
    var sizeEditOpt = document.getElementById('sizeeditopt');

    if (sizeEditOpt) {
      document.querySelectorAll('.prop-resize input').forEach(function(input) {
        input.disabled = true;
      });

      sizeEditOpt.addEventListener('change', function(e) {
        if (this.checked) {
          document.querySelectorAll('.prop-resize input').forEach(function(input) {
            input.disabled = false;
          });
          
          document.querySelectorAll('.prop-wrap-sizeoptional').forEach(function(el) {
            el.classList.remove('disable');
            el.style.display = "block";
          });
          
          self.catalogInitResizeProp();
        } else {
          document.querySelectorAll('.prop-resize input').forEach(function(input) {
            input.disabled = true;
          });
          
          document.querySelectorAll('.prop-wrap-sizeoptional').forEach(function(el) {
            el.classList.add('disable');
            el.style.display = "none";
          });
        }

        callback(parent);
      });
    } else {
      self.catalogInitResizeProp();
    }
  };

  this.catalogElementGetPrice = function (elem) {
    clearTimeout(self.getPriceTimer);
    self.getPriceTimer = setTimeout(function () {
      var form = document.querySelector(".product__form");
      if (!form) return;
      
      var formData = new FormData(form);
      var params = new URLSearchParams();
      
      for (var pair of formData.entries()) {
        params.append(pair[0], pair[1]);
      }
      
      var xhr = new XMLHttpRequest();
      xhr.open("POST", apiPath + "/API/catalog.element.getprice.php", true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          var msg = xhr.responseText;
          var priceElement = elem.querySelector(".product__price > .product__price-text");
          if (priceElement) priceElement.innerHTML = msg;
          
          var notDiscountInput = document.querySelector('input[name="NOT_DISCOUNT"]');
          if (notDiscountInput && notDiscountInput.value !== undefined) {
            var notDiscount = parseFloat(notDiscountInput.value);
            var percent = 2 - notDiscount;
            var oldP = (msg.replace(' руб', '').replace(' ', '') / percent).toFixed();
            var notDiscountElement = elem.querySelector(".product__price > .product__price-notdiscount");
            if (notDiscountElement) {
              notDiscountElement.innerHTML = Number(oldP).toLocaleString('ru-RU') + ' руб';
            }
          }
        }
      };
      
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send(params.toString());
    }, 300);
  };

  this.catalogInitRaspil = function () {
    var callback = callback || function() {};
    var slide = document.getElementById('slider');
    if (!slide) return;
    
    var min = parseInt(slide.dataset.min);
    var max = parseInt(slide.dataset.max);
    var width = parseInt(slide.dataset.width);
    var step = parseInt(slide.dataset.step);
    var maxQuantityPath = slide.dataset.sepmax ? parseInt(slide.dataset.sepmax) : 4;
    var propil = slide.dataset.propil ? parseInt(slide.dataset.propil) : 0;

    // Функция для округления
    function myRound10(val, i) {
      return Math.round(val / i) * i;
    }

    // Запись длины всех распилов в основной input
    function setMainInput() {
      var arrSumWidth = [];
      document.querySelectorAll('.path-container input').forEach(function(input) {
        arrSumWidth[parseInt(input.dataset.id)] = input.value;
      });
      document.getElementById('USLUGIraspil').value = arrSumWidth.join('*');
    }

    // Изменение ширины контейнера, который отображает распил
    function separateTable() {
      document.querySelectorAll('.path-container input').forEach(function(input) {
        var w = parseInt(input.value);
        var id = parseInt(input.dataset.id);
        var tableWrap = document.querySelector('#separate_table div[data-id-path="' + id + '"] .table_wrap');
        if (tableWrap) tableWrap.style.width = (w / (width / 100)) + '%';
        
        var oneSize = document.querySelector('#separate_table div[data-id-path="' + id + '"] .onesize-width');
        if (oneSize) oneSize.textContent = w;
      });
    }

    // Функция создает объект self.raspil для нормальной работы функции doChangeProps
    function createObj() {
      self.raspil = {};
      document.querySelectorAll('.part-raspil input').forEach(function(input) {
        var inpID = parseInt(input.dataset.id) + 1;
        self.raspil[inpID] = input.value;
      });

      for (var i = 1; i <= maxQuantityPath; ++i) {
        if (self.raspil[i] === undefined) {
          self.raspil[i] = 0;
        }
      }
    }

    // Сделано что бы button не сабмитил форму
    var sliderHandle = slide.querySelector('.ui-slider-handle');
    if (sliderHandle) {
      sliderHandle.addEventListener('click', function(e) {
        e.preventDefault();
      });
    }

    // Запись значений (ширины) слайдера в соответствующий input
    function displayWidth(e) {
      var slider = document.getElementById('slider');
      var elem = e.handle;
      var idElem = parseInt(elem.dataset.id);
      var quantityPath = slider.querySelectorAll('.ui-slider-handle').length;
      var valuePath = e.value;

      if (quantityPath == 1) {
        document.querySelector('.path-container[data-id="0"] input').value = valuePath;
        document.querySelector('.path-container[data-id="1"] input').value = width - valuePath;
      }

      if (quantityPath == 2) {
        if (idElem == 0) {
          document.querySelector('.path-container[data-id="0"] input').value = valuePath;
          document.querySelector('.path-container[data-id="1"] input').value = e.values[1] - valuePath;
        }

        if (idElem == 1) {
          document.querySelector('.path-container[data-id="1"] input').value = valuePath - e.values[0];
          document.querySelector('.path-container[data-id="2"] input').value = width - valuePath;
        }
      }

      if (quantityPath == 3) {
        if (idElem == 0) {
          document.querySelector('.path-container[data-id="0"] input').value = valuePath;
          document.querySelector('.path-container[data-id="1"] input').value = e.values[1] - valuePath;
        }

        if (idElem == 1) {
          document.querySelector('.path-container[data-id="1"] input').value = valuePath - e.values[0];
          document.querySelector('.path-container[data-id="2"] input').value = e.values[2] - valuePath;
        }

        if (idElem == 2) {
          document.querySelector('.path-container[data-id="2"] input').value = valuePath - e.values[1];
          document.querySelector('.path-container[data-id="3"] input').value = width - valuePath;
        }
      }

      separateTable();
      createObj();
      setMainInput();
      
      var propUslugiInput = document.querySelector('.prop-uslugi input');
      if (propUslugiInput) self.doChangeProps(propUslugiInput);
    }

    createObj();
    
    // Инициализация слайдера (если используется jQuery UI)
    if (typeof jQuery !== 'undefined' && jQuery.fn.slider) {
      jQuery(slide).slider2({
        min: min,
        max: max,
        step: step,
        range: false,
        tooltips: false,
        handles: [{
          value: Math.round(width / maxQuantityPath)
        }],
        showTypeNames: true,
        mainClass: 'sleep',
        slide: function(e, ui) {
          displayWidth(ui);
        }
      });
    }

    // Добавление нового распила
    var addButton = document.querySelector('.control-part-raspil .add');
    if (addButton) {
      addButton.addEventListener('click', function(e) {
        e.preventDefault();
        var slider = document.getElementById('slider');
        var quantityPathElem = slider.querySelectorAll('.ui-slider-handle');
        var quantityPathHandle = quantityPathElem.length;
        var pathInputElem = document.querySelectorAll('.part-raspil input');
        var quantityPathInput = pathInputElem.length;
        var idElem = quantityPathInput + 1;
        var widthNewElem = 0;
        var arrSumWidth = [];
        var inputField;

        if (quantityPathInput <= maxQuantityPath - 1) {
          if (quantityPathInput == maxQuantityPath - 1) {
            this.disabled = true;
          }

          if ((width - quantityPathInput * propil) / (quantityPathInput + 1) <= min) {
            this.disabled = true;
          }

          widthNewElem = Math.round((width - quantityPathInput * propil) / (quantityPathInput + 1));
          inputField = '<div class="path-container" data-id="' + quantityPathInput + '">' + 
                       '<div>Часть <span class="path-number">' + idElem + '</span></div>' + 
                       '<input step="10" type="number" data-id="' + quantityPathInput + '" value="' + widthNewElem + '" class="path-width">' + 
                       '<div>mm.</div></div>';
          
          var partRaspil = document.querySelector('.part-raspil');
          if (partRaspil) partRaspil.insertAdjacentHTML('beforeend', inputField);
          
          var newArr = document.querySelectorAll('.part-raspil input');
          var sum = -propil;
          
          newArr.forEach(function(input, i) {
            arrSumWidth[parseInt(input.dataset.id)] = sum;

            if (newArr.length === i + 1) {
              input.value = width - sum - propil;
            } else {
              sum += widthNewElem + propil;
              input.value = widthNewElem;
            }
          });

          changeInpS(document.querySelectorAll('.part-raspil input'));
          
          // Добавление handle в слайдер (если используется jQuery UI)
          if (typeof jQuery !== 'undefined' && jQuery.fn.slider) {
            jQuery(slider).slider2('addHandle', {
              value: arrSumWidth[0]
            });
            
            slider.querySelectorAll('.ui-slider-handle').forEach(function(handle, i) {
              jQuery(slider).slider2('values', parseInt(handle.dataset.id), arrSumWidth[parseInt(handle.dataset.id)]);
            });
          }

          createObj();
          setMainInput();
          
          var propUslugiInput = document.querySelector('.prop-uslugi input');
          if (propUslugiInput) self.doChangeProps(propUslugiInput);
          
          var separateTableDiv = document.querySelector('#separate_table div[data-id-path="' + quantityPathInput + '"]');
          if (separateTableDiv) separateTableDiv.style.display = "block";
          
          self.catalogElementGetPrice(document.querySelector(".main__product .product__wrapper"));
          separateTable();
        }

        return false;
      });
    }

    // Удаление распила
    var deleteButton = document.querySelector('.control-part-raspil .delete');
    if (deleteButton) {
      deleteButton.addEventListener('click', function(e) {
        e.preventDefault();
        var slider = document.getElementById('slider');
        var pathElem = slider.querySelectorAll('.ui-slider-handle');
        var quantityPathElem = pathElem.length;
        var idElem = quantityPathElem - 1;
        var deleteElementCont = document.querySelector('.path-container[data-id="' + quantityPathElem + '"]');
        
        if (deleteElementCont) {
          var sum = parseInt(deleteElementCont.querySelector('input').value) + 
                   parseInt(document.querySelector('.path-container[data-id="' + idElem + '"] input').value) + propil;
          
          deleteElementCont.remove();
          
          // Удаление handle из слайдера (если используется jQuery UI)
          if (typeof jQuery !== 'undefined' && jQuery.fn.slider) {
            jQuery(slider).slider2('removeHandle', idElem);
          }
          
          document.querySelector('.path-container[data-id="' + idElem + '"] input').value = sum;
          var allSum = 0;
          
          slider.querySelectorAll('.ui-slider-handle').forEach(function(handle) {
            var idHandle = parseInt(handle.dataset.id);
            allSum += parseInt(document.querySelector('.path-container[data-id="' + idHandle + '"] input').value);
            
            // Обновление значений слайдера (если используется jQuery UI)
            if (typeof jQuery !== 'undefined' && jQuery.fn.slider) {
              jQuery(slider).slider2('values', idHandle, allSum);
            }
          });

          if (document.querySelectorAll('.path-container input').length == 2) {
            this.disabled = true;
          }

          if (document.querySelectorAll('.path-container input').length > 2) {
            document.querySelector('.control-part-raspil .add').disabled = false;
          }

          createObj();
          setMainInput();
          self.catalogElementGetPrice(document.querySelector(".main__product .product__wrapper"));
          
          var propUslugiInput = document.querySelector('.prop-uslugi input');
          if (propUslugiInput) self.doChangeProps(propUslugiInput);
          
          var separateTableDiv = document.querySelector('#separate_table div[data-id-path="' + quantityPathElem + '"]');
          if (separateTableDiv) separateTableDiv.style.display = "none";
          
          separateTable();
        }
      });
    }

    // Ограничение ввода в инпуты
    document.querySelectorAll('.part-raspil input').forEach(function(input) {
      input.addEventListener('keydown', function(e) {
        var keyVal = parseInt(e.key);
        if (Number.isInteger(keyVal) === false && e.key != 'Backspace') {
          e.preventDefault();
        }
      });
    });

    // Изменение значений инпута вручную
    function changeInpS(elements) {
      elements.forEach(function(input) {
        input.addEventListener('change', function(e) {
          var inputArr = Array.from(this.closest('.part-raspil').querySelectorAll('input'));
          var quantity = inputArr.length;
          var valInput = myRound10(parseInt(this.value), 10);
          var slider = document.getElementById('slider');
          var widthArr = [];
          var widthSum = 0;
          var changeVal = 0;
          var propil = slider.dataset.propil ? parseInt(slider.dataset.propil) : 0;
          var targetID = parseInt(this.dataset.id);
          
          inputArr.forEach(function(input, i) {
            widthArr[i] = parseInt(input.value);
            widthSum += parseInt(input.value);
          });

          function notChange(id) {
            // Возвращаем распил к исходному значению
            var message = 'недопустимое значение ' + inputArr[targetID].value + ' Часть ' + id + ' меньше ' + min;
            if (typeof toastr !== 'undefined') {
              toastr.warning(message);
            }
            inputArr[targetID].value = parseInt(inputArr[targetID].value) + changeVal;
          }

          changeVal = width - (quantity - 1) * propil - widthSum;

          if (inputArr[targetID].value < min) {
            // Проверяем минимальное значение
            notChange(targetID);
          } else {
            if (maxQuantityPath) {
              inputArr.forEach(function(input, i) {
                // Меняем значения инпутов
                if (i === targetID + 1 && targetID !== quantity - 1) {
                  var newValue = parseInt(input.value) + changeVal;

                  if (newValue >= min) {
                    // Проверяем инпут
                    inputArr[i].value = newValue;
                  } else {
                    notChange(i);
                  }
                } else if (i === quantity - 1 && targetID === quantity - 1) {
                  var _newValue = parseInt(inputArr[i - 1].value) + changeVal;

                  if (_newValue >= min) {
                    // Проверяем инпут
                    inputArr[i - 1].value = _newValue;
                  } else {
                    notChange(i);
                  }
                }
              });
            }
          }

          var sum = 0;
          var arrSumWidth = [];
          var arrLength = quantity - 1;
          var propil = slider.dataset.propil ? parseInt(slider.dataset.propil) : 0;
          
          document.querySelectorAll('.part-raspil input').forEach(function(input, n) {
            var lastPropil = arrLength === n ? propil : 0;
            sum += parseInt(input.value) - lastPropil;
            arrSumWidth[parseInt(input.dataset.id)] = sum;
          });
          
          slider.querySelectorAll('.ui-slider-handle').forEach(function(handle) {
            // Обновление значений слайдера (если используется jQuery UI)
            if (typeof jQuery !== 'undefined' && jQuery.fn.slider) {
              jQuery(slider).slider2('values', parseInt(handle.dataset.id), arrSumWidth[parseInt(handle.dataset.id)]);
            }
          });
          
          createObj();
          setMainInput();
          
          var propUslugiInput = document.querySelector('.prop-uslugi input');
          if (propUslugiInput) self.doChangeProps(propUslugiInput);
          
          separateTable();
        });
      });
    }
    
    changeInpS(document.querySelectorAll('.part-raspil input'));
  };

  this.catalogInitElementProps = function (parent, ElementGetPriceFunc) {
    self.catalogInitResize(parent, ElementGetPriceFunc);
    self.catalogInitRaspil();
    self.catalogElementFacade(parent);
    self.catalogInitImage();
    self.catalogInitSelect();
  };

  this.catalogInitSelect = function () {
    // Инициализация selectpicker (если используется)
    if (typeof jQuery !== 'undefined' && jQuery.fn.selectpicker) {
      jQuery('.selectpicker').selectpicker();
    }
  };

  this.catalogInitImage = function () {
    var img = document.querySelector('.preview');
    if (!img) return;
    
    var targetProps = img.dataset.targetProp;
    if (targetProps) {
      var selectedInput = document.querySelector('.prop-colors .selected input');
      if (selectedInput) {
        var src = selectedInput.dataset.image;
        var srcbig = selectedInput.dataset.imagebig;
        
        var previewImg = document.querySelector('.product__form .preview img');
        if (previewImg && src) previewImg.src = src;
        
        var previewLink = document.querySelector('.product__form .preview .image');
        if (previewLink && srcbig) previewLink.href = srcbig;
      }
    }
  };

  this.catalogElementFacade = function (parent) {
    if (!parent) return;


    var checkedFacade = parent.querySelector(".prop-facades input:checked");
    if (checkedFacade) self.doChangeProps(checkedFacade);
    
    var checkedColor = parent.querySelector(".prop-colors input:checked");
    if (checkedColor) self.doChangeProps(checkedColor);
  };

  this.catalogBasketOptionsChange = function (option_value, checked) {
    document.querySelectorAll(".basket-wrap .props-option").forEach(function(props) {
      var elem = props.querySelector("input[value='" + option_value + "']");
      if (!elem) return;
      
      var group = elem.getAttribute("_groups").split(",");
      
      if (checked) {
        elem.checked = true;
        elem.parentElement.classList.remove("hidden");
        elem.parentElement.classList.add("active");

        if (group.length == 2) {
          props.querySelectorAll("input").forEach(function(input) {
            if (input.checked) {
              if (input.value != elem.value) {
                var this_group = input.getAttribute("_groups").split(",");

                if (this_group.length == 1) {
                  for (var i in group) {
                    if (group[i] == this_group[0]) {
                      input.checked = false;
                      input.parentElement.classList.remove("active");
                      input.parentElement.classList.add("hidden");
                      break;
                    }
                  }
                }
              }
            } else {
              if (input.getAttribute("_groups").split(",").length == 2 && input.getAttribute("_groups").split(",")[0] == group[0]) {
                if (input.getAttribute("_default") == "Y") {
                  input.checked = true;
                  input.parentElement.classList.remove("hidden");
                  input.parentElement.classList.add("active");
                } else {
                  input.checked = false;
                  input.parentElement.classList.remove("active");
                  input.parentElement.classList.add("hidden");
                }
              }
            }
          });
        } else {
          props.querySelectorAll("input:checked").forEach(function(input) {
            if (input.value != elem.value) {
              var this_group = input.getAttribute("_groups").split(",");

              for (var i in this_group) {
                if (this_group[i] == group[0]) {
                  input.checked = false;
                  input.parentElement.classList.remove("active");
                  input.parentElement.classList.add("hidden");
                  break;
                }
              }
            }
          });
        }
      } else {
        props.querySelectorAll("input").forEach(function(input) {
          if (group.length == 2) {
            var _group = group[1];
            var _group_parent = group[0];
            var _count = 0; // Количество отмеченных опций из группы "parent"

            document.querySelectorAll(".basket-wrap .options input").forEach(function(optInput) {
              var _name = optInput.getAttribute("_groups").split(",");

              if (_name.length == 2 && _name[0] == _group_parent) {
                _count++;

                if (!optInput.checked) {
                  _count--;
                }
              }
            });

            if (_count == 0) {
              // Отмеченных опций не осталось - восстанавливаем default по группе "parent"
              props.querySelectorAll("input").forEach(function(propInput) {
                if (propInput.getAttribute("_groups").split(",")[0] == _group_parent || propInput.getAttribute("_groups").split(",")[1] == _group_parent) {
                  if (propInput.getAttribute("_default") == "Y") {
                    propInput.checked = true;
                    propInput.parentElement.classList.remove("hidden");
                    propInput.parentElement.classList.add("active");
                  } else {
                    propInput.checked = false;
                    propInput.parentElement.classList.remove("active");
                    propInput.parentElement.classList.add("hidden");
                  }
                }
              });
            } else if (input.getAttribute("_groups").split(",")[1] == _group) {
              if (input.getAttribute("_default") == "Y") {
                input.checked = true;
                input.parentElement.classList.remove("hidden");
                input.parentElement.classList.add("active");
              } else {
                input.checked = false;
                input.parentElement.classList.remove("active");
                input.parentElement.classList.add("hidden");
              }
            }
          } else if (input.getAttribute("_groups").split(",")[0] == group[0]) {
            if (input.getAttribute("_default") == "Y") {
              input.checked = true;
              input.parentElement.classList.remove("hidden");
              input.parentElement.classList.add("active");
            } else {
              input.checked = false;
              input.parentElement.classList.remove("active");
              input.parentElement.classList.add("hidden");
            }
          }
        });
      }
    });
    
    self.catalogBasketUpdateAfterOptionsChange();
  };

  this.catalogBasketUpdateAfterOptionsChange = function () {
    var form = document.querySelector(".basket-form");
    if (!form) return;
    
    var formData = new FormData(form);
    var params = new URLSearchParams();
    
    for (var pair of formData.entries()) {
      params.append(pair[0], pair[1]);
    }
    
    var xhr = new XMLHttpRequest();
    xhr.open("POST", apiPath + "/API/basket.option.update.php", true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          Object.keys(data).forEach(function(key) {
            document.querySelectorAll("." + key).forEach(function(el) {
              el.innerHTML = data[key];
            });
          });
          self.catalogBasketUpdate(false);
        } catch (e) {
          console.error("Error parsing JSON response", e);
        }
      }
    };
    
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params.toString());
  };

  this.catalogBasketItemQuantityUpdate = function (id, quantity) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", apiPath + "/API/basket.item.quantity.update.php", true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        document.querySelectorAll(".basket-wrap .basket .total_price").forEach(function(el) {
          el.innerHTML = xhr.responseText;
        });
        self.catalogBasketUpdate(false);
      }
    };
    
    var params = new URLSearchParams();
    params.append('ID', id);
    params.append('QUANTITY', quantity);
    
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params.toString());
  };

  this.catalogBasketUpdate = function (refresh) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", apiPath + "/API/basket.update.php", true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        if (document.querySelector(".basket-wrap .basket, #orderWrap .orderContent, #orderattach .orderattachContent") && refresh) {
          window.location.reload();
        } else {
          document.querySelectorAll("#header .basket, .header-cart, .main-header .user-nav__cart").forEach(function(el) {
            el.outerHTML = xhr.responseText;
          });
        }
      }
    };
    xhr.send();
  };

  this.Confirm = function (text, ok, no) {
    ok = ok || function() {};
    no = no || function() {};
    
    var html = document.createElement("div");
    html.innerHTML = text;
    
    // Создание диалога (если используется jQuery UI)
    if (typeof jQuery !== 'undefined' && jQuery.fn.dialog) {
      jQuery(html).dialog({
        autoOpen: true,
        modal: true,
        buttons: {
          "Ok": function() {
            ok();
            jQuery(this).dialog("close");
          },
          "Отмена": function() {
            no();
            jQuery(this).dialog("close");
          }
        }
      });
    } else {
      // Альтернативная реализация без jQuery UI
      var dialog = document.createElement("div");
      dialog.className = "dialog";
      dialog.style.position = "fixed";
      dialog.style.top = "50%";
      dialog.style.left = "50%";
      dialog.style.transform = "translate(-50%, -50%)";
      dialog.style.backgroundColor = "white";
      dialog.style.padding = "20px";
      dialog.style.border = "1px solid #ccc";
      dialog.style.zIndex = "1000";
      
      var content = document.createElement("div");
      content.innerHTML = text;
      dialog.appendChild(content);
      
      var buttons = document.createElement("div");
      buttons.style.marginTop = "20px";
      buttons.style.textAlign = "right";
      
      var okButton = document.createElement("button");
      okButton.textContent = "Ok";
      okButton.style.marginRight = "10px";
      okButton.addEventListener("click", function() {
        ok();
        document.body.removeChild(dialog);
      });
      
      var cancelButton = document.createElement("button");
      cancelButton.textContent = "Отмена";
      cancelButton.addEventListener("click", function() {
        no();
        document.body.removeChild(dialog);
      });
      
      buttons.appendChild(okButton);
      buttons.appendChild(cancelButton);
      dialog.appendChild(buttons);
      
      document.body.appendChild(dialog);
    }
  };

  this.initCallBackForm = function () {
    document.addEventListener('click', function(e) {
      if (e.target.closest('.call-back-form')) {
        var phoneForm = document.getElementById('phoneform');
        if (phoneForm) {
          phoneForm.style.display = "block";
        }
        e.preventDefault();
      }
    });
    
    // document.addEventListener('mouseenter', function(e) {
    //   if (e.target.closest('.cbh-phone')) {
    //     var phone = e.target.closest('.cbh-phone');
    //     self.hoverCallBackForm(phone, 'show');
    //     document.querySelectorAll('.cbh-phone').forEach(function(el) {
    //       el.classList.add('cbh-active');
    //     });
    //   }
    // });
    
    // document.addEventListener('mouseleave', function(e) {
    //   if (e.target.closest('.cbh-phone')) {
    //     var phone = e.target.closest('.cbh-phone');
    //     self.hoverCallBackForm(phone, 'hide');
    //     document.querySelectorAll('.cbh-phone').forEach(function(el) {
    //       el.classList.remove('cbh-active');
    //     });
    //   }
    // });
    
    // Инициализация слайдера диапазона (если используется jQuery UI)
    document.querySelectorAll(".slider-range").forEach(function(el) {
      if (typeof jQuery !== 'undefined' && jQuery.fn.slider) {
        var min = parseInt(el.dataset.min);
        var max = parseInt(el.dataset.max);
        var target = el.dataset.target;
        
        jQuery(el).slider({
          range: true,
          min: min,
          max: max,
          values: [min, max],
          slide: function(event, ui) {
            document.querySelectorAll(target).forEach(function(input) {
              input.value = "c " + ui.values[0] + ":00 по " + ui.values[1] + ":00";
            });
          }
        });
      }
    });
    
    self.initPhoneMask();
    
    setInterval(function() {
      var phones = document.querySelectorAll('.cbh-phone');
      phones.forEach(function(phone) {
        self.hoverCallBackForm(phone, 'toggle');
      });
    }, 5000);
  };

  this.initPhoneMask = function () {
    // Установка позиции курсора
    if (!HTMLElement.prototype.setCursorPosition) {
      HTMLElement.prototype.setCursorPosition = function(pos) {
        if (this.setSelectionRange) {
          this.setSelectionRange(pos, pos);
        } else if (this.createTextRange) {
          var range = this.createTextRange();
          range.collapse(true);
          range.moveEnd('character', pos);
          range.moveStart('character', pos);
          range.select();
        }
      };
    }
    
    // Применение маски телефона
    document.querySelectorAll('.phone-mask').forEach(function(input) {
      input.addEventListener('click', function() {
        this.setCursorPosition(3);
      });
      
      // Применение маски (если используется jQuery Mask Plugin)
      if (typeof jQuery !== 'undefined' && jQuery.fn.mask) {
        jQuery(input).mask(PHONE_MASK, {
          placeholder: PHONE_PLACEHOLDER
        });
      }
      
      input.autocomplete = "off";
      input.placeholder = PHONE_PLACEHOLDER;
    });
  };

  this.initSummMask = function () {
    // Применение маски суммы (если используется jQuery Mask Plugin)
    document.querySelectorAll('.amount-mask').forEach(function(input) {
      if (typeof jQuery !== 'undefined' && jQuery.fn.mask) {
        jQuery(input).mask(SUMM_MASK, {
          reverse: true
        });
      }
      input.placeholder = SUMM_PLACEHOLDER;
    });
  };

  this.hoverCallBackForm = function (element, type) {
    if (type == 'show' || element.classList.contains('cbh-active') || (type == 'toggle' && !element.classList.contains('cbh-hover'))) {
      element.classList.add('cbh-hover');
      element.classList.add('cbh-green');
      element.classList.remove('cbh-static');
    } else {
      element.classList.remove('cbh-hover');
      element.classList.add('cbh-static');
      element.classList.remove('cbh-green');
    }
  };

  this.toastmessage = function (text, type) {
    type = type || 'info';
    if (typeof toastr !== 'undefined') {
      toastr[type](text);
    } else {
      console.log(type + ": " + text);
    }
  };

  this.initOrderDatePicker = function (start, period) {
    var shippingDate = document.querySelector('.shipping_date[type="text"]');
    if (!shippingDate) return;
    
    var val = shippingDate.value;
    var min = start || parseInt(shippingDate.dataset.start);
    var max = period || parseInt(shippingDate.dataset.period);

    if (!min) min = 20;
    if (!max) max = 31;

    val = start || min;
    
    // Инициализация datepicker (если используется jQuery UI)
    var shippingDatePick = document.querySelector('.shipping_date_pick');
    if (shippingDatePick && typeof jQuery !== 'undefined' && jQuery.fn.datepicker) {
      jQuery(shippingDatePick).datepicker("destroy");
      jQuery(shippingDatePick).datepicker({
        altField: ".shipping_date",
        altFormat: "dd.mm.yy",
        defaultDate: +min,
        minDate: +min,
        maxDate: +(min + max)
      });

      if (val) {
        jQuery(shippingDatePick).datepicker('setDate', val);
      }
    }
  };
}

var vardekApp = {};
document.addEventListener("DOMContentLoaded", function() {
  vardekApp = new CatalogApp();
  vardekApp.start();
});