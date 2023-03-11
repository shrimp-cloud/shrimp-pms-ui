<template>
  <el-dialog :title="title" v-model="open" width="900px" append-to-body draggable :close-on-click-modal="false">

    <el-form ref="editRef" :model="form" :rules="rules" label-width="120px">
      <el-tabs type="border-card" v-model="activeName">
        <el-tab-pane name="baseInfo" label="基础信息">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商品名称" prop="productName">
                <el-input v-model="form.productName" placeholder="请输入商品名称" />
              </el-form-item>
              <el-form-item label="商品类型" prop="productType">
                <el-radio-group v-model="form.productType">
                  <el-radio v-for="dict in PRODUCT_TYPE" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="商品分类" prop="categoryCode">
                <el-tree-select
                    style="width: 100%; "
                    v-model="form.categoryCode"
                    :data="categoryOptions"
                    :render-after-expand="false"
                    node-key="categoryCode"
                    :check-strictly="true"
                    default-expand-all
                    placeholder="选择分类"
                    :props="{label: 'categoryName', value: 'categoryCode'}"/>
              </el-form-item>
              <el-form-item label="使用范围" prop="useScope">
                <el-input v-model="form.useScope" placeholder="请输入 使用范围" />
              </el-form-item>
              <el-form-item label="单位" prop="unit">
                <el-input v-model="form.unit" placeholder="请输入 单位" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="封面" prop="pic">
                <sh-image v-model="form.pic" placeholder="请选择图片"/>
              </el-form-item>
              <el-form-item label="关键词" prop="keywords">
                <el-input v-model="form.keywords" placeholder="请输入 关键词" />
              </el-form-item>
              <el-form-item label="商品描述" prop="description" style="width: 380px">
                <el-input v-model="form.description" placeholder="请输入 商品描述" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane name="detail1Html" label="图文详情">
          <el-form-item prop="detail1Html" label-width="0px">
            <rich-text v-model:value="form.detail1Html" ref="detail1HtmlRef" placeholder="请编辑商品图文信息"/>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm" v-hasPermi="['create', 'update']">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="ProductEdit">
import { productInfo, productSave } from "@/api/product";
import {  productCategoryOptions } from "@/api/productCategory";
import RichText from '@/components/RichText';
import ShImage from '@/views/components/ShImage';

defineExpose({handleEdit})
const emit = defineEmits(['change']);
const { proxy } = getCurrentInstance();
const { PRODUCT_TYPE } = proxy.useDict("PRODUCT_TYPE");
const activeName = ref('baseInfo')
const open = ref(false);
const title = ref("");
const categoryOptions = ref([]);
const form = ref({});
const rules = ref({
  productName: [{ required: true, message: "商品名称 不能为空", trigger: "blur" }],
  productType: [{ required: true, message: "商品类型 不能为空", trigger: "blur" }],
  categoryCode: [{ required: true, message: "商品分类 不能为空", trigger: "blur" }],
  pic: [{ required: true, message: "封面 必需上传", trigger: "blur" }],
});

/** 表单重置 */
function reset() {
  form.value = {};
  proxy.resetForm("editRef");
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

// 新增/修改按钮操作
function handleEdit(row) {
  reset();
  activeName.value = 'baseInfo';
  if (!row || !row.id) {
    open.value = true;
    title.value = "添加商品";
    getCategoryOptions();
  } else {
    productInfo({id:row.id}).then(res => {
      form.value = res.data;
      open.value = true;
      title.value = "修改商品";
      getCategoryOptions();
    });
  }
}

function getCategoryOptions() {
  productCategoryOptions({}).then(res => {
    const datas = res.data;
    categoryOptions.value = datas; // proxy.handleTree(datas, "categoryCode", "pcode", "children");
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["editRef"].validate(valid => {
    if (valid) {
      productSave(form.value).then(res => {
        proxy.$modal.msgSuccess(form.value.id? "修改成功":"新增成功");
        open.value = false;
        emit("change", true);
      });
    }
  });
}
</script>
