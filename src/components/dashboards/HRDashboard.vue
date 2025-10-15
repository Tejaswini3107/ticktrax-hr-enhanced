<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import Card from "../ui/card.vue";
import { CardContent, CardHeader, CardTitle } from "../ui/card-components.vue";
import Button from "../ui/button.vue";
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Download, 
  FileText, 
  Settings,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  Shield,
  BarChart3,
  PieChart,
  Activity,
  UserCheck,
  UserX,
  Briefcase,
  Target,
  Award
} from "lucide-vue-next";
import Badge from "../ui/badge.vue";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.vue";
import { Progress } from "../ui/progress.vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.vue";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.vue";
import { Input } from "../ui/input.vue";
import { Label } from "../ui/label.vue";
import { toast } from 'vue-sonner';
import realTimeService from '../../services/realTimeService.js';
import { apiService } from '../../services/apiService.js';
import authManager from '../../services/authService.js';

const props = defineProps({
  currentView: String
});

// State management
const isLoading = ref(false);
const selectedPeriod = ref('monthly');
const selectedDepartment = ref('all');

// HR Dashboard Data
const hrStats = ref({
  totalEmployees: 0,
  activeEmployees: 0,
  newHires: 0,
  departures: 0,
  averageHours: 0,
  overtimeHours: 0,
  attendanceRate: 0,
  productivityScore: 0
});

const employees = ref([]);
const departments = ref([]);
const attendanceData = ref([]);
const payrollData = ref([]);
const performanceMetrics = ref([]);
const alerts = ref([]);
const recentActivities = ref([]);

// Charts data
const attendanceChart = ref([]);
const departmentChart = ref([]);
const productivityChart = ref([]);

// Load HR Dashboard data
const loadHRDashboard = async () => {
  isLoading.value = true;
  console.log('📊 HR Dashboard: Loading data from API...');
  
  try {
    // Load employees
    const employeesRes = await apiService.listUsers();
    if (employeesRes && Array.isArray(employeesRes)) {
      employees.value = employeesRes;
      hrStats.value.totalEmployees = employeesRes.length;
      hrStats.value.activeEmployees = employeesRes.filter(emp => emp.status === 'active').length;
    }

    // Load teams/departments
    const teamsRes = await apiService.listTeams();
    if (teamsRes && Array.isArray(teamsRes)) {
      departments.value = teamsRes;
    }

    // Load analytics data
    try {
      const analyticsRes = await apiService.getAnalyticsOverview();
      if (analyticsRes) {
        hrStats.value.averageHours = analyticsRes.average_hours || 0;
        hrStats.value.overtimeHours = analyticsRes.overtime_hours || 0;
        hrStats.value.attendanceRate = analyticsRes.attendance_rate || 0;
        hrStats.value.productivityScore = analyticsRes.productivity_score || 0;
      }
    } catch (e) {
      console.log('Analytics not available:', e);
    }

    // Load attendance data
    try {
      const attendanceRes = await apiService.getAttendanceAnalytics({
        start_date: getDateRange(selectedPeriod.value).start,
        end_date: getDateRange(selectedPeriod.value).end
      });
      if (attendanceRes) {
        attendanceData.value = attendanceRes;
        processAttendanceChart(attendanceRes);
      }
    } catch (e) {
      console.log('Attendance analytics not available:', e);
    }

    // Load payroll data
    try {
      const payrollRes = await apiService.getPayrollSummary({ period: 'current' });
      if (payrollRes) {
        payrollData.value = payrollRes;
      }
    } catch (e) {
      console.log('Payroll data not available:', e);
    }

    // Load performance metrics
    try {
      const performanceRes = await apiService.getProductivityMetrics({ period: selectedPeriod.value });
      if (performanceRes) {
        performanceMetrics.value = performanceRes;
        processProductivityChart(performanceRes);
      }
    } catch (e) {
      console.log('Performance metrics not available:', e);
    }

    // Load notifications/alerts
    try {
      const notificationsRes = await apiService.listNotifications({ limit: 10 });
      if (notificationsRes && Array.isArray(notificationsRes)) {
        alerts.value = notificationsRes
          .filter(n => n.type === 'hr_alert' || n.priority === 'high')
          .slice(0, 5);
      }
    } catch (e) {
      console.log('Notifications not available:', e);
    }

    // Process department chart
    processDepartmentChart();

    // Load recent activities
    loadRecentActivities();

  } catch (error) {
    console.error('Error loading HR dashboard:', error);
    toast.error('Failed to load HR dashboard data');
  } finally {
    isLoading.value = false;
  }
};

