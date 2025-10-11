<script setup>
import { ref, computed, onMounted } from 'vue';
import Card from './ui/card.vue';
import { CardContent, CardHeader, CardTitle } from './ui/card-components.vue';
import Button from './ui/button.vue';
import Badge from './ui/badge.vue';
import Input from './ui/input.vue';
import Label from './ui/label.vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select.vue';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from './ui/chart-components.vue';
import {
  Download,
  Calendar,
  Clock,
  TrendingUp,
  Filter,
  FileText,
  Target,
} from 'lucide-vue-next';
// using the local toast utility

const selectedPeriod = ref('month');
const startDate = ref('');
const endDate = ref('');

// Mock data for charts
import apiService from '../services/apiService.js';
import authManager from '../services/authService.js';
import toast from '../utils/toast.js';

const weeklyHoursData = ref({ labels: [], datasets: [] });
const projectHoursData = ref({ labels: [], datasets: [] });
const workLocationData = ref({ labels: [], datasets: [] });
const monthlyTrendsData = ref({ labels: [], datasets: [] });
const pieChartColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'];

const summaryStats = ref({
  totalHours: 0,
  regularHours: 0,
  overtimeHours: 0,
  averageDaily: 0,
  punctualityScore: 0,
  projectsWorked: 0,
});

const detailedTimeEntries = ref([]);

const formatIso = (iso) => {
  if (!iso) return '';
  try { return iso.split('T')[0]; } catch (_) { return iso; }
}

