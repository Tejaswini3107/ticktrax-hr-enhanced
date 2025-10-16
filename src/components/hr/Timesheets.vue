<script setup>
import { ref, onMounted, computed } from 'vue';
import { Card } from '../ui/card.vue';
import { CardContent, CardHeader, CardTitle } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import Badge from '../ui/badge.vue';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.vue';
import { Input } from '../ui/input.vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.vue';
import { 
  FileText, 
  Search, 
  Filter,
  Download,
  Upload,
  Check,
  X,
  Clock,
  Calendar,
  Eye
} from 'lucide-vue-next';
import apiService from '../../services/apiService.js';

const timesheets = ref([]);
const loading = ref(false);
const searchTerm = ref('');
const statusFilter = ref('all');
const dateRange = ref('thisWeek');

// Mock data for demonstration
const mockTimesheets = [
  {
    id: 1,
    employeeName: "John Smith",
    department: "Production",
    weekEnding: "2024-10-13",
    totalHours: 42.5,
    overtimeHours: 2.5,
    status: "Submitted",
    submittedAt: "2024-10-14 09:30:00",
    approvedBy: "Sarah Johnson",
    approvedAt: "2024-10-14 14:15:00"
  },
  {
    id: 2,
    employeeName: "Sarah Johnson",
    department: "Warehouse",
    weekEnding: "2024-10-13",
    totalHours: 40.0,
    overtimeHours: 0,
    status: "Approved",
    submittedAt: "2024-10-14 08:45:00",
    approvedBy: "Mike Davis",
    approvedAt: "2024-10-14 10:30:00"
  },
  {
    id: 3,
    employeeName: "Mike Davis",
    department: "Operations",
    weekEnding: "2024-10-13",
    totalHours: 45.0,
    overtimeHours: 5.0,
    status: "Pending Review",
    submittedAt: "2024-10-14 17:00:00",
    approvedBy: null,
    approvedAt: null
  },
  {
    id: 4,
    employeeName: "Emily Brown",
    department: "Administration",
    weekEnding: "2024-10-13",
    totalHours: 38.5,
    overtimeHours: 0,
    status: "Draft",
    submittedAt: null,
    approvedBy: null,
    approvedAt: null
  },
  {
    id: 5,
    employeeName: "David Wilson",
    department: "Quality Control",
    weekEnding: "2024-10-13",
    totalHours: 0,
    overtimeHours: 0,
    status: "Not Submitted",
    submittedAt: null,
    approvedBy: null,
    approvedAt: null
  }
];

