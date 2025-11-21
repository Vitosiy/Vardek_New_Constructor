// @ts-nocheck
import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { getCookie, COOKIE_NAMES } from '@/components/authorization/utils/cookieUtils';
import { useAppData } from "@/store/appliction/useAppData";
import { useAuthStore } from "@/store/appStore/authStore";

const baseUrl = '/';
// const baseUrl = '/dev_modeller/';

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Public",
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: { path: "/2d" },
    children: [
      {
        path: "/2d",
        name: "Constructor2d",
        component: () => import('@/views/Constructor2D.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: "/3d",
        name: "Constructor3d",
        component: () => import('@/views/The3D.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: "/Main",
        name: "Main",
        component: () => import('@/views/MainView.vue'),
        meta: { requiresAuth: true }
      },
    ],
  },
  {
    path: "/auth",
    name: "Auth",
    component: () => import('@/views/AuthView.vue'),
    meta: { requiresAuth: false }
  },
];

//только в дев моде
if (import.meta.env.DEV) {
  routes.push({
    path: '/swagger',
    name: 'Swagger',
    component: () => import('@/views/dev/SwaggerUI.vue'),
    meta: { requiresAuth: false }
  });
}

const router = createRouter({
  history: createWebHistory(baseUrl),
  routes,
});

router.beforeEach((to, from, next) => {
  console.log('!!!to1:', to)
  const token = getCookie(COOKIE_NAMES.AUTH_TOKEN);
  const expirationTime = getCookie(COOKIE_NAMES.TOKEN_EXPIRATION);
  console.log('COOKIE_NAMES.AUTH_TOKEN', COOKIE_NAMES.AUTH_TOKEN)
  console.log('COOKIE_NAMES.TOKEN_EXPIRATION', COOKIE_NAMES.TOKEN_EXPIRATION)
  const appDataStore = useAppData()
  const authStore = useAuthStore()

     document.querySelector('#main-loader').style.display = 'block';

  if (token && expirationTime) {
    const expirationTimestamp = parseInt(expirationTime);
    if (Date.now() > expirationTimestamp) {
      console.log('Токен просрочен! Удаляю...', {
        currentTime: new Date().toLocaleString(),
        expirationTime: new Date(expirationTimestamp).toLocaleString(),
        timeDiff: Math.round((Date.now() - expirationTimestamp) / 1000 / 60) + ' минут'
      });
      // Удаляем просроченные куки
      document.cookie = `${COOKIE_NAMES.AUTH_TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${COOKIE_NAMES.TOKEN_EXPIRATION}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      next({ path: '/auth', query: to.query, hash: to.hash });
      return;
    } else {
      const secondsLeft = Math.round((expirationTimestamp - Date.now()) / 1000);
      const hoursLeft = Math.round(secondsLeft / 3600);
      console.log(`Токен действителен еще ${secondsLeft} сек. (${hoursLeft} часов)`);
      // next('/2d');
    }
  }

  if (to.meta.requiresAuth && !token) {
    // Перенаправляем на страницу авторизации, если требуется аутентификация
    next({ path: '/auth', query: to.query, hash: to.hash });
  } else if (to.path === '/auth' && token) {
    // Если пользователь уже авторизован, но пытается попасть на страницу авторизации
  console.log('!!!to1:', to)

    next({ path: '/2d', query: to.query, hash: to.hash });

  } else {
    // В остальных случаях разрешаем переход
    next();
  }
});

router.afterEach((to, from) => {
      document.querySelector('#main-loader').style.display = 'none';
  // Здесь выполняется код после завершения навигации.
  // 'to' - новый маршрут, 'from' - старый маршрут.
  console.log(`Переход на страницу ${to.path} завершен.`);
});

export default router;