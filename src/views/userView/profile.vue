<template>
  <div class="app">
    <!--个人中心-->
    <div class="title" @click="getUserInfo">个人中心</div>
    <div class="list">
      <el-row :gutter="20">
        <!--用户信息-->
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
        <!--导航-->
        <el-col :span="16">
          <el-row class="mt20" :gutter="20">
            <el-col :span="8">
              <div class="nav_card" @click="handlePage(navList[0].route)"
                   style="background-color: #2b2499;box-shadow: 3px 3px 8px 0 rgba(9,6,9,0.6);">
                <div class="nav_ti">{{ navList[0].name }}</div>
                <div class="nav_img">
                  <img style="height: 60px" src="../../assets/images/wenben.png" alt="wenben"/>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="nav_card" @click="handlePage(navList[1].route)"
                   style="background-color: #07b185;box-shadow: 3px 3px 8px 0 rgb(22,26,27);">
                <div class="nav_ti">{{ navList[1].name }}</div>
                <div class="nav_img">
                  <img style="height: 60px" src="../../assets/images/wenben.png" alt="wenben"/>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="nav_card" @click="handlePage(navList[2].route)"
                   style="background-color: #fd0808; box-shadow: 3px 3px 8px 0 rgb(13,21,14);">
                <div class="nav_ti">{{ navList[2].name }}</div>
                <div class="nav_img">
                  <img style="height: 60px" src="../../assets/images/wenben.png" alt="wenben"/>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-row class="mt20" :gutter="20">
            <el-col :span="8">
              <div class="nav_card" @click="handlePage(navList[3].route)"
                   style="background-color: #4aa5c6;box-shadow: 3px 3px 8px 0 rgb(12,11,7);">
                <div class="nav_ti">{{ navList[3].name }}</div>
                <div class="nav_img">
                  <img style="height: 60px" src="../../assets/images/wenben.png" alt="wenben"/>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="nav_card" @click="handleComplaint"
                   style="background-color: #fd0808;box-shadow: 3px 3px 8px 0 rgb(12,11,7);">
                <div class="nav_ti">投诉反馈</div>
                <div class="nav_img">
                  <img style="height: 60px" src="../../assets/images/wenben.png" alt="wenben"/>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>

    <!-- 投诉反馈弹窗 -->
    <el-dialog title="投诉反馈" v-model="open" width="500px" append-to-body>
      <el-form :model="form" label-width="80px">
        <el-form-item label="投诉人" prop="volunteerId">
          <el-select
            v-model="form.volunteerId"
            placeholder="请选择投诉人"
            style="width: 100%"
            disabled
          >
            <el-option
              :label="state.user.userName"
              :value="userInfoData.user.volunteerId"
            >
              <span>{{ state.user.userName }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="投诉内容" prop="complaintContent">
          <el-input
            v-model="form.complaintContent"
            type="textarea"
            placeholder="请输入投诉内容"
            :rows="4"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitComplaint">提 交</el-button>
          <el-button @click="open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Profile">
import {barList, navList} from "@/views/userView/data.js";
import {getUser} from "@/api/system/user";
import UserAvatar from "@/views/system/user/profile/userAvatar.vue";
import useUserStore from "@/store/modules/user.js";
import {addVolunteer} from "@/api/system/volunteer.js";
import {addComplaints} from "@/api/system/complaints.js";
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";

const {proxy} = getCurrentInstance();
const {
  sys_user_sex,
  sys_activity_status,
  sys_activity_type, sys_examine_status
} = proxy.useDict("sys_user_sex", "sys_activity_status", 'sys_activity_type', 'sys_examine_status');
const router = useRouter();
const userInfoData = useUserStore()
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
const open = ref(false);
const form = ref({
  volunteerId: userInfoData.user.volunteerId,
  complaintContent: ''
});

function init() {
  getUserInfo()
}

function handlePage(url) {
  router.push(url)
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

function handleComplaint() {
  form.value = {
    volunteerId: userInfoData.user.volunteerId,
    complaintContent: ''
  };
  open.value = true;
}

function submitComplaint() {
  if (!form.value.complaintContent) {
    ElMessage.warning('请输入投诉内容');
    return;
  }
  addComplaints(form.value).then(response => {
    ElMessage.success('提交成功');
    open.value = false;
  });
}

init()
</script>
<style lang="scss" scoped>
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
  border: 3px solid #409eff;
  padding: 10px;
}

/*导航*/

.nav_card {
  display: flex;
  height: 100px;
  justify-content: space-around;
  align-items: center;
  padding: 10px 30px;
  border-radius: 8px;

  cursor: pointer;

  .nav_ti {
    color: #ffffff;
    font-size: 22px;
    font-weight: bold;
  }

  .nav_img {

  }
}
</style>
