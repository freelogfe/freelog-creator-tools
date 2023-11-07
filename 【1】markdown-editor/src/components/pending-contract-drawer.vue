<!-- 待执行合约弹窗 -->

<template>
  <el-drawer
    class="pending-contract-drawer-wrapper"
    v-model="data.show"
    :with-header="false"
    :size="700"
    destroy-on-close
    :before-close="closeDrawer"
  >
    <div class="drawer">
      <div class="drawer-header">
        <div class="title">{{ I18n("get_auth_title_unauthrized_rely") }}</div>
        <i class="freelog fl-icon-guanbi close-btn" @click="closeDrawer" />
      </div>

      <el-scrollbar v-if="!data.loading">
        <div class="drawer-body">
          <div class="dep-contract" v-for="item in props.data" :key="item.resourceId">
            <div class="resource-info">
              <Cover :src="item.coverImages ? item.coverImages[0] : ''" :width="68" />

              <div class="info">
                <div class="name" :title="item.resourceName">{{ item.resourceName }}</div>
                <div class="other" v-if="item.error !== 'object'">
                  <span>{{ item.resourceType.join(" / ") }}</span>
                  <span v-if="item.status !== 0">｜{{ I18n("claim_rely_version_rage") }}：{{ item.versionRange }}</span>
                </div>
              </div>
            </div>

            <div class="contract-list">
              <div class="contract-card" v-for="contract in item.pendingContractList" :key="contract.contractId">
                <ContractCard :data="contract" type="active" @paySuccess="$emit('paySuccess', $event)" />
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { defineAsyncComponent, reactive, watch } from "vue";
import { ContractService } from "@/api/request";
import Cover from "@/components/cover.vue";
import ContractCard from "@/components/contract-card.vue";

// const ContractCard = defineAsyncComponent(() => import("@/components/contract-card.vue"));

const props = defineProps(["show", "data"]);
const emit = defineEmits(["close", "paySuccess"]);

const data = reactive({
  show: false,
  loading: false,
});

/** 获取流转记录 */
const getTransitionRecord = async () => {
  if (!props.data.length) return;

  data.loading = true;
  let contractIds: string[] = [];
  props.data.forEach((item: any) => {
    contractIds.push(...item.pendingContractList.map((item: any) => item.contractId));
  });
  contractIds = [...new Set(contractIds)];
  const recordList = await ContractService.getContractTransitionRecordBatch(contractIds);
  props.data.forEach((item: any) => {
    item.pendingContractList.forEach((contract: any) => {
      const record = recordList.find((record: any) => record.contractId === contract.contractId);
      if (record) contract.transitionRecord = record;
    });
  });
  data.loading = false;
};

/** 关闭抽屉 */
const closeDrawer = () => {
  emit("close");
};

watch(
  () => props.show,
  (cur) => {
    data.show = !!cur;
    if (cur) getTransitionRecord();
  }
);
</script>

<style lang="scss" scoped>
.pending-contract-drawer-wrapper {
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

    .drawer-body {
      flex: 1;
      width: 100%;
      padding: 0 30px 20px;
      box-sizing: border-box;

      .dep-contract {
        margin-top: 30px;

        .resource-info {
          width: 100%;
          box-sizing: border-box;
          display: flex;

          .info {
            flex: 1;
            width: 0;
            margin-left: 10px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .name {
              font-size: 14px;
              font-weight: 600;
              color: #222222;
              line-height: 20px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }

            .other {
              font-size: 12px;
              color: #999999;
              line-height: 18px;
            }
          }
        }

        .contract-list {
          margin-top: 15px;

          .contract-card + .contract-card {
            margin-top: 15px;
          }
        }
      }
    }
  }
}
</style>
