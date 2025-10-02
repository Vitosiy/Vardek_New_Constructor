# План: Обертка для 2D‑конструктора без глобального EventBus

Цель: изолировать 2D‑конструктор за стабильным, типизированным интерфейсом (адаптером/фасадом), убрать прямые обращения к `window.C2D` и снизить связность с глобальным EventBus.

## 1) Краткий обзор текущего состояния

- Сильная связность c EventBus из фич:
  - `src/features/quickActions/useQuickActionsToolbar.ts:42` — emit `A:Save`
  - `src/features/quickActions/useQuickActionsToolbar.ts:49` — emit `A:DrawingMode`
  - `src/features/quickActions/useQuickActionsToolbar.ts:56` — emit `A:ToggleRulerVisibility`
  - `src/features/quickActions/useQuickActionsToolbar.ts:108,115,130` — печать/скриншоты 3D через события
  - `src/features/quickActions/project/store/useProjectStore.ts:43` — подписка на `A:Save`
  - `src/features/quickActions/project/ProjectPopUpView.vue:223` — emit `A:ContantLoaded`
- Прямые обращения к глобалам 2D:
  - `src/features/quickActions/project/ProjectPopUpView.vue:229-230` — `window.C2D.layers.*.init(true)`
  - `src/features/quickActions/composables/use2DScreenshot.ts` и `useScreenshot.ts` — `window.C2D.app2d.renderer.extract`
- Следствия: трудно тестировать/расширять, нет явного жизненного цикла 2D; тяжело обрабатывать готовность/ошибки; дублирование логики.

## 2) Целевая архитектура

- Ввести «обертку» над 2D — `Constructor2DAdapter` (сервис) + Pinia‑store `useConstructor2DStore` (состояние/команды):
  - Adapter управляет жизненным циклом 2D (init/destroy), хранит ссылку на Pixi/Vue сущности, нормализует API 2D.
  - Store экспонирует готовность, текущую комнату, флаги режима чертежа/линеек, ошибки; проксирует команды в Adapter.
  - Внешние фичи (features) общаются только со Store/Adapter, без EventBus и `window.C2D`.
  - Для обратной связи (события 2D → UI) — локальный, типизированный emitter внутри Adapter либо коллбеки, но не глобальный EventBus.

## 3) Интерфейсы (контракты)

Пример целевых контрактов (набросок без реализации):

```ts
// useConstructor2DStore
state: {
  ready: boolean;
  initializing: boolean;
  error: string | null;
  currentRoomId: string | null;
  drawMode: boolean;
  rulerVisible: boolean;
}

actions: {
  init(container: HTMLElement): Promise<void>;
  destroy(): Promise<void>;
  waitReady(timeoutMs?: number): Promise<boolean>;

  // команды 2D
  setDrawMode(value: boolean): void;
  toggleDrawMode(): void;
  setRulerVisible(value: boolean): void;
  toggleRulerVisible(): void;
  makeScreenshot(): Promise<Blob>; // 2D скрин

  // загрузка/переключение комнат/проекта
  loadProject(data: unknown): Promise<void>;
  loadRoom(roomId: string): Promise<void>;
}

events (внутренние коллбеки/typed-emitter): {
  onReady(cb), onError(cb), onRoomChanged(cb), ...
}
```

Adapter инкапсулирует детали Pixi/2D‑модуля: доступ к stage, extract, слоям, подписки и т.д. Store держит только «сигналы» и команды.

## 4) Интеграция с существующими features

- QuickActions Toolbar (`src/features/quickActions/QuickActionsToolbar.vue`, `useQuickActionsToolbar.ts`):
  - Заменить emit’ы EventBus на вызовы store: `toggleDrawMode`, `toggleRulerVisible`.
  - Для 2D скрина — `constructor2D.makeScreenshot()` вместо `window.C2D.app2d...`.
- Project попап (`src/features/quickActions/project/ProjectPopUpView.vue`):
  - После загрузки проекта: `constructor2D.loadProject(projectData)`; убрать `window.C2D.layers.*.init(true)`.
  - Перед переходом на `/2d` можно подождать `await constructor2D.waitReady()`.
- Дубли композаблов `use2DScreenshot.ts` и `useScreenshot.ts`:
  - Свести к одному вызову через store; удалить второй после миграции.
