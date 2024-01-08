<!-- 插入资源弹窗 -->

<template>
  <el-drawer
    class="insert-resource-drawer-wrapper"
    v-model="data.show"
    :with-header="false"
    :size="700"
    :before-close="closeDrawer"
  >
    <div class="drawer" @click="clickDrawer" v-if="data.show">
      <div class="drawer-header">
        <div class="title">{{ drawerTitle }}</div>
        <i class="freelog fl-icon-guanbi close-btn" @click="closeDrawer" />
      </div>

      <div class="drawer-body">
        <el-tabs v-model="data.activeTab">
          <el-tab-pane :label="I18n('insert_tab_resourcemarket')" name="market">
            <DrawerResourceList :active="data.activeTab === 'market'" from="market" :type="props.type" />
          </el-tab-pane>

          <el-tab-pane :label="I18n('insert_tab_myresources')" name="mine">
            <DrawerResourceList :active="data.activeTab === 'mine'" from="mine" :type="props.type" />
          </el-tab-pane>

          <el-tab-pane :label="I18n('insert_tab_mycollections')" name="collection">
            <DrawerResourceList :active="data.activeTab === 'collection'" from="collection" :type="props.type" />
          </el-tab-pane>

          <el-tab-pane :label="I18n('insert_tab_storage')" name="bucket" v-if="props.type !== 'text'">
            <DrawerStorageList
              :active="data.activeTab === 'bucket'"
              operateType="insert"
              :type="props.type"
              :closeSubPopup="data.closeSubPopup"
              @select="insertByObject"
            />
          </el-tab-pane>

          <el-tab-pane :label="I18n('insert_tab_url')" name="url" v-if="props.type !== 'text'">
            <div class="url-area">
              <textarea class="url-input" v-model="data.url" />
              <div class="btn-box">
                <div class="insert-btn" :class="{ disabled: !data.url }" @click="insertByUrl">
                  {{ I18n("btn_insert_from_url") }}
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { reactive, watch, computed } from "vue";
import { useStore } from "@/store";
import { insertUrlResource } from "@/core/resource";
import { getDomain } from "@/utils/common";
import DrawerResourceList from "@/components/drawer-resource-list.vue";
import DrawerStorageList from "@/components/drawer-storage-list.vue";

const store = useStore();
const props = defineProps(["show", "type"]);

/** 资源相关映射 */
const RESOURCE_MAPPING: any = {
  image: { resourceType: "图片", key: I18n("insert_title_image") },
  audio: { resourceType: "音频", key: I18n("insert_title_audio") },
  video: { resourceType: "视频", key: I18n("insert_title_video") },
  text: { resourceType: "阅读", key: I18n("insert_title_post") },
};

const data = reactive({
  show: false,
  activeTab: "",
  url: "",
  closeSubPopup: 0,
});

/** 需要显示的上传队列 */
const drawerTitle = computed(() => {
  if (!props.type) return "";

  const title = RESOURCE_MAPPING[props.type].key;
  return title;
});

/** 关闭抽屉 */
const closeDrawer = () => {
  data.closeSubPopup++;
  setTimeout(() => {
    store.editorFuncs.setResourceDrawerType(false);
  }, 0);
};

/** 点击抽屉 */
const clickDrawer = () => {
  data.closeSubPopup++;
};

/** 插入存储对象资源 */
const insertByObject = async (item: { bucketName: string; objectName: string }) => {
  const { bucketName, objectName } = item;
  store.editor.focus();
  const url = `${getDomain("file")}/objects/${bucketName}/${objectName}`;
  insertUrlResource(url, RESOURCE_MAPPING[props.type].resourceType);
  closeDrawer();
};

/** 插入 url 资源 */
const insertByUrl = () => {
  store.editor.focus();
  insertUrlResource(data.url, RESOURCE_MAPPING[props.type].resourceType);
  closeDrawer();
};

watch(
  () => props.show,
  (cur) => {
    data.show = cur;
    data.activeTab = cur ? "market" : "";
  }
);

watch(
  () => data.activeTab,
  () => {
    if (data.url) data.url = "";
  }
);
</script>

<style lang="scss" scoped>
.insert-resource-drawer-wrapper {
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
      height: 0;
      width: 100%;
      display: flex;
      flex-direction: column;

      :deep .el-tabs {
        flex: 1;
        height: 0;
        display: flex;
        flex-direction: column;

        .el-tabs__header {
          padding: 0 30px;
          box-sizing: border-box;
          margin-bottom: 30px;

          .el-tabs__item {
            height: 60px;
            font-size: 16px;
            font-weight: 600;
          }
        }

        .el-tabs__content {
          flex: 1;
          height: 0;
        }

        .el-tab-pane {
          height: 100%;
        }
      }

      .url-area {
        width: 100%;
        padding: 0 30px;
        box-sizing: border-box;

        .url-input {
          width: 100%;
          height: 200px;
          padding: 15px;
          box-sizing: border-box;
          border-radius: 4px;
          border: 1px solid #d1d1d1;
          resize: none;
          outline: none;
          word-break: break-all;
        }

        .btn-box {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;

          .insert-btn {
            padding: 9px 20px;
            box-sizing: border-box;
            background: #2784ff;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
            color: #ffffff;
            line-height: 20px;
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
      }
    }
  }
}
</style>
