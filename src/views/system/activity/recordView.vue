<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <span>活动信息</span>
      </template>
      <el-form label-width="68px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="活动编号">
              {{ activeInfo.id }}
            </el-form-item>
            <el-form-item label="活动名称">
              {{ activeInfo.name }}
            </el-form-item>
            <el-form-item label="活动类型">
              <dict-tag :options="sys_activity_type" :value="activeInfo.activityType"/>
            </el-form-item>
            <el-form-item label="活动人数">
              {{ activeInfo.attendPeopleCount }}/{{ activeInfo.numberLimit }}
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="举办组织">
              <!--{{ volunteerDict.find(item => item.id == activeInfo.organizationId).name }}-->
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
          </el-col>
          <el-col :span="8">
            <el-form-item label="描述">
              {{ activeInfo.describe }}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <!--表单-->
    <el-form class="mt10" :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="签到标题" prop="noticeTitle">
        <el-input
            v-model="queryParams.noticeTitle"
            placeholder="请输入签到标题"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mt10 mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
        >新增
        </el-button>
      </el-col>
    </el-row>

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
      <el-table-column label="状态" align="center" prop="status" width="180">
        <template #default="scope">
          <el-tag type="primary" v-if="scope.row.status=='0'">正常</el-tag>
          <el-tag type="danger" v-if="scope.row.status=='1'">关闭</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="管理" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleAudit(scope.row)"
                     v-hasPermi="['system:record:edit']">签到审核
          </el-button>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['system:record:edit']">修改
          </el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['system:record:remove']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改签到记录对话框 -->
    <el-dialog :title="title" v-model="open" width="620px" append-to-body>
      <el-form ref="recordRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="签到标题" prop="noticeTitle">
          <el-input v-model="form.noticeTitle" placeholder="请输入签到标题"/>
        </el-form-item>
        <el-form-item label="签到内容" prop="noticeContent">
          <editor v-model="form.noticeContent" :min-height="192"/>
        </el-form-item>
        <el-form-item label="签到积分" prop="signScore">
          <el-input-number v-model="form.signScore" :min="0" :step="1"/>
        </el-form-item>
        <el-form-item label="开始时间" prop="startDate">
          <el-date-picker clearable
                          v-model="form.startDate"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择开始时间" style="width: 100%">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endDate">
          <el-date-picker clearable
                          v-model="form.endDate"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择结束时间" style="width: 100%">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status">
            <el-option value="0" label="正常"/>
            <el-option value="1" label="关闭"/>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Record">
import {getActivity} from "@/api/system/activity.js";
import {useRoute, useRouter} from "vue-router";
import {parseTime} from "@/utils/dome.js";
import {addsignNotice, delsignNotice, listsignNotice, updatesignNotice} from "@/api/system/signNotice.js";
import {getsignNotice} from "../../../api/system/signNotice.js";

const {proxy} = getCurrentInstance();
const {
  sys_activity_type, sys_record_status
} = proxy.useDict('sys_activity_type', 'sys_record_status');

const baseAPI = import.meta.env.VITE_APP_BASE_API
const router = useRouter()
const route = useRoute()
const activeInfo = ref({})//活动信息

const recordList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    activityId: route.params.id,
    noticeTitle: null,
    userName: null,
  },
  rules: {

    noticeTitle: [
      {required: true, message: "签到标题不能为空", trigger: "blur"}
    ],
    noticeContent: [
      {required: true, message: "签到内容不能为空", trigger: "blur"}
    ],
    signScore: [
      {required: true, message: "签到积分不能为空", trigger: ["blur", "change"]}
    ],
    startDate: [
      {required: true, message: "开始时间不能为空", trigger: "blur"}
    ],
    endDate: [
      {required: true, message: "结束时间不能为空", trigger: "blur"}
    ],
    status: [
      {required: true, message: "状态不能为空", trigger: ["blur", "change"]}
    ],
  }
});

const {queryParams, form, rules} = toRefs(data);


async function init() {
  const activeId = route.params.id
  await getAciInfo(activeId)
  getList()
}

/*获取活动信息*/
async function getAciInfo(activeId) {
  const resAct = await getActivity(activeId)
  activeInfo.value = resAct.data
}

/** 查询签到记录列表 */
function getList() {
  loading.value = true;
  listsignNotice(queryParams.value).then(response => {
    recordList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    noticeId: null,
    noticeType: '1',
    noticeTitle: null,
    noticeContent: "",
    signScore: null,
    startDate: null,
    endDate: null,
    status: '0',
    activityId: route.params.id
  };
  proxy.resetForm("recordRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

function handleAdd() {
  reset()
  title.value = "新增签到信息"
  open.value = true
}

function handleAudit(row) {
  const actId = route.params.id
  const signNoticeId = row.noticeId
  router.push('/activity/record/' + actId + "&" + signNoticeId)
}

/** 预览按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.noticeId
  getsignNotice(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改签到信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["recordRef"].validate(valid => {
    if (valid) {
      if (form.value.noticeId != null) {
        updatesignNotice(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addsignNotice(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.noticeId;
  proxy.$modal.confirm('是否确认删除签到编号为"' + _ids + '"的数据项？').then(function () {
    return delsignNotice(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}


init()
</script>
<style scoped lang="scss">
</style>
