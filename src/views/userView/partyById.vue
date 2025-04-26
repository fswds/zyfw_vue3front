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
      <el-card shadow="never">
        <template #header>
          <span>组织信息</span>
        </template>
        <el-form label-width="68px">
          <el-row :gutter="20">
            <el-col :span="4">
              <el-image style="width: 100%;height: 100%" :src="baseAPI+partyInfo.imgs">
                <template #error>
                  <div style="text-align: center;color: #aaaaaa;">
                    <img style="width: 100%;height: 90%" src="../../assets/images/party_default.png" alt="img"/>
                  </div>
                </template>
              </el-image>
            </el-col>
            <el-col :span="6">
              <el-form-item label="组织编号">
                {{ partyInfo.id }}
              </el-form-item>
              <el-form-item label="活动名称">
                {{ partyInfo.name }}
              </el-form-item>
              <el-form-item label="创建时间">
                {{ partyInfo.createTime }}
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="组织介绍">
                {{ partyInfo.introduce }}
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
  background: #409eff;
  color: #fff;
  text-align: center;
  padding: 6px;

  &:hover {
    cursor: pointer;
  }
}


.list {
  border: 3px solid #409eff;
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
