<template>
  <div class="app">
    <!--我的活动-->
    <div class="title mt10" @click="getactList">我的活动</div>
    <div class="list">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-table :data="activityList">
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
    <!--个人中心-->
    <div class="title" @click="getUserInfo">个人中心</div>
    <div class="list">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="box-card">
            <template v-slot:header>
              <div class="clearfix">
                <el-tooltip content="点击刷新">
                  <span @click="getUserInfo">个人信息</span>
                </el-tooltip>
              </div>
            </template>
            <div>
              <div class="text-center">
                <userAvatar/>
              </div>
              <ul class="list-group list-group-striped">
                <li class="list-group-item">
                  用户名称
                  <div class="pull-right">{{ state.user.userName }}</div>
                </li>
                <li class="list-group-item">
                  手机号码
                  <div class="pull-right">{{ state.user.phonenumber }}</div>
                </li>
                <li class="list-group-item">
                  用户邮箱
                  <div class="pull-right">{{ state.user.email }}</div>
                </li>
                <li class="list-group-item">
                  创建日期
                  <div class="pull-right">{{ state.user.createTime }}</div>
                </li>
                <li class="list-group-item">
                  志愿者状态
                  <dict-tag v-if="state.user.volunteerStatus" style="float: right" :options="sys_activity_status"
                            :value="state.user.volunteerStatus"/>
                  <el-link v-else class="pull-right" @click="handleAdd">加入志愿者</el-link>
                </li>
                <li class="list-group-item">
                  志愿积分
                  <div class="pull-right">{{ state.user.activityScore }}</div>
                </li>
              </ul>
            </div>
          </el-card>
        </el-col>
        <el-col :span="16">
          <el-card>
            <template v-slot:header>
              <div class="clearfix">
                <span>基本资料</span>
              </div>
            </template>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="基本资料" name="userinfo">
                <userInfo :user="state.user"/>
              </el-tab-pane>
              <el-tab-pane label="修改密码" name="resetPwd">
                <resetPwd/>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup name="Profile">
import userInfo from "@/views/system/user/profile/userInfo";
import resetPwd from "@/views/system/user/profile/resetPwd";
import {getUser} from "@/api/system/user";
import UserAvatar from "@/views/system/user/profile/userAvatar.vue";
import useUserStore from "@/store/modules/user.js";
import {listRelation} from "@/api/system/volunteerActivityRelation.js";
import {addVolunteer} from "@/api/system/volunteer.js";
import {ElMessage} from "element-plus";

const {proxy} = getCurrentInstance();
const {
  sys_user_sex,
  sys_activity_status,
  sys_activity_type, sys_examine_status
} = proxy.useDict("sys_user_sex", "sys_activity_status", 'sys_activity_type', 'sys_examine_status');

const userInfoData = useUserStore()
const activityList = ref([])

const activeTab = ref("userinfo");
const state = reactive({
  user: {},
});
const queryParams = ref({
  userId: userInfoData.user.userId,
  userApprovalStatus: '2',
    pageSize: 10,
    pageNum: 1,
})
const total = ref(0)
// const queryParams = ref({
//     pageSize: 10,
//     pageNum: 1,
// })

function init() {
  getactList()
  getUserInfo()
}

function getactList() {
  listRelation(queryParams.value).then(response => {
    activityList.value = response.rows;
      total.value = response.total;
  });
}

function getUserInfo() {
  getUser(userInfoData.user.userId).then(response => {
    console.log(response)
    state.user = response.data;
  });
}

/*加入活动*/
function handleAdd() {
  let data = {
    userId: state.user.userId,
    name: state.user.userName,
    sex: state.user.sex,
    contactPhone: state.user.phonenumber
  }
  addVolunteer(data).then(res => {
    ElMessage.success(res.msg)
    getUserInfo()
  })
}

init()
</script>
<style lang="scss" scoped>
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


.list {
  border: 3px solid #409eff;
  padding: 10px;
}
</style>
