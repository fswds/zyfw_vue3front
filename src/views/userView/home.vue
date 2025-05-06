<template>
  <div class="home-container">
    <!--轮播图-->
    <div class="swiper-container">
      <vol-swiper></vol-swiper>
    </div>
    <el-row :gutter="24" class="content-row">
      <el-col :span="5">
        <el-card class="category-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-flag"></span>
              <span class="card-title">活动分类</span>
            </div>
          </template>
          <div class="label-list">
            <div :class="['category-item', isActive === '' ? 'category-active' : '']" @click="handleQuery('')">
              <i class="el-icon-menu"></i>
              全部
            </div>
            <div v-for="item in sys_activity_type" 
                 :class="['category-item', isActive === item.value ? 'category-active' : '']" 
                 @click="handleQuery(item.value)">
              <i class="el-icon-star-on"></i>
              {{ item.label }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="activity-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-flag"></span>
              <span class="card-title">活动列表</span>
            </div>
          </template>
          <!--列表页-->
          <div v-if="total < 1" class="no-data">
            <el-empty description="暂无活动数据"></el-empty>
          </div>
          <div v-else class="activity-list" style="height: 600px; overflow-y: auto;">
            <div class="activity-item" v-for="item in activityList" @click="handlePage(item)">
              <div class="activity-image">
                <el-image :src="baseAPI + item.imgs" fit="cover">
                  <template #error>
                    <div class="image-placeholder">
                      <i class="el-icon-picture-outline"></i>
                    </div>
                  </template>
                </el-image>
              </div>
              <div class="activity-content">
                <div class="activity-header">
                  <dict-tag class="status-tag" :options="sys_examine_status" :value="item.userApprovalStatus" />
                  <h3 class="activity-title">{{ item.activityName }}</h3>
                </div>
                <dict-tag class="type-tag" :options="sys_activity_type" :value="item.activityType" />
                <p class="activity-desc">{{ item.describe || '暂无内容' }}</p>
                <div class="activity-info">
                  <div class="info-item">
                    <i class="el-icon-user"></i>
                    <span>{{ item.contacts }}{{ item.contactsPhone }}</span>
                  </div>
                  <div class="info-item">
                    <i class="el-icon-user-solid"></i>
                    <span>{{ item.attendPeopleCount }}/{{ item.numberLimit }}</span>
                  </div>
                  <div class="info-item">
                    <i class="el-icon-date"></i>
                    <span>{{ parseTime(item.startTime, '{y}-{m}-{d}') }} 至 {{ parseTime(item.endTime, '{y}-{m}-{d}') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="pagination-container" ref="paginationRef">
            <pagination 
              :total="total" 
              v-model:page="queryParams.pageNum" 
              v-model:limit="queryParams.pageSize"
              :pageSizes="[3, 5, 8]" 
              @pagination="handlePagination" 
              layout="total, sizes, prev, pager, next, jumper"
              background
            />
          </div>
        </el-card>
      </el-col>
      <el-col :span="7">
        <el-card class="notice-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-flag"></span>
              <span class="card-title">消息通知</span>
            </div>
          </template>
          <div class="notice-list">
            <div class="notice-item" v-for="item in noticeList" :key="item.id">
              <el-link type="primary" class="notice-title" @click="openNotice(item)">
                {{ item.noticeTitle }}
              </el-link>
              <div class="notice-time">
                <i class="el-icon-time"></i>
                {{ item.createTime }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog 
      class="notice-dialog"
      title="消息详情" 
      width="900px"
      v-model="noticeOpen"
      :close-on-click-modal="false"
      :show-close="true"
      :center="true"
      top="5vh"
    >
      <div class="notice-detail">
        <h2 class="notice-detail-title">{{ noticeForm.noticeTitle }}</h2>
        <div class="notice-detail-info">
          <span class="author">{{ noticeForm.createBy }}</span>
          <span class="time">{{ noticeForm.createTime }}</span>
        </div>
        <div class="notice-detail-content" v-html="noticeForm.noticeContent"></div>
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

const paginationRef = ref(null);

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

/** 分页按钮操作 */
function handlePagination(val) {
  queryParams.value.pageNum = val.page;
  queryParams.value.pageSize = val.limit;
  getActList();
  // 使用 nextTick 确保在 DOM 更新后执行
  nextTick(() => {
    if (paginationRef.value) {
      paginationRef.value.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  });
}

getNoticeList()
getActList()
</script>

<style scoped lang="scss">
.home-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.swiper-container {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right, #2d5299, #4a90e2);
    z-index: 1;
}
}

.content-row {
  margin-top: 20px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, #2d5299, transparent);
    opacity: 0.3;
  }
}

.card-header {
  display: flex;
  align-items: center;
  padding: 16px 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(to right, #2d5299, transparent);
}

  .card-flag {
    background-color: #2d5299;
    width: 4px;
    height: 20px;
    border-radius: 2px;
    margin-right: 12px;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: #2d5299;
      border-radius: 2px;
      animation: flagPulse 2s infinite;
    }
  }
  
  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #2d5299;
    letter-spacing: 0.5px;
    position: relative;
    padding-left: 8px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 16px;
      background-color: #2d5299;
      border-radius: 2px;
      opacity: 0.5;
    }
  }
}

