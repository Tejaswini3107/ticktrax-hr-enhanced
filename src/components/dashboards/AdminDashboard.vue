<script setup>
import { ref, onMounted } from 'vue';
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
// AddUserDialog intentionally not used for employee edits; local AddEditEmployeeDialog is used instead
import GenerateReportDialog from "../dialogs/GenerateReportDialog.vue";
import ExportDataDialog from "../dialogs/ExportDataDialog.vue";
import WorkWeekSettingsDialog from "../dialogs/WorkWeekSettingsDialog.vue";
import { toast } from 'vue-sonner';
import apiService from '../../services/apiService.js';
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
// removed isAddUserOpen (we use isAddEditOpen for add/edit employee flows)
const isWorkWeekOpen = ref(false);
const employees = ref([]);
const departmentStats = ref([]);
const recentActivity = ref([]);
const summary = ref({ totalEmployees: 0, clockedIn: 0, avgHoursWeek: 0, alertsCount: 0 });

const loadAdminData = async () => {
  try {
    const cur = await authManager.getCurrentUser();
    if (!cur.success) throw new Error('Not signed in');

    // Load users
    const users = await apiService.listUsers();
    const userArray = Array.isArray(users) ? users : [];
    // Map employees for table
    const emps = [];
    const deptMap = new Map();
    let totalHours = 0;
    let clockedInCount = 0;
    const activities = [];

    // Limit per-user working-time fetches for performance
    for (const u of userArray.slice(0, 100)) {
      const uid = u.id || u.attributes?.id || u.user_id;
      const name = u.attributes?.first_name ? `${u.attributes.first_name} ${u.attributes.last_name}` : (u.name || u.email || `User ${uid}`);
      const role = u.role || u.attributes?.role || 'employee';
      const dept = u.department || u.attributes?.department || 'Unknown';
      const status = (u.active === false || u.attributes?.active === false) ? 'inactive' : 'active';

  // default employee entry
  emps.push({ id: uid || u.id || u.user_id || Math.random().toString(36).slice(2,9), name, email: u.attributes?.personal_email || u.attributes?.email || u.email || '', department: dept, role, status, hoursThisWeek: 0, type: u.attributes?.type || 'Regular' });

      // aggregate per-department
      if (!deptMap.has(dept)) deptMap.set(dept, { department: dept, employees: 0, activeToday: 0, totalHours: 0 });
      const dm = deptMap.get(dept);
      dm.employees += 1;

      try {
        const times = await apiService.getUserWorkingTimes(uid);
        const list = Array.isArray(times) ? times : [];
        // Calculate week window (last 7 days)
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);

        // Sum durations for entries whose start_time/timestamp falls within the last 7 days
        // Helper to compute hours for a single entry robustly
        const computeEntryHours = (t) => {
          // Try explicit hour-like fields first
          const hourFields = [t.duration_hours, t.hours, t.hours_total, t.duration, t.total_hours];
          for (const v of hourFields) {
            const n = Number(v);
            if (!isNaN(n) && n !== 0) return n;
          }

          // Try minute-like fields
          const minuteFields = [t.duration_minutes, t.minutes, t.total_minutes];
          for (const v of minuteFields) {
            const n = Number(v);
            if (!isNaN(n) && n !== 0) return n / 60;
          }

          // Fallback: compute from start/end timestamps (handle running entries)
          const s = t.start_time || t.timestamp || t.created_at || t.start || t.date;
          const e = t.end_time || t.stop_time || t.updated_at || t.end || t.stopped_at;
          if (!s) return 0;
          const sd = new Date(s);
          if (isNaN(sd)) return 0;
          let ed = e ? new Date(e) : null;
          if ((!ed || isNaN(ed)) && (t.status === 'running' || t.status === 'in_progress' || t.status === 'active')) {
            ed = now; // running entry — count up to now
          }
          if (!ed || isNaN(ed)) return 0;
          const diffHours = (ed.getTime() - sd.getTime()) / (1000 * 60 * 60);
          return diffHours > 0 ? diffHours : 0;
        };

        // Sum hours for entries that start within the 7-day window
        const weekly = list.reduce((acc, t) => {
          const s = t.start_time || t.timestamp || t.created_at || t.start || t.date;
          if (!s) return acc;
          const sd = new Date(s);
          if (isNaN(sd)) return acc;
          if (sd >= sevenDaysAgo && sd <= now) {
            return acc + computeEntryHours(t);
          }
          return acc;
        }, 0);

        totalHours += weekly;
        dm.totalHours += weekly;

        // Update employee hours (ensure we match the id we used when creating the row)
        const empIdx = emps.findIndex(e => e.id === (uid || u.id || u.user_id));
        if (empIdx >= 0) emps[empIdx].hoursThisWeek = Math.round(weekly * 10) / 10;

        // Active/clocked-in count: check if any recent entry is currently running (or missing an end)
        const activeNow = list.some(t => {
          if (t.status === 'running' || t.status === 'in_progress') return true;
          // if no explicit end/stop time and a start exists and it's recent, consider it running
          const s = t.start_time || t.timestamp || t.created_at || t.start || t.date;
          const e = t.end_time || t.stop_time || t.updated_at || t.end || t.stopped_at;
          if (s && !e) return true;
          return false;
        });
        if (activeNow) {
          clockedInCount += 1;
          dm.activeToday += 1;
        }

        // Collect recent activity entries: use the most recent entries by timestamp
        const recentSorted = list.slice().sort((a, b) => {
          const at = new Date(a.start_time || a.timestamp || a.created_at || 0).getTime();
          const bt = new Date(b.start_time || b.timestamp || b.created_at || 0).getTime();
          return bt - at;
        }).slice(0, 5);

        recentSorted.forEach(t => activities.push({
          user: name,
          action: t.action || (t.status === 'running' ? 'clocked in' : 'timesheet'),
          details: t.location || t.type || (t.start_time || t.timestamp) || '',
          time: t.start_time || t.timestamp || t.created_at || ''
        }));
      } catch (e) {
        console.warn('Failed loading working times for user', uid, e);
      }
    }

    employees.value = emps;

    // build departmentStats
    const deptArray = Array.from(deptMap.values()).map(d => ({ department: d.department, employees: d.employees, activeToday: d.activeToday, avgHours: d.employees ? Math.round((d.totalHours / d.employees) * 10) / 10 : 0 }));
    departmentStats.value = deptArray;

    summary.value.totalEmployees = userArray.length;
    summary.value.clockedIn = clockedInCount;
    summary.value.avgHoursWeek = userArray.length ? Math.round((totalHours / userArray.length) * 10) / 10 : 0;
    summary.value.alertsCount = 0; // Could be populated from alert endpoints

    // Build recent activity sorted by time (newest first)
    recentActivity.value = activities.sort((a,b) => (b.time || '').localeCompare(a.time || '')).slice(0, 10);
  } catch (err) {
    console.warn('Load admin data failed', err);
    toast.error('Unable to load admin data from server. Some admin features may be unavailable.');
    employees.value = [];
    departmentStats.value = [];
    recentActivity.value = [];
  }
};

