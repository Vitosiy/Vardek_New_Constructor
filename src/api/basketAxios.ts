// @ts-nocheck
/**
 * Отдельный axios для корзины с дедупликацией GetBasket:
 * повторный вызов пока первый в полёте получает тот же Promise (один запрос в сеть).
 */
import axios from 'axios';
import { getCookie, COOKIE_NAMES } from '@/components/authorization/utils/cookieUtils';
import { BASE_DOMAIN } from '@/utils/originalDomain';

const BASE_API_URL = `https://${BASE_DOMAIN}/api/modellerjwt/basket`;
const REQUEST_TIMEOUT = 10_000;

const isGetBasketRequest = (url: string): boolean =>
  typeof url === 'string' && (url.includes('/GetBasket') || url.includes('/GetBasket/'));

let inFlightGetBasket: Promise<unknown> | null = null;

export const basketAxios = axios.create({
  baseURL: BASE_API_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

basketAxios.interceptors.request.use((config) => {
  const token = getCookie(COOKIE_NAMES.AUTH_TOKEN);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

basketAxios.interceptors.request.use((config) => {
  const url = config.url ?? '';
  const fullUrl = config.baseURL ? `${config.baseURL}${url}` : url;

  if (!isGetBasketRequest(fullUrl)) {
    return config;
  }

  if (inFlightGetBasket !== null) {
    config.adapter = () => inFlightGetBasket;
    return config;
  }

  const defaultAdapter = config.adapter || axios.defaults.adapter;
  config.adapter = (c) => {
    const p = defaultAdapter(c);
    inFlightGetBasket = p;
    Promise.resolve(p).finally(() => {
      inFlightGetBasket = null;
    });
    return p;
  };
  return config;
});
