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

const workforceAnalytics = [
  { month: 'Apr', totalHours: 7200, overtime: 320, efficiency: 85 },
  { month: 'May', totalHours: 7450, overtime: 380, efficiency: 87 },
  { month: 'Jun', totalHours: 7800, overtime: 450, efficiency: 89 },
  { month: 'Jul', totalHours: 7650, overtime: 420, efficiency: 88 },
  { month: 'Aug', totalHours: 7900, overtime: 480, efficiency: 91 },
  { month: 'Sep', totalHours: 8100, overtime: 520, efficiency: 92 },
];

const departmentPerformance = [
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
];

const complianceData = [
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
];

const workforceData = [
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
];

const shiftDistribution = [
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
];
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
              <p class="mt-1">108</p>
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
              <p class="mt-1">8,100</p>
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
              <p class="mt-1">92%</p>
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
              <p class="mt-1">11</p>
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
            <CardTitle>6-Month Workforce Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" :height="350">
              <AreaChart :data="workforceAnalytics">
                <defs>
                  <linearGradient
                    id="colorHours"
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
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="totalHours"
                  stackId="1"
                  stroke="#3b82f6"
                  :fillOpacity="1"
                  fill="url(#colorHours)"
                  name="Total Hours"
                />
                <Area
                  type="monotone"
                  dataKey="overtime"
                  stackId="2"
                  stroke="#f59e0b"
                  :fillOpacity="1"
                  fill="url(#colorOvertime)"
                  name="Overtime Hours"
                />
              </AreaChart>
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
            <CardTitle>Daily Shift Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" :height="350">
              <AreaChart :data="shiftDistribution">
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
                      stopColor="#06b6d4"
                      :stopOpacity="0.8"
                    />
                    <stop
                      offset="95%"
                      stopColor="#06b6d4"
                      :stopOpacity="0"
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
                  :formatter="(value) => [`${value}`, 'Employees']"
                />
                <Area
                  type="monotone"
                  dataKey="employees"
                  stroke="#06b6d4"
                  :fillOpacity="1"
                  fill="url(#colorEmployees)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
