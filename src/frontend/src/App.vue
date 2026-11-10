<template>
  <div
    class="bg-[url('assets/images/bg1.jpg')] bg-cover bg-center h-screen text-white  flex overflow-hidden p-0 m-0 min-h-screen"
    v-if="data">
    <!--左侧区域-->
    <div class="flex-1 mr-2 bg-opacity-50 bg-slate-800 p-3 flex flex-col mt-1" v-if="data">

      <SpeciesCard class="flex-1 bg-opacity-50 bg-slate-800 p-3 min-h-[120px]" :data="data.speciesStats" />
      <SpeciesComposition class="flex-1 box-border pb-4" :data="data.Species" />
      <Relationship class="flex-1" :data="data.RelationData" />
    </div>
    <!--中间区域-->
    <div class="w-1/2 mr-3 flex flex-col mt-1" v-if="data">
      <KpiCard class="bg-opacity-50 bg-slate-800 p-3" :data="data.KpiCard" />
      <MapChart class="bg-opacity-50 bg-slate-800 p-2 pt-4 mt-2 flex-1" :data="data.MapData" />
      <MomentsHighlights class="bg-opacity-50 bg-slate-800 h-1/4 pb-2" :data="data.Moment.regionData" />

    </div>
    <!--右侧区域-->
    <div class="flex-1 bg-opacity-50 bg-slate-800 p-2 flex flex-col gap-2 mt-1" v-if="data">
      <div>
        <LoginForm v-if="!isAuthenticated" @login-success="handleLoginSuccess" class=" h-1/4 pb-2" />
        <UploadForm v-else @logout="handleLogout" class=" h-1/4 pb-2" />
      </div>
      <TimeDynamics class="h-1/3 box-border pb-4" :data="data.TimeDynamics" />
      <SystemAlert class="flex-1 box-border pb-4" :data="data.SystemAlert" />

    </div>
  </div>

</template>

<script setup>
import LoginForm from './components/LoginForm.vue'; //登录组件
import UploadForm from './components/UploadForm.vue';//视频上传组件
import Relationship from './components/Relationship.vue';//网络连接关系
import SpeciesCard from './components/SpeciesCard.vue';//物种卡片logo
import KpiCard from './components/KpiCard.vue';//绘制数据总览图
import MapChart from './components/MapChart.vue';//地图可视化分析
import SystemAlert from './components/SystemAlert.vue';//种群趋势分析与预警
import TimeDynamics from './components/TimeDynamics.vue';//时间动态与行为规律
import MomentsHighlights from './components/MomentsHighlights.vue'; // 精彩回放
import SpeciesComposition from './components/SpeciesComposition.vue';//物种组成与多样性分析
import { ref } from 'vue';

