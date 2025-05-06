<template>
  <div class="app">
    <!--轮播图-->
    <div class="ml10 mr10 mb10 mt10">
      <vol-swiper></vol-swiper>
    </div>
    <div class="title" @click="getMesgList">留言板</div>

    <!--刷新按钮-->
    <el-row class="mt20 mb20" :gutter="10">
      <el-col :span="20">
        <el-input v-model="form.conent" placeholder="请输入留言内容" class="el-input"></el-input>
      </el-col>
      <el-col :span="2">
        <el-button type="danger" @click="addComm">提交</el-button>
      </el-col>
      <el-col :span="2">
        <el-link type="primary" @click="getMesgList">刷新评论</el-link>
      </el-col>
    </el-row>

    <div v-if="total<1" class="no-list">暂无数据</div>
    <div v-else class="list">
      <!--活动信息-->
      <el-card class="card" shadow="never">
        <!--评论列表-->
        <div class="mt10 text-center" v-if="total<1">暂无评论</div>
        <div class="mt10" v-else>
          <el-collapse>
            <el-collapse-item v-for="item in messageList" :name="item.id">
              <template #title>
                <span class="ml10 text-info">{{ item.conent }}</span>
              </template>
              <div class="ml20 comCard">
                <div v-if="item.answer">{{ item.answer }}</div>
                <div v-else style="color: #aaaaaa">暂无回复</div>
                <div class="text-info">{{ item.createTime }}</div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        <!--分页-->
        <pagination
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="getMesgList"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup name="Comment">
import {useRoute} from "vue-router";
import {ElMessage} from "element-plus";
import useUserStore from "@/store/modules/user.js";
import {addMessage, listMessage} from "@/api/system/message.js";
import VolSwiper from "@/views/userView/compoents/volSwiper.vue";
import Pagination from "@/components/Pagination/index.vue";

const {proxy} = getCurrentInstance();

const route = useRoute()

const {
  sys_activity_status,
  sys_activity_type,
  sys_examine_status
} = proxy.useDict('sys_activity_status', 'sys_activity_type', 'sys_examine_status');


const userInfo = useUserStore()
const messageList = ref([])
const total = ref(0)

const form = ref({
  pageNum: 1,
  pageSize: 10,
  userId: null,
  conent: null,
  status: null,
  answer: null,
  extra: null,
})

const queryParams = ref({
  pageSize: 10,
  pageNum: 1,
})

function init() {
  getMesgList()
}


/*获取评论列表*/
function getMesgList() {
  listMessage(queryParams.value).then(response => {
    messageList.value = response.rows;
    total.value = response.total;
  });
}

/*发布*/
function addComm() {
  console.log("111", form.value)
  form.value.userId = userInfo.user.userId
  if (form.value.conent.length < 1) {
    ElMessage.warning("评论信息不可以为空")
  } else {
    addMessage(form.value).then(res => {
      ElMessage.success(res.msg)
      form.value.conent = ""
      return getMesgList()
    })
  }
}

init();
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

:deep(.el-input) {
  .el-input__wrapper {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
  height: auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(45, 82, 153, 0.2);
  }

  &:disabled {
    background: #f0f2f5;
    cursor: not-allowed;
  }
}

:deep(.el-link) {
  font-size: 16px;
  padding: 12px 24px;
  border-radius: 8px;
  background: linear-gradient(135deg, #2d5299, #4a90e2);
  color: #fff;
  font-weight: 500;
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

:deep(.el-pagination) {
  margin-top: -5px;
  justify-content: center;
  padding: 5px 0;
  display: flex;
  align-items: center;
  gap: 10px;

  .el-pagination__total,
  .el-pagination__jump {
    margin-right: 20px;
    font-size: 16px;
    color: #606266;
  }

  .btn-prev,
  .btn-next,
  .el-pager li {
    background: #f8f9fa;
    border-radius: 8px;
    margin: 0 5px;
    transition: all 0.3s ease;
    font-size: 16px;
    min-width: 40px;
    height: 40px;
    line-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    &:hover {
      background: #2d5299;
      color: #fff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(45, 82, 153, 0.2);
    }

    &.is-active {
      background: linear-gradient(135deg, #2d5299, #4a90e2);
      color: #fff;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(45, 82, 153, 0.3);
    }

    &.is-disabled {
      background: #f0f2f5;
      color: #c0c4cc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }

  .el-pagination__sizes {
    margin-right: 20px;

    .el-input__wrapper {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
    }
  }

  .el-pagination__jump {
    margin-left: 20px;

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

.el-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.comCard {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin: 15px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    background: #f0f2f5;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

:deep(.el-collapse) {
  margin-bottom: 0;
}

:deep(.el-collapse-item) {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(10px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }

  .el-collapse-item__header {
    font-size: 16px;
    color: #2d5299;
    font-weight: 500;
    padding: 10px 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, #f8f9fa, #fff);
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, #f0f2f5, #f8f9fa);
    }
  }

  .el-collapse-item__content {
    padding: 15px;
  }
}
</style>
