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
    detailedTimeEntries.value = rows.map(r => ({
      date: formatIso(r.start_time || r.timestamp),
      project: r.project || r.task || '—',
      clockIn: r.clock_in || formatIso(r.start_time),
      clockOut: r.clock_out || formatIso(r.end_time),
      regular: r.regular_hours || r.hours || 0,
      overtime: r.overtime_hours || 0,
      total: r.duration_hours || r.hours || 0,
      status: r.status || (r.approved ? 'approved' : (r.pending_approval ? 'pending' : 'unknown'))
    }));

    // --- Build chart data ---
    // Weekly (last 7 days) labels
    const today = new Date();
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      last7.push(d.toISOString().split('T')[0]);
    }

    const regularByDay = {};
    const overtimeByDay = {};
    last7.forEach(d => { regularByDay[d] = 0; overtimeByDay[d] = 0; });

    // Populate per-day totals
    detailedTimeEntries.value.forEach(e => {
      const dt = e.date;
      if (!dt) return;
      const reg = Number(e.regular || 0);
      const ot = Number(e.overtime || 0);
      if (regularByDay.hasOwnProperty(dt)) {
        regularByDay[dt] += reg;
        overtimeByDay[dt] += ot;
      }
    });

    weeklyHoursData.value = {
      labels: last7.map(d => d),
      datasets: [
        { label: 'Regular Hours', data: last7.map(d => Number((regularByDay[d] || 0).toFixed(2))), backgroundColor: '#3b82f6' },
        { label: 'Overtime', data: last7.map(d => Number((overtimeByDay[d] || 0).toFixed(2))), backgroundColor: '#f59e0b' },
      ]
    };

    // Work location: compute average hours per day (over the last 7 days)
    const locByDay = {};
    last7.forEach(d => { locByDay[d] = {}; });

    rows.forEach(r => {
      const s = r.start_time || r.timestamp || r.date || '';
      const dt = s ? s.split('T')[0] : '';
      if (!dt || !locByDay.hasOwnProperty(dt)) return; // only consider last 7 days
      const loc = (r.location || r.type || 'Unknown');
      const hrs = Number(r.duration_hours || r.hours || 0) || 0;
      locByDay[dt][loc] = (locByDay[dt][loc] || 0) + hrs;
    });

    // Sum across days and compute average per day
    const locTotals = {};
    last7.forEach(d => {
      const dayMap = locByDay[d] || {};
      Object.keys(dayMap).forEach(loc => {
        locTotals[loc] = (locTotals[loc] || 0) + dayMap[loc];
      });
    });

    const daysCount = last7.length || 1;
    const locAvgPerDay = {};
    Object.keys(locTotals).forEach(loc => {
      locAvgPerDay[loc] = Number((locTotals[loc] / daysCount).toFixed(2));
    });

    workLocationData.value = {
      labels: Object.keys(locAvgPerDay),
      datasets: [{ label: 'Avg Hours/Day', data: Object.values(locAvgPerDay), backgroundColor: pieChartColors.slice(0, Object.keys(locAvgPerDay).length) }]
    };

    // Monthly trends (last 6 months)
    const months = [];
    const monthTotals = {};
    for (let m = 5; m >= 0; m--) {
      const d = new Date();
      d.setMonth(d.getMonth() - m);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(key);
      monthTotals[key] = 0;
    }
    rows.forEach(r => {
      const s = r.start_time || r.timestamp || r.date || '';
      if (!s) return;
      const key = s.split('T')[0].slice(0,7).replace('-', '-');
      const hrs = Number(r.duration_hours || r.hours || 0) || 0;
      if (monthTotals.hasOwnProperty(key)) monthTotals[key] += hrs;
    });
    monthlyTrendsData.value = {
      labels: months.map(m => {
        const [y, mm] = m.split('-');
        const d = new Date(Number(y), Number(mm)-1, 1);
        return d.toLocaleString(undefined, { month: 'short', year: 'numeric' });
      }),
      datasets: [{ label: 'Hours', data: months.map(m => Number((monthTotals[m] || 0).toFixed(2))), backgroundColor: '#3b82f6' }]
    };

    const total = detailedTimeEntries.value.reduce((s,e) => s + Number(e.total || 0), 0);
    const regular = detailedTimeEntries.value.reduce((s,e) => s + Number(e.regular || 0), 0);
    const overtime = detailedTimeEntries.value.reduce((s,e) => s + Number(e.overtime || 0), 0);
    summaryStats.value = {
      totalHours: total,
      regularHours: regular,
      overtimeHours: overtime,
      averageDaily: (total / 22).toFixed(2),
      punctualityScore: 90,
      projectsWorked: new Set(detailedTimeEntries.value.map(d => d.project)).size,
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
              <CardTitle>Weekly Hours Breakdown</CardTitle>
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
              <CardTitle>Work Overview</CardTitle>
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
