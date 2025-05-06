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
              <div class="text-center mt20">
                <el-button type="primary" @click="handleEdit">修改信息</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
        <!--导航-->
        <el-col :span="16">
          <el-row class="mt20" :gutter="20">
            <!-- 我的活动 - 大卡片布局 -->
            <el-col :span="12">
              <div class="nav_card large-card" @click="handlePage(navList[0].route)">
                <div class="card-content">
                  <div class="nav_ti">{{ navList[0].name }}</div>
                  <div class="nav_img">
                    <img src="../../assets/images/wenben.png" alt="wenben"/>
                  </div>
                </div>
              </div>
            </el-col>
            
            <!-- 我的组织 - 横向布局 -->
            <el-col :span="12">
              <div class="nav_card horizontal-card" @click="handlePage(navList[1].route)">
                <div class="nav_img">
                  <img src="../../assets/images/wenben.png" alt="wenben"/>
                </div>
                <div class="nav_ti">{{ navList[1].name }}</div>
              </div>
            </el-col>
          </el-row>

          <el-row class="mt20" :gutter="20">
            <!-- 签到通知 - 圆形布局 -->
            <el-col :span="8">
              <div class="nav_card circle-card" @click="handlePage(navList[2].route)">
                <div class="nav_img">
                  <img src="../../assets/images/wenben.png" alt="wenben"/>
                </div>
                <div class="nav_ti">{{ navList[2].name }}</div>
              </div>
            </el-col>
            
            <!-- 信息修改 - 垂直布局 -->
            <el-col :span="8">
              <div class="nav_card vertical-card" @click="handlePage(navList[3].route)">
                <div class="nav_ti">{{ navList[3].name }}</div>
                <div class="nav_img">
                  <img src="../../assets/images/wenben.png" alt="wenben"/>
                </div>
              </div>
            </el-col>
            
            <!-- 投诉反馈 - 斜角布局 -->
            <el-col :span="8">
              <div class="nav_card diagonal-card" @click="handleComplaint">
                <div class="nav_ti">投诉反馈</div>
                <div class="nav_img">
                  <img src="../../assets/images/wenben.png" alt="wenben"/>
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

    <!-- 修改个人信息对话框 -->
    <el-dialog title="修改个人信息" v-model="editOpen" width="500px" append-to-body>
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="80px">
        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model="editForm.nickName" maxlength="30" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
          <el-input v-model="editForm.phonenumber" maxlength="11" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" maxlength="50" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="editForm.sex">
            <el-radio label="0">男</el-radio>
            <el-radio label="1">女</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitEdit">确 定</el-button>
          <el-button @click="editOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Profile">
import {barList, navList} from "@/views/userView/data.js";
import {getUser, updateUserProfile} from "@/api/system/user";
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

const editOpen = ref(false);
const editForm = ref({
  nickName: '',
  phonenumber: '',
  email: '',
  sex: ''
});

const editRules = {
  nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
  email: [
    { required: true, message: "邮箱地址不能为空", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }
  ],
  phonenumber: [
    { required: true, message: "手机号码不能为空", trigger: "blur" },
    { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }
  ]
};

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

function handleEdit() {
  editForm.value = {
    nickName: state.user.nickName,
    phonenumber: state.user.phonenumber,
    email: state.user.email,
    sex: state.user.sex
  };
  editOpen.value = true;
}

function submitEdit() {
  proxy.$refs.editFormRef.validate(valid => {
    if (valid) {
      updateUserProfile(editForm.value).then(response => {
        ElMessage.success("修改成功");
        editOpen.value = false;
        getUserInfo();
      });
    }
  });
}

init()
</script>
<style lang="scss" scoped>
.app {
  margin: 20px;
}

.title {
  background: linear-gradient(135deg, #2d5299, #4a90e2);
  color: #fff;
  text-align: center;
  padding: 15px;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(45, 82, 153, 0.2);
  transition: all 0.3s ease;

  &:hover {
    cursor: pointer;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(45, 82, 153, 0.3);
  }
}

.list {
  border: none;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/*导航*/

.nav_card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  transform-style: preserve-3d;
  perspective: 1000px;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-5px) rotateX(5deg);
    box-shadow: 0 15px 30px rgba(0,0,0,0.2);
    
    &::after {
      opacity: 1;
    }
    
    .nav_img img {
      transform: translateZ(20px);
    }
  }
  
  .nav_ti {
    color: #ffffff;
    font-weight: 600;
    letter-spacing: 1px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    z-index: 1;
    transform: translateZ(10px);
  }
  
  .nav_img {
    position: relative;
    z-index: 1;
    transform-style: preserve-3d;
    
    img {
      transition: all 0.3s ease;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));
    }
  }
}

