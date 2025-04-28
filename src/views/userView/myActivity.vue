<template>
  <div class="app">
    <!--我的活动-->
    <div class="title mt10" @click="handlePage">我的活动</div>
    <div class="list">
      <el-button class="mb10" type="danger" size="small" @click="getactList">刷新数据</el-button>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-table v-loading="loading" :data="activityList">
            <el-table-column label="编号" align="center" prop="activityId" width="60"/>
            <el-table-column label="活动名称" align="center" prop="activityName"/>
            <el-table-column label="举办组织" align="center" prop="organizer"/>
            <el-table-column label="联系人" align="center" prop="contacts"/>
            <el-table-column label="联系电话" align="center" prop="contactsPhone"/>
            <el-table-column label="活动人数" align="center" prop="numberLimit">
              <template #default="scope">
                <span>{{ scope.row.attendPeopleCount }}/{{ scope.row.numberLimit }}</span>
              </template>
            </el-table-column>
            <el-table-column label="活动时间" align="center" width="180">
              <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}至{{
              parseTime(scope.row.endTime, '{y}-{m}-{d}')
            }}</span>
              </template>
            </el-table-column>
            <el-table-column label="活动状态" align="center" prop="status">
              <template #default="scope">
                <dict-tag :options="sys_examine_status" :value="scope.row.userApprovalStatus"/>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
              <template #default="scope">
                <el-link @click="()=>{router.push('/userIndex/activity/'+scope.row.activityId)}">详情
                </el-link>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getactList"
      />
    </div>
  </div>
</template>

<script setup>
import {listRelation} from "@/api/system/volunteerActivityRelation.js";
import useUserStore from "@/store/modules/user.js";
import {useRouter} from "vue-router";

const {proxy} = getCurrentInstance();
const {
  sys_user_sex,
  sys_activity_status,
  sys_activity_type, sys_examine_status
} = proxy.useDict("sys_user_sex", "sys_activity_status", 'sys_activity_type', 'sys_examine_status');

const router = useRouter()
const userInfoData = useUserStore()
const activityList = ref([])
const loading = ref(false)
const queryParams = ref({
  userId: userInfoData.user.userId,
  isPerson: 'isPerson',
  pageSize: 10,
  pageNum: 1,
})
const total = ref(0)

function getactList() {
  loading.value = true
  listRelation(queryParams.value).then(response => {
    activityList.value = response.rows;
    total.value = response.total;
    loading.value = false
  });
}

function handlePage() {
  router.push('/userIndex/profile')
}

getactList()
</script>

<style scoped lang="scss">
.app {
  margin: 20px;
}

.title {
  background: #2d5299;
  color: #fff;
  text-align: center;
  padding: 10px;

  &:hover {
    cursor: pointer;
  }
}


.list {
  border: 3px solid #2d5299;
  padding: 10px;
}
</style>
