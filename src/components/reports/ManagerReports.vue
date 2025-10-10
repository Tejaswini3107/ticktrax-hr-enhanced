<script setup>
import Card from '../ui/card.vue';
import { CardContent, CardHeader, CardTitle } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import Badge from '../ui/badge.vue';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table.vue';
import {
  BarChart,
  LineChart,
  PieChart,
  ResponsiveContainer,
} from '../ui/chart-components.vue';
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
} from 'lucide-vue-next';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs.vue';

import { ref, onMounted } from 'vue';
import apiService from '../../services/apiService.js';

// Reactive metric values (will be populated from API)
const totalHours = ref(0);
const overtimeHours = ref(0);
const teamSize = ref(0);
const avgEfficiency = ref(0);

// Charts and datasets (default to sensible demo values while loading)
const weeklyHoursChartData = ref({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    { label: 'Regular Hours', data: [0,0,0,0,0,0,0], backgroundColor: '#3b82f6', borderColor: '#3b82f6', borderWidth: 1 },
    { label: 'Overtime', data: [0,0,0,0,0,0,0], backgroundColor: '#f59e0b', borderColor: '#f59e0b', borderWidth: 1 }
  ]
});

const monthlyTrendChartData = ref({ labels: [], datasets: [{ label: 'Total Hours', data: [], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4 }] });

