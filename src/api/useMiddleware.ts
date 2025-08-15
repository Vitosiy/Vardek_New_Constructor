// @ts-nocheck

import { Middleware } from "openapi-fetch";
import { makeErrorResponse } from "./errorResponse";

// Константы таймаута
export const REQUEST_TIMEOUT = 10000; // 10 секунд
export const LEGACY_REQUEST_TIMEOUT = 15000; // 15 секунд для legacy API

// Паттерны для определения legacy endpoints
const LEGACY_PATTERNS = [
    '/local/templates/',
    '/API/data.basket.'
];

// Хук для создания middleware с таймаутами и legacy API поддержкой
export const useMiddleware = () => {
    // Глобальный Map для хранения timeout ID и controller
    const timeoutMap = new Map<string, { timeoutId: NodeJS.Timeout; controller: AbortController }>();

    // Утилита для создания ключа запроса
    const createRequestKey = (req: Request): string => {
        return `${req.method}:${req.url}`;
    };

    // Определяет, является ли endpoint legacy API
    const isLegacyEndpoint = (url: string): boolean => {
        return LEGACY_PATTERNS.some(pattern => url.includes(pattern));
    };

    // Получает таймаут для endpoint
    const getTimeoutForEndpoint = (url: string): number => {
        return isLegacyEndpoint(url) ? LEGACY_REQUEST_TIMEOUT : REQUEST_TIMEOUT;
    };

    // Middleware для таймаутов
    const timeoutMiddleware = () => {
        return {
            async onRequest(req: Request) {
                const controller = new AbortController();
                const timeout = getTimeoutForEndpoint(req.url);
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                // Клонируем request с новым signal
                const newRequest = new Request(req, { signal: controller.signal });

                //TODO
                // const token = localStorage.getItem('token')
                // newRequest.headers.set({})
                
                // Сохраняем timeout ID и controller в Map
                const requestKey = createRequestKey(req);
                timeoutMap.set(requestKey, { timeoutId, controller });

                return newRequest;
            },

            async onResponse(res: Response, req: Request) {
                const requestKey = createRequestKey(req);
                const timeoutData = timeoutMap.get(requestKey);
                
                if (timeoutData) {
                    clearTimeout(timeoutData.timeoutId);
                    timeoutMap.delete(requestKey);
                }
                
                return res;
            },
        };
    };

    // Middleware для legacy API
    const legacyMiddleware = () => {
        return {
            async onRequest(req: Request) {
                // Если это legacy endpoint, изменяем URL
                if (isLegacyEndpoint(req.url)) {
                    const url = new URL(req.url);
                    url.hostname = 'vardek.ru';
                    url.protocol = 'https:';
                    
                    return new Request(url.toString(), {
                        method: req.method,
                        headers: req.headers,
                        body: req.body,
                        signal: req.signal
                    });
                }
                
                return req;
            },
        };
    };

    // Создает объединенный middleware для openapi-fetch
    const createMiddleware = (): Middleware => {
        const timeout = timeoutMiddleware();
        const legacy = legacyMiddleware();

        return {
            async onRequest({ request, options }) {
                // Сначала применяем legacy middleware
                let processedRequest = await legacy.onRequest(request);
                // Затем применяем timeout middleware
                return await timeout.onRequest(processedRequest);
            },

            async onResponse({ request, response }) {
                return await timeout.onResponse(response, request);
            },

            async onError({ error, request }) {
                // Централизованная обработка ошибок
                const requestKey = createRequestKey(request);
                const timeoutData = timeoutMap.get(requestKey);
                if (timeoutData) {
                    clearTimeout(timeoutData.timeoutId);
                    timeoutMap.delete(requestKey);
                }
                return makeErrorResponse(error, 599);
            },
        };
    };

    return {
        createMiddleware
    };
}; 