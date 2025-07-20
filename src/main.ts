import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faDice,
  faDiceOne,
  faDiceTwo,
  faDiceThree,
  faDiceFour,
  faDiceFive,
  faDiceSix,
  faDiceD20,
  faHome as faCastle,
  faUsers,
  faCoins,
  faScroll,
  faCrown,
  faShield,
  faWandMagicSparkles as faSword,
  faHatWizard as faMagic,
  faHeart,
  faStar,
  faGem,
  faKey,
  faBook,
  faFlask,
  faHammer,
  faEye,
  faFire,
  faLeaf,
  faSnowflake,
  faBolt,
  faSignal,
  faPlus,
  faMinus,
  faArrowsRotate as faRefresh,
  faTrash,
  faCopy,
  faSave,
  faDownload,
  faUpload,
  faCog,
  faHome,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
  faTimes,
  faCheck,
  faExclamationTriangle,
  faInfoCircle,
  faQuestionCircle,
  faBars,
  faSearch,
  faFilter,
  faSort,
  faEdit,
  faTrashAlt,
  faClone,
  faShuffle as faRandom,
  faHistory,
  faCalendar,
  faClock,
  faLocationDot as faMapMarker,
  faGlobe,
  faBuilding,
  faStore,
  faWarehouse,
  faTruck,
  faHandshake,
  faBalanceScale,
  faGavel,
  faShieldAlt,
  faUserShield,
  faUserTie,
  faUserNinja,
  faUserSecret,
  faUserCheck,
  faUserPlus,
  faUserMinus,
  faUserEdit,
  faChartLine,
  faChartBar,
  faChartPie,
  faTrophy,
  faMedal,
  faAward,
  faRibbon,
  faCertificate,
} from "@fortawesome/free-solid-svg-icons";

import App from "./App.vue";
import "./assets/css/main.css";

library.add(
  faDice,
  faDiceOne,
  faDiceTwo,
  faDiceThree,
  faDiceFour,
  faDiceFive,
  faDiceSix,
  faDiceD20,
  faCastle,
  faUsers,
  faCoins,
  faScroll,
  faCrown,
  faShield,
  faSword,
  faMagic,
  faHeart,
  faStar,
  faGem,
  faKey,
  faBook,
  faFlask,
  faHammer,
  faEye,
  faFire,
  faLeaf,
  faSnowflake,
  faBolt,
  faSignal,
  faPlus,
  faMinus,
  faRefresh,
  faTrash,
  faCopy,
  faSave,
  faDownload,
  faUpload,
  faCog,
  faHome,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
  faTimes,
  faCheck,
  faExclamationTriangle,
  faInfoCircle,
  faQuestionCircle,
  faBars,
  faSearch,
  faFilter,
  faSort,
  faEdit,
  faTrashAlt,
  faClone,
  faRandom,
  faHistory,
  faCalendar,
  faClock,
  faMapMarker,
  faGlobe,
  faBuilding,
  faStore,
  faWarehouse,
  faTruck,
  faHandshake,
  faBalanceScale,
  faGavel,
  faShieldAlt,
  faUserShield,
  faUserTie,
  faUserNinja,
  faUserSecret,
  faUserCheck,
  faUserPlus,
  faUserMinus,
  faUserEdit,
  faChartLine,
  faChartBar,
  faChartPie,
  faTrophy,
  faMedal,
  faAward,
  faRibbon,
  faCertificate
);

const app = createApp(App);

app.component("font-awesome-icon", FontAwesomeIcon);
app.use(createPinia());
app.use(router);

app.mount("#app");

// Register Service Worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      console.log('[SW] Service Worker registered successfully:', registration.scope);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New content available; please refresh.');
            }
          });
        }
      });
    } catch (error) {
      console.warn('[SW] Service Worker registration failed:', error);
    }
  });
} else if (!('serviceWorker' in navigator)) {
  console.log('[SW] Service Worker not supported in this browser');
} else {
  console.log('[SW] Service Worker disabled in development mode');
}
