# API Service

TypeScript HTTP сервис с автоматическими таймаутами и поддержкой legacy API.

## Архитектура

```
src/api/
├── api.ts              # API клиент (openapi-fetch)
├── useMiddleware.ts    # Middleware с таймаутами и legacy API
├── types.ts            # TypeScript типы
├── schema.ts           # Автогенерированные типы
└── README.md           # Документация
```

## Быстрый старт

```typescript
import { client } from '@/api/api';

// Автоматически выбирает сервер и таймаут
const { data, error } = await client.GET('/api/tabs/tree');
```

## Endpoints

### 🎓 Обучение (dev.vardek.online)
```typescript
// Дерево табов для обучения
GET /api/tabs/tree

// Контент таба
GET /api/tabs/{id}/content

// Отправка отчета об ошибке
POST /api/tabs/report
```

### 🔐 Аутентификация (dev.vardek.online)
```typescript
// Вход в систему
POST /api/modeller/auth/login

// Проверка токена
POST /api/modeller/auth/token
```

### 📱 Основные данные (dev.vardek.online)
```typescript
// Получение данных приложения
GET /api/modeller/mainobject/get
```

### 🛍️ Каталог товаров (vardek.ru)
```typescript
// Получение каталога
GET /local/templates/constructor/API/data.get.php

// Детали товара
GET /local/templates/constructor/API/data.product.php

// Цена товара
POST /local/templates/constructor/API/data.price.php
```

### 🛒 Корзина (vardek.ru)
```typescript
// Получение корзины
POST /API/data.basket.get.php

// Добавление в корзину
POST /API/data.basket.add.php

// Расчет цены
POST /API/data.basket.getprice.php
```

## Автоматические возможности

### 🌐 Множественные серверы
- **Новые API**: `https://dev.vardek.online`
- **Legacy API**: `https://vardek.ru` (автоматически определяется по URL)

### ⏱️ Таймауты
- **Новые API**: 10 секунд
- **Legacy API**: 15 секунд
- Автоматическая отмена при превышении

### 🔄 Legacy паттерны
Автоматически определяются как legacy:
- `/local/templates/constructor/API/`
- `/API/data.basket.`

## Генерация типов

```bash
npm run api:generate-types
```

## Middleware

```typescript
import { useMiddleware } from '@/api/useMiddleware';

const { createMiddleware } = useMiddleware();
const middleware = createMiddleware();
```

## Добавление endpoints

1. Добавьте в `openapi_combined.json`
2. Сгенерируйте типы: `npm run api:generate-types`
3. Для legacy API добавьте паттерн в `LEGACY_PATTERNS` 