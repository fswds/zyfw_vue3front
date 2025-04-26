<template>
  <div class="app-container">
      <el-row :gutter="20">
        <el-col :span="12" :xs="24">
          <div ref="main" style="width: 100%; height: 400px"></div>
        </el-col>
        <el-col :span="12" :xs="24">
          <div ref="main2" style="width: 100%; height: 400px"></div>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24" :xs="24">
          <div ref="main3" style="width: 100%; height: 400px"></div>
        </el-col>
      </el-row>
  </div>
    
</template>
<script lang="js" setup>
import { ref, onMounted } from "vue";
import {listOrganization,activityList,activityType} from "@/api/system/echarts";
import * as echarts from "echarts";
const main = ref(); // 使用ref创建虚拟DOM引用，使用时用main.value
const main2 = ref(); 
const main3 = ref();
onMounted(() => {
  getOranization();
  getActivityType();
  getActivityList();
});
function getOranization() {

  listOrganization().then(response => {
  const schoolData = response.data;
    // 基于准备好的dom，初始化echarts实例
  const myChart = echarts.init(main.value);
  // 指定图表的配置项和数据
  const option = {
    title: {
      text: '志愿组织',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '<br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: []
    },
    series: [
      {
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: [{ value: 335, name: '' }]
      }
    ]
  };
// 赋值
  option.series = [
  {
    type: 'pie',
    radius: '55%',
    center: ['50%', '60%'],
    // data: res.data.map((v) => {
    //   return { name: v.name, value: v.value }
    // })
    data: schoolData,
  }
]
// 赋值
// option.legend = [
//   {
//    data: schoolData.map((a) => a.name)
//   }
// ]
// 赋值
option.legend.data = schoolData.map((a) => a.name)
 
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
  });
}

function getActivityType() {

  activityType().then(response => {
  const schoolData = response.data;
  // 基于准备好的dom，初始化echarts实例
  const myChart = echarts.init(main2.value);
  // 指定图表的配置项和数据
  const option = {
    title: {
      text: '活动类型',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '<br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: []
    },
    series: [
      {
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: [{ value: 335, name: '' }]
      }
    ]
  };
// 赋值
  option.series = [
  {
    type: 'pie',
    radius: '55%',
    center: ['50%', '60%'],
    // data: res.data.map((v) => {
    //   return { name: v.name, value: v.value }
    // })
    data: schoolData,
  }
]
// 赋值
// option.legend = [
//   {
//    data: schoolData.map((a) => a.name)
//   }
// ]
// 赋值
option.legend.data = schoolData.map((a) => a.name)
 
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
});
}

function getActivityList() {
  activityList().then(response => {
    let dataNames = [];
    let dataValues= [];
   for(let i = 0;i< response.data.length;i++){
      dataNames[i] = response.data[i].name;
      dataValues[i] =  response.data[i].attendPeopleCount;
   }
    // 基于准备好的dom，初始化echarts实例
    const myChart = echarts.init(main3.value);
  const option = {
    title: {
      text: '活动人数分布',
      left: 'center'
    },
    color: ['#3398DB'],
    tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: [
        {
            type: 'category',
            data: dataNames,
            axisTick: {
                alignWithLabel: true
            }
        }
    ],
    yAxis: [
        {
            type: 'value'
        }
    ],
    series: [
        {
            name: '直接访问',
            type: 'bar',
            barWidth: '60%',
            data: dataValues
        }
    ]
};
  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);
  }); 
}
</script>
