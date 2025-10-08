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

const weeklyHoursChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Regular Hours',
      data: [42, 40, 38, 41, 39, 12, 0],
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
      borderWidth: 1
    },
    {
      label: 'Overtime',
      data: [3, 5, 2, 4, 6, 8, 0],
      backgroundColor: '#f59e0b',
      borderColor: '#f59e0b',
      borderWidth: 1
    }
  ]
};

const monthlyTrendChartData = {
  labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  datasets: [
    {
      label: 'Total Hours',
      data: [180, 175, 190, 185, 195, 172],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }
  ]
};

const attendanceChartData = {
  labels: ['Present', 'Late', 'Absent', 'Leave'],
  datasets: [
    {
      data: [85, 10, 3, 2],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }
  ]
};

const attendanceData = [
  { name: 'Present', value: 85, color: '#10b981' },
  { name: 'Late', value: 10, color: '#f59e0b' },
  { name: 'Absent', value: 3, color: '#ef4444' },
  { name: 'Leave', value: 2, color: '#8b5cf6' },
];

const monthlyTrendData = [
  { month: 'Apr', hours: 172, target: 160 },
  { month: 'May', hours: 168, target: 160 },
  { month: 'Jun', hours: 175, target: 160 },
  { month: 'Jul', hours: 182, target: 160 },
  { month: 'Aug', hours: 178, target: 160 },
  { month: 'Sep', hours: 185, target: 160 },
];


const productivityData = [
  {
    employee: 'John Smith',
    hoursLogged: 178,
    tasksCompleted: 24,
    efficiency: 95,
  },
  {
    employee: 'Sarah Johnson',
    hoursLogged: 182,
    tasksCompleted: 28,
    efficiency: 98,
  },
  {
    employee: 'Mike Davis',
    hoursLogged: 165,
    tasksCompleted: 20,
    efficiency: 88,
  },
  {
    employee: 'Emily Chen',
    hoursLogged: 172,
    tasksCompleted: 25,
    efficiency: 92,
  },
  {
    employee: 'David Wilson',
    hoursLogged: 168,
    tasksCompleted: 22,
    efficiency: 90,
  },
];

const overtimeBreakdown = [
  { department: 'Production', hours: 145, cost: '$4,350' },
  { department: 'Warehouse', hours: 98, cost: '$2,940' },
  { department: 'Quality Control', hours: 67, cost: '$2,010' },
  { department: 'Maintenance', hours: 52, cost: '$1,560' },
];
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
