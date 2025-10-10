<script setup>
import { computed } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.vue';
import { Button } from '../ui/button.vue';
import { Badge } from '../ui/badge.vue';
import Card from '../ui/card.vue';
import { CardContent } from '../ui/card-components.vue';
import {
  Clock,
  Calendar,
  MapPin,
  FileText,
  TrendingUp,
  Download,
} from 'lucide-vue-next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const props = defineProps({
  employee: {
    type: String,
    default: 'John Doe',
  },
  weekOf: {
    type: String,
    default: 'Oct 1, 2025',
  },
  entries: {
    type: Array,
    default: () => [],
  },
  open: Boolean,
});

const emit = defineEmits(['update:open']);

const defaultEntries = computed(() =>
  props.entries.length
    ? props.entries
    : [
        {
          date: '2025-10-01',
          clockIn: '08:00 AM',
          clockOut: '05:00 PM',
          hours: 9.0,
          status: 'approved',
          location: 'Main Office',
        },
        {
          date: '2025-09-30',
          clockIn: '08:15 AM',
          clockOut: '05:30 PM',
          hours: 9.25,
          status: 'approved',
          location: 'Main Office',
          overtime: true,
        },
        {
          date: '2025-09-29',
          clockIn: '08:00 AM',
          clockOut: '05:00 PM',
          hours: 9.0,
          status: 'approved',
          location: 'Main Office',
        },
        {
          date: '2025-09-28',
          clockIn: '08:30 AM',
          clockOut: '05:15 PM',
          hours: 8.75,
          status: 'pending',
          location: 'Main Office',
        },
        {
          date: '2025-09-27',
          clockIn: '08:00 AM',
          clockOut: '06:30 PM',
          hours: 10.5,
          status: 'approved',
          location: 'Field Site A',
          overtime: true,
          notes: 'Emergency repair work',
        },
      ]
);

  import apiService from '../../services/apiService.js';
  import authManager from '../../services/authService.js';
  import { ref, onMounted } from 'vue';

  // If no entries provided, attempt to load from API using employee prop (if present)
  const apiEntries = ref([]);
  const loadApiEntries = async () => {
    try {
      if (props.entries && props.entries.length) return;
      // if employee id available, load working times for that employee
      const empId = props.employeeId || (props.employee && props.employee.id);
      if (!empId) return;
      const data = await apiService.getUserWorkingTimes(empId);
      const rows = Array.isArray(data) ? data : (data?.data || []);
      apiEntries.value = rows.map(r => ({
        date: r.start_time ? r.start_time.split('T')[0] : (r.timestamp || ''),
        clockIn: r.clock_in || r.start_time || '',
        clockOut: r.clock_out || r.end_time || '',
        hours: r.duration_hours || r.hours || 0,
        status: r.status || (r.approved ? 'approved' : (r.pending_approval ? 'pending' : 'unknown')),
        location: r.location || r.notes || ''
      }));
    } catch (err) {
      console.warn('TimesheetDetailsDialog: failed to load entries', err);
    }
  };

  onMounted(loadApiEntries);

const totalHours = computed(() =>
  defaultEntries.value.reduce((sum, entry) => sum + entry.hours, 0)
);
const regularHours = computed(() =>
  defaultEntries.value
    .filter((e) => !e.overtime)
    .reduce((sum, entry) => sum + entry.hours, 0)
);
const overtimeHours = computed(() =>
  defaultEntries.value
    .filter((e) => e.overtime)
    .reduce((sum, entry) => sum + entry.hours, 0)
);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <FileText class="h-5 w-5" />
          Timesheet Details
        </DialogTitle>
        <DialogDescription>
          {{ employee }} • Week of {{ weekOf }}
        </DialogDescription>
      </DialogHeader>

      <!-- Summary Cards -->
      <div class="grid grid-cols-3 gap-4">
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"
              >
                <Clock class="h-5 w-5 text-primary" />
              </div>
              <div>
                <p class="text-2xl">{{ totalHours }}h</p>
                <p class="text-sm text-muted-foreground">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center"
              >
                <Calendar class="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p class="text-2xl">{{ regularHours }}h</p>
                <p class="text-sm text-muted-foreground">Regular</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center gap-3">
              <div
                class="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center"
              >
                <TrendingUp class="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p class="text-2xl">{{ overtimeHours }}h</p>
                <p class="text-sm text-muted-foreground">Overtime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Detailed Entries -->
      <div class="space-y-3">
        <h4>Time Entries</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(entry, index) in defaultEntries" :key="index">
              <TableCell>{{ formatDate(entry.date) }}</TableCell>
              <TableCell>{{ entry.clockIn }}</TableCell>
              <TableCell>{{ entry.clockOut }}</TableCell>
              <TableCell>
                <div class="flex items-center gap-1 text-sm">
                  <MapPin class="h-3 w-3 text-muted-foreground" />
                  {{ entry.location }}
                </div>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <span>{{ entry.hours }}h</span>
                  <Badge
                    v-if="entry.overtime"
                    variant="secondary"
                    class="text-xs bg-yellow-500/20 text-yellow-700"
                  >
                    OT
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  :variant="entry.status === 'approved' ? 'default' : 'secondary'"
                  :class="{
                    'bg-green-500 hover:bg-green-600': entry.status === 'approved',
                    'bg-red-500 hover:bg-red-600': entry.status === 'rejected',
                  }"
                >
                  {{ entry.status }}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Notes Section -->
      <div v-if="defaultEntries.some((e) => e.notes)" class="space-y-2">
        <h4>Notes</h4>
        <div class="space-y-2">
          <div
            v-for="(entry, index) in defaultEntries.filter((e) => e.notes)"
            :key="index"
            class="p-3 bg-accent/30 rounded-lg"
          >
            <div class="flex items-start gap-2">
              <FileText class="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p class="text-sm font-medium">
                  {{ formatDate(entry.date) }}
                </p>
                <p class="text-sm text-muted-foreground">{{ entry.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-between items-center pt-4 border-t">
        <div class="text-sm text-muted-foreground">
          {{
            defaultEntries.filter((e) => e.status === 'approved').length
          }}
          of {{ defaultEntries.length }} entries approved
        </div>
        <div class="flex gap-2">
          <Button variant="outline" @click="$emit('update:open', false)">
            Close
          </Button>
          <Button class="gap-2">
            <Download class="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
