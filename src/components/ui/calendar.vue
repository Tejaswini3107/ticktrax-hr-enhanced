<template>
  <v-calendar :attributes="attributes" v-bind="$attrs" />
</template>

<script>
import { Calendar as VCalendar } from 'v-calendar';
import 'v-calendar/style.css';

const CalendarComponent = {
  name: 'Calendar',
  components: {
    VCalendar,
  },
  props: {
    selected: Date,
  },
  computed: {
    attributes() {
      return [
        {
          key: 'today',
          highlight: true,
          dates: new Date(),
        },
        {
          key: 'selected',
          highlight: {
            color: 'blue',
            fillMode: 'solid',
          },
          dates: this.selected,
        },
      ];
    },
  },
};

// Export Calendar as named export
export const Calendar = CalendarComponent;

export default CalendarComponent;
</script>