onMounted(loadAdminData);

const handleViewEmployee = (employee) => {
  selectedEmployee.value = employee;
  isDetailsOpen.value = true;
};

const handleAddUser = () => {
  // Open the local Add/Edit Employee dialog for creating a new employee
  editingEmployee.value = null;
  isAddEditOpen.value = true;
};

const handleEditEmployee = (employee) => {
  // Open the Add/Edit Employee dialog (local form) and prefill with the selected employee
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
  // Normalize server response and either insert or replace existing employee
  try {
    const src = userData?.data || userData || {};
    const uid = src.id || src.user_id || src.id || Math.random().toString(36).slice(2,9);
  const name = src.first_name ? `${src.first_name} ${src.last_name || ''}`.trim() : (src.name || src.email || `User ${uid}`);
    const dept = src.department || 'Unknown';
    const role = src.role || 'employee';
    const status = src.active === false ? 'inactive' : 'active';
  const updatedEmp = { id: uid, name, email: src.personal_email || src.email || src.attributes?.personal_email || src.attributes?.email || '', department: dept, role, status, hoursThisWeek: 0, type: src.type || 'Regular' };

    // If we were editing, replace the existing employee entry
    const editIdx = employees.value.findIndex(e => e.id === (editingEmployee.value?.id || editingEmployee.value?.user_id || editingEmployee.value));
    if (editingEmployee.value?._editing && editIdx >= 0) {
      employees.value.splice(editIdx, 1, updatedEmp);
      toast.success('User updated successfully!');
    } else {
      employees.value = [updatedEmp, ...employees.value];
      summary.value.totalEmployees = (summary.value.totalEmployees || 0) + 1;
      toast.success('User created successfully!');
    }
  } catch (e) {
    console.warn('Failed to insert/replace created user into list', e);
    toast.success('User saved (server response) — refresh to see updates.');
  }
  // clear editing marker
  if (editingEmployee.value) delete editingEmployee.value._editing;
  // isAddUserOpen no longer used
};

</script>

