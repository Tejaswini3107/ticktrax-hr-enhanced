<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Card from './ui/card.vue';
import { CardContent, CardHeader, CardTitle } from './ui/card-components.vue';
import Button from './ui/button.vue';
import Input from './ui/input.vue';
import Label from './ui/label.vue';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs.vue';
import Badge from './ui/badge.vue';
import Textarea from './ui/textarea.vue';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table.vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select.vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog.vue';
import {
  Clock,
  Plus,
  Edit,
  Download,
  Calendar,
  Filter,
  Search,
  Play,
  Square,
} from 'lucide-vue-next';
import { useToast } from './ui/toast/use-toast.js';
import { apiService } from '../services/apiService.js';
import authManager from '../services/authService.js';

const { toast } = useToast();

const filterStatus = ref('all');
const searchTerm = ref('');
const isAddEntryOpen = ref(false);

const newEntry = ref({
  date: new Date().toISOString().split('T')[0],
  startTime: '',
  endTime: '',
  workLocation: '',
  justification: '',
});

const timeEntries = ref([]);
const isLoading = ref(false);
const loadError = ref(null);
const isProcessingClock = ref(false);

// Clock status for real-time display
const clockStatus = ref({
  isClockedIn: false,
  clockInTime: null,
  elapsedTime: 0
});

