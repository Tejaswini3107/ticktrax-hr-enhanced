<script>
import { h } from 'vue';
import Chart from './chart.vue';

// BarChart component
export const BarChart = {
  name: 'BarChart',
  props: {
    data: Object,
  },
  setup(props, { slots }) {
    return () => h(Chart, {
      type: 'bar',
      data: props.data,
    }, slots.default?.());
  },
};

// LineChart component
export const LineChart = {
  name: 'LineChart',
  props: {
    data: Object,
  },
  setup(props, { slots }) {
    return () => h(Chart, {
      type: 'line',
      data: props.data,
    }, slots.default?.());
  },
};

// PieChart component
export const PieChart = {
  name: 'PieChart',
  props: {
    data: Object,
  },
  setup(props, { slots }) {
    return () => h(Chart, {
      type: 'pie',
      data: props.data,
    }, slots.default?.());
  },
};

// AreaChart component
export const AreaChart = {
  name: 'AreaChart',
  props: {
    data: Object,
    options: Object,
  },
  setup(props, { slots }) {
    return () => h(Chart, {
      type: 'line',
      data: props.data,
      options: {
        ...props.options,
        plugins: {
          ...props.options?.plugins,
          filler: {
            propagate: false
          }
        }
      },
    }, slots.default?.());
  },
};

// ResponsiveContainer component
export const ResponsiveContainer = {
  name: 'ResponsiveContainer',
  props: {
    width: {
      type: [String, Number],
      default: '100%'
    },
    height: {
      type: [String, Number],
      default: '100%'
    }
  },
  setup(props, { slots }) {
    return () => h('div', {
      style: {
        width: props.width,
        height: props.height,
        position: 'relative'
      }
    }, slots.default?.());
  },
};

// Placeholder components for chart elements (these won't be used in Chart.js)
export const Bar = { name: 'Bar' };
export const Line = { name: 'Line' };
export const Area = { name: 'Area' };
export const Pie = { name: 'Pie' };
export const Cell = { name: 'Cell' };
export const XAxis = { name: 'XAxis' };
export const YAxis = { name: 'YAxis' };
export const CartesianGrid = { name: 'CartesianGrid' };
export const Tooltip = { name: 'Tooltip' };
export const Legend = { name: 'Legend' };
</script>
