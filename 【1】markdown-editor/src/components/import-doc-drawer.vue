<!-- 导入文档弹窗 -->

<template>
  <el-drawer
    class="import-doc-drawer-wrapper"
    v-model="data.show"
    :with-header="false"
    :size="700"
    :before-close="closeDrawer"
  >
    <div class="drawer" @click="clickDrawer" v-if="data.show">
      <div class="drawer-header">
        <div class="title">{{ I18n("title_import_post") }}</div>
        <i class="freelog fl-icon-guanbi close-btn" @click="closeDrawer" />
      </div>

      <div class="drawer-body">
        <el-tabs v-model="data.activeTab">
          <el-tab-pane :label="I18n('importpost_tab_fromlocal')" name="upload">
            <div class="upload-area">
              <div class="upload-frame">
                <input
                  class="uploader"
                  type="file"
                  id="uploadLocalFileInMarkdownEditor"
                  accept=".md,.txt"
                  @change="uploadLocalFile"
                />

                <div class="upload-box" :class="{ normal: data.uploadStatus === 1 }">
                  <div class="tip">{{ I18n("msg_import_post_from_local") }}</div>
                  <div class="warning">{{ I18n("msg_import_post_from_local_02") }}</div>
                  <div class="upload-btn" @click="selectFile">{{ I18n("btn_upload_local_file") }}</div>
                </div>
                <template v-if="data.uploadStatus > 1">
                  <div class="upload-icon" :class="{ uploaded: [3, 4].includes(data.uploadStatus) }">
                    <div class="sector-box">
                      <div class="sector"></div>
                    </div>
                    <div class="modal"></div>
                    <div class="icon-box">
                      <img class="icon-png" src="@/assets/images/object.png" />
                    </div>
                  </div>
                  <div class="uploading-tip" v-if="data.uploadStatus === 2">{{ I18n("upload_state_uploading") }}</div>
                  <div
                    class="uploaded-box"
                    :class="{ animation: data.uploadStatus === 3 }"
                    v-if="[3, 4].includes(data.uploadStatus)"
                  >
                    <div class="uploaded-tip">
                      <i class="freelog fl-icon-a-chenggongzhengqueduigou1" />
                      <div class="tip-text">{{ I18n("uploadfile_state_uploaded") }}</div>
                    </div>
                    <div class="warning">{{ I18n("msg_import_post_from_local_02") }}</div>
                    <div class="btns">
                      <div class="cancel-btn" @click="cancelImport">{{ I18n("btn_cancel") }}</div>
                      <div class="import-btn" @click="importFromUpload">{{ I18n("btn_import_post") }}</div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane :label="I18n('importpost_tab_fromstorage')" name="bucket">
            <DrawerStorageList
              :active="data.activeTab === 'bucket'"
              operateType="import"
              type="text"
              :closeSubPopup="data.closeSubPopup"
              @select="importFromObject"
            />
          </el-tab-pane>

          <el-tab-pane :label="I18n('importpost_tab_fromreleasedversions')" name="history">
            <div class="history-area">
              <div class="input-area">
                <SearchInput />
              </div>

              <el-scrollbar>
                <div class="history-list">
                  <div class="history-item" v-for="item in historyListToShow" :key="item.versionId">
                    <div class="info-area">
                      <div class="version">{{ item.version }}</div>
                      <div class="other-info">
                        {{ `${I18n("label_last_updated")} ${formatDate(item.updateDate, "YYYY-MM-DD hh:mm")}` }}
                      </div>
                    </div>

                    <el-popconfirm
                      :title="I18n('confirmation_import_post')"
                      :confirm-button-text="I18n('btn_import_post')"
                      :cancel-button-text="I18n('btn_cancel')"
                      @confirm="importFromHistory(item)"
                      width="500"
                    >
                      <template #reference>
                        <div class="choose-btn">{{ I18n("btn_import_post") }}</div>
                      </template>
                    </el-popconfirm>
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { Resource, ResourceVersion, UploadFileData } from "@/typings/object";
import { reactive, watch, computed } from "vue";
import { ResourceService, StorageService } from "@/api/request";
import { useStore } from "@/store";
import { importDoc } from "@/core/resource";
import { formatDate } from "@/utils/common";
import { ElMessage } from "element-plus";
import SearchInput from "@/components/search-input.vue";
import DrawerStorageList from "@/components/drawer-storage-list.vue";

