<!-- 资源授权处理器 -->

<template>
  <div class="resource-auth-processor-wrapper">
    <ListSkeleton type="dep" v-if="data.loading" />

    <template v-if="!data.loading">
      <div class="processor-body" v-if="store.upcasts.length || store.deps.length">
        <div class="upcast-area" v-if="store.upcasts.length">
          <div class="title">
            {{ I18n("addrely_label_basicupcast") }}
            <el-tooltip effect="light" :content="I18n('get_auth_btn_upcast_info')" placement="bottom-start" raw-content>
              <i class="freelog fl-icon-tishixinxi tip-icon" />
            </el-tooltip>
          </div>
          <div
            class="upcast-tag"
            v-for="item in store.upcasts"
            :key="item.resourceID"
            @click="toDetail(item.resourceID)"
          >
            {{ item.resourceName }}
          </div>
        </div>

        <template v-if="store.deps.length">
          <div class="btn-bar">
            <div
              class="view-pending-contract-btn"
              @click="openPendingContractPopup"
              v-if="allPendingContractList.length"
            >
              <i class="freelog fl-icon-heyue1 contract-icon" />
              {{ I18n("claim_rely_btn_check_authorization") }}
            </div>
            <div class="deal-btn" :class="{ disabled: allSelectPolicyList.length === 0 }" @click="dealAuth">
              {{ I18n("claim_rely_btn_getauth") }}
            </div>
          </div>

          <el-scrollbar class="dep-list">
            <Dep
              :data="item"
              @changeVersion="changeVersion($event, item)"
              @delete="deleteDep"
              @updatePolicy="updatePolicy"
              @paySuccess="paySuccess"
              v-for="item in data.deps"
              :key="item.resourceId"
            />
          </el-scrollbar>
        </template>
      </div>

      <div class="no-dep-box" v-else>
        <div class="title">{{ I18n("posteditor_authlist_empty") }}</div>
        <div class="desc">{{ I18n("posteditor_authlist_empty_desc") }}</div>
        <div class="close-btn" @click="closePolicyDrawer">{{ I18n("posteditor_authlist_empty_btn_back") }}</div>
      </div>
    </template>
  </div>

  <!-- 签约中提示 -->
  <transition name="fade-in">
    <div class="modal" v-if="data.signing" />
  </transition>
  <transition name="fade-in-scale">
    <div class="sign-tip" v-if="data.signing">
      <i class="freelog fl-icon-loading sign-icon" />
      <div class="paying-text">{{ I18n("claim_rely_msg_processing") }}</div>
    </div>
  </transition>

  <!-- 待执行合约弹窗 -->
  <PendingContractDrawer
    :show="data.pendingContractPopupShow"
    :data="allPendingContractList"
    @close="data.pendingContractPopupShow = false"
    @paySuccess="paySuccess"
  />
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { computed, defineAsyncComponent, reactive } from "vue";
import { useStore } from "@/store";
import { ContractService, ResourceService, UserService } from "@/api/request";
import { toDetail } from "@/utils/common";
import { getDependencesByContent } from "@/core/resource";
import ListSkeleton from "@/components/list-skeleton.vue";
import Dep from "@/components/dep.vue";
import PendingContractDrawer from "@/components/pending-contract-drawer.vue";

// const ListSkeleton = defineAsyncComponent(() => import("@/components/list-skeleton.vue"));
// const Dep = defineAsyncComponent(() => import("@/components/dep.vue"));
// const PendingContractDrawer = defineAsyncComponent(() => import("@/components/pending-contract-drawer.vue"));

const store = useStore();

const data = reactive({
  loading: false,
  deps: [] as any[],
  authDrawerShow: false,
  versionRange: "",
  signing: false,
  pendingContractPopupShow: false,
});

/** 所有已选择的策略 */
const allSelectPolicyList = computed(() => {
  const result: any[] = [];
  data.deps.forEach((dep) => {
    const { selectPolicies, upcastList, resourceId } = dep;
    if (selectPolicies.length) {
      selectPolicies.forEach((policy: any) => {
        const isExist = result.some(
          (select) => select.policyId === policy.policyId && select.resourceId === resourceId
        );
        if (!isExist) result.push({ ...policy, resourceId });
      });
    }
    if (upcastList.length) {
      upcastList.forEach((upcast: any) => {
        if (upcast.selectPolicies.length) {
          upcast.selectPolicies.forEach((policy: any) => {
            const isExist = result.some(
              (select) => select.policyId === policy.policyId && select.resourceId === upcast.resourceId
            );
            if (!isExist) result.push({ ...policy, resourceId: upcast.resourceId });
          });
        }
      });
    }
  });

  return result;
});

