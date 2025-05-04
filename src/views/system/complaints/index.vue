<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="投诉人" prop="volunteerId">
        <el-select
          v-model="queryParams.volunteerId"
          placeholder="请选择投诉人"
          clearable
          style="width: 200px"
          filterable
        >
          <el-option
            v-for="item in volunteerOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <span>{{ item.name }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="投诉时间" prop="complaintTime">
        <el-date-picker clearable
          v-model="queryParams.complaintTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择投诉时间">
        </el-date-picker>
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
          v-hasPermi="['system:complaints:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:complaints:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:complaints:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:complaints:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="complaintsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column label="投诉人" align="center" prop="volunteerId">
        <template #default="scope">
          <span>{{ volunteerMap[scope.row.volunteerId] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="投诉内容" align="center" prop="complaintContent" />
      <el-table-column label="投诉时间" align="center" prop="complaintTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.complaintTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:complaints:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:complaints:remove']">删除</el-button>
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

    <!-- 添加或修改投诉反馈对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="complaintsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="投诉人" prop="volunteerId">
          <el-select
            v-model="form.volunteerId"
            placeholder="请选择投诉人"
            style="width: 100%"
            disabled
          >
            <el-option
              v-for="item in volunteerOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <span>{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="投诉内容">
          <editor v-model="form.complaintContent" :min-height="192"/>
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

<script setup name="Complaints">
import { listComplaints, getComplaints, delComplaints, addComplaints, updateComplaints } from "@/api/system/complaints";
import { listVolunteer } from "@/api/system/volunteer";
import useUserStore from '@/store/modules/user';

const { proxy } = getCurrentInstance();
const userInfo = useUserStore();

const complaintsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const volunteerOptions = ref([]);

// 计算属性：志愿者ID到名称的映射
const volunteerMap = computed(() => {
  const map = {};
  volunteerOptions.value.forEach(volunteer => {
    map[volunteer.id] = volunteer.name;
  });
  return map;
});

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    volunteerId: null,
    complaintContent: null,
    complaintTime: null
  },
  rules: {
    volunteerId: [
      { required: true, message: "投诉人不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询投诉反馈列表 */
function getList() {
  loading.value = true;
  listComplaints(queryParams.value).then(response => {
    complaintsList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 获取志愿者列表 */
function getVolunteerList() {
  listVolunteer().then(response => {
    volunteerOptions.value = response.rows;
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
    volunteerId: userInfo.user.volunteerId,
    complaintContent: null,
    complaintTime: null
  };
  proxy.resetForm("complaintsRef");
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
  title.value = "添加投诉反馈";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getComplaints(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改投诉反馈";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["complaintsRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateComplaints(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addComplaints(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除投诉反馈编号为"' + _ids + '"的数据项？').then(function() {
    return delComplaints(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/complaints/export', {
    ...queryParams.value
  }, `complaints_${new Date().getTime()}.xlsx`)
}

getList();
getVolunteerList();
</script>
