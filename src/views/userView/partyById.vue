<template>
  <div class="app">
    <div class="title">
      <el-row>
        <el-col :span="2">
          <el-tooltip effect="dark" content="返回组织列表" placement="top-start">
            <span @click="handlePage">志愿组织</span>
          </el-tooltip>
        </el-col>
        <el-col :span="18"></el-col>
        <el-col :span="2">
          <el-link type="danger" @click="handleAdd(partyInfo)">加入组织
          </el-link>
        </el-col>
      </el-row>
    </div>
    <div class="list">
      <!--基本信息-->
      <el-card shadow="never" class="info-card">
        <template #header>
          <span class="card-title">组织信息</span>
        </template>
        <el-form label-width="100px" class="info-form">
          <el-row :gutter="30">
            <el-col :span="24">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="组织编号" class="form-item">
                    <span class="info-value">{{ partyInfo.id }}</span>
                  </el-form-item>
                  <el-form-item label="组织名称" class="form-item">
                    <span class="info-value">{{ partyInfo.name }}</span>
                  </el-form-item>
                  <el-form-item label="创建时间" class="form-item">
                    <span class="info-value">{{ partyInfo.createTime }}</span>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="组织介绍" class="form-item">
                <div class="info-value description">{{ partyInfo.introduce }}</div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <!--组织成员列表-->
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
      </el-table>

      <pagination
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getVoluList"
      />
    </div>

  </div>
</template>
<script setup>
/*获取活动列表信息*/
import useUserStore from "@/store/modules/user.js";
import {useRoute, useRouter} from "vue-router";
import {getToken} from "@/utils/auth.js";
import {addRelation, listRelation} from "@/api/system/volunteerOrganizationRelation.js";
import {ElMessage} from "element-plus";
import {getUser} from "@/api/system/user.js";
import {getOrganization} from "@/api/system/organization.js";

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
const partyInfo = ref({})//组织信息

let myUser = {}

const form = ref({
  activittyId: partyInfo.value.activityId,
  userId: userInfo.user.userId,
  commentContent: "",
  extra: ""
})

const voluList = ref([])

const total = ref(0);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  activityName: undefined,
  volunteerName: undefined,
  status: undefined
})


const imgUpload = {
  headers: {
    Authorization: "Bearer " + getToken()
  },
  url: import.meta.env.VITE_APP_BASE_API + "/common/upload",
}

function init() {
  getUserInfo()
  getPartInfo(route.params.id)
  getVoluList(route.params.id)
}

/*获取活动信息*/
async function getPartInfo(id) {
  const resPart = await getOrganization(id)
  partyInfo.value = resPart.data
}

function getUserInfo() {
  getUser(userInfo.user.userId).then(response => {
    myUser = response.data;
  });
}

function getVoluList(id) {
  listRelation({organizationId: id, ...queryParams.value}).then(res => {
    voluList.value = res.rows
    total.value = res.total
  })
}

function handleAdd(row) {
  let data = {}
  data.userId = myUser.userId
  data.organizationId = row.id
  data.volunteerId = myUser.volunteerId
  addRelation(data).then(response => {
    ElMessage.success(response.msg)
    return init()
  });
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
  border: 3px solid #409eff;
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
    margin-bottom: 20px;
    
    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #606266;
      font-size: 16px;
    }
  }
}

.info-value {
  color: #303133;
  line-height: 1.5;
  font-size: 16px;
}

.description {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  line-height: 1.8;
  font-size: 16px;
  margin-top: 10px;
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

:deep(.el-table) {
  font-size: 16px;
  
  .el-table__header th {
    background-color: #f5f7fa;
    color: #2d5299;
    font-weight: 600;
  }
  
  .el-table__row:hover {
    background-color: #f5f7fa;
  }
}
</style>