<template>
  <div v-if="currentView === 'employees'">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2>Employee Management</h2>
          <p class="text-muted-foreground mt-1">Manage all employees</p>
        </div>
        <div class="flex gap-2">
          <Button class="gap-2" @click="handleAddUser">
            <UserPlus class="h-4 w-4" />
            Add New Employee
          </Button>
        </div>
      </div>
      <!-- <div class="flex gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search employees..." class="pl-10" />
        </div>
        <Button variant="outline" class="gap-2">
          <Filter class="h-4 w-4" />
          Filter
        </Button>
      </div> -->
      <Card>
        <CardContent class="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <!-- <TableHead>Status</TableHead> -->
                  <TableHead>Hours This Week</TableHead>
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
                <TableCell>
                  <div>
                    <p class="text-sm">{{ employee.email || '—' }}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge :variant="employee.role === 'manager' ? 'default' : 'secondary'">{{ employee.role }}</Badge>
                </TableCell>
                <!-- <TableCell>
                  <Badge :variant="employee.status === 'active' ? 'default' : 'secondary'" :class="employee.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'">
                    {{ employee.status }}
                  </Badge>
                </TableCell> -->
                <TableCell>{{ employee.hoursThisWeek }}h</TableCell>
                
                <TableCell>
                  <div class="flex gap-2">
                    <!-- <Button variant="ghost" size="sm" @click="handleViewEmployee(employee)">View</Button> -->
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
  <!-- Add/Edit dialog must be present in the employees view so handleEditEmployee can open it -->
  <AddEditEmployeeDialog :employee="editingEmployee" :open="isAddEditOpen" @update:open="isAddEditOpen = $event" @save="handleSaveEmployee" />
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
                      <div class="h-full bg-primary" :style="{ width: `${dept.employees ? Math.round((dept.activeToday / dept.employees) * 100) : 0}%` }"></div>
                    </div>
                    <span class="text-sm">{{ dept.employees ? Math.round((dept.activeToday / dept.employees) * 100) : 0 }}%</span>
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
              <p class="text-3xl">{{ summary.totalEmployees }}</p>
              <p class="text-sm text-muted-foreground">Across all departments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-6">
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">Active Today</p>
              <p class="text-3xl">{{ summary.clockedIn }}</p>
              <p class="text-sm text-muted-foreground">92% attendance rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent class="pt-6">
            <div class="space-y-2">
              <p class="text-sm text-muted-foreground">Avg Hours/Week</p>
              <p class="text-3xl">{{ summary.avgHoursWeek }}</p>
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
              <p class="text-2xl">{{ summary.totalEmployees }}</p>
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
              <p class="text-2xl">{{ summary.clockedIn }}</p>
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
              <p class="text-2xl">{{ summary.avgHoursWeek }}</p>
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
              <p class="text-2xl">{{ summary.alertsCount }}</p>
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
              <p class="text-sm">{{ recentActivity[0]?.user }} {{ recentActivity[0]?.action || recentActivity[0]?.action }}</p>
              <p class="text-xs text-muted-foreground">{{ recentActivity[0]?.details }} • {{ recentActivity[0]?.time }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <div class="h-2 w-2 bg-blue-500 rounded-full"></div>
            <div class="flex-1">
              <p class="text-sm">{{ recentActivity[1]?.user }} {{ recentActivity[1]?.action || recentActivity[1]?.action }}</p>
              <p class="text-xs text-muted-foreground">{{ recentActivity[1]?.details }} • {{ recentActivity[1]?.time }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <div class="h-2 w-2 bg-yellow-500 rounded-full"></div>
            <div class="flex-1">
              <p class="text-sm">{{ recentActivity[2]?.user }} {{ recentActivity[2]?.action || recentActivity[2]?.action }}</p>
              <p class="text-xs text-muted-foreground">{{ recentActivity[2]?.details }} • {{ recentActivity[2]?.time }}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    <EmployeeDetailsDialog :employee="selectedEmployee" :open="isDetailsOpen" @update:open="isDetailsOpen = $event" />
    <AddEditEmployeeDialog :employee="editingEmployee" :open="isAddEditOpen" @update:open="isAddEditOpen = $event" @save="handleSaveEmployee" />
    <GenerateReportDialog :open="isReportOpen" @update:open="isReportOpen = $event" reportType="hr" />
    <ExportDataDialog :open="isExportOpen" @update:open="isExportOpen = $event" dataType="admin" />
    <WorkWeekSettingsDialog :open="isWorkWeekOpen" @update:open="isWorkWeekOpen = $event" @save="(settings) => { console.log('Work week settings saved:', settings); toast.success('Work week settings updated successfully!'); }" />
  </div>
</template>