// Helper functions
const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'weekly':
      start.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'quarterly':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'yearly':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setMonth(now.getMonth() - 1);
  }
  
  return {
    start: start.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0]
  };
};

const processAttendanceChart = (data) => {
  if (data && data.daily_attendance) {
    attendanceChart.value = data.daily_attendance.map(day => ({
      date: day.date,
      present: day.present,
      absent: day.absent,
      late: day.late
    }));
  }
};

const processDepartmentChart = () => {
  if (departments.value.length > 0) {
    departmentChart.value = departments.value.map(dept => ({
      name: dept.name,
      employees: dept.employee_count || 0,
      productivity: Math.floor(Math.random() * 40) + 60 // Mock data
    }));
  }
};

const processProductivityChart = (data) => {
  if (data && data.weekly_metrics) {
    productivityChart.value = data.weekly_metrics.map(week => ({
      week: week.week,
      productivity: week.productivity_score,
      hours: week.total_hours
    }));
  }
};

const loadRecentActivities = () => {
  recentActivities.value = [
    { type: 'hire', message: 'John Doe joined the team', time: '2 hours ago', icon: UserPlus },
    { type: 'promotion', message: 'Jane Smith promoted to Senior Developer', time: '1 day ago', icon: Award },
    { type: 'attendance', message: 'Attendance rate improved by 5%', time: '2 days ago', icon: TrendingUp },
    { type: 'payroll', message: 'Monthly payroll processed', time: '3 days ago', icon: DollarSign },
    { type: 'alert', message: 'Overtime hours exceeded threshold', time: '4 days ago', icon: AlertTriangle }
  ];
};

// Event handlers
const handlePeriodChange = (period) => {
  selectedPeriod.value = period;
  loadHRDashboard();
};

const handleDepartmentFilter = (department) => {
  selectedDepartment.value = department;
  // Filter data based on department
};

const handleExportData = async () => {
  try {
    const report = await apiService.exportReports({
      type: 'hr_summary',
      format: 'excel',
      start_date: getDateRange(selectedPeriod.value).start,
      end_date: getDateRange(selectedPeriod.value).end
    });
    toast.success('HR report exported successfully');
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Failed to export HR data');
  }
};

const handleGenerateReport = async () => {
  try {
    const report = await apiService.generateAttendanceReport({
      start_date: getDateRange(selectedPeriod.value).start,
      end_date: getDateRange(selectedPeriod.value).end
    });
    toast.success('HR report generated successfully');
  } catch (error) {
    console.error('Report generation error:', error);
    toast.error('Failed to generate HR report');
  }
};

// Setup realtime updates
onMounted(() => {
  console.log('📡 HR Dashboard: Setting up realtime listeners');
  
  // Load initial data
  loadHRDashboard();
  
  // Listen for HR-specific updates
  const handleEmployeeUpdate = (data) => {
    console.log('📡 Realtime: Employee update', data);
    loadHRDashboard(); // Reload data
  };
  
  const handleAttendanceUpdate = (data) => {
    console.log('📡 Realtime: Attendance update', data);
    loadHRDashboard(); // Reload data
  };
  
  const handlePayrollUpdate = (data) => {
    console.log('📡 Realtime: Payroll update', data);
    loadHRDashboard(); // Reload data
  };
  
  // Register listeners
  realTimeService.on('employee_update', handleEmployeeUpdate);
  realTimeService.on('attendance_update', handleAttendanceUpdate);
  realTimeService.on('payroll_update', handlePayrollUpdate);
  
  onUnmounted(() => {
    // Cleanup listeners
    realTimeService.off('employee_update', handleEmployeeUpdate);
    realTimeService.off('attendance_update', handleAttendanceUpdate);
    realTimeService.off('payroll_update', handlePayrollUpdate);
  });
});

// Computed properties
const filteredEmployees = computed(() => {
  if (selectedDepartment.value === 'all') {
    return employees.value;
  }
  return employees.value.filter(emp => emp.department === selectedDepartment.value);
});

