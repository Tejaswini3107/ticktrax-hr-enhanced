// Real-time Service using Gotham API - No authentication required
import { apiService } from './apiService.js';

class RealTimeService {
  constructor() {
    this.isConnected = false;
    this.eventListeners = new Map();
    this.clockStatus = {
      isClockedIn: false,
      currentUser: null,
      clockInTime: null,
      totalHours: 0
    };
    this.syncInterval = null;
    this.notificationQueue = [];
  }

  // Initialize real-time service
  async initialize() {
    console.log('Initializing real-time service with Gotham API...');
    this.isConnected = true;
    this.startSync();
    this.emit('connected');
    return true;
  }

  // Start periodic sync with Gotham API
  startSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Sync every 30 seconds
    this.syncInterval = setInterval(() => {
      this.syncData();
    }, 30000);

    // Initial sync
    this.syncData();
  }

  // Sync data with Gotham API
  async syncData() {
    try {
      if (this.clockStatus.currentUser) {
        // Get current status from Gotham API
        const status = await apiService.getCurrentStatus(this.clockStatus.currentUser.id);
        
        const wasClocked = this.clockStatus.isClockedIn;
        this.clockStatus.isClockedIn = status.is_clocked_in;
        this.clockStatus.clockInTime = status.clock_in_time;
        this.clockStatus.totalHours = status.total_hours_today || 0;

        // Emit status change if changed
        if (wasClocked !== this.clockStatus.isClockedIn) {
          this.emit('clock-status-changed', this.clockStatus);
        }

        // Always emit time update for live clock
        this.emit('time-updated', this.clockStatus);
      }
    } catch (error) {
      console.error('Sync error:', error);
      this.emit('sync-error', error);
    }
  }

  // Event system
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const callbacks = this.eventListeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Event callback error:', error);
        }
      });
    }
  }

  // Clock operations using Gotham API
  async clockIn(user) {
    try {
      const result = await apiService.clockIn(user.id);
      
      this.clockStatus.currentUser = user;
      this.clockStatus.isClockedIn = true;
      this.clockStatus.clockInTime = result.clock_in_time || new Date().toISOString();
      
      this.emit('clock-in', {
        user,
        timestamp: this.clockStatus.clockInTime,
        success: true
      });

      this.addNotification({
        type: 'success',
        message: `${user.name} clocked in successfully`,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error('Clock in error:', error);
      this.emit('clock-error', { type: 'clock-in', error, user });
      throw error;
    }
  }

  async clockOut(user) {
    try {
      const result = await apiService.clockOut(user.id);
      
      this.clockStatus.isClockedIn = false;
      this.clockStatus.clockInTime = null;
      
      this.emit('clock-out', {
        user,
        timestamp: new Date().toISOString(),
        totalHours: result.total_hours,
        success: true
      });

      this.addNotification({
        type: 'success',
        message: `${user.name} clocked out. Total: ${result.total_hours} hours`,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error('Clock out error:', error);
      this.emit('clock-error', { type: 'clock-out', error, user });
      throw error;
    }
  }

  // Get real-time data
  async getTimeEntries(params = {}) {
    try {
      const entries = await apiService.getTimeEntries(params);
      this.emit('time-entries-updated', entries);
      return entries;
    } catch (error) {
      console.error('Get time entries error:', error);
      throw error;
    }
  }

  async getSchedules(params = {}) {
    try {
      const schedules = await apiService.getSchedules(params);
      this.emit('schedules-updated', schedules);
      return schedules;
    } catch (error) {
      console.error('Get schedules error:', error);
      throw error;
    }
  }

  async getTasks(params = {}) {
    try {
      const tasks = await apiService.getTasks(params);
      this.emit('tasks-updated', tasks);
      return tasks;
    } catch (error) {
      console.error('Get tasks error:', error);
      throw error;
    }
  }

  // User management
  setCurrentUser(user) {
    this.clockStatus.currentUser = user;
    // Start syncing for this user
    this.syncData();
  }

  getCurrentUser() {
    return this.clockStatus.currentUser;
  }

  // Get current clock status
  getClockStatus() {
    return { ...this.clockStatus };
  }

  // Notifications
  addNotification(notification) {
    this.notificationQueue.push({
      id: Date.now(),
      ...notification
    });
    this.emit('notification', notification);
  }

  getNotifications() {
    return [...this.notificationQueue];
  }

  clearNotifications() {
    this.notificationQueue = [];
    this.emit('notifications-cleared');
  }

  // Connection status
  isServiceConnected() {
    return this.isConnected;
  }

  // Disconnect
  disconnect() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isConnected = false;
    this.emit('disconnected');
  }

  // Utility methods for time calculations
  getElapsedTime() {
    if (!this.clockStatus.isClockedIn || !this.clockStatus.clockInTime) {
      return 0;
    }
    
    const clockInTime = new Date(this.clockStatus.clockInTime);
    const now = new Date();
    return Math.floor((now - clockInTime) / 1000); // seconds
  }

  formatElapsedTime() {
    const totalSeconds = this.getElapsedTime();
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Generate mock real-time updates for demo
  startDemoMode() {
    console.log('Starting demo mode with mock updates...');
    
    setInterval(() => {
      if (this.clockStatus.isClockedIn) {
        this.emit('time-updated', {
          ...this.clockStatus,
          elapsedTime: this.formatElapsedTime()
        });
      }
    }, 1000);

    // Mock data updates
    setInterval(() => {
      this.emit('live-data-update', {
        activeUsers: Math.floor(Math.random() * 10) + 1,
        totalHoursToday: Math.floor(Math.random() * 100) + 50,
        timestamp: new Date().toISOString()
      });
    }, 5000);
  }
}

// Export singleton instance
export const realTimeService = new RealTimeService();
export default realTimeService;