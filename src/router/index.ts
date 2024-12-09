// @ts-nocheck 31

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
        // name: "Constructor2d",
        // component: () => import('@/views/Constructor2D.vue'),
        name: "Main",
        component: () => import('@/views/MainView.vue'),
      },
      {
        path: "/3d",
        name: "Constructor3d",
        component: () => import('@/views/The3D.vue'),
      },
      // {
      //   path: "/Main",
      //   name: "Main",
      //   component: () => import('@/views/MainView.vue'),
      // },

    ],
  },
  {
    path: "/auth",
    name: "Auth",
    component: () => import('@/views/auth/AuthView.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(baseUrl),
  routes,
});

export default router;
