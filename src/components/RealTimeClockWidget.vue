<!-- REAL-TIME LIVE CLOCK COMPONENT -->
<template>
  <div class="real-time-clock-widget">
    <!-- Live Time Display -->
    <div class="live-time-section">
      <div class="current-time">
        <span class="time">{{ currentTime }}</span>
        <span class="date">{{ currentDate }}</span>
      </div>
      
      <!-- Connection Status -->
      <div class="connection-status" :class="connectionClass">
        <div class="status-indicator"></div>
        <span class="status-text">{{ connectionStatus }}</span>
      </div>
    </div>

    <!-- Active Time Entry (Real-time) -->
    <div v-if="activeEntry" class="active-time-entry">
      <div class="entry-header">
        <h3>Active Session</h3>
        <div class="live-badge">LIVE</div>
      </div>
      
      <div class="entry-details">
        <p class="project">{{ activeEntry.project || 'General Work' }}</p>
        <p class="started-at">Started: {{ formatTime(activeEntry.started_at) }}</p>
        <p class="duration">Duration: {{ activeDuration }}</p>
      </div>
      
      <!-- Real-time Actions -->
      <div class="real-time-actions">
        <button 
          @click="clockOut" 
          class="clock-out-btn"
          :disabled="isProcessing"
        >
          <span v-if="isProcessing">Processing...</span>
          <span v-else>Clock Out</span>
        </button>
      </div>
    </div>

    <!-- Clock In Section -->
    <div v-else class="clock-in-section">
      <button 
        @click="clockIn" 
        class="clock-in-btn"
        :disabled="isProcessing"
      >
        <span v-if="isProcessing">Processing...</span>
        <span v-else>Clock In</span>
      </button>
    </div>

    <!-- Live Team Status -->
    <div v-if="teamMembers.length" class="live-team-status">
      <h4>Team Status</h4>
      <div class="team-members">
        <div 
          v-for="member in teamMembers" 
          :key="member.id"
          class="team-member"
          :class="{ online: member.online, working: member.working }"
        >
          <div class="member-avatar">
            {{ member.name.charAt(0) }}
          </div>
          <div class="member-info">
            <span class="name">{{ member.name }}</span>
            <span class="status">{{ member.working ? 'Working' : (member.online ? 'Online' : 'Offline') }}</span>
          </div>
          <div class="status-dot"></div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Feed (Real-time) -->
    <div v-if="recentActivity.length" class="activity-feed">
      <h4>Recent Activity</h4>
      <div class="activity-list">
        <div 
          v-for="activity in recentActivity.slice(0, 5)" 
          :key="activity.id"
          class="activity-item"
          :class="activity.type"
        >
          <div class="activity-icon">
            <i :class="getActivityIcon(activity.type)"></i>
          </div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.message }}</p>
            <span class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Notifications -->
    <div v-if="notifications.length" class="live-notifications">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification-item"
        :class="notification.type"
      >
        <div class="notification-content">
          <strong>{{ notification.title }}</strong>
          <p>{{ notification.message }}</p>
        </div>
        <button @click="dismissNotification(notification.id)" class="dismiss-btn">×</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import realTimeService from '../services/realTimeService.js'
import authManager from '../services/authService.js'
import { toast } from '../utils/toast.js'

