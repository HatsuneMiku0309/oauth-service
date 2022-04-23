import { createApp } from 'vue';
import App from './App.vue';
// import './registerServiceWorker'
import router from './router';
// import store from './store/header';
import './main.css';

// console.log((<any> import.meta).env.VITE_TEST);
createApp(App).use(router).mount('#app');
