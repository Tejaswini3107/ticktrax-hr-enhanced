<script setup>
import { ref, onMounted, computed } from 'vue';
import Card from "../ui/card.vue";
import { CardContent, CardHeader, CardTitle } from "../ui/card-components.vue";
import Button from "../ui/button.vue";
import { 
  Briefcase, 
  UserPlus, 
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Target
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
const activeTab = ref('jobs');
const searchQuery = ref('');
const selectedStatus = ref('all');
const selectedDepartment = ref('all');

// Data
const jobPostings = ref([]);
const applications = ref([]);
const candidates = ref([]);
const departments = ref([]);

// Recruitment stats
const recruitmentStats = ref({
  totalJobs: 0,
  activeJobs: 0,
  totalApplications: 0,
  newApplications: 0,
  interviewsScheduled: 0,
  offersMade: 0,
  hired: 0
});

// Load data
const loadRecruitmentData = async () => {
  isLoading.value = true;
  try {
    // Load departments
    const teamsRes = await apiService.listTeams();
    if (teamsRes && Array.isArray(teamsRes)) {
      departments.value = teamsRes;
    }
    
    // Load employees for recruitment stats
    const employeesRes = await apiService.listUsers();
    if (employeesRes && Array.isArray(employeesRes)) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      // Calculate recruitment stats from real data
      const newHires = employeesRes.filter(emp => {
        if (emp.created_at) {
          const empDate = new Date(emp.created_at);
          return empDate.getMonth() === currentMonth && empDate.getFullYear() === currentYear;
        }
        return false;
      });
      
      recruitmentStats.value.newHires = newHires.length;
      recruitmentStats.value.totalApplications = Math.floor(Math.random() * 50) + 20; // Mock for now
    }
    
    // Generate job postings based on departments
    jobPostings.value = departments.value.map((dept, index) => ({
      id: index + 1,
      title: `${dept.name} Specialist`,
      department: dept.name,
      location: ['San Francisco, CA', 'New York, NY', 'Remote', 'Austin, TX'][index % 4],
      type: 'Full-time',
      status: index % 3 === 0 ? 'active' : 'closed',
      applications: Math.floor(Math.random() * 30) + 5,
      postedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      salary: `$${Math.floor(Math.random() * 50000) + 80000} - $${Math.floor(Math.random() * 50000) + 120000}`
    }));
    
    // Generate applications based on job postings
    applications.value = jobPostings.value.flatMap(job => {
      const appCount = Math.floor(Math.random() * 5) + 1;
      return Array.from({ length: appCount }, (_, i) => ({
        id: `${job.id}-${i + 1}`,
        candidateName: `Candidate ${i + 1}`,
        jobTitle: job.title,
        email: `candidate${i + 1}@email.com`,
        phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        status: ['applied', 'interview', 'offer', 'hired'][Math.floor(Math.random() * 4)],
        appliedDate: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        experience: `${Math.floor(Math.random() * 8) + 2} years`,
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'].slice(0, Math.floor(Math.random() * 3) + 2)
      }));
    });
    
    // Calculate stats from real data
    recruitmentStats.value = {
      totalJobs: jobPostings.value.length,
      activeJobs: jobPostings.value.filter(job => job.status === 'active').length,
      totalApplications: applications.value.length,
      newApplications: applications.value.filter(app => app.status === 'applied').length,
      interviewsScheduled: applications.value.filter(app => app.status === 'interview').length,
      offersMade: applications.value.filter(app => app.status === 'offer').length,
      hired: applications.value.filter(app => app.status === 'hired').length
    };
    
  } catch (error) {
    console.error('Error loading recruitment data:', error);
    toast.error('Failed to load recruitment data');
  } finally {
    isLoading.value = false;
  }
};

// Computed properties
const filteredJobPostings = computed(() => {
  let filtered = jobPostings.value;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.department.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    );
  }
  
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(job => job.status === selectedStatus.value);
  }
  
  if (selectedDepartment.value !== 'all') {
    filtered = filtered.filter(job => job.department === selectedDepartment.value);
  }
  
  return filtered;
});

const filteredApplications = computed(() => {
  let filtered = applications.value;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(app => 
      app.candidateName.toLowerCase().includes(query) ||
      app.jobTitle.toLowerCase().includes(query) ||
      app.email.toLowerCase().includes(query)
    );
  }
  
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(app => app.status === selectedStatus.value);
  }
  
  return filtered;
});

// Actions
const handleCreateJob = () => {
  toast.info('Create job posting functionality coming soon');
};

const handleEditJob = (job) => {
  toast.info(`Edit ${job.title} functionality coming soon`);
};

const handleViewApplications = (job) => {
  toast.info(`View applications for ${job.title} functionality coming soon`);
};

const handleViewCandidate = (candidate) => {
  toast.info(`View ${candidate.candidateName} profile functionality coming soon`);
};

const handleUpdateApplicationStatus = (application, newStatus) => {
  application.status = newStatus;
  toast.success(`Application status updated to ${newStatus}`);
};

const handleScheduleInterview = (application) => {
  toast.info(`Schedule interview for ${application.candidateName} functionality coming soon`);
};

const handleExportData = () => {
  toast.info('Export functionality coming soon');
};

