<template>
  <el-dialog :title="title" v-model="open" width="960px" append-to-body draggable :close-on-click-modal="false">
    <el-form ref="editRef" :model="form" :rules="rules" label-width="120px">

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label='卡券名称' prop='couponName'>
            <el-input v-model='form.couponName' placeholder='请输入卡券名称' />
          </el-form-item>
          <el-form-item label='有效期开始' prop='dateEnabled'>
            <el-date-picker v-model='form.dateEnabled' type='datetime' value-format='YYYY-MM-DD HH:mm:ss' format="YYYY-MM-DD HH:mm:ss" placeholder='请输入有效期开始' style="width: 660px"/>
          </el-form-item>
          <el-form-item label='有效期结束' prop='dateDisabled'>
            <el-date-picker v-model='form.dateDisabled' type='datetime' value-format='YYYY-MM-DD HH:mm:ss' format="YYYY-MM-DD HH:mm:ss" placeholder='请输入有效期结束' style="width: 660px"/>
          </el-form-item>
          <el-form-item label='发放时间' prop='dateIssued'>
            <el-date-picker v-model='form.dateIssued' type='datetime' value-format='YYYY-MM-DD HH:mm:ss' format="YYYY-MM-DD HH:mm:ss" placeholder='请输入发放时间' style="width: 660px"/>
          </el-form-item>
          <el-form-item label='使用范围' prop='usageScope'>
            <el-input v-model='form.usageScope' placeholder='请输入使用范围' />
          </el-form-item>
          <el-form-item prop='showFlag'>
            <template #label>
              <info-tips label="展示" content="不展示的卡券用于线下卡券,创建后无法修改!"/>
            </template>
            <el-radio-group v-model="form.showFlag" :disabled="!!form.id">
              <el-radio v-for="dict in BOOLEAN" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label='类型' prop='couponType'>
            <el-radio-group v-model="form.couponType">
              <el-radio v-for="dict in COUPON_TYPE" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label='折扣率' prop='discount' v-if="form.couponType === 'DISCOUNT'">
            <el-input-number controls-position="right" v-model='form.discount' :step="0.01" placeholder='请输入折扣率'/>
            <div class="tpis">示例：总价100元，折扣率为{{form.discount}}，折后价格为 {{form.discount * 100}} 元</div>
          </el-form-item>
          <el-form-item label='面值' prop='faceValue' v-if="form.couponType === 'VOUCHERS'">
            <el-input v-model='form.faceValue' placeholder='请输入面值(抵用券)' />
            <div class="tpis">示例：总价100元，面值{{form.faceValue}}元，折后价格为 {{100 - form.faceValue}} 元</div>
          </el-form-item>
          <el-form-item label='最低交易金额' prop='limitAmount'>
            <el-input v-model='form.limitAmount' placeholder='请输入最低交易金额' />
          </el-form-item>
          <el-form-item label='发放数量' prop='quantityTotal'>
            <el-input v-model='form.quantityTotal' placeholder='请输入发放数量' />
          </el-form-item>
          <el-form-item label="LOGO" prop="logo">
            <image-preview v-if="form.logo" :src="form.logo" :height="80" :width="80"/>
            <div style="padding: 0 12px 0 12px">
              <image-choise @select="getIconImage"/>
              <el-button type="danger" v-if="form.logo" @click="removeIconImage">移除图片</el-button>
            </div>
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

<script setup name="PlatformCouponEdit">
import {
  platformCouponInfo,
  platformCouponSave,
} from '@/api/platformCoupon';
import { parseTime } from '@/utils/ruoyi'
import InfoTips from "@/components/InfoTips";
import ImageChoise from '@/views/components/ImageChoise';


const { proxy } = getCurrentInstance();
const { COUPON_TYPE, COUPON_STATUS, BOOLEAN  } = proxy.useDict("COUPON_TYPE", "COUPON_STATUS", "BOOLEAN");

defineExpose({handleEdit})
const emit = defineEmits(['change']);

const open = ref(false);
const loading = ref(false);
const title = ref("");
const form = ref({});
const rules = ref({
  couponName: [{ required: true, message: '卡券名称不能为空', trigger: 'blur'}],
  dateEnabled: [{ required: true, message: '有效期开始不能为空', trigger: 'blur'}],
  dateDisabled: [{ required: true, message: '有效期结束不能为空', trigger: 'blur'}],
  couponType: [{ required: true, message: '类型不能为空', trigger: 'blur'}],
  showFlag: [{ required: true, message: '展示状态不能为空', trigger: 'blur'}],
  // 初始值
  faceValue: [{ required: true, message: '面值不能为空', trigger: 'blur'}],
  discount: [{ required: true, message: '折扣率不能为空', trigger: 'blur'}],
  usageScope: [{ required: true, message: '使用范围不能为空', trigger: 'blur'}],
  limitAmount: [{ required: true, message: '最低交易金额不能为空', trigger: 'blur'}],
  quantityTotal: [{ required: true, message: '发放数量不能为空', trigger: 'blur'}],
});

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {};
  proxy.resetForm("editRef");
}

// 新增/修改按钮操作
function handleEdit(row) {
  reset();
  if (!row || !row.id) {
    open.value = true;
    const now = new Date();
    const nowStr = parseTime(now, '{y}-{m}-{d}_{h}:{i}:{s}');
    const nowDate = parseTime(now, '{y}-{m}-{d}') + ' 00:00:00'
    const toDate = parseTime(now.setMonth(now.getMonth() + 1), '{y}-{m}-{d}') + ' 23:59:59'
    console.log('nowStr', nowStr);
    console.log('nowDate', nowDate);
    console.log('toDate', toDate);
    form.value = {
      couponName: '卡券_' + nowStr,
      logo: 'https://static.wkclz.com/wedouarts/new_product.jpeg',
      couponType: 'VOUCHERS',
      showFlag: 1,
      faceValue: 1.00,
      discount: 0.9,
      dateIssued: nowDate,
      dateEnabled: nowDate,
      dateDisabled: toDate,
      usageScope: '全场通用',
      quantityTotal: 99999,
      limitAmount: 100.00,
    }
    title.value = "新增";
  } else {
    platformCouponInfo({id:row.id}).then(res => {
      form.value = res.data;
      open.value = true;
      title.value = "修改";
    });
  }
}

function getIconImage(val) {
  form.value.logo = val.imageUrl;
}

function removeIconImage() {
  form.value.logo = undefined;
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["editRef"].validate(valid => {
    if (valid) {
      if ('VOUCHERS' === form.valuecouponType && form.valuelimitAmount - form.valuefaceValue <= 0) {
        proxy.$modal.msgError("抵用券的最低消费金额不能小于抵用券的面值");
        return;
      }
      if ('DISCOUNT' === form.valuecouponType && form.valuediscount >= 1) {
        proxy.$modal.msgError("折扣率应当小于1");
        return;
      }
      if ('DISCOUNT' === form.valuecouponType && form.valuediscount <= 0 ) {
        proxy.$modal.msgError("折扣率应当大于0");
        return;
      }

      platformCouponSave(form.value).then(res => {
        proxy.$modal.msgSuccess(form.value.id === undefined ?"新增成功":"修改成功");
        open.value = false;
        emit("change", true);
      });
    }
  });
}
</script>
