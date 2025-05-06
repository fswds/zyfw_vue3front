<template>
  <div class="app">
    <div class="ml10 mr10 mb10 mt10">
      <vol-swiper></vol-swiper>
    </div>
    <div class="title" @click="getOrgList">志愿组织</div>
    <div v-if="total<1" class="no-list">暂无数据</div>
    <div v-else class="list">
      <div class="card-list">
        <el-card class="card" v-for="item in orgList" shadow="never" @click="handlePage(item)">
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
              <!--                  <dict-tag v-if='item.status' :options="sys_activity_status" :value="item.status"/>-->
              <!--                  <el-tag v-else type="info">未加入</el-tag>-->
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
              <!--              <el-link type="primary" :underline="false"-->
              <!--                       @click="handleAdd(item)">加入组织-->
              <!--              </el-link>-->
              <el-link type="primary" :underline="false">组织详情</el-link>
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
import {addRelation} from "@/api/system/volunteerOrganizationRelation.js";
import {ElMessage} from "element-plus";
import VolSwiper from "@/views/userView/compoents/volSwiper.vue";
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

/*查询加入组织的状态*/

/*加入组织*/
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

function handlePage(item) {
  router.push(`/userIndex/party/${item.id}`)
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
}

.no-list {
  height: 300px;
  line-height: 300px;
  text-align: center;
  color: #666;
  font-size: 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 20px 0;
}

.list {
  padding: 30px;
  width: 100%;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  padding: 10px;
}

.card {
  width: 100%;
  margin: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: none;
  border-radius: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  background: #fff;
  overflow: hidden;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }

  :deep(.el-card__header) {
    background: linear-gradient(135deg, #2d5299, #4a90e2);
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    padding: 20px;
    border-bottom: none;
    position: relative;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1));
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover::after {
      opacity: 1;
    }
  }

  :deep(.el-card__body) {
    padding: 25px;
  }

  :deep(.el-card__footer) {
    padding: 20px;
    border-top: 1px solid #f0f0f0;
    background: #f8f9fa;
  }

  :deep(.el-form-item) {
    margin-bottom: 15px;
    padding: 10px;
    border-radius: 8px;
    background: #f8f9fa;
    transition: all 0.3s ease;

    &:hover {
      background: #f0f2f5;
    }

    &:last-child {
      margin-bottom: 0;
    }

    .el-form-item__label {
      color: #2d5299;
      font-weight: 500;
    }
  }

  .desc {
    height: 90px;
    overflow: hidden;
    line-height: 1.6;
    color: #666;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background: #f0f2f5;
    }
  }

  .btns {
    display: flex;
    justify-content: center;
    gap: 15px;

    .el-link {
      padding: 10px 20px;
      border-radius: 8px;
      background: linear-gradient(135deg, #2d5299, #4a90e2);
      color: #fff;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(45, 82, 153, 0.2);
      }
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
