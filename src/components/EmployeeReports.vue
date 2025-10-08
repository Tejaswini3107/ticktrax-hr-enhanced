<script setup>
import { ref, computed } from 'vue';
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
import { useToast } from './ui/toast/use-toast.js';

const { toast } = useToast();

const selectedPeriod = ref('month');
const startDate = ref('');
const endDate = ref('');

// Mock data for charts
const weeklyHoursData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Regular Hours',
      data: [42, 40, 45, 38],
      backgroundColor: '#3b82f6',
    },
    {
      label: 'Overtime',
      data: [2, 0, 5, 0],
      backgroundColor: '#f59e0b',
    },
  ],
};

const projectHoursData = {
  labels: ['Alpha', 'Beta', 'Gamma', 'Delta'],
  datasets: [
    {
      label: 'Hours',
      data: [45, 32, 28, 23],
      backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'],
    },
  ],
};

const workLocationData = {
  labels: ['Work from Home', 'WFO', 'Field Work', 'Warehouse Visit'],
  datasets: [
    {
      label: 'Hours',
      data: [58, 39, 26, 6],
      backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'],
    },
  ],
};

const monthlyTrendsData = {
  labels: ['Jul', 'Aug', 'Sep', 'Oct'],
  datasets: [
    {
      label: 'Regular Hours',
      data: [160, 168, 164, 152],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
    },
    {
      label: 'Overtime',
      data: [8, 4, 12, 6],
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      fill: true,
    },
  ],
};

const pieChartColors = [
  '#3b82f6',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
];

const summaryStats = {
  totalHours: 342,
  regularHours: 312,
  overtimeHours: 30,
  averageDaily: 8.2,
  punctualityScore: 94,
  projectsWorked: 4,
};

const detailedTimeEntries = [
  {
    date: '2025-10-01',
    project: 'Project Alpha',
    clockIn: '09:00 AM',
    clockOut: '05:30 PM',
    regular: 8,
    overtime: 0.5,
    total: 8.5,
    status: 'approved',
  },
  {
    date: '2025-09-30',
    project: 'Project Beta',
    clockIn: '08:45 AM',
    clockOut: '05:15 PM',
    regular: 8,
    overtime: 0.5,
    total: 8.5,
    status: 'approved',
  },
  {
    date: '2025-09-29',
    project: 'Project Gamma',
    clockIn: '09:15 AM',
    clockOut: '06:00 PM',
    regular: 8,
    overtime: 0.75,
    total: 8.75,
    status: 'pending',
  },
];

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
      <Card>
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
      </Card>
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
              <div class="w-full h-[300px] rounded-[12px]">
                <ResponsiveContainer width="70%" height="100%">
                  <PieChart :data="workLocationData" />
                </ResponsiveContainer>
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
