<!-- 图片组件 -->

<template>
  <el-drawer
    class="import-drawer-wrapper"
    v-model="store.importDrawerShow"
    :with-header="false"
    :size="700"
    :before-close="close"
  >
    <div class="drawer" @click="clickDrawer()">
      <div class="drawer-header">
        <div class="title">{{ I18n("cbformatter_import_btn") }}</div>
        <i class="freelog fl-icon-guanbi close-btn" @click="close()" />
      </div>
      <div class="drawer-body">
        <el-tabs v-model="data.activeTab">
          <el-tab-pane :label="I18n('importpost_tab_fromlocal')" name="upload">
            <div class="upload-area">
              <div class="upload-frame">
                <input
                  id="uploadLocalFileInComicTool"
                  class="uploader"
                  type="file"
                  accept=".cbz,.cbr,.cbt,.zip,.rar,.tar"
                  @change="uploadLocalFile"
                />

                <div class="upload-box" :class="{ normal: data.uploadStatus === 1 }">
                  <div class="tip">{{ I18n("cbformatter_import_msg") }}</div>
                  <div class="warning">{{ I18n("cbformatter_import_msg02") }}</div>
                  <div class="upload-btn" @click="selectFile()">
                    {{ I18n("cbformatter_import_btn_selectnimport") }}
                  </div>
                </div>
                <template v-if="data.uploadStatus > 1">
                  <div class="upload-icon" :class="{ uploaded: [3, 4].includes(data.uploadStatus) }">
                    <div class="sector-box">
                      <div class="sector" />
                    </div>
                    <div class="modal" />
                    <div class="icon-box">
                      <img class="icon-png" src="../assets/images/object.png" />
                    </div>
                  </div>
                  <div class="uploading-tip" v-if="data.uploadStatus === 2">
                    {{ I18n("cbformatter_import_state_importing") }}
                  </div>
                  <div
                    class="uploaded-box"
                    :class="{ animation: data.uploadStatus === 3 }"
                    v-if="[3, 4].includes(data.uploadStatus)"
                  >
                    <div class="uploaded-tip">
                      <i class="freelog fl-icon-a-chenggongzhengqueduigou1"></i>
                      <div class="tip-text">{{ I18n("uploadfile_state_uploaded") }}</div>
                    </div>
                    <div class="warning">{{ I18n("cbformatter_import_confirmation") }}</div>
                    <div class="btns">
                      <div class="cancel-btn" @click="cancelImport">{{ I18n("btn_cancel") }}</div>
                      <div class="import-btn" @click="importFromUpload()">{{ I18n("btn_import_post") }}</div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane :label="I18n('importpost_tab_fromstorage')" name="bucket">
            <DrawerStorageList
              :active="data.activeTab === 'bucket'"
              :closeSubPopup="data.closeSubPopup"
              @select="importFromObject"
            />
          </el-tab-pane>

          <el-tab-pane :label="I18n('importpost_tab_fromreleasedversions')" name="history">
            <div class="history-area">
              <div class="input-area">
                <SearchInput />
              </div>
              <div class="history-list">
                <template v-if="historyListToShow.length !== 0">
                  <div class="history-item" v-for="item in historyListToShow" :key="item.versionId">
                    <div class="info-area">
                      <div class="version" :title="item.version">{{ item.version }}</div>
                      <div class="other-info">
                        {{ `${I18n("label_last_updated")} ${formatDate(item.updateDate)}` }}
                      </div>
                    </div>

                    <el-popconfirm
                      :title="I18n('confirmation_import_post')"
                      :confirm-button-text="I18n('btn_import_post')"
                      :cancel-button-text="I18n('btn_cancel')"
                      width="auto"
                      placement="bottom-end"
                      :hide-after="0"
                      :icon="WarningFilled"
                      icon-color="#faad14"
                      @confirm="importFromHistory(item)"
                    >
                      <template #reference>
                        <div class="choose-btn">{{ I18n("btn_import_post") }}</div>
                      </template>
                    </el-popconfirm>
                  </div>
                </template>
                <div class="no-data-box" v-else>
                  <NoData />
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
import { useStore } from "@/store";
import { formatDate, getExt } from "@/utils/common";
import { computed, reactive, watch } from "vue";
import SearchInput from "@/components/search-input.vue";
import NoData from "@/components/no-data.vue";
import { ResourceService, StorageService } from "@/api/request";
import { WarningFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { uncompressComicArchive } from "@/core/import-comic";
import DrawerStorageList from "@/components/drawer-storage-list.vue";

const props = defineProps([]);

const store = useStore();

const data = reactive({
  activeTab: "",
  importFile: null as any,
  uploadStatus: 1,
  historyList: [] as any[],
  closeSubPopup: 0,
});

/** 需要显示的历史版本 */
const historyListToShow = computed(() => {
  const { searchKey } = store;
  const list = data.historyList.filter((item: any) => `${item.version} ${item.filename}`.includes(searchKey));
  return list;
});

/** 关闭弹窗 */
const close = () => {
  data.closeSubPopup++;
  store.importDrawerShow = false;
};

/** 点击抽屉 */
const clickDrawer = () => {
  data.closeSubPopup++;
};

/** 选择本地文件 */
const selectFile = () => {
  document.getElementById("uploadLocalFileInComicTool")!.click();
};

/** 上传文件 */
const uploadLocalFile = (e: any) => {
  data.uploadStatus = 2;
  setTimeout(() => {
    data.uploadStatus = 3;
    setTimeout(() => {
      data.uploadStatus = 4;
      data.importFile = e.target;
    }, 400);
  }, 500);
};

/** 取消导入 */
const cancelImport = () => {
  data.uploadStatus = 1;
  // 清除上传缓存
  data.importFile.value = "";
  data.importFile = null;
};

/** 从本地上传导入文档 */
const importFromUpload = async () => {
  if (!data.importFile) return;

  store.loaderShow = true;
  sureImport(data.importFile.files[0], 2);
  // 清除上传缓存
  data.importFile.value = "";
  data.importFile = null;
  data.uploadStatus = 1;
};

/** 从存储对象导入 */
const importFromObject = async (item: { objectId: string; objectName: string }) => {
  store.loaderShow = true;
  const { objectId, objectName } = item;
  const res = await StorageService.getObjectFile(objectId, { responseType: "blob" });
  const file = new File([res], objectName);
  sureImport(file, 3);
};

/** 获取历史版本 */
const getHistoryVersion = async () => {
  const { resourceId } = store;
  const res = await ResourceService.getResourceVersions(resourceId, {
    projection: "versionId,version,updateDate,filename",
    sort: "updateDate:-1",
  });
  data.historyList = res;
};

/** 从版本导入 */
const importFromHistory = async (item: { version: string; filename: string }) => {
  store.loaderShow = true;
  const { version, filename } = item;
  const res = await ResourceService.getResourceFile(store.resourceId, version, { responseType: "blob" });
  const file = new File([res], filename + ".zip", { type: "application/zip" });
  sureImport(file, 4);
};

/** 确认导入 */
const sureImport = async (file: File, importType: 2 | 3 | 4) => {
  const suffix = getExt(file.name);
  if (!["zip", "rar", "tar", "cbz", "cbr", "cbt"].includes(suffix)) {
    ElMessage.error(I18n("cbformatter_import_error_format"));
    store.loaderShow = false;
    return;
  }

  store.draftData.customProperties = [];
  store.draftData.customConfigurations = [];
  store.comicConfig = null;
  store.imgList = [];
  // store.comicName = file.name;
  store.autoScroll = true;

  close();

  uncompressComicArchive(file, importType);
};

watch(
  () => store.importDrawerShow,
  (cur) => {
    if (!cur) return;

    data.activeTab = "upload";
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
.import-drawer-wrapper {
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
              width: 370px;

              .version {
                font-size: 14px;
                font-weight: 600;
                color: #222222;
                line-height: 20px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }

              .other-info {
                margin-top: 2px;
                font-size: 12px;
                font-weight: 400;
                color: #999999;
                line-height: 17px;
              }
            }
          }

          .no-data-box {
            height: calc(100vh - 70px - 60px - 30px - 38px - 30px - 20px);
            padding-top: calc((100vh - 70px - 60px - 30px - 38px - 30px - 20px) / 5 * 2);
            box-sizing: border-box;
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

      &::-webkit-scrollbar {
        width: 3px;
      }

      &::-webkit-scrollbar-thumb {
        width: 3px;
        border-radius: 3px;
        background-color: rgba(0, 0, 0, 0.2);
      }
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
