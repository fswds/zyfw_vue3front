<template>
  <div class="app">
    <!--我的活动-->
    <div class="title mt10" @click="handlePage">签到通知</div>
    <div class="list">
      <el-button class="mb10" type="danger" size="small" @click="getList">刷新数据</el-button>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-table v-loading="loading" :data="recordList">
            <el-table-column label="活动名称" align="center" prop="activityName"/>
            <el-table-column label="签到标题" align="center" prop="noticeTitle"/>
            <el-table-column label="签到积分" align="center" prop="signScore"/>
            <el-table-column label="签到开始时间" align="center" prop="startDate" width="180">
              <template #default="scope">
                <span>{{ parseTime(scope.row.startDate, '{y}-{m}-{d}') }}</span>
              </template>
            </el-table-column>
            <el-table-column label="签到结束时间" align="center" prop="endDate" width="180">
              <template #default="scope">
                <span>{{ parseTime(scope.row.endDate, '{y}-{m}-{d}') }}</span>
              </template>
            </el-table-column>

            <el-table-column label="管理" align="center" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-button link type="primary" @click="handleView(scope.row)"
                >详情
                </el-button>
                <el-button link type="primary" @click="handleMySign(scope.row)"
                >签到
                </el-button>
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
          @pagination="getList"
      />
    </div>
    <!--信息弹出层-->
    <el-dialog title="签到信息" v-model="recOpen" width="700px" append-to-body>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-divider>签到详情</el-divider>
          <el-form>
            <el-form-item label="活动名称">
              {{ recSignView.activityName }}
            </el-form-item>
            <el-form-item label="签到标题">
              {{ recSignView.noticeTitle }}
            </el-form-item>
            <el-form-item label="签到内容">
              <div v-html="recSignView.noticeContent"></div>
            </el-form-item>
            <el-form-item label="签到积分">
              {{ recSignView.signScore }}
            </el-form-item>
            <el-form-item label="签到时间">
              {{ parseTime(recSignView.startDate, '{y}-{m}-{d}') }}
              至{{ parseTime(recSignView.endDate, '{y}-{m}-{d}') }}
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <el-divider>我的签到</el-divider>
          <el-form v-if="recView" label-width="80px">
            <el-form-item label="签到图片">
              <el-image v-if="recView.examineImg" style="height: 120px" :src="baseAPI+recView.examineImg"></el-image>
              <div v-else>暂无预览</div>
            </el-form-item>
            <el-form-item label="备注信息">
              {{ recView.extra }}
            </el-form-item>
            <el-form-item label="签到审批">
              <dict-tag :options="sys_record_status" :value="recView.examineStatus"/>
            </el-form-item>
          </el-form>
          <div v-else style="text-align: center;color: #C03639">暂无签到数据，请及时签到</div>
        </el-col>
      </el-row>
    </el-dialog>
    <!--签到弹出层-->
    <el-dialog v-if="myOpen" title="我的签到" v-model="myOpen" width="600px" append-to-body>
      <el-form ref="recordRef" :model="myForm" label-width="80px" :append-to-body="true">

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
        <el-form-item label="签到图片">
          <el-image v-if="myForm.examineImg" style="height: 120px" :src="baseAPI+myForm.examineImg"></el-image>
          <div v-else>暂无预览</div>
        </el-form-item>

        <el-form-item label="备注信息" prop="extra">
          <el-input v-model="myForm.extra" type="textarea" placeholder="请输入内容"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="subMyForm">提交信息</el-button>
          <el-button @click="cancelMy">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import useUserStore from "@/store/modules/user.js";
import {useRoute, useRouter} from "vue-router";
import {listsignNotice} from "../../api/system/signNotice.js";
import {getToken} from "../../utils/auth.js";
import {parseTime} from "../../utils/dome.js";
import {addRecord, listRecord, updateRecord} from "../../api/system/record.js";
import {ElMessage} from "element-plus";

const {proxy} = getCurrentInstance();
const {
  sys_record_status,
  sys_user_sex,
  sys_activity_status,
  sys_activity_type, sys_examine_status
} = proxy.useDict("sys_record_status", "sys_user_sex", "sys_activity_status", 'sys_activity_type', 'sys_examine_status');

const router = useRouter()
const route = useRoute()
const userInfoData = useUserStore()
const loading = ref(false)
const recordList = ref([])//签到记录

const total = ref(0)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  activityId: route.params.id,
  noticeTitle: null,
  userName: null,
  userId: userInfoData.user.userId
})

const baseAPI = import.meta.env.VITE_APP_BASE_API
/*详情相关*/
const recOpen = ref(false)

const recView = ref({})
const recSignView = ref({})
/*签到相关*/
const myForm = ref({
  activityId: recSignView.value.activityId,
  signNoticeId: recSignView.value.noticeId,
  userId: userInfoData.user.userId,
  examineImg: "",
  extra: "",
  examineStatus: '0'
})
const myOpen = ref(false)
const imgUpload = {
  headers: {
    Authorization: "Bearer " + getToken()
  },
  url: import.meta.env.VITE_APP_BASE_API + "/common/upload",
}

function getList() {
  loading.value = true;
  listsignNotice(queryParams.value).then(response => {
    recordList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 详情预览
function handleView(row) {
  resetView()
  recSignView.value = row
  //获取提交信息
  const data = {
    activityId: row.activityId,
    signNoticeId: row.noticeId,
    userId: userInfoData.user.userId,
  }
  listRecord(data).then(response => {
    recView.value = response.rows[0];
  });
  recOpen.value = true
}

function resetView() {
  recView.value = {}
  recSignView.value = {}
}

/*签到相关*/
function handleMySign(row) {
  const data = {
    activityId: row.activityId,
    signNoticeId: row.noticeId,
    userId: userInfoData.user.userId,
  }
  listRecord(data).then(response => {
    if (response.rows && response.rows[0] && response.rows[0].examineStatus == '1') {
      //审核通过
      return ElMessage.success("当前通知【已完成签到】且【审核通过】")
    } else if (response.rows && response.rows[0] && response.rows[0].examineStatus != '1') {
      //审核中或者审核不通过
      console.log(response.rows[0])
      myForm.value = response.rows[0]
      myForm.value.examineStatus = '0'
      myOpen.value = true
    } else {
      //未创建
      myForm.value.activityId = row.activityId
      myForm.value.signNoticeId = row.noticeId
      myForm.value.userId = userInfoData.user.userId
      myForm.value.examineStatus = '0'
      myOpen.value = true
    }
  });
}

function subMyForm() {
  console.log("myForm.value")
  console.log(myForm.value)
  if (myForm.value.id) {
    updateRecord(myForm.value).then(res => {
      proxy.$modal.msgSuccess("签到信息已修改,等待审核");
      cancelMy()
    })
  } else {
    addRecord(myForm.value).then(response => {
      proxy.$modal.msgSuccess("签到信息已提交,等待审核");
      cancelMy()
    });
  }
}

function cancelMy() {
  myForm.value = {
    activityId: "",
    signNoticeId: "",
    userId: userInfoData.user.userId,
    examineImg: "",
    extra: "",
    examineStatus: '0'
  };

  myOpen.value = false
}

function handlePicSuccess(res, file) {
  myForm.value.examineImg = res.fileName;
}

function handlePicRmove() {
  myForm.value.examineImg = ""
}

function handlePage() {
  router.push('/userIndex/profile')
}

getList()
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
  border: 3px solid #409eff;
  padding: 10px;
}
</style>
