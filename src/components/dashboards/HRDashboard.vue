<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Card } from '../ui/card.vue';
import { CardContent, CardHeader, CardTitle } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import Badge from '../ui/badge.vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.vue';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.vue';
import HRReports from '../hr/HRReports.vue';
import EmployeeManagement from '../hr/EmployeeManagement.vue';
import Timesheets from '../hr/Timesheets.vue';
import Policies from '../hr/Policies.vue';
import HelpCenter from '../hr/HelpCenter.vue';
import { 
  Users, 
  FileText, 
  Settings, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Download, 
  Edit,
  Calendar,
  AlertCircle
} from 'lucide-vue-next';
import apiService from '../../services/apiService.js';

const props = defineProps({
  currentView: String,
  currentRole: String
});

const emit = defineEmits(['update:currentView']);

// Check if we're in development mode
const isDev = computed(() => import.meta.env.DEV);

// Watch for currentView changes for debugging
watch(() => props.currentView, (newView, oldView) => {
  console.log('🔄 HRDashboard: currentView changed from', oldView, 'to', newView);
}, { immediate: true });

// HR-specific navigation handling
const handleViewChange = (view) => {
  console.log('🔄 HRDashboard: handleViewChange called with:', view);
  emit('update:currentView', view);
};

// Dialog states
const isPolicyOpen = ref(false);
const isReportOpen = ref(false);
const isExportOpen = ref(false);
const isAddEmployeeOpen = ref(false);
const selectedPolicy = ref(null);

// Real-time dashboard data
const dashboardStats = ref({
  totalEmployees: 0,
  complianceIssues: 0,
  payrollReady: 0,
  totalHours: 0
});

const complianceIssues = ref([]);
const departmentStats = ref([]);
const loading = ref(false);

// Load real-time dashboard data
const loadDashboardData = async () => {
  loading.value = true;
  try {
    // Load dashboard analytics
    const analytics = await apiService.getDashboardAnalytics();
    if (analytics && analytics.data) {
      dashboardStats.value = {
        totalEmployees: analytics.data.total_employees || 0,
        complianceIssues: analytics.data.compliance_issues || 0,
        payrollReady: analytics.data.payroll_ready || 0,
        totalHours: analytics.data.total_hours || 0
      };
    }

    // Load compliance issues
    const compliance = await apiService.getComplianceIssues();
    if (compliance && compliance.data) {
      complianceIssues.value = compliance.data.map(issue => ({
        employee: issue.employee_name || 'Unknown',
        issue: issue.issue_type || 'Unknown Issue',
        department: issue.department || 'Unknown',
        severity: issue.severity || 'medium'
      }));
    }

    // Load department statistics
    const teams = await apiService.getTeams();
    if (teams && teams.data) {
      departmentStats.value = teams.data.map(team => ({
        dept: team.name || 'Unknown Department',
        employees: team.member_count || 0,
        avgHours: team.average_hours || 0,
        overtime: team.overtime_percentage || 0
      }));
    }
  } catch (error) {
    console.warn('Failed to load dashboard data:', error);
    // Keep default values if API fails
  } finally {
    loading.value = false;
  }
};

// Handler functions
const handleEditPolicy = (policy) => {
  selectedPolicy.value = policy;
  isPolicyOpen.value = true;
};

const handleAddEmployee = () => {
  isAddEmployeeOpen.value = true;
};

const handleSaveEmployee = (employeeData) => {
  console.log('Employee saved:', employeeData);
  isAddEmployeeOpen.value = false;
};

// Load data on component mount
onMounted(() => {
  loadDashboardData();
});

// Mock data (fallback only)
const mockComplianceIssues = [
  {
    employee: "John Smith",
    issue: "Missing break logs",
    department: "Warehouse",
    severity: "medium",
  },
  {
    employee: "Sarah Johnson",
    issue: "Overtime limit exceeded",
    department: "Production",
    severity: "high",
  },
  {
    employee: "Mike Davis",
    issue: "Consecutive night shifts",
    department: "Operations",
    severity: "high",
  },
];

const policySettings = [
  { name: "Standard Work Hours", value: "40 hours/week" },
  { name: "Overtime Rate", value: "1.5x base rate" },
  { name: "Night Shift Differential", value: "+20%" },
  { name: "Break Duration", value: "30 min per 8 hours" },
  { name: "Max Consecutive Nights", value: "5 shifts" },
];

