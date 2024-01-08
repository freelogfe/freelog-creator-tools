<!-- 依赖申明弹窗 -->

<template>
  <el-drawer
    class="dependencies-declarator-drawer-wrapper"
    v-model="data.show"
    :with-header="false"
    :size="700"
    destroy-on-close
    :before-close="closeDrawer"
  >
    <div class="drawer">
      <div class="drawer-header">
        <div class="title">{{ I18n("claim_rely_title") }}</div>
        <i class="freelog fl-icon-guanbi close-btn" @click="closeDrawer" />
      </div>

      <div class="loader" v-if="data.loading">
        <i class="freelog fl-icon-loading loading-icon" />
      </div>

      <el-scrollbar class="drawer-body">
        <!-- 依赖申明子应用 -->
        <div id="dependienciesDeclaratorInMarkdownEditor" class="app-wrapper"></div>
      </el-scrollbar>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { reactive, watch } from "vue";
import { ContractService, ResourceService } from "@/api/request";
import { loadMicroApp } from "qiankun";
import { useStore } from "@/store";

const store = useStore();
const props = defineProps(["show"]);

const data = reactive({
  show: false,
  dependienciesDeclarator: null as any,
  loading: false,
});

/** 关闭抽屉 */
const closeDrawer = () => {
  store.editorFuncs.setDependenciesDeclaratorDrawer(false);
};

/** 加载依赖申明子应用 */
const loadDependenciesDeclarator = async () => {
  if (data.dependienciesDeclarator?.getStatus() === "MOUNTED") return;

  data.loading = true;

  let depList: any = [];
  let upcastList: any = [];

  const { dependencesInContent } = store;
  if (dependencesInContent.length) {
    const { resourceId, draftData } = store;
    const { directDependencies = [], baseUpcastResources = [] } = draftData;

    const restDeps: { name: string; index: number }[] = [];

    // 在依赖与上抛中查找识别出来的依赖
    dependencesInContent.forEach((name, index) => {
      const dep = directDependencies.find((item) => item.name === name);
      if (dep) depList[index] = dep;

      const upcast = baseUpcastResources.find((item) => item.resourceName === name);
      if (upcast) upcastList[index] = upcast;

      if (!dep) restDeps.push({ name, index });
    });

    // 在依赖与上抛中查找不出来的依赖，查询是否已有合约存在
    if (restDeps.length) {
      const resourceNames = restDeps.map((item) => item.name);
      const resourceParams: any = { resourceNames: resourceNames.join(), isLoadPolicyInfo: 1, isTranslate: 1 };
      const resourceRes = await ResourceService.getResourceDataBatch(resourceParams);
      if (resourceRes?.length) {
        const subjectIds = resourceRes.map((item: any) => item.resourceId).join();
        const params = {
          subjectIds,
          licenseeId: resourceId,
          subjectType: 1,
          licenseeIdentityType: 1,
          isLoadPolicyInfo: 1,
          isTranslate: 1,
        };
        const contractList = await ContractService.getContractsBatch(params);
        if (contractList) {
          restDeps.forEach((item) => {
            const resourceData = resourceRes.find((resource: any) => resource.resourceName === item.name);
            if (!resourceData) return;

            const contractData = contractList.find((contract: any) => contract.subjectId === resourceData.resourceId);
            if (!contractData) return;

            const dep = {
              id: resourceData.resourceId,
              name: item.name,
              type: "resource",
              versionRange: `^${resourceData.latestVersion}`,
            };
            depList[item.index] = dep;
          });
        }
      }
    }
  }

  depList = depList.filter((item: any) => item);
  upcastList = upcastList.filter((item: any) => item);

  data.dependienciesDeclarator = loadMicroApp({
    name: "dependienciesDeclaratorInMarkdownEditor",
    // entry: 'http://localhost:8401',
    entry: process.env.VUE_APP_DEPENDENCIES_DECLARATOR,
    container: "#dependienciesDeclaratorInMarkdownEditor",
    props: { licenseeId: store.resourceId, mainAppType: "resourceInMarkdownEditor", depList, upcastList, update },
  });
  await data.dependienciesDeclarator.mountPromise;
  data.loading = false;
};

/**
 * 更新依赖
 * @param id 授权方 id
 */
const update = async (data: any) => {
  const { depList, upcastList, operation } = data;
  if (!operation) return;

  const { id, type } = operation;
  const { directDependencies, baseUpcastResources } = store.draftData;
  if (type === "upcast") {
    // 上抛
    const dep = depList.find((item: any) => item.id === id);
    const upcastData = { resourceID: id, resourceName: dep.name };
    baseUpcastResources.push(upcastData);
  } else if (type === "cancelUpcast") {
    // 取消上抛
    const index = upcastList.findIndex((item: any) => item.resourceID === id);
    baseUpcastResources.splice(index, 1);
  } else if (type === "add") {
    // 添加依赖
    const dep = depList.find((item: any) => item.id === id);
    directDependencies.unshift(dep);
    const upcast = upcastList.find((item: any) => item.resourceID === id);
    if (upcast) baseUpcastResources.push(upcast);
  } else if (type === "versionRange") {
    // 修改版本范围
    const dep = depList.find((item: any) => item.id === id);
    const depData = directDependencies.find((item: any) => item.id === id);
    if (depData) depData.versionRange = dep.versionRange;
  }

  store.updateBecauseRely = true;
  store.editorFuncs.saveDeps();
};

watch(
  () => props.show,
  (cur) => {
    data.show = cur;
    if (cur) {
      loadDependenciesDeclarator();
    } else if (data.dependienciesDeclarator) {
      data.dependienciesDeclarator.unmount();
      data.dependienciesDeclarator = null;
    }
  }
);
</script>

<style lang="scss" scoped>
.dependencies-declarator-drawer-wrapper {
  .drawer {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .drawer-header {
      width: 100%;
      height: 70px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 22px 30px;
      border-bottom: 1px solid #e5e7e8;

      .title {
        font-size: 20px;
        color: #222;
        line-height: 26px;
      }

      .close-btn {
        position: relative;
        font-size: 12px;
        color: #333;
        cursor: pointer;

        &:hover {
          color: #529dff;
        }

        &:active {
          color: #2376e5;
        }

        &::after {
          content: "";
          position: absolute;
          left: -10px;
          top: -10px;
          right: -10px;
          bottom: -10px;
        }
      }
    }

    .loader {
      height: calc(100vh - 70px);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      .freelog {
        font-size: 48px;
        color: #999;
        animation: rotate 1s linear infinite;
      }
    }

    .drawer-body {
      width: 100%;

      .app-wrapper {
        padding: 20px 30px;
        box-sizing: border-box;
      }
    }
  }
}
</style>
