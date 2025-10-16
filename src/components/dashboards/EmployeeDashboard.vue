<script setup>
import { ref, onMounted } from 'vue';
import ClockWidget from '../ClockWidget.vue';
import Card from '../ui/card.vue';
import { CardContent, CardHeader, CardTitle } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import { Calendar, FileText, AlertCircle, TrendingUp, Download, Building2, Play, Square } from 'lucide-vue-next';
import Badge from '../ui/badge.vue';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.vue';
import HelpCenter from '../help/HelpCenter.vue';
import AddTimeEntryDialog from '../dialogs/AddTimeEntryDialog.vue';
import TimeManagement from '../TimeManagement.vue';
import Schedule from '../Schedule.vue';
import EmployeeReports from '../EmployeeReports.vue';
import KioskMode from '../special/KioskMode.vue';
import { toast } from 'vue-sonner';

import { apiService } from '../../services/apiService.js';
import authManager from '../../services/authService.js';
import realTimeService from '../../services/realTimeService.js';
import { onUnmounted } from 'vue';

// Role types removed - using JavaScript

const props = defineProps({
  currentView: String,
  currentRole: String
});

const emit = defineEmits(['update:currentView']);

const isAddEntryOpen = ref(false);
const isKioskModeActive = ref(false);

const recentEntries = ref([]);
const stats = ref([
  { label: 'Hours This Week', value: '0', icon: TrendingUp },
  { label: 'Hours This Month', value: '0', icon: Calendar },
  { label: 'Pending Entries', value: '0', icon: AlertCircle },
]);

const isLoading = ref(false);
const loadError = ref(null);

// Helper to format a Date (or ISO string) to 'YYYY-MM-DD HH:MM:SS'
const formatIsoToLocal = (input) => {
  if (!input && input !== 0) return '';
  const d = (input instanceof Date) ? input : new Date(input);
  if (isNaN(d.getTime())) return input || '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const normalizeEntry = (raw) => {
  const dateRaw = raw.date || raw.start_date || raw.day || '';
  const clockInRaw = raw.start_time || raw.clock_in || raw.in || '';
  const clockOutRaw = raw.end_time || raw.clock_out || raw.out || '';

  // Parse possible date and time fields into timestamps
  const parsedDate = dateRaw ? new Date(dateRaw) : null;
  const parsedDateTs = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getTime() : null;

  const inDate = clockInRaw ? new Date(clockInRaw) : null;
  const outDate = clockOutRaw ? new Date(clockOutRaw) : null;
  const inTs = inDate && !isNaN(inDate.getTime()) ? inDate.getTime() : null;
  const outTs = outDate && !isNaN(outDate.getTime()) ? outDate.getTime() : null;

  // Prefer parsed date for the entry date, otherwise keep raw
  const date = parsedDateTs ? formatIsoToLocal(parsedDate) : (dateRaw || '');

  // Format clock in/out for display if parsable ISO-like; otherwise use raw
  const clockIn = inTs ? formatIsoToLocal(inDate) : (clockInRaw || '');
  const clockOut = outTs ? formatIsoToLocal(outDate) : (clockOutRaw || '');

  // Compute hours from timestamps when possible, else fall back to raw fields
  let hoursNum = Number(raw.hours ?? raw.duration_hours ?? raw.duration ?? 0);
  if (inTs && outTs && outTs > inTs) {
    hoursNum = (outTs - inTs) / (1000 * 60 * 60); // milliseconds -> hours
  }

  const status = raw.status || (raw.approved ? 'approved' : raw.pending_approval ? 'pending' : 'pending');

  // _ts is used for sorting: prefer inTs, then outTs, then parsedDateTs
  const sortTs = inTs || outTs || parsedDateTs || 0;

  return { date, clockIn, clockOut, hours: String(Number(hoursNum.toFixed(2))), status, _ts: sortTs, _in_ts: inTs, _out_ts: outTs };
};

