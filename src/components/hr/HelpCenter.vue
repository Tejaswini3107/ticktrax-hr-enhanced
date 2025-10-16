<script setup>
import { ref, computed } from 'vue';
import { Card } from '../ui/card.vue';
import { CardContent, CardHeader, CardTitle } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import Badge from '../ui/badge.vue';
import { Input } from '../ui/input.vue';
import { Textarea } from '../ui/textarea.vue';
import { Label } from '../ui/label.vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.vue';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Video, 
  MessageCircle,
  Phone,
  Mail,
  ChevronRight,
  Star,
  Clock,
  User,
  FileText,
  Settings,
  Users,
  TrendingUp
} from 'lucide-vue-next';

const searchTerm = ref('');
const selectedCategory = ref('all');
const selectedTopic = ref('');

// Help categories and content
const helpCategories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: BookOpen,
    color: 'bg-blue-500',
    topics: [
      {
        id: 'welcome-hr',
        title: 'Welcome to HR Portal',
        description: 'Learn the basics of the HR portal and key features',
        content: `
# Welcome to HR Portal

The HR Portal is your central hub for managing employees, timesheets, policies, and reports. Here's what you can do:

## Key Features
- **Employee Management**: Add, edit, and manage employee records
- **Timesheet Review**: Review and approve employee timesheets
- **Policy Configuration**: Set and manage company policies
- **Reports & Analytics**: Generate comprehensive HR reports
- **Compliance Monitoring**: Track compliance issues and violations

## Getting Started
1. Navigate through the sidebar menu to access different features
2. Use the search functionality to quickly find employees or data
3. Check the dashboard for key metrics and alerts
4. Review pending approvals in the notifications

## Need Help?
Use the search function above or browse through the categories below for specific help topics.
        `,
        tags: ['basics', 'overview', 'navigation']
      },
      {
        id: 'employee-setup',
        title: 'Setting Up Employees',
        description: 'How to add new employees and configure their profiles',
        content: `
# Setting Up Employees

## Adding New Employees
1. Go to **Employees** in the sidebar
2. Click **Add Employee** button
3. Fill in the required information:
   - Personal details (name, email, phone)
   - Department and position
   - Work schedule preferences
   - Access permissions

## Employee Profiles
Each employee profile includes:
- Personal information
- Department assignment
- Time tracking preferences
- Role-based access controls
- Historical data and reports

## Bulk Import
To add multiple employees:
1. Use the **Import** button in the Employee Management page
2. Download the template file
3. Fill in employee data
4. Upload the completed file
        `,
        tags: ['employees', 'setup', 'profiles']
      }
    ]
  },
  {
    id: 'timesheets',
    name: 'Timesheet Management',
    icon: Clock,
    color: 'bg-green-500',
    topics: [
      {
        id: 'review-timesheets',
        title: 'Reviewing Timesheets',
        description: 'How to review and approve employee timesheets',
        content: `
# Reviewing Timesheets

## Timesheet Review Process
1. Navigate to **Timesheets** in the sidebar
2. View submitted timesheets in the table
3. Click on a timesheet to review details
4. Approve or reject with comments

## Approval Criteria
- Verify total hours worked
- Check for overtime compliance
- Ensure break times are recorded
- Validate project/department assignments

## Bulk Actions
- Select multiple timesheets for batch approval
- Export timesheet data for payroll
- Generate timesheet reports
        `,
        tags: ['timesheets', 'approval', 'review']
      }
    ]
  },
  {
    id: 'policies',
    name: 'Policy Management',
    icon: Settings,
    color: 'bg-purple-500',
    topics: [
      {
        id: 'configure-policies',
        title: 'Configuring Policies',
        description: 'How to set up and manage company policies',
        content: `
# Configuring Policies

## Policy Categories
- **Working Hours**: Standard hours, overtime rules
- **Compensation**: Pay rates, overtime multipliers
- **Compliance**: Legal requirements, safety rules
- **Attendance**: Break requirements, shift patterns

## Editing Policies
1. Go to **Policies** in the sidebar
2. Find the policy you want to modify
3. Click **Edit** next to the policy
4. Update the value and save changes

## Policy Activation
- Active policies are enforced automatically
- Deactivated policies are stored but not applied
- Changes take effect immediately for new entries
        `,
        tags: ['policies', 'configuration', 'rules']
      }
    ]
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    icon: TrendingUp,
    color: 'bg-orange-500',
    topics: [
      {
        id: 'generating-reports',
        title: 'Generating Reports',
        description: 'How to create and export HR reports',
        content: `
# Generating Reports

## Report Types
- **Payroll Reports**: Employee compensation data
- **Department Analytics**: Performance by department
- **Compliance Reports**: Violations and issues
- **Turnover Analysis**: Employee retention metrics
- **Labor Distribution**: Workload patterns

## Creating Reports
1. Go to **Reports** in the sidebar
2. Select the report type from tabs
3. Choose date range and filters
4. Click **Generate Report**
5. Export in your preferred format

## Scheduled Reports
Set up automatic report generation:
- Weekly payroll summaries
- Monthly compliance reports
- Quarterly analytics
        `,
        tags: ['reports', 'analytics', 'export']
      }
    ]
  },
  {
    id: 'support',
    name: 'Support & Contact',
    icon: MessageCircle,
    color: 'bg-red-500',
    topics: [
      {
        id: 'contact-support',
        title: 'Contact Support',
        description: 'Get help from our support team',
        content: `
# Contact Support

## Support Channels
- **Email**: hr-support@company.com
- **Phone**: +1 (555) 123-4567
- **Live Chat**: Available 9 AM - 5 PM EST
- **Help Desk**: Create a ticket for technical issues

## Response Times
- **Critical Issues**: Within 2 hours
- **General Support**: Within 24 hours
- **Feature Requests**: Within 1 week

## Before Contacting Support
1. Check this help center first
2. Try refreshing your browser
3. Clear your browser cache
4. Check your internet connection
        `,
        tags: ['support', 'contact', 'help']
      }
    ]
  }
];

