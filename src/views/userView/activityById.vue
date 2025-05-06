<template>
  <div class="app">
    <div class="title">
      <el-row>
        <el-col :span="2">
          <el-tooltip effect="dark" content="返回活动列表" placement="top-start">
            <span @click="handlePage">志愿活动</span>
          </el-tooltip>
        </el-col>
        <el-col :span="18"></el-col>
        <el-col :span="2">
          <el-link type="warning"
                   :disabled="activeInfo.userApprovalStatus!=0&&activeInfo.userApprovalStatus!=3&&activeInfo.userApprovalStatus!=5"
                   @click="handleAdd(activeInfo)">加入活动
          </el-link>
        </el-col>
        <el-col :span="2">
          <el-link type="danger" :disabled="activeInfo.userApprovalStatus!=2"
                   @click="handleUpdate(activeInfo)">退出活动
          </el-link>
        </el-col>
      </el-row>
    </div>
    <div class="list">
      <!--基本信息-->
      <el-card shadow="never" class="info-card">
        <template #header>
          <span class="card-title">活动信息</span>
        </template>
        <el-form label-width="100px" class="info-form">
          <el-row :gutter="30">
            <el-col :span="6">
              <div class="image-container">
                <el-image style="width: 100%; height: 200px; border-radius: 8px;" :src="baseAPI+activeInfo.imgs">
                  <template #error>
                    <div class="image-placeholder">
                      暂无图片
                    </div>
                  </template>
                </el-image>
              </div>
            </el-col>
            <el-col :span="18">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="活动名称" class="form-item">
                    <span class="info-value">{{ activeInfo.activityName }}</span>
                  </el-form-item>
                  <el-form-item label="活动类型" class="form-item">
                    <div class="activity-type">
                      <dict-tag :options="sys_activity_type" :value="activeInfo.activityType"/>
                    </div>
                  </el-form-item>
                  <el-form-item label="举办组织" class="form-item">
                    <span class="info-value">{{ activeInfo.organizer }}</span>
                  </el-form-item>
                  <el-form-item label="活动人数" class="form-item">
                    <span class="info-value">{{ activeInfo.attendPeopleCount }}/{{ activeInfo.numberLimit }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="联系人" class="form-item">
                    <span class="info-value">{{ activeInfo.contacts }}</span>
                  </el-form-item>
                  <el-form-item label="联系电话" class="form-item">
                    <span class="info-value">{{ activeInfo.contactsPhone }}</span>
                  </el-form-item>
                  <el-form-item label="活动时间" class="form-item">
                    <span class="info-value">{{ parseTime(activeInfo.startTime, '{y}-{m}-{d}') }} 至 {{ parseTime(activeInfo.endTime, '{y}-{m}-{d}') }}</span>
                  </el-form-item>
                  <el-form-item label="申请状态" class="form-item">
                    <dict-tag :options="sys_examine_status" :value="activeInfo.userApprovalStatus"/>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="志愿要求" class="form-item">
                <div class="info-value">{{ activeInfo.ask }}</div>
              </el-form-item>
              <el-form-item label="活动描述" class="form-item">
                <div class="info-value description" v-html="activeInfo.describe"></div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <!--评论-->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card class="mt10">
            <!--刷新按钮-->
            <el-row :gutter="10">
              <el-col :span="20">
                <el-input v-model="form.commentContent" placeholder="请输入评论内容"
                          :disabled="activeInfo.userApprovalStatus!=2"/>
              </el-col>
              <el-col :span="2">
                <el-button type="danger" @click="addComm" :disabled="activeInfo.userApprovalStatus!=2">
                  提交
                </el-button>
              </el-col>
              <el-col :span="2">
                <el-link @click="getCommList">刷新评论</el-link>
              </el-col>
            </el-row>
            <!--评论列表-->
            <div class="mt10 text-center" v-if="total<1">暂无评论</div>
            <div class="mt10" v-else>
              <div class="anscard" v-for="item in commentList">
                <div class="name">
                  <el-avatar style="height: 40px" :src="item.avatar||defaultImg"/>
                  <div class="ml10 text-warning">{{ item.extra }}</div>
                  <div class="ml20 text-warning">{{ item.createTime }}</div>
                </div>
                <div class="ml20 comCard">
                  <div class="text-danger">@By&emsp;{{ item.extra }}:</div>
                  <div>{{ item.commentContent }}</div>
                </div>
              </div>

            </div>
            <!--分页-->
            <pagination
                :total="total"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                @pagination="getCommList"
            />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script setup>
/*获取活动列表信息*/
import {addRelation, listRelation, updateRelation} from "@/api/system/volunteerActivityRelation.js";
import useUserStore from "@/store/modules/user.js";
import {ElMessage} from "element-plus";
import {useRoute, useRouter} from "vue-router";
import defaultImg from "@/assets/images/profile.jpg";
import {addComment, listComment} from "@/api/system/comment.js";
import {getUser} from "@/api/system/user.js";
import {addRecord, checkRecord, listRecord, updateRecord} from "@/api/system/record.js";
import {parseTime} from "@/utils/dome.js";
import {getToken} from "@/utils/auth.js";

const {proxy} = getCurrentInstance();
const {
      sys_record_status,
      sys_activity_status, sys_activity_type, sys_examine_status
    } = proxy.useDict('sys_record_status',
        'sys_activity_status', 'sys_activity_type', 'sys_examine_status'
    )
;
const baseAPI = import.meta.env.VITE_APP_BASE_API

const router = useRouter()
const route = useRoute()

const userInfo = useUserStore()//用户信息
const activeInfo = ref({})//活动信息

const commentList = ref([])//评论信息
let myUser = {}
const total = ref(0)
const queryParams = ref({
  pageSize: 10,
  pageNum: 1,
})
const form = ref({
  activittyId: activeInfo.value.activityId,
  userId: userInfo.user.userId,
  commentContent: "",
  extra: ""
})

const imgUpload = {
  headers: {
    Authorization: "Bearer " + getToken()
  },
  url: import.meta.env.VITE_APP_BASE_API + "/common/upload",
}

function init() {
  getActInfo(route.params.id)
  getCommList()
  getUserInfo()
}

/*获取活动信息*/
async function getActInfo(activeId) {
  const resAct = await listRelation({userId: userInfo.user.userId, activityId: activeId})
  activeInfo.value = resAct.rows[0]
}

/*获取评论列表*/
function getCommList() {
  listComment({activittyId: route.params.id, ...queryParams.value}).then(res => {
    commentList.value = res.rows
    total.value = res.total;
  })
}

function getUserInfo() {
  getUser(userInfo.user.userId).then(response => {
    myUser = response.data;
  });
}

/*发布*/
function addComm() {
  form.value.activittyId = route.params.id
  form.value.userId = userInfo.user.userId
  form.value.extra = userInfo.user.userName
  if (form.value.commentContent.length < 1) {
    ElMessage.warning("评论信息不可以为空")
  } else {
    addComment(form.value).then(res => {
      ElMessage.success(res.msg)
      form.value.commentContent = ""
      return getCommList()
    })
  }
}

/*加入活动*/
function handleAdd(row) {
  let data = {
    activityId: row.activityId,
    userId: myUser.userId,
    volunteerId: myUser.volunteerId,
    volunteerStatus: myUser.volunteerStatus
  }
  addRelation(data).then(res => {
    ElMessage.success(res.msg)
    init()
  })
}

/*用户退出活动*/
function handleUpdate(row) {
  let data = {...row}
  data.userId = userInfo.user.userId
  data.userApprovalStatus = '4'
  updateRelation(data).then(res => {
    init()
    ElMessage.success(res.msg)
  })
}

function handlePage() {
  router.go(-1)
}


init()

</script>

<style scoped lang="scss">
.app {
  margin: 20px;
}

.title {
  background: #2d5299;
  color: #fff;
  text-align: center;
  padding: 6px;
  border-radius: 4px;
  margin-bottom: 20px;

  &:hover {
    cursor: pointer;
  }
}

.list {
  border: 3px solid #2d5299;
  padding: 20px;
  border-radius: 8px;
}

.info-card {
  margin-bottom: 20px;
  border-radius: 8px;
  
  .card-title {
    font-size: 18px;
    font-weight: bold;
    color: #2d5299;
  }
}

.info-form {
  .form-item {
    margin-bottom: 15px;
    
    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #606266;
      font-size: 16px;
    }
  }
}

.image-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.image-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 16px;
}

.info-value {
  color: #303133;
  line-height: 1.5;
  font-size: 16px;
}

.description {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  line-height: 1.6;
  font-size: 16px;
}

.anscard {
  margin: 10px 0;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.3s;
  font-size: 16px;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .name {
    display: flex;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
    font-size: 16px;
  }

  .comCard {
    padding: 10px;
    font-size: 16px;
  }
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-link) {
  font-size: 16px;
}

:deep(.el-button) {
  font-size: 16px;
}

.activity-type {
  :deep(.el-tag) {
    font-size: 16px;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 20px;
    background: #2d5299;
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(45, 82, 153, 0.3);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 100%);
      z-index: 1;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(45, 82, 153, 0.4);
    }
  }
}
</style>