const computeStats = (entries) => {
  const now = new Date();
  // Week is Monday -> Sunday. Compute startOfWeek as the most recent Monday at 00:00.
  const day = now.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
  const daysSinceMonday = (day + 6) % 7; // 0 when Monday, 1 when Tuesday, ..., 6 when Sunday
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0,0,0,0);
  startOfWeek.setDate(now.getDate() - daysSinceMonday);
  const startOfNextWeek = new Date(startOfWeek);
  startOfNextWeek.setDate(startOfWeek.getDate() + 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let weekHours = 0;
  let monthHours = 0;
  let pending = 0;

  entries.forEach((e) => {
    const ts = e._ts || null;
    const d = ts ? new Date(ts) : new Date(e.date);
    const h = Number(e.hours) || 0;
    if (!isNaN(d.getTime())) {
      if (d >= startOfWeek && d < startOfNextWeek) weekHours += h;
      if (d >= startOfMonth) monthHours += h;
    }
    if (e.status !== 'approved') pending += 1;
  });

  stats.value = [
    { label: 'Hours This Week', value: weekHours.toFixed(2), icon: TrendingUp },
    { label: 'Hours This Month', value: monthHours.toFixed(2), icon: Calendar },
    { label: 'Pending Entries', value: String(pending), icon: AlertCircle },
  ];
};

const loadDashboard = async () => {
  isLoading.value = true;
  loadError.value = null;
  try {
    if (!authManager.isAuthenticated()) {
      console.log('🚀 User not authenticated, skipping dashboard load');
      return;
    }

    // Load dashboard analytics using new API
    const analyticsData = await apiService.getDashboardAnalytics({
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      end_date: new Date().toISOString().split('T')[0] // today
    });

    // Load recent time entries
    const timeEntries = await apiService.getTimeEntries({
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      end_date: new Date().toISOString().split('T')[0], // today
      limit: 10
    });

    // Update recent entries
    if (timeEntries && timeEntries.data) {
      const entries = Array.isArray(timeEntries.data) ? timeEntries.data : [];
      recentEntries.value = entries.map(entry => ({
        id: entry.id,
        clock_in: entry.clock_in,
        clock_out: entry.clock_out,
        total_hours: entry.total_hours,
        work_location: entry.work_location,
        status: entry.status,
        _ts: new Date(entry.clock_in).getTime()
      }));
    }

    // Update stats with analytics data
    if (analyticsData && analyticsData.data) {
      stats.value = [
        { 
          label: 'Hours This Week', 
          value: analyticsData.data.weekly_hours?.toFixed(1) || '0', 
          icon: TrendingUp 
        },
        { 
          label: 'Hours This Month', 
          value: analyticsData.data.total_hours?.toFixed(1) || '0', 
          icon: Calendar 
        },
        { 
          label: 'Attendance Rate', 
          value: `${analyticsData.data.attendance_rate?.toFixed(1) || '0'}%`, 
          icon: AlertCircle 
        },
      ];
    }

    console.log('📊 Dashboard loaded:', { analyticsData, timeEntries });
  } catch (err) {
    console.error('Load dashboard failed:', err);
    loadError.value = err.message || String(err);
    
    // Fallback to empty state
    recentEntries.value = [];
    stats.value = [
      { label: 'Hours This Week', value: '0', icon: TrendingUp },
      { label: 'Hours This Month', value: '0', icon: Calendar },
      { label: 'Pending Entries', value: '0', icon: AlertCircle },
    ];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadDashboard();
  
  // Listen for clock changes from ClockWidget and refresh
  const onClockChanged = () => { loadDashboard(); };
  window.addEventListener('clock-changed', onClockChanged);
  
  // Setup realtime listeners
  const handleClockStatusChanged = (status) => {
    console.log('📡 Realtime: Clock status changed', status);
    loadDashboard(); // Refresh dashboard data
  };
  
  const handleClockUpdate = (data) => {
    // Live clock updates (every second)
    // This could update a live clock display if needed
  };
  
  const handleNotificationsUpdated = (notifications) => {
    console.log('📡 Realtime: Notifications updated', notifications);
    // Show notification toasts
    notifications.forEach(notif => {
      if (!notif.read) {
        toast.info(notif.message);
      }
    });
  };
  
  // Register realtime event listeners
  realTimeService.on('clock-status-changed', handleClockStatusChanged);
  realTimeService.on('clock-update', handleClockUpdate);
  realTimeService.on('notifications-updated', handleNotificationsUpdated);
  
  onUnmounted(() => {
    try { 
      window.removeEventListener('clock-changed', onClockChanged);
      // Cleanup realtime listeners
      realTimeService.off('clock-status-changed', handleClockStatusChanged);
      realTimeService.off('clock-update', handleClockUpdate);
      realTimeService.off('notifications-updated', handleNotificationsUpdated);
    } catch (e) {}
  });
});

const handleLaunchKiosk = () => {
  isKioskModeActive.value = true;
  toast.success("Launching warehouse kiosk mode...");
};