@keyframes flagPulse {
  0% {
    transform: scaleY(1);
    opacity: 1;
  }
  50% {
    transform: scaleY(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
}

.category-card,
.activity-card,
.notice-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(45, 82, 153, 0.1);
  }
  
  :deep(.el-card__header) {
    padding: 0 20px;
    border-bottom: none;
  }
  
  :deep(.el-card__body) {
    padding: 20px;
  }
}

.category-card {
  .category-item {
    display: flex;
    align-items: center;
    padding: 14px 18px;
    margin: 10px 0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #fff;
    border: 1px solid #ebeef5;
    
    i {
      margin-right: 10px;
      font-size: 18px;
      color: #2d5299;
      transition: all 0.3s ease;
    }
    
    &:hover {
      background-color: #f0f5ff;
      transform: translateX(8px);
      border-color: #2d5299;
      
      i {
        transform: scale(1.1);
      }
    }
  }

  .category-active {
    background: linear-gradient(135deg, #2d5299, #4a90e2);
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(45, 82, 153, 0.2);
    
    i {
      color: white;
    }
    
    &:hover {
      background: linear-gradient(135deg, #2d5299, #4a90e2);
      opacity: 0.9;
      transform: translateX(8px);
    }
  }
  }

.activity-card {
  .activity-list-wrapper {
    height: 600px;
    overflow-y: auto;
    padding-right: 10px;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: #dcdfe6;
      border-radius: 3px;
      
      &:hover {
        background-color: #c0c4cc;
      }
    }
    
    &::-webkit-scrollbar-track {
      background-color: #f5f7fa;
      border-radius: 3px;
    }
  }

  .activity-list {
    .activity-item {
      display: flex;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 12px;
      background: white;
      transition: all 0.3s ease;
      cursor: pointer;
      max-height: 200px;
      border: 1px solid #ebeef5;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        border-color: #2d5299;
      }
      
      .activity-image {
        width: 220px;
        height: 160px;
        border-radius: 8px;
      overflow: hidden;
        margin-right: 20px;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        
        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa, #e4e7ed);
          color: #909399;
          font-size: 24px;
        }
      }
      
      .activity-content {
        flex: 1;
        overflow-y: auto;
        padding-right: 12px;
        
        .activity-header {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          
          .status-tag {
            margin-right: 12px;
          }
          
          .activity-title {
            margin: 0;
            font-size: 20px;
            color: #2d5299;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
    }

        .type-tag {
          margin-bottom: 12px;
        }
        
        .activity-desc {
          color: #606266;
          margin: 12px 0;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          font-size: 15px;
        }
        
        .activity-info {
      display: flex;
      justify-content: space-between;
          color: #909399;
          font-size: 14px;
          margin-top: 16px;
          
          .info-item {
            display: flex;
            align-items: center;
            
            i {
              margin-right: 6px;
              font-size: 16px;
              color: #2d5299;
            }
          }
        }
      }
    }
  }
}

.notice-card {
.notice-list {
    .notice-item {
      padding: 18px;
      margin: 12px 0;
      border-radius: 10px;
      background: #fff;
      transition: all 0.3s ease;
      border: 1px solid #ebeef5;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        border-color: #2d5299;
      }
      
      .notice-title {
        display: block;
        margin-bottom: 14px;
        font-size: 17px;
        font-weight: 600;
        color: #2d5299;
        letter-spacing: 0.5px;
        line-height: 1.4;
        
        &:hover {
          color: #4a90e2;
          text-decoration: none;
        }
      }
      
      .notice-time {
  font-size: 14px;
        color: #909399;
        display: flex;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        
        i {
          margin-right: 8px;
          font-size: 16px;
          color: #2d5299;
        }
      }
    }
  }
}

