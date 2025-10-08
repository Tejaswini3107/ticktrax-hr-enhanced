<script setup>
import { ref } from 'vue';
import Card from '../ui/card.vue';
import {
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card-components.vue';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Send,
} from 'lucide-vue-next';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const selectedTime = ref('');
const reason = ref('');
const submitted = ref(false);

const missedClockOuts = [
  { date: '2025-09-28', clockIn: '8:00 AM', status: 'approved' },
  { date: '2025-09-25', clockIn: '8:15 AM', status: 'approved' },
];

const handleSubmit = () => {
  if (selectedTime.value && reason.value.trim()) {
    submitted.value = true;
    setTimeout(() => {
      submitted.value = false;
      selectedTime.value = '';
      reason.value = '';
    }, 3000);
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div>
      <h2>Forgot to Clock Out</h2>
      <p class="text-muted-foreground mt-1">
        Submit a request to add missing clock-out time
      </p>
    </div>

    <!-- Current Open Shift Alert -->
    <Alert class="border-yellow-500/20 bg-yellow-500/10">
      <AlertCircle class="h-4 w-4 text-yellow-600" />
      <AlertTitle>Open Shift Detected</AlertTitle>
      <AlertDescription>
        You clocked in today at <strong>8:00 AM</strong> but haven't
        clocked out yet. If you've already left, please submit your
        clock-out time below.
      </AlertDescription>
    </Alert>

    <!-- Submit Form -->
    <Card v-if="!submitted">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Clock class="h-5 w-5" />
          Submit Missing Clock-Out Time
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Date</Label>
            <input
              type="date"
              class="w-full px-3 py-2 bg-input-background border border-border rounded-lg"
              :defaultValue="
                new Date().toISOString().split('T')[0]
              "
            />
          </div>
          <div class="space-y-2">
            <Label for="clockOutTime">Clock-Out Time</Label>
            <input
              id="clockOutTime"
              type="time"
              class="w-full px-3 py-2 bg-input-background border border-border rounded-lg"
              v-model="selectedTime"
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="reason">Reason (Required)</Label>
          <Textarea
            id="reason"
            :rows="4"
            placeholder="Please explain why you forgot to clock out (e.g., emergency, system issue, etc.)"
            v-model="reason"
          />
        </div>

        <div class="bg-accent/50 p-4 rounded-lg">
          <p class="text-sm text-muted-foreground">
            <strong>Note:</strong> Your manager will review this
            request. Approval is typically processed within 24 hours.
            You'll receive a notification once reviewed.
          </p>
        </div>

        <Button
          class="w-full gap-2"
          @click="handleSubmit"
          :disabled="!selectedTime || !reason.trim()"
        >
          <Send class="h-4 w-4" />
          Submit Request
        </Button>
      </CardContent>
    </Card>

    <Card
      v-else
      class="border-green-500/20 bg-green-500/10"
    >
      <CardContent class="pt-6">
        <div class="text-center space-y-3">
          <div class="flex justify-center">
            <div
              class="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <CheckCircle2 class="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h3 class="text-green-600">
            Request Submitted Successfully!
          </h3>
          <p class="text-sm text-muted-foreground">
            Your manager has been notified and will review your request
            shortly.
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- History -->
    <Card>
      <CardHeader>
        <CardTitle>Previous Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div
            v-for="(entry, index) in missedClockOuts"
            :key="index"
            class="flex items-center justify-between p-4 bg-accent/30 rounded-lg"
          >
            <div>
              <p class="font-medium">
                {{
                  new Date(entry.date).toLocaleDateString(
                    'en-US',
                    {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    }
                  )
                }}
              </p>
              <p class="text-sm text-muted-foreground">
                Clock In: {{ entry.clockIn }}
              </p>
            </div>
            <Badge
              :variant="
                entry.status === 'approved' ? 'default' : 'secondary'
              "
              :class="
                entry.status === 'approved'
                  ? 'bg-green-500 hover:bg-green-600'
                  : entry.status === 'rejected'
                  ? 'bg-red-500 hover:bg-red-600'
                  : undefined
              "
            >
              {{
                entry.status === 'approved'
                  ? 'Approved'
                  : entry.status === 'rejected'
                  ? 'Rejected'
                  : 'Pending'
              }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Help Section -->
    <Card class="border-primary/20 bg-primary/5">
      <CardContent class="pt-6">
        <div class="space-y-2">
          <h4>Tips to Avoid Missing Clock-Outs:</h4>
          <ul
            class="list-disc list-inside text-sm text-muted-foreground space-y-1"
          >
            <li>Set a reminder on your phone for end of shift</li>
            <li>Clock out before leaving your workstation</li>
            <li>Use the mobile app for remote clock-out</li>
            <li>Enable push notifications for open shifts</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
