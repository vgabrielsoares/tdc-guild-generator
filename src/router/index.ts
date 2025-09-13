import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/guild",
      name: "guild",
      component: () => import("@/views/GuildView.vue"),
    },
    {
      path: "/contracts",
      name: "contracts",
      component: () => import("@/views/ContractsView.vue"),
    },
    {
      path: "/services",
      name: "services",
      component: () => import("@/views/ServicesView.vue"),
    },
    {
      path: "/members",
      name: "members",
      component: () => import("@/views/MembersView.vue"),
    },
    {
      path: "/notices",
      name: "notices",
      component: () => import("@/views/NoticesView.vue"),
    },
    {
      path: "/renown",
      name: "renown",
      component: () => import("@/views/RenownView.vue"),
    },
    {
      path: "/timeline",
      name: "timeline",
      component: () => import("@/views/GuildTimelineView.vue"),
    },
  ],
});

// Handle SPA redirects from GitHub Pages 404
router.beforeEach((_to, _from, next) => {
  const redirectPath = sessionStorage.getItem("spa-redirect");
  if (redirectPath) {
    sessionStorage.removeItem("spa-redirect");
    next(redirectPath);
  } else {
    next();
  }
});

export default router;
