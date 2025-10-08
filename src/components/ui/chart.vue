<template>
  <div class="w-full h-full">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  PieController,
  DoughnutController,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  PieController,
  DoughnutController
);

const props = defineProps({
  type: {
    type: String,
    default: 'bar',
    validator: (value) => ['bar', 'line', 'pie'].includes(value)
  },
  data: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  },
  width: {
    type: [String, Number],
    default: '100%'
  },
  height: {
    type: [String, Number],
    default: '100%'
  }
});

const chartRef = ref(null);
let chartInstance = null;

const createChart = () => {
  if (!chartRef.value) return;

  const ctx = chartRef.value.getContext('2d');
  
  if (chartInstance) {
    chartInstance.destroy();
  }

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  chartInstance = new ChartJS(ctx, {
    type: props.type,
    data: props.data,
    options: { ...defaultOptions, ...props.options }
  });
};

onMounted(() => {
  nextTick(() => {
    createChart();
  });
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});

watch(() => props.data, () => {
  if (chartInstance) {
    chartInstance.data = props.data;
    chartInstance.update();
  }
}, { deep: true });

watch(() => props.options, () => {
  if (chartInstance) {
    chartInstance.options = { ...chartInstance.options, ...props.options };
    chartInstance.update();
  }
}, { deep: true });
</script>