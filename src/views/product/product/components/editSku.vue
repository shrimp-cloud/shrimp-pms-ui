<template>
  <el-dialog :title="title" v-model="open" width="1200px" append-to-body draggable :close-on-click-modal="false">

    <!--
    <el-form :inline="true" :model="batchSkuData" class="demo-form-inline" >
      <el-form-item label="总价格">
        <el-input-number v-model="batchSkuData.originPrice" controls-position="right" placeholder="总价格"  size="mini"  />
      </el-form-item>
      <el-form-item label="促销价格">
        <el-input-number v-model="batchSkuData.promotionPrice" controls-position="right" placeholder="促销价格"  size="mini" />
      </el-form-item>
      <el-form-item label="订金">
        <el-input-number v-model="batchSkuData.deposit" controls-position="right" placeholder="订金" size="mini"/>
      </el-form-item>
      <el-form-item label="库存">
        <el-input-number v-model="batchSkuData.stock" controls-position="right" placeholder="库存" size="mini"/>
      </el-form-item>
      <el-form-item label="预设销量">
        <el-input-number v-model="batchSkuData.salePre" controls-position="right" placeholder="预设销量" size="mini"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="batchSetSock" size="small">批量设置</el-button>
      </el-form-item>
    </el-form>
    -->

    <el-row :gutter="20">
      <el-col :span="6">
        <el-tree
            ref="propTreeRef"
            default-expand-all
            :expand-on-click-node="false"
            :data="form.props"
            :props="{children: 'propItems'}" >
          <template #default="{ node, data }">

            <!-- 新增 -->
            <span v-if="isCreate">
              <input v-if="node.level === 1" v-model="data.propName" @input="inputNode(node, data)" style="width: 160px; "/>
              <input v-if="node.level === 2" v-model="data.itemValue" @input="inputNode(node, data)" style="width: 160px; "/>

              <!-- 超过1项的，展示 - 图标 -->
              <el-icon v-if="node.level === 1 && form.props.length > 1" @click="removeNode(node, data)"><remove-filled /></el-icon>
              <el-icon v-if="node.level === 2 && node?.parent?.data?.propItems?.length > 1" @click="removeNode(node, data)"><remove-filled /></el-icon>

              <!-- 各元素的最后一项，展示 + 图标. 一级不能超过3个 -->
              <el-icon v-if="node.level === 1 && form.props.length === (data.index + 1) && form.props.length < 3" @click="addNode(node, data)"><circle-plus-filled /></el-icon>
              <el-icon v-if="node.level === 2 && node?.parent?.data?.propItems?.length === (data.index + 1)" @click="addNode(node, data)"><circle-plus-filled /></el-icon>
            </span>

            <!-- 修改 -->
            <span v-if="!isCreate">
              <span>{{data.propName || data.itemValue}}</span>
            </span>

          </template>
        </el-tree>
        <!--

          <p class="custom-tree-node" #default="{ node, data }">
            <template v-if="form.props.length > 0">
              <input type="hidden" v-model="form.props.length">
              <span>{{ data.propertyValue || data.propName }}</span>
              <span>
                <i v-if="id && node.level < 3" class="el-icon-plus noCursor" title="无法增加商品规格" @click="$message.error('增加商品规格属性只适用于新增产品')"/>
                <i v-else-if="node.level < 3" class="el-icon-plus" @click="() => addTreeItem(node, data)"/>

                <i v-if="node.level > 1" class="el-icon-edit" @click="() => editTreeItem(node, data)"/>
                <i v-if="id && node.level > 1" class="el-icon-delete" title="无法删除商品规格" @click="$message.error('删除商品规格属性只适用于新增产品')"/>

                <i v-else-if="node.level > 1" class="el-icon-delete" @click="() => removeTreeItem(node, data)"/>
              </span>
            </template>
            <template v-else>
              <input type="text" v-model="data.propertyName" v-if="node.level === 2" @change="() => closeTreeItem(node, data)">
              <input type="text" v-model="data.propertyValue" v-if="node.level === 3" @change="() => closeTreeItem(node, data)">
              <i class="el-icon-check" @click="() => closeTreeItem(node, data)"/>
            </template>
          </p>
        -->
      </el-col>
      <el-col :span="18">
        <div class="grid-content bg-purple">
          <el-table :data="form.skuStocks" border size="small">
            <el-table-column label="规格" prop="stockDesc" :show-overflow-tooltip="true" min-width="200"/>
            <!--
            <el-table-column label="图片" prop="pic" :show-overflow-tooltip="false" min-width="60">
              <template #default="scope">
                <el-upload class="pic-uploader" action="#"
                    :show-file-list="false"
                    :on-success="handlePicSuccess"
                    :before-upload="beforePicUpload"
                    :http-request="handlePicUpload"
                    :data="{rowStockDesc: scope.row.stockDesc}">
                  <el-image v-if="scope.row.pic" fit="contain" :src="scope.row.pic + '?x-oss-process=image/resize,w_40'"/>
                  <i v-else class="el-icon-plus pic-uploader-icon"></i>
                </el-upload>
              </template>
            </el-table-column>
            -->
            <el-table-column label="总价格" prop="originPrice" :show-overflow-tooltip="true" min-width="100">
              <template #default="scope">
                <el-input size="small" type="number" v-model="scope.row.originPrice" placeholder="总价格"/>
              </template>
            </el-table-column>
            <el-table-column label="促销价格" prop="promotionPrice" :show-overflow-tooltip="true" min-width="100">
              <template #default="scope">
                <el-input size="small" type="number" v-model="scope.row.promotionPrice" placeholder="促销价格"/>
              </template>
            </el-table-column>
            <el-table-column label="订金" prop="deposit" :show-overflow-tooltip="true" min-width="100">
              <template #default="scope">
                <el-input size="small" type="number" v-model="scope.row.deposit" placeholder="订金"/>
              </template>
            </el-table-column>
            <el-table-column label="库存" prop="stock" :show-overflow-tooltip="true" min-width="100">
              <template #default="scope">
                <el-input size="small" type="number" v-model="scope.row.stock" placeholder="库存"/>
              </template>
            </el-table-column>
            <el-table-column label="预设销量" prop="salePre" :show-overflow-tooltip="true" min-width="100">
              <template #default="scope">
                <el-input size="small" type="number" v-model="scope.row.salePre" placeholder="预设销量"/>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm" v-hasPermi="['create', 'update']">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="ProductSku">