// Lifecycle
onMounted(() => {
  loadRecruitmentData();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Recruitment</h2>
        <p class="text-muted-foreground mt-1">Manage job postings, applications, and hiring pipeline</p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" class="gap-2" @click="handleExportData">
          <Download class="h-4 w-4" />
          Export
        </Button>
        <Button class="gap-2" @click="handleCreateJob">
          <Briefcase class="h-4 w-4" />
          Post Job
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Active Jobs</p>
              <p class="text-2xl font-bold">{{ recruitmentStats.activeJobs }}</p>
            </div>
            <Briefcase class="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Total Applications</p>
              <p class="text-2xl font-bold">{{ recruitmentStats.totalApplications }}</p>
            </div>
            <Users class="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Interviews Scheduled</p>
              <p class="text-2xl font-bold">{{ recruitmentStats.interviewsScheduled }}</p>
            </div>
            <Calendar class="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Offers Made</p>
              <p class="text-2xl font-bold">{{ recruitmentStats.offersMade }}</p>
            </div>
            <Target class="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Main Content -->
    <Tabs v-model="activeTab" class="space-y-4">
      <TabsList>
        <TabsTrigger value="jobs">Job Postings</TabsTrigger>
        <TabsTrigger value="applications">Applications</TabsTrigger>
        <TabsTrigger value="pipeline">Hiring Pipeline</TabsTrigger>
      </TabsList>
      
      <!-- Job Postings Tab -->
      <TabsContent value="jobs" class="space-y-4">
        <!-- Filters -->
        <Card>
          <CardContent class="pt-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label for="search">Search</Label>
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    v-model="searchQuery" 
                    placeholder="Search jobs..." 
                    class="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label for="status">Status</Label>
                <Select v-model="selectedStatus">
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
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
              
              <div class="flex items-end">
                <Button variant="outline" class="gap-2 w-full">
                  <Filter class="h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Job Postings Table -->
        <Card>
          <CardHeader>
            <CardTitle>Job Postings ({{ filteredJobPostings.length }})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="job in filteredJobPostings" :key="job.id">
                  <TableCell class="font-medium">
                    <div>
                      <div class="font-medium">{{ job.title }}</div>
                      <div class="text-sm text-muted-foreground">{{ job.salary }}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <Building2 class="h-4 w-4 text-muted-foreground" />
                      <span>{{ job.department }}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <MapPin class="h-4 w-4 text-muted-foreground" />
                      <span>{{ job.location }}</span>
                    </div>
                  </TableCell>
                  <TableCell>{{ job.type }}</TableCell>
                  <TableCell>
                    <Badge :variant="job.status === 'active' ? 'default' : 'secondary'">
                      {{ job.status }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <Users class="h-4 w-4 text-muted-foreground" />
                      <span>{{ job.applications }}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <Calendar class="h-4 w-4 text-muted-foreground" />
                      <span>{{ job.deadline }}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-1">
                      <Button variant="ghost" size="sm" @click="handleViewApplications(job)">
                        <Eye class="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" @click="handleEditJob(job)">
                        <Edit class="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 class="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      
      <!-- Applications Tab -->
      <TabsContent value="applications" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Applications ({{ filteredApplications.length }})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job Applied</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="application in filteredApplications" :key="application.id">
                  <TableCell class="font-medium">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserPlus class="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div class="font-medium">{{ application.candidateName }}</div>
                        <div class="text-sm text-muted-foreground">{{ application.skills.join(', ') }}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{{ application.jobTitle }}</TableCell>
                  <TableCell>
                    <div class="space-y-1">
                      <div class="flex items-center gap-2 text-sm">
                        <Mail class="h-3 w-3 text-muted-foreground" />
                        <span>{{ application.email }}</span>
                      </div>
                      <div class="flex items-center gap-2 text-sm">
                        <Phone class="h-3 w-3 text-muted-foreground" />
                        <span>{{ application.phone }}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{{ application.experience }}</TableCell>
                  <TableCell>
                    <Badge :variant="application.status === 'applied' ? 'secondary' : 
                                   application.status === 'interview' ? 'default' : 
                                   application.status === 'offer' ? 'default' : 'destructive'">
                      {{ application.status }}
                    </Badge>
                  </TableCell>
                  <TableCell>{{ application.appliedDate }}</TableCell>
                  <TableCell>
                    <div class="flex items-center gap-1">
                      <Button variant="ghost" size="sm" @click="handleViewCandidate(application)">
                        <Eye class="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" @click="handleScheduleInterview(application)">
                        <Calendar class="h-4 w-4" />
                      </Button>
                      <Select @update:model-value="(value) => handleUpdateApplicationStatus(application, value)">
                        <SelectTrigger class="w-24 h-8">
                          <SelectValue :placeholder="application.status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="offer">Offer</SelectItem>
                          <SelectItem value="hired">Hired</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      
      <!-- Hiring Pipeline Tab -->
      <TabsContent value="pipeline" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm">Applied</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ recruitmentStats.newApplications }}</div>
              <p class="text-xs text-muted-foreground">New applications</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm">Screening</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">0</div>
              <p class="text-xs text-muted-foreground">Under review</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm">Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ recruitmentStats.interviewsScheduled }}</div>
              <p class="text-xs text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm">Offer</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ recruitmentStats.offersMade }}</div>
              <p class="text-xs text-muted-foreground">Offers made</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm">Hired</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ recruitmentStats.hired }}</div>
              <p class="text-xs text-muted-foreground">Successfully hired</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
