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
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from '../ui/chart-components.vue';
import {
  Download,
  Calendar,
  Users,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-vue-next';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs.vue';

import { ref, onMounted, computed } from 'vue';
import apiService from '../../services/apiService.js';

const workforceAnalytics = ref([]);

const departmentPerformance = ref([
  {
    dept: 'Production',
    employees: 45,
    avgHours: 42.5,
    efficiency: 88,
    utilization: 92,
  },
  {
    dept: 'Warehouse',
    employees: 28,
    avgHours: 41.2,
    efficiency: 85,
    utilization: 89,
  },
  {
    dept: 'Quality Control',
    employees: 15,
    avgHours: 40.8,
    efficiency: 91,
    utilization: 95,
  },
  {
    dept: 'Maintenance',
    employees: 12,
    avgHours: 43.1,
    efficiency: 87,
    utilization: 90,
  },
  {
    dept: 'Administration',
    employees: 8,
    avgHours: 39.5,
    efficiency: 93,
    utilization: 88,
  },
]);

const complianceData = ref([
  {
    metric: 'Time Policy Violations',
    value: 2,
    status: 'warning',
    target: 0,
  },
  { metric: 'Missing Clock-outs', value: 1, status: 'warning', target: 0 },
  {
    metric: 'Unapproved Overtime',
    value: 5,
    status: 'warning',
    target: 0,
  },
  { metric: 'Break Violations', value: 0, status: 'compliant', target: 0 },
  {
    metric: 'Schedule Deviations',
    value: 3,
    status: 'warning',
    target: 0,
  },
]);

const workforceData = ref([
  {
    month: 'Apr',
    hires: 3,
    terminations: 1,
    netChange: 2,
    retention: 97,
  },
  {
    month: 'May',
    hires: 2,
    terminations: 2,
    netChange: 0,
    retention: 96,
  },
  {
    month: 'Jun',
    hires: 4,
    terminations: 1,
    netChange: 3,
    retention: 97,
  },
  {
    month: 'Jul',
    hires: 2,
    terminations: 3,
    netChange: -1,
    retention: 95,
  },
  {
    month: 'Aug',
    hires: 5,
    terminations: 2,
    netChange: 3,
    retention: 96,
  },
  {
    month: 'Sep',
    hires: 3,
    terminations: 1,
    netChange: 2,
    retention: 98,
  },
]);

// Will be populated with the top 7 employees by hours for the current week
const shiftDistribution = ref([]);
// debug info to help diagnose empty chart
const shiftDebug = ref({ sampleCount: 0, allRows: 0, perUserCount: 0, weekStart: '', weekEnd: '', entries: [] });

const totalEmployees = ref(0);
const monthlyHours = ref(0);
const complianceIssues = ref(0);

const loadAdminReports = async () => {
  try {
    const users = await apiService.listUsers();
    const userArray = Array.isArray(users) ? users : (users?.data || []);
    totalEmployees.value = userArray.length;

    // Compute monthly hours by sampling up to 50 users to avoid heavy processing
    let monthHours = 0;
    const sample = userArray.slice(0, 50);
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    await Promise.all(sample.map(async (u) => {
      try {
        const uid = u.id || u.attributes?.id;
        if (!uid) return;
        const times = await apiService.getUserWorkingTimes(uid);
        const rows = Array.isArray(times) ? times : (times?.data || []);
        for (const r of rows) {
          const start = r.start_time || r.timestamp || '';
          const d = start ? new Date(start) : null;
          if (d && d.getMonth() === month && d.getFullYear() === year) {
            monthHours += Number(r.duration_hours || r.hours || 0) || 0;
          }
        }
      } catch (e) {
        // ignore
      }
    }));

    monthlyHours.value = Math.round(monthHours);
    // simple heuristic for compliance issues: count 'pending' or 'missing_clock_out' in working time rows (sampled)
    let issues = 0;
    for (const u of sample) {
      try {
        const uid = u.id || u.attributes?.id;
        if (!uid) continue;
        const rows = await apiService.getUserWorkingTimes(uid);
        const arr = Array.isArray(rows) ? rows : (rows?.data || []);
        issues += arr.filter(r => r.status === 'missing_clock_out' || r.status === 'violation' || r.pending_approval).length;
      } catch (e) {}
    }
    complianceIssues.value = issues;

    // Build simple workforceAnalytics: last 6 months totals (client-side estimation)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      months.push({ month: d.toLocaleString('en-US', { month: 'short' }), totalHours: 0, overtime: 0, efficiency: 0 });
    }
  // aggregate sample rows into months buckets and annotate with user id/name
  const allRows = [];
  shiftDebug.value.sampleCount = sample.length;
    for (const u of sample) {
      try {
        const uid = u.id || u.attributes?.id;
        if (!uid) continue;
        const rows = await apiService.getUserWorkingTimes(uid);
        const arr = Array.isArray(rows) ? rows : (rows?.data || []);
        // annotate each row with the user's first name so chart shows first name only
        const firstNameCandidate = u.first_name || u.attributes?.first_name || u.name || u.attributes?.name || u.email || u.attributes?.email || `User ${uid}`;
        const firstName = (typeof firstNameCandidate === 'string' && firstNameCandidate.trim())
          ? firstNameCandidate.trim().split(' ')[0]
          : `User ${uid}`;
        allRows.push(...arr.map(r => ({ ...r, __uid: uid, __firstName: firstName })));
      } catch (e) {}
    }
    for (const r of allRows) {
  const start = r.start_time || r.timestamp || '';
  const d = parseTimestamp(start);
      if (!d) continue;
      const mLabel = d.toLocaleString('en-US', { month: 'short' });
      const m = months.find(x => x.month === mLabel);
      const hours = Number(r.duration_hours || r.hours || 0) || 0;
      if (m) {
        m.totalHours += hours;
        if (r.overtime) m.overtime += hours;
      }
    }
    // --- New: compute top 7 employees by hours for the current week (Monday -> Sunday)
    try {
      const now = new Date();
      const day = now.getDay();
      // compute Monday as start of week (local)
      const diffToMonday = (day + 6) % 7; // 0->Mon
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - diffToMonday);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const perUser = new Map();
      for (const r of allRows) {
  const start = r.start_time || r.timestamp || r.created_at || r.start || r.date || '';
  const s = parseTimestamp(start);
        if (!s) continue;
        if (s >= weekStart && s < weekEnd) {
          const uid = r.__uid || (r.user_id || r.user?.id);
          // prefer the annotated first name, otherwise extract from attached user info
          const nameSource = r.__firstName || r.__name || r.user_name || r.user?.name || r.user?.first_name || `User ${uid}`;
          const name = (typeof nameSource === 'string' && nameSource.trim()) ? nameSource.trim().split(' ')[0] : `User ${uid}`;
          const h = Number(r.duration_hours || r.hours || r.duration || (r.minutes ? r.minutes / 60 : 0)) || 0;
          const prev = perUser.get(uid) || { name, hours: 0 };
          prev.hours += h;
          perUser.set(uid, prev);
        }
      }

      const topArr = Array.from(perUser.values()).sort((a, b) => b.hours - a.hours).slice(0, 7);
  // populate debug info
  shiftDebug.value.allRows = allRows.length;
  shiftDebug.value.perUserCount = perUser.size;
  shiftDebug.value.weekStart = weekStart.toISOString();
  shiftDebug.value.weekEnd = weekEnd.toISOString();
    shiftDebug.value.entries = Array.from(perUser.entries()).map(([uid, v]) => ({ uid, name: v.name, hours: Math.round((v.hours + Number.EPSILON) * 100) / 100 }));
      // populate shiftDistribution with name/hours so the chart can render top 7
      shiftDistribution.value = topArr.map(p => ({ name: p.name, hours: Math.round((p.hours + Number.EPSILON) * 100) / 100 }));
    } catch (e) {
      // if anything goes wrong, leave shiftDistribution empty
      console.error('Failed to compute top employees this week', e);
    }
    workforceAnalytics.value = months.map(m => ({ ...m, efficiency: Math.round(Math.max(70, 90 - (m.overtime / (m.totalHours || 1) * 100 || 0))) }));

  } catch (e) {
    console.error('Failed to load admin reports', e);
  }
};

