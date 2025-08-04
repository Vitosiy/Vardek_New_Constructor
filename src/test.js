document.addEventListener('DOMContentLoaded', function() {
  // Инициализация слайдеров для высоты, ширины и глубины
  initSlider('height', 200, 1320, 2);
  initSlider('width', 150, 900, 2);
  initSlider('depth', 200, 990, 1);

  function initSlider(type, min, max, step) {
    const sliderElement = document.getElementById(`size_edit_${type}_slider`);
    const inputElement = document.getElementById(`size_edit_${type}_input`);
    const sliderWrap = document.getElementById(`size_edit_${type}_slider_wrap`);
    const label = sliderWrap.querySelector('.label');

    if (!sliderElement || !inputElement) return;

    // Инициализация слайдера
    noUiSlider.create(sliderElement, {
      start: [min],
      connect: [true, false],
      range: {
        'min': min,
        'max': max
      },
      step: step
    });

    // Обновление поля ввода при изменении слайдера
    sliderElement.noUiSlider.on('update', function(values, handle) {
      const value = Math.round(values[handle]);
      inputElement.value = value;
      label.textContent = value;
    });

    // Обновление слайдера при изменении поля ввода
    inputElement.addEventListener('change', function() {
      let value = parseInt(this.value);
      
      // Проверка на минимальное и максимальное значение
      if (value < min) value = min;
      if (value > max) value = max;
      
      sliderElement.noUiSlider.set(value);
      this.value = value;
      label.textContent = value;
    });
  }

  // Для мобильных устройств - скрытие/показ слайдеров при клике на поле ввода
  const inputs = document.querySelectorAll('.size_edit_input input');
  inputs.forEach(input => {
    input.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        const sliderWrap = this.closest('.prop-resize-content').querySelector('.size_edit_slider_wrap');
        sliderWrap.style.display = sliderWrap.style.display === 'none' ? 'block' : 'none';
      }
    });
  });
});



