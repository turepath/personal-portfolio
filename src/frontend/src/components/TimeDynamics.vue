<template>
  <div>
      <div class="flex items-center mb-2 space-x-2">
          <h2 class="text-xl font-semibold text-green-900">时间动态与行为规律</h2>
      </div>
    <div ref="target" class="w-full h-full -mt-2"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import * as echarts from "echarts";
// 定义接收父组件传来的值
const props = defineProps({
  data: {
    type: Object,
    required: true,
  }
});

// 1.初始化
let myChart = null;
const target = ref(null);
onMounted(() => {
  myChart = echarts.init(target.value);
  renderChart();
});

// 2.构建 option 配置对象
const renderChart = () => {
  const options = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: props.data.regionData.map(item => item.mdate)
    },
    series: [
      {
        name: '观测数量',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
          color: function(params) {
            const colorList = ['#A5D6A7', '#C5E1A5', '#E6EE9C', '#FFF59D', '#FFEE58'];
            return colorList[params.dataIndex % colorList.length];
          }
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold',
            color: '#4CAF50'
          }
        },
        labelLine: {
          show: false
        },
        data: props.data.regionData.map(item => ({
          value: item.value,
          name: item.mdate
        }))
      }
    ]
  };
  myChart.setOption(options);
};
watch(
  () => props.data,
  () => renderChart()
);
</script>