<script setup>
import { ref, computed, onMounted } from 'vue';
import Card from './ui/card.vue';
import { CardContent, CardHeader, CardTitle } from './ui/card-components.vue';
import Button from './ui/button.vue';
import Badge from './ui/badge.vue';
import { Calendar } from './ui/calendar.vue';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table.vue';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs.vue';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next';

const selectedDate = ref(new Date());
const currentWeek = ref(0); // 0 = current week, 1 = next week, etc.
const viewMode = ref('week');

const getWeekDates = (weekOffset) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const formatWeekRange = (weekOffset) => {
  const dates = getWeekDates(weekOffset);
  const start = dates[0].toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const end = dates[6].toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${start} - ${end}`;
};

import apiService from '../services/apiService.js';
import authManager from '../services/authService.js';
import toast from '../utils/toast.js';

// Start empty; always prefer live API data. If API fails we'll show empty state and surface an error.
const weeklySchedules = ref([]);

const loadSchedules = async () => {
  try {
    const cur = await authManager.getCurrentUser();
    if (!cur.success) throw new Error('Not signed in');
    const user = cur.data;
    const constraints = await apiService.getEmployeeScheduleConstraints(user.id);
    // expect constraints to include schedule blocks; normalize into weeklySchedules
    if (Array.isArray(constraints) && constraints.length) {
      const normalized = constraints.map((c, idx) => {
        const rawEntries = Array.isArray(c.entries) ? c.entries : [];

        // helper to compute hours robustly per entry
        const computeEntryHours = (t) => {
          if (!t) return 0;
          // explicit hour-like fields
          const hourFields = [t.hours, t.duration_hours, t.duration, t.total_hours, t.hours_total];
          for (const v of hourFields) {
            const n = Number(v);
            if (!isNaN(n) && n !== 0) return n;
          }
          // minute-like fields
          const minuteFields = [t.minutes, t.duration_minutes, t.total_minutes];
          for (const v of minuteFields) {
            const n = Number(v);
            if (!isNaN(n) && n !== 0) return n / 60;
          }
          // fallback to start/end timestamps
          const s = t.start_time || t.start || t.started_at || t.timestamp || t.date;
          const e = t.end_time || t.end || t.ended_at || t.stopped_at || t.stop_time || t.updated_at;
          if (!s) return 0;
          const sd = new Date(s);
          if (isNaN(sd)) return 0;
          let ed = e ? new Date(e) : null;
          if ((!ed || isNaN(ed)) && (t.status === 'running' || t.status === 'in_progress' || t.active)) {
            ed = new Date();
          }
          if (!ed || isNaN(ed)) return 0;
          const diff = (ed.getTime() - sd.getTime()) / (1000 * 60 * 60);
          return diff > 0 ? Math.round(diff * 10) / 10 : 0;
        };

        const entries = rawEntries.map((raw, i) => {
          // derive a stable id
          const id = raw.id || raw.entry_id || `${idx}-${i}`;

          // determine a start timestamp to derive date and time
          const startRaw = raw.start_time || raw.start || raw.started_at || raw.timestamp || raw.date;
          const endRaw = raw.end_time || raw.end || raw.ended_at || raw.stopped_at || raw.stop_time || raw.updated_at;

          // normalize date to YYYY-MM-DD (ISO date portion)
          let dateStr = raw.date || '';
          if (!dateStr && startRaw) {
            try { dateStr = new Date(startRaw).toISOString().split('T')[0]; } catch(e) { dateStr = ''; }
          }

          // time strings for UI
          const formatTime = (ts) => {
            if (!ts) return '';
            const d = new Date(ts);
            if (isNaN(d)) return String(ts);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          };

          const startTime = raw.startTime || raw.start_time || raw.start || (startRaw ? formatTime(startRaw) : '');
          const endTime = raw.endTime || raw.end_time || raw.end || (endRaw ? formatTime(endRaw) : '');

          const hours = Number(raw.hours ?? raw.duration_hours ?? raw.total_hours ?? computeEntryHours(raw)) || 0;

          const dayOfWeek = raw.dayOfWeek || raw.day || (dateStr ? new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' }) : '');

          return {
            id,
            dayOfWeek,
            date: dateStr,
            startTime,
            endTime,
            hours,
            location: raw.location || raw.place || raw.site || '',
            shift: raw.shift || raw.shift_name || raw.title || raw.role || '',
            status: raw.status || 'scheduled',
          };
        });

        // compute week total hours
        const totalHours = entries.reduce((acc, e) => acc + (Number(e.hours) || 0), 0);

        return {
          weekOf: c.week_of || formatWeekRange(idx),
          totalHours: Math.round(totalHours * 10) / 10,
          entries,
        };
      });

      weeklySchedules.value = normalized;
    }
  } catch (err) {
    console.warn('Failed to load schedules', err);
    toast.error('Unable to load schedules from server. Please try again later.');
    // keep weeklySchedules empty so UI shows empty state
    weeklySchedules.value = [];
  }
}

onMounted(loadSchedules);

const currentSchedule = computed(() => {
  const weeks = Array.isArray(weeklySchedules.value) ? weeklySchedules.value : [];
  const s = weeks[currentWeek.value] || weeks[0] || null;
  return s || { weekOf: formatWeekRange(currentWeek.value), totalHours: 0, entries: [] };
});

// Safe, template-friendly accessors to avoid reading properties of undefined
const scheduleObj = computed(() => currentSchedule.value || { weekOf: formatWeekRange(currentWeek.value), totalHours: 0, entries: [] });
const scheduleTotalHours = computed(() => scheduleObj.value.totalHours ?? 0);
const scheduleEntries = computed(() => Array.isArray(scheduleObj.value.entries) ? scheduleObj.value.entries : []);
const scheduleWeekOf = computed(() => scheduleObj.value.weekOf ?? formatWeekRange(currentWeek.value));

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500 hover:bg-green-600';
    case 'scheduled':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'modified':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'missed':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
};

const getLocationIcon = (location) => {
  if (!location) return '🏬';
  const lower = String(location).toLowerCase();
  if (lower.includes('remote')) return '🏠';
  if (lower.includes('client')) return '🏢';
  return '🏬';
};

const dayScheduleForSelectedDate = computed(() => {
  const selectedDateStr = selectedDate.value.toISOString().split('T')[0];
  const weeks = Array.isArray(weeklySchedules.value) ? weeklySchedules.value : [];
  return weeks
    .flatMap((week) => Array.isArray(week.entries) ? week.entries : [])
    .find((entry) => entry && entry.date === selectedDateStr);
});
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2>My Schedule</h2>
      <p class="text-muted-foreground mt-1">
        View your work schedule and upcoming shifts
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">This Week</p>
              <p class="text-2xl mt-1">{{ scheduleTotalHours }}h</p>
            </div>
            <Clock class="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Days Scheduled</p>
              <p class="text-2xl mt-1">{{ scheduleEntries.length }}</p>
            </div>
            <CalendarIcon class="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Remote Days</p>
              <p class="text-2xl mt-1">
                {{ (scheduleEntries.filter((e) => e && e.location && String(e.location).toLowerCase().includes('remote'))).length }}
              </p>
            </div>
            <MapPin class="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>

    <Tabs v-model="viewMode">
      <div class="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="month">Month View</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="week" class="space-y-4">
        <!-- Week Navigation -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  @click="currentWeek = Math.max(0, currentWeek - 1)"
                  :disabled="currentWeek === 0"
                >
                  <ChevronLeft class="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle>Week of {{ scheduleWeekOf }}</CardTitle>
                      <p class="text-sm text-muted-foreground mt-1">
                        Total: {{ scheduleTotalHours }} hours scheduled
                      </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  @click="
                    currentWeek = Math.min(
                      weeklySchedules.length - 1,
                      currentWeek + 1
                    )
                  "
                  :disabled="currentWeek >= weeklySchedules.length - 1"
                >
                  <ChevronRight class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="entry in (currentSchedule?.entries ?? [])"
                  :key="entry.id"
                >
                  <TableCell class="font-medium">{{
                    entry.dayOfWeek
                  }}</TableCell>
                  <TableCell>{{ entry.date }}</TableCell>
                  <TableCell>
                    {{ entry.startTime }} - {{ entry.endTime }}
                  </TableCell>
                  <TableCell>{{ entry.hours }}h</TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <span>{{ getLocationIcon(entry.location) }}</span>
                      {{ entry.location }}
                    </div>
                  </TableCell>
                  <TableCell>{{ entry.shift }}</TableCell>
                  <TableCell>
                    <Badge :class="getStatusColor(entry.status)">
                      {{ entry.status }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="month" class="space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Calendar -->
          <div class="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  :selected="selectedDate"
                  @update:selected="selectedDate = $event"
                  class="rounded-md border w-full"
                />
              </CardContent>
            </Card>
          </div>

          <!-- Day Details -->
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {{
                    selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })
                  }}
                </CardTitle>
              </CardHeader>
              <CardContent class="space-y-4">
                <div
                  v-if="dayScheduleForSelectedDate"
                  class="space-y-3"
                >
                  <div class="flex items-center gap-2">
                    <Clock class="h-4 w-4 text-muted-foreground" />
                    <span>
                      {{ dayScheduleForSelectedDate.startTime }} -
                      {{ dayScheduleForSelectedDate.endTime }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <MapPin class="h-4 w-4 text-muted-foreground" />
                    <span>{{ dayScheduleForSelectedDate.location }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <User class="h-4 w-4 text-muted-foreground" />
                    <span>{{ dayScheduleForSelectedDate.shift }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm">Status:</span>
                    <Badge
                      :class="getStatusColor(dayScheduleForSelectedDate.status)"
                    >
                      {{ dayScheduleForSelectedDate.status }}
                    </Badge>
                  </div>
                  <div class="text-sm text-muted-foreground">
                    Total hours: {{ dayScheduleForSelectedDate.hours }}h
                  </div>
                </div>
                <div
                  v-else
                  class="text-center text-muted-foreground py-8"
                >
                  <CalendarIcon class="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No schedule for this day</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
