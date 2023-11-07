<!-- 依赖资源 -->

<template>
  <div class="dep-wrapper">
    <div class="dep" @click="openAuthDrawer(props.data)">
      <Cover :src="props.data.coverImages ? props.data.coverImages[0] : ''" :width="68" />
      <div class="dep-body">
        <div class="dep-info">
          <div class="error-tag unreleased" v-if="props.data.error === 'unreleased'">
            {{ I18n("filter_resource_status_prepareforrelease") }}
          </div>
          <div class="error-tag freeze" v-else-if="props.data.error === 'freeze'">
            {{ I18n("filter_resource_status_removedbyfreelog") }}
          </div>
          <div class="error-tag offline" v-else-if="props.data.error === 'offline'">
            {{ I18n("filter_resource_status_pendingauth") }}
          </div>
          <i class="freelog fl-icon-jinzhi error-icon" v-else-if="props.data.error" />
          <i class="freelog fl-icon-warning1 warning-icon" v-else-if="props.data.warning" />
          <div class="dep-name" :title="props.data.resourceName">{{ props.data.resourceName }}</div>
          <div class="dep-other" v-if="props.data.error !== 'object'">
            <div class="type">{{ props.data.resourceType.join(" / ") }}</div>
            <div class="version" v-if="props.data.status !== 0">
              ｜{{ I18n("claim_rely_version_rage") }}：{{ props.data.versionRange }}
              <i class="freelog fl-icon-bianji edit-btn" @click.stop="openVersionPopup" />

              <!-- 版本范围选择弹窗 -->
              <transition name="slide-down-fade">
                <div
                  :id="`versionPopup${props.data.resourceId}`"
                  class="version-popover"
                  @click.stop="data.versionRangeSelector = false"
                  v-if="data.versionPopupShow"
                >
                  <div class="triangle" />
                  <div class="input-box" @click.stop>
                    <input
                      class="input"
                      v-model="data.versionRange"
                      type="text"
                      @focus="data.versionRangeSelector = true"
                      @change="changeVersionRange"
                    />
                    <transition name="slide-down-fade">
                      <el-scrollbar class="select-box" max-height="345px" v-if="data.versionRangeSelector">
                        <div
                          class="select-item"
                          @click="selectVersion(version.version)"
                          v-for="version in props.data.resourceVersions"
                          :key="version.versionId"
                        >
                          {{ version.version }}
                        </div>
                      </el-scrollbar>
                    </transition>
                  </div>
                  <div class="error-tip" v-if="data.versionError">{{ data.versionError }}</div>
                  <div class="check-box">
                    <el-checkbox
                      class="checkbox"
                      v-model="data.versionDynamic"
                      :label="I18n('msg_semver_caret')"
                      @change="changeVersionDynamic"
                    />
                  </div>
                  <div class="btns">
                    <div class="btn cancel" @click="data.versionPopupShow = false">
                      {{ I18n("get_auth_btn_cancel") }}
                    </div>
                    <div class="btn sure" :class="{ disabled: data.versionError }" @click="confirmVersion">
                      {{ I18n("btn_save") }}
                    </div>
                  </div>
                </div>
              </transition>
            </div>
            <el-tooltip effect="light" :content="I18n('check_release_details')" placement="bottom-start">
              <i class="freelog fl-icon-chakanziyuan detail-btn" @click.stop="toDetail(props.data.resourceId)" />
            </el-tooltip>
          </div>
        </div>
        <div class="policy-area">
          <div class="policy upcast" v-if="upcasts.includes(props.data.resourceId)">
            <i class="freelog fl-icon-shangpao" />
            <div class="name">{{ I18n("get_auth_msg_upcast_it") }}</div>
          </div>
          <template v-else-if="props.data.activeContracts.length || props.data.selectPolicies.length">
            <div
              class="policy"
              :class="{ active: item.status === 0 && item.authStatus === 1, uncompleted: item.authStatus === 128 }"
              v-for="item in props.data.activeContracts"
              :key="item.contractId"
            >
              <i class="freelog fl-icon-heyue1" />
              <div class="name">{{ item.contractName }}</div>
            </div>
            <div class="policy select" v-for="item in props.data.selectPolicies" :key="item.policyId">
              <i class="freelog fl-icon-heyue1" />
              <div class="name">{{ item.policyName }}</div>
            </div>
          </template>
          <div class="tip-text error" v-else-if="props.data.error">
            {{ I18n("claim_rely_msg_not_availableforauth") }}
          </div>
          <div class="tip-text placeholder" v-else>{{ I18n("claim_rely_msg_selectauthplan") }}</div>
        </div>
      </div>
      <div class="delete-btn" @click.stop="$emit('delete', props.data)"><div class="line" /></div>
    </div>

    <div class="upcast-area" v-if="props.data.upcastList.length">
      <div class="header">
        <div class="title">{{ I18n("claim_rely_upcasts_of_rely") }}</div>
        <div class="line" />
      </div>
      <div class="upcast-list">
        <div
          class="dep"
          @click="openAuthDrawer(item)"
          v-for="item in props.data.upcastList"
          :key="props.data.resourceId + item.resourceId"
        >
          <Cover :src="item.coverImages[0]" :width="68" />
          <div class="dep-body">
            <div class="dep-info">
              <div class="error-tag unreleased" v-if="item.error === 'unreleased'">
                {{ I18n("filter_resource_status_prepareforrelease") }}
              </div>
              <div class="error-tag freeze" v-else-if="item.error === 'freeze'">
                {{ I18n("filter_resource_status_removedbyfreelog") }}
              </div>
              <div class="error-tag offline" v-else-if="item.error === 'offline'">
                {{ I18n("filter_resource_status_pendingauth") }}
              </div>
              <i class="freelog fl-icon-jinzhi error-icon" v-else-if="item.error" />
              <i class="freelog fl-icon-warning1 warning-icon" v-else-if="item.warning" />
              <div class="dep-name" :title="item.resourceName">{{ item.resourceName }}</div>
              <div class="dep-other">
                <div class="type">{{ item.resourceType.join(" / ") }}</div>
                <el-tooltip effect="light" :content="I18n('check_release_details')" placement="bottom-start">
                  <i class="freelog fl-icon-chakanziyuan detail-btn" @click.stop="toDetail(item.resourceId)" />
                </el-tooltip>
              </div>
            </div>
            <div class="policy-area">
              <div class="policy upcast" v-if="upcasts.includes(item.resourceId)">
                <i class="freelog fl-icon-shangpao" />
                <div class="name">{{ I18n("get_auth_msg_upcast_it") }}</div>
              </div>
              <template v-else-if="item.activeContracts.length || item.selectPolicies.length">
                <div
                  class="policy"
                  :class="{
                    active: policy.status === 0 && policy.authStatus === 1,
                    uncompleted: policy.authStatus === 128,
                  }"
                  v-for="policy in item.activeContracts"
                  :key="policy.contractId"
                >
                  <i class="freelog fl-icon-heyue1" />
                  <div class="name">{{ policy.contractName }}</div>
                </div>
                <div class="policy select" v-for="policy in item.selectPolicies" :key="policy.policyId">
                  <i class="freelog fl-icon-heyue1" />
                  <div class="name">{{ policy.policyName }}</div>
                </div>
              </template>
              <div class="tip-text error" v-else-if="item.error">{{ I18n("claim_rely_msg_not_availableforauth") }}</div>
              <div class="tip-text placeholder" v-else>{{ I18n("claim_rely_msg_selectauthplan") }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 处理授权弹窗 -->
  <el-drawer
    class="auth-drawer-wrapper"
    v-model="data.policyDrawerShow"
    :with-header="false"
    :size="700"
    destroy-on-close
  >
    <div class="drawer">
      <div class="drawer-header">
        <div class="title">{{ I18n("get_auth_title") }}</div>
        <div class="btns">
          <div class="btn cancel" @click="data.policyDrawerShow = false">{{ I18n("get_auth_btn_cancel") }}</div>
          <div class="btn sure" @click="sure">{{ I18n("get_auth_btn_submit") }}</div>
        </div>
      </div>

      <div class="drawer-body">
        <div class="resource-info">
          <Cover :src="data.currengRely.coverImages ? data.currengRely.coverImages[0] : ''" :width="68" />
          <div class="info">
            <div class="info-top">
              <div class="error-tag unreleased" v-if="data.currengRely.error === 'unreleased'">
                {{ I18n("filter_resource_status_prepareforrelease") }}
              </div>
              <div class="error-tag freeze" v-else-if="data.currengRely.error === 'freeze'">
                {{ I18n("filter_resource_status_removedbyfreelog") }}
              </div>
              <div class="error-tag offline" v-else-if="data.currengRely.error === 'offline'">
                {{ I18n("filter_resource_status_pendingauth") }}
              </div>
              <i class="freelog fl-icon-jinzhi error-icon" v-else-if="data.currengRely.error" />
              <i class="freelog fl-icon-warning1 warning-icon" v-else-if="data.currengRely.warning" />
              <div class="name" :title="data.currengRely.resourceName">{{ data.currengRely.resourceName }}</div>
            </div>
            <div class="other" v-if="data.currengRely.error !== 'object'">
              <span>{{ data.currengRely.resourceType.join(" / ") }}</span>
              <span v-if="data.currengRely.status !== 0 && data.currengRely.versionRange">
                ｜{{ I18n("claim_rely_version_rage") }}：{{ data.currengRely.versionRange }}
              </span>
            </div>
          </div>
        </div>

        <div class="warning-tip" v-if="data.currengRely.warning">
          <i class="freelog fl-icon-warning1 warning-icon" />
          <span v-if="data.currengRely.warning === 'auth'">{{ I18n("alarm_resource_authorization_abnormal") }}</span>
          <span v-if="data.currengRely.warning === 'freeze'">{{ I18n("alert_auth_useraccountdisable_resouce") }}</span>
        </div>

        <el-scrollbar
          class="policy-area"
          v-if="
            (!data.currengRely.error || (data.currengRely.error && data.currengRely.activeContracts.length)) &&
            !data.upcast
          "
        >
          <div class="policy-area-body">
            <div
              class="upcast-box"
              v-if="
                store.resourceData.status === 0 && (!data.currengRely.error || data.currengRely.error === 'offline')
              "
            >
              <div class="upcast-btn" @click="operateUpcast(true)">
                <i class="freelog fl-icon-shangpao upcast-icon" />
                {{ I18n("get_auth_btn_upcast") }}
              </div>
              <el-tooltip effect="light" :content="I18n('get_auth_btn_upcast_info')" placement="bottom-end" raw-content>
                <i class="freelog fl-icon-tishixinxi tip-icon" />
              </el-tooltip>
            </div>

            <template v-if="data.currengRely.activeContracts.length">
              <div class="title">{{ I18n("get_auth_title_authplan_available") }}</div>
              <div class="contract-list">
                <div class="contract-card" v-for="item in data.currengRely.activeContracts" :key="item.contractId">
                  <ContractCard :data="item" type="active" @paySuccess="$emit('paySuccess', $event)" />
                </div>
              </div>
            </template>

            <!-- <div
              class="view-terminate-btn"
              @click="viewTerminateContract"
              v-if="data.currengRely.terminatedContracts.length"
            > -->
            <div class="view-terminate-btn" @click="viewTerminateContract">
              {{ I18n("get_auth_btn_viewcontracthistory") }}
            </div>

            <template v-if="!data.currengRely.error && data.currengRely.enabledPolicies.length">
              <div class="title">{{ I18n("get_auth_title_authplan_available") }}</div>
              <div class="contract-list">
                <div class="contract-card" v-for="item in data.currengRely.enabledPolicies" :key="item.policyId">
                  <ContractCard :data="item" type="enabled" @paySuccess="$emit('paySuccess', $event)" />
                </div>
              </div>
            </template>
          </div>
        </el-scrollbar>

        <div
          class="error-box"
          v-if="(data.currengRely.error && !data.currengRely.activeContracts.length) || data.upcast"
        >
          <div class="upcast-error-tip" v-if="data.upcast">
            <div class="tip">
              <i class="freelog fl-icon-shangpao upcast-icon" />
              <div class="error-text">{{ I18n("get_auth_msg_upcast_it") }}</div>
              <div class="restore-btn" @click="operateUpcast(false)">{{ I18n("get_auth_btn_changeauthplan") }}</div>
            </div>
          </div>
          <div class="error-tip" v-else>
            <div class="tip">
              <i class="freelog fl-icon-jinzhi error-icon" />
              <div class="error-text">
                <span v-if="data.currengRely.error === 'unreleased'">{{ I18n("alarm_resource_not_available") }}</span>
                <span v-else-if="data.currengRely.error === 'freeze'">{{ I18n("alert_auth_resourceblocked") }}</span>
                <span v-else-if="data.currengRely.error === 'offline'">{{ I18n("alarm_resource_not_available") }}</span>
                <span v-else-if="data.currengRely.error === 'object'">
                  {{ I18n("get_auth_msg_object_not_available_for_auth") }}
                </span>
                <span v-else-if="data.currengRely.error === 'cycle'">
                  {{ I18n("authorization_issue_circular_reply") }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { useStore } from "@/store";
import { getDomain, toDetail } from "@/utils/common";
import { computed, defineAsyncComponent, onMounted, reactive, watch } from "vue";
import Cover from "@/components/cover.vue";
import { ContractService } from "@/api/request";
import * as semver from "semver";
import { Contract, Dep, ResourceVersion, TransitionRecord } from "@/typings/object";
import ContractCard from "@/components/contract-card.vue";

// const ContractCard = defineAsyncComponent(() => import("@/components/contract-card.vue"));

const store = useStore();
const props = defineProps(["data"]);
const emit = defineEmits(["changeVersion", "delete", "updatePolicy", "paySuccess"]);

const policyDrawer = document.getElementById("policyDrawer");

const data = reactive({
  versionPopupShow: false,
  versionRange: "",
  versionRangeSelector: false,
  versionDynamic: false,
  versionError: "",
  policyDrawerShow: false,
  currengRely: null as Dep | null,
  upcast: false,
});

const upcasts = computed(() => store.upcasts.map((item) => item.resourceID));

onMounted(() => {
  if (props.data.resourceId === store.relyIdAutoOpen) openAuthDrawer(props.data)
})

/** 版本弹窗关闭 */
const closePopup = () => {
  data.versionRangeSelector = false;
  data.versionPopupShow = false;
};

/** 打开授权抽屉 */
const openAuthDrawer = async (dep: Dep) => {
  data.upcast = store.upcasts.some((item) => item.resourceID === dep.resourceId);

  if (dep.activeContracts.length) {
    const contractIds = dep.activeContracts.map((item: Contract) => item.contractId);
    const recordList = await ContractService.getContractTransitionRecordBatch(contractIds);
    recordList.forEach((record: TransitionRecord) => {
      const contract = dep.activeContracts.find((item: Contract) => item.contractId === record.contractId);
      if (contract) contract.transitionRecord = record;
    });
  }
  data.currengRely = dep;
  data.policyDrawerShow = true;
};

/** 打开版本选择弹窗 */
const openVersionPopup = () => {
  const { versionRange } = props.data;
  data.versionError = "";
  data.versionRange = versionRange;
  data.versionDynamic = versionRange.startsWith("^");
  data.versionPopupShow = true;
};

/** 修改版本 */
const changeVersionRange = () => {
  const { versionRange } = data;
  data.versionDynamic = versionRange.startsWith("^");
  const versions = props.data.resourceVersions.map((item: ResourceVersion) => item.version);

  if (!versionRange) {
    data.versionError = I18n("claim_rely_version_rage_err_empty");
  } else if (!semver.validRange(versionRange)) {
    data.versionError = I18n("version_range_incorrect");
  } else if (!semver.maxSatisfying(versions, versionRange)) {
    data.versionError = I18n("claim_rely_version_rage_err_not_available");
  } else {
    data.versionError = "";
  }
};

/** 选择版本 */
const selectVersion = (version: string) => {
  data.versionRange = `${data.versionDynamic ? "^" : ""}${version}`;
  data.versionRangeSelector = false;
};

/** 修改版本动态变动 */
const changeVersionDynamic = (value: boolean) => {
  const startsWithSymbol = data.versionRange.startsWith("^");
  if (value && !startsWithSymbol) {
    data.versionRange = `^${data.versionRange}`;
  } else if (!value && startsWithSymbol) {
    data.versionRange = data.versionRange.substring(1);
  }
};

/** 确认版本选择 */
const confirmVersion = () => {
  const dep = store.deps.find((item) => item.id === props.data.resourceId);
  if (dep) dep.versionRange = data.versionRange;
  data.versionPopupShow = false;
  emit("changeVersion", data.versionRange);
};

/** 确认选择策略 */
const sure = () => {
  if (!data.currengRely) return;

  const index = store.upcasts.findIndex((item) => item.resourceID === data.currengRely!.resourceId);
  if (data.upcast && index === -1) {
    const { resourceId, resourceName } = data.currengRely;
    const upcastRely = { resourceID: resourceId, resourceName };
    store.upcasts.push(upcastRely);
    store.updateBecauseRely = true;
  } else if (!data.upcast && index !== -1) {
    store.upcasts.splice(index, 1);
    store.updateBecauseRely = true;
  }
  emit("updatePolicy", data.currengRely);
  data.policyDrawerShow = false;
};

/** 上抛 */
const operateUpcast = (upcast: boolean) => {
  data.upcast = upcast;
};

/** 查看已终止合约 */
const viewTerminateContract = () => {
  if (!data.currengRely) return;

  const licensorName = encodeURIComponent(data.currengRely.resourceName);
  const licenseeName = encodeURIComponent(store.resourceData.resourceName);
  const url = `${getDomain(
    "user"
  )}/logged/contract?identityType=2&licensorName=${licensorName}&licenseeName=${licenseeName}`;
  window.open(url);
};

watch(
  () => data.versionPopupShow,
  (cur) => {
    if (cur) {
      policyDrawer?.addEventListener("click", closePopup);
    } else {
      policyDrawer?.removeEventListener("click", closePopup);
    }
  }
);
</script>

<style lang="scss" scoped>
.dep-wrapper {
  width: 100%;
  border-bottom: 1px solid #e4e7eb;

  &:first-child {
    border-top: 1px solid #e4e7eb;
  }

  .dep {
    width: 100%;
    padding: 15px 10px;
    box-sizing: border-box;
    display: flex;
    cursor: pointer;

    &:hover {
      background: rgba(0, 0, 0, 0.03);
    }

    .dep-cover {
      width: 68px;
      height: 51px;
      border-radius: 4px;
    }

    .dep-body {
      flex: 1;
      margin-left: 10px;

      .dep-info {
        width: 100%;
        display: flex;
        align-items: center;

        .error-tag {
          height: 20px;
          padding: 0 5px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          margin-right: 5px;

          &.unreleased {
            background: #e0e0e0;
            color: #666666;
          }

          &.freeze {
            background: #fdebec;
            color: #ee4040;
          }

          &.offline {
            background: #fbf5ea;
            color: #dca32d;
          }
        }

        .error-icon {
          font-size: 16px;
          color: #ee4040;
          margin-right: 5px;
        }

        .warning-icon {
          color: #ffc704;
          font-size: 16px;
          margin-right: 5px;
        }

        .dep-name {
          flex: 1;
          width: 0;
          font-size: 14px;
          font-weight: 600;
          color: #222222;
          line-height: 20px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .dep-other {
          display: flex;
          align-items: center;
          margin-left: 50px;

          .type {
            font-size: 12px;
            color: #999999;
            line-height: 18px;
          }

          .version {
            position: relative;
            font-size: 12px;
            color: #999999;
            line-height: 18px;

            .edit-btn {
              font-size: 14px;
              margin-left: 5px;
              cursor: pointer;

              &:hover {
                color: #529dff;
              }

              &:active {
                color: #2376e5;
              }
            }

            .version-popover {
              position: absolute;
              top: 35px;
              right: -32px;
              width: 240px;
              padding: 15px;
              box-sizing: border-box;
              background: #ffffff;
              margin-left: 100%;
              z-index: 3002;
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
              border-radius: 4px;
              cursor: default;

              .triangle {
                position: absolute;
                top: -9px;
                right: 30px;
                width: 0px;
                height: 0px;
                border-left: 10px solid transparent;
                border-right: 10px solid transparent;
                border-bottom: 11px solid #fff;
                border-radius: 4px;
              }

              .input-box {
                position: relative;
                width: 100%;
                height: 32px;

                .input {
                  position: relative;
                  width: 100%;
                  height: 100%;
                  border: 1px solid #d4d4d4;
                  border-radius: 4px;
                  padding: 0 10px;
                  box-sizing: border-box;
                  font-size: 12px;
                  color: #222222;
                  line-height: 18px;
                  z-index: 3;
                  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

                  &:hover {
                    border-color: #40a9ff;
                  }

                  &:focus {
                    border-color: #40a9ff;
                    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
                  }
                }

                .select-box {
                  position: absolute;
                  left: 0;
                  right: 0;
                  top: 37px;
                  background-color: #fff;
                  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
                  border-radius: 4px;
                  padding: 8px 0;
                  box-sizing: border-box;
                  height: fit-content;
                  z-index: 2;

                  .select-item {
                    width: 100%;
                    height: 32px;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    padding: 0 15px;
                    box-sizing: border-box;
                    font-size: 12px;
                    color: #222222;
                    line-height: 18px;

                    & + .select-item {
                      margin-top: 1px;
                    }

                    &:hover {
                      background: #2784ff;
                      color: #fff;
                    }
                  }
                }
              }

              .error-tip {
                color: #ee4040;
                font-size: 12px;
                margin-top: 5px;
                margin-bottom: -5px;
              }

              .check-box {
                display: flex;
                align-items: center;
                margin-top: 15px;

                :deep .checkbox {
                  &.is-checked .el-checkbox__label {
                    color: #409eff;
                  }

                  .el-checkbox__inner {
                    width: 16px;
                    height: 16px;
                    border-radius: 2px;
                    border: 1px solid #979797;

                    &::after {
                      height: 8px;
                      left: 5px;
                    }
                  }

                  .el-checkbox__label {
                    padding-left: 5px;
                    font-size: 12px;
                    color: #666666;
                    line-height: 18px;
                  }
                }

                .check-tip {
                  font-size: 12px;
                  color: #666666;
                  line-height: 18px;
                  margin-left: 5px;
                }
              }

              .btns {
                display: flex;
                justify-content: flex-end;
                margin-top: 15px;

                .btn {
                  height: 32px;
                  padding: 0 15px;
                  display: flex;
                  align-items: center;
                  font-size: 14px;
                  cursor: pointer;

                  & + .btn {
                    margin-left: 10px;
                  }

                  &.cancel {
                    background: #fff;
                    color: #666666;

                    &:hover {
                      color: #529dff;
                    }

                    &:active {
                      color: #2376e5;
                    }
                  }

                  &.sure {
                    background: #2784ff;
                    color: #fff;
                    font-weight: 600;
                    border-radius: 4px;

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
              }
            }
          }

          .detail-btn {
            font-size: 14px;
            color: #2784ff;
            margin-left: 20px;
            cursor: pointer;

            &:hover {
              color: #529dff;
            }

            &:active {
              color: #2376e5;
            }
          }
        }
      }

      .policy-area {
        display: flex;
        flex-wrap: wrap;

        .policy {
          width: fit-content;
          height: 26px;
          padding: 0 7px;
          box-sizing: border-box;
          border-radius: 4px;
          display: flex;
          align-items: center;
          margin-top: 5px;
          margin-right: 5px;

          .freelog {
            font-size: 14px;
          }

          .name {
            font-size: 12px;
            font-weight: 600;
            line-height: 18px;
            margin-left: 5px;
          }

          &.active {
            background: #42c28c;
            color: #fff;
            border: none;
          }

          &.uncompleted {
            background: #e9a923;
            color: #fff;
            border: none;
          }

          &.upcast {
            background: #ffffff;
            color: #ee4040;
            border: 1px solid #ee4040;
          }

          &.select {
            background: #ffffff;
            color: #2784ff;
            border: 1px solid #2784ff;
          }
        }

        .tip-text {
          font-size: 12px;
          font-weight: 600;
          line-height: 18px;
          margin-top: 13px;

          &.error {
            color: #999999;
          }

          &.placeholder {
            color: #e9a923;
          }
        }
      }
    }

    .delete-btn {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: center;
      background: #fdebec;
      margin-left: 50px;
      cursor: pointer;

      &:hover {
        background: #f86363;

        .line {
          background: #fff;
        }
      }

      &:active {
        background: #eb3737;

        .line {
          background: #fff;
        }
      }

      .line {
        width: 10px;
        height: 2px;
        background: #ee4040;
      }
    }
  }

  .upcast-area {
    width: 100%;

    .header {
      display: flex;
      align-items: center;

      .title {
        font-size: 12px;
        color: #7a869a;
        line-height: 18px;
      }

      .line {
        flex: 1;
        height: 1px;
        background: #e4e7eb;
        margin-left: 10px;
      }
    }

    .upcast-list {
      padding-left: 78px;
      box-sizing: border-box;

      .dep {
        border: none;

        & + .dep {
          border-top: 1px solid #e4e7eb;
        }
      }
    }
  }
}

.auth-drawer-wrapper {
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

      .btns {
        display: flex;

        .btn {
          height: 38px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;

          & + .btn {
            margin-left: 10px;
          }

          &.cancel {
            background: #fff;
            color: #666666;

            &:hover {
              color: #529dff;
            }

            &:active {
              color: #2376e5;
            }
          }

          &.sure {
            background: #2784ff;
            color: #fff;
            border-radius: 4px;

            &:hover {
              background: #529dff;
            }

            &:active {
              background: #2376e5;
            }
          }
        }
      }
    }

    .drawer-body {
      flex: 1;
      height: 0;
      width: 100%;
      padding-top: 30px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;

      .resource-info {
        width: 100%;
        padding: 0 30px;
        box-sizing: border-box;
        display: flex;

        .info {
          flex: 1;
          width: 0;
          margin-left: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          .info-top {
            width: 100%;
            display: flex;
            align-items: center;

            .error-tag {
              height: 20px;
              padding: 0 5px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
              display: flex;
              align-items: center;
              margin-right: 5px;

              &.unreleased {
                background: #e0e0e0;
                color: #666666;
              }

              &.freeze {
                background: #fdebec;
                color: #ee4040;
              }

              &.offline {
                background: #fbf5ea;
                color: #dca32d;
              }
            }

            .error-icon {
              font-size: 16px;
              color: #ee4040;
              margin-right: 5px;
            }

            .warning-icon {
              color: #ffc704;
              font-size: 16px;
              margin-right: 5px;
            }

            .name {
              flex: 1;
              width: 0;
              font-size: 14px;
              font-weight: 600;
              color: #222222;
              line-height: 20px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }

          .other {
            font-size: 12px;
            color: #999999;
            line-height: 18px;
          }
        }
      }

      .warning-tip {
        width: 100%;
        padding: 0 30px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 400;
        color: #c78d12;
        line-height: 20px;
        margin-top: 15px;
        margin-bottom: -15px;

        .warning-icon {
          font-size: 20px;
          color: #ffc704;
          margin-right: 10px;
        }
      }

      .policy-area {
        flex: 1;
        height: 0;
        width: 100%;
        padding: 0 30px;
        box-sizing: border-box;
        margin-top: 30px;

        .policy-area-body {
          position: relative;
          display: flex;
          flex-direction: column;

          .upcast-box {
            position: absolute;
            right: 0;
            top: 0;
            display: flex;
            align-items: center;

            .upcast-btn {
              display: flex;
              align-items: center;
              font-size: 12px;
              color: #ee4040;
              line-height: 18px;
              cursor: pointer;

              &:hover {
                color: #f86363;
              }

              &:active {
                color: #eb3737;
              }

              .upcast-icon {
                font-size: 14px;
                margin-right: 5px;
              }
            }

            .tip-icon {
              font-size: 14px;
              color: #999999;
              margin-left: 10px;
              cursor: pointer;
            }
          }

          .title {
            width: 100%;
            font-size: 12px;
            color: #999999;
            line-height: 18px;
          }

          .contract-list {
            width: 100%;
            margin: 15px 0;

            .contract-card + .contract-card {
              margin-top: 15px;
            }
          }

          .view-terminate-btn {
            width: fit-content;
            font-size: 14px;
            color: #2784ff;
            line-height: 22px;
            margin-bottom: 15px;
            cursor: pointer;

            &:hover {
              color: #529dff;
            }

            &:active {
              color: #2376e5;
            }
          }
        }
      }

      .error-box {
        position: relative;
        flex: 1;
        width: 100%;

        .upcast-error-tip {
          position: absolute;
          width: 100%;
          top: calc((100% - 184px) / 5 * 2);

          .tip {
            display: flex;
            flex-direction: column;
            align-items: center;

            .upcast-icon {
              width: 64px;
              height: 64px;
              border-radius: 50%;
              background: #fdebec;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 34px;
              color: #ee4040;
            }

            .error-text {
              font-size: 16px;
              font-weight: 600;
              color: #858585;
              line-height: 22px;
              margin-top: 20px;
            }

            .restore-btn {
              height: 38px;
              padding: 0 20px;
              border-radius: 4px;
              background: #edf6ff;
              font-size: 14px;
              font-weight: 600;
              color: #2784ff;
              display: flex;
              align-items: center;
              margin-top: 40px;
              cursor: pointer;

              &:hover {
                background-color: #f1f8ff;
                color: #529dff;
              }

              &:active {
                background-color: #e4f0ff;
                color: #187afc;
              }
            }
          }
        }

        .error-tip {
          position: absolute;
          width: 100%;
          top: calc((100% - 22px) / 5 * 2);

          .tip {
            display: flex;
            align-items: center;
            justify-content: center;

            .error-icon {
              color: #ee4040;
              font-size: 20px;
            }

            .error-text {
              font-size: 16px;
              line-height: 22px;
              color: #666;
              margin-left: 8px;
            }
          }
        }
      }
    }
  }
}
</style>
