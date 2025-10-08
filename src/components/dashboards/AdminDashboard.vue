<script setup>
import { ref } from 'vue';
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

const employees = [
    { id: "EMP001", name: "John Smith", department: "Production", role: "employee", status: "active", hoursThisWeek: 42.5, type: "Regular" },
    { id: "EMP002", name: "Sarah Johnson", department: "Field Service", role: "manager", status: "active", hoursThisWeek: 45.2, type: "Field Worker" },
    { id: "EMP003", name: "Mike Chen", department: "Quality Control", role: "employee", status: "inactive", hoursThisWeek: 38.7, type: "Regular" },
    { id: "EMP004", name: "Emma Davis", department: "Production", role: "employee", status: "active", hoursThisWeek: 41.0, type: "Regular" },
    { id: "EMP005", name: "David Wilson", department: "Warehouse", role: "employee", status: "active", hoursThisWeek: 40.0, type: "Warehouse" },
    { id: "EMP006", name: "Lisa Anderson", department: "HR", role: "hr", status: "active", hoursThisWeek: 40.0, type: "Regular" },
];

const departmentStats = [
    { department: "Production", employees: 45, activeToday: 42, avgHours: 42.3 },
    { department: "Warehouse", employees: 28, activeToday: 26, avgHours: 41.8 },
    { department: "Field Service", employees: 18, activeToday: 15, avgHours: 39.5 },
    { department: "Quality Control", employees: 15, activeToday: 14, avgHours: 40.2 },
    { department: "HR", employees: 5, activeToday: 5, avgHours: 40.0 },
    { department: "Administration", employees: 8, activeToday: 8, avgHours: 39.8 },
];

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

const handleSaveEmployee = (employeeData) => {
  if (editingEmployee.value) {
    toast.success("Employee updated successfully!");
  } else {
    toast.success("Employee added successfully!");
  }
  isAddEditOpen.value = false;
};

const handleSaveUser = (userData) => {
  toast.success("User created successfully!");
  isAddUserOpen.value = false;
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
          <Input placeholder="Search employees..." class="pl-10" />
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
              <TableRow v-for="employee in employees" :key="employee.id">
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
    <AddUserDialog :open="isAddUserOpen" @update:open="isAddUserOpen = $event" @save="handleSaveUser" />
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent class="pt-6">
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">Total Employees</p>
              <p class="text-3xl">119</p>
              <p class="text-sm text-muted-foreground">Across all departments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-6">
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">Active Today</p>
              <p class="text-3xl">110</p>
              <p class="text-sm text-muted-foreground">92% attendance rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-6">
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">Avg Hours/Week</p>
              <p class="text-3xl">41.2</p>
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
    <AddUserDialog :open="isAddUserOpen" @update:open="isAddUserOpen = $event" @save="handleSaveUser" />
    <WorkWeekSettingsDialog :open="isWorkWeekOpen" @update:open="isWorkWeekOpen = $event" @save="(settings) => { console.log('Work week settings saved:', settings); toast.success('Work week settings updated successfully!'); }" />
  </div>
</template>
