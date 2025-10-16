// Mobile Service for offline functionality and device features
class MobileService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.deferredPrompt = null;
    this.notificationPermission = 'default';
    this.locationWatcher = null;
    
    this.initializeService();
  }

  // Initialize mobile service
  initializeService() {
    this.setupNetworkListeners();
    this.setupPWAListeners();
    this.requestNotificationPermission();
    this.initializeIndexedDB();
  }

  // Network status monitoring
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
      this.showToast('Connection restored', 'success');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showToast('Working offline', 'info');
    });
  }

  // PWA installation handling
  setupPWAListeners() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.showToast('App installed successfully!', 'success');
    });
  }

  // Install PWA
  async installPWA() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      
      this.deferredPrompt = null;
      return outcome === 'accepted';
    }
    return false;
  }

  // Notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      return permission === 'granted';
    }
    return false;
  }

  // Show notification
  showNotification(title, options = {}) {
    if (this.notificationPermission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
  }

  // Geolocation
  async getCurrentLocation(options = {}) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
          ...options
        }
      );
    });
  }

  // Watch location changes
  watchLocation(callback, options = {}) {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    this.locationWatcher = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
        ...options
      }
    );

    return this.locationWatcher;
  }

  // Stop watching location
  stopWatchingLocation() {
    if (this.locationWatcher) {
      navigator.geolocation.clearWatch(this.locationWatcher);
      this.locationWatcher = null;
    }
  }

  // Device orientation
  async requestOrientationPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      const permission = await DeviceOrientationEvent.requestPermission();
      return permission === 'granted';
    }
    return true; // Android doesn't need permission
  }

  // Haptic feedback
  vibrate(pattern = [100]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // Share API
  async share(data) {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Share failed:', error);
        return false;
      }
    }
    return false;
  }

  // Camera access
  async getCamera(constraints = { video: true, audio: false }) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      console.error('Camera access failed:', error);
      throw error;
    }
  }

  // IndexedDB initialization
  initializeIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TickTraxDB', 1);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create stores for offline data
        if (!db.objectStoreNames.contains('clockActions')) {
          const clockStore = db.createObjectStore('clockActions', { keyPath: 'id', autoIncrement: true });
          clockStore.createIndex('timestamp', 'timestamp', { unique: false });
          clockStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('timeEntries')) {
          const timeStore = db.createObjectStore('timeEntries', { keyPath: 'id', autoIncrement: true });
          timeStore.createIndex('date', 'date', { unique: false });
          timeStore.createIndex('userId', 'userId', { unique: false });
        }

        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData', { keyPath: 'id' });
        }
      };
    });
  }

  // Store data offline
  async storeOfflineData(storeName, data) {
    if (!this.db) await this.initializeIndexedDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get offline data
  async getOfflineData(storeName, query = null) {
    if (!this.db) await this.initializeIndexedDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = query ? store.get(query) : store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Sync offline data when back online
  async syncOfflineData() {
    try {
      const clockActions = await this.getOfflineData('clockActions');
      
      for (const action of clockActions) {
        try {
          const response = await fetch('/api/clock', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(action)
          });

          if (response.ok) {
            await this.removeOfflineData('clockActions', action.id);
          }
        } catch (error) {
          console.log('Sync failed for action:', action.id);
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  // Remove offline data
  async removeOfflineData(storeName, id) {
    if (!this.db) await this.initializeIndexedDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Show toast notification
  showToast(message, type = 'info') {
    // This would integrate with your toast system
    console.log(`Toast [${type}]: ${message}`);
    
    // Simple fallback toast
    if (window.createToast) {
      window.createToast(message, type);
    }
  }

  // Device info
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      onLine: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        pixelDepth: screen.pixelDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      orientation: screen.orientation ? screen.orientation.angle : 0,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    };
  }

  // Battery status (if available)
  async getBatteryInfo() {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        return {
          level: battery.level,
          charging: battery.charging,
          dischargingTime: battery.dischargingTime,
          chargingTime: battery.chargingTime
        };
      } catch (error) {
        return null;
      }
    }
    return null;
  }
}

// Create singleton instance
const mobileService = new MobileService();

export default mobileService;