const store = useStore();
const props = defineProps(["show"]);

const data = reactive({
  show: false,
  activeTab: "",
  importFile: null as UploadFileData | null,
  uploadStatus: 1,
  historyList: [] as ResourceVersion[],
  closeSubPopup: 0,
});

/** 需要显示的历史版本 */
const historyListToShow = computed(() => {
  const list = data.historyList.filter(
    (item) => item.version.includes(store.searchKey) || item.filename.includes(store.searchKey)
  );
  return list;
});

/** 关闭抽屉 */
const closeDrawer = () => {
  data.closeSubPopup++;
  setTimeout(() => {
    store.editorFuncs.setImportDrawer(false);
  }, 0);
};

/** 点击抽屉 */
const clickDrawer = () => {
  data.closeSubPopup++;
};

/** 选择本地文件 */
const selectFile = () => {
  document.getElementById("uploadLocalFileInMarkdownEditor")!.click();
};

/** 上传文件 */
const uploadLocalFile = (event: any) => {
  const file = event.target.files[0];
  // 清除上传缓存
  event.target.value = "";

  const { size, name } = file;

  if (size > 1024 ** 2 * 2) {
    ElMessage.warning(I18n("mdeditor_import_error_lengthlimitation"));
    return;
  }

  const arr = name.split(".");
  const suffix = arr[arr.length - 1];
  if (!["md", "txt"].includes(suffix.toLocaleLowerCase())) {
    ElMessage.warning(I18n("mdeditor_import_error_format"));
    return;
  }

  data.uploadStatus = 2;
  setTimeout(() => {
    data.uploadStatus = 3;
    setTimeout(() => {
      data.uploadStatus = 4;
    }, 400);
  }, 500);
  const fileReader = new FileReader();
  fileReader.readAsText(file);
  fileReader.onload = (e: any) => {
    const { result } = e.target;
    data.importFile = { name: file.name, content: result };
  };
};

/** 从本地上传导入文档 */
const importFromUpload = async () => {
  if (!data.importFile) return;

  const { content, name } = data.importFile;
  sureImport({ content, type: "upload", fileName: name });
};

/** 取消导入 */
const cancelImport = () => {
  data.uploadStatus = 1;
  data.importFile = null;
};