const loadTimesheets = async () => {
  loading.value = true;
  try {
    // Load timesheets from API
    const response = await apiService.getTimesheetReport({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    
    if (response && response.data) {
      // Transform API data to match our structure
      timesheets.value = response.data.map(entry => ({
        id: entry.id,
        employeeName: `${entry.first_name || ''} ${entry.last_name || ''}`.trim() || entry.username,
        department: entry.department || 'Unknown',
        weekEnding: entry.week_ending,
        totalHours: entry.total_hours || 0,
        overtimeHours: entry.overtime_hours || 0,
        status: entry.status || 'Draft',
        submittedAt: entry.submitted_at,
        approvedBy: entry.approved_by,
        approvedAt: entry.approved_at
      }));
    } else {
      timesheets.value = [];
    }
  } catch (error) {
    console.warn('Failed to load timesheets from API:', error);
    timesheets.value = [];
  } finally {
    loading.value = false;
  }
};

const filteredTimesheets = computed(() => {
  return timesheets.value.filter(timesheet => {
    const matchesSearch = timesheet.employeeName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                         timesheet.department.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesStatus = statusFilter.value === 'all' || timesheet.status.toLowerCase().replace(' ', '') === statusFilter.value.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });
});

const getStatusBadgeClass = (status) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-500 hover:bg-green-600';
    case 'submitted':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'pending review':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'draft':
      return 'bg-gray-500 hover:bg-gray-600';
    case 'not submitted':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
};

const handleApprove = (timesheet) => {
  console.log('Approve timesheet:', timesheet);
};

const handleReject = (timesheet) => {
  console.log('Reject timesheet:', timesheet);
};

const handleView = (timesheet) => {
  console.log('View timesheet:', timesheet);
};

const exportTimesheets = () => {
  console.log('Export timesheets');
};

const importTimesheets = () => {
  console.log('Import timesheets');
};

onMounted(() => {
  loadTimesheets();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-bold">Timesheet Management</h2>
      <p class="text-muted-foreground mt-1">
        Review, approve, and manage employee timesheets
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
            placeholder="Search timesheets..."
            class="pl-10 w-64"
          />
        </div>

        <!-- Status Filter -->
        <Select v-model="statusFilter">
          <SelectTrigger class="w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="pendingreview">Pending Review</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="notsubmitted">Not Submitted</SelectItem>
          </SelectContent>
        </Select>

        <!-- Date Range -->
        <Select v-model="dateRange">
          <SelectTrigger class="w-48">
            <SelectValue placeholder="Select Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="thisWeek">This Week</SelectItem>
            <SelectItem value="lastWeek">Last Week</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline" @click="importTimesheets">
          <Upload class="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button variant="outline" @click="exportTimesheets">
          <Download class="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>

    <!-- Timesheet Table -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2">
            <FileText class="h-5 w-5" />
            Recent Timesheets
          </CardTitle>
          <div class="text-sm text-muted-foreground">
            Week ending {{ new Date().toISOString().split('T')[0] }}
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
                <TableHead>Week Ending</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Overtime</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="timesheet in filteredTimesheets" :key="timesheet.id">
                <TableCell>
                  <div class="font-medium">{{ timesheet.employeeName }}</div>
                </TableCell>
                <TableCell>{{ timesheet.department }}</TableCell>
                <TableCell>{{ timesheet.weekEnding }}</TableCell>
                <TableCell>
                  <div class="font-medium">{{ timesheet.totalHours }}h</div>
                </TableCell>
                <TableCell>
                  <div class="font-medium">{{ timesheet.overtimeHours }}h</div>
                </TableCell>
                <TableCell>
                  <Badge :class="getStatusBadgeClass(timesheet.status)">
                    {{ timesheet.status }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div v-if="timesheet.submittedAt" class="text-sm">
                    {{ timesheet.submittedAt }}
                  </div>
                  <div v-else class="text-sm text-muted-foreground">
                    Not submitted
                  </div>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Button size="sm" variant="outline" @click="handleView(timesheet)">
                      <Eye class="h-3 w-3" />
                    </Button>
                    <Button 
                      v-if="timesheet.status === 'Submitted' || timesheet.status === 'Pending Review'"
                      size="sm" 
                      variant="outline" 
                      @click="handleApprove(timesheet)"
                    >
                      <Check class="h-3 w-3" />
                    </Button>
                    <Button 
                      v-if="timesheet.status === 'Submitted' || timesheet.status === 'Pending Review'"
                      size="sm" 
                      variant="outline" 
                      @click="handleReject(timesheet)"
                    >
                      <X class="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredTimesheets.length === 0" class="text-center py-12">
          <FileText class="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p class="text-muted-foreground">No timesheets found matching your criteria</p>
        </div>
      </CardContent>
    </Card>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total Timesheets</p>
              <p class="text-2xl font-semibold">{{ timesheets.length }}</p>
            </div>
            <FileText class="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Approved</p>
              <p class="text-2xl font-semibold">{{ timesheets.filter(t => t.status === 'Approved').length }}</p>
            </div>
            <Badge class="bg-green-500 hover:bg-green-600">Approved</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Pending Review</p>
              <p class="text-2xl font-semibold">{{ timesheets.filter(t => t.status === 'Pending Review').length }}</p>
            </div>
            <Badge class="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Not Submitted</p>
              <p class="text-2xl font-semibold">{{ timesheets.filter(t => t.status === 'Not Submitted').length }}</p>
            </div>
            <Badge class="bg-red-500 hover:bg-red-600">Missing</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>
