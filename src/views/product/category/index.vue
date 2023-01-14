<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item prop="categoryName">
        <el-input v-model="queryParams.categoryName" placeholder="分类名" clearable style="width: 160px" @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item prop="visible">
        <el-select v-model="queryParams.visible" placeholder="可见" clearable style='width: 100px'>
          <el-option v-for="dict in BOOLEAN" :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-form-item style="float: right; ">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table
        v-if="refreshTable"
        v-loading="loading"
        :data="dataList"
        row-key="categoryCode"
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column label="分类名" prop="categoryName" min-width="160"/>
      <el-table-column label="可见" align="center" prop="visible" min-width="80">
        <template #default="scope"><dict-tag :options="BOOLEAN" :value="scope.row.visible"/></template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" min-width="80"/>
      <el-table-column label="修改人" align="left" prop="updateByName" min-width="100" :show-overflow-tooltip="true"/>
      <el-table-column label="修改时间" align="center" prop="updateTime" min-width="160">
        <template #default="scope"><span>{{ parseTime(scope.row.updateTime) }}</span></template>
      </el-table-column>
      <el-table-column label="创建人" align="left" prop="createByName" min-width="100" :show-overflow-tooltip="true"/>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="160">
        <template #default="scope"><span>{{ parseTime(scope.row.createTime) }}</span></template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button type="text" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="text" icon="Plus" @click="handleAdd(scope.row)">新增</el-button>
          <el-button v-if="!scope.row.children" type="text" icon="Delete" @click="handleDelete(scope.row)" >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <edit ref="editRef" @change="getList"/>
  </div>
</template>

<script setup name="ProductCategoryList">
import { productCategoryList, productCategoryRemove} from "@/api/productCategory";
import Edit from "./components/edit"

const { proxy } = getCurrentInstance();
const { BOOLEAN } = proxy.useDict("BOOLEAN");

const dataList = ref([]);
const open = ref(false);
const loading = ref(true);
const isExpandAll = ref(true);
const refreshTable = ref(true);

const queryParams = ref({
  categoryName: undefined,
  visible: undefined
});

/** 查询部门列表 */
function getList() {
  loading.value = true;
  productCategoryList(queryParams.value).then(res => {
    const datas = res.data;
    dataList.value = proxy.handleTree(datas, "categoryCode", "pcode", "children");
  }).finally(() => {
    loading.value = false;
  });
}

/** 搜索按钮操作 */
function handleQuery() {
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

function handleAdd(row) {
  const param = {};
  if (row) {
    param.pcode = row.categoryCode;
  }
  proxy.$refs["editRef"].handleEdit(param);
}
function handleUpdate(row) {
  proxy.$refs["editRef"].handleEdit(row);
}


/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除名称为"' + row.categoryName + '"的数据项？').then(() => {
    productCategoryRemove({id: row.id}).then(res => {
      if (res.code === 1) {
        getList();
        proxy.$modal.msgSuccess("删除成功");
      } else {
        proxy.$modal.msgError('删除失败: ' + res.msg);
      }
    })
  }).catch(() => {});
}

getList();
</script>
