<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import Card from "../ui/card.vue";
import { CardContent, CardHeader, CardTitle } from "../ui/card-components.vue";
import Button from "../ui/button.vue";
import { Users, Clock, AlertTriangle, CheckCircle, XCircle, TrendingUp, Download, FileText, UserPlus } from "lucide-vue-next";
import Badge from "../ui/badge.vue";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table.vue";
import { Progress } from "../ui/progress.vue";
import ManagerReports from "../reports/ManagerReports.vue";
import ApprovalDialog from "../dialogs/ApprovalDialog.vue";
import GenerateReportDialog from "../dialogs/GenerateReportDialog.vue";
import ExportDataDialog from "../dialogs/ExportDataDialog.vue";
import AddTeamMemberDialog from "../dialogs/AddTeamMemberDialog.vue";
import { toast } from 'vue-sonner';
import realTimeService from '../../services/realTimeService.js';
import { apiService } from '../../services/apiService.js';
import authManager from '../../services/authService.js';

const props = defineProps({
  currentView: String
});

const selectedEntry = ref(null);
const isApprovalOpen = ref(false);
const isReportOpen = ref(false);
const isExportOpen = ref(false);
const isAddTeamMemberOpen = ref(false);
const isLoading = ref(false);

// API-driven data
const pendingApprovals = ref([]);
const teamStats = ref([]);
const teamMembers = ref([]);
const alerts = ref([]);
const dashboardStats = ref({
  totalTeamMembers: 0,
  activeToday: 0,
  pendingApprovals: 0,
  teamProductivity: 0
});

// Load dashboard data from API
const loadDashboard = async () => {
  isLoading.value = true;
  console.log('📊 Manager Dashboard: Loading data from API...');
  
  try {
    const user = await authManager.getCurrentUser();
    console.log('📊 Current user:', user);
    
    // Load pending approvals
    console.log('📊 Fetching pending approvals...');
    const approvalsRes = await apiService.getPendingApprovals();
    console.log('📊 Approvals response:', approvalsRes);
    
    if (approvalsRes && Array.isArray(approvalsRes)) {
      pendingApprovals.value = approvalsRes.map(entry => ({
        id: entry.id,
        employee: `${entry.user?.first_name || ''} ${entry.user?.last_name || ''}`.trim() || entry.user?.username || 'Unknown',
        date: entry.date || entry.start_date || new Date().toISOString().split('T')[0],
        hours: (entry.duration_hours || entry.hours || 0).toFixed(1),
        type: entry.type || (entry.duration_hours > 8 ? 'Overtime' : 'Regular'),
        reason: entry.notes || entry.reason || '-',
        entry_id: entry.id
      }));
    }
    
    // Load team stats
    const teamRes = await apiService.getTeamMembers();
    if (teamRes && Array.isArray(teamRes)) {
      teamMembers.value = teamRes;
      teamStats.value = teamRes.map(member => ({
        name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.username,
        hoursWeek: member.hours_this_week || 0,
        status: (member.hours_this_week > 45 ? 'Overtime' : 'On Time')
      }));
    }
    
    // Get analytics data
    try {
      const analyticsRes = await apiService.getAnalyticsOverview();
      if (analyticsRes) {
        dashboardStats.value = {
          totalTeamMembers: teamMembers.value.length,
          activeToday: analyticsRes.active_today || 0,
          pendingApprovals: pendingApprovals.value.length,
          teamProductivity: analyticsRes.productivity_score || 85
        };
      }
    } catch (e) {
      console.log('Analytics not available:', e);
    }
    
    // Load alerts/notifications
    try {
      const notificationsRes = await apiService.getNotifications();
      if (notificationsRes && Array.isArray(notificationsRes)) {
        alerts.value = notificationsRes
          .filter(n => n.type === 'alert' || n.priority === 'high')
          .slice(0, 5)
          .map(n => ({
            type: n.category || 'Alert',
            message: n.message,
            severity: n.priority === 'high' ? 'error' : 'warning'
          }));
      }
    } catch (e) {
      console.log('Notifications not available:', e);
    }
    
  } catch (error) {
    console.error('Error loading manager dashboard:', error);
    toast.error('Failed to load dashboard data');
  } finally {
    isLoading.value = false;
  }
};

