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
  DollarSign,
  Clock,
  AlertCircle,
} from 'lucide-vue-next';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs.vue';

import { ref, onMounted } from 'vue';
import apiService from '../../services/apiService.js';

const payrollData = ref([
  { month: 'Apr', regular: 125000, overtime: 12500, total: 137500 },
  { month: 'May', regular: 128000, overtime: 13200, total: 141200 },
  { month: 'Jun', regular: 130000, overtime: 15000, total: 145000 },
  { month: 'Jul', regular: 132000, overtime: 16500, total: 148500 },
  { month: 'Aug', regular: 129000, overtime: 14800, total: 143800 },
  { month: 'Sep', regular: 135000, overtime: 17200, total: 152200 },
]);

const departmentCostsData = ref([
  {
    dept: 'Production',
    employees: 45,
    avgHours: 42.5,
    totalCost: 85000,
  },
  {
    dept: 'Warehouse',
    employees: 28,
    avgHours: 41.2,
    totalCost: 52000,
  },
  {
    dept: 'Quality Control',
    employees: 15,
    avgHours: 40.8,
    totalCost: 35000,
  },
  {
    dept: 'Maintenance',
    employees: 12,
    avgHours: 43.1,
    totalCost: 28000,
  },
  {
    dept: 'Administration',
    employees: 8,
    avgHours: 39.5,
    totalCost: 22000,
  },
]);

const complianceData = ref([
  { metric: 'FLSA Violations', value: 0, status: 'compliant', target: 0 },
  {
    metric: 'Missing Timesheets',
    value: 2,
    status: 'warning',
    target: 0,
  },
  {
    metric: 'Unapproved Overtime',
    value: 5,
    status: 'warning',
    target: 0,
  },
  { metric: 'Break Violations', value: 0, status: 'compliant', target: 0 },
  {
    metric: 'Max Hours Violations',
    value: 1,
    status: 'warning',
    target: 0,
  },
]);

const turnoverData = ref([
  { month: 'Apr', hires: 3, terminations: 1, netChange: 2 },
  { month: 'May', hires: 2, terminations: 2, netChange: 0 },
  { month: 'Jun', hires: 4, terminations: 1, netChange: 3 },
  { month: 'Jul', hires: 2, terminations: 3, netChange: -1 },
  { month: 'Aug', hires: 5, terminations: 2, netChange: 3 },
  { month: 'Sep', hires: 3, terminations: 1, netChange: 2 },
]);

const laborDistribution = ref([
  { hour: '6 AM', employees: 12 },
  { hour: '7 AM', employees: 35 },
  { hour: '8 AM', employees: 68 },
  { hour: '9 AM', employees: 85 },
  { hour: '10 AM', employees: 92 },
  { hour: '11 AM', employees: 95 },
  { hour: '12 PM', employees: 88 },
  { hour: '1 PM', employees: 90 },
  { hour: '2 PM', employees: 93 },
  { hour: '3 PM', employees: 89 },
  { hour: '4 PM', employees: 75 },
  { hour: '5 PM', employees: 45 },
  { hour: '6 PM', employees: 25 },
]);

// Summary metrics
const totalEmployees = ref(0);
const monthlyPayroll = ref(0);
const totalHours = ref(0);
const complianceIssues = ref(0);

const loadHRReports = async () => {
  try {
    const users = await apiService.listUsers();
    const userArray = Array.isArray(users) ? users : (users?.data || []);
    totalEmployees.value = userArray.length;

    // aggregate monthly hours (sample up to 50 users)
    const sample = userArray.slice(0, 50);
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    let monthHours = 0;
    let issues = 0;

    await Promise.all(sample.map(async (u) => {
      try {
        const uid = u.id || u.attributes?.id;
        if (!uid) return;
        const rows = await apiService.getUserWorkingTimes(uid);
        const arr = Array.isArray(rows) ? rows : (rows?.data || []);
        for (const r of arr) {
          const start = r.start_time || r.timestamp || '';
          const d = start ? new Date(start) : null;
          const hours = Number(r.duration_hours || r.hours || 0) || 0;
          if (d && d.getMonth() === month && d.getFullYear() === year) {
            monthHours += hours;
          }
          if (r.status === 'missing_clock_out' || r.status === 'violation' || r.pending_approval) {
            issues += 1;
          }
        }
      } catch (e) {
        // ignore per-user failures
      }
    }));

    totalHours.value = Math.round(monthHours);
    // Estimate payroll using a default hourly rate when payroll API isn't available.
    const defaultHourlyRate = 20; // assumption: average $20/h if payroll endpoints are not present
    monthlyPayroll.value = Math.round(monthHours * defaultHourlyRate);
    complianceIssues.value = issues;
  } catch (e) {
    console.error('Failed to load HR reports', e);
  }
};

