<script setup>
import { ref, computed } from 'vue';
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

// Mock schedule data
const weeklySchedules = [
  {
    weekOf: formatWeekRange(0),
    totalHours: 40,
    entries: [
      {
        id: '1',
        date: '2025-10-01',
        dayOfWeek: 'Monday',
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        hours: 8,
        location: 'Office',
        shift: 'Day Shift',
        status: 'completed',
      },
      {
        id: '2',
        date: '2025-10-02',
        dayOfWeek: 'Tuesday',
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        hours: 8,
        location: 'Remote',
        shift: 'Day Shift',
        status: 'completed',
      },
      {
        id: '3',
        date: '2025-10-03',
        dayOfWeek: 'Wednesday',
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        hours: 8,
        location: 'Office',
        shift: 'Day Shift',
        status: 'scheduled',
      },
      {
        id: '4',
        date: '2025-10-04',
        dayOfWeek: 'Thursday',
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        hours: 8,
        location: 'Office',
        shift: 'Day Shift',
        status: 'scheduled',
      },
      {
        id: '5',
        date: '2025-10-05',
        dayOfWeek: 'Friday',
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        hours: 8,
        location: 'Remote',
        shift: 'Day Shift',
        status: 'scheduled',
      },
    ],
  },
  {
    weekOf: formatWeekRange(1),
    totalHours: 40,
    entries: [
      {
        id: '6',
        date: '2025-10-08',
        dayOfWeek: 'Monday',
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        hours: 8,
        location: 'Office',
        shift: 'Day Shift',
        status: 'scheduled',
      },
      {
        id: '7',
        date: '2025-10-09',
        dayOfWeek: 'Tuesday',
        startTime: '10:00 AM',
        endTime: '06:00 PM',
        hours: 8,
        location: 'Client Site',
        shift: 'Modified Shift',
        status: 'modified',
      },
      {
        id: '8',
        date: '2025-10-10',
        dayOfWeek: 'Wednesday',
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        hours: 8,
        location: 'Office',
        shift: 'Day Shift',
        status: 'scheduled',
      },
      {
        id: '9',
        date: '2025-10-11',
        dayOfWeek: 'Thursday',
        startTime: '09:00 AM',
        endTime: '05:00 PM',
        hours: 8,
        location: 'Remote',
        shift: 'Day Shift',
        status: 'scheduled',
      },
      {
        id: '10',
        date: '2025-10-12',
        dayOfWeek: 'Friday',
        startTime: '09:00 AM',
        endTime: '01:00 PM',
        hours: 4,
        location: 'Office',
        shift: 'Half Day',
        status: 'scheduled',
      },
    ],
  },
];

const currentSchedule = computed(() => weeklySchedules[currentWeek.value] || weeklySchedules[0]);

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
  if (location.toLowerCase().includes('remote')) {
    return '🏠';
  } else if (location.toLowerCase().includes('client')) {
    return '🏢';
  } else {
    return '🏬';
  }
};

const dayScheduleForSelectedDate = computed(() => {
  const selectedDateStr = selectedDate.value.toISOString().split('T')[0];
  return weeklySchedules
    .flatMap((week) => week.entries)
    .find((entry) => entry.date === selectedDateStr);
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
              <p class="text-2xl mt-1">{{ currentSchedule.totalHours }}h</p>
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
              <p class="text-2xl mt-1">{{ currentSchedule.entries.length }}</p>
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
                {{
                  currentSchedule.entries.filter((e) =>
                    e.location.toLowerCase().includes('remote')
                  ).length
                }}
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
                  <CardTitle>Week of {{ currentSchedule.weekOf }}</CardTitle>
                  <p class="text-sm text-muted-foreground mt-1">
                    Total: {{ currentSchedule.totalHours }} hours scheduled
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
                  v-for="entry in currentSchedule.entries"
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