const handleReviewEntry = (entry) => {
  const timeEntry = {
    id: entry.entry_id || entry.id,
    employee: entry.employee,
    date: entry.date,
    clockIn: "08:00 AM",
    clockOut: "05:00 PM",
    hours: parseFloat(entry.hours),
    status: "pending",
    overtime: parseFloat(entry.hours) > 8,
    notes: entry.reason,
  };
  selectedEntry.value = timeEntry;
  isApprovalOpen.value = true;
};

const handleApprove = async (notes) => {
  if (!selectedEntry.value || !selectedEntry.value.id) {
    toast.error("Invalid entry");
    return;
  }
  
  try {
    await apiService.approveTimeEntry(selectedEntry.value.id, { notes });
    toast.success("Time entry approved successfully!");
    isApprovalOpen.value = false;
    loadDashboard(); // Reload data
  } catch (error) {
    console.error('Error approving entry:', error);
    toast.error("Failed to approve entry");
  }
};

const handleReject = async (reason) => {
  if (!selectedEntry.value || !selectedEntry.value.id) {
    toast.error("Invalid entry");
    return;
  }
  
  try {
    await apiService.rejectTimeEntry(selectedEntry.value.id, { reason });
    toast.error("Time entry rejected");
    isApprovalOpen.value = false;
    loadDashboard(); // Reload data
  } catch (error) {
    console.error('Error rejecting entry:', error);
    toast.error("Failed to reject entry");
  }
};

// Setup realtime updates
onMounted(() => {
  console.log('📡 Manager Dashboard: Setting up realtime listeners');
  
  // Load initial data
  loadDashboard();
  
  // Listen for team member status updates
  const handleTeamMemberOnline = (data) => {
    console.log('📡 Realtime: Team member online', data);
    toast.success(`${data.name} is now online`);
  };
  
  const handleTeamMemberOffline = (data) => {
    console.log('📡 Realtime: Team member offline', data);
    toast.info(`${data.name} went offline`);
  };
  
  const handleTeamStatsUpdated = (data) => {
    console.log('📡 Realtime: Team stats updated', data);
    loadDashboard(); // Reload data
  };
  
  const handleNewApprovalRequest = (data) => {
    console.log('📡 Realtime: New approval request', data);
    toast.info('New time entry requires approval');
    loadDashboard(); // Reload data
  };
  
  // Register listeners
  realTimeService.on('team_member_online', handleTeamMemberOnline);
  realTimeService.on('team_member_offline', handleTeamMemberOffline);
  realTimeService.on('team_stats_updated', handleTeamStatsUpdated);
  realTimeService.on('approval-request', handleNewApprovalRequest);
  
  onUnmounted(() => {
    // Cleanup listeners
    realTimeService.off('team_member_online', handleTeamMemberOnline);
    realTimeService.off('team_member_offline', handleTeamMemberOffline);
    realTimeService.off('team_stats_updated', handleTeamStatsUpdated);
    realTimeService.off('approval-request', handleNewApprovalRequest);
  });
});

const handleBulkApprove = () => {
  toast.success(`${pendingApprovals.length} time entries approved successfully!`);
};

const handleAddTeamMember = (employee) => {
  toast.success(`${employee.name} has been added to your team!`);
};
</script>