const handleExitKiosk = () => {
  isKioskModeActive.value = false;
  toast.success("Exited warehouse kiosk mode");
};

// Clock actions (call backend similar to ClockWidget)
const isProcessingClock = ref(false);
const clockIn = async () => {
  if (isProcessingClock.value) return;
  isProcessingClock.value = true;
  try {
    const res = await authManager.getCurrentUser();
    const uid = res?.data?.id;
    if (!uid) throw new Error('No user id');
    await apiService.clockInOut(uid, 'clocked-in');
    toast.success('Clocked in successfully');
    await loadDashboard();
  } catch (err) {
    console.error('Clock in failed', err);
    toast.error(err?.message || 'Clock in failed');
  } finally {
    isProcessingClock.value = false;
  }
};

const clockOut = async () => {
  if (isProcessingClock.value) return;
  isProcessingClock.value = true;
  try {
    const res = await authManager.getCurrentUser();
    const uid = res?.data?.id;
    if (!uid) throw new Error('No user id');
    await apiService.clockInOut(uid, 'clocked-out');
    toast.success('Clocked out successfully');
    await loadDashboard();
  } catch (err) {
    console.error('Clock out failed', err);
    toast.error(err?.message || 'Clock out failed');
  } finally {
    isProcessingClock.value = false;
  }
};
</script>

<template>
  <div v-if="currentView === 'clock'" class="max-w-2xl mx-auto">
    <div class="mb-6">
      <h2>Clock In / Clock Out</h2>
      <p class="text-muted-foreground mt-1">Track your work hours with our time clock system</p>
    </div>
    <ClockWidget :showLocation="true" />
  </div>

  <TimeManagement v-else-if="currentView === 'timesheet' || currentView === 'entry'" />
  <Schedule v-else-if="currentView === 'schedule'" />
  <EmployeeReports v-else-if="currentView === 'reports'" />
  <HelpCenter v-else-if="currentView === 'help'" :currentRole="currentRole" />

  <div v-else-if="isKioskModeActive" class="relative">
    <div class="absolute top-4 right-4 z-10">
      <Button variant="outline" @click="handleExitKiosk">Exit Kiosk Mode</Button>
    </div>
    <KioskMode />
  </div>

  <div v-else class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="stat in stats" :key="stat.label">
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">{{ stat.label }}</p>
              <p class="text-2xl mt-1">{{ stat.value }}</p>
            </div>
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <component :is="stat.icon" class="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1">
        <ClockWidget />
      </div>
      <div class="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 gap-3">
              <Button variant="outline" class="h-20 flex flex-col gap-2" @click="isAddEntryOpen = true">
                <FileText class="h-6 w-6" />
                Manual Entry
              </Button>
              <Button variant="outline" class="h-20 flex flex-col gap-2" @click="$emit('update:currentView', 'schedule')">
                <Calendar class="h-6 w-6" />
                View Schedule
              </Button>
              <Button variant="outline" class="h-20 flex flex-col gap-2" @click="$emit('update:currentView', 'reports')">
                <TrendingUp class="h-6 w-6" />
                View Reports
              </Button>
              <!-- <Button variant="outline" class="h-20 flex flex-col gap-2" @click="clockIn">
                <Play class="h-6 w-6" />
                Clock In
              </Button>
              <Button variant="outline" class="h-20 flex flex-col gap-2" @click="clockOut">
                <Square class="h-6 w-6" />
                Clock Out
              </Button> -->
              <Button variant="outline" class="h-20 flex flex-col gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5" @click="handleLaunchKiosk">
                <Building2 class="h-6 w-6 text-primary" />
                <span class="text-primary">Kiosk Mode</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Recent Time Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <!-- <TableHead>Date</TableHead> -->
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(entry, index) in recentEntries" :key="index">
              <!-- <TableCell>{{ entry.date }}</TableCell> -->
              <TableCell>{{ entry.clockIn }}</TableCell>
              <TableCell>{{ entry.clockOut }}</TableCell>
              <TableCell>{{ entry.hours }}</TableCell>
              <TableCell>
                <Badge :variant="entry.status === 'approved' ? 'default' : 'secondary'" :class="{ 'bg-green-500 hover:bg-green-600': entry.status === 'approved' }">
                  {{ entry.status }}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <AddTimeEntryDialog :open="isAddEntryOpen" @update:open="isAddEntryOpen = $event" />
  </div>
</template>
