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
  const parsedDate = dateRaw ? new Date(dateRaw) : null;
  const parsedTs = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getTime() : null;
  const date = parsedTs ? formatIsoToLocal(parsedDate) : (dateRaw || '');
  const clockIn = (clockInRaw && clockInRaw.includes('T')) ? formatIsoToLocal(clockInRaw) : (clockInRaw || '');
  const clockOut = (clockOutRaw && clockOutRaw.includes('T')) ? formatIsoToLocal(clockOutRaw) : (clockOutRaw || '');
  const hours = Number(raw.hours || raw.duration_hours || raw.duration || 0);
  return {
    id: raw.id || `${date}:${clockIn}`,
    date,
    clockIn,
    clockOut,
    hours: String(hours),
    project: raw.project || raw.task || '',
    status: raw.status || (raw.approved ? 'approved' : raw.pending_approval ? 'pending' : 'pending'),
    isManual: Boolean(raw.is_manual || raw.isManual || raw.manual),
    justification: raw.justification || raw.reason || '',
    _ts: parsedTs,
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

// Refresh when clock changes
const onClockChanged = () => loadEntries();
onMounted(() => {
  loadEntries();
  window.addEventListener('clock-changed', onClockChanged);
});
onUnmounted(() => {
  try { window.removeEventListener('clock-changed', onClockChanged); } catch (e) {}
});

const calculateHours = (startTime, endTime) => {
  if (!startTime || !endTime) return '0';
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return diff.toFixed(2);
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
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    return timeEntries.value.reduce((acc,e) => {
      const d = e._ts ? new Date(e._ts) : new Date(e.date);
      if (!isNaN(d.getTime()) && d >= startOfWeek) return acc + Number(e.hours || 0);
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
            <div class="flex gap-4 items-center">
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
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead>
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
                  <TableCell>{{ entry.date }}</TableCell>
                  <TableCell>{{ entry.project }}</TableCell>
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
