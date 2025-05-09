<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="组织名" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入组织名"
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
            @click="handleAdd" v-hasRole="['admin','admin2']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate" v-hasRole="['admin','admin2']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete" v-hasRole="['admin','admin2']"
        >删除
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="organizationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="组织编号" width="90" align="center" prop="id"/>
      <el-table-column label="组织名" width="255" align="center" prop="name"/>
      <el-table-column label="组织介绍" align="center" prop="introduce" show-overflow-tooltip/>
      <el-table-column label="操作" align="center"
                       class-name="small-padding fixed-width" width="300">
        <template #default="scope">
          <div>
<!--            <el-button link type="primary" @click="handleAddRelation(scope.row)" :disabled="scope.row.userId !=null"-->
<!--            >加入组织-->
<!--            </el-button>-->
            <el-button link type="primary" @click="handleRoute('/organization/people/'+scope.row.id)"
            >人员管理
            </el-button>
            <el-button link type="primary" icon="Edit" v-hasRole="['admin','admin2','organizationadmin']"
                       @click="handleUpdate(scope.row)"
            >修改
            </el-button>
            <el-button link type="primary" icon="Delete" v-hasRole="['admin','admin2']"
                       @click="handleDelete(scope.row)"
            >删除
            </el-button>
          </div>
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

    <!-- 添加或修改志愿组织信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body
               :close-on-click-modal="false">
      <el-form ref="organizationRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="组织名" prop="name">
          <el-input v-model="form.name" placeholder="请输入组织名"/>
        </el-form-item>
        <el-form-item label="组织介绍" prop="introduce">
          <el-input type="textarea" v-model="form.introduce" placeholder="请输入组织介绍"/>
        </el-form-item>
        <el-form-item label="备注" prop="extra">
          <el-input v-model="form.extra" placeholder="请输入备注"/>
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

<script setup name="Organization">
import {
  addOrganization,
  delOrganization,
  getOrganization,
  listOrganization,
  updateOrganization
} from "@/api/system/organization";
import {useRouter} from "vue-router";
import useUserStore from '@/store/modules/user.js'
import {addRelation} from "@/api/system/volunteerOrganizationRelation.js";

const {proxy} = getCurrentInstance();
const {sys_user_sex, sys_activity_status} = proxy.useDict("sys_user_sex", "sys_activity_status");
const organizationList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const router = useRouter()
const userInfo = useUserStore()
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    introduce: null,
    extra: null,
    status: null,
  },
  rules: {
    name: [
      {required: true, message: "组织名不能为空", trigger: "blur"}
    ],
    introduce: [
      {required: true, message: "组织介绍不能为空", trigger: "blur"}
    ],
    createTime: [
      {required: true, message: "组织创建时间不能为空", trigger: "blur"}
    ],
    updateTime: [
      {required: true, message: "更新时间不能为空", trigger: "blur"}
    ]
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询志愿组织信息列表 */
function getList() {
  loading.value = true;
  // listOrganization(queryParams.value).then(response => {
  listOrganization({userId: userInfo.user.userId, ...queryParams.value}).then(response => {
    organizationList.value = response.rows;
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
    introduce: null,
    extra: null,
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("organizationRef");
}

/*人员管理*/
function handleRoute(route) {
  router.push(route)
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
  title.value = "添加志愿组织信息";
}

/*审核操作*/
function handleView(row, type) {
  let data = {...row}
  if (type === 'yes') {
    data.status = "2"
  } else if (type === 'no') {
    data.status = '3'
  } else {
    data.status = '1'
  }
  updateOrganization(data).then(response => {
    proxy.$modal.msgSuccess("修改成功");
    getList();
  });
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getOrganization(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改志愿组织信息";
  });
}

function handleAddRelation(row) {
  let data = {}
  data.userId = userInfo.user.userId
  data.organizationId = row.id
  data.volunteerId = userInfo.user.volunteerId
  data.volunteerId = userInfo.user.volunteerId
  addRelation(data).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改志愿组织信息";
    getList()
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["organizationRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateOrganization(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addOrganization(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除志愿组织信息编号为"' + _ids + '"的数据项？').then(function () {
    return delOrganization(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/organization/export', {
    ...queryParams.value
  }, `organization_${new Date().getTime()}.xlsx`)
}

getList();
</script>