export default {
  name: 'RealTimeClockWidget',
  setup() {
    // ==================== REACTIVE STATE ====================
    
    const currentTime = ref('')
    const currentDate = ref('')
    const isConnected = ref(false)
    const isProcessing = ref(false)
    
    const activeEntry = ref(null)
    const activeDuration = ref('00:00:00')
    
    const teamMembers = ref([])
    const recentActivity = ref([])
    const notifications = ref([])
    
    // ==================== COMPUTED PROPERTIES ====================
    
    const connectionClass = computed(() => ({
      connected: isConnected.value,
      disconnected: !isConnected.value
    }))
    
    const connectionStatus = computed(() => {
      return isConnected.value ? 'Live' : 'Connecting...'
    })

    // ==================== TIME MANAGEMENT ====================
    
    let timeInterval = null
    let durationInterval = null
    
    /**
     * Update current time display
     */
    function updateTime() {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      currentDate.value = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    /**
     * Update active duration
     */
    function updateDuration() {
      if (!activeEntry.value) return
      
      const start = new Date(activeEntry.value.started_at)
      const now = new Date()
      const diff = now - start
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      activeDuration.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    // ==================== REAL-TIME EVENTS ====================
    
    /**
     * Initialize real-time connection
     */
    async function initializeRealTime() {
      try {
        console.log('🚀 Initializing real-time features...')
        
        // Connect to WebSocket
        await realTimeService.connect()
        isConnected.value = true
        
        const user = authManager.currentUser
        if (!user) throw new Error('User not authenticated')
        
        // Join time tracking channel
        await realTimeService.joinTimeTracking(user.id)
        console.log('✅ Joined time tracking channel')
        
        // Join notifications channel  
        await realTimeService.joinNotifications(user.id)
        console.log('✅ Joined notifications channel')
        
        // Join team dashboard if user has team
        if (user.team_id) {
          await realTimeService.joinTeamDashboard(user.team_id)
          console.log('✅ Joined team dashboard channel')
        }
        
        // Set up event listeners
        setupRealTimeListeners()
        
        // Load initial data
        await loadInitialData()
        
        toast.success('🔴 Live updates enabled')
        
      } catch (error) {
        console.error('🔥 Real-time initialization failed:', error)
        isConnected.value = false
        toast.error('Failed to enable live updates')
      }
    }
    
    /**
     * Set up real-time event listeners
     */
    function setupRealTimeListeners() {
      // Connection events
      realTimeService.on('connected', () => {
        isConnected.value = true
        console.log('🔴 Real-time connection established')
      })
      
      realTimeService.on('disconnected', () => {
        isConnected.value = false
        console.log('🔴 Real-time connection lost')
      })
      
      // Time tracking events
      realTimeService.on('clock_in', (data) => {
        console.log('🕐 Real-time clock in:', data)
        activeEntry.value = data
        addActivity('clock_in', `Clocked in at ${formatTime(data.started_at)}`)
        toast.success('⏰ Clocked in successfully')
      })
      
      realTimeService.on('clock_out', (data) => {
        console.log('🕐 Real-time clock out:', data)
        activeEntry.value = null
        const duration = calculateDuration(data.started_at, data.ended_at)
        addActivity('clock_out', `Clocked out after ${duration}`)
        toast.success('⏰ Clocked out successfully')
      })
      
      realTimeService.on('time_entry_updated', (data) => {
        console.log('🕐 Time entry updated:', data)
        if (data.active) {
          activeEntry.value = data
        }
      })
      
      // Team events
      realTimeService.on('team_member_online', (data) => {
        console.log('👥 Team member online:', data)
        updateTeamMemberStatus(data.user_id, { online: true })
        addActivity('team_online', `${data.name} came online`)
      })
      
      realTimeService.on('team_member_offline', (data) => {
        console.log('👥 Team member offline:', data)
        updateTeamMemberStatus(data.user_id, { online: false, working: false })
        addActivity('team_offline', `${data.name} went offline`)
      })
      
      realTimeService.on('team_stats_updated', (data) => {
        console.log('📊 Team stats updated:', data)
        // Update team statistics in real-time
      })
      
      // Notification events
      realTimeService.on('notification', (data) => {
        console.log('🔔 Real-time notification:', data)
        addNotification(data)
      })
      
      realTimeService.on('alert', (data) => {
        console.log('🚨 Real-time alert:', data)
        addNotification({ ...data, type: 'alert' })
        toast.warning(data.message)
      })
    }

    // ==================== TIME TRACKING ACTIONS ====================
    
    /**
     * Clock in with real-time broadcast
     */
    async function clockIn() {
      try {
        isProcessing.value = true
        console.log('⏰ Clocking in with real-time...')
        
        // Get location if available
        let location = null
        if (navigator.geolocation) {
          try {
            const position = await getCurrentPosition()
            location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          } catch (error) {
            console.warn('Could not get location:', error)
          }
        }
        
        // Send real-time clock in
        realTimeService.clockIn(location)
        
        console.log('✅ Clock in broadcast sent')
        
      } catch (error) {
        console.error('🔥 Clock in failed:', error)
        toast.error('Failed to clock in')
      } finally {
        isProcessing.value = false
      }
    }
    
    /**
     * Clock out with real-time broadcast  
     */
    async function clockOut() {
      try {
        isProcessing.value = true
        console.log('⏰ Clocking out with real-time...')
        
        // Get location if available
        let location = null
        if (navigator.geolocation) {
          try {
            const position = await getCurrentPosition()
            location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          } catch (error) {
            console.warn('Could not get location:', error)
          }
        }
        
        // Send real-time clock out
        realTimeService.clockOut(location)
        
        console.log('✅ Clock out broadcast sent')
        
      } catch (error) {
        console.error('🔥 Clock out failed:', error)
        toast.error('Failed to clock out')
      } finally {
        isProcessing.value = false
      }
    }

    // ==================== DATA MANAGEMENT ====================
    
    /**
     * Load initial data
     */
    async function loadInitialData() {
      try {
        // This would typically load from API
        // For now, we'll simulate with mock data
        
        teamMembers.value = [
          { id: 1, name: 'Alice Smith', online: true, working: true },
          { id: 2, name: 'Bob Johnson', online: true, working: false },
          { id: 3, name: 'Charlie Brown', online: false, working: false }
        ]
        
        recentActivity.value = [
          {
            id: 1,
            type: 'clock_in',
            message: 'You clocked in',
            timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
          }
        ]
        
      } catch (error) {
        console.error('🔥 Failed to load initial data:', error)
      }
    }
    
    /**
     * Update team member status
     */
    function updateTeamMemberStatus(userId, updates) {
      const memberIndex = teamMembers.value.findIndex(m => m.id === userId)
      if (memberIndex >= 0) {
        Object.assign(teamMembers.value[memberIndex], updates)
      }
    }
    
    /**
     * Add activity to feed
     */
    function addActivity(type, message) {
      recentActivity.value.unshift({
        id: Date.now(),
        type,
        message,
        timestamp: new Date()
      })
      
      // Keep only recent 10 activities
      if (recentActivity.value.length > 10) {
        recentActivity.value = recentActivity.value.slice(0, 10)
      }
    }
    
    /**
     * Add notification
     */
    function addNotification(notification) {
      notifications.value.unshift({
        id: notification.id || Date.now(),
        type: notification.type || 'info',
        title: notification.title || 'Notification',
        message: notification.message,
        timestamp: new Date()
      })
    }
    
    /**
     * Dismiss notification
     */
    function dismissNotification(id) {
      const index = notifications.value.findIndex(n => n.id === id)
      if (index >= 0) {
        notifications.value.splice(index, 1)
      }
    }

    // ==================== UTILITIES ====================
    
    /**
     * Format time for display
     */
    function formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    /**
     * Format relative time
     */
    function formatRelativeTime(timestamp) {
      const now = new Date()
      const time = new Date(timestamp)
      const diff = now - time
      
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      
      if (days > 0) return `${days}d ago`
      if (hours > 0) return `${hours}h ago`
      if (minutes > 0) return `${minutes}m ago`
      return 'Just now'
    }
    
    /**
     * Calculate duration between timestamps
     */
    function calculateDuration(start, end) {
      const diff = new Date(end) - new Date(start)
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`
      }
      return `${minutes}m`
    }
    
    /**
     * Get activity icon class
     */
    function getActivityIcon(type) {
      const icons = {
        clock_in: 'fas fa-clock',
        clock_out: 'fas fa-clock',
        team_online: 'fas fa-user-plus',
        team_offline: 'fas fa-user-minus',
        break_start: 'fas fa-coffee',
        break_end: 'fas fa-play'
      }
      return icons[type] || 'fas fa-info-circle'
    }
    
    /**
     * Get current position
     */
    function getCurrentPosition() {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        })
      })
    }

    // ==================== LIFECYCLE ====================
    
    onMounted(() => {
      console.log('🚀 Real-time clock widget mounted')
      
      // Start time updates
      updateTime()
      timeInterval = setInterval(updateTime, 1000)
      
      // Start duration updates
      durationInterval = setInterval(updateDuration, 1000)
      
      // Initialize real-time features
      initializeRealTime()
    })
    
    onUnmounted(() => {
      console.log('🛑 Real-time clock widget unmounted')
      
      // Clear intervals
      if (timeInterval) clearInterval(timeInterval)
      if (durationInterval) clearInterval(durationInterval)
      
      // Disconnect real-time service
      realTimeService.disconnect()
    })

    // ==================== RETURN ====================
    
    return {
      // State
      currentTime,
      currentDate,
      isConnected,
      isProcessing,
      activeEntry,
      activeDuration,
      teamMembers,
      recentActivity,
      notifications,
      
      // Computed
      connectionClass,
      connectionStatus,
      
      // Methods
      clockIn,
      clockOut,
      dismissNotification,
      formatTime,
      formatRelativeTime,
      getActivityIcon
    }
  }
}
</script>

<style scoped>
.real-time-clock-widget {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

/* ==================== LIVE TIME SECTION ==================== */

.live-time-section {
  text-align: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 20px;
}

.current-time .time {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  font-family: 'SF Mono', monospace;
}

.current-time .date {
  display: block;
  font-size: 1rem;
  color: #6b7280;
  margin-top: 4px;
}

.connection-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.connection-status.connected {
  background: #dcfce7;
  color: #166534;
}

.connection-status.disconnected {
  background: #fef2f2;
  color: #dc2626;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.connected .status-indicator {
  background: #22c55e;
}

.disconnected .status-indicator {
  background: #ef4444;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ==================== ACTIVE TIME ENTRY ==================== */

.active-time-entry {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.entry-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.live-badge {
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  animation: pulse 2s infinite;
}

.entry-details p {
  margin: 8px 0;
  font-size: 0.95rem;
}

.entry-details .project {
  font-weight: 600;
  color: #1f2937;
}

.entry-details .started-at,
.entry-details .duration {
  color: #6b7280;
}

.entry-details .duration {
  font-family: 'SF Mono', monospace;
  font-weight: 600;
  font-size: 1.1rem;
  color: #0ea5e9;
}

/* ==================== ACTIONS ==================== */

.real-time-actions,
.clock-in-section {
  text-align: center;
}

.clock-in-btn,
.clock-out-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.clock-in-btn {
  background: #22c55e;
  color: white;
}

.clock-in-btn:hover {
  background: #16a34a;
}

.clock-out-btn {
  background: #ef4444;
  color: white;
}

.clock-out-btn:hover {
  background: #dc2626;
}

.clock-in-btn:disabled,
.clock-out-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ==================== TEAM STATUS ==================== */

.live-team-status {
  margin-bottom: 24px;
}

.live-team-status h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.team-members {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f9fafb;
  position: relative;
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #6b7280;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.member-info {
  flex: 1;
}

.member-info .name {
  display: block;
  font-weight: 500;
  color: #374151;
}

.member-info .status {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
}

.team-member.working .member-info .status {
  color: #059669;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
}

.team-member.online .status-dot {
  background: #22c55e;
}

.team-member.working .status-dot {
  background: #059669;
  animation: pulse 2s infinite;
}

/* ==================== ACTIVITY FEED ==================== */

.activity-feed h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  background: #f9fafb;
}

.activity-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #6b7280;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.activity-item.clock_in .activity-icon,
.activity-item.clock_out .activity-icon {
  background: #0ea5e9;
}

.activity-item.team_online .activity-icon {
  background: #22c55e;
}

.activity-item.team_offline .activity-icon {
  background: #ef4444;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 0.875rem;
  color: #374151;
  margin: 0 0 4px 0;
}

.activity-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* ==================== NOTIFICATIONS ==================== */

.live-notifications {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 320px;
}

.notification-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #3b82f6;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  animation: slideInRight 0.3s ease-out;
}

.notification-item.alert {
  border-left-color: #ef4444;
}

.notification-item.success {
  border-left-color: #22c55e;
}

.notification-content strong {
  display: block;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.notification-content p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.dismiss-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dismiss-btn:hover {
  color: #6b7280;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* ==================== RESPONSIVE ==================== */

@media (max-width: 768px) {
  .real-time-clock-widget {
    margin: 0 16px;
    max-width: none;
  }
  
  .current-time .time {
    font-size: 2rem;
  }
  
  .live-notifications {
    left: 16px;
    right: 16px;
    max-width: none;
  }
}
</style>