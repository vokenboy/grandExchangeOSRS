import { createWebHistory, createRouter } from "vue-router";
import Home from "./views/Home.vue";
import ItemDetail from "./views/ItemDetail.vue";

const routes = [
  { path: "/", component: Home, name: "home" },
  { path: "/item/:id", component: ItemDetail, name: "item-detail" },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
