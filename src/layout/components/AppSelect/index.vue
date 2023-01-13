<template>
  <div>
    <el-dropdown trigger="click" @command="handleSelectApp" style="margin-top: 18px;">
      <span class="el-dropdown-link">
        {{userStore.app.displayName}}
        <el-icon><arrow-down-bold /></el-icon>
        &nbsp;&nbsp;
      </span>
      <template #dropdown>
        <el-input v-model="form.keyword" clearable @input="query" placeholder="搜索应用"/>
        <el-dropdown-menu>
          <el-dropdown-item
              v-for="(item, index) of filtedApps"
              :key="index"
              :disabled="userStore.app.appCode === item.appCode"
              :command="item">
            {{ item.displayName}}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import useUserStore from '@/store/modules/user';

const { proxy } = getCurrentInstance();
const userStore = useUserStore()

const form = ref({})
const filtedApps = ref([]);

function query() {
  const keyword = form.value.keyword;
  const apps = userStore.apps;
  const tmps = [];
  for (const app of apps) {
    if (!keyword || app.displayName.indexOf(keyword) > -1) {
      tmps.push(app);
    }
  }
  filtedApps.value = tmps;
}

function handleSelectApp(app) {
  proxy.$modal.loading("正在使用新窗口打开 " + app.displayName + "，请稍候...");
  setTimeout(() => {
    proxy.$modal.closeLoading();
    window.open(app.domain);
  }, 1000);
}

query();
</script>
