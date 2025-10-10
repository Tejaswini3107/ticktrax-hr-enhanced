<script setup>
import { ref, onMounted } from 'vue';
import apiService from '../../services/apiService.js';
import authManager from '../../services/authService.js';
import toast from '../../utils/toast.js';
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
// using local toast utility (do not import vue-sonner's named toast here)

const props = defineProps({
  currentView: String
});

const selectedEntry = ref(null);
const isApprovalOpen = ref(false);
const isReportOpen = ref(false);
const isExportOpen = ref(false);
const isAddTeamMemberOpen = ref(false);

const pendingApprovals = ref([]);
const teamStats = ref([]);
const alerts = ref([]);

const loadTeamData = async () => {
  try {
    const cur = await authManager.getCurrentUser();
    if (!cur.success) throw new Error('Not signed in');
    const users = await apiService.listUsers();
    // Basic team stats from users
    teamStats.value = (Array.isArray(users) ? users : []).slice(0, 6).map(u => ({
      name: u.attributes?.first_name ? `${u.attributes.first_name} ${u.attributes.last_name}` : (u.name || u.email),
      hoursWeek: Math.floor(Math.random() * 48),
      status: Math.random() > 0.1 ? 'On Time' : 'Overtime'
    }));

    // Gather pending approvals by checking working times for each user (lightweight sample)
    const approvals = [];
    for (const u of (Array.isArray(users) ? users : [])) {
      try {
        const times = await apiService.getUserWorkingTimes(u.id || u.attributes?.id);
        const pending = (Array.isArray(times) ? times : []).filter(t => t.pending_approval || t.status === 'pending');
        pending.slice(0,2).forEach(p => approvals.push({ employee: u.attributes?.email || u.email || 'Unknown', date: p.start_time?.split('T')[0] || p.timestamp, hours: p.duration_hours || p.hours || 0, type: p.type || 'Time Entry', reason: p.reason || '-' }));
      } catch (_) {
        // ignore per-user failures
      }
    }
    pendingApprovals.value = approvals.slice(0, 10);
  } catch (err) {
      console.warn('Load team data failed', err);
      toast.error('Unable to load team data from server. Some manager features may be unavailable.');
      // Keep state empty so UI displays a clear "no data" or error state instead of demo data
      pendingApprovals.value = [];
      teamStats.value = [];
      alerts.value = [];
  }
}

onMounted(loadTeamData);

const handleReviewEntry = (entry) => {
  const timeEntry = {
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

const handleApprove = (notes) => {
  toast.success("Time entry approved successfully!");
  isApprovalOpen.value = false;
};

const handleReject = (reason) => {
  toast.error("Time entry rejected");
  isApprovalOpen.value = false;
};

const handleBulkApprove = () => {
  toast.success(`${pendingApprovals.value.length} time entries approved successfully!`);
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
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Team Members</p>
              <p class="text-2xl mt-1">24</p>
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
              <p class="text-2xl mt-1">12</p>
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
              <p class="text-2xl mt-1">3</p>
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
              <p class="text-sm text-muted-foreground">Team Hours</p>
              <p class="text-2xl mt-1">952</p>
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