- 3D‑связанные действия оставляем как есть, но «оркестрацию» печати 2D/3D делать из соответствующих оберток/сторов, а не через «сырой» EventBus.

## 5) Миграция по шагам (безопасно и итеративно)

1. Ввести Store и Adapter (пока никем не используемые):
   - `useConstructor2DStore` + `Constructor2DAdapter` с минимальным жизненным циклом (`init/destroy`, флаги ready/error).
   - Внутри Adapter — мост к текущему EventBus (временный), чтобы не ломать существующие вызовы.
2. Подключить Adapter в месте инициализации 2D (страница/компонент с канвасом):
   - Инициализация: `store.init(container)`; удалить прямые записи в `window.C2D` (оставить только внутри Adapter).
3. Перевести features на Store:
   - QuickActions: переключения draw/ruler → store; 2D скрин → store.
   - ProjectPopUp: загрузка/инициализация проекта → store.
   - Убрать прямые обращения к `window.C2D` и emit’ы EventBus из features.
4. Вынести все «A:*» события из 2D‑кода в Adapter:
   - Там где 2D слушает/шлет события — заменить на внутренние коллбеки/typed‑emitter Adapter’а.
   - Постепенно выключить мост к глобальному EventBus.
5. Уборка/жесткая изоляция:
   - Удалить неиспользуемые композаблы (`useScreenshot.ts`), убрать «временные» мости.
   - Включить строгие типы, запретить обращения к `window.C2D` вне Adapter.

## 6) Точки внимания/риски

- Готовность 2D: требуется явный `waitReady()` и прогнозируемая инициализация (Pixi, слои). Не полагаться на маршрут как признак готовности.
- Асинхронность: `loadProject/loadRoom` — промисы с состоянием «инициализируется/ошибка», таймауты/ретраи.
- Снимки: централизовать работу с Blob URL и их отзыв (`URL.revokeObjectURL`) после использования (чтобы не текла память).
- Совместимость: на время миграции EventBus оставить в Adapter как «бридж», чтобы фичи постепенно переехали.


## 8) Декомпозиция задач (порядок внедрения)

1. Подготовка
   - Ввести константы событий/роутов (минимум — для текущего кода) и удалить «магические строки».
   - Сверить «источники истины» по данным комнат (store `schemeTransition` и т.п.).
2. Базовый Adapter + Store
   - Реализовать каркас `init/destroy/waitReady`, хранение ссылок на Pixi/слои внутри Adapter.
   - Состояние в Store: `ready/initializing/error`.
3. Команды/состояния
   - `drawMode`/`rulerVisible` как state + методы `toggle*` (Adapter меняет 2D и синхронизирует Store).
   - `makeScreenshot()` — обертка над Pixi extract.
4. Интеграция с features
   - QuickActions: заменить EventBus на Store‑методы.
   - Проекты: `loadProject(data)` + ожидание `ready` перед `/2d`.
   - Удаление `useScreenshot.ts` или объединение с `use2DScreenshot.ts`.
5. Очистка EventBus
   - Удалить «A:*» из features; по месту — отключить мост в Adapter, где уже не требуется.
6. Финализация
   - Журнализация и ошибки: централизованный `useToast`/логгер; убрать `console.log`.
   - Документация: README для Adapter/Store (инициализация, события, контракт).

## 9) Что менять в первую очередь (быстрые победы)

- В features:
  - `use2DScreenshot.ts` — заменить прямой доступ к `window.C2D` на вызов `constructor2D.makeScreenshot()`.
  - `useQuickActionsToolbar.ts` — заменить emit’ы `A:DrawingMode`/`A:ToggleRulerVisibility` на `toggle*` из Store.
  - `ProjectPopUpView.vue` — убрать `window.C2D.layers.*.init(true)`, вызвать `constructor2D.loadProject()` и `await constructor2D.waitReady()` перед переходом на `/2d`.

## 10) Открытые вопросы

- Где именно инициализируется 2D‑канвас (контейнер) и кто «владелец» его жизненного цикла? (Страница/вид/компонент?)
- Нужно ли синхронизировать 2D и 3D состояния (напр., общие параметры проекта) через единый верхнеуровневый Store?
- Требуются ли оффскрин‑снапшоты 2D (без видимого канваса) для печати?


