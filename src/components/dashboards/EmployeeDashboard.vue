<script setup>
import { ref } from 'vue';
import ClockWidget from '../ClockWidget.vue';
import Card from '../ui/card.vue';
import { CardContent, CardHeader, CardTitle } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import { Calendar, FileText, AlertCircle, TrendingUp, Download, Building2 } from 'lucide-vue-next';
import Badge from '../ui/badge.vue';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.vue';
import HelpCenter from '../help/HelpCenter.vue';
import AddTimeEntryDialog from '../dialogs/AddTimeEntryDialog.vue';
import TimeManagement from '../TimeManagement.vue';
import Schedule from '../Schedule.vue';
import EmployeeReports from '../EmployeeReports.vue';
import KioskMode from '../special/KioskMode.vue';
import { toast } from 'vue-sonner';

// Role types removed - using JavaScript

const props = defineProps({
  currentView: String,
  currentRole: String
});

const emit = defineEmits(['update:currentView']);

const isAddEntryOpen = ref(false);
const isKioskModeActive = ref(false);

const recentEntries = [
  { date: "2025-10-01", clockIn: "09:00 AM", clockOut: "05:30 PM", hours: "8.5", status: "approved" },
  { date: "2025-09-30", clockIn: "08:45 AM", clockOut: "05:15 PM", hours: "8.5", status: "approved" },
  { date: "2025-09-29", clockIn: "09:15 AM", clockOut: "06:00 PM", hours: "8.75", status: "pending" },
];

const stats = [
  { label: "Hours This Week", value: "40.5", icon: TrendingUp },
  { label: "Hours This Month", value: "162", icon: Calendar },
  { label: "Pending Entries", value: "2", icon: AlertCircle },
];

const handleLaunchKiosk = () => {
  isKioskModeActive.value = true;
  toast.success("Launching warehouse kiosk mode...");
};

const handleExitKiosk = () => {
  isKioskModeActive.value = false;
  toast.success("Exited warehouse kiosk mode");
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
              <TableHead>Date</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(entry, index) in recentEntries" :key="index">
              <TableCell>{{ entry.date }}</TableCell>
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
