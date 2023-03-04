<template>
  <div class='app-container'>
    <el-form :model='queryParams' :inline='true'>
      <el-form-item prop='couponNo'>
        <el-input v-model='queryParams.couponNo' placeholder='卡券编码' clearable style='width: 160px' @keyup.enter='handleQuery' />
      </el-form-item>
      <el-form-item prop='couponName'>
        <el-input v-model='queryParams.couponName' placeholder='卡券名称' clearable style='width: 160px' @keyup.enter='handleQuery' />
      </el-form-item>
      <el-form-item prop='couponType'>
        <el-select v-model='queryParams.couponType' placeholder='类型' clearable filterable style='width: 120px' @change="handleQuery">
          <el-option v-for='dict in COUPON_TYPE' :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item prop='couponStatus'>
        <el-select v-model='queryParams.couponStatus' placeholder='卡券状态' clearable filterable style='width: 120px' @change="handleQuery">
          <el-option v-for='dict in COUPON_STATUS' :key="dict.value" :label="dict.label" :value="dict.value"/>
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

    <el-table v-loading='loading' :height="tableHeight" :data='dataList'>
      <el-table-column label='ID' prop='id' width='60' />
      <el-table-column label='logo' prop='logo' :show-overflow-tooltip='true' width='80'>
        <template #default='scope'>
          <el-image style='width: 40px; height: 40px' :src='scope.row.logo' :preview-src-list=[scope.row.logo]></el-image>
        </template>
      </el-table-column>
        <el-table-column label='卡券编码' prop='couponNo' min-width='200' :show-overflow-tooltip='true' />
        <el-table-column label='卡券名称' prop='couponName' min-width='200' :show-overflow-tooltip='true' />
      <el-table-column label='有效期开始' align='center' prop='dateEnabled' width='160'>
        <template #default='scope'><span v-if='scope.row.dateEnabled'>{{ parseTime(scope.row.dateEnabled) }}</span></template>
      </el-table-column>
      <el-table-column label='有效期结束' align='center' prop='dateDisabled' width='160'>
        <template #default='scope'><span v-if='scope.row.dateDisabled'>{{ parseTime(scope.row.dateDisabled) }}</span></template>
      </el-table-column>
      <el-table-column label='发放时间' align='center' prop='dateIssued' width='160'>
        <template #default='scope'><span v-if='scope.row.dateIssued'>{{ parseTime(scope.row.dateIssued) }}</span></template>
      </el-table-column>
      <el-table-column label='类型' prop='couponType' width='100' :show-overflow-tooltip='true' >
        <template #default='scope'><dict-tag :options="COUPON_TYPE" :value="scope.row.couponType"/></template>
      </el-table-column>
      <el-table-column label='展示状态' prop='showFlag' width='100' :show-overflow-tooltip='true' >
        <template #default='scope'><dict-tag :options="BOOLEAN" :value="scope.row.showFlag"/></template>
      </el-table-column>
      <el-table-column label='使用范围' prop='usageScope' width='100' :show-overflow-tooltip='true' />
      <el-table-column label='最低金额' prop='limitAmount' width='100' :show-overflow-tooltip='true' />
      <el-table-column label='折扣' align='center' width='100' class-name='small-padding fixed-width'>
        <template #default='scope'>
          <span>{{ scope.row.couponType === 'DISCOUNT' ? scope.row.discount:'-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label='面值' align='center' width='100' class-name='small-padding fixed-width'>
        <template #default='scope'>
          <span>{{ scope.row.couponType === 'VOUCHERS' ? scope.row.faceValue:'-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label='发放数量' prop='quantityTotal' width='100' :show-overflow-tooltip='true' />
      <el-table-column label='剩余数量' prop='quantityLeave' width='100' :show-overflow-tooltip='true' />
      <el-table-column label='创建时间' align='center' prop='createTime' width='160'>
        <template #default='scope'><span v-if='scope.row.createTime'>{{ parseTime(scope.row.createTime) }}</span></template>
      </el-table-column>
      <el-table-column label='更新时间' align='center' prop='updateTime' width='160'>
        <template #default='scope'><span v-if='scope.row.updateTime'>{{ parseTime(scope.row.updateTime) }}</span></template>
      </el-table-column>
      <el-table-column label='卡券状态' align='center' fixed='right' width='120' class-name='small-padding fixed-width'>
        <template #default='scope'><dict-tag :options="COUPON_STATUS" :value="scope.row.couponStatus"/></template>
      </el-table-column>
        <el-table-column label='操作' align='center' fixed='right' width='160' class-name='small-padding fixed-width'>
          <template #default='scope'>
            <el-button type='text' icon='el-icon-edit' @click='handleUpdate(scope.row)'>修改</el-button>
            <el-button type='text' icon='el-icon-delete' @click='handleDelete(scope.row)'>删除</el-button>
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
    <edit ref="editRef" @change="getList"/>
  </div>
</template>

<script setup name="PlatformCouponPage">
import {
  platformCouponPage,
  platformCouponRemove,
  platformCouponStatusOn,
  platformCouponStatusOff,
} from '@/api/platformCoupon';
import Edit from "./components/edit"

const tableHeight = computed(() => window.innerHeight - 216);
const { proxy } = getCurrentInstance();
const { COUPON_TYPE, COUPON_STATUS, BOOLEAN  } = proxy.useDict("COUPON_TYPE", "COUPON_STATUS", "BOOLEAN");

const dataList = ref([]);
const loading = ref(false);
const total = ref(0);
const dateRange = ref([]);

const queryParams = ref({
  current: 1,
  size: 20,
  couponNo: undefined,
  couponName: undefined,
  couponType: undefined,
  couponStatus: undefined
});

function init() {
  queryParams.value.current = 1;
}

/** 查询参数列表 */
function getList() {
  loading.value = true;
  platformCouponPage(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
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
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}


// 上下架
function handlePublish(row) {
  loading.value = true;
  if (row.couponStatus === 'ISSUED') {
    platformCouponStatusOn({id: row.id}).then((res) => {
      getList();
    }).finally(() => {
      loading.value = false;
    });
  } else {
    platformCouponStatusOff({id: row.id}).then((res) => {
      getList();
    }).finally(() => {
      loading.value = false;
    });
  }
}

function handleAdd() {
  proxy.$refs["editRef"].handleEdit();
}
function handleUpdate(row) {
  proxy.$refs["editRef"].handleEdit(row);
}

/** 删除按钮操作 */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除为"' + row.title + '"的数据项？').then(() => {
    platformCouponRemove({id: row.id}).then(res => {
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
