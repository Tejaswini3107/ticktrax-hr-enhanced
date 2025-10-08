import { createApp } from 'vue';
import App from './App.vue';
import './index.css';
import './styles/mobile.css';

const app = createApp(App);

// Remove loading screen when app is ready
app.mount('#app');

// Remove loading screen after mount
document.querySelector('.app-loading')?.remove();