onMounted(() => {
  loadHRReports();
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2>HR Reports & Analytics</h2>
        <p class="text-muted-foreground mt-1">
          Comprehensive workforce analytics and compliance monitoring
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
              <p class="text-sm text-muted-foreground">
                Total Employees
              </p>
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
              <DollarSign class="h-5 w-5 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">
                Monthly Payroll
              </p>
              <p class="mt-1">${{ monthlyPayroll.toLocaleString() }}</p>
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
              <p class="text-sm text-muted-foreground">Total Hours</p>
              <p class="mt-1">{{ totalHours }}</p>
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

    <Tabs defaultValue="payroll" class="space-y-4">
      <TabsList>
        <TabsTrigger value="payroll">Payroll</TabsTrigger>
        <TabsTrigger value="departments">Departments</TabsTrigger>
        <TabsTrigger value="compliance">Compliance</TabsTrigger>
        <TabsTrigger value="turnover">Turnover</TabsTrigger>
        <TabsTrigger value="labor">Labor Distribution</TabsTrigger>
      </TabsList>

      <TabsContent value="payroll" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>6-Month Payroll Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" :height="350">
              <AreaChart :data="payrollData">
                <defs>
                  <linearGradient
                    id="colorRegular"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#3b82f6"
                      :stopOpacity="0.8"
                    />
                    <stop
                      offset="95%"
                      stopColor="#3b82f6"
                      :stopOpacity="0"
                    />
                  </linearGradient>
                  <linearGradient
                    id="colorOvertime"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#f59e0b"
                      :stopOpacity="0.8"
                    />
                    <stop
                      offset="95%"
                      stopColor="#f59e0b"
                      :stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
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
                    (value) => `$${value.toLocaleString()}`
                  "
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="regular"
                  stroke="#3b82f6"
                  :fillOpacity="1"
                  fill="url(#colorRegular)"
                  name="Regular Pay"
                />
                <Area
                  type="monotone"
                  dataKey="overtime"
                  stroke="#f59e0b"
                  :fillOpacity="1"
                  fill="url(#colorOvertime)"
                  name="Overtime Pay"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div class="mt-6 grid grid-cols-3 gap-4">
              <div class="p-4 bg-accent/50 rounded-lg">
                <p class="text-sm text-muted-foreground">
                  Average Monthly
                </p>
                <p class="mt-1">$144,700</p>
              </div>
              <div class="p-4 bg-accent/50 rounded-lg">
                <p class="text-sm text-muted-foreground">
                  Overtime Ratio
                </p>
                <p class="mt-1">11.3%</p>
              </div>
              <div class="p-4 bg-accent/50 rounded-lg">
                <p class="text-sm text-muted-foreground">YoY Growth</p>
                <p class="mt-1">+8.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="departments" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Department Cost Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Avg Hours/Week</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Cost per Employee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="(dept, index) in departmentCostsData"
                  :key="index"
                >
                  <TableCell>{{ dept.dept }}</TableCell>
                  <TableCell>{{ dept.employees }}</TableCell>
                  <TableCell>{{ dept.avgHours }}h</TableCell>
                  <TableCell
                    >${{ dept.totalCost.toLocaleString() }}</TableCell
                  >
                  <TableCell
                    >${{
                      Math.round(
                        dept.totalCost / dept.employees
                      ).toLocaleString()
                    }}</TableCell
                  >
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" :height="300">
              <BarChart :data="departmentCostsData">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="dept"
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
                    (value) => `$${value.toLocaleString()}`
                  "
                />
                <Legend />
                <Bar
                  dataKey="totalCost"
                  fill="#3b82f6"
                  name="Total Cost"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="compliance" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div
                v-for="(item, index) in complianceData"
                :key="index"
                :class="[
                  'p-4 rounded-lg border',
                  item.status === 'compliant'
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-yellow-500/10 border-yellow-500/20',
                ]"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <p class="font-medium">{{ item.metric }}</p>
                    <p class="text-sm text-muted-foreground mt-1">
                      Target: {{ item.target }} violations
                    </p>
                  </div>
                  <div class="text-right flex items-center gap-4">
                    <div>
                      <p class="text-2xl">{{ item.value }}</p>
                      <p class="text-sm text-muted-foreground">
                        Current
                      </p>
                    </div>
                    <Badge
                      :variant="
                        item.status === 'compliant'
                          ? 'default'
                          : 'secondary'
                      "
                      :class="
                        item.status === 'compliant'
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-yellow-600 hover:bg-yellow-700'
                      "
                    >
                      {{
                        item.status === 'compliant'
                          ? 'Compliant'
                          : 'Needs Review'
                      }}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 p-4 bg-accent/50 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-muted-foreground">
                    Compliance Score
                  </p>
                  <p class="mt-1">84%</p>
                </div>
                <Button size="sm">View Details</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="turnover" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Employee Turnover Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" :height="300">
              <LineChart :data="turnoverData">
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
                <Line
                  type="monotone"
                  dataKey="hires"
                  stroke="#10b981"
                  :strokeWidth="2"
                  name="New Hires"
                />
                <Line
                  type="monotone"
                  dataKey="terminations"
                  stroke="#ef4444"
                  :strokeWidth="2"
                  name="Terminations"
                />
                <Line
                  type="monotone"
                  dataKey="netChange"
                  stroke="#3b82f6"
                  :strokeWidth="2"
                  name="Net Change"
                />
              </LineChart>
            </ResponsiveContainer>

            <div class="mt-6 grid grid-cols-3 gap-4">
              <div class="p-4 bg-green-500/10 rounded-lg">
                <p class="text-sm text-muted-foreground">
                  Total Hires
                </p>
                <p class="mt-1">19</p>
              </div>
              <div class="p-4 bg-red-500/10 rounded-lg">
                <p class="text-sm text-muted-foreground">
                  Total Exits
                </p>
                <p class="mt-1">10</p>
              </div>
              <div class="p-4 bg-accent/50 rounded-lg">
                <p class="text-sm text-muted-foreground">
                  Turnover Rate
                </p>
                <p class="mt-1">9.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="labor" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Daily Labor Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" :height="350">
              <AreaChart :data="laborDistribution">
                <defs>
                  <linearGradient
                    id="colorEmployees"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#3b82f6"
                      :stopOpacity="0.8"
                    />
                    <stop
                      offset="95%"
                      stopColor="#3b82f6"
                      :stopOpacity="0.2"
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="hour"
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
                <Area
                  type="monotone"
                  dataKey="employees"
                  stroke="#3b82f6"
                  :strokeWidth="2"
                  :fillOpacity="1"
                  fill="url(#colorEmployees)"
                  name="Active Employees"
                />
              </AreaChart>
            </ResponsiveContainer>

            <div class="mt-6 grid grid-cols-3 gap-4">
              <div class="p-4 bg-accent/50 rounded-lg">
                <p class="text-sm text-muted-foreground">Peak Hours</p>
                <p class="mt-1">10 AM - 2 PM</p>
              </div>
              <div class="p-4 bg-accent/50 rounded-lg">
                <p class="text-sm text-muted-foreground">
                  Peak Employees
                </p>
                <p class="mt-1">95 people</p>
              </div>
              <div class="p-4 bg-accent/50 rounded-lg">
                <p class="text-sm text-muted-foreground">Avg Active</p>
                <p class="mt-1">68 people</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
