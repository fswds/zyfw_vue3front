<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <span>组织信息</span>
      </template>
      <el-form label-width="208px" inline>
        <el-form-item label="组织编号">
          {{ organizationInfo.id }}
        </el-form-item>
        <el-form-item label="组织名称">
          {{ organizationInfo.name }}
        </el-form-item>
        <el-form-item label="组织介绍">
          {{ organizationInfo.introduce }}
        </el-form-item>
        <el-form-item label="组织创建时间">
          {{ organizationInfo.createTime }}
        </el-form-item>
      </el-form>
    </el-card>
    <!--人员信息-->
    <el-form class="mt20" :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
      <el-form-item label="用户名称" prop="volunteerName">
        <el-input
            v-model="queryParams.volunteerName"
            placeholder="请输入用户名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="审批状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择审批状态" clearable
                   style="width: 200px">
          <el-option
              v-for="dict in sys_activity_status"
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

    <el-table class="mt20" :data="voluList">
      <el-table-column label="组织编号" align="center" prop="organizationId" width="80"/>
      <el-table-column label="志愿者编号" align="center" prop="volunteerId"/>
      <el-table-column label="用户编号" align="center" prop="userId"/>
      <el-table-column label="审批状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_activity_status" :value="scope.row.status"/>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" v-hasRole="['admin','admin2','organizationadmin']"
                     @click="handleUpdate(scope.row)">审核
          </el-button>
          <el-button link type="primary" v-hasRole="['admin','admin2','organizationadmin']"
                     @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getVoluList"
    />
    <!--审核弹出层-->
    <el-dialog title="审核" v-model="open" width="400px" append-to-body>
      <el-form ref="activityRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="审批状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择审批状态" style="width: 100%">
            <el-option
                v-for="dict in sys_activity_status"
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

<script setup>
import {useRoute} from "vue-router";
import {getOrganization} from "@/api/system/organization.js";
import {delRelation, listRelation, updateRelation} from "@/api/system/volunteerOrganizationRelation.js";
import {ElMessage} from "element-plus";

const {proxy} = getCurrentInstance();
const {
  sys_activity_status,
  sys_activity_type,
  sys_examine_status
} = proxy.useDict('sys_activity_status', 'sys_activity_type', 'sys_examine_status');

const route = useRoute()
let organizationId = null

const organizationInfo = ref({})
const voluList = ref([])

const total = ref(0);
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    activityName: undefined,
    volunteerName: undefined,
    status: undefined
  },
});

const {queryParams, form, rules} = toRefs(data);

const open = ref(false)

async function init() {
  organizationId = route.params.id
  await getAciInfo(organizationId)
  getVoluList()
}

/*获取志愿组织信息*/
async function getAciInfo(organizationId) {
  const resAct = await getOrganization(organizationId)
  organizationInfo.value = resAct.data
}

/*获取人员信息*/
function getVoluList() {
  listRelation({organizationId: organizationInfo.value.id, ...queryParams.value}).then(res => {
    voluList.value = res.rows
    total.value = res.total
  })
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getVoluList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/*审批*/
function handleUpdate(row) {
  form.value = {...row}
  open.value = true
}

/*审核状态提交*/
function submitForm() {
  let data = {...form.value}
  updateRelation(data).then(res => {
    getVoluList()
    open.value = false
    ElMessage.success(res.msg)
  })
}

/*审核取消*/
function cancel() {
  open.value = false
  form.value = {};
  proxy.resetForm("activityRef");
}

/*删除*/
function handleDelete(row) {
  delRelation(row.id).then(res => {
    ElMessage.success(res.msg)
    getVoluList()
  })
}

init()
</script>

<style scoped lang="scss">
:deep(.el-form-item) {
  margin-bottom: 0 !important;
}
</style>
