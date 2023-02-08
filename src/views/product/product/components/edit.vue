<template>
  <el-dialog :title="title" v-model="open" width="800px" append-to-body draggable :close-on-click-modal="false">
    <el-form ref="editRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="商品名称" prop="productName">
        <el-input v-model="form.productName" placeholder="请输入商品名称" />
      </el-form-item>
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

defineExpose({handleEdit})
const emit = defineEmits(['change']);
const { proxy } = getCurrentInstance();
const open = ref(false);
const title = ref("");
const form = ref({});
const rules = ref({
  productName: [{ required: true, message: "商品名称不能为空", trigger: "blur" }],
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
  if (!row || !row.id) {
    open.value = true;
    title.value = "添加商品";
  } else {
    productInfo({id:row.id}).then(res => {
      form.value = res.data;
      open.value = true;
      title.value = "修改商品";
    });
  }
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