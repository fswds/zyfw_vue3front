<template>
  <div class="app">
    <!--轮播图-->
    <div class="ml10 mr10 mb10 mt10">
      <vol-swiper></vol-swiper>
    </div>
    <div class="title" @click="getMesgList">留言板</div>

    <!--刷新按钮-->
    <el-row class="mt20 mb20" :gutter="10">
      <el-col :span="20">
        <el-input v-model="form.conent" placeholder="请输入留言内容"></el-input>
      </el-col>
      <el-col :span="2">
        <el-button type="danger" @click="addComm">提交</el-button>
      </el-col>
      <el-col :span="2">
        <el-link type="primary" @click="getMesgList">刷新评论</el-link>
      </el-col>
    </el-row>

    <div v-if="total<1" class="no-list">暂无数据</div>
    <div v-else class="list">
      <!--活动信息-->
      <el-card class="card" shadow="never">
        <!--评论列表-->
        <div class="mt10 text-center" v-if="total<1">暂无评论</div>
        <div class="mt10" v-else>
          <el-collapse>
            <el-collapse-item v-for="item in messageList" :name="item.id">
              <template #title>
                <span class="ml10 text-info">{{ item.conent }}</span>
              </template>
              <div class="ml20 comCard">
                <div v-if="item.answer">{{ item.answer }}</div>
                <div v-else style="color: #aaaaaa">暂无回复</div>
                <div class="text-info">{{ item.createTime }}</div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        <!--分页-->
        <pagination
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="getMesgList"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup name="Comment">
import {useRoute} from "vue-router";
import {ElMessage} from "element-plus";
import useUserStore from "@/store/modules/user.js";
import {addMessage, listMessage} from "@/api/system/message.js";
import VolSwiper from "@/views/userView/compoents/volSwiper.vue";

const {proxy} = getCurrentInstance();

const route = useRoute()

const {
  sys_activity_status,
  sys_activity_type,
  sys_examine_status
} = proxy.useDict('sys_activity_status', 'sys_activity_type', 'sys_examine_status');


const userInfo = useUserStore()
const messageList = ref([])
const total = ref(0)

const form = ref({
  pageNum: 1,
  pageSize: 10,
  userId: null,
  conent: null,
  status: null,
  answer: null,
  extra: null,
})

const queryParams = ref({
  pageSize: 10,
  pageNum: 1,
})

function init() {
  getMesgList()
}


/*获取评论列表*/
function getMesgList() {
  listMessage(queryParams.value).then(response => {
    messageList.value = response.rows;
    total.value = response.total;
  });
}

/*发布*/
function addComm() {
  console.log("111", form.value)
  form.value.userId = userInfo.user.userId
  if (form.value.conent.length < 1) {
    ElMessage.warning("评论信息不可以为空")
  } else {
    addMessage(form.value).then(res => {
      ElMessage.success(res.msg)
      form.value.conent = ""
      return getMesgList()
    })
  }
}

init();
</script>
<style scoped lang="scss">
.app {
  margin: 20px;
}

.title {
  background: #409eff;
  color: #fff;
  text-align: center;
  padding: 10px;

  &:hover {
    cursor: pointer;
  }
}

.no-list {
  height: 260px;
  line-height: 260px;
  text-align: center;
  color: #aaaaaa;
  font-size: 20px;
  border: 3px solid #409eff;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.list {
  border: 3px solid #409eff;
  padding: 10px;
}

:deep(.el-form-item) {
  margin-bottom: 0 !important;
}

.comCard {
  border: 1px solid #eeeeee;
  padding: 10px 20px;
  border-radius: 8px;
}
</style>