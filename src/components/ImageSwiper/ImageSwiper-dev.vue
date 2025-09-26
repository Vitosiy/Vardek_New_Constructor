<template>
  <div
    class="image-swiper"
    @pointerdown="onPointerDown"
    @pointercancel="onPointerCancel"
  >
    <!-- Слайды -->
    <div
      ref="slidesWrapperRef"
      class="slides-wrapper"
      :style="{
        transform: `translateX(-${currentIndex * 100}%)`,
        transition: transitionEnabled ? 'transform 0.6s ease-in-out' : 'none'
      }"
      @transitionend="onTransitionEnd"
    >
      <div
        v-for="(image, index) in slides"
        :key="index"
        class="slide"
      >
        <img
          :src="`${API_URL}${image?.PREVIEW_PICTURE || ''}`"
          :alt="image?.NAME || ''"
          class="slide-image"
        />
        <div class="slide-description">
          <div class="slide-title">{{ image?.NAME }}</div>
          <div class="slide-text">{{ image?.PREVIEW_TEXT }}</div>
        </div>
      </div>
    </div>

    <!-- Кнопки -->
    <button
      class="nav prev"
      @click="prevSlide"
      :disabled="isAnimating || slides.length <= 1"
      aria-label="Previous"
    >‹</button>
    <button
      class="nav next"
      @click="nextSlide"
      :disabled="isAnimating || slides.length <= 1"
      aria-label="Next"
    >›</button>

    <!-- Пагинация -->
    <div class="pagination" v-if="props.images && props.images.length > 1">
      <span
        v-for="(image, index) in props.images"
        :key="index"
        :class="['dot', { active: currentIndex === index + 1 }]"
        @click="() => goToRealIndex(index)"
      ></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';

const props = defineProps({
  images: { type: Array, required: true },
  autoplay: {
    type: Object,
    default: () => ({ delay: 3000, disableOnInteraction: false })
  }
});

const API_URL = import.meta.env.VITE_API_URL || '';

// --- slides (computed) ---
// Если 0 слайдов => []
// Если 1 слайд => [one slide] (без клонирования)
// Если >=2 => [cloneLast, ...images, cloneFirst]
const slides = computed(() => {
  const imgs = props.images || [];
  if (!imgs.length) return [];
  if (imgs.length === 1) return [imgs[0]];
  return [imgs[imgs.length - 1], ...imgs, imgs[0]];
});

// текущий индекс относительный к slides
// если есть клонирование — стартуем с 1 (первый "реальный"), иначе 0
const currentIndex = ref(slides.value.length > 1 ? 1 : 0);

watch(slides, (newSlides) => {
  currentIndex.value = newSlides.length > 1 ? 1 : 0;
});

// transition control
const transitionEnabled = ref(true);
const isAnimating = ref(false);
const slidesWrapperRef = ref(null);

// autoplay
let intervalId = null;
function startAutoplay() {
  stopAutoplay();
  if (!props.autoplay || !(props.autoplay.delay >= 0) || slides.value.length <= 1) return;
  intervalId = setInterval(() => {
    nextSlide();
  }, props.autoplay.delay || 3000);
}
function stopAutoplay() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

onMounted(() => {
  startAutoplay();
});

onBeforeUnmount(() => {
  stopAutoplay();
  window.removeEventListener('pointerup', onPointerUp);
});

// навигация
function slideTo(index) {
  if (isAnimating.value || slides.value.length <= 1) return;
  isAnimating.value = true;
  transitionEnabled.value = true;
  currentIndex.value = index;
}
function nextSlide() { slideTo(currentIndex.value + 1); }
function prevSlide() { slideTo(currentIndex.value - 1); }
function goToRealIndex(realIndex) {
  // realIndex — индекс в исходных props.images (0..n-1)
  if (slides.value.length <= 1) return;
  slideTo(realIndex + 1); // смещение из-за клона в начале
}

// transitionend — обработка «клонированных» границ
function onTransitionEnd(e) {
  // защита — реагируем только на wrapper
  if (!slidesWrapperRef.value || e.target !== slidesWrapperRef.value) return;

  if (slides.value.length <= 1) {
    isAnimating.value = false;
    return;
  }

  const lastIndex = slides.value.length - 1;
  if (currentIndex.value === lastIndex) {
    // дошли до клона первого -> мгновенный (без анимации) прыжок на реальный 1
    transitionEnabled.value = false;
    currentIndex.value = 1;
    nextTick(() => {
      // форс релоад стилей чтобы убрать "без анимации" скачок
      void slidesWrapperRef.value.offsetWidth;
      transitionEnabled.value = true;
      isAnimating.value = false;
    });
  } else if (currentIndex.value === 0) {
    // дошли до клона последнего -> прыгнуть к реальному последнему
    transitionEnabled.value = false;
    currentIndex.value = lastIndex - 1;
    nextTick(() => {
      void slidesWrapperRef.value.offsetWidth;
      transitionEnabled.value = true;
      isAnimating.value = false;
    });
  } else {
    // нормальный переход
    isAnimating.value = false;
  }
}

// --- Pointer swipe (mouse + touch) ---
// простая логика: запомнить координату на pointerdown и на pointerup сравнить diff
let startX = 0;
let pointerDown = false;

function onPointerDown(e) {
  pointerDown = true;
  startX = (e && e.clientX) || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
  // слушаем оконный pointerup чтобы поймать events вне контейнера
  window.addEventListener('pointerup', onPointerUp);
  // отключаем автоплей, если это указано
  if (props.autoplay && props.autoplay.disableOnInteraction) stopAutoplay();
}

function onPointerUp(e) {
  if (!pointerDown) return;
  const endX = (e && e.clientX) || (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientX) || 0;
  const diff = endX - startX;
  const threshold = 50; // px
  if (Math.abs(diff) > threshold) {
    diff > 0 ? prevSlide() : nextSlide();
  }
  pointerDown = false;
  window.removeEventListener('pointerup', onPointerUp);
}

function onPointerCancel() {
  pointerDown = false;
  window.removeEventListener('pointerup', onPointerUp);
}
</script>

<style scoped>
.image-swiper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  user-select: none;
  touch-action: pan-y; /* позволяет горизонтальный свайп */
}

.slides-wrapper {
  display: flex;
  height: 100%;
}

.slide {
  min-width: 100%;
  height: 100%;
  position: relative;
  background: #000;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.slide-image {
  width: 100%;
  height: 70vh;
  object-fit: cover;
}

.slide-description {
  padding: 1rem;
  max-width: 900px;
  text-align: center;
}

.slide-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: .5rem;
}

.slide-text {
  font-size: 1rem;
  opacity: 0.8;
}

/* Кнопки */
.nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  /* background: rgba(0, 0, 0, 0.45); */
  color: white;
  border: none;
  font-size: 2rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  z-index: 10;
}
.nav[disabled] {
  opacity: 0.4;
  cursor: default;
}
.nav.prev { left: 10px; }
.nav.next { right: 10px; }

/* Пагинация */
.pagination {
  position: absolute;
  bottom: 20px;
  width: 100%;
  text-align: center;
}
.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin: 0 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}
.dot.active {
  background: #fff;
}

/* Адаптив */
@media (max-width: 768px) {
  .slide-image {
    height: 50vh;
  }
  .slide-title {
    font-size: 1.2rem;
  }
  .slide-text {
    font-size: 0.9rem;
  }
}
</style>
