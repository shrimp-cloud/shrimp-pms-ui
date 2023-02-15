<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
      <el-form-item prop="appCode">
        <el-input v-model="queryParams.productName" placeholder="商品名称" clearable style="width: 160px" @keyup.enter="handleQuery"/>
      </el-form-item>
      <!--
      <el-form-item>
        <el-date-picker v-model="dateRange" style='width: 380px' value-format="YYYY-MM-DD HH:mm:ss" type="datetimerange" range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间"/>
      </el-form-item>
      -->
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery" v-hasPermi="['page']">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-form-item style="float: right">
        <el-button type="primary" icon="Plus" @click="handleAdd" v-hasPermi="['create']">新增</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :height="tableHeight" :data="dataList">
      <el-table-column label="ID" align="center" prop="id" width="80"/>
      <el-table-column label="商品名称" align="left" prop="productName" min-width="120" :show-overflow-tooltip="true" />
      <!--
      <el-table-column label="应用名称" align="left" prop="appName" min-width="160" :show-overflow-tooltip="true" />
      <el-table-column label="访问地址" align="left" prop="domain" min-width="240" :show-overflow-tooltip="true"/>
      <el-table-column label="排序" align="left" prop="sort" min-width="80" :show-overflow-tooltip="true"/>
      <el-table-column label="备注" align="left" prop="comments" min-width="200" :show-overflow-tooltip="true"/>
      -->
      <el-table-column label="修改人" align="left" prop="updateBy" width="100" :show-overflow-tooltip="true"/>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="160">
        <template #default="scope"><span>{{ parseTime(scope.row.updateTime) }}</span></template>
      </el-table-column>
      <el-table-column label="创建人" align="left" prop="createBy" width="100" :show-overflow-tooltip="true"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template #default="scope"><span>{{ parseTime(scope.row.createTime) }}</span></template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed='right' width="160" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button type="text" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['update']">修改</el-button>
          <el-button type="text" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.current"
        v-model:limit="queryParams.size"
        @pagination="getList"
    />

    <edit-base ref="editBaseRef" @change="getList"/>
  </div>
</template>

<script setup name="ProductPage">
import {productPage, productRemove} from "@/api/product";
import EditBase from "./components/editBase";
import {parseTime} from "@/utils/ruoyi";

const { proxy } = getCurrentInstance();
const tableHeight = computed(() => window.innerHeight - 216);
const dataList = ref([]);
const loading = ref(true);
const total = ref(0);
const dateRange = ref([]);
const queryParams = ref({
  current: 1,
  size: 20,
  productName: undefined,
});

function init() {
  const now = new Date();
  dateRange.value = [
    parseTime(now.setDate(now.getMonth()-1), '{y}-{m}-{d}') + ' 00:00:00',
    parseTime(new Date(), '{y}-{m}-{d}') + ' 23:59:59'
  ];
  queryParams.value.current = 1;
}

/** 查询参数列表 */
function getList() {
  loading.value = true;
  productPage(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
    const data = res.data;
    dataList.value = data.rows;
    total.value = data.total;
  }).finally(() => {
    loading.value = false;
  });
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.current = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  init();
  proxy.resetForm("queryRef");
  handleQuery();
}

function handleAdd() {
  proxy.$refs["editBaseRef"].handleEdit();
}
function handleUpdate(row) {
  proxy.$refs["editBaseRef"].handleEdit(row);
}

/** 删除按钮操作 */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除商品: "' + row.productName + '"？').then(() => {
    productRemove({id: row.id}).then(res => {
      if (res.code === 1) {
        getList();
        proxy.$modal.msgSuccess("删除成功");
      } else {
        proxy.$modal.msgError('删除失败: ' + res.msg);
      }
    })
  }).catch(() => {});
}

init();
getList();
</script>
