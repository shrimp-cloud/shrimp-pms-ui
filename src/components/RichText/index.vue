<template>
  <div>
    <quill-editor
      ref="quillRef"
      theme="snow"
      contentType="html"
      v-bind="$attrs"
      :content="value"
      @update:content="e => $emit('update:value', e)"
      :modules="modules"
      :toolbar="[
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['clean'],
        ['link', 'image', 'video'],
      ]"
    />
  </div>
</template>


<script setup>
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import ImageUploader from "quill-image-uploader";
// import BlotFormatter from 'quill-blot-formatter';
import request from '@/utils/request';

const { value } = defineProps({
  value: {
    type: String,
    default: '',
  },
});
const emit = defineEmits(['update:value']);
const { proxy } = getCurrentInstance();
const modules = [{
  name: "imageUPloader",
  module: ImageUploader,
  options: {
    upload: (file) => {
      const formData = new FormData();
      formData.append("file", file);
      return request
        .post(`/sys/common/upload?busnessType=article`, formData)
        .then((res) => {
          if (res.code !== 1) {
            proxy.$modal.msgError("上传异常：" + res.msg);
            return;
          }
          const url = res.data.url;
          return url;
        });
    },
  },
}
/*
, {
  name: 'blotFormatter',
  module: BlotFormatter
}
*/
];

onMounted(() => {
});
</script>
<style>
.ql-toolbar {
  line-height: 1.5em;
}
.ql-container {
  min-height: 150px;
}
</style>
