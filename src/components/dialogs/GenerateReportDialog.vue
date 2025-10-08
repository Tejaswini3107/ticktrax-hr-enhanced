<script setup>
import { ref } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog.vue';
import Button from '../ui/button.vue';
import Label from '../ui/label.vue';
import { FileText, Download, Loader2 } from 'lucide-vue-next';
import Badge from '../ui/badge.vue';
import { useToast } from '../ui/toast/use-toast.js';

const props = defineProps({
  open: Boolean,
  reportType: {
    type: String,
    default: 'manager',
  },
});

const emit = defineEmits(['update:open']);

const { toast } = useToast();

const isGenerating = ref(false);
const selectedReport = ref('');
const selectedFormat = ref('pdf');
const selectedPeriod = ref('current-week');

const managerReports = [
  {
    id: 'team-hours',
    name: 'Team Hours Summary',
    description: 'Weekly hours breakdown by team member',
  },
  {
    id: 'attendance',
    name: 'Attendance Report',
    description: 'On-time, late, and absent statistics',
  },
  {
    id: 'productivity',
    name: 'Productivity Metrics',
    description: 'Team efficiency and performance',
  },
  {
    id: 'overtime',
    name: 'Overtime Analysis',
    description: 'Detailed overtime tracking and costs',
  },
];

const hrReports = [
  {
    id: 'payroll',
    name: 'Payroll Report',
    description: 'Complete payroll data with regular and OT hours',
  },
  {
    id: 'compliance',
    name: 'Compliance Report',
    description: 'FLSA violations and break compliance',
  },
  {
    id: 'department',
    name: 'Department Analysis',
    description: 'Cost and hours by department',
  },
  {
    id: 'turnover',
    name: 'Turnover Report',
    description: 'Hiring, terminations, and retention metrics',
  },
  {
    id: 'labor-distribution',
    name: 'Labor Distribution',
    description: 'Daily staffing patterns and allocation',
  },
];

const reports = managerReports;

const handleGenerate = async () => {
  if (!selectedReport.value) {
    toast({
      title: 'Error',
      description: 'Please select a report type',
      variant: 'destructive',
    });
    return;
  }

  isGenerating.value = true;

  // Simulate report generation
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const reportName = reports.find((r) => r.id === selectedReport.value)?.name;
  toast({
    title: 'Success',
    description: `${reportName} generated successfully!`,
  });

  isGenerating.value = false;
  emit('update:open', false);

  // Reset selections
  selectedReport.value = '';
  selectedFormat.value = 'pdf';
  selectedPeriod.value = 'current-week';
};
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <FileText class="h-5 w-5" />
          Generate Report
        </DialogTitle>
        <DialogDescription>
          Select report type, format, and time period to generate
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <!-- Report Selection -->
        <div class="space-y-3">
          <Label>Report Type</Label>
          <div class="grid gap-3">
            <div
              v-for="report in reports"
              :key="report.id"
              :class="[
                'p-4 border rounded-lg cursor-pointer transition-colors',
                selectedReport === report.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50',
              ]"
              @click="selectedReport = report.id"
            >
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-medium">{{ report.name }}</p>
                  <p class="text-sm text-muted-foreground mt-1">
                    {{ report.description }}
                  </p>
                </div>
                <Badge v-if="selectedReport === report.id" variant="default"
                  >Selected</Badge
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Format Selection -->
        <div class="space-y-3">
          <Label>Export Format</Label>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="format in [
                { id: 'pdf', name: 'PDF', icon: '📄' },
                { id: 'excel', name: 'Excel', icon: '📊' },
                { id: 'csv', name: 'CSV', icon: '📋' },
              ]"
              :key="format.id"
              :class="[
                'p-4 border rounded-lg cursor-pointer text-center transition-colors',
                selectedFormat === format.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50',
              ]"
              @click="selectedFormat = format.id"
            >
              <div class="text-2xl mb-2">{{ format.icon }}</div>
              <p class="font-medium">{{ format.name }}</p>
            </div>
          </div>
        </div>

        <!-- Time Period -->
        <div class="space-y-3">
          <Label for="period">Time Period</Label>
          <select
            id="period"
            class="w-full px-3 py-2 bg-input-background border border-border rounded-lg"
            v-model="selectedPeriod"
          >
            <option value="current-week">Current Week</option>
            <option value="last-week">Last Week</option>
            <option value="current-month">Current Month</option>
            <option value="last-month">Last Month</option>
            <option value="current-quarter">Current Quarter</option>
            <option value="last-quarter">Last Quarter</option>
            <option value="current-year">Current Year</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          Cancel
        </Button>
        <Button @click="handleGenerate" :disabled="isGenerating">
          <template v-if="isGenerating">
            <Loader2 class="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </template>
          <template v-else>
            <Download class="h-4 w-4 mr-2" />
            Generate Report
          </template>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