/** 所有待执行的合约 */
const allPendingContractList = computed(() => {
  const result: any[] = [];
  const upcasts = computed(() => store.upcasts.map((item) => item.resourceID));
  data.deps.forEach((dep) => {
    const { activeContracts, upcastList, resourceId } = dep;

    if (
      activeContracts.length &&
      !result.some((item) => item.resourceId === resourceId) &&
      !upcasts.value.includes(resourceId)
    ) {
      const pendingContractList = activeContracts.filter((contract: any) => contract.authStatus === 128);
      if (pendingContractList.length) result.push({ ...dep, pendingContractList });
    }

    if (upcastList.length) {
      upcastList.forEach((upcast: any) => {
        if (
          upcast.activeContracts.length &&
          !result.some((item) => item.resourceId === upcast.resourceId) &&
          !upcasts.value.includes(resourceId)
        ) {
          const pendingContractList = upcast.activeContracts.filter((contract: any) => contract.authStatus === 128);
          if (pendingContractList.length) result.push({ ...upcast, pendingContractList });
        }
      });
    }
  });

  return result;
});

/** 获取依赖与上抛数据 */
const getData = async () => {
  data.loading = true;
  const { resourceId } = store;
  const resourceDraft = await ResourceService.getResourceDraftData(resourceId);
  if (!resourceDraft) return;

  let deps: any[] = [];
  const { directDependencies = [], baseUpcastResources = [] } = resourceDraft.draftData;
  const dependencesByIdentify = getDependencesByContent(store.markdown);

  store.contentDeps.forEach((item) => {
    const isExistContent = dependencesByIdentify.findIndex((dep) => dep === item) !== -1;
    if (isExistContent) return;

    const index = directDependencies.findIndex((dep: any) => dep.name === item);
    if (index === -1) return;

    directDependencies.splice(index, 1);
  });

  if (dependencesByIdentify.length) {
    const resourceData = await ResourceService.getResourceDataBatch({ resourceNames: dependencesByIdentify.join() });
    if (resourceData) {
      const contentDeps = resourceData.map((dep: any) => {
        const { resourceId, resourceName, latestVersion } = dep;
        return { id: resourceId, name: resourceName, type: "resource", versionRange: `^${latestVersion}` };
      });
      const depsInStatement: any[] = [];
      directDependencies.forEach((item: any) => {
        const dep = contentDeps.find((depInContent: any) => depInContent.name === item.name);
        if (dep) {
          dep.versionRange = item.versionRange;
          return;
        }

        depsInStatement.push(item);
      });
      deps = [...contentDeps, ...depsInStatement];
      store.contentDeps = contentDeps.map((item: any) => item.name);
    }
  } else {
    deps = [...directDependencies];
    store.contentDeps = [];
  }

  store.deps = [...deps];
  store.upcasts = [...baseUpcastResources];
  saveDepUpdate();
  dealDepData();
};

