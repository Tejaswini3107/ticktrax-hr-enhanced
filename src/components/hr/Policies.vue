<script setup>
import { ref, onMounted } from 'vue';
import { Card } from '../ui/card.vue';
import { CardContent, CardHeader, CardTitle } from '../ui/card-components.vue';
import Button from '../ui/button.vue';
import { 
  Settings, 
  Edit
} from 'lucide-vue-next';
import apiService from '../../services/apiService.js';

const selectedPolicy = ref(null);
const isPolicyOpen = ref(false);
const loading = ref(false);

// Policy settings data
const policySettings = ref([
  { name: "Standard Work Hours", value: "40 hours/week" },
  { name: "Overtime Rate", value: "1.5x base rate" },
  { name: "Night Shift Differential", value: "+20%" },
  { name: "Break Duration", value: "30 min per 8 hours" },
  { name: "Max Consecutive Nights", value: "5 shifts" },
]);

// Load policies from API
const loadPolicies = async () => {
  loading.value = true;
  try {
    const response = await apiService.getProfileSettings();
    if (response && response.data && response.data.policies) {
      policySettings.value = response.data.policies.map(policy => ({
        name: policy.name || policy.policy_name,
        value: policy.value || policy.policy_value
      }));
    }
  } catch (error) {
    console.warn('Failed to load policies from API:', error);
    // Keep default policies if API fails
  } finally {
    loading.value = false;
  }
};

const handleEditPolicy = (policy) => {
  selectedPolicy.value = policy;
  isPolicyOpen.value = true;
};

// Load policies on mount
onMounted(() => {
  loadPolicies();
});
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold">Policy Configuration</h2>
      <p class="text-muted-foreground mt-1">
        Manage time tracking policies and rules
      </p>
    </div>
    
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle class="flex items-center gap-2">
            <Settings class="h-5 w-5" />
            Current Policies
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div
            v-for="(policy, index) in policySettings"
            :key="index"
            class="flex items-center justify-between p-4 bg-accent/50 rounded-lg"
          >
            <div>
              <p class="font-medium">{{ policy.name }}</p>
              <p class="text-sm text-muted-foreground mt-1">
                Current setting
              </p>
            </div>
            <div class="flex items-center gap-3">
              <p class="font-medium">{{ policy.value }}</p>
              <Button
                size="sm"
                variant="outline"
                class="gap-2"
                @click="handleEditPolicy(policy)"
              >
                <Edit class="h-3 w-3" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Policy Dialog -->
    <!-- EditPolicyDialog component would go here -->
    <!-- <EditPolicyDialog
      :policy="selectedPolicy"
      :open="isPolicyOpen"
      @update:open="isPolicyOpen = $event"
    /> -->
  </div>
</template>

<style scoped>
/* Additional styling if needed */
</style>