.notice-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    
    .el-dialog__header {
      margin: 0;
      padding: 20px 24px;
      background-color: #2d5299;
      
      .el-dialog__title {
        color: #fff;
        font-size: 18px;
        font-weight: 600;
      }
      
      .el-dialog__headerbtn {
        top: 20px;
        
        .el-dialog__close {
          color: #fff;
          font-size: 18px;
          
          &:hover {
            color: #fff;
            opacity: 0.8;
          }
        }
  }
}

    .el-dialog__body {
      padding: 0;
    }
  }

  .notice-detail {
    padding: 32px 40px;
    
    .notice-detail-title {
  text-align: center;
      margin-bottom: 28px;
      color: #2d5299;
      font-size: 26px;
      font-weight: 600;
      letter-spacing: 0.5px;
      line-height: 1.4;
    }
    
    .notice-detail-info {
      text-align: center;
      margin-bottom: 32px;
      color: #909399;
      font-size: 15px;
      padding-bottom: 20px;
      border-bottom: 1px solid #ebeef5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      
      .author {
        margin-right: 20px;
        color: #2d5299;
        font-weight: 500;
        font-size: 16px;
      }
      
      .time {
        color: #909399;
        font-size: 15px;
      }
    }
    
    .notice-detail-content {
      line-height: 1.8;
      color: #333;
      font-size: 16px;
      letter-spacing: 0.3px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      
      p {
        margin-bottom: 24px;
        line-height: 1.8;
        text-align: justify;
        word-break: break-word;
      }
      
      h1, h2, h3, h4, h5, h6 {
        color: #2d5299;
        margin: 32px 0 20px;
        font-weight: 600;
        line-height: 1.4;
      }
      
      h1 { font-size: 24px; }
      h2 { font-size: 22px; }
      h3 { font-size: 20px; }
      
      ul, ol {
        margin: 20px 0;
        padding-left: 28px;
        
        li {
          margin-bottom: 12px;
          line-height: 1.6;
        }
      }
      
      blockquote {
        margin: 24px 0;
        padding: 16px 20px;
        border-left: 4px solid #2d5299;
        background-color: #f8f9fa;
        color: #666;
        font-style: italic;
        font-size: 16px;
      }
      
      code {
        background-color: #f8f9fa;
        padding: 3px 8px;
        border-radius: 4px;
        color: #2d5299;
        font-family: Consolas, Monaco, 'Andale Mono', monospace;
        font-size: 15px;
      }
      
      pre {
        background-color: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 20px 0;
        
        code {
          background-color: transparent;
          padding: 0;
          color: #333;
        }
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        
        th, td {
          padding: 16px;
          border: 1px solid #ebeef5;
          text-align: left;
        }
        
        th {
          background-color: #f8f9fa;
          color: #2d5299;
          font-weight: 600;
        }
      }
      
      img {
        max-width: 100%;
        border-radius: 8px;
        margin: 20px 0;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }
      
      a {
        color: #2d5299;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
      
      hr {
        margin: 32px 0;
        border: none;
        border-top: 1px solid #ebeef5;
      }
    }
  }
}

.pagination-container {
  margin-top: -5px;
  padding: 2px 0;
  display: flex;
  justify-content: center;
  width: 100%;
  background-color: #fff;
  border-radius: 4px;
  position: sticky;
  bottom: 0;
  z-index: 10;
  
  :deep(.el-pagination) {
    padding: 0;
    margin: 0;
    white-space: nowrap;
    
    .el-pagination__sizes {
      margin-right: 16px;
    }
    
    .el-pagination__total {
      margin-right: 16px;
    }
    
    .el-pager li {
      margin: 0 4px;
      background-color: #fff;
      color: #2d5299;
      
      &.is-active {
        background-color: #2d5299;
        color: #fff;
      }
      
      &:hover {
        color: #2d5299;
      }
  }

    .el-pagination__jump {
      margin-left: 16px;
      
      .el-input__inner {
        color: #2d5299;
      }
    }
    
    .btn-prev,
    .btn-next {
      background-color: #fff;
      color: #2d5299;
      
      &:hover {
        color: #2d5299;
      }
      
      &.is-disabled {
        color: #c0c4cc;
  }
    }
  }
}

.no-data {
  padding: 40px 0;
}
</style>