/** 确认导入 */
const sureImport = async (dataInfo: {
  content: string;
  type: "resource" | "object" | "upload";
  fileName: string;
  resourceId?: string;
  version?: string;
  objectId?: string;
}) => {
  const { type, fileName, resourceId = "", version = "", objectId = "" } = dataInfo;
  let deps = [...store.draftData.directDependencies];

  if (type === "resource") {
    const res = await ResourceService.getResourceVersionData(resourceId, version);
    const { filename, customPropertyDescriptors, dependencies } = res;
    const baseProperties = customPropertyDescriptors
      .filter((item: any) => item.type === "readonlyText")
      .map((item: any) => ({
        key: item.key,
        value: item.defaultValue,
        description: item.remark,
      }));
    const customOptionsData = customPropertyDescriptors
      .filter((item: any) => item.type === "editableText" || item.type === "select")
      .map((item: any) => ({
        key: item.key,
        description: item.remark,
        custom: item.type === "select" ? "select" : "input",
        defaultValue: item.defaultValue,
        customOption: item.candidateItems,
      }));
    store.draftData.selectedFileInfo = { name: filename };
    store.draftData.baseProperties = baseProperties;
    store.draftData.customOptionsData = customOptionsData;
    dependencies.forEach(async (dep: any) => {
      const index = deps.findIndex((item: { name: string }) => dep.name === item.name);
      if (index === -1) {
        // 识别出的依赖不在依赖树中，需添加进依赖树
        deps.push(dep);
      } else {
        deps[index].versionRange = dep.versionRange;
      }
    });
  } else if (type === "object") {
    const res = await StorageService.getObjectDetail(objectId);
    const { objectName, customPropertyDescriptors, dependencies } = res;
    if (dependencies.length) {
      const resourceNameList = dependencies
        .filter((item: any) => item.type === "resource")
        .map((item: any) => item.name);
      const objectNameList = dependencies.filter((item: any) => item.type === "object").map((item: any) => item.name);
      const resourceData = await ResourceService.getResourceDataBatch({ resourceNames: resourceNameList.join() });
      resourceData.forEach((resource: Resource) => {
        const { resourceId, resourceName } = resource;
        const item = dependencies.find((dep: any) => dep.name === resourceName);
        item.id = resourceId;
      });
      const objectData = await StorageService.searchObject(objectNameList.join());
      if (objectData) {
        objectData.forEach((object: any) => {
          const { objectId, bucketName, objectName } = object;
          const item = dependencies.find((dep: any) => dep.name === `${bucketName}/${objectName}`);
          item.id = objectId;
          item.versionRange = "";
        });
      }
    }
    const baseProperties = customPropertyDescriptors
      .filter((item: any) => item.type === "readonlyText")
      .map((item: any) => ({
        key: item.key,
        value: item.defaultValue,
        description: item.remark,
      }));
    const customOptionsData = customPropertyDescriptors
      .filter((item: any) => item.type === "editableText" || item.type === "select")
      .map((item: any) => ({
        key: item.key,
        description: item.remark,
        custom: item.type === "select" ? "select" : "input",
        defaultValue: item.defaultValue,
        customOption: item.candidateItems,
      }));
    store.draftData.selectedFileInfo = { name: objectName };
    store.draftData.baseProperties = baseProperties;
    store.draftData.customOptionsData = customOptionsData;
    dependencies.forEach(async (dep: any) => {
      const index = deps.findIndex((item: { name: string }) => dep.name === item.name);
      if (index === -1) {
        // 识别出的依赖不在依赖树中，需添加进依赖树
        deps.push(dep);
      } else {
        deps[index].versionRange = dep.versionRange;
      }
    });
  } else if (type === "upload") {
    store.draftData.selectedFileInfo = { name: fileName };
    store.draftData.baseProperties = [];
    store.draftData.customOptionsData = [];
    data.importFile = null;
    data.uploadStatus = 1;
  }

  closeDrawer();
  const html = await importDoc(dataInfo);
  setTimeout(() => {
    store.editorFuncs.initEditor(html, true);
  }, 0);
};

/** 从存储对象导入文档 */
const importFromObject = async (item: {
  objectId: string;
  objectName: string;
  systemProperty: { fileSize: number };
}) => {
  const {
    objectId,
    objectName,
    systemProperty: { fileSize },
  } = item;

  if (fileSize > 1024 ** 2 * 2) {
    ElMessage.warning(I18n("mdeditor_import_error_lengthlimitation"));
    return;
  }

  const res = await StorageService.getObjectFile(objectId);
  data.importFile = { name: objectName, content: res };
  sureImport({ content: res, type: "object", fileName: objectName, objectId });
};

/** 获取历史版本 */
const getHistoryVersion = async () => {
  const res = await ResourceService.getResourceVersions(store.resourceId, {
    projection: "versionId,version,updateDate,filename",
    sort: "updateDate:-1",
  });
  data.historyList = res;
};

/** 从版本导入文档 */
const importFromHistory = async (item: { version: string; filename: string }) => {
  const { version, filename } = item;
  const res = await ResourceService.getResourceFile(store.resourceId, version);
  data.importFile = { name: filename, content: res };
  sureImport({ content: res, type: "resource", fileName: filename, resourceId: store.resourceId, version });
};

watch(
  () => props.show,
  (cur) => {
    data.show = cur;
    data.activeTab = cur ? "upload" : "";
  }
);

watch(
  () => data.activeTab,
  (cur) => {
    if (cur === "history") {
      store.searchKey = "";
      getHistoryVersion();
    }
  }
);
</script>