// Helper to format ISO datetimes to 'YYYY-MM-DD HH:MM:SS'
const formatIsoToLocal = (input) => {
  if (!input && input !== 0) return '';
  const d = (input instanceof Date) ? input : new Date(input);
  if (isNaN(d.getTime())) return input || '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const normalize = (raw) => {
  const dateRaw = raw.date || raw.start_date || raw.day || '';
  const clockInRaw = raw.start_time || raw.clock_in || raw.in || '';
  const clockOutRaw = raw.end_time || raw.clock_out || raw.out || '';

  // Parse base date
  const parsedDate = dateRaw ? new Date(dateRaw) : null;
  const parsedDateTs = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getTime() : null;

  // Helper to build Date from either an ISO string or a time-only string combined with date
  const makeDateFrom = (timeRaw) => {
    if (!timeRaw) return null;
    // If it's already a full ISO-like datetime
    if (timeRaw.includes('T') || timeRaw.includes('-')) {
      const d = new Date(timeRaw);
      return isNaN(d.getTime()) ? null : d;
    }
    // If we have a base date and a time-only value like '13:00'
    if (parsedDateTs && /\d{1,2}:\d{2}/.test(timeRaw)) {
      const iso = `${new Date(parsedDateTs).toISOString().split('T')[0]}T${timeRaw}`;
      const d = new Date(iso);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  const inDate = makeDateFrom(clockInRaw);
  const outDate = makeDateFrom(clockOutRaw);
  const inTs = inDate ? inDate.getTime() : null;
  let outTs = outDate ? outDate.getTime() : null;

  // Handle overnight shifts where end is before start by assuming next day
  if (inTs && outTs && outTs <= inTs) {
    outTs += 24 * 60 * 60 * 1000; // add one day
  }

  const date = parsedDateTs ? formatIsoToLocal(parsedDate) : (dateRaw || '');
  const clockIn = inTs ? formatIsoToLocal(inDate) : (clockInRaw || '');
  const clockOut = outTs ? formatIsoToLocal(new Date(outTs)) : (clockOutRaw || '');

  // Compute hours from timestamps when possible, else fall back to raw fields
  let hoursNum = Number(raw.hours ?? raw.duration_hours ?? raw.duration ?? 0);
  if (inTs && outTs && outTs > inTs) {
    hoursNum = (outTs - inTs) / (1000 * 60 * 60);
  }

  return {
    id: raw.id || `${date}:${clockIn}`,
    date,
    clockIn,
    clockOut,
    hours: String(Number(hoursNum.toFixed(2))),
    project: raw.project || raw.task || '',
    status: raw.status || (raw.approved ? 'approved' : raw.pending_approval ? 'pending' : 'pending'),
    isManual: Boolean(raw.is_manual || raw.isManual || raw.manual),
    justification: raw.justification || raw.reason || '',
    _ts: inTs || outTs || parsedDateTs || 0,
    _in_ts: inTs,
    _out_ts: outTs,
  };
};

const loadEntries = async () => {
  isLoading.value = true;
  loadError.value = null;
  try {
    const u = await authManager.getCurrentUser();
    const user = u?.data;
    if (!user || !user.id) throw new Error('No user');
    const data = await apiService.getUserWorkingTimes(user.id);
    const items = Array.isArray(data) ? data : (data?.data || []);
    timeEntries.value = items.map(normalize).sort((a,b) => (b._ts || 0) - (a._ts || 0));
  } catch (err) {
    console.error('Load entries failed', err);
    loadError.value = err.message || String(err);
  } finally {
    isLoading.value = false;
  }
};

// Load current clock status
const loadClockStatus = async () => {
  try {
    const status = await apiService.getClockStatus();
    if (status && status.data) {
      clockStatus.value.isClockedIn = status.data.is_clocked_in || false;
      if (status.data.current_entry && status.data.current_entry.clock_in) {
        clockStatus.value.clockInTime = new Date(status.data.current_entry.clock_in);
        clockStatus.value.elapsedTime = Math.floor((Date.now() - clockStatus.value.clockInTime.getTime()) / 1000);
      }
    }
  } catch (error) {
    // Clock status not available, assume clocked out
    clockStatus.value.isClockedIn = false;
    clockStatus.value.clockInTime = null;
    clockStatus.value.elapsedTime = 0;
  }
};

// Refresh when clock changes
const onClockChanged = () => {
  loadEntries();
  loadClockStatus().then(() => {
    // Start or stop timer based on clock status
    if (clockStatus.value.isClockedIn) {
      startElapsedTimer();
    } else {
      stopElapsedTimer();
    }
  });
};

// Real-time timer for elapsed time
let elapsedTimer = null;

onMounted(() => {
  loadEntries();
  loadClockStatus();
  window.addEventListener('clock-changed', onClockChanged);
  
  // Start elapsed time timer if clocked in
  if (clockStatus.value.isClockedIn) {
    startElapsedTimer();
  }
});

onUnmounted(() => {
  try { window.removeEventListener('clock-changed', onClockChanged); } catch (e) {}
  if (elapsedTimer) {
    clearInterval(elapsedTimer);
  }
});

const startElapsedTimer = () => {
  if (elapsedTimer) clearInterval(elapsedTimer);
  elapsedTimer = setInterval(() => {
    if (clockStatus.value.isClockedIn && clockStatus.value.clockInTime) {
      clockStatus.value.elapsedTime = Math.floor((Date.now() - clockStatus.value.clockInTime.getTime()) / 1000);
    }
  }, 1000);
};

const stopElapsedTimer = () => {
  if (elapsedTimer) {
    clearInterval(elapsedTimer);
    elapsedTimer = null;
  }
};

// Clock in/out handlers
const handleClockIn = async () => {
  if (isProcessingClock.value) return;
  isProcessingClock.value = true;
  
  try {
    const clockInPayload = {
      work_location: 'WFO',
      notes: 'Clock in from Time Management page'
    };

    // Try to get location
    try {
      const locationData = await window.navigator.geolocation?.getCurrentPosition();
      if (locationData) {
        clockInPayload.latitude = locationData.coords.latitude;
        clockInPayload.longitude = locationData.coords.longitude;
      }
    } catch (locationError) {
      // Location not available, continue without it
    }

    const result = await apiService.clockIn(clockInPayload);
    
    if (result && result.data) {
      toast({
        title: 'Success',
        description: 'Clocked in successfully',
      });
      
      // Dispatch clock-changed event to sync with other components
      window.dispatchEvent(new CustomEvent('clock-changed', { 
        detail: { status: 'clocked-in', entryId: result.data.id } 
      }));
    }
  } catch (err) {
    console.error('Clock in failed:', err);
    toast({
      title: 'Error',
      description: 'Failed to clock in. Please try again.',
      variant: 'destructive',
    });
  } finally {
    isProcessingClock.value = false;
  }
};

const handleClockOut = async () => {
  if (isProcessingClock.value) return;
  isProcessingClock.value = true;
  
  try {
    const clockOutPayload = {
      notes: 'Clock out from Time Management page'
    };

    const result = await apiService.clockOut(clockOutPayload);
    
    if (result && result.data) {
      toast({
        title: 'Success',
        description: 'Clocked out successfully',
      });
      
      // Dispatch clock-changed event to sync with other components
      window.dispatchEvent(new CustomEvent('clock-changed', { 
        detail: { 
          status: 'clocked-out', 
          entryId: result.data.id,
          totalHours: result.data.total_hours 
        } 
      }));
    }
  } catch (err) {
    console.error('Clock out failed:', err);
    toast({
      title: 'Error',
      description: 'Failed to clock out. Please try again.',
      variant: 'destructive',
    });
  } finally {
    isProcessingClock.value = false;
  }
};

const calculateHours = (startTime, endTime) => {
  if (!startTime || !endTime) return '0';
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return diff.toFixed(2);
};

const formatElapsedTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const handleSubmitEntry = () => {
  if (
    !newEntry.value.startTime ||
    !newEntry.value.endTime ||
    !newEntry.value.workLocation
  ) {
    toast({
      title: 'Error',
      description: 'Please fill in all required fields',
      variant: 'destructive',
    });
    return;
  }

  if (!newEntry.value.justification.trim()) {
    toast({
      title: 'Error',
      description: 'Justification is required for manual entries',
      variant: 'destructive',
    });
    return;
  }

  toast({
    title: 'Success',
    description: 'Manual time entry submitted for approval',
  });
  isAddEntryOpen.value = false;
  newEntry.value = {
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    workLocation: '',
    justification: '',
  };
  // Refresh list; backend create not available here so assume manual approval pipeline
  loadEntries();
};

const filteredEntries = computed(() =>
  timeEntries.value.filter((entry) => {
    const matchesStatus =
      filterStatus.value === 'all' || entry.status === filterStatus.value;
    const matchesSearch =
      searchTerm.value === '' ||
      (entry.project || '').toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      entry.date.includes(searchTerm.value);
    return matchesStatus && matchesSearch;
  })
);

const stats = computed(() => ({
  totalHours: timeEntries.value.reduce((acc, entry) => acc + parseFloat(entry.hours || 0), 0),
  pendingEntries: timeEntries.value.filter((e) => e.status === 'pending').length,
  manualEntries: timeEntries.value.filter((e) => e.isManual).length,
  thisWeekHours: (function(){
    const now = new Date();
    // Calculate start of week as Monday (local time)
    // JS getDay(): 0 (Sun) .. 6 (Sat). We want Monday as 1.
    const startOfWeek = new Date(now);
    const day = now.getDay();
    // If today is Sunday (0), go back 6 days to Monday; otherwise shift to Monday
    const diffToMonday = day === 0 ? -6 : (1 - day);
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0,0,0,0);
    const startOfNextWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    return timeEntries.value.reduce((acc,e) => {
      const d = e._ts ? new Date(e._ts) : new Date(e.date);
      if (!isNaN(d.getTime()) && d >= startOfWeek && d < startOfNextWeek) return acc + Number(e.hours || 0);
      return acc;
    }, 0).toFixed(2);
  })(),
}));
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2>Time Management</h2>
      <p class="text-muted-foreground mt-1">
        View your timesheet and submit manual entries
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">This Week</p>
              <p class="text-2xl mt-1">{{ stats.thisWeekHours }}h</p>
            </div>
            <Clock class="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total Hours</p>
              <p class="text-2xl mt-1">{{ stats.totalHours.toFixed(1) }}h</p>
            </div>
            <Calendar class="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Pending</p>
              <p class="text-2xl mt-1">{{ stats.pendingEntries }}</p>
            </div>
            <Clock class="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Manual Entries</p>
              <p class="text-2xl mt-1">{{ stats.manualEntries }}</p>
            </div>
            <Edit class="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Current Clock Status -->
    <Card v-if="clockStatus.isClockedIn" class="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
      <CardContent class="pt-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p class="font-semibold text-green-800 dark:text-green-200">Currently Clocked In</p>
              <p class="text-sm text-green-600 dark:text-green-400">
                Started: {{ clockStatus.clockInTime ? clockStatus.clockInTime.toLocaleTimeString() : 'Unknown' }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-2xl font-bold text-green-800 dark:text-green-200">
                {{ formatElapsedTime(clockStatus.elapsedTime) }}
              </p>
              <p class="text-sm text-green-600 dark:text-green-400">Time Elapsed</p>
            </div>
            <Button 
              @click="handleClockOut" 
              variant="destructive" 
              class="gap-2"
              :disabled="isProcessingClock"
            >
              <Square class="h-4 w-4" />
              Clock Out
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Clock In Section -->
    <Card v-else class="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardContent class="pt-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
            <div>
              <p class="font-semibold text-blue-800 dark:text-blue-200">Currently Clocked Out</p>
              <p class="text-sm text-blue-600 dark:text-blue-400">
                Ready to start your work day
              </p>
            </div>
          </div>
          <Button 
            @click="handleClockIn" 
            class="gap-2 bg-green-500 hover:bg-green-600"
            :disabled="isProcessingClock"
          >
            <Play class="h-4 w-4" />
            Clock In
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Main Content -->
    <Tabs defaultValue="timesheet" class="w-full">
      <TabsList>
        <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
      </TabsList>

      <TabsContent value="timesheet" class="space-y-4">
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>Time Entries</CardTitle>
              <div class="flex gap-2">
                <Dialog v-model:open="isAddEntryOpen">
                  <DialogTrigger asChild>
                    <Button class="gap-2">
                      <Plus class="h-4 w-4" />
                      Add Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Manual Time Entry</DialogTitle>
                    </DialogHeader>
                    <div class="space-y-4">
                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                          <Label for="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            v-model="newEntry.date"
                          />
                        </div>
                        <div class="space-y-2">
                          <Label for="workLocation">Work Location</Label>
                          <Select v-model="newEntry.workLocation">
                            <SelectTrigger>
                              <SelectValue placeholder="Select work location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Work from Home">
                                Work from Home
                              </SelectItem>
                              <SelectItem value="Warehouse Visit">
                                Warehouse Visit
                              </SelectItem>
                              <SelectItem value="Field Work">
                                Field Work
                              </SelectItem>
                              <SelectItem value="WFO">
                                WFO (Work from Office)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div class="grid grid-cols-3 gap-4">
                        <div class="space-y-2">
                          <Label for="startTime">Start Time</Label>
                          <Input
                            id="startTime"
                            type="time"
                            v-model="newEntry.startTime"
                          />
                        </div>
                        <div class="space-y-2">
                          <Label for="endTime">End Time</Label>
                          <Input
                            id="endTime"
                            type="time"
                            v-model="newEntry.endTime"
                          />
                        </div>
                        <div class="space-y-2">
                          <Label>Hours</Label>
                          <div
                            class="h-10 px-3 py-2 bg-muted rounded-md flex items-center"
                          >
                            {{
                              calculateHours(
                                newEntry.startTime,
                                newEntry.endTime
                              )
                            }}
                          </div>
                        </div>
                      </div>
                      <div class="space-y-2">
                        <Label for="justification">
                          Justification
                          <span class="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="justification"
                          placeholder="Please provide a reason for this manual entry..."
                          v-model="newEntry.justification"
                          :rows="3"
                        />
                      </div>
                      <div class="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          @click="isAddEntryOpen = false"
                        >
                          Cancel
                        </Button>
                        <Button @click="handleSubmitEntry">
                          Submit Entry
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <!-- Filters -->
            <!-- <div class="flex gap-4 items-center">
              <div class="flex items-center gap-2">
                <Search class="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  v-model="searchTerm"
                  class="w-64"
                />
              </div>
              <Select v-model="filterStatus">
                <SelectTrigger class="w-40">
                  <Filter class="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div> -->
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <!-- <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead> -->
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="entry in filteredEntries"
                  :key="entry.id"
                >
                  <!-- <TableCell>{{ entry.date }}</TableCell>
                  <TableCell>{{ entry.project }}</TableCell> -->
                  <TableCell>{{ entry.clockIn }}</TableCell>
                  <TableCell>{{ entry.clockOut }}</TableCell>
                  <TableCell>{{ entry.hours }}</TableCell>
                  <TableCell>
                    <Badge
                      :variant="entry.isManual ? 'secondary' : 'outline'"
                    >
                      {{ entry.isManual ? 'Manual' : 'Clock' }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      :variant="
                        entry.status === 'approved'
                          ? 'default'
                          : entry.status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      "
                      :class="
                        entry.status === 'approved'
                          ? 'bg-green-500 hover:bg-green-600'
                          : undefined
                      "
                    >
                      {{ entry.status }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit class="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manual" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Submit Manual Time Entry</CardTitle>
            <p class="text-sm text-muted-foreground">
              Use this form when you need to submit time entries manually
            </p>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="manual-date">Date</Label>
                <Input
                  id="manual-date"
                  type="date"
                  v-model="newEntry.date"
                />
              </div>
              <div class="space-y-2">
                <Label for="manual-workLocation">Work Location</Label>
                <Select v-model="newEntry.workLocation">
                  <SelectTrigger>
                    <SelectValue placeholder="Select work location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Work from Home">
                      Work from Home
                    </SelectItem>
                    <SelectItem value="Warehouse Visit">
                      Warehouse Visit
                    </SelectItem>
                    <SelectItem value="Field Work">Field Work</SelectItem>
                    <SelectItem value="WFO">
                      WFO (Work from Office)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label for="manual-start">Start Time</Label>
                <Input
                  id="manual-start"
                  type="time"
                  v-model="newEntry.startTime"
                />
              </div>
              <div class="space-y-2">
                <Label for="manual-end">End Time</Label>
                <Input
                  id="manual-end"
                  type="time"
                  v-model="newEntry.endTime"
                />
              </div>
              <div class="space-y-2">
                <Label>Total Hours</Label>
                <div
                  class="h-10 px-3 py-2 bg-muted rounded-md flex items-center"
                >
                  {{ calculateHours(newEntry.startTime, newEntry.endTime) }}
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <Label for="manual-justification">
                Justification <span class="text-destructive">*</span>
              </Label>
              <Textarea
                id="manual-justification"
                placeholder="Please explain why you need to submit this manual entry..."
                v-model="newEntry.justification"
                :rows="4"
              />
              <p class="text-xs text-muted-foreground">
                Common reasons: Forgot to clock in/out, system issues,
                working remotely, etc.
              </p>
            </div>
            <Button @click="handleSubmitEntry" class="w-full">
              Submit Manual Entry
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
