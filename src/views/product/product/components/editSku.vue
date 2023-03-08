<template>
  <el-dialog :title="title" v-model="open" width="1280px" append-to-body draggable :close-on-click-modal="false">


    <el-row :gutter="20">
      <el-col :span="5">
        <el-tree
            ref="propTreeRef"
            default-expand-all
            :expand-on-click-node="false"
            :data="form.props"
            :props="{children: 'propItems'}" >
          <template #default="{ node, data }">

            <!-- 新增 -->
            <span v-if="isCreate">
              <el-input size="small" v-if="node.level === 1" v-model="data.propName" @input="inputNode(node, data)" style="width: 160px; "/>
              <el-input size="small" v-if="node.level === 2" v-model="data.itemValue" @input="inputNode(node, data)" style="width: 160px; "/>

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
      <el-col :span="19">

        <el-form :inline="true" :model="batchSkuData" class="demo-form-inline" >
          <el-form-item label="总价">
            <el-input-number size="small" v-model="batchSkuData.originPrice" controls-position="right" placeholder="总价格" style="width: 100px;"/>
          </el-form-item>
          <el-form-item label="促销价">
            <el-input-number size="small" v-model="batchSkuData.promotionPrice" controls-position="right" placeholder="促销价格" style="width: 100px;"/>
          </el-form-item>
          <el-form-item label="订金">
            <el-input-number size="small" v-model="batchSkuData.deposit" controls-position="right" placeholder="订金"  style="width: 100px;"/>
          </el-form-item>
          <el-form-item label="库存">
            <el-input-number size="small" v-model="batchSkuData.stock" controls-position="right" placeholder="库存"  style="width: 80px;"/>
          </el-form-item>
          <el-form-item label="预销量">
            <el-input-number size="small" v-model="batchSkuData.salePre" controls-position="right" placeholder="预销量"  style="width: 90px;"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="batchSetSock" size="small">批量设置</el-button>
          </el-form-item>
        </el-form>

        <div class="grid-content bg-purple">
          <el-table :data="form.skuStocks" border size="small">
            <el-table-column label="规格" prop="stockDesc" :show-overflow-tooltip="true" min-width="160"/>
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
                <el-input-number size="small" type="number" v-model="scope.row.originPrice" controls-position="right" placeholder="总价格"/>
              </template>
            </el-table-column>
            <el-table-column label="促销价格" prop="promotionPrice" :show-overflow-tooltip="true" min-width="100">
              <template #default="scope">
                <el-input-number size="small" type="number" v-model="scope.row.promotionPrice" controls-position="right" placeholder="促销价格"/>
              </template>
            </el-table-column>
            <el-table-column label="订金" prop="deposit" :show-overflow-tooltip="true" min-width="100">
              <template #default="scope">
                <el-input-number size="small" type="number" v-model="scope.row.deposit" controls-position="right" placeholder="订金"/>
              </template>
            </el-table-column>
            <el-table-column label="库存" prop="stock" :show-overflow-tooltip="true" min-width="100">
              <template #default="scope">
                <el-input-number size="small" type="number" v-model="scope.row.stock" controls-position="right" placeholder="库存"/>
              </template>
            </el-table-column>
            <el-table-column label="预设销量" prop="salePre" :show-overflow-tooltip="true" min-width="100">
              <template #default="scope">
                <el-input-number size="small" type="number" v-model="scope.row.salePre" controls-position="right" placeholder="预设销量"/>
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
import {skuStockList, productSave, productRemove} from "@/api/product";
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

const batchSkuData = ref({});

const defaultProps = [
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
  calcSkuStocks(form.value.props);
}

function calcSkuStocks(props) {
  const skuProps = cartesianProductOf(props);
  const skuStocks = [];
  for (let skuProp of skuProps) {
    const sku = {};
    let stockDesc = skuProp[0].itemValue;

    sku.prop1Id = skuProp[0].propId;
    sku.item1Id = skuProp[0].id;
    sku.item1Desc = skuProp[0].itemValue;
    if (skuProp.length > 1) {
      stockDesc = stockDesc + '-' + skuProp[1].itemValue;
      sku.prop2Id = skuProp[1].propId;
      sku.item2Id = skuProp[1].id;
      sku.item2Desc = skuProp[1].itemValue;
    }
    if (skuProp.length > 2) {
      stockDesc = stockDesc + '-' + skuProp[2].itemValue;
      sku.prop3Id = skuProp[2].propId;
      sku.item3Id = skuProp[2].id;
      sku.item3Desc = skuProp[2].itemValue;
    }
    sku.stockDesc = stockDesc;
    skuStocks.push(sku);
  }
  form.value.skuStocks = skuStocks;
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

function batchSetSock() {
  proxy.$modal.confirm('批量设置会覆盖所有已填写的内容，确定要批量设置吗？').then(() => {
    const bsd = batchSkuData.value;
    for (let sku of form.value.skuStocks) {
      sku.originPrice = bsd.originPrice;
      sku.promotionPrice = bsd.promotionPrice;
      sku.deposit = bsd.deposit;
      sku.stock = bsd.stock;
      sku.salePre = bsd.salePre;
    }
  }).catch(() => {});
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
