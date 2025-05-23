<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户编号" prop="userId">
        <el-input
            v-model="queryParams.userId"
            placeholder="请输入用户编号"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="留言内容" prop="conent">
        <el-input
            v-model="queryParams.conent"
            placeholder="请输入留言内容"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
        >新增
        </el-button>
      </el-col>
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--            type="success"-->
<!--            plain-->
<!--            icon="Edit"-->
<!--            :disabled="single"-->
<!--            @click="handleUpdate"-->
<!--        >修改-->
<!--        </el-button>-->
<!--      </el-col>-->
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>

      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="messageList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="留言编号" align="center" prop="id" width="80"/>
      <el-table-column label="用户编号" align="center" prop="userId" width="80"/>
      <el-table-column label="留言内容" align="center" prop="conent" :show-overflow-tooltip="true"/>
      <el-table-column label="回复内容" align="center" prop="answer" :show-overflow-tooltip="true"/>
      <el-table-column label="留言时间" align="center" width="160" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"  v-hasPermi="['system:message:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 添加或修改留言板信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="messageRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="留言内容" prop="conent">
          <el-input type="textarea" rows="6" v-model="form.conent" placeholder="请输入留言内容"/>
        </el-form-item>
        <el-form-item label="留言回复" prop="answer">
          <el-input type="textarea" rows="6" v-model="form.answer"
                    :disabled="userInfo.roles[0]!='admin'&&userInfo.roles[0]!='admin2'"
                    placeholder="请输入留言回复"/>
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

<script setup name="Message">
import {addMessage, delMessage, getMessage, listMessage, updateMessage} from "@/api/system/message";
import useUserStore from "@/store/modules/user.js";

const {proxy} = getCurrentInstance();

const messageList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const userInfo = useUserStore()

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    conent: null,
    status: null,
    answer: null,
    extra: null,
  },
  rules: {
    userId: [
      {required: true, message: "用户id不能为空", trigger: "blur"}
    ],
    conent: [
      {required: true, message: "留言内容不能为空", trigger: "blur"}
    ],
    status: [
      {required: true, message: "留言处理状态不能为空", trigger: "change"}
    ],
    createTime: [
      {required: true, message: "留言时间不能为空", trigger: "blur"}
    ],
    updateTime: [
      {required: true, message: "$comment不能为空", trigger: "blur"}
    ]
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询留言板信息列表 */
function getList() {
  loading.value = true;
  listMessage(queryParams.value).then(response => {
    messageList.value = response.rows;
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
    userId: null,
    conent: null,
    status: null,
    answer: null,
    extra: null,
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("messageRef");
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

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加留言板信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getMessage(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改留言板信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["messageRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateMessage(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        form.value.userId = userInfo.user.userId
        addMessage(form.value).then(response => {
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
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除留言板信息编号为"' + _ids + '"的数据项？').then(function () {
    return delMessage(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/message/export', {
    ...queryParams.value
  }, `message_${new Date().getTime()}.xlsx`)
}

getList();
console.log(userInfo.roles)
</script>
