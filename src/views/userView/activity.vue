<template>
  <div class="app">
    <div class="ml10 mr10 mb10 mt10">
      <vol-swiper></vol-swiper>
    </div>
    <div class="title" @click="getActList">志愿活动</div>
    <div v-if="total<1" class="no-list">暂无数据</div>
    <div v-else class="list">
      <div class="card-list">
        <!--卡片-->
        <el-card class="card" v-for="item in activityList" shadow="never">
          <template #header>{{ item.activityName }}</template>
          <el-image style="width: 100%;height: 120px" :src="baseAPI+item.imgs">
            <template #error>
              <div style="text-align: center;color: #aaaaaa;">
                暂无图片
              </div>
            </template>
          </el-image>
          <el-form>
            <el-form-item label="举办组织">
              {{ item.organizer }}
            </el-form-item>
            <el-form-item label="活动类型">
              <dict-tag :options="sys_activity_type" :value="item.activityType"/>
            </el-form-item>
            <el-form-item label="联系人">
              {{ item.contacts }}
            </el-form-item>
            <el-form-item label="联系电话">
              {{ item.contactsPhone }}
            </el-form-item>
            <el-form-item label="活动人数">
              {{ item.attendPeopleCount }}/{{ item.numberLimit }}
            </el-form-item>
            <el-form-item label="活动时间">
              {{ parseTime(item.startTime, '{y}-{m}-{d}') }}至{{
                parseTime(item.endTime, '{y}-{m}-{d}')
              }}
            </el-form-item>
            <el-form-item label="状态">
              <dict-tag :options="sys_examine_status" :value="item.userApprovalStatus"/>
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="btns">
              <el-link type="primary" :underline="false" @click="handlePage(item)">详情
              </el-link>
            </div>
          </template>
        </el-card>
      </div>
      <!--分页-->
      <pagination
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getActList"
      />
    </div>
  </div>

</template>
<script setup>
/*获取活动列表信息*/
import {listRelation} from "@/api/system/volunteerActivityRelation.js";
import useUserStore from "@/store/modules/user.js";
import {useRouter} from "vue-router";
import VolSwiper from "@/views/userView/compoents/volSwiper.vue";

const {proxy} = getCurrentInstance();
const {
  sys_activity_status, sys_activity_type, sys_examine_status
} = proxy.useDict('sys_activity_status', 'sys_activity_type', 'sys_examine_status');
const baseAPI = import.meta.env.VITE_APP_BASE_API

const router = useRouter()
const userInfo = useUserStore()
const total = ref(0)
const activityList = ref([])
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  userId: userInfo.user.userId,
  userApprovalStatus: null,
  activityName: null,
  organizer: null,
  activityType: null,
})

function init() {
  getActList()
}

function getActList() {
  queryParams.value.userId = userInfo.user.userId
  listRelation(queryParams.value).then(response => {
    activityList.value = response.rows;
    total.value = response.total;
  });
}

function handlePage(item) {
  router.push(`/userIndex/activity/${item.activityId}`)
}

init()

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

.card-list {
  display: flex;
  flex-wrap: wrap;
}

.card {
  width: 280px;
  margin: 10px 5px;

  .btns {
    display: flex;
    justify-content: space-around;
  }
}

:deep(.el-form-item) {
  margin-bottom: 0;
}
</style>