const faqs = [
  {
    id: 1,
    question: "How do I approve multiple timesheets at once?",
    answer: "Select multiple timesheets using the checkboxes, then click 'Bulk Approve' from the actions menu.",
    category: "timesheets"
  },
  {
    id: 2,
    question: "Can I export employee data?",
    answer: "Yes, go to Employee Management and click the 'Export' button to download employee data in CSV format.",
    category: "employees"
  },
  {
    id: 3,
    question: "How often should I review compliance reports?",
    answer: "We recommend reviewing compliance reports weekly to ensure all issues are addressed promptly.",
    category: "reports"
  },
  {
    id: 4,
    question: "What happens when I deactivate a policy?",
    answer: "Deactivated policies are stored but not enforced. Existing time entries are not affected, but new entries won't follow the policy.",
    category: "policies"
  },
  {
    id: 5,
    question: "How do I add a new department?",
    answer: "Contact your system administrator to add new departments. They will need to configure the department settings and permissions.",
    category: "employees"
  }
];

const filteredTopics = computed(() => {
  let topics = [];
  
  if (selectedCategory.value === 'all') {
    topics = helpCategories.flatMap(cat => cat.topics);
  } else {
    const category = helpCategories.find(cat => cat.id === selectedCategory.value);
    topics = category ? category.topics : [];
  }
  
  if (searchTerm.value) {
    topics = topics.filter(topic => 
      topic.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      topic.tags.some(tag => tag.toLowerCase().includes(searchTerm.value.toLowerCase()))
    );
  }
  
  return topics;
});

