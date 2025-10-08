<script setup>
import { ref, watch } from 'vue';
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
import { Download, Loader2, FileText, Table2, File } from 'lucide-vue-next';
import { Checkbox } from '../ui/checkbox.vue';
import { useToast } from '../ui/toast/use-toast.js';

const props = defineProps({
  open: Boolean,
  dataType: {
    type: String,
    default: 'timesheet',
  },
});

const emit = defineEmits(['update:open']);

const { toast } = useToast();

const isExporting = ref(false);
const selectedFormat = ref('excel');
const selectedFields = ref([
  'employee-name',
  'date',
  'hours',
  'status',
]);

const formats = [
  {
    id: 'excel',
    name: 'Excel (XLSX)',
    icon: Table2,
    description: 'Formatted spreadsheet with formulas',
  },
  {
    id: 'csv',
    name: 'CSV',
    icon: FileText,
    description: 'Comma-separated values for data import',
  },
  {
    id: 'pdf',
    name: 'PDF',
    icon: File,
    description: 'Formatted document for printing',
  },
];

const fields = [
  { id: 'employee-name', name: 'Employee Name' },
  { id: 'employee-id', name: 'Employee ID' },
  { id: 'department', name: 'Department' },
  { id: 'date', name: 'Date' },
  { id: 'clock-in', name: 'Clock In Time' },
  { id: 'clock-out', name: 'Clock Out Time' },
  { id: 'hours', name: 'Total Hours' },
  { id: 'overtime', name: 'Overtime Hours' },
  { id: 'status', name: 'Approval Status' },
  { id: 'location', name: 'Location' },
  { id: 'notes', name: 'Notes' },
];

const handleFieldToggle = (fieldId) => {
  const index = selectedFields.value.indexOf(fieldId);
  if (index > -1) {
    selectedFields.value.splice(index, 1);
  } else {
    selectedFields.value.push(fieldId);
  }
};

const handleExport = async () => {
  if (selectedFields.value.length === 0) {
    toast({
      title: 'Error',
      description: 'Please select at least one field to export',
      variant: 'destructive',
    });
    return;
  }

  isExporting.value = true;

  // Simulate export process
  await new Promise((resolve) => setTimeout(resolve, 2000));

  toast({
    title: 'Success',
    description: `Data exported successfully as ${selectedFormat.value.toUpperCase()}!`,
  });

  isExporting.value = false;
  emit('update:open', false);
};
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Download class="h-5 w-5" />
          Export Data
        </DialogTitle>
        <DialogDescription>
          Select export format and fields to include
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <!-- Format Selection -->
        <div class="space-y-3">
          <Label>Export Format</Label>
          <div class="grid gap-3">
            <div
              v-for="format in formats"
              :key="format.id"
              :class="[
                'p-4 border rounded-lg cursor-pointer transition-colors',
                selectedFormat === format.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50',
              ]"
              @click="selectedFormat = format.id"
            >
              <div class="flex items-start gap-3">
                <div
                  class="h-10 w-10 rounded-lg bg-accent/50 flex items-center justify-center flex-shrink-0"
                >
                  <component :is="format.icon" class="h-5 w-5" />
                </div>
                <div class="flex-1">
                  <p class="font-medium">{{ format.name }}</p>
                  <p class="text-sm text-muted-foreground mt-1">
                    {{ format.description }}
                  </p>
                </div>
                <div
                  v-if="selectedFormat === format.id"
                  class="h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <svg
                    class="h-3 w-3 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      :stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Field Selection -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <Label>Fields to Include</Label>
            <Button
              variant="ghost"
              size="sm"
              @click="
                selectedFields =
                  selectedFields.length === fields.length
                    ? []
                    : fields.map((f) => f.id)
              "
            >
              {{
                selectedFields.length === fields.length
                  ? 'Deselect All'
                  : 'Select All'
              }}
            </Button>
          </div>
          <div class="grid grid-cols-2 gap-3 p-4 border rounded-lg">
            <div
              v-for="field in fields"
              :key="field.id"
              class="flex items-center space-x-2"
            >
              <Checkbox
                :id="field.id"
                :checked="selectedFields.includes(field.id)"
                @update:checked="handleFieldToggle(field.id)"
              />
              <label
                :for="field.id"
                class="text-sm cursor-pointer select-none"
              >
                {{ field.name }}
              </label>
            </div>
          </div>
          <p class="text-xs text-muted-foreground">
            {{ selectedFields.length }} of {{ fields.length }} fields
            selected
          </p>
        </div>

        <!-- Date Range -->
        <div class="space-y-3">
          <Label for="date-range">Date Range</Label>
          <select
            id="date-range"
            class="w-full px-3 py-2 bg-input-background border border-border rounded-lg"
          >
            <option value="current-week">Current Week</option>
            <option value="last-week">Last Week</option>
            <option value="current-month">Current Month</option>
            <option value="last-month">Last Month</option>
            <option value="current-year">Current Year</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          Cancel
        </Button>
        <Button @click="handleExport" :disabled="isExporting">
          <template v-if="isExporting">
            <Loader2 class="h-4 w-4 mr-2 animate-spin" />
            Exporting...
          </template>
          <template v-else>
            <Download class="h-4 w-4 mr-2" />
            Export Data
          </template>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
