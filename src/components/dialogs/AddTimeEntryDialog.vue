<script setup>
import { ref, computed } from 'vue';
import Button from "../ui/button.vue";
import Input from "../ui/input.vue";
import Label from "../ui/label.vue";
import Textarea from "../ui/textarea.vue";
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog.vue";
import DialogContent from "../ui/dialog-template.vue";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.vue";
import { toast } from 'vue-sonner';
import apiService from '../../services/apiService.js';
import authManager from '../../services/authService.js';

const props = defineProps({
  open: Boolean
});

const emit = defineEmits(['update:open']);

const newEntry = ref({
  date: new Date().toISOString().split("T")[0],
  startTime: "",
  endTime: "",
  workLocation: "",
  justification: "",
});

const calculatedHours = computed(() => {
  if (!newEntry.value.startTime || !newEntry.value.endTime) return "0";
  const start = new Date(`2000-01-01T${newEntry.value.startTime}`);
  const end = new Date(`2000-01-01T${newEntry.value.endTime}`);
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return diff.toFixed(2);
});

const handleSubmitEntry = async () => {
  if (!newEntry.value.startTime || !newEntry.value.endTime || !newEntry.value.workLocation) {
    toast.error("Please fill in all required fields");
    return;
  }
  if (!newEntry.value.justification.trim()) {
    toast.error("Justification is required for manual entries");
    return;
  }

  try {
    // Ensure API tokens are loaded and user is authenticated before attempting POST
    if (typeof apiService.initializeTokens === 'function') apiService.initializeTokens();
    // If no JWT token present it's very likely the backend will reject the request with "Missing headers"
    if (!apiService.jwtToken) {
      toast.error('You must be signed in to submit manual entries.');
      console.warn('AddTimeEntry: missing auth tokens (jwt_token/xsrf_token) in localStorage');
      return;
    }

    // Determine current user id from authManager
    const cur = await authManager.getCurrentUser();
    const userId = cur?.data?.id || cur?.data?.user_id || cur?.data?.attributes?.id;
    if (!userId) throw new Error('User not authenticated');

    // Build ISO timestamps using the selected date and times
    const date = newEntry.value.date;
    const toIsoNoMs = (d) => {
      // toISOString() yields YYYY-MM-DDTHH:mm:ss.sssZ — backend prefers no milliseconds
      return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
    };
    const startIso = toIsoNoMs(new Date(`${date}T${newEntry.value.startTime}`));
    const endIso = toIsoNoMs(new Date(`${date}T${newEntry.value.endTime}`));

    // Compute duration in hours (backend sometimes expects duration_hours / hours fields)
    const durationMs = new Date(endIso).getTime() - new Date(startIso).getTime();
    const durationHours = Math.max(0, Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100);

    const payload = {
      user_id: userId,
      start_time: startIso,
      end_time: endIso,
      is_manual_entry: true,
      // Keep the existing validation_status but also include common fields the backend may expect
      validation_status: 'pending',
      unpaid_overtime_hours: 0,
      is_transition_time: false,
      location: newEntry.value.workLocation,
      justification: newEntry.value.justification,
      // Additional fields to satisfy typical backend schemas
      duration_hours: durationHours,
      hours: durationHours,
      pending_approval: true,
      status: 'pending',
      type: 'manual'
    };

    // Log the exact payload so it can be inspected in browser DevTools/network console
    console.log('Submitting manual working time payload', payload);

    await apiService.createWorkingTime(userId, payload);
    toast.success('Manual time entry submitted for approval');
    handleCancel();
  } catch (err) {
    console.error('Failed to submit manual entry', err);
    const msg = err?.message || String(err) || 'Failed to submit manual time entry.';
    // If the API returned a structured error body include a short snippet in the toast
    const resp = err?.response;
    let detail = '';
    if (resp) {
      try {
        if (typeof resp === 'string') detail = resp.slice(0, 200);
        else detail = JSON.stringify(resp).slice(0, 200);
      } catch (_) { detail = '' }
    }
    toast.error(`Submission failed: ${msg}${detail ? ' — ' + detail : ''}`);
  }
};

const handleCancel = () => {
  emit('update:open', false);
  newEntry.value = {
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    workLocation: "",
    justification: "",
  };
};
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Add Manual Time Entry</DialogTitle>
        <DialogDescription>
          Submit a manual time entry for approval. Please provide all required details including work location and justification.
        </DialogDescription>
      </DialogHeader>
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="date">Date</Label>
            <Input id="date" type="date" v-model="newEntry.date" />
          </div>
          <div class="space-y-2">
            <Label for="workLocation">Work Location</Label>
            <Select v-model="newEntry.workLocation">
              <SelectTrigger>
                <SelectValue placeholder="Select work location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Work from Home">Work from Home</SelectItem>
                <SelectItem value="Warehouse Visit">Warehouse Visit</SelectItem>
                <SelectItem value="Field Work">Field Work</SelectItem>
                <SelectItem value="WFO">WFO (Work from Office)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label for="startTime">Start Time</Label>
            <Input id="startTime" type="time" v-model="newEntry.startTime" />
          </div>
          <div class="space-y-2">
            <Label for="endTime">End Time</Label>
            <Input id="endTime" type="time" v-model="newEntry.endTime" />
          </div>
          <div class="space-y-2">
            <Label>Hours</Label>
            <div class="h-10 px-3 py-2 bg-muted rounded-md flex items-center">
              {{ calculatedHours }}
            </div>
          </div>
        </div>
        <div class="space-y-2">
          <Label for="justification">Justification <span class="text-destructive">*</span></Label>
          <Textarea id="justification" placeholder="Please provide a reason for this manual entry..." v-model="newEntry.justification" rows="3" />
          <p class="text-xs text-muted-foreground">
            Common reasons: Forgot to clock in/out, system issues, working remotely, meetings, etc.
          </p>
        </div>
        <div class="flex gap-2 justify-end">
          <Button variant="outline" @click="handleCancel">Cancel</Button>
          <Button @click="handleSubmitEntry">Submit Entry</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
