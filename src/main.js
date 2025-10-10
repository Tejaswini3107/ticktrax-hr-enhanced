import { createApp } from 'vue';
import App from './App.vue';
import './index.css';
import './styles/mobile.css';

import apiService from './services/apiService.js';
import authManager from './services/authService.js';

const app = createApp(App);

// Initialize stored tokens so apiService has jwt/xsrf available before routing
try {
	if (apiService && typeof apiService.initializeTokens === 'function') {
		apiService.initializeTokens();
	}
} catch (e) {
	console.warn('Token initialization failed:', e);
}

// Warm current user (try API then localStorage) to avoid refresh race that redirects to login
(async () => {
	try {
		await authManager.getCurrentUser();
	} catch (e) {
		// ignore - getCurrentUser is resilient and will fallback
	} finally {
		// Mount app after auth warm-up so router guards see correct state
		app.mount('#app');
		// Remove loading screen after mount
		document.querySelector('.app-loading')?.remove();
	}
})();
