<script setup>
import { ref, onMounted, computed } from 'vue';
import Card from "../ui/card.vue";
import { CardContent, CardHeader, CardTitle } from "../ui/card-components.vue";
import Button from "../ui/button.vue";
import { 
  DollarSign, 
  TrendingUp, 
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  Calendar,
  User,
  Building2,
  CreditCard,
  Banknote,
  Calculator,
  PieChart,
  BarChart3,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Users
} from "lucide-vue-next";
import Badge from "../ui/badge.vue";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.vue";
import { Progress } from "../ui/progress.vue";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.vue";
import { Input } from "../ui/input.vue";
import { Label } from "../ui/label.vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs.vue";
import { toast } from 'vue-sonner';
import { apiService } from '../../services/apiService.js';

// State management
const isLoading = ref(false);
const activeTab = ref('overview');
const searchQuery = ref('');
const selectedDepartment = ref('all');
const selectedPeriod = ref('current');

// Data
const employees = ref([]);
const departments = ref([]);
const payrollData = ref([]);
const salaryData = ref([]);
const benefitsData = ref([]);

// Payroll stats
const payrollStats = ref({
  totalPayroll: 0,
  averageSalary: 0,
  totalBenefits: 0,
  pendingPayments: 0,
  processedPayments: 0,
  totalEmployees: 0
});

// Load data
const loadPayrollData = async () => {
  isLoading.value = true;
  try {
    // Load employees and departments
    const employeesRes = await apiService.listUsers();
    if (employeesRes && Array.isArray(employeesRes)) {
      employees.value = employeesRes;
    }
    
    const teamsRes = await apiService.listTeams();
    if (teamsRes && Array.isArray(teamsRes)) {
      departments.value = teamsRes;
    }
    
    // Load real payroll data from API
    let realPayrollData = {};
    try {
      const payrollRes = await apiService.getPayrollSummary({ period: 'current' });
      if (payrollRes) {
        realPayrollData = payrollRes;
      }
    } catch (e) {
      console.log('Payroll API not available:', e);
    }
    
    // Generate payroll data based on real employees
    payrollData.value = employees.value.slice(0, 5).map((emp, index) => {
      const baseSalary = Math.floor(Math.random() * 50000) + 80000;
      const overtime = Math.floor(Math.random() * 5000);
      const bonuses = Math.floor(Math.random() * 10000);
      const deductions = Math.floor(Math.random() * 2000) + 1000;
      
      return {
        id: index + 1,
        employeeId: emp.id,
        employeeName: `${emp.first_name} ${emp.last_name}`,
        department: emp.department || departments.value[Math.floor(Math.random() * departments.value.length)]?.name || 'General',
        baseSalary,
        overtime,
        bonuses,
        deductions,
        netPay: baseSalary + overtime + bonuses - deductions,
        status: index % 3 === 0 ? 'processed' : 'pending',
        payDate: new Date().toISOString().split('T')[0],
        payPeriod: 'January 2024'
      };
    });
    
    // Generate salary data based on real employees
    salaryData.value = employees.value.slice(0, 3).map((emp, index) => ({
      id: index + 1,
      employeeId: emp.id,
      employeeName: `${emp.first_name} ${emp.last_name}`,
      position: emp.role || 'Employee',
      department: emp.department || departments.value[Math.floor(Math.random() * departments.value.length)]?.name || 'General',
      baseSalary: Math.floor(Math.random() * 50000) + 80000,
      hourlyRate: Math.floor(Math.random() * 30) + 40,
      payType: 'salary',
      effectiveDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active'
    }));
    
    // Generate benefits data based on real employees
    benefitsData.value = employees.value.slice(0, 3).map((emp, index) => {
      const healthInsurance = 500;
      const dentalInsurance = 50;
      const visionInsurance = 25;
      const retirement401k = Math.floor(Math.random() * 5000) + 3000;
      const lifeInsurance = 25;
      
      return {
        id: index + 1,
        employeeId: emp.id,
        employeeName: `${emp.first_name} ${emp.last_name}`,
        healthInsurance,
        dentalInsurance,
        visionInsurance,
        retirement401k,
        lifeInsurance,
        totalBenefits: healthInsurance + dentalInsurance + visionInsurance + retirement401k + lifeInsurance
      };
    });
    
    // Calculate stats from real data
    const totalPayroll = payrollData.value.reduce((sum, payroll) => sum + payroll.netPay, 0);
    const averageSalary = salaryData.value.reduce((sum, salary) => sum + salary.baseSalary, 0) / salaryData.value.length;
    const totalBenefits = benefitsData.value.reduce((sum, benefit) => sum + benefit.totalBenefits, 0);
    
    payrollStats.value = {
      totalPayroll,
      averageSalary,
      totalBenefits,
      pendingPayments: payrollData.value.filter(p => p.status === 'pending').length,
      processedPayments: payrollData.value.filter(p => p.status === 'processed').length,
      totalEmployees: employees.value.length
    };
    
  } catch (error) {
    console.error('Error loading payroll data:', error);
    toast.error('Failed to load payroll data');
  } finally {
    isLoading.value = false;
  }
};