/* 大卡片布局 */
.large-card {
  height: 200px;
  background: linear-gradient(135deg, #2b2499, #4a3fdb);
  padding: 30px;
  box-shadow: 0 10px 20px rgba(43, 36, 153, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1));
    transform: translateZ(-1px);
  }
  
  .card-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transform-style: preserve-3d;
  }
  
  .nav_ti {
    font-size: 28px;
    text-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  
  .nav_img img {
    height: 100px;
    filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
  }
}

/* 横向布局 */
.horizontal-card {
  height: 200px;
  background: linear-gradient(135deg, #07b185, #0ce3a7);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 10px 20px rgba(7, 177, 133, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1));
    transform: translateZ(-1px);
  }
  
  .nav_ti {
    font-size: 24px;
    flex: 1;
    text-align: right;
    padding-right: 20px;
    text-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  
  .nav_img img {
    height: 80px;
    filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
  }
}

/* 圆形布局 */
.circle-card {
  height: 180px;
  background: linear-gradient(135deg, #fd0808, #ff4d4d);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-shadow: 0 10px 20px rgba(253, 8, 8, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(255,255,255,0.1), transparent);
    border-radius: 50%;
    transform: translateZ(-1px);
  }
  
  .nav_ti {
    font-size: 20px;
    margin-top: 15px;
    text-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  
  .nav_img img {
    height: 70px;
    filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
  }
}

/* 垂直布局 */
.vertical-card {
  height: 180px;
  background: linear-gradient(135deg, #4aa5c6, #6bc8e8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-shadow: 0 10px 20px rgba(74, 165, 198, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1));
    transform: translateZ(-1px);
  }
  
  .nav_ti {
    font-size: 20px;
    margin-bottom: 15px;
    text-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  
  .nav_img img {
    height: 70px;
    filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
  }
}

/* 斜角布局 */
.diagonal-card {
  height: 180px;
  background: linear-gradient(135deg, #551462, #7b1f8f);
  padding: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(85, 20, 98, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
    transform: rotate(45deg) translateZ(-1px);
    transition: all 0.5s ease;
  }
  
  &:hover::before {
    transform: rotate(45deg) translate(50%, 50%) translateZ(-1px);
  }
  
  .nav_ti {
    font-size: 20px;
    margin-bottom: 15px;
    text-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  
  .nav_img {
    position: absolute;
    bottom: 20px;
    right: 20px;
    
    img {
      height: 60px;
      transform: rotate(-15deg);
      filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
    }
  }
}

/* 添加动画效果 */
@keyframes float {
  0% { transform: translateY(0px) translateZ(20px); }
  50% { transform: translateY(-10px) translateZ(30px); }
  100% { transform: translateY(0px) translateZ(20px); }
}

.nav_card:hover .nav_img img {
  animation: float 2s ease-in-out infinite;
}

/* 美化个人信息卡片 */
.box-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  }
  
  :deep(.el-card__header) {
    background: linear-gradient(135deg, #2d5299, #4a90e2);
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    padding: 15px 20px;
  }
  
  .list-group-item {
    padding: 15px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: #f8f9fa;
    }
    
    &:last-child {
      border-bottom: none;
    }
    
    .pull-right {
      &.el-link {
        color: #2d5299;
        font-weight: 500;
        padding: 8px 16px;
        border-radius: 6px;
        background: linear-gradient(135deg, #f0f5ff, #e6f0ff);
        border: 1px solid #2d5299;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #2d5299, #4a90e2);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 0;
        }
        
        &:hover {
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(45, 82, 153, 0.2);
          
          &::before {
            opacity: 1;
          }
        }
        
        span {
          position: relative;
          z-index: 1;
        }
      }
    }
  }
  
  .text-center {
    margin-top: 20px;
    
    .el-button {
      padding: 12px 30px;
      font-size: 16px;
      border-radius: 8px;
      background: linear-gradient(135deg, #2d5299, #4a90e2);
      border: none;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(45, 82, 153, 0.3);
      }
    }
  }
}
</style>