// Department stats are loaded from API

const employees = [
  { name: "John Smith", department: "Warehouse", hours: 42.5, status: "Active" },
  { name: "Sarah Johnson", department: "Production", hours: 45.0, status: "Active" },
  { name: "Mike Davis", department: "Operations", hours: 38.5, status: "Active" },
  { name: "Emily Brown", department: "Administration", hours: 40.0, status: "Active" },
];
</script>

<template>
  <div class="hr-dashboard">
    <!-- Debug Info -->
    <div v-if="isDev" class="fixed top-4 right-4 bg-black text-white p-2 rounded text-xs z-50">
      Current View: {{ currentView }}
    </div>
    
    <!-- Employee Management View -->
    <div v-if="currentView === 'employees'">
      <EmployeeManagement />
    </div>

    <!-- Timesheets View -->
    <div v-else-if="currentView === 'timesheets'">
      <Timesheets />
    </div>

    <!-- Policies View -->
    <div v-else-if="currentView === 'policies'">
      <Policies />
    </div>

    <!-- Reports View -->
    <div v-else-if="currentView === 'reports'" class="p-6">
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold">HR Reports</h2>
            <p class="text-muted-foreground mt-1">
              Comprehensive reports and analytics
            </p>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" class="gap-2" @click="isExportOpen = true">
              <Download class="h-4 w-4" />
              Export
            </Button>
            <Button class="gap-2" @click="isReportOpen = true">
              <FileText class="h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>
        
        <!-- HR Reports Component -->
        <HRReports />
      </div>
    </div>

    <!-- Help Center View -->
    <div v-else-if="currentView === 'help'">
      <HelpCenter />
    </div>

    <!-- Default HR Dashboard View -->
    <div v-else class="p-6 space-y-6">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Total Employees</p>
                <p class="text-2xl mt-1">{{ dashboardStats.totalEmployees || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users class="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Compliance Issues</p>
                <p class="text-2xl mt-1">{{ dashboardStats.complianceIssues || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <FileText class="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Payroll Ready</p>
                <p class="text-2xl mt-1">{{ dashboardStats.payrollReady || 0 }}%</p>
              </div>
              <div class="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <DollarSign class="h-6 w-6 text-green-600 dark:text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Total Hours</p>
                <p class="text-2xl mt-1">{{ dashboardStats.totalHours || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Clock class="h-6 w-6 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Tabs Section -->
      <Tabs default-value="compliance" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" class="space-y-4">
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle>Compliance Issues</CardTitle>
                <Button>Generate Report</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="(issue, index) in complianceIssues" :key="index">
                    <TableCell>{{ issue.employee }}</TableCell>
                    <TableCell>{{ issue.issue }}</TableCell>
                    <TableCell>{{ issue.department }}</TableCell>
                    <TableCell>
                      <Badge
                        :variant="issue.severity === 'high' ? 'destructive' : 'secondary'"
                      >
                        {{ issue.severity }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Review</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" class="space-y-4">
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle class="flex items-center gap-2">
                  <Settings class="h-5 w-5" />
                  Policy Configuration
                </CardTitle>
                <Button>Edit Policies</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div
                  v-for="(policy, index) in policySettings"
                  :key="index"
                  class="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
                >
                  <div>
                    <p class="font-medium">{{ policy.name }}</p>
                    <p class="text-sm text-muted-foreground mt-1">
                      Current setting
                    </p>
                  </div>
                  <div class="text-right">
                    <p>{{ policy.value }}</p>
                    <Button variant="ghost" size="sm" class="mt-1 h-6 px-2">
                      Modify
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" class="space-y-4">
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle>Department Statistics</CardTitle>
                <Button variant="outline">Export Data</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Avg Hours/Week</TableHead>
                    <TableHead>Overtime %</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="(dept, index) in departmentStats" :key="index">
                    <TableCell>{{ dept.dept }}</TableCell>
                    <TableCell>{{ dept.employees }}</TableCell>
                    <TableCell>{{ dept.avgHours }}</TableCell>
                    <TableCell>
                      <Badge
                        :variant="dept.overtime > 10 ? 'secondary' : 'default'"
                        :class="dept.overtime <= 10 ? 'bg-green-500 hover:bg-green-600' : undefined"
                      >
                        {{ dept.overtime }}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">Details</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>
</template>

<style scoped>
.hr-dashboard {
  @apply min-h-screen bg-background;
}
</style>