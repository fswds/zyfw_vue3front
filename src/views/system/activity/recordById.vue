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

      <el-form-item label="用户账号" prop="userName">
        <el-input
            v-model="queryParams.userName"
            placeholder="请输入用户用户账号"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="签到时间" prop="signDate">
        <el-date-picker clearable
                        v-model="queryParams.signDate"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="请选择签到时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="审批状态" prop="status">
        <el-select v-model="queryParams.examineStatus" placeholder="请选择审批状态" clearable style="width: 200px">
          <el-option
              v-for="dict in sys_record_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recordList">
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
          <el-button link type="primary" icon="Edit" @click="handleView(scope.row)"
                     v-hasPermi="['system:record:edit']">预览
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
      <el-form ref="recordRef" :model="form" label-width="80px">
        <el-row>
          <el-col :span="12">
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
          </el-col>
          <el-col :span="12">
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
          </el-col>
        </el-row>
        <el-form-item label="图片预览">
          <el-image v-if="form.examineImg" style="height: 120px" :src="baseAPI+form.examineImg"></el-image>
          <div v-else>暂无预览</div>
        </el-form-item>
        <el-form-item label="备注" prop="extra">
          {{ form.extra }}
        </el-form-item>
        <el-form-item label="签到审批" prop="examineStatus">
          <el-select v-model="form.examineStatus" placeholder="请选择审批状态" clearable
                     style="width: 220px">
            <el-option
                v-for="dict in sys_record_status"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
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
import {addRecord, delRecord, getRecord, listRecord, updateRecord} from "@/api/system/record.js";
import {getActivity} from "@/api/system/activity.js";
import {useRoute} from "vue-router";
import {parseTime} from "@/utils/dome.js";

const {proxy} = getCurrentInstance();
const {
  sys_activity_type, sys_record_status
} = proxy.useDict('sys_activity_type', 'sys_record_status');
const baseAPI = import.meta.env.VITE_APP_BASE_API

const route = useRoute()
const activeInfo = ref({})//活动信息

const recordList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    activityId: route.params.actId,
    signNoticeId: route.params.recId,
    userId: null,
    userName: null,
    signDate: null,
    examineStatus: null,
  },
});

const {queryParams, form} = toRefs(data);

async function init() {
  const actId = route.params.actId
  const recId = route.params.recId
  await getAciInfo(actId, recId)
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
  // console.log(queryParams.value)
  listRecord(queryParams.value).then(response => {
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
    id: null,
    activityId: route.params.actId,
    signNoticeId: route.params.recId,
    userId: null,
    signDate: null,
    examineStatus: null,
    examineImg: null,
    extra: null,
    createTime: null,
    updateTime: null
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


/** 预览按钮操作 */
function handleView(row) {
  reset();
  const id = row.id
  getRecord(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改签到记录";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["recordRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addRecord(form.value).then(response => {
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
  const _ids = row.id;
  proxy.$modal.confirm('是否确认删除签到记录编号为"' + _ids + '"的数据项？').then(function () {
    return delRecord(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

init()
</script>
<style scoped lang="scss">
:deep(.el-form-item) {
  margin-bottom: 0;
}
</style>
