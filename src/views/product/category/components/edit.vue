
<template>
  <el-dialog :title="title" v-model="open" width="660px" append-to-body>
    <el-form ref="editRef" :model="form" :rules="rules" label-width="80px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="分类编码" prop="categoryCode" v-if="form.categoryCode">
            <el-input disabled v-model="form.categoryCode"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分类名称" prop="categoryName">
            <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="父类" prop="pcode">
            <el-tree-select
                style="width: 100%; "
                v-model="form.pcode"
                :data="categoryOptions"
                :render-after-expand="false"
                node-key="categoryCode"
                default-expand-all
                placeholder="选择父类"
                :props="{label: 'categoryName', value: 'categoryCode', disabled: 'disabled'}"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示排序" prop="sort">
            <el-input-number v-model="form.sort" controls-position="right" :min="0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="展示" prop="visible">
            <el-radio-group v-model="form.visible">
              <el-radio v-for="dict in BOOLEAN" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>


<script setup name="ProductCategoryEdit">
import { productCategoryInfo, productCategorySave, productCategoryOptions } from "@/api/productCategory";

defineExpose({handleEdit})
const emit = defineEmits(['change']);
const { proxy } = getCurrentInstance();
const { BOOLEAN } = proxy.useDict("BOOLEAN");

const open = ref(false);
const loading = ref(true);
const title = ref("");
const categoryOptions = ref([]);
const form = ref({});
const rules = ref({
  pcode: [{ required: true, message: "父类不能为空", trigger: "blur" }],
  categoryName: [{ required: true, message: "分类名不能为空", trigger: "blur" }],
  visible: [{ required: true, message: "是否可见必选", trigger: "blur" }],
});

// 新增/修改按钮操作
function handleEdit(row) {
  reset();
  if (!row || !row.id) {
    form.value.pcode = row.pcode;
    console.log('form.value', form.value);
    open.value = true;
    title.value = "添加";
    getCategoryOptions();
  } else {
    productCategoryInfo({id:row.id}).then(res => {
      form.value = res.data;
      console.log('form.value', form.value);
      open.value = true;
      title.value = "修改";
      getCategoryOptions();
    });
  }
}


function getCategoryOptions() {
  productCategoryOptions({}).then(res => {
    const datas = res.data;
    datas.push({categoryCode: "0", categoryName: "顶级"});
    categoryOptions.value = proxy.handleTree(datas, "categoryCode", "pcode", "children", form.value.categoryCode);
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}
/** 表单重置 */
function reset() {
  form.value = {
    visible: 1,
    sort: 0
  };
  proxy.resetForm("editRef");
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["editRef"].validate(valid => {
    if (valid) {
      productCategorySave(form.value).then(res => {
        if (res.code !== 1) {
          proxy.$modal.msgError("保存失败:" + res.msg);
        } else {
          proxy.$modal.msgSuccess(form.value.id === undefined ?"新增成功":"修改成功");
          open.value = false;
          emit("change", true);
        }
      });
    }
  });
}

</script>
