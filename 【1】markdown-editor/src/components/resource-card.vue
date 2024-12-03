<!-- 资源 -->

<template>
  <div class="resource-card-wrapper" @click="insert">
    <div class="resource-card-box">
      <div class="resource-card">
        <Cover :resourceData="props.data" :width="104" />

        <div class="resource-body">
          <div class="resource-name" :title="props.data.resourceTitle ? props.data.resourceTitle : props.data.resourceName">
            {{ props.data.resourceTitle ? props.data.resourceTitle : props.data.resourceName }}</div>
          <div class="resource-other">
            <img class="avatar" :src="`https://image.freelog.com/avatar/${props.data.userId}`" />
            <span>{{ props.data.username }}｜</span>
            <span>{{ props.data.resourceType.join(" / ") }}｜</span>
            <span>
              {{ I18n("claim_rely_addrely_entry_lastupdated", { TimeStamp: formatDate(props.data.updateDate) }) }}
            </span>
          </div>
          <div class="policy-tags">
            <div class="tag" v-for="item in onlinePolicies" :key="item.policyId">
              <i class="freelog fl-icon-heyue1" />
              {{ item.policyName }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { ContractService } from "@/api/request";
import Cover from "@/components/cover.vue";
import { insertResource } from "@/core/resource";
import { useStore } from "@/store";
import { formatDate } from "@/utils/common";

const store = useStore();
const props = defineProps(["data"]);

/** 上线的策略 */
const onlinePolicies = props.data.policies.filter((item: { status: number }) => item.status === 1);

/** 插入资源 */
const insert = async () => {
  const { resourceId, resourceName, latestVersion } = props.data;
  const { directDependencies } = store.draftData;
  const index = directDependencies?.findIndex((item) => item.id === resourceId);
  if (index === -1) {
    // 此资源不存在依赖列表
    const params = {
      subjectIds: resourceId,
      licenseeId: store.resourceId,
      subjectType: 1,
      licenseeIdentityType: 1,
      isLoadPolicyInfo: 1,
      isTranslate: 1,
    };
    const contractList = await ContractService.getContractsBatch(params);
    if (contractList.length) {
      // 有合约时，直接申明依赖
      const dep = { id: resourceId, name: resourceName, type: "resource", versionRange: `^${latestVersion}` };
      directDependencies.unshift(dep);
      store.editorFuncs.saveDeps();
    }
  }

  insertResource(props.data);
  store.editorFuncs.setResourceDrawerType("");
};
</script>

<style lang="scss" scoped>
.resource-card-wrapper {
  width: 100%;
  overflow: hidden;

  .resource-card-box {
    position: relative;
    width: 100%;
    display: flex;

    .resource-card {
      flex: 1;
      width: 0;
      padding: 15px;
      box-sizing: border-box;
      background: rgba(0, 0, 0, 0.03);
      border-radius: 6px;
      display: flex;
      cursor: pointer;

      &:hover {
        background: #edf6ff;
      }

      .resource-body {
        flex: 1;
        width: 0;
        margin-left: 10px;

        .resource-name {
          width: 100%;
          font-size: 14px;
          font-weight: 600;
          color: #222222;
          line-height: 20px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .resource-other {
          font-size: 12px;
          color: #999999;
          display: flex;
          align-items: center;
          margin-top: 6px;

          .avatar {
            width: 20px;
            height: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 50%;
            box-sizing: border-box;
            margin-right: 5px;
          }
        }

        .policy-tags {
          display: flex;
          flex-wrap: wrap;
          margin-top: 1px;

          .tag {
            height: 26px;
            padding: 0 7px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            border-radius: 4px;
            border: 1px solid #2784ff;
            font-size: 12px;
            color: #2784ff;
            font-weight: bold;
            line-height: 18px;
            margin-right: 5px;
            margin-top: 5px;

            .freelog {
              font-size: 14px;
              font-weight: normal;
              margin-right: 5px;
            }
          }
        }
      }
    }
  }
}
</style>