const generateMockData = () => ({
  speciesStats: {
    totalSpecies: 28,
    todayActive: 5,
    onlineDevices: 3,
    weather: "28℃"
  },
  KpiCard: {
    total: 23456,
    hb: 2,
    db: 3,
    hd: 3,
    zn: 2345,
  },
  Species: {
    regionData: [
      { name: '白鹭', value: 12 },
      { name: '麻雀', value: 33 },
      { name: '家燕', value: 45 },
      { name: '喜鹊', value: 23 },  
      { name: '画眉', value: 45 },    
      { name: '牡丹', value: 12 },    
      { name: '杜鹃', value: 3 },    
    ],
  },
  TimeDynamics: {
    regionData: [
      { id: 1, mdate: '周一', value: 50, temperature: 28 },
      { id: 2, mdate: '周二', value: 60, temperature: 29 },
      { id: 3, mdate: '周三', value: 70, temperature: 28 },
      { id: 4, mdate: '周四', value: 80, temperature: 31 },
      { id: 5, mdate: '周五', value: 90, temperature: 32 },
      { id: 6, mdate: '周六', value: 23, temperature: 14 },
      { id: 7, mdate: '周日', value: 110, temperature: 34 }
    ],
  },
  SystemAlert: {
      dimensions: ['month', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      data: [
        { species: '白鹭', values: [56, 82, 88, 70, 53, 85, 51, 51, 55, 53, 73, 51] },
        { species: '麻雀', values: [51, 51, 55, 53, 73, 68, 56, 82, 88, 70, 53, 68] },
        { species: '家燕', values: [40, 62, 69, 36, 45, 32, 25, 37, 41, 18, 33, 32] },
        { species: '喜鹊', values: [25, 37, 41, 18, 33, 49, 40, 62, 69, 36, 45, 18] },
        { species: '画眉', values: [25, 37, 41, 18, 33, 49, 40, 62, 69, 36, 45, 18] },
        { species: '牡丹', values: [25, 37, 41, 18, 33, 49, 40, 62, 69, 36, 45, 18] },
        { species: '杜鹃', values: [25, 37, 41, 18, 33, 49, 40, 62, 69, 36, 45, 18] }
      ]
  },
  RelationData: {
    relations: [
      { id: 1, name: '情人湖摄像头1', source: '情人湖摄像头1', speed: 2, target: '数据中心', value: [0, 290] },
      { id: 2, name: '情人湖摄像头2', source: '情人湖摄像头2', speed: 3, target: '数据中心', value: [0, 100] },
      { id: 3, name: '寸草湖摄像头1', source: '寸草湖摄像头1', speed: 4, target: '数据中心', value: [100, 100] },
      { id: 4, name: '寸草湖摄像头2', source: '寸草湖摄像头2', speed: 5, target: '数据中心', value: [100, 300] },
      { id: 0, name: '数据中心',  value: [50, 200] },
    ]
  },
  MapData: {
    voltageLevel: ['2021', '2022', '2023', '2024', '2025'],
    categoryData: {
      '2021': [
        { name: '情人湖1', value: 100 },
        { name: '情人湖2', value: 200 },
        { name: '寸草湖1', value: 300 },
        { name: '寸草湖2', value: 400 },
        { name: '十教学楼', value: 100 },
        { name: '七教学楼', value: 200 },
        { name: '枫叶林', value: 300 },
        { name: '艺苑小区', value: 400 },
      ],
      '2022': [
        { name: '情人湖1', value: 60 },
        { name: '情人湖2', value: 200 },
        { name: '寸草湖1', value: 100 },
        { name: '寸草湖2', value: 400 },
        { name: '十教学楼', value: 100 },
        { name: '七教学楼', value: 200 },
        { name: '枫叶林', value: 300 },
        { name: '艺苑小区', value: 400 },
      ],
      '2023': [
        { name: '情人湖1', value: 100 },
        { name: '情人湖2', value: 90 },
        { name: '寸草湖1', value: 300 },
        { name: '寸草湖2', value: 180 },
        { name: '十教学楼', value: 100 },
        { name: '七教学楼', value: 200 },
        { name: '枫叶林', value: 300 },
        { name: '艺苑小区', value: 400 },
      ],
      '2024': [
        { name: '情人湖1', value: 200 },
        { name: '情人湖2', value: 200 },
        { name: '寸草湖1', value: 400 },
        { name: '寸草湖2', value: 23 },
        { name: '十教学楼', value: 100 },
        { name: '七教学楼', value: 200 },
        { name: '枫叶林', value: 300 },
        { name: '艺苑小区', value: 400 },
      ],
      '2025': [
        { name: '情人湖1', value: 99 },
        { name: '情人湖2', value: 88 },
        { name: '寸草湖1', value: 600 },
        { name: '寸草湖2', value: 500 },
        { name: '十教学楼', value: 100 },
        { name: '七教学楼', value: 200 },
        { name: '枫叶林', value: 300 },
        { name: '艺苑小区', value: 400 },
      ],
    },
    colors: ['#1de9b6', '#f46e36', '#04b9ff', '#5dbd32', '#ffc809'],
    topData: {
      '2021': [
        { name: '情人湖1', value: [113.002586, 28.195337, 100] },
        { name: '情人湖2', value: [113.020533, 28.192064, 200] },
        { name: '寸草湖1', value: [113.030533, 28.212064, 300] },
        { name: '寸草湖2', value: [113.043626, 28.202817, 400] },
        { name: '十教学楼', value: [113.070752, 28.189653, 100] },
        { name: '七教学楼', value: [113.096366, 28.191065, 200] },
        { name: '枫叶林', value: [113.074714, 28.200036, 300] },
        { name: '艺苑小区', value: [112.992694, 28.189748, 400] },
      ],
      '2022': [
        { name: '情人湖1', value: [113.002586, 28.195337, 60] },
        { name: '情人湖2', value: [113.020533, 28.192064, 200] },
        { name: '寸草湖1', value: [113.030533, 28.212064, 100] },
        { name: '寸草湖2', value: [113.043626, 28.202817, 400] },
        { name: '十教学楼', value: [113.070752, 28.189653, 100] },
        { name: '七教学楼', value: [113.096366, 28.191065, 200] },
        { name: '枫叶林', value: [113.074714, 28.200036, 300] },
        { name: '艺苑小区', value: [112.992694, 28.189748, 400] },
      ],
      '2023': [
        { name: '情人湖1', value: [113.002586, 28.195337, 100] },
        { name: '情人湖2', value: [113.020533, 28.192064, 90] },
        { name: '寸草湖1', value: [113.030533, 28.212064, 300] },
        { name: '寸草湖2', value: [113.043626, 28.202817, 180] },
        { name: '十教学楼', value: [113.070752, 28.189653, 100] },
        { name: '七教学楼', value: [113.096366, 28.191065, 200] },
        { name: '枫叶林', value: [113.074714, 28.200036, 300] },
        { name: '艺苑小区', value: [112.992694, 28.189748, 400] },
      ],
      '2024': [
        { name: '情人湖1', value: [113.002586, 28.195337, 200] },
        { name: '情人湖2', value: [113.020533, 28.192064, 200] },
        { name: '寸草湖1', value: [113.030533, 28.212064, 400] },
        { name: '寸草湖2', value: [113.043626, 28.202817, 23] },
        { name: '十教学楼', value: [113.070752, 28.189653, 100] },
        { name: '七教学楼', value: [113.096366, 28.191065, 200] },
        { name: '枫叶林', value: [113.074714, 28.200036, 300] },
        { name: '艺苑小区', value: [112.992694, 28.189748, 400] },
      ],
      '2025': [
        { name: '情人湖1', value: [113.002586, 28.195337, 99] },
        { name: '情人湖2', value: [113.020533, 28.192064, 88] },
        { name: '寸草湖1', value: [113.030533, 28.212064, 600] },
        { name: '寸草湖2', value: [113.043626, 28.202817, 500] },
        { name: '十教学楼', value: [113.070752, 28.189653, 100] },
        { name: '七教学楼', value: [113.096366, 28.191065, 200] },
        { name: '枫叶林', value: [113.074714, 28.200036, 300] },
        { name: '艺苑小区', value: [112.992694, 28.189748, 400] },
      ],
    },

  },
  Moment: {
    regionData: [
      {
        "id": 1,
        "videoUrl":"http://127.0.0.1:9001/api/v1/download-shared-object/aHR0cDovLzEyNy4wLjAuMTo5MDAwL3ZpZGVvLWFuYWx5c2lzL2FuYWx5c2lzLXJlc3VsdC8lRTklQjglOUYlRTclQjElQkIlRTUlOUIlQkUlRTUlODMlOEYlRTglQjUlODQlRTYlOTYlOTkxMy5NUDQ_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD0yNUJEV0c2NkM0Rk1HQlJRSkpSViUyRjIwMjUwNjIyJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDYyMlQwNjIyNDNaJlgtQW16LUV4cGlyZXM9NDMyMDAmWC1BbXotU2VjdXJpdHktVG9rZW49ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhZMk5sYzNOTFpYa2lPaUl5TlVKRVYwYzJOa00wUmsxSFFsSlJTa3BTVmlJc0ltVjRjQ0k2TVRjMU1EWXhNekV5TkN3aWNHRnlaVzUwSWpvaWJXbHVhVzloWkcxcGJpSjkuZmhKQ2FWRF92VWM2aFhtSjFmS09tYWZvV1hBaGdUYk5ZT29GUnRZZGxIMkNBcllualZBUlRUY2pXTWJtbl9hR08tdGk5UjlMTG4teEVEQUZ3M3ExaFEmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JnZlcnNpb25JZD1udWxsJlgtQW16LVNpZ25hdHVyZT1lNmE5YjNmNzJiMjExMDczZjdjNjY1MTI0M2Q4ZTk4ODU4ZGRhYmQ1NjdlOWNkZDYzN2UxZDhkMjFmYTcyM2Y0",
        "title": "白颊噪鹛晨间觅食"  // 可选字段
      },
      {
        "id": 2,
        "videoUrl": "http://127.0.0.1:9001/api/v1/download-shared-object/aHR0cDovLzEyNy4wLjAuMTo5MDAwL3ZpZGVvLWFuYWx5c2lzL2FuYWx5c2lzLXJlc3VsdC8lRTklQjglOUYlRTclQjElQkIlRTUlOUIlQkUlRTUlODMlOEYlRTglQjUlODQlRTYlOTYlOTkxNS5NUDQ_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD0yNUJEV0c2NkM0Rk1HQlJRSkpSViUyRjIwMjUwNjIyJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDYyMlQwNjIzMDdaJlgtQW16LUV4cGlyZXM9NDMyMDAmWC1BbXotU2VjdXJpdHktVG9rZW49ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhZMk5sYzNOTFpYa2lPaUl5TlVKRVYwYzJOa00wUmsxSFFsSlJTa3BTVmlJc0ltVjRjQ0k2TVRjMU1EWXhNekV5TkN3aWNHRnlaVzUwSWpvaWJXbHVhVzloWkcxcGJpSjkuZmhKQ2FWRF92VWM2aFhtSjFmS09tYWZvV1hBaGdUYk5ZT29GUnRZZGxIMkNBcllualZBUlRUY2pXTWJtbl9hR08tdGk5UjlMTG4teEVEQUZ3M3ExaFEmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JnZlcnNpb25JZD1udWxsJlgtQW16LVNpZ25hdHVyZT03MWYzZmUwYzM3NzFmM2YxMGUyZTk3M2MwMTYxOWM3MjE1MjhiY2JlYjY3N2I3ZDVlOTlhMWYzYTg0MjM2MTBk",
        "title": "灰喜鹊晨间觅食"  // 扩展字段示例
      },
      // 更多数据条目...
      {
        "id": 3,
        "videoUrl": "http://127.0.0.1:9001/api/v1/download-shared-object/aHR0cDovLzEyNy4wLjAuMTo5MDAwL3ZpZGVvLWFuYWx5c2lzL2FuYWx5c2lzLXJlc3VsdC8lRTklQjglOUYlRTclQjElQkIlRTUlOUIlQkUlRTUlODMlOEYlRTglQjUlODQlRTYlOTYlOTkxNy5NUDQ_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD0yNUJEV0c2NkM0Rk1HQlJRSkpSViUyRjIwMjUwNjIyJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDYyMlQwNjIzMjVaJlgtQW16LUV4cGlyZXM9NDMyMDAmWC1BbXotU2VjdXJpdHktVG9rZW49ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmhZMk5sYzNOTFpYa2lPaUl5TlVKRVYwYzJOa00wUmsxSFFsSlJTa3BTVmlJc0ltVjRjQ0k2TVRjMU1EWXhNekV5TkN3aWNHRnlaVzUwSWpvaWJXbHVhVzloWkcxcGJpSjkuZmhKQ2FWRF92VWM2aFhtSjFmS09tYWZvV1hBaGdUYk5ZT29GUnRZZGxIMkNBcllualZBUlRUY2pXTWJtbl9hR08tdGk5UjlMTG4teEVEQUZ3M3ExaFEmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JnZlcnNpb25JZD1udWxsJlgtQW16LVNpZ25hdHVyZT05ZDE4YjQ1MzcwN2E0ODAyM2ZiNmMzMzVkOTFmYjNmNDY5MTMxMTNjMGVhNjU0ZTZlNmU2ZTY4OTZmYTIyY2Uz",
        "title": "燕雀傍晚觅食"  // 扩展字段示例
      }
    ]
  },
 });

const data = ref(generateMockData());

</script>
<script>
export default {
  data() {
    return {
      // 现有数据属性保持不变
      cameraId: null // 新增摄像头ID
    }
  },
  async created() {
    // 页面加载时获取摄像头ID
    try {
      const response = await this.$axios.get('/api/cameras');
      if (response.data && response.data.length > 0) {
        this.cameraId = response.data[0].id; // 默认选择第一个摄像头
      }
    } catch (error) {
      console.error('获取摄像头ID失败:', error);
    }
  },
  methods: {
    // 现有方法保持不变
    handleLogout() {
      // 现有登出逻辑
    },
    // 新增方法：将摄像头ID传递给UploadForm组件
    getCameraId() {
      return this.cameraId;
    }
  }
}
</script>