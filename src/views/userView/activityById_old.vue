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
      <el-card shadow="never">
        <template #header>
          <span>活动信息</span>
        </template>
        <el-form label-width="68px">
          <el-row :gutter="20">
            <el-col :span="4">
              <el-image style="width: 100%;height: 100%" :src="baseAPI+activeInfo.imgs">
                <template #error>
                  <div style="text-align: center;color: #aaaaaa;">
                    暂无图片
                  </div>
                </template>
              </el-image>
            </el-col>
            <el-col :span="6">
              <el-form-item label="活动编号">
                {{ activeInfo.activityId }}
              </el-form-item>
              <el-form-item label="活动名称">
                {{ activeInfo.activityName }}
              </el-form-item>
              <el-form-item label="活动类型">
                <dict-tag :options="sys_activity_type" :value="activeInfo.activityType"/>
              </el-form-item>
              <el-form-item label="活动人数">
                {{ activeInfo.attendPeopleCount }}/{{ activeInfo.numberLimit }}
              </el-form-item>
              <el-form-item label="志愿要求">
                {{ activeInfo.ask }}
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="举办组织">
                {{ activeInfo.organizer }}
              </el-form-item>

              <el-form-item label="联系人">
                {{ activeInfo.contacts }}
              </el-form-item>
              <el-form-item label="联系电话">
                {{ activeInfo.contactsPhone }}
              </el-form-item>

              <el-form-item label="活动时间">
                {{ parseTime(activeInfo.startTime, '{y}-{m}-{d}') }}至{{
                  parseTime(activeInfo.endTime, '{y}-{m}-{d}')
                }}
              </el-form-item>
              <el-form-item label="申请状态">
                <dict-tag :options="sys_examine_status" :value="activeInfo.userApprovalStatus"/>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="描述">
                <!--                {{ activeInfo.describe }}-->
                <div v-html="activeInfo.describe"></div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <!--评论&签到-->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="mt10">
            <!--刷新按钮-->
            <el-row :gutter="10">
              <el-col :span="16">
                <el-input v-model="form.commentContent" placeholder="请输入评论内容"
                          :disabled="activeInfo.userApprovalStatus!=2"/>
              </el-col>
              <el-col :span="4">
                <el-button type="danger" @click="addComm" :disabled="activeInfo.userApprovalStatus!=2">
                  提交
                </el-button>
              </el-col>
              <el-col :span="4">
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

        <el-col :span="12">
          <el-card class="mt10">
            <div slot="header" class="clearfix">
              <el-button type="danger" @click="handleRecUpdate">今日签到</el-button>
            </div>
            <!--搜索-->
            <el-form class="mt10 mb10" :model="recQParams" ref="recQueryRef" :inline="true" label-width="68px">
              <el-form-item label="签到时间" prop="signDate">
                <el-date-picker clearable
                                v-model="recQParams.signDate"
                                type="date"
                                value-format="YYYY-MM-DD"
                                placeholder="请选择签到时间">
                </el-date-picker>
              </el-form-item>

              <el-form-item class="mt5" label="审批状态" prop="status">
                <el-select v-model="recQParams.examineStatus" placeholder="请选择审批状态" clearable
                           style="width: 220px">
                  <el-option
                      v-for="dict in sys_record_status"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleRecQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetRecQuery">重置</el-button>
              </el-form-item>
            </el-form>
            <!--列表-->
            <el-table :data="recordList">
              <el-table-column label="签到编号" align="center" prop="id"/>
              <el-table-column label="用户账号" align="center" prop="userName"/>
              <el-table-column label="签到时间 " align="center" prop="signDate" width="180">
                <template #default="scope">
                  <span>{{ parseTime(scope.row.signDate, '{y}-{m}-{d}') }}</span>
                </template>
              </el-table-column>
              <el-table-column label="审核状态" align="center" prop="examineStatus">
                <template #default="scope">
                  <dict-tag :options="sys_record_status" :value="scope.row.examineStatus"/>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                  <el-button link type="primary" icon="Edit" @click="handleRecUpdate('edit',scope.row)"
                             :disabled="scope.row.examineStatus=='1'"
                             v-hasPermi="['system:record:edit']">修改
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <pagination
                v-show="recTotal>0"
                :total="recTotal"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                @pagination="getRecList"
            />
          </el-card>
        </el-col>
      </el-row>
    </div>
    <!--签到弹出层-->
    <el-dialog title="签到信息" v-model="recOpen" width="500px" append-to-body>
      <el-form label-width="80px">
        <el-form-item label="活动编号">
          {{ activeInfo.activityId }}
        </el-form-item>
        <el-form-item label="活动名称">
          {{ activeInfo.activityName }}
        </el-form-item>
        <el-form-item label="活动类型">
          <dict-tag :options="sys_activity_type" :value="activeInfo.activityType"/>
        </el-form-item>
        <el-form-item label="活动人数">
          {{ activeInfo.attendPeopleCount }}/{{ activeInfo.numberLimit }}
        </el-form-item>
        <el-form-item label="举办组织">
          {{ activeInfo.organizer }}
        </el-form-item>
        <el-form-item label="联系人">
          {{ activeInfo.contacts }}
        </el-form-item>
        <el-form-item label="联系电话">
          {{ activeInfo.contactsPhone }}
        </el-form-item>
        <el-form-item label="活动时间">
          {{ parseTime(activeInfo.startTime, '{y}-{m}-{d}') }}至{{
            parseTime(activeInfo.endTime, '{y}-{m}-{d}')
          }}
        </el-form-item>
      </el-form>

      <el-form ref="recordRef" :model="recForm" label-width="80px">

        <el-form-item label="上传图片" prop="imgs">
          <el-upload
              :action="imgUpload.url"
              :headers="imgUpload.headers"
              list-type="picture-card"
              :limit="1"
              :on-success="handlePicSuccess"
              :on-remove="handlePicRmove"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="图片预览">
          <el-image v-if="recForm.examineImg" style="height: 120px" :src="baseAPI+recForm.examineImg"></el-image>
          <div v-else>暂无预览</div>
        </el-form-item>

        <el-form-item label="备注" prop="extra">
          <el-input v-model="recForm.extra" type="textarea" placeholder="请输入内容"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="subRecForm">提交信息</el-button>
          <el-button @click="cancelRec">取 消</el-button>
        </div>
      </template>
    </el-dialog>
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


