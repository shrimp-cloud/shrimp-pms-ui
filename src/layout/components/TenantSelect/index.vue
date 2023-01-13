<template>
  <div>
    <el-dropdown trigger="click" @command="handleSelectTenant" style="margin-top: 18px;">
      <span class="el-dropdown-link">
        {{userStore.tenant?.displayName}}
        <el-icon><arrow-down-bold /></el-icon>
        &nbsp;&nbsp;
      </span>
      <template #dropdown>
        <el-input v-model="form.keyword" clearable @input="query" placeholder="搜索租户"/>
        <el-dropdown-menu>
          <el-dropdown-item
              v-for="(item, index) of filtedTenants"
              :key="index"
              :disabled="userStore.tenant?.tenantCode === item.tenantCode"
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
const filtedTenants = ref([]);

function query() {
  const keyword = form.value.keyword;
  const tenants = userStore.tenants;
  const tmps = [];
  for (const tenant of tenants) {
    if (!keyword || tenant.displayName.indexOf(keyword) > -1) {
      tmps.push(tenant);
    }
  }
  filtedTenants.value = tmps;
}

function handleSelectTenant(tenant) {
  proxy.$modal.loading("正在刷新 " + tenant.displayName + "，请稍候...");
  setTimeout(() => {
    proxy.$modal.closeLoading();
    localStorage.setItem('tenant-code', tenant.tenantCode)
    location.reload();
  }, 1000);
}

query();
</script>