/** 整理依赖数据 */
const dealDepData = async () => {
  if (!store.deps.length) {
    data.loading = false;
    return;
  }

  const result: any[] = [];
  const resourceIds = store.deps.filter((item) => item.type === "resource").map((item: { id: string }) => item.id);
  const depUpcasts: string[] = [];
  const userIds: string[] = [];
  const requestList: Promise<any[]>[] = [];
  const cycleRequestIdList: string[] = [];
  const cycleRequestList: Promise<any[]>[] = [];
  const statusMapping: any = { 0: "unreleased", 2: "freeze", 4: "offline" };

  /** 获取依赖资源数据 */
  const depList = await getResourceData(resourceIds);
  depList.forEach((item) => {
    /** 初始化部分数据 */
    const { resourceId, baseUpcastResources, userId } = item;
    const dep = store.deps.find((dep: any) => dep.id === resourceId);
    if (dep) item.versionRange = dep.versionRange;
    initDepData(item);

    userIds.push(userId);
    if (baseUpcastResources.length) depUpcasts.push(...baseUpcastResources.map((upcast: any) => upcast.resourceId));
    if (dep.type === "resource" && item.status !== 0) {
      const cycleParams = [{ resourceId, versionRange: item.versionRange }];
      cycleRequestList.push(ResourceService.checkRelyCycle(store.resourceId, cycleParams));
      cycleRequestIdList.push(resourceId);
    }
  });

  /** 获取依赖上抛资源数据 */
  const depUpcastsList = await getResourceData(depUpcasts);
  depUpcastsList.forEach((item) => {
    userIds.push(item.userId);
  });

  /** 获取当前资源合约数据 */
  const allRelyIds = [...new Set([...resourceIds, ...depUpcasts])].join();
  const params = {
    subjectIds: allRelyIds,
    licenseeId: store.resourceId,
    subjectType: 1,
    licenseeIdentityType: 1,
    isLoadPolicyInfo: 1,
    isTranslate: 1,
  };
  requestList.push(ContractService.getContractsBatch(params));

  /** 检查授权链 */
  requestList.push(ResourceService.getResourceAuthBatch(allRelyIds));

  /** 检查依赖资源作者 */
  requestList.push(UserService.getUserDataBatch([...new Set(userIds)].join()));

  /** 检查循环依赖 */
  requestList.push(...cycleRequestList);

  const [contractsList, authRes, UserRes, ...cycleRes] = await Promise.all(requestList);

  /** 整理依赖数据 */
  store.deps.forEach((item) => {
    const { id, type } = item;
    if (type === "object") {
      const objectDep = { resourceName: item.name, error: "object" };
      result.push(objectDep);
    } else if (type === "resource") {
      const dep = depList.find((dep: any) => dep.resourceId === id);
      if (!dep) return;

      const { resourceId, baseUpcastResources, policies, status, userId } = dep;

      /** 生效中合约 */
      const activeContracts = contractsList.filter(
        (contract: any) => contract.licensorId === resourceId && contract.status === 0
      );
      /** 已终止合约 */
      const terminatedContracts = contractsList.filter(
        (contract: any) => contract.licensorId === resourceId && contract.status === 1
      );
      /** 可用合约 */
      const enabledPolicies = policies.filter(
        (policy: any) =>
          !activeContracts.map((contract: any) => contract.policyId).includes(policy.policyId) && policy.status === 1
      );
      dep.activeContracts = [...activeContracts];
      dep.terminatedContracts = [...terminatedContracts];
      dep.enabledPolicies = [...enabledPolicies];

      const cycleIndex = cycleRequestIdList.findIndex((cycle) => cycle === resourceId);
      const authIndex = authRes.findIndex((auth: any) => auth.resourceId === resourceId);
      const userIndex = UserRes.findIndex((user: any) => user.userId === userId);
      if ([0, 2, 4].includes(status)) {
        dep.error = statusMapping[status];
      } else if (store.resourceData.baseUpcastResources.some((upcast: any) => upcast.resourceID === dep.resourceId)) {
        dep.error = "upcast";
      } else if (!cycleRes[cycleIndex]) {
        dep.error = "cycle";
      } else if (authIndex !== -1 && !authRes[authIndex].isAuth) {
        dep.warning = "auth";
      } else if (UserRes[userIndex].status === 1) {
        dep.warning = "freeze";
      }

      /** 上抛依赖数据 */
      if (baseUpcastResources.length) {
        baseUpcastResources.forEach((upcast: any) => {
          const result = depUpcastsList.find((upcastData) => upcastData.resourceId === upcast.resourceId);
          const upcastAuthIndex = authRes.findIndex((auth: any) => auth.resourceId === result.resourceId);
          const upcastUserIndex = UserRes.findIndex((user: any) => user.userId === result.userId);
          initDepData(result);
          if (result) {
            /** 生效中合约 */
            const upcastActiveContracts = contractsList.filter(
              (contract: any) => contract.licensorId === upcast.resourceId && contract.status === 0
            );
            /** 已终止合约 */
            const upcastTerminatedContracts = contractsList.filter(
              (contract: any) => contract.licensorId === upcast.resourceId && contract.status === 1
            );
            /** 可用合约 */
            const upcastEnabledPolicies = result.policies.filter(
              (policy: any) =>
                !upcastActiveContracts.map((contract: any) => contract.policyId).includes(policy.policyId) &&
                policy.status === 1
            );
            result.activeContracts = [...upcastActiveContracts];
            result.terminatedContracts = [...upcastTerminatedContracts];
            result.enabledPolicies = [...upcastEnabledPolicies];

            if ([0, 2, 4].includes(result.status)) {
              result.error = statusMapping[result.status];
            } else if (upcastAuthIndex !== -1 && !authRes[upcastAuthIndex].isAuth) {
              result.warning = "auth";
            } else if (UserRes[upcastUserIndex].status === 1) {
              result.warning = "freeze";
            }

            dep.upcastList.push(result);
          }
        });
      }

      result.push(dep);
    }
  });

  data.deps = result;
  data.loading = false;
  data.signing = false;
};

