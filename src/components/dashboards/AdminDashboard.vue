<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import Card from "../ui/card.vue";
import { CardContent, CardHeader, CardTitle } from "../ui/card-components.vue";
import Button from "../ui/button.vue";
import Input from "../ui/input.vue";
import { Users, Clock, TrendingUp, AlertTriangle, Search, Filter, Download, UserPlus, MapPin } from "lucide-vue-next";
import Badge from "../ui/badge.vue";
import Switch from "../ui/switch.vue";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.vue";
import AdminReports from "../reports/AdminReports.vue";
import HelpCenter from "../help/HelpCenter.vue";
import EmployeeDetailsDialog from "../dialogs/EmployeeDetailsDialog.vue";
import AddEditEmployeeDialog from "../dialogs/AddEditEmployeeDialog.vue";
import AddUserDialog from "../dialogs/AddUserDialog.vue";
import GenerateReportDialog from "../dialogs/GenerateReportDialog.vue";
import ExportDataDialog from "../dialogs/ExportDataDialog.vue";
import WorkWeekSettingsDialog from "../dialogs/WorkWeekSettingsDialog.vue";
import { toast } from 'vue-sonner';
import realTimeService from '../../services/realTimeService.js';
import { apiService } from '../../services/apiService.js';
import authManager from '../../services/authService.js';

const props = defineProps({
  currentView: String
});

const selectedEmployee = ref(null);
const isDetailsOpen = ref(false);
const isAddEditOpen = ref(false);
const editingEmployee = ref(null);
const isReportOpen = ref(false);
const isExportOpen = ref(false);
const isAddUserOpen = ref(false);
const isWorkWeekOpen = ref(false);
const isLoading = ref(false);
const searchQuery = ref('');

// API-driven data
const employees = ref([]);
const departmentStats = ref([]);
const dashboardStats = ref({
  totalEmployees: 0,
  activeToday: 0,
  totalHoursWeek: 0,
  pendingActions: 0
});

// Filtered employees based on search
const filteredEmployees = computed(() => {
  if (!searchQuery.value) return employees.value;
  const query = searchQuery.value.toLowerCase();
  return employees.value.filter(emp => 
    emp.name.toLowerCase().includes(query) ||
    emp.department?.toLowerCase().includes(query) ||
    emp.role?.toLowerCase().includes(query)
  );
});

const handleViewEmployee = (employee) => {
  selectedEmployee.value = employee;
  isDetailsOpen.value = true;
};

const handleAddUser = () => {
  isAddUserOpen.value = true;
};

const handleEditEmployee = (employee) => {
  editingEmployee.value = employee;
  isAddEditOpen.value = true;
};

// Load dashboard data from API
const loadDashboard = async () => {
  isLoading.value = true;
  console.log('👑 Admin Dashboard: Loading data from API...');
  
  try {
    // Load all users/employees
    console.log('👑 Fetching users...');
    const usersRes = await apiService.getUsers();
    console.log('👑 Users response:', usersRes);
    
    if (usersRes && Array.isArray(usersRes)) {
      employees.value = usersRes.map(user => ({
        id: user.id,
        emp_id: `EMP${String(user.id).padStart(3, '0')}`,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || user.email,
        department: user.department || 'General',
        role: user.role || (user.role_id === 1 ? 'admin' : user.role_id === 2 ? 'manager' : user.role_id === 3 ? 'hr' : 'employee'),
        status: user.is_active !== false ? 'active' : 'inactive',
        hoursThisWeek: user.hours_this_week || 0,
        type: user.employee_type || 'Regular',
        email: user.email
      }));
    }
    
    // Calculate department stats from employees
    const deptMap = new Map();
    employees.value.forEach(emp => {
      const dept = emp.department || 'General';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { department: dept, employees: 0, activeToday: 0, totalHours: 0 });
      }
      const stats = deptMap.get(dept);
      stats.employees++;
      if (emp.status === 'active') stats.activeToday++;
      stats.totalHours += emp.hoursThisWeek || 0;
    });
    
    departmentStats.value = Array.from(deptMap.values()).map(dept => ({
      ...dept,
      avgHours: dept.employees > 0 ? (dept.totalHours / dept.employees).toFixed(1) : 0
    }));
    
    // Get analytics
    try {
      const analyticsRes = await apiService.getAnalyticsOverview();
      const totalHours = employees.value.reduce((sum, emp) => sum + (emp.hoursThisWeek || 0), 0);
      
      dashboardStats.value = {
        totalEmployees: employees.value.length,
        activeToday: employees.value.filter(e => e.status === 'active').length,
        totalHoursWeek: Math.round(totalHours),
        pendingActions: analyticsRes?.pending_approvals || 0
      };
    } catch (e) {
      console.log('Analytics not available:', e);
      const totalHours = employees.value.reduce((sum, emp) => sum + (emp.hoursThisWeek || 0), 0);
      dashboardStats.value = {
        totalEmployees: employees.value.length,
        activeToday: employees.value.filter(e => e.status === 'active').length,
        totalHoursWeek: Math.round(totalHours),
        pendingActions: 0
      };
    }
    
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    toast.error('Failed to load dashboard data');
  } finally {
    isLoading.value = false;
  }
};

