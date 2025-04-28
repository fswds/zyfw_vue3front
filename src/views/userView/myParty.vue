<template>
  <div class="app">
    <div class="title" @click="handlePage">我的组织</div>
    <div v-if="total<1" class="no-list">暂无数据</div>
    <div v-else class="list">
      <el-button @click="getOrgList" size="small" type="danger">刷新数据</el-button>
      <div class="card-list">
        <el-card class="card" v-for="item in orgList" shadow="never">
          <template #header>{{ item.name }}</template>
          <el-form>
            <el-form-item label="组织名称">
              {{ item.name }}
            </el-form-item>
            <el-form-item label="创建时间">
              {{ item.createTime }}
            </el-form-item>
            <el-form-item label="加入状态">
              <dict-tag :options="sys_activity_status" :value="item.status"/>
            </el-form-item>
            <el-form-item label="组织介绍">
              <el-tooltip placement="top">
                <template #content>
                  <div style="width: 220px">{{ item.introduce }}</div>
                </template>
                <div class="desc">{{ item.introduce }}</div>
              </el-tooltip>
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="btns">
              <el-link type="primary" :underline="false"
                       @click="handleView(item)">组织详情
              </el-link>
            </div>
          </template>
        </el-card>
      </div>
      <!--分页-->
      <pagination
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getOrgList"
      />
    </div>

  </div>

</template>
<script setup>
/*获取活动列表信息*/
import useUserStore from "@/store/modules/user.js";
import {listOrganization} from "@/api/system/organization.js";
import {getUser} from "@/api/system/user.js";
import {useRouter} from "vue-router";

const {proxy} = getCurrentInstance();
const {
  sys_activity_status, sys_activity_type, sys_examine_status
} = proxy.useDict('sys_activity_status', 'sys_activity_type', 'sys_examine_status');

const router = useRouter()
const baseAPI = import.meta.env.VITE_APP_BASE_API

const userInfo = useUserStore()
let myUser = {}
const orgList = ref([])

const total = ref(0)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  isPerson: 'isPerson'
})


function init() {
  getOrgList()
  getUserInfo()
}

function getUserInfo() {
  getUser(userInfo.user.userId).then(response => {
    myUser = response.data;
  });
}

/*获取组织列表*/
function getOrgList() {
  queryParams.value.userId = userInfo.user.userId
  listOrganization(queryParams.value).then(response => {
    orgList.value = response.rows;
    total.value = response.total;
  });
}

function handlePage() {
  router.push('/userIndex/profile')
}

function handleView(item) {
  router.push(`/userIndex/party/${item.id}`)
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
  padding: 10px;

  &:hover {
    cursor: pointer;
  }
}

.no-list {
  height: 260px;
  line-height: 260px;
  text-align: center;
  color: #aaaaaa;
  font-size: 20px;
  border: 3px solid #409eff;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}


.list {
  border: 3px solid #409eff;
  padding: 10px;
}

.card-list {
  display: flex;
  flex-wrap: wrap;
}

.card {
  width: 280px;
  margin: 10px 5px;

  .desc {
    height: 90px;
    overflow: hidden;
  }

  .btns {
    display: flex;
    justify-content: space-around;
  }
}

:deep(.el-form-item) {
  margin-bottom: 0;
}
</style>