const loadReportData = async () => {
  try {
    const cur = await authManager.getCurrentUser();
    if (!cur.success) throw new Error('Not signed in');
    const user = cur.data;
    // Prefer server-side payroll/report aggregation when available.
    // Try the payroll report endpoint first (may return totals, rows or a data wrapper).
    let payrollResp = null;
    let rows = [];
    try {
      payrollResp = await apiService.getPayrollReport(user.id, {
        period: selectedPeriod.value,
        start: startDate.value || undefined,
        end: endDate.value || undefined,
      });

      // payrollResp may be an array of rows, or an object with { rows, data, totals }
      if (Array.isArray(payrollResp)) {
        rows = payrollResp;
      } else if (payrollResp?.rows && Array.isArray(payrollResp.rows)) {
        rows = payrollResp.rows;
      } else if (payrollResp?.data && Array.isArray(payrollResp.data)) {
        rows = payrollResp.data;
      } else if (payrollResp?.items && Array.isArray(payrollResp.items)) {
        rows = payrollResp.items;
      } else {
        // unexpected shape - fallback to working times endpoint
        payrollResp = null;
        const data = await apiService.getUserWorkingTimes(user.id);
        rows = Array.isArray(data) ? data : (data?.data || []);
      }
    } catch (e) {
      // payroll endpoint may not exist on some backends; fallback to raw working times
      console.warn('Payroll report API failed, falling back to working times:', e);
      const data = await apiService.getUserWorkingTimes(user.id);
      rows = Array.isArray(data) ? data : (data?.data || []);
    }
    // Normalize rows into a consistent shape so charts consume a predictable model
    const normalized = rows.map(r => {
      const startRaw = r.start_time || r.started_at || r.timestamp || r.date || r.start || '';
      const endRaw = r.end_time || r.ended_at || r.stopped_at || r.stop_time || r.end || r.updated_at || '';

      const makeIsoDate = (s) => {
        if (!s) return '';
        try { return new Date(s).toISOString().split('T')[0]; } catch (_) { return String(s).split('T')[0] || ''; }
      };

      const computeEntryHours = (t) => {
        if (!t) return 0;
        const hourFields = [t.duration_hours, t.hours, t.regular_hours, t.total_hours, t.duration, t.hours_total];
        for (const v of hourFields) {
          const n = Number(v);
          if (!isNaN(n) && n !== 0) return n;
        }
        const minuteFields = [t.duration_minutes, t.minutes, t.total_minutes];
        for (const v of minuteFields) {
          const n = Number(v);
          if (!isNaN(n) && n !== 0) return n / 60;
        }
        // fallback to start/end timestamps
        if (!startRaw) return 0;
        const sd = new Date(startRaw);
        if (isNaN(sd)) return 0;
        let ed = endRaw ? new Date(endRaw) : null;
        if ((!ed || isNaN(ed)) && (r.status === 'running' || r.status === 'in_progress' || r.active)) ed = new Date();
        if (!ed || isNaN(ed)) return 0;
        const diff = (ed.getTime() - sd.getTime()) / (1000 * 60 * 60);
        return diff > 0 ? Math.round(diff * 100) / 100 : 0;
      };

      const dateIso = makeIsoDate(startRaw) || makeIsoDate(r.date) || '';

      return {
        raw: r,
        date: dateIso,
        start: startRaw || '',
        end: endRaw || '',
        project: r.project || r.task || '—',
        clockIn: r.clock_in || startRaw || '',
        clockOut: r.clock_out || endRaw || '',
        regular: Number(r.regular_hours || r.regular || 0) || 0,
        overtime: Number(r.overtime_hours || 0) || 0,
        total: Number(r.duration_hours || r.hours || computeEntryHours(r)) || 0,
        location: r.location || r.site || r.type || 'Unknown',
        status: r.status || (r.approved ? 'approved' : (r.pending_approval ? 'pending' : 'unknown')),
      };
    });

    detailedTimeEntries.value = normalized.map(n => ({
      date: formatIso(n.start || n.date),
      project: n.project,
      clockIn: n.clockIn,
      clockOut: n.clockOut,
      regular: n.regular,
      overtime: n.overtime,
      total: n.total,
      status: n.status,
    }));

    // --- Build chart data ---
    const today = new Date();
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      last7.push(d.toISOString().split('T')[0]);
    }

    // Weekly totals
    const regularByDay = {}; const overtimeByDay = {};
    last7.forEach(d => { regularByDay[d] = 0; overtimeByDay[d] = 0; });

    normalized.forEach(n => {
      const dt = n.date || (n.start ? (new Date(n.start).toISOString().split('T')[0]) : '');
      if (!dt) return;
      if (!last7.includes(dt)) return;
      regularByDay[dt] = (regularByDay[dt] || 0) + (Number(n.regular) || 0);
      overtimeByDay[dt] = (overtimeByDay[dt] || 0) + (Number(n.overtime) || 0);
      // if regular/overtime not present, attribute total to regular as fallback
      if ((!n.regular || Number(n.regular) === 0) && (!n.overtime || Number(n.overtime) === 0)) {
        regularByDay[dt] += Number(n.total || 0);
      }
    });

    weeklyHoursData.value = {
      labels: last7.slice(),
      datasets: [
        { label: 'Regular Hours', data: last7.map(d => Number((regularByDay[d] || 0).toFixed(2))), backgroundColor: '#3b82f6' },
        { label: 'Overtime', data: last7.map(d => Number((overtimeByDay[d] || 0).toFixed(2))), backgroundColor: '#f59e0b' },
      ]
    };

    // Work location: aggregate total hours per location across last 7 days and show average per day
    const locTotals = {};
    const normalizeLoc = (l) => {
      if (!l) return 'Unspecified';
      const s = String(l).trim();
      if (!s || /^unknown$/i.test(s)) return 'Unspecified';
      return s;
    };

    normalized.forEach(n => {
      const dt = n.date || (n.start ? (new Date(n.start).toISOString().split('T')[0]) : '');
      if (!dt || !last7.includes(dt)) return;
      const loc = normalizeLoc(n.location);
      locTotals[loc] = (locTotals[loc] || 0) + Number(n.total || 0);
    });
    const daysCount = last7.length || 1;
    const locAvgPerDay = {};
    Object.keys(locTotals).forEach(loc => { locAvgPerDay[loc] = Number((locTotals[loc] / daysCount).toFixed(2)); });
    workLocationData.value = {
      labels: Object.keys(locAvgPerDay),
      datasets: [{ label: 'Avg Hours/Day', data: Object.values(locAvgPerDay), backgroundColor: pieChartColors.slice(0, Object.keys(locAvgPerDay).length) }]
    };

    // Monthly trends (last 6 months)
    const months = []; const monthTotals = {};
    for (let m = 5; m >= 0; m--) {
      const d = new Date(); d.setMonth(d.getMonth() - m);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(key); monthTotals[key] = 0;
    }
    normalized.forEach(n => {
      const s = n.start || n.date || '';
      if (!s) return;
      const key = (new Date(s)).toISOString().slice(0,7);
      if (monthTotals.hasOwnProperty(key)) monthTotals[key] += Number(n.total || 0);
    });
    monthlyTrendsData.value = {
      labels: months.map(m => {
        const [y, mm] = m.split('-'); const d = new Date(Number(y), Number(mm)-1, 1);
        return d.toLocaleString(undefined, { month: 'short', year: 'numeric' });
      }),
      datasets: [{ label: 'Hours', data: months.map(m => Number((monthTotals[m] || 0).toFixed(2))), backgroundColor: '#3b82f6' }]
    };

    const total = normalized.reduce((s,n) => s + Number(n.total || 0), 0);
    const regular = normalized.reduce((s,n) => s + Number(n.regular || 0), 0);
    const overtime = normalized.reduce((s,n) => s + Number(n.overtime || 0), 0);
    summaryStats.value = {
      totalHours: Number(total.toFixed(2)),
      regularHours: Number(regular.toFixed(2)),
      overtimeHours: Number(overtime.toFixed(2)),
      averageDaily: (total / Math.max(1, 22)).toFixed(2),
      punctualityScore: 90,
      projectsWorked: new Set(normalized.map(n => n.project)).size,
    };
  } catch (err) {
    console.error('Load report data failed', err);
    toast.error('Failed to load report data');
  }
}