<style lang="scss" scoped>
.import-doc-drawer-wrapper {
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

      .upload-area {
        width: 100%;
        padding: 0 30px;
        box-sizing: border-box;

        .upload-frame {
          position: relative;
          width: 100%;
          height: 368px;
          border-radius: 10px;
          border: 1px dashed rgba(0, 0, 0, 0.15);
          overflow: hidden;

          .uploader {
            display: none;
          }

          .upload-box {
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0;
            top: -100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            &.normal {
              top: 0;
            }

            .tip {
              font-size: 16px;
              color: #666666;
              line-height: 22px;
            }

            .warning {
              font-size: 12px;
              color: #999999;
              line-height: 18px;
              margin-top: 40px;
            }

            .upload-btn {
              height: 50px;
              padding: 15px 50px;
              box-sizing: border-box;
              font-size: 14px;
              color: #ffffff;
              line-height: 20px;
              margin-top: 40px;
              background: #2784ff;
              border-radius: 4px;
              font-weight: 600;
              cursor: pointer;

              &:hover {
                background: #529dff;
              }

              &:active {
                background: #2376e5;
              }
            }
          }

          .upload-icon {
            position: absolute;
            left: 265px;
            top: 109px;
            width: 110px;
            height: 110px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s linear;

            &.uploaded {
              top: 40px;

              .sector-box {
                display: none;
              }
            }

            .sector-box {
              position: absolute;
              width: 112px;
              height: 112px;
              border-radius: 50%;
              display: flex;
              justify-content: flex-end;
              animation: rotate 1s linear infinite;

              .sector {
                width: 55px;
                height: 55px;
                border-radius: 0 55px 0 0;
                background-color: #44c28c;
              }
            }

            .modal {
              position: absolute;
              width: 110px;
              height: 110px;
              border-radius: 50%;
              background-color: #fff;
              z-index: 1;
            }

            .icon-box {
              position: relative;
              width: 110px;
              height: 110px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(0, 0, 0, 0.02);
              z-index: 1;

              .icon-png {
                width: 54px;
                height: 58px;
              }
            }
          }

          .uploading-tip {
            position: absolute;
            left: 0;
            top: 239px;
            width: 100%;
            display: flex;
            justify-content: center;
            position: absolute;
            font-size: 14px;
            color: #999999;
            line-height: 20px;
            margin-top: 20px;
          }

          .uploaded-box {
            position: absolute;
            left: 0;
            top: 170px;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            &.animation {
              animation: uploaded 0.2s linear 0.2s backwards;
            }

            .uploaded-tip {
              font-size: 14px;
              font-weight: 600;
              line-height: 20px;
              display: flex;
              align-items: center;

              .freelog {
                font-size: 16px;
                color: #44c28c;
              }

              .tip-text {
                color: #44c28c;
                margin-left: 5px;
              }

              .file-name {
                color: #222222;
                margin-left: 20px;
              }
            }

            .warning {
              font-size: 12px;
              color: #999999;
              line-height: 18px;
              margin-top: 40px;
            }

            .btns {
              display: flex;
              margin-top: 40px;

              .cancel-btn {
                padding: 9px 20px;
                background: #ededed;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 600;
                color: #666666;
                line-height: 20px;
                cursor: pointer;

                &:hover {
                  background: #f5f5f5;
                }

                &:active {
                  background: #e6e6e6;
                }
              }

              .import-btn {
                padding: 9px 20px;
                background: #2784ff;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 600;
                color: #ffffff;
                line-height: 20px;
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
        }
      }
    }

    .history-area {
      width: 100%;
      height: 100%;

      .input-area {
        padding: 0 30px;
        box-sizing: border-box;
        margin-bottom: 30px;
      }

      .history-list {
        padding: 0 30px;
        box-sizing: border-box;

        .history-item {
          width: 100%;
          height: 65px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e5e7eb;

          .info-area {
            .version {
              font-size: 14px;
              font-weight: 600;
              color: #222222;
              line-height: 20px;
            }

            .other-info {
              margin-top: 2px;
              font-size: 12px;
              font-weight: 400;
              color: #999999;
              line-height: 17px;

              span + span {
                margin-left: 20px;
              }
            }
          }
        }
      }
    }

    .choose-btn {
      padding: 6px 15px;
      background: #edf6ff;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      color: #2784ff;
      line-height: 20px;
      cursor: pointer;

      &:hover {
        background: #f1f8ff;
        color: #529dff;
      }

      &:active {
        background: #e4f0ff;
        color: #187afc;
      }
    }

    ::-webkit-scrollbar {
      width: 3px;
    }

    ::-webkit-scrollbar-thumb {
      width: 3px;
      border-radius: 3px;
      background-color: rgba(0, 0, 0, 0.2);
    }
  }
}

@keyframes uploaded {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