// Setup realtime updates
onMounted(() => {
  console.log('📡 Admin Dashboard: Setting up realtime listeners');
  
  // Load initial data
  loadDashboard();
  
  // Listen for system-wide updates
  const handleSystemAlert = (data) => {
    console.log('📡 Realtime: System alert', data);
    toast.warning(data.message, { duration: 5000 });
  };
  
  const handleEmployeeStatusChange = (data) => {
    console.log('📡 Realtime: Employee status changed', data);
    loadDashboard(); // Reload data
  };
  
  const handleDepartmentStatsUpdated = (data) => {
    console.log('📡 Realtime: Department stats updated', data);
    loadDashboard(); // Reload data
  };
  
  const handleNotifications = (notifications) => {
    console.log('📡 Realtime: Admin notifications', notifications);
    notifications.forEach(notif => {
      if (!notif.read) {
        toast.info(notif.message);
      }
    });
  };
  
  // Register listeners
  realTimeService.on('system-alert', handleSystemAlert);
  realTimeService.on('employee-status-changed', handleEmployeeStatusChange);
  realTimeService.on('department-stats-updated', handleDepartmentStatsUpdated);
  realTimeService.on('notifications-updated', handleNotifications);
  
  onUnmounted(() => {
    // Cleanup listeners
    realTimeService.off('system-alert', handleSystemAlert);
    realTimeService.off('employee-status-changed', handleEmployeeStatusChange);
    realTimeService.off('department-stats-updated', handleDepartmentStatsUpdated);
    realTimeService.off('notifications-updated', handleNotifications);
  });
});

const handleSaveEmployee = async (employeeData) => {
  try {
    if (editingEmployee.value) {
      await apiService.updateUser(editingEmployee.value.id, employeeData);
      toast.success("Employee updated successfully!");
    } else {
      await apiService.createUser(employeeData);
      toast.success("Employee added successfully!");
    }
    isAddEditOpen.value = false;
    loadDashboard(); // Reload data
  } catch (error) {
    console.error('Error saving employee:', error);
    toast.error("Failed to save employee");
  }
};

const handleUserAdded = async (userData) => {
  try {
    await apiService.createUser(userData);
    toast.success("User added successfully!");
    isAddUserOpen.value = false;
    loadDashboard(); // Reload data
  } catch (error) {
    console.error('Error adding user:', error);
    toast.error("Failed to add user");
  }
};

</script>

