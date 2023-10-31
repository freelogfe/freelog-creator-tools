<!-- 合约卡片 -->

<template>
  <div class="contract-card-wrapper" :class="{ 'active-contract': props.type === 'active' }" @click="selectPolicy">
    <div class="policy-header">
      <div class="policy-name">{{ props.data[props.type === "active" ? "contractName" : "policyName"] }}</div>
      <el-checkbox v-model="props.data.select" size="large" @click.stop v-if="props.type === 'enabled'" />
    </div>

    <div class="content-area" @click.stop>
      <div class="content-tab">
        <div
          class="content-title"
          :class="{ active: !data.showContent }"
          @click="data.showContent = false"
          v-if="props.type === 'active'"
        >
          {{ I18n("get_auth_tab_contract_records") }}
        </div>
        <div class="content-title" :class="{ active: data.showContent }" @click="data.showContent = true">
          {{ I18n("get_auth_tab_authplan_content") }}
        </div>
      </div>

      <div class="content-body" v-if="!data.showContent && props.type === 'active' && props.data.transitionRecord">
        <div class="record-item">
          <div class="item-header">
            <div
              class="status"
              :class="{
                terminal: props.data.transitionRecord.status === 1,
                active: [1, 2, 3].includes(props.data.transitionRecord.serviceStates),
                inactive: props.data.transitionRecord.serviceStates === 128,
              }"
            >
              {{
                props.data.status === 1
                  ? I18n("contract_state_end")
                  : I18n(AUTH_STATUS_MAPPING[props.data.transitionRecord.serviceStates as AuthStatus])
              }}
            </div>
            <div class="time">{{ props.data.transitionRecord.time }}</div>
          </div>
          <div class="state-info">{{ props.data.transitionRecord.stateInfoStr }}</div>
          <template v-if="props.data.status !== 1">
            <div class="event" v-for="event in props.data.transitionRecord.eventSectionEntities" :key="event">
              <div class="event-content">{{ event.content }}</div>
              <div class="pay-btn" v-if="event.origin.name === 'TransactionEvent'" @click="openPayPopup(event)">
                {{ I18n("contract_records_event_btn_pay") }}
              </div>
            </div>
          </template>
        </div>
        <div class="more-btn" @click="data.recordDrawerShow = true" v-if="props.data.transitionRecord.total > 1">
          {{ I18n("get_auth_btn_show_more_records") }}
        </div>
      </div>

      <div class="content-body" v-else-if="data.showContent">
        <div class="switch-btn" @click="props.data.codeMode = !props.data.codeMode">
          {{ props.data.codeMode ? I18n("contract_authplan_btn_showtranslation") : I18n("get_auth_btn_showcode") }}
        </div>
        <div
          class="content"
          v-html="props.data.codeMode ? props.data.policyInfo.policyText : props.data.policyInfo.translateInfo.content"
          v-if="props.type === 'active'"
        />
        <div
          class="content"
          v-html="props.data.codeMode ? props.data.policyText : props.data.translateInfo.content"
          v-else-if="props.type === 'enabled'"
        />
      </div>
    </div>

    <div class="contract-info" v-if="props.type === 'active'">
      <div class="info-item">
        <span>{{ I18n("get_auth_label_contract_id") }}</span
        ><span>{{ props.data.contractId }}</span>
      </div>
      <div class="info-item">
        <span>{{ I18n("get_auth_label_signed_time") }}</span
        ><span>{{ formatDate(props.data.createDate, "YYYY/MM/DD hh:mm") }}</span>
      </div>
    </div>
  </div>

  <!-- 合约流转记录 -->
  <ContractRecordDrawer
    :show="data.recordDrawerShow"
    :contractData="props.data"
    @close="data.recordDrawerShow = false"
  />

  <!-- 支付弹窗 -->
  <PayPopup
    :show="data.payPopupShow"
    :data="data.payData"
    @close="data.payPopupShow = false"
    @paySuccess="$emit('paySuccess', $event)"
  />
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { AUTH_STATUS_MAPPING } from "@/assets/data";
import { useStore } from "@/store";
import { TransitionRecordsEvent, PayData } from "@/typings/object";
import { AuthStatus } from "@/typings/type";
import { formatDate } from "@/utils/common";
import { ElMessage } from "element-plus";
import { defineAsyncComponent, reactive } from "vue";
import ContractRecordDrawer from "@/components/contract-record-drawer.vue";
import PayPopup from "@/components/pay-popup.vue";

