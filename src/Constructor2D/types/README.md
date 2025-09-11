# Constructor2D Types

Эта папка содержит все типы и интерфейсы для Constructor2D, организованные по функциональности.

## Структура файлов

### 📁 `index.ts`
Централизованный экспорт всех типов. Основной файл для импорта типов.

### 📁 `facade.ts`
Типы для фасада Constructor2D:
- `WallType` - Типы стен
- `ObjectType` - Типы объектов (двери, окна)
- `RoomData` - Данные комнаты
- `WallModificationData` - Данные для модификации стены
- `ObjectData` - Данные объекта
- `ViewportSettings` - Настройки вида
- `Constructor2DEvents` - События
- `Constructor2DConfig` - Конфигурация
- `Constructor2DState` - Состояние

### 📁 `operations.ts`
Типы для операций:
- `OperationResult<T>` - Результат операции
- `RoomOperationResult` - Результат операции с комнатой
- `WallOperationResult` - Результат операции со стеной
- `ObjectOperationResult` - Результат операции с объектом
- `Constructor2DUtils` - Утилиты

### 📁 `layers.ts`
Типы для слоев:
- `LayerConfig` - Базовая конфигурация слоя
- `LayerState` - Базовое состояние слоя
- `PlannerLayerConfig/State` - Конфигурация и состояние слоя стен
- `HalfRoomLayerConfig/State` - Конфигурация и состояние слоя комнат
- `DoorsAndWindowsLayerConfig/State` - Конфигурация и состояние слоя объектов

### 📁 `constants.ts`
Константы:
- `CONSTRUCTOR2D_CONSTANTS` - Все константы системы
- `Constructor2DConstants` - Тип для констант

## Использование

### Импорт всех типов
```typescript
import type {
  RoomData,
  WallType,
  ObjectType,
  ViewportSettings
} from '@/Constructor2D/types';
```

### Импорт конкретных типов
```typescript
import type { RoomData } from '@/Constructor2D/types/facade';
import type { OperationResult } from '@/Constructor2D/types/operations';
import type { LayerConfig } from '@/Constructor2D/types/layers';
import { CONSTRUCTOR2D_CONSTANTS } from '@/Constructor2D/types/constants';
```

### Импорт через основной index
```typescript
import type {
  RoomData,
  WallType,
  ObjectType
} from '@/Constructor2D';
```

## Принципы организации

1. **Разделение по функциональности** - Каждый файл отвечает за свою область
2. **Централизованный экспорт** - Все типы доступны через index.ts
3. **Переиспользование** - Базовые типы используются в специализированных
4. **Типобезопасность** - Строгая типизация всех интерфейсов
5. **Документированность** - Каждый тип имеет JSDoc комментарии

## Расширение типов

При добавлении новых типов:

1. Определите, к какой категории относится тип
2. Добавьте его в соответствующий файл
3. Экспортируйте через index.ts
4. Обновите документацию

### Пример добавления нового типа
```typescript
// В facade.ts
export interface NewFeatureData {
  id: string;
  name: string;
  config: any;
}

// В index.ts
export type {
  // ... существующие типы
  NewFeatureData
} from './facade';
```