onMounted(() => {
  loadAdminReports();
});

const avgEfficiency = computed(() => {
  if (!workforceAnalytics.value || workforceAnalytics.value.length === 0) return 0;
  const sum = workforceAnalytics.value.reduce((s, m) => s + (m.efficiency || 0), 0);
  return Math.round(sum / workforceAnalytics.value.length) || 0;
});

// Tooltip formatter for hours chart
const hoursFormatter = (value) => [value, 'Hours'];

// Parse assorted timestamp formats (ISO string, numeric seconds or millis, numeric strings)
const parseTimestamp = (v) => {
  if (v === null || v === undefined || v === '') return null;
  // numeric (already a number)
  if (typeof v === 'number') {
    // if value looks like seconds (1e9..1e10) convert to ms
    return new Date(v > 1e12 ? v : v * 1000);
  }
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed === '') return null;
    const asNum = Number(trimmed);
    if (!Number.isNaN(asNum) && /^\d+$/.test(trimmed)) {
      // pure integer string
      return new Date(asNum > 1e12 ? asNum : asNum * 1000);
    }
    // try ISO / parseable string
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2>Administrative Reports & Analytics</h2>
        <p class="text-muted-foreground mt-1">
          Comprehensive workforce analytics and time tracking insights
        </p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" class="gap-2">
          <Calendar class="h-4 w-4" />
          This Month
        </Button>
        <Button class="gap-2">
          <Download class="h-4 w-4" />
          Export All
        </Button>
      </div>
    </div>

    <!-- Executive Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"
            >
              <Users class="h-5 w-5 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Total Employees</p>
              <p class="mt-1">{{ totalEmployees }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"
            >
              <Clock class="h-5 w-5 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Monthly Hours</p>
              <p class="mt-1">{{ monthlyHours }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"
            >
              <TrendingUp class="h-5 w-5 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Avg Efficiency</p>
              <p class="mt-1">{{ avgEfficiency }}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center"
            >
              <AlertCircle class="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">
                Compliance Issues
              </p>
              <p class="mt-1">{{ complianceIssues }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Tabs defaultValue="workforce" class="space-y-4">
      <TabsList>
        <TabsTrigger value="workforce">Workforce Analytics</TabsTrigger>
        <TabsTrigger value="departments"
          >Department Performance</TabsTrigger
        >
        <TabsTrigger value="compliance">Compliance</TabsTrigger>
        <TabsTrigger value="retention">Workforce Trends</TabsTrigger>
        <TabsTrigger value="shifts">Shift Distribution</TabsTrigger>
      </TabsList>

      <TabsContent value="workforce" class="space-y-4">
        <Card>
          <CardHeader>
              <CardTitle>Top 7: Hours This Week (Mon → Sun)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" :height="350">
                <BarChart :data="shiftDistribution">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    :interval="0"
                    :angle="-30"
                    textAnchor="end"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    :contentStyle="{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }"
                    :formatter="hoursFormatter"
                  />
                  <Legend />
                  <Bar dataKey="hours" fill="#3b82f6" name="Hours" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Efficiency Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" :height="250">
              <LineChart :data="workforceAnalytics">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  :contentStyle="{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }"
                  :formatter="
                    (value) => [`${value}%`, 'Efficiency']
                  "
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#10b981"
                  :strokeWidth="3"
                  :dot="{
                    fill: '#10b981',
                    strokeWidth: 2,
                    r: 4,
                  }"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="departments" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Department Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Avg Hours/Week</TableHead>
                  <TableHead>Efficiency</TableHead>
                  <TableHead>Utilization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="(dept, index) in departmentPerformance"
                  :key="index"
                >
                  <TableCell class="font-medium">{{
                    dept.dept
                  }}</TableCell>
                  <TableCell>{{ dept.employees }}</TableCell>
                  <TableCell>{{ dept.avgHours }}h</TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <div
                        class="w-16 bg-muted rounded-full h-2"
                      >
                        <div
                          class="h-2 rounded-full bg-primary"
                          :style="{
                            width: `${dept.efficiency}%`,
                          }"
                        />
                      </div>
                      <span class="text-sm"
                        >{{ dept.efficiency }}%</span
                      >
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      :variant="
                        dept.utilization >= 90
                          ? 'default'
                          : 'secondary'
                      "
                      :class="
                        dept.utilization >= 90
                          ? 'bg-green-500 hover:bg-green-600'
                          : ''
                      "
                    >
                      {{ dept.utilization }}%
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="compliance" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Time Tracking Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Compliance Metric</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="(item, index) in complianceData"
                  :key="index"
                >
                  <TableCell class="font-medium">{{
                    item.metric
                  }}</TableCell>
                  <TableCell>{{ item.value }}</TableCell>
                  <TableCell>{{ item.target }}</TableCell>
                  <TableCell>
                    <Badge
                      :variant="
                        item.status === 'compliant'
                          ? 'default'
                          : 'destructive'
                      "
                      :class="
                        item.status === 'compliant'
                          ? 'bg-green-500 hover:bg-green-600'
                          : item.status === 'warning'
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : ''
                      "
                    >
                      {{
                        item.status === 'compliant'
                          ? 'Compliant'
                          : 'Warning'
                      }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="retention" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Workforce Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" :height="350">
              <BarChart :data="workforceData">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  :contentStyle="{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }"
                />
                <Legend />
                <Bar
                  dataKey="hires"
                  fill="#10b981"
                  name="New Hires"
                />
                <Bar
                  dataKey="terminations"
                  fill="#ef4444"
                  name="Terminations"
                />
                <Bar
                  dataKey="netChange"
                  fill="#3b82f6"
                  name="Net Change"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retention Rate Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" :height="250">
              <LineChart :data="workforceData">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  :domain="[90, 100]"
                />
                <Tooltip
                  :contentStyle="{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }"
                  :formatter="
                    (value) => [`${value}%`, 'Retention Rate']
                  "
                />
                <Line
                  type="monotone"
                  dataKey="retention"
                  stroke="#8b5cf6"
                  :strokeWidth="3"
                  :dot="{
                    fill: '#8b5cf6',
                    strokeWidth: 2,
                    r: 4,
                  }"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="shifts" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Top 7: Hours This Week (Mon → Sun)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" :height="350">
              <BarChart :data="shiftDistribution">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  :interval="0"
                  :angle="-30"
                  textAnchor="end"
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  :contentStyle="{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }"
                  :formatter="hoursFormatter"
                />
                <Legend />
                <Bar dataKey="hours" fill="#06b6d4" name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <!-- debug panel when no data -->
          <CardContent v-if="(!shiftDistribution || shiftDistribution.length === 0)">
            <div class="text-sm text-muted-foreground">No data found for Top 7 this week. Debug info:</div>
            <div class="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>Sample size: <strong>{{ shiftDebug.sampleCount }}</strong></div>
              <div>All rows fetched: <strong>{{ shiftDebug.allRows }}</strong></div>
              <div>Per-user count: <strong>{{ shiftDebug.perUserCount }}</strong></div>
              <div>Week range: <strong>{{ shiftDebug.weekStart }}</strong> → <strong>{{ shiftDebug.weekEnd }}</strong></div>
            </div>
            <div class="mt-3 text-xs">
              <div class="font-medium">Per-user totals (first 20):</div>
              <ul class="list-disc pl-5 mt-1 max-h-36 overflow-auto">
                <li v-for="(e, idx) in shiftDebug.entries.slice(0, 20)" :key="idx">
                  {{ e.name || e.uid }} — {{ e.hours }}h
                </li>
                <li v-if="shiftDebug.entries.length === 0">(no per-user totals)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
