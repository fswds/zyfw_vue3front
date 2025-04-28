<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="机构名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入机构名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="机构类型" prop="serviceType">
        <el-select v-model="queryParams.serviceType" placeholder="请选择机构类型" clearable>
          <el-option
            v-for="dict in sys_yanglaojigou_type"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:institutions:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:institutions:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:institutions:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:institutions:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="institutionsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column label="机构名" align="center" prop="name" />
      <el-table-column label="地点" align="center" prop="location" />
      <el-table-column label="建筑信息" align="center" prop="buildingInfo" />
      <el-table-column label="介绍" align="center" prop="description" />
      <el-table-column label="机构类型" align="center" prop="serviceType">
        <template #default="scope">
          <dict-tag :options="sys_yanglaojigou_type" :value="scope.row.serviceType"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:institutions:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:institutions:remove']">删除</el-button>
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

    <!-- 添加或修改养老机构对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="institutionsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="机构名" prop="name">
          <el-input v-model="form.name" placeholder="请输入机构名" />
        </el-form-item>
        <el-form-item label="地点" prop="location">
          <el-input v-model="form.location" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="建筑信息" prop="buildingInfo">
          <el-input v-model="form.buildingInfo" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="介绍">
          <editor v-model="form.description" :min-height="192"/>
        </el-form-item>
        <el-form-item label="机构类型" prop="serviceType">
          <el-radio-group v-model="form.serviceType">
            <el-radio
              v-for="dict in sys_yanglaojigou_type"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
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

<script setup name="Institutions">
import { listInstitutions, getInstitutions, delInstitutions, addInstitutions, updateInstitutions } from "@/api/system/institutions";

const { proxy } = getCurrentInstance();
const { sys_yanglaojigou_type } = proxy.useDict('sys_yanglaojigou_type');

const institutionsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    location: null,
    buildingInfo: null,
    description: null,
    serviceType: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询养老机构列表 */
function getList() {
  loading.value = true;
  listInstitutions(queryParams.value).then(response => {
    institutionsList.value = response.rows;
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
    name: null,
    location: null,
    buildingInfo: null,
    description: null,
    serviceType: null
  };
  proxy.resetForm("institutionsRef");
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
  title.value = "添加养老机构";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getInstitutions(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改养老机构";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["institutionsRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateInstitutions(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addInstitutions(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除养老机构编号为"' + _ids + '"的数据项？').then(function() {
    return delInstitutions(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/institutions/export', {
    ...queryParams.value
  }, `institutions_${new Date().getTime()}.xlsx`)
}

getList();
</script>