const recTotal = ref(0)
const recOpen = ref(false)
const recordList = ref([])//签到记录
const recQParams = ref({
  pageSize: 10,
  pageNum: 1,
  activityId: route.params.id,
  userId: userInfo.user.userId,
  signDate: null,
  examineStatus: null,
})
const recForm = ref({
  activityId: activeInfo.value.activityId,
  userId: userInfo.user.userId,
  examineImg: "",
  extra: "",
  examineStatus: '0'
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
  getRecList()
}

/*获取活动信息*/
async function getActInfo(activeId) {
  const resAct = await listRelation({userId: userInfo.user.userId, activityId: activeId})
  activeInfo.value = resAct.rows[0]
}

function getRecList() {
  recQParams.value.activityId = route.params.id
  listRecord(recQParams.value).then(response => {
    recordList.value = response.rows;
    recTotal.value = response.total;
  });
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
  console.log(row)
  console.log(myUser)
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

/*part:签到相关*/
/** 搜索按钮操作 */
function handleRecQuery() {
  recQParams.value.pageNum = 1;
  getRecList();
}

/** 重置按钮操作 */
function resetRecQuery() {
  proxy.resetForm("recQueryRef");
  handleRecQuery();
}

function handleRecUpdate(type, row) {
  const data = {
    activityId: route.params.id,
    userId: userInfo.user.userId,
    userName: userInfo.user.userName
  }
  if (type === 'edit') {
    recOpen.value = true
    recForm.value = {...row}
  } else {
    checkRecord(data).then(res => {
      recOpen.value = true
    })
  }
}

function subRecForm() {
  recForm.value.activityId = route.params.id
  if (recForm.value.id != null) {
    recForm.value.examineStatus = '0'
    updateRecord(recForm.value).then(response => {
      proxy.$modal.msgSuccess("修改成功");
      recOpen.value = false;
      getRecList();
    });
  } else {
    addRecord(recForm.value).then(response => {
      proxy.$modal.msgSuccess("签到信息已提交");
      recOpen.value = false;
      getRecList();
    });
  }
}

function cancelRec() {
  recForm.value = {
    activittyId: activeInfo.value.activityId,
    userId: userInfo.user.userId,
    examineImg: "",
    extra: "",
    examineStatus: '0'
  };
  proxy.resetForm("recordRef");

  recOpen.value = false
}

function handlePicSuccess(res, file) {
  recForm.value.examineImg = res.fileName;
}

function handlePicRmove() {
  recForm.value.examineImg = ""
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

  &:hover {
    cursor: pointer;
  }
}


.list {
  border: 3px solid #2d5299;
  padding: 10px;
}

.anscard {
  margin: 3px 0;
  padding: 10px 6px;
  border: 1px solid #eeeeee;

  &:hover {
    box-shadow: 0px 12px 32px 4px rgba(0, 0, 0, .04), 0px 8px 20px rgba(0, 0, 0, .08);
  }

  .name {
    display: flex;
    align-items: center;
    padding-bottom: 6px;
    border-bottom: 1px solid #eeeeee;
  }

  .comCard {
    padding: 6px;
  }
}

:deep(.el-form-item) {
  margin-bottom: 0;
}
</style>
