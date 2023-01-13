<template>
  <div>
    <el-button type="primary" @click="getList">选择图片</el-button>

    <el-dialog :title="title" v-model="open" width="840px" append-to-body draggable :close-on-click-modal="false">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item prop="imageType">
          <el-radio-group v-model="queryParams.imageType" class="ml-4" @change="handleQuery">
            <el-radio label="" size="large">全部</el-radio>
            <el-radio v-for="dict in IMAGE_TYPE" :label="dict.value" size="large">{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div v-if="!dataList || dataList.length ===0">
        <el-empty description="无图片" />
      </div>
      <el-row v-if="dataList && dataList.length > 0" :gutter="10" class="mb8">
        <el-col :span="4" v-for="image in dataList">
          <img :src="image.imageUrl" :alt="image.imageName" style="width: 120px; height: 120px;" @click="click(image)"/>
          <span>{{image.imageName}}</span>
        </el-col>
      </el-row>

      <pagination
          v-show="total > 0"
          :total="total"
          :sizes="[12,24,48,96]"
          v-model:page="queryParams.current"
          v-model:limit="queryParams.size"
          @pagination="getList"
      />
    </el-dialog>
  </div>
</template>

<script setup name="ImageLibraryDialog">
import { imageLibraryPage } from "@/api/imageLib";

const props = defineProps({
  width: {
    type: Number,
    default: 280,
  },
});

const emit = defineEmits(['select']);
const { proxy } = getCurrentInstance();
const { IMAGE_TYPE } = proxy.useDict("IMAGE_TYPE");

const dataList = ref([]);
const open = ref(false);
const loading = ref(true);
const total = ref(0);
const title = ref("单击-选择图片");
const queryParams = ref({
  current: 1,
  size: 12,
  imageType: undefined,
});
const image = ref({
  imageUrl: undefined,
  imageAlt: undefined,
});

/** 查询参数列表 */
function getList() {
  open.value = true;
  loading.value = true;
  queryParams.value.current = 1;
  imageLibraryPage(queryParams.value).then(res => {
    const data = res.data;
    dataList.value = data.rows;
    total.value = data.total;
  }).finally(() => {
    loading.value = false;
  });
}

/** 选择数据 */
function click(val) {
  image.value.imageUrl = val.imageUrl;
  image.value.imageAlt = val.imageName;
  emit("select", image.value);
  open.value = false;
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.current = 1;
  getList();
}

</script>