const topPerformers = computed(() => {
  return employees.value
    .filter(emp => emp.performance_score > 85)
    .sort((a, b) => b.performance_score - a.performance_score)
    .slice(0, 5);
});

const attendanceIssues = computed(() => {
  return employees.value
    .filter(emp => emp.attendance_rate < 90)
    .sort((a, b) => a.attendance_rate - b.attendance_rate);
});
</script>

<template>
  <div v-if="currentView === 'employees'">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2>Employee Management</h2>
          <p class="text-muted-foreground mt-1">Manage your workforce and employee data</p>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" class="gap-2">
            <Download class="h-4 w-4" />
            Export
          </Button>
          <Button class="gap-2">
            <UserPlus class="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex gap-4">
        <div class="flex-1">
          <Label for="department">Department</Label>
          <Select v-model="selectedDepartment" @update:model-value="handleDepartmentFilter">
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex-1">
          <Label for="search">Search</Label>
          <Input placeholder="Search employees..." />
        </div>
      </div>

      <!-- Employee Table -->
      <Card>
        <CardHeader>
          <CardTitle>Employees ({{ filteredEmployees.length }})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="employee in filteredEmployees" :key="employee.id">
                <TableCell class="font-medium">
                  {{ employee.first_name }} {{ employee.last_name }}
                </TableCell>
                <TableCell>{{ employee.department || 'N/A' }}</TableCell>
                <TableCell>{{ employee.role || 'Employee' }}</TableCell>
                <TableCell>
                  <Badge :variant="employee.status === 'active' ? 'default' : 'secondary'">
                    {{ employee.status || 'Active' }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Progress :value="employee.attendance_rate || 95" class="w-16" />
                    <span class="text-sm">{{ employee.attendance_rate || 95 }}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Progress :value="employee.performance_score || 85" class="w-16" />
                    <span class="text-sm">{{ employee.performance_score || 85 }}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex gap-2">
                    <Button size="sm" variant="ghost">Edit</Button>
                    <Button size="sm" variant="ghost">View</Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </div>

  <div v-else-if="currentView === 'approvals'">
    <div class="space-y-6">
      <div>
        <h2>HR Approvals</h2>
        <p class="text-muted-foreground mt-1">Review and approve HR-related requests</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Pending Requests</p>
                <p class="text-2xl mt-1">12</p>
              </div>
              <div class="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock class="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Approved Today</p>
                <p class="text-2xl mt-1">8</p>
              </div>
              <div class="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle class="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Rejected Today</p>
                <p class="text-2xl mt-1">2</p>
              </div>
              <div class="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <XCircle class="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>

  <div v-else-if="currentView === 'reports'">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2>HR Reports</h2>
          <p class="text-muted-foreground mt-1">Comprehensive HR analytics and reports</p>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" class="gap-2" @click="handleExportData">
            <Download class="h-4 w-4" />
            Export
          </Button>
          <Button class="gap-2" @click="handleGenerateReport">
            <FileText class="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs default-value="overview" class="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent class="pt-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-muted-foreground">Total Employees</p>
                    <p class="text-2xl mt-1">{{ hrStats.totalEmployees }}</p>
                  </div>
                  <Users class="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent class="pt-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-muted-foreground">Active Employees</p>
                    <p class="text-2xl mt-1">{{ hrStats.activeEmployees }}</p>
                  </div>
                  <UserCheck class="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent class="pt-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-muted-foreground">Attendance Rate</p>
                    <p class="text-2xl mt-1">{{ hrStats.attendanceRate }}%</p>
                  </div>
                  <Activity class="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent class="pt-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-muted-foreground">Productivity Score</p>
                    <p class="text-2xl mt-1">{{ hrStats.productivityScore }}%</p>
                  </div>
                  <Target class="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="attendance" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="employee in attendanceIssues" :key="employee.id" class="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p class="font-medium">{{ employee.first_name }} {{ employee.last_name }}</p>
                    <p class="text-sm text-muted-foreground">{{ employee.department }}</p>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-right">
                      <p class="text-sm font-medium">{{ employee.attendance_rate }}%</p>
                      <p class="text-xs text-muted-foreground">Attendance</p>
                    </div>
                    <Badge variant="destructive">Low Attendance</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="employee in topPerformers" :key="employee.id" class="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p class="font-medium">{{ employee.first_name }} {{ employee.last_name }}</p>
                    <p class="text-sm text-muted-foreground">{{ employee.department }}</p>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-right">
                      <p class="text-sm font-medium">{{ employee.performance_score }}%</p>
                      <p class="text-xs text-muted-foreground">Performance</p>
                    </div>
                    <Badge variant="default" class="bg-green-500">Top Performer</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payroll" class="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="text-center p-4 border rounded-lg">
                  <DollarSign class="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p class="text-2xl font-bold">$125,450</p>
                  <p class="text-sm text-muted-foreground">Total Payroll</p>
                </div>
                <div class="text-center p-4 border rounded-lg">
                  <Clock class="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p class="text-2xl font-bold">2,450</p>
                  <p class="text-sm text-muted-foreground">Total Hours</p>
                </div>
                <div class="text-center p-4 border rounded-lg">
                  <TrendingUp class="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p class="text-2xl font-bold">$51.20</p>
                  <p class="text-sm text-muted-foreground">Avg Hourly Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>

  <div v-else-if="currentView === 'settings'">
    <div class="space-y-6">
      <div>
        <h2>HR Settings</h2>
        <p class="text-muted-foreground mt-1">Configure HR policies and system settings</p>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Work Policies</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Standard Work Hours</p>
                <p class="text-sm text-muted-foreground">Default daily work hours</p>
              </div>
              <Input type="number" value="8" class="w-20" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Overtime Threshold</p>
                <p class="text-sm text-muted-foreground">Hours before overtime kicks in</p>
              </div>
              <Input type="number" value="40" class="w-20" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Break Duration</p>
                <p class="text-sm text-muted-foreground">Standard break time in minutes</p>
              </div>
              <Input type="number" value="30" class="w-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Attendance Alerts</p>
                <p class="text-sm text-muted-foreground">Notify when attendance drops</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Overtime Notifications</p>
                <p class="text-sm text-muted-foreground">Alert on excessive overtime</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Payroll Reminders</p>
                <p class="text-sm text-muted-foreground">Remind about payroll deadlines</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>

  <!-- Main HR Dashboard -->
  <div v-else class="space-y-6">
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-muted-foreground">Loading HR dashboard...</p>
    </div>
    
    <div v-else>
      <!-- Period Selector -->
      <div class="flex items-center justify-between">
        <div>
          <h2>HR Dashboard</h2>
          <p class="text-muted-foreground mt-1">Comprehensive workforce analytics and management</p>
        </div>
        <div class="flex gap-2">
          <Select v-model="selectedPeriod" @update:model-value="handlePeriodChange">
            <SelectTrigger class="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" class="gap-2" @click="handleExportData">
            <Download class="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Total Employees</p>
                <p class="text-2xl mt-1">{{ hrStats.totalEmployees }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users class="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Active Employees</p>
                <p class="text-2xl mt-1">{{ hrStats.activeEmployees }}</p>
              </div>
              <div class="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <UserCheck class="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Attendance Rate</p>
                <p class="text-2xl mt-1">{{ hrStats.attendanceRate }}%</p>
              </div>
              <div class="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Activity class="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Productivity Score</p>
                <p class="text-2xl mt-1">{{ hrStats.productivityScore }}%</p>
              </div>
              <div class="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Target class="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Charts and Analytics -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-for="dept in departmentChart" :key="dept.name" class="space-y-2">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium">{{ dept.name }}</p>
                  <span class="text-sm text-muted-foreground">{{ dept.employees }} employees</span>
                </div>
                <Progress :value="dept.productivity" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-for="activity in recentActivities" :key="activity.message" class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <component :is="activity.icon" class="h-4 w-4" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ activity.message }}</p>
                  <p class="text-xs text-muted-foreground">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Alerts and Notifications -->
      <Card v-if="alerts.length > 0">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <AlertTriangle class="h-5 w-5" />
            HR Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div v-for="alert in alerts" :key="alert.id" class="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-medium">{{ alert.title || 'HR Alert' }}</p>
                  <p class="text-sm text-muted-foreground mt-1">{{ alert.message }}</p>
                </div>
                <Badge variant="secondary">{{ alert.priority || 'Medium' }}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