import { skuStockList, productSave } from "@/api/product";
import ImageChoise from '@/views/components/ImageChoise';

defineExpose({handleEdit})
const emit = defineEmits(['change']);
const { proxy } = getCurrentInstance();
const open = ref(false);
const title = ref("");
const isCreate = ref(true);
const form = ref({
  props: [],
  skuStocks: []
});

const defaultProps = [
  {id: 1, propName: '颜色', propItems: [{id: 1, itemValue: '白色'},{id: 2, itemValue: '黑色'}]},
  {id: 2, propName: '尺寸', propItems: [{id: 3, itemValue: '中杯'},{id: 4, itemValue: '大杯'}, {id: 5, itemValue: '超大杯'}]},
  {id: 3, propName: '糖份', propItems: [{id: 6, itemValue: '少糖'},{id: 7, itemValue: '多糖'}]},
];
const defaultPropsBack = [
  {propName: '颜色', propItems: [{itemValue: '白色'},{itemValue: '黑色'}]},
  {propName: '尺寸', propItems: [{itemValue: '中杯'},{itemValue: '大杯'}, {itemValue: '超大杯'}]},
  {propName: '糖份', propItems: [{itemValue: '少糖'},{itemValue: '多糖'}]},
];

function reset() {
  form.value.skuStocks = [];
  form.value.props = [];
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

// 新增/修改按钮操作
function handleEdit(row) {
  reset();
  skuStockList({productId: row.id}).then(res => {
    form.value = res.data;
    if (res.data.skuStocks.length > 0) {
      isCreate.value = false;
    }
    form.value.skuStocks = res.data.skuStocks;
    const props = res.data.props;
    form.value.props = props && props.length > 0 ?  props : defaultProps;
    addIndex(form.value.props);
    calcSkuStocks(form.value.props);
    open.value = true;
    title.value = "SKU 维护";
  });
}
// 增加节点
function addNode(node, data) {
  const props = form.value.props;
  // 添加的是属性
  if (node.level === 1) {
    props.push({propName: '属性名称' + (data.index + 2), propItems: [{itemValue: '枚举名称1'}]})
  }
  // 添加的是枚举
  if (node.level === 2) {
    proxy.$refs["propTreeRef"].append({itemValue: '枚举名称' + (data.index + 2)},  node.parent);
  }
  // 重新计算 index
  addIndex(form.value.props);
  calcSkuStocks(form.value.props);
}
// 移除节点
function removeNode(node, data) {
  proxy.$refs["propTreeRef"].remove(node);
  addIndex(form.value.props);
  calcSkuStocks(form.value.props);
}

function inputNode(node, data) {
  console.log('inputNode', node, data);
  calcSkuStocks(form.value.props);
}


function calcSkuStocks(props) {
  /*
  const newSku = props[0].id === undefined;
  const prop0Size = props.length === 1 ? props[0].propItems.length : 1;
  const prop1Size = props.length === 2 ? props[1].propItems.length : 1;
  const prop2Size = props.length === 3 ? props[2].propItems.length : 1;
  const skuSize = prop0Size * prop1Size * prop2Size;
  const skuStocks = newSku ? [skuSize]: form.value.skuStocks;
   */
  const skuProps = cartesianProductOf(props);
  console.log(rt);

}
function cartesianProductOf(props) {
  return Array.prototype.reduce.call(props, function(a, b) {
    const result = [];
    a.forEach(ia => {
      b.propItems.forEach(ib => {
        result.push(ia.concat(ib))
      })
    })
    return result
  }, [[]])
}


/** 提交按钮 */
function submitForm() {
  proxy.$refs["editRef"].validate(valid => {
    if (valid) {
      productSave(form.value).then(res => {
        proxy.$modal.msgSuccess("修保存成功");
        open.value = false;
        emit("change", true);
      });
    }
  });
}

// 附加序列号
function addIndex(data) {
  for (let i = 0; i < data.length; i++) {
    data[i].index = i;
    for (let j = 0; j < data[i].propItems.length; j++) {
      data[i].propItems[j].index = j;
    }
  }
}

</script>
