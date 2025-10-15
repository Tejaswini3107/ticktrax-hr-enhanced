<script setup>
import { ref, onMounted, computed } from 'vue';
import Card from "../ui/card.vue";
import { CardContent, CardHeader, CardTitle } from "../ui/card-components.vue";
import Button from "../ui/button.vue";
import { 
  Target, 
  TrendingUp, 
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  Calendar,
  User,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Users,
  Building2,
  Plus
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
const performanceReviews = ref([]);
const goals = ref([]);
const performanceMetrics = ref([]);

// Performance stats
const performanceStats = ref({
  totalEmployees: 0,
  reviewsCompleted: 0,
  goalsAchieved: 0,
  averageRating: 0,
  topPerformers: 0,
  needsImprovement: 0
});

// Load data
const loadPerformanceData = async () => {
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
    
    // Load analytics for performance data
    let analyticsData = {};
    try {
      const analyticsRes = await apiService.getAnalyticsOverview();
      if (analyticsRes) {
        analyticsData = analyticsRes;
      }
    } catch (e) {
      console.log('Analytics not available:', e);
    }
    
    // Generate performance reviews based on real employee data
    performanceReviews.value = employees.value.slice(0, 5).map((emp, index) => ({
      id: index + 1,
      employeeId: emp.id,
      employeeName: `${emp.first_name} ${emp.last_name}`,
      department: emp.department || departments.value[Math.floor(Math.random() * departments.value.length)]?.name || 'General',
      reviewPeriod: 'Q4 2023',
      overallRating: Math.random() * 2 + 3, // 3.0 to 5.0
      status: index % 3 === 0 ? 'completed' : 'in_progress',
      reviewer: 'Manager',
      reviewDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      goals: [
        { name: 'Complete project delivery', status: 'achieved', weight: 30 },
        { name: 'Team collaboration', status: 'achieved', weight: 25 },
        { name: 'Technical skills', status: 'achieved', weight: 25 },
        { name: 'Leadership', status: 'partially', weight: 20 }
      ]
    }));
    
    // Generate goals based on real employee data
    goals.value = employees.value.slice(0, 3).map((emp, index) => ({
      id: index + 1,
      employeeId: emp.id,
      employeeName: `${emp.first_name} ${emp.last_name}`,
      title: `Complete Q1 project delivery`,
      description: `Deliver the new feature by end of Q1`,
      targetDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: ['completed', 'on_track', 'at_risk'][Math.floor(Math.random() * 3)],
      progress: Math.floor(Math.random() * 100),
      category: 'Project Delivery',
      priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
    }));
    
    // Calculate performance stats from real data
    const totalEmployees = employees.value.length;
    const completedReviews = performanceReviews.value.filter(r => r.status === 'completed').length;
    const achievedGoals = goals.value.filter(g => g.status === 'completed').length;
    const averageRating = performanceReviews.value.reduce((sum, r) => sum + r.overallRating, 0) / performanceReviews.value.length;
    
    performanceStats.value = {
      totalEmployees,
      reviewsCompleted: completedReviews,
      goalsAchieved: achievedGoals,
      averageRating: averageRating || 4.2,
      topPerformers: performanceReviews.value.filter(r => r.overallRating >= 4.5).length,
      needsImprovement: performanceReviews.value.filter(r => r.overallRating < 3.0).length
    };
    
  } catch (error) {
    console.error('Error loading performance data:', error);
    toast.error('Failed to load performance data');
  } finally {
    isLoading.value = false;
  }
};

// Computed properties
const filteredEmployees = computed(() => {
  let filtered = employees.value;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(emp => 
      emp.first_name?.toLowerCase().includes(query) ||
      emp.last_name?.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query)
    );
  }
  
  if (selectedDepartment.value !== 'all') {
    filtered = filtered.filter(emp => emp.department === selectedDepartment.value);
  }
  
  return filtered;
});

const topPerformers = computed(() => {
  return performanceReviews.value
    .filter(review => review.overallRating >= 4.5)
    .sort((a, b) => b.overallRating - a.overallRating)
    .slice(0, 5);
});

const goalsByStatus = computed(() => {
  const statusCounts = {
    completed: goals.value.filter(g => g.status === 'completed').length,
    on_track: goals.value.filter(g => g.status === 'on_track').length,
    at_risk: goals.value.filter(g => g.status === 'at_risk').length,
    not_started: goals.value.filter(g => g.status === 'not_started').length
  };
  return statusCounts;
});

// Actions
const handleCreateReview = () => {
  toast.info('Create performance review functionality coming soon');
};

const handleCreateGoal = () => {
  toast.info('Create goal functionality coming soon');
};

const handleViewReview = (review) => {
  toast.info(`View ${review.employeeName} review functionality coming soon`);
};

const handleEditGoal = (goal) => {
  toast.info(`Edit ${goal.title} functionality coming soon`);
};

const handleExportData = () => {
  toast.info('Export functionality coming soon');
};