/** 获取资源数据 */
const getResourceData = async (ids: string[]) => {
  if (ids.length === 0) return [];

  const params = { resourceIds: ids.join(), isLoadPolicyInfo: 1, isTranslate: 1 };
  const res = await ResourceService.getResourceDataBatch(params);

  if (!res) return [];

  const result: any[] = [];
  ids.forEach((id) => {
    const resource = res.find((item: any) => item.resourceId === id);
    result.push(resource);
  });

  return result;
};

/** 初始化依赖部分数据 */
const initDepData = (dep: any) => {
  dep.activeContracts = [];
  dep.terminatedContracts = [];
  dep.enabledPolicies = [];
  dep.selectPolicies = [];
  dep.upcastList = [];
  dep.error = "";
  dep.warning = "";
};

/** 打开待执行合约弹窗 */
const openPendingContractPopup = () => {
  data.pendingContractPopupShow = true;
};

/** 处理授权 */
const dealAuth = async () => {
  data.signing = true;
  const subjects: { subjectId: string; policyId: string }[] = allSelectPolicyList.value.map((item) => {
    return { subjectId: item.resourceId, policyId: item.policyId };
  });
  const params = { subjects, subjectType: 1, licenseeId: store.resourceId, licenseeIdentityType: 1 };
  const res = await ContractService.createContractBatch(params);
  if (!res) return (data.signing = false);

  store.updateBecauseRely = true;
  dealDepData();
};

/** 关闭授权抽屉 */
const closePolicyDrawer = () => {
  store.editorFuncs.setPolicyDrawer(false);
};

/** 修改依赖版本范围 */
const changeVersion = (version: string, dep: any) => {
  dep.versionRange = version;

  const storeDep = store.deps.find((item) => item.id === dep.resourceId);
  if (storeDep) storeDep.versionRange = version;

  store.updateBecauseRely = true;
  saveDepUpdate();
};

/** 删除依赖 */
const deleteDep = (dep: any) => {
  const upcastIndex = store.upcasts.findIndex((item) => item.resourceID === dep.resourceId);
  if (upcastIndex !== -1) store.upcasts.splice(upcastIndex, 1);

  const depIndex = data.deps.findIndex((item) => item.resourceId === dep.resourceId);
  if (depIndex !== -1) data.deps.splice(depIndex, 1);

  const storeDepIndex = store.deps.findIndex((item) => item.id === dep.resourceId);
  if (storeDepIndex !== -1) store.deps.splice(storeDepIndex, 1);

  store.updateBecauseRely = true;
  saveDepUpdate();
};

/** 更新依赖策略 */
const updatePolicy = (dep: any) => {
  const { resourceId, enabledPolicies } = dep;
  const selectPolicies = enabledPolicies.filter((item: any) => item.select);
  const selectPolicyIds = selectPolicies.map((item: any) => item.policyId);
  data.deps.forEach((item: any) => {
    if (item.resourceId === resourceId) {
      item.enabledPolicies.forEach((policy: any) => {
        const select = selectPolicyIds.includes(policy.policyId);
        if (select !== policy.select) policy.select = select;
      });
      item.selectPolicies = selectPolicies;
    }
    if (item.upcastList?.length) {
      item.upcastList.forEach((upcast: any) => {
        if (upcast.resourceId === resourceId) {
          upcast.enabledPolicies.forEach((policy: any) => {
            const select = selectPolicyIds.includes(policy.policyId);
            if (select !== policy.select) policy.select = select;
          });
          upcast.selectPolicies = selectPolicies;
        }
      });
    }
  });

  saveDepUpdate();
};

