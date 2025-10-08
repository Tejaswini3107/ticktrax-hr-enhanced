<script setup lang="ts">
import { ref, watch } from 'vue';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Settings, Loader2, Clock, Coffee, TrendingUp } from "lucide-vue-next";
import Card from "../ui/card.vue";
import { CardContent } from "../ui/card-components.vue";
import { Switch } from "../ui/switch";
import { toast } from 'vue-sonner';

type Policy = {
  id: string;
  name: string;
  value: string;
  enabled: boolean;
  description: string;
};

const props = defineProps<{
  open: boolean;
  policy?: Policy | null;
}>();

const emit = defineEmits(['update:open']);

const isSaving = ref(false);
const formData = ref({
  name: "Overtime Threshold",
  value: "40",
  enabled: true,
  description: "Weekly hours before overtime",
});

watch(() => props.policy, (newPolicy) => {
  if (newPolicy) {
    formData.value = {
      name: newPolicy.name,
      value: newPolicy.value,
      enabled: newPolicy.enabled,
      description: newPolicy.description,
    };
  }
}, { immediate: true });

const handleSave = async () => {
  isSaving.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  toast.success("Policy updated successfully!");
  isSaving.value = false;
  emit('update:open', false);
};

const setPolicy = (name: string, value: string, description: string) => {
  formData.value.name = name;
  formData.value.value = value;
  formData.value.description = description;
};
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Settings class="h-5 w-5" />
          Edit Policy
        </DialogTitle>
        <DialogDescription>Update policy settings and thresholds</DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock class="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p class="font-medium">Policy Status</p>
                  <p class="text-sm text-muted-foreground">{{ formData.enabled ? "Active" : "Inactive" }}</p>
                </div>
              </div>
              <Switch v-model:checked="formData.enabled" />
            </div>
          </CardContent>
        </Card>

        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Policy Name</Label>
            <Input id="name" v-model="formData.name" />
          </div>
          <div class="space-y-2">
            <Label for="value">Threshold Value (Hours)</Label>
            <Input id="value" type="number" v-model="formData.value" />
          </div>
          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Input id="description" v-model="formData.description" />
          </div>
        </div>

        <div class="space-y-3">
          <Label>Common Policy Settings</Label>
          <div class="grid grid-cols-2 gap-3">
            <Card class="cursor-pointer hover:border-primary" @click="setPolicy('Daily Overtime', '8', 'Daily hours before overtime')">
              <CardContent class="pt-4 pb-4">
                <div class="flex items-center gap-2">
                  <Clock class="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p class="text-sm font-medium">Daily Overtime</p>
                    <p class="text-xs text-muted-foreground">8 hours/day</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card class="cursor-pointer hover:border-primary" @click="setPolicy('Break Requirements', '30', 'Minutes required per 8-hour shift')">
              <CardContent class="pt-4 pb-4">
                <div class="flex items-center gap-2">
                  <Coffee class="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p class="text-sm font-medium">Break Time</p>
                    <p class="text-xs text-muted-foreground">30 min/shift</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card class="cursor-pointer hover:border-primary" @click="setPolicy('Weekly Overtime', '40', 'Weekly hours before overtime')">
              <CardContent class="pt-4 pb-4">
                <div class="flex items-center gap-2">
                  <TrendingUp class="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p class="text-sm font-medium">Weekly Overtime</p>
                    <p class="text-xs text-muted-foreground">40 hours/week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card class="cursor-pointer hover:border-primary" @click="setPolicy('Max Shift Length', '12', 'Maximum hours per shift')">
              <CardContent class="pt-4 pb-4">
                <div class="flex items-center gap-2">
                  <Clock class="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p class="text-sm font-medium">Max Shift</p>
                    <p class="text-xs text-muted-foreground">12 hours max</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">Cancel</Button>
        <Button @click="handleSave" :disabled="isSaving">
          <Loader2 v-if="isSaving" class="h-4 w-4 mr-2 animate-spin" />
          {{ isSaving ? "Saving..." : "Save Policy" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
