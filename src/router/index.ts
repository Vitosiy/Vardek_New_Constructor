// @ts-nocheck 31

import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

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
    component: DefaultLayout,
    redirect: "/",
    children: [
      {
        path: "/",
        name: "Main",
        component: MainView,
      },
      {
        path: "/2d",
        name: "Constructor2d",
        component: Constructor2D,
      },
      {
        path: "/3d",
        name: "Constructor3d",
        component: Constructor3DView,
      },
    ],
  },
  {
    path: "/auth",
    name: "Auth",
    component: AuthView,
  },
];

const router = createRouter({
  history: createWebHistory(baseUrl),
  routes,
});

export default router;