<template>
  <div v-if="currentView === 'employees'">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2>Employee Management</h2>
          <p class="text-muted-foreground mt-1">Manage all employees across departments</p>
        </div>
        <div class="flex gap-2">
          <Button class="gap-2" @click="handleAddUser">
            <UserPlus class="h-4 w-4" />
            Add New Employee
          </Button>
        </div>
      </div>
      <div class="flex gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input v-model="searchQuery" placeholder="Search employees..." class="pl-10" />
        </div>
        <Button variant="outline" class="gap-2">
          <Filter class="h-4 w-4" />
          Filter
        </Button>
      </div>
      <Card>
        <CardContent class="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hours This Week</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="employee in filteredEmployees" :key="employee.id">
                <TableCell>
                  <div>
                    <p class="font-medium">{{ employee.name }}</p>
                    <p class="text-sm text-muted-foreground">{{ employee.id }}</p>
                  </div>
                </TableCell>
                <TableCell>{{ employee.department }}</TableCell>
                <TableCell>
                  <Badge :variant="employee.role === 'manager' ? 'default' : 'secondary'">{{ employee.role }}</Badge>
                </TableCell>
                <TableCell>
                  <Badge :variant="employee.status === 'active' ? 'default' : 'secondary'" :class="employee.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'">
                    {{ employee.status }}
                  </Badge>
                </TableCell>
                <TableCell>{{ employee.hoursThisWeek }}h</TableCell>
                <TableCell>
                  <div class="flex items-center gap-1">
                    <MapPin v-if="employee.type === 'Field Worker'" class="h-3 w-3 text-blue-500" />
                    {{ employee.type }}
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex gap-2">
                    <Button variant="ghost" size="sm" @click="handleViewEmployee(employee)">View</Button>
                    <Button variant="ghost" size="sm" @click="handleEditEmployee(employee)">Edit</Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    <EmployeeDetailsDialog :employee="selectedEmployee" :open="isDetailsOpen" @update:open="isDetailsOpen = $event" />
    <AddUserDialog :open="isAddUserOpen" @update:open="isAddUserOpen = $event" @save="handleUserAdded" />
  </div>

  <div v-else-if="currentView === 'analytics'">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2>Workforce Analytics</h2>
          <p class="text-muted-foreground mt-1">Monitor employee distribution and performance across departments</p>
        </div>
        <Button variant="outline" class="gap-2" @click="isExportOpen = true">
          <Download class="h-4 w-4" />
          Export Data
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Department Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Total Employees</TableHead>
                <TableHead>Active Today</TableHead>
                <TableHead>Avg Hours/Week</TableHead>
                <TableHead>Utilization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(dept, index) in departmentStats" :key="index">
                <TableCell>{{ dept.department }}</TableCell>
                <TableCell>{{ dept.employees }}</TableCell>
                <TableCell>
                  <Badge variant="default" class="bg-green-500 hover:bg-green-600">{{ dept.activeToday }}</Badge>
                </TableCell>
                <TableCell>{{ dept.avgHours }}h</TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div class="h-full bg-primary" :style="{ width: `${Math.round((dept.activeToday / dept.employees) * 100)}%` }"></div>
                    </div>
                    <span class="text-sm">{{ Math.round((dept.activeToday / dept.employees) * 100) }}%</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div v-if="isLoading" class="text-center py-8">
        <p class="text-muted-foreground">Loading analytics...</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent class="pt-6">
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">Total Employees</p>
              <p class="text-3xl">{{ dashboardStats.totalEmployees }}</p>
              <p class="text-sm text-muted-foreground">Across all departments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-6">
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">Active Today</p>
              <p class="text-3xl">{{ dashboardStats.activeToday }}</p>
              <p class="text-sm text-muted-foreground">{{ dashboardStats.totalEmployees > 0 ? Math.round((dashboardStats.activeToday / dashboardStats.totalEmployees) * 100) : 0 }}% attendance rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-6">
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">Total Hours This Week</p>
              <p class="text-3xl">{{ dashboardStats.totalHoursWeek }}</p>
              <p class="text-sm text-muted-foreground">Across all departments</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <ExportDataDialog :open="isExportOpen" @update:open="isExportOpen = $event" dataType="analytics" />
  </div>

  <AdminReports v-else-if="currentView === 'reports'" />

  <div v-else-if="currentView === 'settings'">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2>System Settings</h2>
          <p class="text-muted-foreground mt-1">Configure system access control and notification preferences</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Control</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Manager Overrides</p>
                <p class="text-sm text-muted-foreground">Timesheet approvals</p>
              </div>
              <Switch :defaultChecked="true" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Kiosk Mode Access</p>
                <p class="text-sm text-muted-foreground">Warehouse terminals</p>
              </div>
              <Button variant="outline" size="sm" @click="toast.success('Manage Kiosk Mode Access settings')">Manage</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Overtime Alerts</p>
                <p class="text-sm text-muted-foreground">Real-time notifications</p>
              </div>
              <Switch :defaultChecked="true" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Missing Clock-out</p>
                <p class="text-sm text-muted-foreground">Daily reminders</p>
              </div>
              <Switch :defaultChecked="true" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>

  <HelpCenter v-else-if="currentView === 'help'" currentRole="admin" />

  <div v-else class="space-y-6">
    <div>
      <h2>Admin Dashboard</h2>
      <p class="text-muted-foreground mt-1">Overview of workforce and system status</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">Total Employees</p>
              <p class="text-2xl">119</p>
            </div>
            <Users class="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">Clocked In</p>
              <p class="text-2xl">87</p>
            </div>
            <Clock class="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">Avg Hours/Week</p>
              <p class="text-2xl">41.2</p>
            </div>
            <TrendingUp class="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">Alerts</p>
              <p class="text-2xl">3</p>
            </div>
            <AlertTriangle class="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Button variant="outline" class="gap-2" @click="isReportOpen = true">
            <Download class="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <div class="h-2 w-2 bg-green-500 rounded-full"></div>
            <div class="flex-1">
              <p class="text-sm">John Smith clocked in</p>
              <p class="text-xs text-muted-foreground">Production - 8:45 AM</p>
            </div>
          </div>
          <div class="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <div class="h-2 w-2 bg-blue-500 rounded-full"></div>
            <div class="flex-1">
              <p class="text-sm">Sarah Johnson submitted timesheet</p>
              <p class="text-xs text-muted-foreground">Field Service - 8:30 AM</p>
            </div>
          </div>
          <div class="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <div class="h-2 w-2 bg-yellow-500 rounded-full"></div>
            <div class="flex-1">
              <p class="text-sm">Mike Chen - Late clock in</p>
              <p class="text-xs text-muted-foreground">Quality Control - 9:15 AM</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    <EmployeeDetailsDialog :employee="selectedEmployee" :open="isDetailsOpen" @update:open="isDetailsOpen = $event" />
    <AddEditEmployeeDialog :employee="editingEmployee" :open="isAddEditOpen" @update:open="isAddEditOpen = $event" @save="handleSaveEmployee" />
    <GenerateReportDialog :open="isReportOpen" @update:open="isReportOpen = $event" reportType="hr" />
    <ExportDataDialog :open="isExportOpen" @update:open="isExportOpen = $event" dataType="admin" />
    <AddUserDialog :open="isAddUserOpen" @update:open="isAddUserOpen = $event" @save="handleUserAdded" />
    <WorkWeekSettingsDialog :open="isWorkWeekOpen" @update:open="isWorkWeekOpen = $event" @save="(settings) => { console.log('Work week settings saved:', settings); toast.success('Work week settings updated successfully!'); }" />
  </div>
</template>
