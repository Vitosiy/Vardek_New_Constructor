// @ts-nocheck
import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from "vue-router";

const baseUrl = '/';

import MainView from "@/views/MainView.vue";
import Constructor2D from "@/views/Constructor2D.vue";
import Constructor3DView from "@/views/The3D.vue";
import AuthView from "@/views/auth/AuthView.vue";

import DefaultLayout from "@/layouts/DefaultLayout.vue";

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
    component: () => import('@/views/auth/AuthView.vue'),
    meta: { requiresAuth: false }
  },
];

const router = createRouter({
  history: createWebHistory(baseUrl),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const expirationTime = localStorage.getItem('tokenExpiration');

  if (token && expirationTime) {
    if (Date.now() > parseInt(expirationTime)) {
      console.log('Токен просрочен! Удаляю...');
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiration');
      next('/auth');
      return;
    } else {
      console.log(`Токен действителен еще ${Math.round((parseInt(expirationTime) - Date.now())/1000)} сек.`);
    }
  }
  
  if (to.meta.requiresAuth && !token) {
    // Перенаправляем на страницу авторизации, если требуется аутентификация
    next('/auth');
  } else if (to.path === '/auth' && token) {
    // Если пользователь уже авторизован, но пытается попасть на страницу авторизации
    next('/2d');
  } else {
    // В остальных случаях разрешаем переход
    next();
  }
});

export default router;