const filteredFaqs = computed(() => {
  return faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const selectedTopicContent = computed(() => {
  if (!selectedTopic.value) return null;
  
  for (const category of helpCategories) {
    const topic = category.topics.find(t => t.id === selectedTopic.value);
    if (topic) return topic;
  }
  return null;
});

const openTopic = (topicId) => {
  selectedTopic.value = topicId;
};

const closeTopic = () => {
  selectedTopic.value = '';
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-bold">Help Center</h2>
      <p class="text-muted-foreground mt-1">
        Find answers, guides, and support for HR Portal features
      </p>
    </div>

    <!-- Search Bar -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex items-center gap-4">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="searchTerm"
              placeholder="Search help topics, FAQs, or guides..."
              class="pl-10"
            />
          </div>
          <Select v-model="selectedCategory">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem v-for="category in helpCategories" :key="category.id" :value="category.id">
                {{ category.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Topic Detail View -->
    <Card v-if="selectedTopicContent">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>{{ selectedTopicContent.title }}</CardTitle>
            <p class="text-muted-foreground mt-1">{{ selectedTopicContent.description }}</p>
          </div>
          <Button variant="outline" @click="closeTopic">
            <X class="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="prose max-w-none" v-html="selectedTopicContent.content.replace(/\n/g, '<br>')"></div>
        <div class="flex flex-wrap gap-2 mt-4">
          <Badge v-for="tag in selectedTopicContent.tags" :key="tag" variant="outline">
            {{ tag }}
          </Badge>
        </div>
      </CardContent>
    </Card>

    <!-- Help Categories -->
    <div v-else>
      <!-- Category Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <Card 
          v-for="category in helpCategories" 
          :key="category.id"
          class="cursor-pointer hover:shadow-md transition-shadow"
          @click="selectedCategory = category.id"
        >
          <CardContent class="pt-6">
            <div class="flex flex-col items-center text-center">
              <div :class="['w-12 h-12 rounded-lg flex items-center justify-center mb-3', category.color]">
                <component :is="category.icon" class="h-6 w-6 text-white" />
              </div>
              <h3 class="font-semibold">{{ category.name }}</h3>
              <p class="text-sm text-muted-foreground mt-1">
                {{ category.topics.length }} topics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Topics List -->
      <Card>
        <CardHeader>
          <CardTitle>
            {{ selectedCategory === 'all' ? 'All Topics' : helpCategories.find(c => c.id === selectedCategory)?.name + ' Topics' }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div
              v-for="topic in filteredTopics"
              :key="topic.id"
              class="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              @click="openTopic(topic.id)"
            >
              <div class="flex-1">
                <h4 class="font-semibold">{{ topic.title }}</h4>
                <p class="text-sm text-muted-foreground mt-1">{{ topic.description }}</p>
                <div class="flex flex-wrap gap-1 mt-2">
                  <Badge v-for="tag in topic.tags" :key="tag" variant="outline" class="text-xs">
                    {{ tag }}
                  </Badge>
                </div>
              </div>
              <ChevronRight class="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div v-if="filteredTopics.length === 0" class="text-center py-12">
            <HelpCircle class="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p class="text-muted-foreground">No topics found matching your search</p>
          </div>
        </CardContent>
      </Card>

      <!-- FAQs -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <HelpCircle class="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="faq in filteredFaqs"
              :key="faq.id"
              class="border rounded-lg p-4"
            >
              <h4 class="font-semibold mb-2">{{ faq.question }}</h4>
              <p class="text-muted-foreground">{{ faq.answer }}</p>
              <Badge variant="outline" class="mt-2">{{ faq.category }}</Badge>
            </div>
          </div>

          <div v-if="filteredFaqs.length === 0" class="text-center py-8">
            <HelpCircle class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p class="text-muted-foreground">No FAQs found matching your search</p>
          </div>
        </CardContent>
      </Card>

      <!-- Contact Support -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <MessageCircle class="h-5 w-5" />
            Still Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center p-4">
              <Mail class="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 class="font-semibold">Email Support</h4>
              <p class="text-sm text-muted-foreground">hr-support@company.com</p>
            </div>
            <div class="text-center p-4">
              <Phone class="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 class="font-semibold">Phone Support</h4>
              <p class="text-sm text-muted-foreground">+1 (555) 123-4567</p>
            </div>
            <div class="text-center p-4">
              <MessageCircle class="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 class="font-semibold">Live Chat</h4>
              <p class="text-sm text-muted-foreground">9 AM - 5 PM EST</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.prose {
  line-height: 1.7;
}

.prose h1 {
  @apply text-2xl font-bold mb-4;
}

.prose h2 {
  @apply text-xl font-semibold mb-3 mt-6;
}

.prose h3 {
  @apply text-lg font-medium mb-2 mt-4;
}

.prose p {
  @apply mb-3;
}

.prose ul {
  @apply list-disc list-inside mb-3;
}

.prose ol {
  @apply list-decimal list-inside mb-3;
}

.prose li {
  @apply mb-1;
}

.prose code {
  @apply bg-muted px-1 py-0.5 rounded text-sm;
}
</style>
