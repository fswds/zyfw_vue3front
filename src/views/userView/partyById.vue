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
  background: #f8f9fa;
  min-height: calc(100vh - 40px);
  border-radius: 16px;
  padding: 20px;
}

.title {
  background: linear-gradient(135deg, #2d5299, #4a90e2);
  color: #fff;
  text-align: center;
  padding: 20px;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
  border-radius: 16px;
  margin-bottom: 30px;
  box-shadow: 0 8px 20px rgba(45, 82, 153, 0.2);
  transition: all 0.3s ease;

  &:hover {
    cursor: pointer;
    transform: translateY(-2px);
    box-shadow: 0 12px 25px rgba(45, 82, 153, 0.3);
  }

  .el-link {
    padding: 8px 16px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    &.is-disabled {
      background: rgba(255, 255, 255, 0.05);
      cursor: not-allowed;
    }
  }
}

.list {
  padding: 30px;
  width: 100%;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.info-card {
  margin-bottom: 30px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
  
  .card-title {
    font-size: 20px;
    font-weight: 600;
    color: #2d5299;
    padding: 20px;
    background: linear-gradient(135deg, #f8f9fa, #fff);
    border-bottom: 1px solid #f0f0f0;
  }
}

.info-form {
  .form-item {
    margin-bottom: 20px;
    padding: 15px;
    border-radius: 12px;
    background: #f8f9fa;
    transition: all 0.3s ease;

    &:hover {
      background: #f0f2f5;
    }
    
    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #2d5299;
      font-size: 16px;
    }
  }
}

.info-value {
  color: #303133;
  line-height: 1.6;
  font-size: 16px;
}

.description {
  background: linear-gradient(135deg, #f8f9fa, #fff);
  padding: 20px;
  border-radius: 12px;
  line-height: 1.8;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.el-form) {
  .el-form-item {
    margin-bottom: 20px;
    padding: 15px;
    border-radius: 12px;
    background: #f8f9fa;
    transition: all 0.3s ease;

    &:hover {
      background: #f0f2f5;
    }
  }

  .el-input {
    .el-input__wrapper {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
    }
  }

  .el-select {
    .el-input__wrapper {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
    }
  }
}

:deep(.el-button) {
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #2d5299, #4a90e2);
  border: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(45, 82, 153, 0.2);
  }

  &:disabled {
    background: #f0f2f5;
    cursor: not-allowed;
  }
}

:deep(.el-table) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin: 20px 0;

  .el-table__header {
    th {
      background: linear-gradient(135deg, #2d5299, #4a90e2);
      color: #fff;
      font-weight: 600;
      font-size: 16px;
      padding: 15px 0;
    }
  }

  .el-table__row {
    transition: all 0.3s ease;

    &:hover {
      background-color: #f0f2f5;
      transform: translateY(-2px);
    }

    td {
      padding: 15px 0;
      font-size: 16px;
    }
  }
}

:deep(.el-pagination) {
  margin-top: 30px;
  justify-content: center;
  padding: 20px 0;

  .el-pagination__total,
  .el-pagination__jump {
    margin-right: 20px;
  }

  .btn-prev,
  .btn-next,
  .el-pager li {
    background: #f8f9fa;
    border-radius: 8px;
    margin: 0 5px;
    transition: all 0.3s ease;

    &:hover {
      background: #2d5299;
      color: #fff;
    }

    &.is-active {
      background: linear-gradient(135deg, #2d5299, #4a90e2);
      color: #fff;
    }
  }
}
</style>
