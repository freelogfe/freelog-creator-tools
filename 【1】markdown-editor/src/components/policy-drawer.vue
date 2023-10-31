<!-- 授权弹窗 -->

<template>
  <el-drawer
    id="policyDrawer"
    class="policy-drawer-wrapper"
    v-model="data.show"
    :with-header="false"
    size="100%"
    direction="ttb"
    :before-close="closeDrawer"
    destroy-on-close
  >
    <div class="drawer">
      <div class="drawer-header">
        <div class="header-body">
          <div class="title">{{ I18n("title_posteditor_getauth") }}</div>
          <i class="freelog fl-icon-guanbi close-btn" @click="closeDrawer" />
        </div>
      </div>

      <div class="authorization-processor-box">
        <ResourceAuthProcessor />
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { defineAsyncComponent, useAttrs, watch, reactive } from "vue";
import { useStore } from "@/store";
import ResourceAuthProcessor from "@/components/resource-auth-processor.vue";

// const ResourceAuthProcessor = defineAsyncComponent(() => import("@/components/resource-auth-processor.vue"));

const store = useStore();
const props = defineProps(["show"]);

const data = reactive({
  show: false,
});

/** 关闭抽屉 */
const closeDrawer = () => {
  store.editor.setPolicyDrawer(false);
};

watch(
  () => props.show,
  (cur) => {
    data.show = cur;
  }
);
</script>

<style lang="scss" scoped>
.policy-drawer-wrapper {
  .drawer {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .drawer-header {
      width: 100%;
      height: 78px;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      flex-shrink: 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);

      .header-body {
        width: 1100px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .title {
          font-size: 16px;
          font-weight: 600;
          color: #222222;
          line-height: 22px;
        }

        .close-btn {
          font-size: 12px;
          color: #333;
          cursor: pointer;
          padding: 10px;
          margin-right: -10px;

          &:hover {
            color: #529dff;
          }

          &:active {
            color: #2376e5;
          }
        }
      }
    }

    .authorization-processor-box {
      flex: 1;
      height: 0;
      width: 1100px;
      padding: 30px 0;
    }
  }
}
</style>
