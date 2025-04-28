<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="建筑名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入建筑名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input
          v-model="queryParams.address"
          placeholder="请输入地址"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否空闲" prop="isAvailable">
        <el-input
          v-model="queryParams.isAvailable"
          placeholder="请输入是否空闲"
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
          v-hasPermi="['system:buildings:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:buildings:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:buildings:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:buildings:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="buildingsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="建筑名" align="center" prop="name" />
      <el-table-column label="地址" align="center" prop="address" />
      <el-table-column label="是否空闲" align="center" prop="isAvailable" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:buildings:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:buildings:remove']">删除</el-button>
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

    <!-- 添加或修改建筑管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="buildingsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="建筑名" prop="name">
          <el-input v-model="form.name" placeholder="请输入建筑名" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="是否空闲" prop="isAvailable">
          <el-input v-model="form.isAvailable" placeholder="请输入是否空闲" />
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

<script setup name="Buildings">
import { listBuildings, getBuildings, delBuildings, addBuildings, updateBuildings } from "@/api/system/buildings";

const { proxy } = getCurrentInstance();

const buildingsList = ref([]);
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
    address: null,
    isAvailable: null
  },
  rules: {
    name: [
      { required: true, message: "建筑名不能为空", trigger: "blur" }
    ],
    isAvailable: [
      { required: true, message: "是否空闲不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询建筑管理列表 */
function getList() {
  loading.value = true;
  listBuildings(queryParams.value).then(response => {
    buildingsList.value = response.rows;
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
    address: null,
    isAvailable: null
  };
  proxy.resetForm("buildingsRef");
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
  title.value = "添加建筑管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getBuildings(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改建筑管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["buildingsRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateBuildings(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addBuildings(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除建筑管理编号为"' + _ids + '"的数据项？').then(function() {
    return delBuildings(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/buildings/export', {
    ...queryParams.value
  }, `buildings_${new Date().getTime()}.xlsx`)
}

getList();
</script>
