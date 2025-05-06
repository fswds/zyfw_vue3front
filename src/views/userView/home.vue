<template>
  <div>
    <!--轮播图-->
    <div class="ml10 mr10 mb10 mt10">
      <vol-swiper></vol-swiper>
    </div>
    <el-row :gutter="20">
      <el-col :span="5">
        <el-card class="my-el-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-flag"></span>
              <span class="card-title">活动分类</span>
            </div>
          </template>
          <div class="label-list">
            <div :class="isActive === '' ? 'label_active' : 'label'" @click="handleQuery('')">全部</div>
            <div v-for="item in sys_activity_type" @click="handleQuery(item.value)"
              :class="isActive === item.value ? 'label_active' : 'label'">
              {{ item.label }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="my-el-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-flag"></span>
              <span class="card-title">活动列表</span>
            </div>
          </template>
          <!--列表页-->
          <div v-if="total < 1" class="no-list">暂无数据</div>
          <div v-else class="list">
            <div class="card" v-for="item in activityList" @click="handlePage(item)">
              <!--左侧图-->
              <div class="card-l">
                <el-image style="width: 100%;height: 100%" :src="baseAPI + item.imgs">
                  <template #error>
                    <div style="text-align: center;color: #aaaaaa;">
                      暂无图片
                    </div>
                  </template>
                </el-image>
              </div>
              <!--右侧内容-->
              <div class="card-r">
                <div class="mb5">
                  <dict-tag style="display: inline-block" :options="sys_examine_status"
                    :value="item.userApprovalStatus" />
                  {{ item.activityName }}
                </div>
                <dict-tag class="tag" :options="sys_activity_type" :value="item.activityType" />
                <div class="desc">{{ item.describe || '暂无内容' }}</div>
                <div class="info">
                  <div>联系人：{{ item.contacts }}{{ item.contactsPhone }}</div>
                  <div>
                    活动人数：{{ item.attendPeopleCount }}/{{ item.numberLimit }}
                  </div>
                  <div>
                    {{ parseTime(item.startTime, '{y}-{m}-{d}') }}至{{
                      parseTime(item.endTime, '{y}-{m}-{d}')
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
            :pageSizes="[3, 5, 8]" @pagination="getActList" />
        </el-card>
      </el-col>
      <!--标签分类-->
      <el-col :span="7">
        <el-card class="my-el-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-flag"></span>
              <span class="card-title">消息通知</span>
            </div>
          </template>
          <div class="notice-list">
            <div class="notice" v-for="item in noticeList" key="item.id">
              <div class="mb8">
                <el-link type="primary" @click="openNotice(item)">{{ item.noticeTitle }}</el-link>
              </div>
              <div>
                <el-text type="info" size="small">{{ item.createTime }}</el-text>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog style="min-height: 400px" title="消息详情" width="800px" v-model="noticeOpen">
      <div class="nodia">
        <div class="title">{{ noticeForm.noticeTitle }}</div>
        <div class="info">
          <span>{{ noticeForm.createBy }}&emsp;</span>
          <span>{{ noticeForm.createTime }}</span>
        </div>
        <div v-html="noticeForm.noticeContent"></div>
      </div>
    </el-dialog>
    <global-chatbot />
  </div>

</template>
<script setup>
import useUserStore from "@/store/modules/user.js";
import { listRelation } from "@/api/system/volunteerActivityRelation.js";
import VolSwiper from "@/views/userView/compoents/volSwiper.vue";
import { useRouter } from "vue-router";
import { listNotice } from "@/api/system/notice.js";
import GlobalChatbot from '@/components/GlobalChatbot.vue';

const { proxy } = getCurrentInstance();
const {
  sys_activity_status, sys_activity_type, sys_examine_status
} = proxy.useDict('sys_activity_status', 'sys_activity_type', 'sys_examine_status');
const route = useRouter()

const baseAPI = import.meta.env.VITE_APP_BASE_API
const userInfo = useUserStore()

const noticeOpen = ref(false)
const noticeForm = ref({})

const total = ref(0)
let isActive = ref('')
const activityList = ref([])
const noticeList = ref([])
const queryParams = ref({
  pageNum: 1,
  pageSize: 3,
  userId: userInfo.user.userId,
  userApprovalStatus: null,
  activityName: null,
  organizer: null,
  activityType: null,
})

function getActList() {
  queryParams.value.userId = userInfo.user.userId
  listRelation(queryParams.value).then(response => {
    activityList.value = response.rows;
    total.value = response.total;
  });
}

function getNoticeList() {
  listNotice().then(res => {
    noticeList.value = res.rows
  })
}

/** 搜索按钮操作 */
function handleQuery(activityType) {

  isActive.value = activityType
  queryParams.value.pageNum = 1;
  queryParams.value.activityType = activityType
  getActList();
}

function handlePage(item) {
  route.push(`/userIndex/activity/${item.activityId}`)
}

function openNotice(item) {
  noticeForm.value = { ...item }
  noticeOpen.value = true
}

getNoticeList()
getActList()
</script>
<style scoped lang="scss">
.my-el-card {
  border: none;
}

.card-flag {
  background-color: #2d5299;
  width: 5px;
  height: 20px;
  display: inline-block;
  margin-right: 10px;
}

.card-title {
  color: #2d5299;
}

.list,
.no-list {
  border: 1px solid #eeeeee;
  padding: 10px;
}

.no-list {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaaaaa;
}

.card {
  display: flex;
  justify-content: space-between;
  height: 120px;
  margin-bottom: 10px;
  padding: 10px;
  border-bottom: 1px solid #eeeeee;
  color: #333333;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease;

  &:hover {
    cursor: pointer;
    border-right: 3px solid #ed5565;
    transform: scale(1.05);
  }

  .card-l {
    width: 30%;
  }

  .card-r {
    width: 65%;
    font-size: 16px;

    .tag {
      color: #94cdf1;
      font-size: 12px;
    }

    .desc {
      color: #aaaaaa;
      height: 35px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;

      margin: 6px 0;
      font-size: 14px;
    }

    .info {
      color: #aaaaaa;
      font-size: 10px;

      display: flex;
      justify-content: space-between;
    }
  }
}

.notice-list {
  font-size: 14px;


  .notice {
    padding: 6px 0;
    border-bottom: 1px solid #eeeeee;
  }
}

.label-list {
  text-align: center;
  font-size: 14px;

  .label {
    height: 50px;
    background-color: #f2f2f2;
    line-height: 50px;
    cursor: pointer;
    margin-top: 3px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.02);
    }
  }

  .label_active {
    background: #2d5299;
    color: #FFFFFF;
    height: 50px;
    line-height: 50px;
    cursor: pointer;
    margin-top: 3px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.02);
    }
  }
}

.nodia {
  .title {
    margin-bottom: 10px;
    font-size: 16px;
    text-align: center;
  }

  .info {
    margin-bottom: 10px;
    color: #aaaaaa;
    text-align: center;
  }
}
</style>
