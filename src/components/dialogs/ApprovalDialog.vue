<script setup lang="ts">
import { ref, watch } from 'vue';
import { Dialog, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog.vue";
import DialogContent from "../ui/dialog-template.vue";
import Button from "../ui/button.vue";
import Label from "../ui/label.vue";
import Textarea from "../ui/textarea.vue";
import Badge from "../ui/badge.vue";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-vue-next";
import Alert from "../ui/alert.vue";

type TimeEntry = {
  employee: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hours: number;
  status: string;
  overtime?: boolean;
  notes?: string;
};

const props = defineProps<{
  entry: TimeEntry | null;
  open: boolean;
}>();

const emit = defineEmits(['update:open', 'approve', 'reject']);

const action = ref<"approve" | "reject" | null>(null);
const notes = ref("");

watch(() => props.open, (newVal) => {
  if (!newVal) {
    action.value = null;
    notes.value = "";
  }
});

const handleConfirm = () => {
  if (action.value === "approve") {
    emit('approve', notes.value);
  } else if (action.value === "reject" && notes.value.trim()) {
    emit('reject', notes.value);
  }
  handleClose();
};

const handleClose = () => {
  emit('update:open', false);
};
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent v-if="entry" class="max-w-2xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Clock class="h-5 w-5" />
          Review Time Entry
        </DialogTitle>
        <DialogDescription>Review and approve or reject this time entry</DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="bg-accent/30 rounded-lg p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">Employee</p>
              <p class="font-medium">{{ entry.employee }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-muted-foreground">Date</p>
              <p class="font-medium">{{ new Date(entry.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) }}</p>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-muted-foreground">Clock In</p>
              <p class="font-medium">{{ entry.clockIn }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Clock Out</p>
              <p class="font-medium">{{ entry.clockOut }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Total Hours</p>
              <div class="flex items-center gap-2">
                <p class="font-medium">{{ entry.hours }}h</p>
                <Badge v-if="entry.overtime" variant="secondary" class="bg-yellow-500/20 text-yellow-700">OT</Badge>
              </div>
            </div>
          </div>
          <div v-if="entry.notes">
            <p class="text-sm text-muted-foreground">Employee Notes</p>
            <p class="text-sm mt-1">{{ entry.notes }}</p>
          </div>
        </div>

        <Alert v-if="entry.overtime" class="border-yellow-500/20 bg-yellow-500/10">
          <AlertCircle class="h-4 w-4 text-yellow-600" />
          This entry includes overtime hours. Please verify the overtime was authorized before approving.
        </Alert>

        <div v-if="!action" class="grid grid-cols-2 gap-4">
          <Button size="lg" class="gap-2 bg-green-600 hover:bg-green-700" @click="action = 'approve'">
            <CheckCircle class="h-5 w-5" />
            Approve
          </Button>
          <Button size="lg" variant="destructive" class="gap-2" @click="action = 'reject'">
            <XCircle class="h-5 w-5" />
            Reject
          </Button>
        </div>

        <div v-if="action" class="space-y-3">
          <div class="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
            <CheckCircle v-if="action === 'approve'" class="h-5 w-5 text-green-600" />
            <XCircle v-if="action === 'reject'" class="h-5 w-5 text-red-600" />
            <span class="font-medium">{{ action === 'approve' ? 'Approving this entry' : 'Rejecting this entry' }}</span>
          </div>
          <div class="space-y-2">
            <Label for="notes">{{ action === 'approve' ? 'Notes (Optional)' : 'Rejection Reason (Required)' }}</Label>
            <Textarea id="notes" rows="4" :placeholder="action === 'approve' ? 'Add any notes about this approval...' : 'Please provide a reason for rejection...'" v-model="notes" :required="action === 'reject'" />
          </div>
        </div>
      </div>

      <DialogFooter>
        <template v-if="action">
          <Button variant="outline" @click="action = null">Back</Button>
          <Button @click="handleConfirm" :disabled="action === 'reject' && !notes.trim()" :class="action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''" :variant="action === 'approve' ? 'default' : 'destructive'">
            {{ action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection' }}
          </Button>
        </template>
        <Button v-else variant="outline" @click="handleClose">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