const attendanceChartData = ref({ labels: ['Present', 'Late', 'Absent', 'Leave'], datasets: [{ data: [0,0,0,0], backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'], borderWidth: 2, borderColor: '#ffffff' }] });
const attendanceData = ref([
  { name: 'Present', value: 0, color: '#10b981' },
  { name: 'Late', value: 0, color: '#f59e0b' },
  { name: 'Absent', value: 0, color: '#ef4444' },
  { name: 'Leave', value: 0, color: '#8b5cf6' },
]);

const monthlyTrendData = ref([]);

const productivityData = ref([]);
const overtimeBreakdown = ref([]);

// Helper: normalize user object to id and name
function normalizeUser(u) {
  const id = u?.id || u?.attributes?.id || u?.attributes?.user_id;
  const name = u?.attributes?.name || u?.attributes?.full_name || u?.name || `${u?.attributes?.first_name || ''} ${u?.attributes?.last_name || ''}`.trim() || 'Unknown';
  return { id, name };
}

const loadManagerReports = async () => {
  try {
    const users = await apiService.listUsers();
    const userArray = Array.isArray(users) ? users : (users?.data || []);
    const sample = userArray.slice(0, 50);
    teamSize.value = userArray.length;

    let monthHours = 0;
    let monthOvertime = 0;
    const now = new Date();
    const currMonth = now.getMonth();
    const currYear = now.getFullYear();

    // collect rows to build charts
    const last7 = new Array(7).fill(0);
    const last7Over = new Array(7).fill(0);
    const monthBuckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      monthBuckets.push({ month: d.toLocaleString('en-US', { month: 'short' }), totalHours: 0, overtime: 0 });
    }

    const attendanceCounts = { present: 0, late: 0, absent: 0, leave: 0 };
    const prodList = [];
    const deptMap = new Map();

    // iterate sampled users and fetch working times
    await Promise.all(sample.map(async (u) => {
      try {
        const { id, name } = normalizeUser(u);
        if (!id) return;
        const rowsRes = await apiService.getUserWorkingTimes(id);
        const rows = Array.isArray(rowsRes) ? rowsRes : (rowsRes?.data || []);
        let userHours = 0;
        let userOver = 0;

        for (const r of rows) {
          const start = r.start_time || r.timestamp || r.date || '';
          const d = start ? new Date(start) : null;
          const hours = Number(r.duration_hours || r.hours || 0) || 0;
          const isOver = !!r.overtime;

          // monthly totals
          if (d && d.getMonth() === currMonth && d.getFullYear() === currYear) {
            monthHours += hours;
            if (isOver) monthOvertime += hours;
          }

          // last 7 days distribution
          if (d) {
            const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
            if (diff >= 0 && diff < 7) {
              const dayIdx = (7 - 1) - diff; // map 0..6 to Mon..Sun-ish order later
              last7[dayIdx] += hours;
              if (isOver) last7Over[dayIdx] += hours;
            }
          }

          // month buckets
          if (d) {
            const label = d.toLocaleString('en-US', { month: 'short' });
            const b = monthBuckets.find(x => x.month === label);
            if (b) {
              b.totalHours += hours;
              if (isOver) b.overtime += hours;
            }
          }

          // attendance heuristics
          const st = (r.status || '').toLowerCase();
          if (st.includes('present')) attendanceCounts.present++;
          else if (st.includes('late')) attendanceCounts.late++;
          else if (st.includes('absent')) attendanceCounts.absent++;
          else if (st.includes('leave')) attendanceCounts.leave++;

          userHours += hours;
          if (isOver) userOver += hours;
        }

        prodList.push({ employee: name, hoursLogged: Math.round(userHours), tasksCompleted: rintOrZero(rowsRes, 'tasks_completed'), efficiency: estimateEfficiency(userHours, userOver) });

        // department overtime aggregation (if department available on user)
        const dept = u?.attributes?.department || u?.department || 'Unassigned';
        const prev = deptMap.get(dept) || { hours: 0, cost: 0 };
        prev.hours += userOver;
        prev.cost += userOver * 30; // rough $30/hr assumption for cost estimation
        deptMap.set(dept, prev);

      } catch (e) {
        // ignore per-user errors
      }
    }));

    totalHours.value = Math.round(monthHours);
    overtimeHours.value = Math.round(monthOvertime);
    avgEfficiency.value = Math.round(estimateEfficiency(monthHours, monthOvertime));

    // prepare weekly chart (labels Mon..Sun)
    weeklyHoursChartData.value.datasets[0].data = last7;
    weeklyHoursChartData.value.datasets[1].data = last7Over;

    // prepare monthly trend
    monthlyTrendChartData.value.labels = monthBuckets.map(m => m.month);
    monthlyTrendChartData.value.datasets[0].data = monthBuckets.map(m => Math.round(m.totalHours));
    monthlyTrendData.value = monthBuckets.map(m => ({ month: m.month, hours: Math.round(m.totalHours), target: 160 }));

    // attendance
    attendanceChartData.value.datasets[0].data = [attendanceCounts.present, attendanceCounts.late, attendanceCounts.absent, attendanceCounts.leave];
    attendanceData.value = [
      { name: 'Present', value: attendanceCounts.present, color: '#10b981' },
      { name: 'Late', value: attendanceCounts.late, color: '#f59e0b' },
      { name: 'Absent', value: attendanceCounts.absent, color: '#ef4444' },
      { name: 'Leave', value: attendanceCounts.leave, color: '#8b5cf6' },
    ];

    // productivity and overtime tables
    productivityData.value = prodList.slice(0, 20).sort((a,b) => b.hoursLogged - a.hoursLogged);
    overtimeBreakdown.value = Array.from(deptMap.entries()).map(([department, v]) => ({ department, hours: Math.round(v.hours), cost: `$${Math.round(v.cost)}` }));

  } catch (e) {
    console.error('Failed to load manager reports', e);
    // leave defaults (demo-like) if API fails
  }
};

// small helpers
function rintOrZero(rowsRes, key) {
  try {
    const rows = Array.isArray(rowsRes) ? rowsRes : (rowsRes?.data || []);
    // try to sum key if exists per row
    return rows.reduce((s, r) => s + (Number(r[key] || 0) || 0), 0) || 0;
  } catch (e) { return 0; }
}

function estimateEfficiency(hours, overtime) {
  try {
    const total = Number(hours) || 0;
    const over = Number(overtime) || 0;
    if (!total) return 90;
    const overPct = (over / total) * 100;
    const eff = Math.max(50, 100 - Math.round(overPct * 0.5));
    return eff;
  } catch (e) { return 90; }
}

onMounted(() => {
  loadManagerReports();
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2>Team Reports</h2>
        <p class="text-muted-foreground mt-1">
          Analyze team performance and track key metrics
        </p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" class="gap-2">
          <Calendar class="h-4 w-4" />
          Date Range
        </Button>
        <Button class="gap-2">
          <Download class="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total Hours</p>
              <p class="mt-2">1,865</p>
              <div class="flex items-center gap-1 mt-1 text-sm">
                <TrendingUp class="h-3 w-3 text-green-600" />
                <span class="text-green-600">+12%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">
                Overtime Hours
              </p>
              <p class="mt-2">362</p>
              <div class="flex items-center gap-1 mt-1 text-sm">
                <TrendingUp class="h-3 w-3 text-red-600" />
                <span class="text-red-600">+8%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Team Size</p>
              <p class="mt-2">24</p>
              <div class="flex items-center gap-1 mt-1 text-sm">
                <span class="text-muted-foreground">Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">
                Avg Efficiency
              </p>
              <p class="mt-2">92.6%</p>
              <div class="flex items-center gap-1 mt-1 text-sm">
                <TrendingUp class="h-3 w-3 text-green-600" />
                <span class="text-green-600">+3%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Tabs defaultValue="hours" class="space-y-4">
      <TabsList>
        <TabsTrigger value="hours">Hours Analysis</TabsTrigger>
        <TabsTrigger value="attendance">Attendance</TabsTrigger>
        <TabsTrigger value="productivity">Productivity</TabsTrigger>
        <TabsTrigger value="overtime">Overtime</TabsTrigger>
      </TabsList>

      <TabsContent value="hours" class="space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Hours Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="h-[300px]">
                <BarChart :data="weeklyHoursChartData" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6-Month Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="h-[300px]">
                <LineChart :data="monthlyTrendChartData" />
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="attendance" class="space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent class="flex items-center justify-center">
              <div class="h-[300px] w-full">
                <PieChart :data="attendanceChartData" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="(item, index) in attendanceData"
                  :key="index"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="h-4 w-4 rounded"
                      :style="{ backgroundColor: item.color }"
                    />
                    <span>{{ item.name }}</span>
                  </div>
                  <div class="text-right">
                    <p>{{ item.value }}%</p>
                    <p class="text-sm text-muted-foreground">
                      {{
                        Math.round((item.value / 100) * 24)
                      }}
                      employees
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="productivity" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Team Productivity Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Hours Logged</TableHead>
                  <TableHead>Tasks Completed</TableHead>
                  <TableHead>Efficiency</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="(employee, index) in productivityData"
                  :key="index"
                >
                  <TableCell>{{ employee.employee }}</TableCell>
                  <TableCell>{{ employee.hoursLogged }}h</TableCell>
                  <TableCell>{{
                    employee.tasksCompleted
                  }}</TableCell>
                  <TableCell>{{ employee.efficiency }}%</TableCell>
                  <TableCell>
                    <Badge
                      :variant="
                        employee.efficiency >= 90
                          ? 'default'
                          : 'secondary'
                      "
                      :class="
                        employee.efficiency >= 90
                          ? 'bg-green-500 hover:bg-green-600'
                          : undefined
                      "
                    >
                      {{
                        employee.efficiency >= 90
                          ? 'Excellent'
                          : 'Good'
                      }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="overtime" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Overtime Breakdown by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Overtime Hours</TableHead>
                  <TableHead>Estimated Cost</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="(dept, index) in overtimeBreakdown"
                  :key="index"
                >
                  <TableCell>{{ dept.department }}</TableCell>
                  <TableCell>{{ dept.hours }}h</TableCell>
                  <TableCell>{{ dept.cost }}</TableCell>
                  <TableCell>
                    <Badge
                      :variant="
                        dept.hours > 100 ? 'secondary' : 'default'
                      "
                      :class="
                        dept.hours <= 100
                          ? 'bg-green-500 hover:bg-green-600'
                          : undefined
                      "
                    >
                      {{ dept.hours > 100 ? 'High' : 'Normal' }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div class="mt-6 p-4 bg-accent/50 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-muted-foreground">
                    Total Overtime Cost
                  </p>
                  <p class="mt-1">$10,860</p>
                </div>
                <Badge variant="secondary">16% of payroll</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