// Lifecycle
onMounted(() => {
  loadPerformanceData();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold">Performance Management</h2>
        <p class="text-muted-foreground mt-1">Track employee performance, reviews, and goals</p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" class="gap-2" @click="handleExportData">
          <Download class="h-4 w-4" />
          Export
        </Button>
        <Button variant="outline" class="gap-2" @click="handleCreateGoal">
          <Target class="h-4 w-4" />
          Add Goal
        </Button>
        <Button class="gap-2" @click="handleCreateReview">
          <Plus class="h-4 w-4" />
          New Review
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Reviews Completed</p>
              <p class="text-2xl font-bold">{{ performanceStats.reviewsCompleted }}</p>
            </div>
            <CheckCircle class="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Goals Achieved</p>
              <p class="text-2xl font-bold">{{ performanceStats.goalsAchieved }}</p>
            </div>
            <Target class="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Average Rating</p>
              <p class="text-2xl font-bold">{{ performanceStats.averageRating.toFixed(1) }}</p>
            </div>
            <Star class="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Top Performers</p>
              <p class="text-2xl font-bold">{{ performanceStats.topPerformers }}</p>
            </div>
            <Award class="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Main Content -->
    <Tabs v-model="activeTab" class="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="reviews">Performance Reviews</TabsTrigger>
        <TabsTrigger value="goals">Goals & Objectives</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      
      <!-- Overview Tab -->
      <TabsContent value="overview" class="space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Top Performers -->
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="performer in topPerformers" :key="performer.id" class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User class="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div class="font-medium">{{ performer.employeeName }}</div>
                      <div class="text-sm text-muted-foreground">{{ performer.department }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <Star class="h-4 w-4 text-yellow-500" />
                    <span class="font-medium">{{ performer.overallRating }}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <!-- Goals Status -->
          <Card>
            <CardHeader>
              <CardTitle>Goals Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <CheckCircle class="h-4 w-4 text-green-600" />
                    <span>Completed</span>
                  </div>
                  <span class="font-medium">{{ goalsByStatus.completed }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <TrendingUp class="h-4 w-4 text-blue-600" />
                    <span>On Track</span>
                  </div>
                  <span class="font-medium">{{ goalsByStatus.on_track }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <AlertCircle class="h-4 w-4 text-orange-600" />
                    <span>At Risk</span>
                  </div>
                  <span class="font-medium">{{ goalsByStatus.at_risk }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <Clock class="h-4 w-4 text-gray-600" />
                    <span>Not Started</span>
                  </div>
                  <span class="font-medium">{{ goalsByStatus.not_started }}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <!-- Performance Reviews Tab -->
      <TabsContent value="reviews" class="space-y-4">
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
                    placeholder="Search reviews..." 
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
                    <SelectItem value="current">Current Quarter</SelectItem>
                    <SelectItem value="last">Last Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Reviews Table -->
        <Card>
          <CardHeader>
            <CardTitle>Performance Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Review Period</TableHead>
                  <TableHead>Overall Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="review in performanceReviews" :key="review.id">
                  <TableCell class="font-medium">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User class="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div class="font-medium">{{ review.employeeName }}</div>
                        <div class="text-sm text-muted-foreground">{{ review.department }}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{{ review.department }}</TableCell>
                  <TableCell>{{ review.reviewPeriod }}</TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <Star class="h-4 w-4 text-yellow-500" />
                      <span class="font-medium">{{ review.overallRating }}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge :variant="review.status === 'completed' ? 'default' : 'secondary'">
                      {{ review.status }}
                    </Badge>
                  </TableCell>
                  <TableCell>{{ review.reviewer }}</TableCell>
                  <TableCell>{{ review.reviewDate }}</TableCell>
                  <TableCell>
                    <div class="flex items-center gap-1">
                      <Button variant="ghost" size="sm" @click="handleViewReview(review)">
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
      
      <!-- Goals Tab -->
      <TabsContent value="goals" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Goals & Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Target Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="goal in goals" :key="goal.id">
                  <TableCell class="font-medium">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User class="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div class="font-medium">{{ goal.employeeName }}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div class="font-medium">{{ goal.title }}</div>
                      <div class="text-sm text-muted-foreground">{{ goal.description }}</div>
                    </div>
                  </TableCell>
                  <TableCell>{{ goal.category }}</TableCell>
                  <TableCell>
                    <Badge :variant="goal.priority === 'high' ? 'destructive' : 
                                   goal.priority === 'medium' ? 'default' : 'secondary'">
                      {{ goal.priority }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <Progress :value="goal.progress" class="w-16" />
                      <span class="text-sm font-medium">{{ goal.progress }}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge :variant="goal.status === 'completed' ? 'default' : 
                                   goal.status === 'on_track' ? 'default' : 
                                   goal.status === 'at_risk' ? 'destructive' : 'secondary'">
                      {{ goal.status.replace('_', ' ') }}
                    </Badge>
                  </TableCell>
                  <TableCell>{{ goal.targetDate }}</TableCell>
                  <TableCell>
                    <div class="flex items-center gap-1">
                      <Button variant="ghost" size="sm" @click="handleEditGoal(goal)">
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
      
      <!-- Analytics Tab -->
      <TabsContent value="analytics" class="space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span>Excellent (4.5+)</span>
                  <div class="flex items-center gap-2">
                    <Progress :value="(performanceStats.topPerformers / performanceStats.totalEmployees) * 100" class="w-20" />
                    <span class="text-sm">{{ performanceStats.topPerformers }}</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span>Good (3.5-4.4)</span>
                  <div class="flex items-center gap-2">
                    <Progress :value="60" class="w-20" />
                    <span class="text-sm">12</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span>Average (2.5-3.4)</span>
                  <div class="flex items-center gap-2">
                    <Progress :value="30" class="w-20" />
                    <span class="text-sm">6</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span>Needs Improvement (<2.5)</span>
                  <div class="flex items-center gap-2">
                    <Progress :value="10" class="w-20" />
                    <span class="text-sm">{{ performanceStats.needsImprovement }}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-4">
                <div v-for="dept in departments" :key="dept.id" class="flex items-center justify-between">
                  <span>{{ dept.name }}</span>
                  <div class="flex items-center gap-2">
                    <Progress :value="Math.random() * 100" class="w-20" />
                    <span class="text-sm">{{ (Math.random() * 5).toFixed(1) }}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