onMounted(loadReportData);

const hasWorkLocationData = computed(() => {
  return Array.isArray(workLocationData.value?.labels) && workLocationData.value.labels.length > 0 && Array.isArray(workLocationData.value?.datasets) && workLocationData.value.datasets.length > 0;
});

const handleExportReport = (format) => {
  toast({
    title: `Exporting report as ${format.toUpperCase()}...`,
  });
};

const periodLabel = computed(() => {
  switch (selectedPeriod.value) {
    case 'week':
      return 'This Week';
    case 'month':
      return 'This Month';
    case 'quarter':
      return 'This Quarter';
    case 'year':
      return 'This Year';
    case 'custom':
      return 'Custom Period';
    default:
      return 'This Month';
  }
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2>My Reports</h2>
        <p class="text-muted-foreground mt-1">
          View your time tracking reports and analytics
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Select v-model="selectedPeriod">
          <SelectTrigger class="w-40">
            <Calendar class="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="custom">Custom Period</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          class="gap-2"
          @click="handleExportReport('pdf')"
        >
          <Download class="h-4 w-4" />
          Export PDF
        </Button>
      </div>
    </div>

    <Card v-if="selectedPeriod === 'custom'">
      <CardHeader>
        <CardTitle>Custom Date Range</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="startDate">Start Date</Label>
            <Input id="startDate" type="date" v-model="startDate" />
          </div>
          <div class="space-y-2">
            <Label for="endDate">End Date</Label>
            <Input id="endDate" type="date" v-model="endDate" />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total Hours</p>
              <p class="text-2xl mt-1">{{ summaryStats.totalHours }}h</p>
              <p class="text-xs text-muted-foreground mt-1">
                Regular: {{ summaryStats.regularHours }}h | OT:
                {{ summaryStats.overtimeHours }}h
              </p>
            </div>
            <Clock class="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Daily Average</p>
              <p class="text-2xl mt-1">{{ summaryStats.averageDaily }}h</p>
              <p class="text-xs text-green-600 mt-1">
                +0.2h from last period
              </p>
            </div>
            <TrendingUp class="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      <!-- <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Punctuality</p>
              <p class="text-2xl mt-1">{{ summaryStats.punctualityScore }}%</p>
              <p class="text-xs text-muted-foreground mt-1">
                On-time clock ins
              </p>
            </div>
            <Target class="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card> -->
    </div>

    <Tabs defaultValue="overview" class="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
        <TabsTrigger value="detailed">Detailed</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Hours (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart :data="weeklyHoursData" />
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work Locations (Avg Hours/Day)</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="w-full h-[300px] rounded-[12px] flex items-center justify-center">
                <template v-if="hasWorkLocationData">
                  <div class="w-full h-full flex items-center justify-center">
                    <ResponsiveContainer width="70%" height="100%">
                      <PieChart :data="workLocationData" />
                    </ResponsiveContainer>
                  </div>
                </template>
                <template v-else>
                  <div class="text-center text-sm text-muted-foreground">
                    No work location data for the selected period.
                  </div>
                </template>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="trends" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends ({{ periodLabel }})</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart :data="monthlyTrendsData" />
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="detailed" class="space-y-6">
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>Detailed Time Entries</CardTitle>
              <div class="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  @click="handleExportReport('excel')"
                >
                  <FileText class="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Regular</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="(entry, index) in detailedTimeEntries"
                  :key="index"
                >
                  <TableCell>{{ entry.date }}</TableCell>
                  <TableCell>{{ entry.clockIn }}</TableCell>
                  <TableCell>{{ entry.clockOut }}</TableCell>
                  <TableCell>{{ entry.regular }}h</TableCell>
                  <TableCell
                    :class="entry.overtime > 0 ? 'text-orange-600' : ''"
                  >
                    {{ entry.overtime }}h
                  </TableCell>
                  <TableCell class="font-medium">{{ entry.total }}h</TableCell>
                  <TableCell>
                    <Badge
                      :variant="
                        entry.status === 'approved'
                          ? 'default'
                          : entry.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
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
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
