<script setup>
import Card from '../ui/card.vue';
import { CardContent, CardHeader, CardTitle } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import Input from '../ui/input.vue';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion.vue';

import {
  HelpCircle,
  Search,
  Clock,
  MapPin,
  AlertCircle,
  FileText,
  Shield,
  Video,
} from 'lucide-vue-next';

const props = defineProps({
  currentRole: {
    type: String,
    default: 'employee',
  },
});

const employeeFAQs = [
  {
    question: 'How do I clock in and out?',
    answer:
      "Click the 'Clock In/Out' button on your dashboard. The system will automatically record your location (for field workers) and timestamp. Make sure to clock out before leaving work each day.",
  },
  {
    question: 'What if I forget to clock out?',
    answer:
      "Navigate to 'Time Entry' > 'Forgot to Clock Out'. You can submit a request with your actual clock-out time and a brief explanation. Your manager will review and approve the request.",
  },
  {
    question: 'Can I view my timesheet?',
    answer:
      "Yes! Go to 'My Timesheet' from the sidebar menu. You can view all your time entries, see approval status, and export your timesheet for personal records.",
  },
  {
    question: 'How does location tracking work for field workers?',
    answer:
      'When you clock in/out, the system automatically records your GPS location. This helps verify your work location. You must enable location services on your device for this feature to work.',
  },
  {
    question: 'What are the lunch break policies?',
    answer:
      'You must take a 30-minute unpaid lunch break if working more than 6 hours. The system will remind you to clock out for lunch and clock back in after. Breaks are automatically deducted from your total hours.',
  },
];

const managerFAQs = [
  {
    question: 'How do I approve timesheets?',
    answer:
      "Go to 'Approvals' in the sidebar. Review each time entry and click the green checkmark to approve or red X to reject. You can also bulk-approve multiple entries at once.",
  },
  {
    question: 'What is shift equity monitoring?',
    answer:
      'The system alerts you when team members work too many consecutive night shifts or weekends. This helps ensure fair shift distribution and prevent burnout.',
  },
  {
    question: 'How do I handle overtime requests?',
    answer:
      "Review overtime requests in the 'Approvals' section. You can approve or deny based on budget and necessity. During Crisis Mode, overtime is auto-approved.",
  },
  {
    question: 'How do I track team productivity?',
    answer:
      "Navigate to 'Reports' to view detailed analytics on team hours, efficiency metrics, and productivity trends. You can export these reports for presentations or reviews.",
  },
];

const hrFAQs = [
  {
    question: 'How do I configure time tracking policies?',
    answer:
      "Go to 'Policies' and click 'Edit Policies'. You can set overtime thresholds, break requirements, maximum shift lengths, and other compliance rules.",
  },
  {
    question: 'What compliance reports are available?',
    answer:
      "Navigate to 'Reports' > 'Compliance' to view FLSA violation tracking, break compliance, overtime patterns, and other regulatory requirements.",
  },
  {
    question: 'How do I generate payroll exports?',
    answer:
      "Go to 'Reports' > 'Payroll' and select your date range. Click 'Export' to download in CSV or Excel format compatible with most payroll systems.",
  },
];

const tutorials = [
  {
    title: 'Getting Started - Employee Guide',
    duration: '5 min',
    type: 'Video',
    icon: Video,
  },
  {
    title: 'Manager Approval Workflow',
    duration: '8 min',
    type: 'Video',
    icon: Video,
  },
  {
    title: 'Using Kiosk Mode',
    duration: '3 min',
    type: 'Video',
    icon: Video,
  },
  {
    title: 'Accessibility Features Guide',
    duration: '6 min',
    type: 'PDF',
    icon: FileText,
  },
  {
    title: 'Crisis Mode Procedures',
    duration: '10 min',
    type: 'PDF',
    icon: FileText,
  },
];

const faqs =
  props.currentRole === 'employee' || 'admin' ? employeeFAQs : managerFAQs;
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2>Help Center</h2>
      <p class="text-muted-foreground mt-1">
        Find answers, guides, and support resources
      </p>
    </div>

    <!-- Search -->
    <Card>
      <CardContent class="pt-6">
        <div class="relative">
          <Search
            class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            placeholder="Search for help articles, FAQs, or guides..."
            class="pl-10"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Quick Links -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card
        class="cursor-pointer hover:bg-accent/50 transition-colors"
      >
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div
              class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"
            >
              <Clock class="h-6 w-6 text-primary" />
            </div>
            <div>
              <p class="font-medium">Time Tracking Basics</p>
              <p class="text-sm text-muted-foreground">
                How to clock in/out
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        class="cursor-pointer hover:bg-accent/50 transition-colors"
      >
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div
              class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"
            >
              <MapPin class="h-6 w-6 text-primary" />
            </div>
            <div>
              <p class="font-medium">Field Worker Guide</p>
              <p class="text-sm text-muted-foreground">
                Location tracking
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        class="cursor-pointer hover:bg-accent/50 transition-colors"
      >
        <CardContent class="pt-6">
          <div class="flex items-center gap-3">
            <div
              class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"
            >
              <AlertCircle class="h-6 w-6 text-primary" />
            </div>
            <div>
              <p class="font-medium">Troubleshooting</p>
              <p class="text-sm text-muted-foreground">
                Common issues
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- FAQs -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <HelpCircle class="h-5 w-5" />
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible class="w-full">
          <AccordionItem
            v-for="(faq, index) in faqs"
            :key="index"
            :value="`item-${index}`"
          >
            <AccordionTrigger>{{ faq.question }}</AccordionTrigger>
            <AccordionContent>
              <p class="text-muted-foreground">{{ faq.answer }}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>

    <!-- Contact Support -->
    <Card class="border-primary/20 bg-primary/5">
      <CardContent class="pt-6">
        <div class="flex items-start gap-4">
          <div
            class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
          >
            <Shield class="h-6 w-6 text-primary" />
          </div>
          <div class="flex-1">
            <h4>Need More Help?</h4>
            <p class="text-sm text-muted-foreground mt-1">
              Contact IT Support: support@timemanager.com or call ext.
              4567
            </p>
            <p class="text-sm text-muted-foreground">
              Available Monday-Friday, 8:00 AM - 6:00 PM
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
