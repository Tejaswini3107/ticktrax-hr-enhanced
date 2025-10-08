<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent
      v-if="employee"
      class="max-w-3xl max-h-[90vh] overflow-y-auto"
    >
      <DialogHeader>
        <DialogTitle class="flex items-center gap-3">
          <div
            class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <User class="h-6 w-6 text-primary" />
          </div>
          <div>
            <div>{{ employee.name }}</div>
            <DialogDescription>{{ employee.id }}</DialogDescription>
          </div>
        </DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="overview" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="time">Time Records</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <!-- Overview Tab -->
        <TabsContent value="overview" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <Card>
              <CardContent class="pt-6">
                <div class="space-y-3">
                  <div class="flex items-center gap-2 text-sm">
                    <Mail class="h-4 w-4 text-muted-foreground" />
                    <span class="text-muted-foreground">Email:</span>
                    <span>{{ email }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <Phone class="h-4 w-4 text-muted-foreground" />
                    <span class="text-muted-foreground">Phone:</span>
                    <span>{{ phone }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <MapPin class="h-4 w-4 text-muted-foreground" />
                    <span class="text-muted-foreground">Location:</span>
                    <span>{{ location }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <Calendar class="h-4 w-4 text-muted-foreground" />
                    <span class="text-muted-foreground">Hire Date:</span>
                    <span>{{ hireDate }}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent class="pt-6">
                <div class="space-y-3">
                  <div class="flex items-center gap-2 text-sm">
                    <Briefcase class="h-4 w-4 text-muted-foreground" />
                    <span class="text-muted-foreground">Department:</span>
                    <span>{{ employee.department }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <Award class="h-4 w-4 text-muted-foreground" />
                    <span class="text-muted-foreground">Role:</span>
                    <Badge variant="secondary">{{ employee.role }}</Badge>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <User class="h-4 w-4 text-muted-foreground" />
                    <span class="text-muted-foreground">Type:</span>
                    <Badge variant="outline">{{ employee.type }}</Badge>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <Clock class="h-4 w-4 text-muted-foreground" />
                    <span class="text-muted-foreground">Status:</span>
                    <Badge
                      :variant="employee.status === 'active' ? 'default' : 'secondary'"
                      :class="
                        employee.status === 'active'
                          ? 'bg-green-500 hover:bg-green-600'
                          : ''
                      "
                    >
                      {{ employee.status === "active" ? "Active" : "On Leave" }}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Quick Stats -->
          <div class="grid grid-cols-3 gap-4">
            <Card>
              <CardContent class="pt-6">
                <div class="text-center">
                  <p class="text-2xl">{{ employee.hoursThisWeek }}h</p>
                  <p class="text-sm text-muted-foreground mt-1">This Week</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent class="pt-6">
                <div class="text-center">
                  <p class="text-2xl">165.5h</p>
                  <p class="text-sm text-muted-foreground mt-1">This Month</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent class="pt-6">
                <div class="text-center">
                  <p class="text-2xl">98.5%</p>
                  <p class="text-sm text-muted-foreground mt-1">Attendance</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <!-- Time Records Tab -->
        <TabsContent value="time" class="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="(entry, index) in recentTimeEntries"
                :key="index"
              >
                <TableCell>
                  {{
                    new Date(entry.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                </TableCell>
                <TableCell>{{ entry.clockIn }}</TableCell>
                <TableCell>{{ entry.clockOut }}</TableCell>
                <TableCell>{{ entry.hours }}h</TableCell>
                <TableCell>
                  <Badge
                    variant="default"
                    class="bg-green-500 hover:bg-green-600"
                  >
                    {{ entry.status }}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>

        <!-- Performance Tab -->
        <TabsContent value="performance" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <Card>
              <CardContent class="pt-6">
                <h4 class="mb-4">Monthly Metrics</h4>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-muted-foreground">Total Hours</span>
                    <span class="font-medium">165.5h</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-muted-foreground">Overtime</span>
                    <span class="font-medium">5.5h</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-muted-foreground">Days Worked</span>
                    <span class="font-medium">22</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-muted-foreground">Avg Hours/Day</span>
                    <span class="font-medium">7.5h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent class="pt-6">
                <h4 class="mb-4">Attendance</h4>
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-muted-foreground">On Time</span>
                    <span class="font-medium text-green-600">95%</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-muted-foreground">Late Arrivals</span>
                    <span class="font-medium">3</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-muted-foreground">Absences</span>
                    <span class="font-medium">1</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-muted-foreground">Attendance Rate</span>
                    <span class="font-medium text-green-600">98.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div class="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" @click="onOpenChange(false)">Close</Button>
        <Button>Edit Employee</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script>
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.vue';
import Badge from '../ui/badge.vue';
import Button from '../ui/button.vue';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui/tabs.vue';
import Card from '../ui/card.vue';
import { CardContent } from '../ui/card-components.vue';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  Award,
} from 'lucide-vue-next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table.vue';

export default {
  name: 'EmployeeDetailsDialog',
  components: {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Badge,
    Button,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Card,
    CardContent,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Clock,
    Briefcase,
    Award,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  },
  props: {
    employee: Object,
    open: Boolean,
  },
  data() {
    return {
      recentTimeEntries: [
        {
          date: '2025-10-01',
          clockIn: '08:00 AM',
          clockOut: '05:00 PM',
          hours: 9.0,
          status: 'approved',
        },
        {
          date: '2025-09-30',
          clockIn: '08:15 AM',
          clockOut: '05:30 PM',
          hours: 9.25,
          status: 'approved',
        },
        {
          date: '2025-09-29',
          clockIn: '08:00 AM',
          clockOut: '05:00 PM',
          hours: 9.0,
          status: 'approved',
        },
        {
          date: '2025-09-28',
          clockIn: '08:30 AM',
          clockOut: '05:15 PM',
          hours: 8.75,
          status: 'approved',
        },
      ],
    };
  },
  computed: {
    email() {
      return (
        this.employee?.email ||
        `${this.employee?.name.toLowerCase().replace(' ', '.')}@company.com`
      );
    },
    phone() {
      return this.employee?.phone || '(555) 123-4567';
    },
    location() {
      return this.employee?.location || 'Main Office';
    },
    hireDate() {
      return this.employee?.hireDate || 'Jan 15, 2023';
    },
  },
  methods: {
    onOpenChange(open) {
      this.$emit('update:open', open);
    },
  },
};
</script>
