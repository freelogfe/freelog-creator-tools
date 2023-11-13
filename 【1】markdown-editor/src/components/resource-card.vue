<!-- 资源卡片 -->

<template>
  <div class="resource-card-wrapper" @click="insert">
    <Cover :src="coverImages[0]" />
    <div class="name" :title="resourceTitle || resourceName">{{ resourceTitle || resourceName }}</div>
    <div class="info">
      <div>{{ arr2Str(resourceType, " / ") }}</div>
      <div>{{ I18n("latest_version") + " " + latestVersion }}</div>
    </div>
    <div class="policy-tags" v-if="onlinePolicies.length">
      <div class="tag" v-for="item in onlinePolicies" :key="item.policyId">{{ item.policyName }}</div>
    </div>
    <div class="no-policy" v-else>{{ I18n("msg_no_authplan_active") }}</div>
  </div>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { insertResource } from "@/core/resource";
import { useStore } from "@/store";
import { arr2Str } from "@/utils/common";
import Cover from "@/components/cover.vue";

const store = useStore();
const props = defineProps(["data"]);

const { coverImages, resourceName, resourceTitle, resourceType, latestVersion, policies } = props.data;
const onlinePolicies = policies.filter((item: { status: number }) => item.status === 1);

/** 插入资源 */
const insert = () => {
  insertResource(props.data);
  store.editorFuncs.setResourceDrawerType("");
};
</script>

<style lang="scss" scoped>
.resource-card-wrapper {
  width: 100%;
  background: #fafbfc;
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
  cursor: pointer;

  &:hover {
    box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2);
  }

  .name {
    font-size: 14px;
    font-weight: 600;
    color: #222222;
    line-height: 20px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-top: 10px;
  }

  .info {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #999999;
    line-height: 18px;
    margin-top: 8px;
  }

  .policy-tags {
    height: 26px;
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    margin-top: 12px;

    .tag {
      padding: 3px 5px;
      background: #e9f2ff;
      border-radius: 2px;
      border: 1px solid #aed0ff;
      font-size: 12px;
      color: #2784ff;
      line-height: 18px;

      & + .tag {
        margin-left: 5px;
      }
    }
  }

  .no-policy {
    line-height: 18px;
    color: #999;
    font-size: 12px;
    margin-top: 15px;
  }
}
</style>
