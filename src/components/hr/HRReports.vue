<script setup>
import { ref, computed, onMounted } from 'vue';
import { Card } from '../ui/card.vue';
import { CardContent, CardHeader, CardTitle } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import Badge from '../ui/badge.vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.vue';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.vue';
import { 
  Download, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  AlertCircle 
} from 'lucide-vue-next';
import apiService from '../../services/apiService.js';

// Real-time data from APIs
const loading = ref(false);
const summaryStats = ref({
  totalEmployees: 0,
  monthlyPayroll: 0,
  totalHours: 0,
  complianceIssues: 0
});

const payrollData = ref([]);
const departmentCostsData = ref([]);
const complianceData = ref([]);
const turnoverData = ref([]);
const laborDistribution = ref([]);

// Load all reports data
const loadReportsData = async () => {
  loading.value = true;
  try {
    // Load summary stats from individual APIs
    const users = await apiService.listUsers();
    const teams = await apiService.getTeams();
    const compliance = await apiService.getComplianceIssues();
    
    summaryStats.value = {
      totalEmployees: users?.data?.length || 0,
      monthlyPayroll: 0, // Will be calculated from payroll data
      totalHours: 0, // Will be calculated from time entries
      complianceIssues: compliance?.data?.length || 0
    };

    // Load payroll trends
    const payrollReport = await apiService.getPayrollReport({
      startDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    if (payrollReport && payrollReport.data) {
      payrollData.value = payrollReport.data.map(entry => ({
        month: entry.month || entry.period,
        regular: entry.regular_pay || 0,
        overtime: entry.overtime_pay || 0,
        total: (entry.regular_pay || 0) + (entry.overtime_pay || 0)
      }));
    }

    // Load department costs
    if (teams && teams.data) {
      departmentCostsData.value = teams.data.map(team => ({
        dept: team.name || 'Unknown',
        employees: team.member_count || 0,
        avgHours: team.average_hours || 0,
        totalCost: team.total_cost || 0
      }));
    }

      // Load compliance data
      if (compliance && compliance.data) {
      complianceData.value = compliance.data.map(issue => ({
        metric: issue.issue_type || 'Unknown Issue',
        value: issue.count || 0,
        status: issue.severity === 'high' ? 'warning' : 'compliant',
        target: 0
      }));
    }

    // Load turnover data
    const turnover = await apiService.getTurnoverReport({
      startDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    if (turnover && turnover.data) {
      turnoverData.value = turnover.data.map(entry => ({
        month: entry.month || entry.period,
        hires: entry.hires || 0,
        terminations: entry.terminations || 0,
        netChange: (entry.hires || 0) - (entry.terminations || 0)
      }));
    }

    // Load labor distribution
    const labor = await apiService.getLaborDistribution();
    if (labor && labor.data) {
      laborDistribution.value = labor.data.map(entry => ({
        hour: entry.hour || entry.time_period,
        employees: entry.employee_count || 0
      }));
    }
  } catch (error) {
    console.warn('Failed to load reports data:', error);
    // Keep empty arrays if API fails
  } finally {
    loading.value = false;
  }
};

// Load data on mount
onMounted(() => {
  loadReportsData();
});

// Simple chart component (since we don't have recharts in Vue)
const SimpleBarChart = {
  props: ['data', 'width', 'height'],
  template: `
    <div class="chart-container" :style="{ width: width + 'px', height: height + 'px' }">
      <svg :width="width" :height="height" class="chart">
        <g v-for="(item, index) in data" :key="index">
          <rect 
            :x="index * (width / data.length) + 10" 
            :y="height - (item.value / maxValue) * (height - 40) - 20"
            :width="(width / data.length) - 20" 
            :height="(item.value / maxValue) * (height - 40)"
            :fill="getBarColor(index)"
            class="bar"
          />
          <text 
            :x="index * (width / data.length) + (width / data.length) / 2" 
            :y="height - 5"
            text-anchor="middle" 
            class="chart-label"
          >{{ item.label }}</text>
        </g>
      </svg>
    </div>
  `,
  computed: {
    maxValue() {
      return Math.max(...this.data.map(item => item.value));
    }
  },
  methods: {
    getBarColor(index) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      return colors[index % colors.length];
    }
  }
};

const SimpleLineChart = {
  props: ['data', 'width', 'height'],
  template: `
    <div class="chart-container" :style="{ width: width + 'px', height: height + 'px' }">
      <svg :width="width" :height="height" class="chart">
        <polyline 
          :points="linePoints"
          fill="none"
          stroke="#3b82f6"
          stroke-width="2"
          class="line"
        />
        <circle 
          v-for="(point, index) in points" 
          :key="index"
          :cx="point.x" 
          :cy="point.y" 
          r="4" 
          fill="#3b82f6"
          class="dot"
        />
        <text 
          v-for="(item, index) in data" 
          :key="index"
          :x="index * (width / (data.length - 1)) + 10" 
          :y="height - 5"
          text-anchor="middle" 
          class="chart-label"
        >{{ item.label }}</text>
      </svg>
    </div>
  `,
  computed: {
    points() {
      return this.data.map((item, index) => ({
        x: index * (this.width / (this.data.length - 1)) + 10,
        y: this.height - (item.value / this.maxValue) * (this.height - 40) - 20
      }));
    },
    linePoints() {
      return this.points.map(p => `${p.x},${p.y}`).join(' ');
    },
    maxValue() {
      return Math.max(...this.data.map(item => item.value));
    }
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">HR Reports & Analytics</h2>
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
            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users class="h-5 w-5 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Total Employees</p>
              <p class="mt-1 text-xl font-semibold">{{ summaryStats.totalEmployees || 0 }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign class="h-5 w-5 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Monthly Payroll</p>
              <p class="mt-1 text-xl font-semibold">${{ summaryStats.monthlyPayroll || 0 }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock class="h-5 w-5 text-primary" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Total Hours</p>
              <p class="mt-1 text-xl font-semibold">{{ summaryStats.totalHours || 0 }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertCircle class="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Compliance Issues</p>
              <p class="mt-1 text-xl font-semibold">{{ summaryStats.complianceIssues || 0 }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Tabs default-value="payroll" class="space-y-4">
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
            <div class="h-80 flex items-center justify-center border rounded-lg bg-muted/20">
              <div class="text-center text-muted-foreground">
                <TrendingUp class="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Payroll Trends Chart</p>
                <p class="text-sm">Interactive chart would be displayed here</p>
              </div>
            </div>
            
            <div class="mt-6 grid grid-cols-3 gap-4">
              <div class="p-4 bg-accent/50 rounded-lg">
                <p class="text-sm text-muted-foreground">Average Monthly</p>
                <p class="mt-1 font-semibold">$144,700</p>
              </div>
              <div class="p-4 bg-accent/50 rounded-lg">
                <p class="text-sm text-muted-foreground">Overtime Ratio</p>
                <p class="mt-1 font-semibold">11.3%</p>
              </div>
              <div class="p-4 bg-accent/50 rounded-lg">
                <p class="text-sm text-muted-foreground">YoY Growth</p>
                <p class="mt-1 font-semibold text-green-600">+8.5%</p>
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
                <TableRow v-for="(dept, index) in departmentCostsData" :key="index">
                  <TableCell>{{ dept.dept }}</TableCell>
                  <TableCell>{{ dept.employees }}</TableCell>
                  <TableCell>{{ dept.avgHours }}h</TableCell>
                  <TableCell>${{ dept.totalCost.toLocaleString() }}</TableCell>
                  <TableCell>
                    ${{ Math.round(dept.totalCost / dept.employees).toLocaleString() }}
                  </TableCell>
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
            <div class="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
              <div class="text-center text-muted-foreground">
                <TrendingUp class="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Department Cost Chart</p>
                <p class="text-sm">Bar chart would be displayed here</p>
              </div>
            </div>
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
                    : 'bg-yellow-500/10 border-yellow-500/20'
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
                      <p class="text-2xl font-semibold">{{ item.value }}</p>
                      <p class="text-sm text-muted-foreground">Current</p>
                    </div>
                    <Badge
                      :variant="item.status === 'compliant' ? 'default' : 'secondary'"
                      :class="[
                        item.status === 'compliant' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : 'bg-yellow-600 hover:bg-yellow-700'
                      ]"
                    >
                      {{ item.status === 'compliant' ? 'Compliant' : 'Needs Review' }}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 p-4 bg-accent/50 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-muted-foreground">Compliance Score</p>
                  <p class="mt-1 text-xl font-semibold">84%</p>
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
            <div class="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
              <div class="text-center text-muted-foreground">
                <TrendingUp class="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Turnover Analysis Chart</p>
                <p class="text-sm">Line chart would be displayed here</p>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-3 gap-4">
              <div class="p-4 bg-green-500/10 rounded-lg">
                <p class="text-sm text-muted-foreground">Total Hires</p>
                <p class="mt-1 font-semibold">19</p>
              </div>
              <div class="p-4 bg-red-500/10 rounded-lg">
                <p class="text-sm text-muted-foreground">Total Exits</p>
                <p class="mt-1 font-semibold">10</p>
              </div>
              <div class="p-4 bg-accent/50 rounded-lg">
                <p class="text-sm text-muted-foreground">Turnover Rate</p>
                <p class="mt-1 font-semibold">9.2%</p>
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
            <div class="h-80 flex items-center justify-center border rounded-lg bg-muted/20">
              <div class="text-center text-muted-foreground">
                <TrendingUp class="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Labor Distribution Chart</p>
                <p class="text-sm">Area chart would be displayed here</p>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-3 gap-4">
              <div class="p-4 bg-accent/50 rounded-lg">
                <p class="text-sm text-muted-foreground">Peak Hours</p>
                <p class="mt-1 font-semibold">10 AM - 2 PM</p>
              </div>
              <div class="p-4 bg-accent/50 rounded-lg">
                <p class="text-sm text-muted-foreground">Peak Employees</p>
                <p class="mt-1 font-semibold">95 people</p>
              </div>
              <div class="p-4 bg-accent/50 rounded-lg">
                <p class="text-sm text-muted-foreground">Avg Active</p>
                <p class="mt-1 font-semibold">68 people</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>

<style scoped>
.chart-container {
  @apply w-full;
}

.chart {
  @apply w-full h-full;
}

.bar {
  @apply transition-all duration-200 hover:opacity-80;
}

.line {
  @apply stroke-2;
}

.dot {
  @apply transition-all duration-200;
}

.dot:hover {
  r: 6;
}

.chart-label {
  @apply text-xs fill-muted-foreground;
}
</style>