/** 支付成功更新合约状态 */
const paySuccess = async (contractId: string) => {
  const params = { contractId, isLoadPolicyInfo: 1, isTranslate: 1 };
  const contractData = await ContractService.getContractData(contractId, params);
  const record = await ContractService.getContractTransitionRecordBatch([contractId]);
  contractData.transitionRecord = record[0];
  data.deps.forEach((dep: any) => {
    const { activeContracts, upcastList } = dep;
    const index = activeContracts.findIndex((contract: any) => contract.contractId === contractData.contractId);
    if (index !== -1) dep.activeContracts[index] = contractData;

    if (upcastList.length === 0) return;

    upcastList.forEach((upcast: any) => {
      const index = upcast.activeContracts.findIndex(
        (contract: any) => contract.contractId === contractData.contractId
      );
      if (index !== -1) upcast.activeContracts[index] = contractData;
    });
  });
};

/** 立即保存依赖变动 */
const saveDepUpdate = () => {
  const { resourceId } = store.resourceData;
  store.draftData.directDependencies = store.deps;
  store.draftData.baseUpcastResources = store.upcasts;
  ResourceService.saveResourceDraftData(resourceId, store.draftData);
};

getData();
</script>

<style lang="scss" scoped>
.resource-auth-processor-wrapper {
  width: 100%;
  height: 100%;

  .processor-body {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .upcast-area {
      position: relative;
      width: 100%;
      background: #ffffff;
      border: 1px solid #f2c9cc;
      border-radius: 6px;
      padding: 15px 15px 5px;
      box-sizing: border-box;
      display: flex;
      flex-wrap: wrap;
      margin-top: 10px;
      margin-bottom: 30px;

      .title {
        position: absolute;
        top: 0;
        left: 10px;
        font-size: 12px;
        font-weight: 600;
        color: #ee4040;
        background-color: #fff;
        line-height: 17px;
        padding: 0 5px;
        display: flex;
        align-items: center;
        transform: translateY(-50%);

        .tip-icon {
          font-size: 14px;
          font-weight: 400;
          margin-left: 5px;
          cursor: pointer;
        }
      }

      .upcast-tag {
        line-height: 17px;
        padding: 3px 10px;
        background: #fdebec;
        border-radius: 23px;
        font-size: 12px;
        color: #ee4040;
        margin: 0 10px 10px 0;
        cursor: pointer;
      }
    }

    .btn-bar {
      width: 100%;
      display: flex;
      justify-content: flex-end;

      .view-pending-contract-btn {
        display: flex;
        align-items: center;
        font-size: 12px;
        color: #2784ff;
        line-height: 18px;
        margin-right: 30px;
        cursor: pointer;

        &:hover {
          color: #529dff;
        }

        &:active {
          color: #2376e5;
        }

        .contract-icon {
          margin-right: 5px;
        }
      }

      .deal-btn {
        padding: 0 20px;
        height: 38px;
        background: #2784ff;
        border-radius: 4px;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        line-height: 18px;
        cursor: pointer;

        &:hover {
          background: #529dff;
        }

        &:active {
          background: #2376e5;
        }

        &.disabled {
          opacity: 0.4;
          pointer-events: none;
        }
      }
    }

    .dep-list {
      flex: 1;
      margin-top: 30px;
    }
  }

  .no-dep-box {
    width: 100%;
    height: 100%;
    padding-top: 236px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;

    .title {
      font-size: 30px;
      color: #666666;
      line-height: 36px;
    }

    .desc {
      font-size: 16px;
      color: #666666;
      line-height: 22px;
      margin-top: 30px;
    }

    .close-btn {
      padding: 15px 50px;
      background: #2784ff;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      line-height: 20px;
      margin-top: 30px;
      cursor: pointer;

      &:hover {
        background: #529dff;
      }

      &:active {
        background: #2376e5;
      }
    }
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3001;
}

.sign-tip {
  position: fixed;
  top: 30vh;
  left: 50%;
  margin-left: -180px;
  width: 360px;
  height: 200px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 3011;

  .sign-icon {
    font-size: 48px;
    color: #fff;
    animation: rotate 1s ease-in-out infinite;
  }

  .paying-text {
    font-size: 14px;
    color: #ffffff;
    line-height: 20px;
    margin-top: 30px;
  }
}
</style>