<template>
  <div v-if="currentView === 'team'">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2>Team Overview</h2>
          <p class="text-muted-foreground mt-1">Monitor your team's attendance and performance</p>
        </div>
        <Button class="gap-2" @click="isAddTeamMemberOpen = true">
          <UserPlus class="h-4 w-4" />
          Add Team Member
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="(member, index) in teamStats" :key="index" class="space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-sm">{{ member.name }}</p>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-muted-foreground">{{ member.hoursWeek }}h this week</span>
                  <Badge :variant="member.status === 'Overtime' ? 'secondary' : 'default'" :class="{ 'bg-green-500 hover:bg-green-600': member.status === 'On Time' }">
                    {{ member.status }}
                  </Badge>
                </div>
              </div>
              <Progress :value="(member.hoursWeek / 50) * 100" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    <AddTeamMemberDialog :open="isAddTeamMemberOpen" @update:open="isAddTeamMemberOpen = $event" @add="handleAddTeamMember" />
  </div>

  <div v-else-if="currentView === 'approvals'">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2>Pending Approvals</h2>
          <p class="text-muted-foreground mt-1">Review and approve team time entries</p>
        </div>
        <Button class="gap-2 bg-green-600 hover:bg-green-700" @click="handleBulkApprove">
          <CheckCircle class="h-4 w-4" />
          Approve All ({{ pendingApprovals.length }})
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Timesheet Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(entry, index) in pendingApprovals" :key="index">
                <TableCell>{{ entry.employee }}</TableCell>
                <TableCell>{{ entry.date }}</TableCell>
                <TableCell>{{ entry.hours }}</TableCell>
                <TableCell><Badge variant="secondary">{{ entry.type }}</Badge></TableCell>
                <TableCell>{{ entry.reason }}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" @click="handleReviewEntry(entry)">Review</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    <ApprovalDialog :entry="selectedEntry" :open="isApprovalOpen" @update:open="isApprovalOpen = $event" @approve="handleApprove" @reject="handleReject" />
  </div>

  <div v-else-if="currentView === 'alerts'">
    <div class="space-y-6">
      <div>
        <h2>Active Alerts</h2>
        <p class="text-muted-foreground mt-1">Monitor critical team notifications</p>
      </div>
      <div class="space-y-3">
        <div v-for="(alert, index) in alerts" :key="index" :class="['p-6 rounded-lg border', alert.severity === 'error' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20']">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-medium">{{ alert.type }}</p>
              <p class="text-sm text-muted-foreground mt-1">{{ alert.message }}</p>
            </div>
            <Badge :variant="alert.severity === 'error' ? 'destructive' : 'secondary'">{{ alert.severity }}</Badge>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="currentView === 'reports'">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2>Team Reports</h2>
          <p class="text-muted-foreground mt-1">Analytics and reports for your team</p>
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
      <ManagerReports />
    </div>
    <GenerateReportDialog :open="isReportOpen" @update:open="isReportOpen = $event" reportType="manager" />
    <ExportDataDialog :open="isExportOpen" @update:open="isExportOpen = $event" dataType="team" />
  </div>

  <div v-else class="space-y-6">
    <div v-if="isLoading" class="text-center py-8">
      <p class="text-muted-foreground">Loading dashboard...</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Team Members</p>
              <p class="text-2xl mt-1">{{ dashboardStats.totalTeamMembers }}</p>
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
              <p class="text-sm text-muted-foreground">Pending Approvals</p>
              <p class="text-2xl mt-1">{{ dashboardStats.pendingApprovals }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Clock class="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Active Alerts</p>
              <p class="text-2xl mt-1">{{ alerts.length }}</p>
            </div>
            <div class="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle class="h-6 w-6 text-red-600 dark:text-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Active Today</p>
              <p class="text-2xl mt-1">{{ dashboardStats.activeToday }}</p>
            </div>
            <div class="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp class="h-6 w-6 text-green-600 dark:text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <AlertTriangle class="h-5 w-5" />
          Active Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div v-for="(alert, index) in alerts" :key="index" :class="['p-4 rounded-lg border', alert.severity === 'error' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20']">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-medium">{{ alert.type }}</p>
                <p class="text-sm text-muted-foreground mt-1">{{ alert.message }}</p>
              </div>
              <Badge :variant="alert.severity === 'error' ? 'destructive' : 'secondary'">{{ alert.severity }}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(entry, index) in pendingApprovals" :key="index">
                <TableCell>{{ entry.employee }}</TableCell>
                <TableCell>{{ entry.date }}</TableCell>
                <TableCell>{{ entry.hours }}</TableCell>
                <TableCell>
                  <div class="flex gap-2">
                    <Button size="sm" variant="ghost" class="h-8 w-8 p-0">
                      <CheckCircle class="h-4 w-4 text-green-600" />
                    </Button>
                    <Button size="sm" variant="ghost" class="h-8 w-8 p-0">
                      <XCircle class="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Team Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="(member, index) in teamStats" :key="index" class="space-y-2">
              <div class="flex items-center justify-between">
                <p class="text-sm">{{ member.name }}</p>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-muted-foreground">{{ member.hoursWeek }}h</span>
                  <Badge :variant="member.status === 'Overtime' ? 'secondary' : 'default'" :class="{ 'bg-green-500 hover:bg-green-600': member.status === 'On Time' }">
                    {{ member.status }}
                  </Badge>
                </div>
              </div>
              <Progress :value="(member.hoursWeek / 50) * 100" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
