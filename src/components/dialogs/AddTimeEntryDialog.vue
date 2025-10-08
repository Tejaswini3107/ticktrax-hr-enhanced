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

const handleSubmitEntry = () => {
  if (!newEntry.value.startTime || !newEntry.value.endTime || !newEntry.value.workLocation) {
    toast.error("Please fill in all required fields");
    return;
  }
  if (!newEntry.value.justification.trim()) {
    toast.error("Justification is required for manual entries");
    return;
  }
  toast.success("Manual time entry submitted for approval");
  handleCancel();
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