// const ContractRecordDrawer = defineAsyncComponent(() => import("@/components/contract-record-drawer.vue"));
// const PayPopup = defineAsyncComponent(() => import("@/components/pay-popup.vue"));

const store = useStore();
const props = defineProps(["data", "type"]);
const emit = defineEmits(["paySuccess"]);

const data = reactive({
  showContent: props.type === "enabled",
  recordDrawerShow: false,
  payData: null as PayData | null,
  payPopupShow: false,
});

/** 选择授权策略 */
const selectPolicy = () => {
  if (props.type === "active") return;

  props.data.select = !props.data.select;
};

/** 打开支付弹窗 */
const openPayPopup = async (event: TransitionRecordsEvent) => {
  const userId = store.userData?.userId;
  if (!userId) return;

  const {
    id,
    args: { amount },
  } = event.origin;
  const { licensorOwnerId, subjectName, contractId, contractName, licensorOwnerName } = props.data;
  const isLicensorSelf = licensorOwnerId === userId;
  if (isLicensorSelf) {
    ElMessage.error(I18n("alert_cantsendmoneytoyourself"));
    return;
  }

  data.payData = { id, amount, subjectName, contractId, contractName, licensorOwnerName, userId };
  data.payPopupShow = true;
};
</script>

<style lang="scss" scoped>
.contract-card-wrapper {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #d4d4d4;
  padding: 0 20px 20px;
  box-sizing: border-box;
  cursor: pointer;

  &.active-contract {
    padding-bottom: 0;
    cursor: default;
  }

  .policy-header {
    width: 100%;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .policy-name {
      font-size: 14px;
      font-weight: 600;
      color: #333333;
      line-height: 20px;
    }
  }

  .content-area {
    position: relative;
    width: 100%;
    margin-top: 30px;
    cursor: default;

    .content-tab {
      position: absolute;
      left: 0;
      top: -30px;
      display: flex;

      .content-title {
        width: fit-content;
        height: 30px;
        padding: 0 15px;
        border-radius: 4px 4px 0px 0px;
        font-size: 12px;
        font-weight: 600;
        color: rgba(34, 34, 34, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s linear;
        cursor: pointer;

        &.active {
          color: #222222;
          background: #fafbfc;
          cursor: default;
        }

        &:hover {
          color: #222222;
        }
      }
    }

    .content-body {
      width: 100%;
      background: #fafbfc;
      border-radius: 0px 4px 4px 4px;
      padding: 15px;
      box-sizing: border-box;

      .record-item {
        width: 100%;

        & + .record-item {
          margin-top: 20px;
          opacity: 0.3;
        }

        .item-header {
          display: flex;
          align-items: center;

          .status {
            height: 20px;
            font-size: 12px;
            color: #fff;
            padding: 0 10px;
            border-radius: 10px;
            display: flex;
            align-items: center;

            &.active {
              background-color: #42c28c;
            }

            &.inactive {
              background-color: #e9a923;
            }

            &.terminal {
              background-color: #999;
            }
          }

          .time {
            color: #222;
            font-size: 12px;
            margin-left: 5px;
          }
        }

        .state-info {
          color: #222;
          font-size: 12px;
          line-height: 18px;
          font-weight: bold;
          margin-top: 10px;
        }

        .event {
          width: 100%;
          display: flex;
          align-items: center;
          margin-top: 6px;

          .event-content {
            font-weight: bold;
            color: #222;
            font-size: 12px;
            line-height: 18px;
          }

          .pay-btn {
            height: 24px;
            padding: 0 10px;
            display: flex;
            align-items: center;
            font-size: 12px;
            font-weight: 500;
            background: #2784ff;
            color: #fff;
            border-radius: 4px;
            margin-left: 10px;
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

      .more-btn {
        font-size: 12px;
        color: #2784ff;
        line-height: 18px;
        margin-top: 15px;
        color: #2784ff;
        cursor: pointer;

        &:hover {
          color: #529dff;
        }

        &:active {
          color: #2376e5;
        }
      }

      .switch-btn {
        width: fit-content;
        font-size: 12px;
        color: #2784ff;
        line-height: 18px;
        cursor: pointer;

        &:hover {
          color: #529dff;
        }

        &:active {
          color: #2376e5;
        }
      }

      .content {
        margin-top: 15px;
        font-size: 12px;
        color: #222222;
        line-height: 22px;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    }
  }

  .contract-info {
    width: 100%;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: #999999;
    line-height: 18px;

    .info-item {
      display: flex;

      span + span {
        margin-left: 10px;
      }
    }
  }
}
</style>