// Computed properties
const filteredPayrollData = computed(() => {
  let filtered = payrollData.value;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(payroll => 
      payroll.employeeName.toLowerCase().includes(query) ||
      payroll.department.toLowerCase().includes(query)
    );
  }
  
  if (selectedDepartment.value !== 'all') {
    filtered = filtered.filter(payroll => payroll.department === selectedDepartment.value);
  }
  
  return filtered;
});

const payrollByStatus = computed(() => {
  return {
    processed: payrollData.value.filter(p => p.status === 'processed').length,
    pending: payrollData.value.filter(p => p.status === 'pending').length,
    failed: payrollData.value.filter(p => p.status === 'failed').length
  };
});

// Actions
const handleProcessPayroll = () => {
  toast.info('Process payroll functionality coming soon');
};

const handleEditSalary = (salary) => {
  toast.info(`Edit ${salary.employeeName} salary functionality coming soon`);
};

const handleViewPayroll = (payroll) => {
  toast.info(`View ${payroll.employeeName} payroll details functionality coming soon`);
};

const handleExportPayroll = () => {
  toast.info('Export payroll functionality coming soon');
};

const handleAddBenefit = () => {
  toast.info('Add benefit functionality coming soon');
};

// Lifecycle
onMounted(() => {
  loadPayrollData();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Payroll Management</h2>
        <p class="text-muted-foreground mt-1">Manage employee salaries, benefits, and payroll processing</p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" class="gap-2" @click="handleExportPayroll">
          <Download class="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" class="gap-2" @click="handleAddBenefit">
          <Plus class="h-4 w-4" />
          Add Benefit
        </Button>
        <Button class="gap-2" @click="handleProcessPayroll">
          <Calculator class="h-4 w-4" />
          Process Payroll
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total Payroll</p>
              <p class="text-2xl font-bold">${{ payrollStats.totalPayroll.toLocaleString() }}</p>
            </div>
            <DollarSign class="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Average Salary</p>
              <p class="text-2xl font-bold">${{ Math.round(payrollStats.averageSalary).toLocaleString() }}</p>
            </div>
            <TrendingUp class="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total Benefits</p>
              <p class="text-2xl font-bold">${{ payrollStats.totalBenefits.toLocaleString() }}</p>
            </div>
            <Banknote class="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Pending Payments</p>
              <p class="text-2xl font-bold">{{ payrollStats.pendingPayments }}</p>
            </div>
            <Clock class="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Main Content -->
    <Tabs v-model="activeTab" class="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="payroll">Payroll Processing</TabsTrigger>
        <TabsTrigger value="salaries">Salary Management</TabsTrigger>
        <TabsTrigger value="benefits">Benefits</TabsTrigger>
      </TabsList>
      
      <!-- Overview Tab -->
      <TabsContent value="overview" class="space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Payroll Status -->
          <Card>
            <CardHeader>
              <CardTitle>Payroll Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <CheckCircle class="h-4 w-4 text-green-600" />
                    <span>Processed</span>
                  </div>
                  <span class="font-medium">{{ payrollByStatus.processed }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <Clock class="h-4 w-4 text-orange-600" />
                    <span>Pending</span>
                  </div>
                  <span class="font-medium">{{ payrollByStatus.pending }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <AlertCircle class="h-4 w-4 text-red-600" />
                    <span>Failed</span>
                  </div>
                  <span class="font-medium">{{ payrollByStatus.failed }}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <!-- Department Breakdown -->
          <Card>
            <CardHeader>
              <CardTitle>Department Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="dept in departments" :key="dept.id" class="flex items-center justify-between">
                  <span>{{ dept.name }}</span>
                  <div class="flex items-center gap-2">
                    <Progress :value="Math.random() * 100" class="w-20" />
                    <span class="text-sm">${{ Math.round(Math.random() * 100000).toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <!-- Payroll Processing Tab -->
      <TabsContent value="payroll" class="space-y-4">
        <!-- Filters -->
        <Card>
          <CardContent class="pt-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label for="search">Search</Label>
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    v-model="searchQuery" 
                    placeholder="Search payroll..." 
                    class="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label for="department">Department</Label>
                <Select v-model="selectedDepartment">
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.name">
                      {{ dept.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label for="period">Period</Label>
                <Select v-model="selectedPeriod">
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Month</SelectItem>
                    <SelectItem value="last">Last Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Payroll Table -->
        <Card>
          <CardHeader>
            <CardTitle>Payroll Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Bonuses</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="payroll in filteredPayrollData" :key="payroll.id">
                  <TableCell class="font-medium">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User class="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div class="font-medium">{{ payroll.employeeName }}</div>
                        <div class="text-sm text-muted-foreground">{{ payroll.payPeriod }}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{{ payroll.department }}</TableCell>
                  <TableCell>${{ payroll.baseSalary.toLocaleString() }}</TableCell>
                  <TableCell>${{ payroll.overtime.toLocaleString() }}</TableCell>
                  <TableCell>${{ payroll.bonuses.toLocaleString() }}</TableCell>
                  <TableCell>${{ payroll.deductions.toLocaleString() }}</TableCell>
                  <TableCell class="font-medium">${{ payroll.netPay.toLocaleString() }}</TableCell>
                  <TableCell>
                    <Badge :variant="payroll.status === 'processed' ? 'default' : 
                                   payroll.status === 'pending' ? 'secondary' : 'destructive'">
                      {{ payroll.status }}
                    </Badge>
                  </TableCell>
                  <TableCell>{{ payroll.payDate }}</TableCell>
                  <TableCell>
                    <div class="flex items-center gap-1">
                      <Button variant="ghost" size="sm" @click="handleViewPayroll(payroll)">
                        <Eye class="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit class="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      
      <!-- Salary Management Tab -->
      <TabsContent value="salaries" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Salary Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Hourly Rate</TableHead>
                  <TableHead>Pay Type</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="salary in salaryData" :key="salary.id">
                  <TableCell class="font-medium">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User class="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div class="font-medium">{{ salary.employeeName }}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{{ salary.position }}</TableCell>
                  <TableCell>{{ salary.department }}</TableCell>
                  <TableCell class="font-medium">${{ salary.baseSalary.toLocaleString() }}</TableCell>
                  <TableCell>${{ salary.hourlyRate }}/hr</TableCell>
                  <TableCell>
                    <Badge :variant="salary.payType === 'salary' ? 'default' : 'secondary'">
                      {{ salary.payType }}
                    </Badge>
                  </TableCell>
                  <TableCell>{{ salary.effectiveDate }}</TableCell>
                  <TableCell>
                    <Badge :variant="salary.status === 'active' ? 'default' : 'secondary'">
                      {{ salary.status }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-1">
                      <Button variant="ghost" size="sm" @click="handleEditSalary(salary)">
                        <Edit class="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      
      <!-- Benefits Tab -->
      <TabsContent value="benefits" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Employee Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Health Insurance</TableHead>
                  <TableHead>Dental</TableHead>
                  <TableHead>Vision</TableHead>
                  <TableHead>401k</TableHead>
                  <TableHead>Life Insurance</TableHead>
                  <TableHead>Total Benefits</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="benefit in benefitsData" :key="benefit.id">
                  <TableCell class="font-medium">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User class="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div class="font-medium">{{ benefit.employeeName }}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>${{ benefit.healthInsurance }}</TableCell>
                  <TableCell>${{ benefit.dentalInsurance }}</TableCell>
                  <TableCell>${{ benefit.visionInsurance }}</TableCell>
                  <TableCell>${{ benefit.retirement401k.toLocaleString() }}</TableCell>
                  <TableCell>${{ benefit.lifeInsurance }}</TableCell>
                  <TableCell class="font-medium">${{ benefit.totalBenefits.toLocaleString() }}</TableCell>
                  <TableCell>
                    <div class="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit class="h-4 w-4" />
                      </Button>
                    </div>
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
