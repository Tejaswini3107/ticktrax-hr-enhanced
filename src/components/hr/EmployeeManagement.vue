<script setup>
import { ref, onMounted, computed } from 'vue';
import { Card } from '../ui/card.vue';
import { CardContent, CardHeader, CardTitle } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import Badge from '../ui/badge.vue';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.vue';
import { Input } from '../ui/input.vue';
import { Label } from '../ui/label.vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.vue';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  MoreHorizontal,
  Download,
  Upload
} from 'lucide-vue-next';
import apiService from '../../services/apiService.js';

const employees = ref([]);
const loading = ref(false);
const searchTerm = ref('');
const departmentFilter = ref('all');
const statusFilter = ref('all');

// Mock data for demonstration
const mockEmployees = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@company.com",
    department: "Production",
    position: "Production Worker",
    status: "Active",
    hoursThisWeek: 42.5,
    hoursThisMonth: 168.5,
    lastClockIn: "2024-10-16 08:30:00",
    phone: "+1 (555) 123-4567"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    department: "Warehouse",
    position: "Warehouse Associate",
    status: "Active",
    hoursThisWeek: 40.0,
    hoursThisMonth: 160.0,
    lastClockIn: "2024-10-16 09:00:00",
    phone: "+1 (555) 234-5678"
  },
  {
    id: 3,
    name: "Mike Davis",
    email: "mike.davis@company.com",
    department: "Operations",
    position: "Operations Manager",
    status: "Active",
    hoursThisWeek: 45.0,
    hoursThisMonth: 180.0,
    lastClockIn: "2024-10-16 07:45:00",
    phone: "+1 (555) 345-6789"
  },
  {
    id: 4,
    name: "Emily Brown",
    email: "emily.brown@company.com",
    department: "Administration",
    position: "HR Assistant",
    status: "Active",
    hoursThisWeek: 38.5,
    hoursThisMonth: 154.0,
    lastClockIn: "2024-10-16 08:15:00",
    phone: "+1 (555) 456-7890"
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david.wilson@company.com",
    department: "Quality Control",
    position: "QC Inspector",
    status: "On Leave",
    hoursThisWeek: 0,
    hoursThisMonth: 80.0,
    lastClockIn: "2024-10-10 17:30:00",
    phone: "+1 (555) 567-8901"
  }
];

const departments = [
  "Production",
  "Warehouse", 
  "Operations",
  "Administration",
  "Quality Control",
  "Maintenance"
];

const loadEmployees = async () => {
  loading.value = true;
  try {
    // Load users from API
    const users = await apiService.listUsers();
    
    if (users && users.data) {
      // Transform API data to match our structure
      employees.value = users.data.map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || user.email,
        email: user.email,
        department: user.department || 'Unknown',
        position: user.position || 'Employee',
        status: user.status || 'Active',
        hoursThisWeek: user.hours_this_week || 0,
        hoursThisMonth: user.hours_this_month || 0,
        lastClockIn: user.last_clock_in || 'Never',
        phone: user.phone || 'Not provided'
      }));
    } else {
      employees.value = [];
    }
  } catch (error) {
    console.warn('Failed to load employees from API:', error);
    employees.value = [];
  } finally {
    loading.value = false;
  }
};

const filteredEmployees = computed(() => {
  return employees.value.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesDepartment = departmentFilter.value === 'all' || employee.department === departmentFilter.value;
    const matchesStatus = statusFilter.value === 'all' || employee.status.toLowerCase() === statusFilter.value.toLowerCase();
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });
});

const handleAddEmployee = () => {
  // This would open the add employee dialog
  console.log('Add employee clicked');
};

const handleViewEmployee = (employee) => {
  console.log('View employee:', employee);
};

const handleEditEmployee = (employee) => {
  console.log('Edit employee:', employee);
};

const exportEmployees = () => {
  console.log('Export employees');
};

const importEmployees = () => {
  console.log('Import employees');
};

onMounted(() => {
  loadEmployees();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-bold">Employee Management</h2>
      <p class="text-muted-foreground mt-1">
        Manage employee records, time tracking, and department assignments
      </p>
    </div>

    <!-- Actions Bar -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <!-- Search -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            v-model="searchTerm"
            placeholder="Search employees..."
            class="pl-10 w-64"
          />
        </div>

        <!-- Filters -->
        <Select v-model="departmentFilter">
          <SelectTrigger class="w-48">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem v-for="dept in departments" :key="dept" :value="dept">
              {{ dept }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="statusFilter">
          <SelectTrigger class="w-32">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on leave">On Leave</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline" @click="importEmployees">
          <Upload class="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button variant="outline" @click="exportEmployees">
          <Download class="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button @click="handleAddEmployee">
          <Plus class="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>
    </div>

    <!-- Employee Table -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2">
            <Users class="h-5 w-5" />
            Employee Directory
          </CardTitle>
          <div class="text-sm text-muted-foreground">
            {{ filteredEmployees.length }} employees
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hours This Week</TableHead>
                <TableHead>Last Clock In</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="employee in filteredEmployees" :key="employee.id">
                <TableCell>
                  <div>
                    <div class="font-medium">{{ employee.name }}</div>
                    <div class="text-sm text-muted-foreground">{{ employee.email }}</div>
                    <div class="text-sm text-muted-foreground">{{ employee.phone }}</div>
                  </div>
                </TableCell>
                <TableCell>{{ employee.department }}</TableCell>
                <TableCell>{{ employee.position }}</TableCell>
                <TableCell>
                  <Badge 
                    :class="{
                      'bg-green-500 hover:bg-green-600': employee.status === 'Active',
                      'bg-yellow-500 hover:bg-yellow-600': employee.status === 'On Leave',
                      'bg-gray-500 hover:bg-gray-600': employee.status === 'Inactive'
                    }"
                  >
                    {{ employee.status }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="font-medium">{{ employee.hoursThisWeek }}h</div>
                  <div class="text-sm text-muted-foreground">{{ employee.hoursThisMonth }}h this month</div>
                </TableCell>
                <TableCell>
                  <div class="text-sm">{{ employee.lastClockIn }}</div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Button size="sm" variant="outline" @click="handleViewEmployee(employee)">
                      <Eye class="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" @click="handleEditEmployee(employee)">
                      <Edit class="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal class="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredEmployees.length === 0" class="text-center py-12">
          <Users class="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p class="text-muted-foreground">No employees found matching your criteria</p>
        </div>
      </CardContent>
    </Card>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total Employees</p>
              <p class="text-2xl font-semibold">{{ employees.length }}</p>
            </div>
            <Users class="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Active Employees</p>
              <p class="text-2xl font-semibold">{{ employees.filter(e => e.status === 'Active').length }}</p>
            </div>
            <Badge class="bg-green-500 hover:bg-green-600">Active</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">On Leave</p>
              <p class="text-2xl font-semibold">{{ employees.filter(e => e.status === 'On Leave').length }}</p>
            </div>
            <Badge class="bg-yellow-500 hover:bg-yellow-600">Leave</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Departments</p>
              <p class="text-2xl font-semibold">{{ departments.length }}</p>
            </div>
            <Filter class="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>