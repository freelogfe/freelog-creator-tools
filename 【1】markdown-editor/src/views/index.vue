<template>
  <div class="creator-tools-markdown-editor" @click="store.editor?.focus()">
    <!-- header1: 只在编辑模式下用 -->
    <div class="header" v-if="store.appMode === 'normal'">
      <div class="title" @click="consoleMarkdown">{{ I18n("title_edit_post") }}</div>
      <div class="article-info">
        <div />
        <div>
          <span v-if="!data.disabled">{{ I18n("label_wordscounter") }} {{ data.wordsCount }}</span>
        </div>
        <div>
          <span v-if="data.saveType === 1">{{ I18n("posteditor_state_saving") }}</span>
          <span v-else-if="data.saveType === 2">
            {{ I18n("posteditor_state_saved", { LastEditTime: formatDate(data.lastSaveTime) }) }}
          </span>
          <span v-else-if="data.saveType === 3">
            {{ I18n("posteditor_state_networkabnormal", { LastEditTime: formatDate(data.lastSaveTime) }) }}
          </span>
        </div>
      </div>
      <div class="btns">
        <div class="save-btn" :class="{ disabled: !data.edited }" @click="save">{{ I18n("btn_save_post") }}</div>
        <div class="exit-btn" @click.stop="clickExitBtn">{{ I18n("btn_quit_editor") }}</div>
      </div>
    </div>
    <!-- header2: 只在预览模式下用 -->
    <div class="close-preview" v-else>
      <span class="freelog fl-icon-guanbi" @click="exit"></span>
    </div>

    <!-- loader -->
    <div class="loader-box" v-if="data.loading">
      <div class="fake-toolbar">
        <div class="fake-toolbar-box">
          <div class="item large" />
          <div class="item" />
          <div class="divider" />
          <div class="item" v-for="_ in 3" />
          <div class="divider" />
          <div class="item" v-for="_ in 2" />
          <div class="divider" />
          <div class="item" v-for="_ in 9" />
          <div class="divider" />
          <div class="item" v-for="_ in 2" />
        </div>
      </div>
      <div class="mask" />
      <div class="loader-tip">
        <i class="freelog fl-icon-loading" />
        <div class="tip">{{ I18n("posteditor_msg_loading") }}</div>
      </div>
    </div>

    <!-- 编辑器工具栏 -->
    <div class="editor-toolbar" v-if="store.appMode === 'normal'">
      <Toolbar :editor="store.editor" :defaultConfig="toolbarConfig" />
    </div>

    <!-- 编辑器 -->
    <div id="markdownEditorWrapper" class="markdown-editor" :class="{ 'preview': store.appMode }" />

    <!-- 插入资源弹窗 -->
    <InsertResourceDrawer :show="data.resourceDrawerShow" :type="data.resourceDrawerType" />

    <!-- 导入文档弹窗 -->
    <ImportDocDrawer :show="data.importDrawerShow" />

    <!-- 依赖申明弹窗 -->
    <DependenciesDeclaratorDrawer
      :show="data.denpendenciesDeclaratorDrawerShow"
      @close="data.denpendenciesDeclaratorDrawerShow = false"
    />

    <!-- 弹窗底层遮罩 -->
    <div class="modal" @click.stop v-if="data.exitPopupShow" />

    <!-- 退出确认弹窗 -->
    <transition name="fade-in-down">
      <div class="exit-confirm-popup" v-if="data.exitPopupShow">
        <div class="content">{{ I18n("alarm_leave_page") }}</div>
        <div class="btns-box">
          <div class="btn sure-btn" @click="exit()">{{ I18n("btn_leave") }}</div>
          <div class="btn cancle-btn" @click="data.exitPopupShow = false">{{ I18n("btn_cancel") }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, onBeforeUnmount, reactive, watch } from "vue";
import { useStore } from "@/store";
import { formatDate } from "@/utils/common";
import { I18n } from "@/api/I18n";
import { toolbarConfig, editorConfig } from "@/core/editor-config";
import "@wangeditor/editor/dist/css/style.css";
import { Toolbar } from "@wangeditor/editor-for-vue";
import { createEditor, i18nChangeLanguage } from "@wangeditor/editor";
import { ResourceService, StorageService } from "@/api/request";
import { CustomResourceData } from "@/typings/object";
import { getDependencesByContent, importDoc } from "@/core/resource";
import showdown from "showdown";
import { html2md } from "@/core/html2md";
import InsertResourceDrawer from "@/components/insert-resource-drawer.vue";
import ImportDocDrawer from "@/components/import-doc-drawer.vue";
import DependenciesDeclaratorDrawer from "@/components/dependencies-declarator-drawer.vue";
import { Language } from "@/typings/type";
import { ElMessage } from "element-plus";
import { loadMicroApp } from "qiankun";
import actions from "@/api/micro-state-actions";

showdown.setOption("tables", true);
showdown.setOption("tasklists", true);
showdown.setOption("simplifiedAutoLink", true);
showdown.setOption("openLinksInNewWindow", true);
showdown.setOption("backslashEscapesHTMLTags", true);
showdown.setOption("emoji", true);
showdown.setOption("splitAdjacentBlockquotes", true);
showdown.setOption("strikethrough", true);
showdown.setOption("simpleLineBreaks", true);

editorConfig.placeholder = I18n("hint_posteditor_contentfiled");

const store = useStore();

/** 语言映射 */
const LANGUAGE_MAPPING: Record<Language, string> = { zh_CN: "zh-CN", en_US: "en" };

const data = reactive({
  loading: false,
  html: "",
  wordsCount: 0,
  saveType: 0,
  lastSaveTime: 0,
  disabled: false,
  edited: false,
  resourceDrawerType: "",
  resourceDrawerShow: false,
  importDrawerShow: false,
  denpendenciesDeclaratorDrawerShow: false,
  exitPopupShow: false,
  inputTimer: null as any,
  stopTimer: null as any,
  authorizationProcessorContainer: null as any,
  authorizationProcessor: null as any,
});

onBeforeMount(() => {
  loadAuthorizationProcessor();
  window.addEventListener("keydown", keydown);
  window.addEventListener("beforeunload", (e) => {
    if (data.edited) e.returnValue = "";
  });
});

// 组件销毁时，及时销毁编辑器
onBeforeUnmount(() => {
  destroyAuthorizationProcessor();
  if (!store.editor) return;

  store.editor.destroy();
});

actions.onGlobalStateChange(async (cur) => {
  if (!cur.authProcessorShow) {
    if (store.updateBecauseRely) {
      store.updateBecauseRely = false;
      const html = await importDoc({ content: store.markdown, type: "draft" });
      initEditor(html);
    } else {
      store.editor.focus();
    }
  }
});

/** 输出 markdown */
const consoleMarkdown = () => {
  const env = process.env.NODE_ENV;
  if (env !== "development") return;

  console.log("原HTML文本===>\n", data.html);
  console.log("markdown文本===>\n", store.markdown);
};

/** 快捷键 */
const keydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    // ctrl+s 组件键，执行保存
    save();
    // 阻止网页默认保存事件
    e.preventDefault();
  }
};

/** 初始化编辑器方法 */
const initFuncs = () => {
  data.loading = true;
  const language = LANGUAGE_MAPPING[store.language as Language];
  i18nChangeLanguage(language);

  // markdown 转换器
  store.editorFuncs.converter = new showdown.Converter();
  // 初始化编辑器
  store.editorFuncs.initEditor = initEditor;
  // 保存
  store.editorFuncs.saveDeps = saveDeps;
  // 控制资源弹窗
  store.editorFuncs.setResourceDrawerType = (type: string) => {
    data.resourceDrawerType = type;
    data.resourceDrawerShow = !!type;
    if (!data.resourceDrawerShow) store.editor.focus();
  };
  // 控制导入弹窗
  store.editorFuncs.setImportDrawer = (show: boolean) => {
    data.importDrawerShow = show;
    if (!show) store.editor.focus();
  };
  // 控制依赖申明弹窗
  store.editorFuncs.setDependenciesDeclaratorDrawer = async (show: boolean) => {
    data.denpendenciesDeclaratorDrawerShow = show;

    if (!show) {
      if (store.updateBecauseRely) {
        store.updateBecauseRely = false;
        const html = await importDoc({ content: store.markdown, type: "draft" });
        initEditor(html);
      } else {
        store.editor.focus();
      }
    }
  };
  // 控制授权处理弹窗
  store.editorFuncs.setAuthorizationProcessorDrawer = async (show: boolean, resource: CustomResourceData) => {
    if (show) {
      const { resourceId, version } = resource;
      const { directDependencies = [], baseUpcastResources = [] } = store.draftData;
      const isDep = directDependencies.findIndex((item) => item.id === resourceId) !== -1;
      const upcasts = baseUpcastResources.map((item) => item.resourceID);
      actions.setGlobalState({
        authProcessorShow: true,
        licensorId: resourceId,
        versionRange: version,
        isDep,
        upcasts,
      });
    }
  };

  if (store.appMode === 'normal') {
    getResourceData();
  } else {
    getResourceOnly();
  }
};

/** 加载授权处理器子应用 */
const loadAuthorizationProcessor = () => {
  if (data.authorizationProcessor?.getStatus() === "MOUNTED") return;
  data.authorizationProcessorContainer = document.createElement("div");
  data.authorizationProcessorContainer.id = "authorizationProcessorInMarkdownEditor";
  document.body.appendChild(data.authorizationProcessorContainer);
  const { resourceId } = store;
  data.authorizationProcessor = loadMicroApp({
    name: "authorizationProcessorInMarkdownEditor",
    // entry: 'http://localhost:8402',
    entry: process.env.VUE_APP_AUTHORIZATION_PROCESSOR,
    container: data.authorizationProcessorContainer,
    props: { licenseeId: resourceId, mainAppType: "resourceInMarkdownEditor", mainAppFuncs: { add, upcast, update } },
  });
};

/**
 * 添加依赖
 * @param resourceData 资源数据
 */
const add = (resourceData: any) => {
  const { resourceId, resourceName, latestVersion, upcasted, upcastList } = resourceData;
  const { directDependencies = [], baseUpcastResources = [] } = store.draftData;
  const upcastItem = { id: resourceId, name: resourceName, type: "resource", versionRange: "^" + latestVersion };
  directDependencies.unshift(upcastItem);
  if (upcasted && !baseUpcastResources.some((item) => item.resourceID === resourceId)) {
    const upcastItem = { resourceID: resourceId, resourceName };
    baseUpcastResources.push(upcastItem);
  }
  upcastList.forEach((upcast: any) => {
    upcast.depType = "resource";
    if (upcast.upcasted && !baseUpcastResources.some((item) => item.resourceID === upcast.resourceId)) {
      const upcastItem = { resourceID: upcast.resourceId, resourceName: upcast.resourceName };
      baseUpcastResources.push(upcastItem);
    }
  });
  store.updateBecauseRely = true;
  saveDeps();
};

/**
 * 操作上抛
 * @param id 授权方 id
 * @param upcasted 是否上抛
 */
const upcast = (id: string, upcasted: boolean) => {
  const { directDependencies = [], baseUpcastResources = [] } = store.draftData;
  if (upcasted) {
    const dep = directDependencies.find((item) => item.id === id);
    if (!dep) return;

    const upcastItem = { resourceID: id, resourceName: dep?.name };
    baseUpcastResources.push(upcastItem);
  } else {
    const index = baseUpcastResources.findIndex((item) => item.resourceID === id);
    baseUpcastResources.splice(index, 1);
  }

  store.updateBecauseRely = true;
  saveDeps();
};

/**
 * 更新依赖
 * @param id 授权方 id
 */
const update = () => {
  store.updateBecauseRely = true;
};

/** 销毁授权处理器子应用 */
const destroyAuthorizationProcessor = () => {
  if (data.authorizationProcessor?.getStatus() !== "MOUNTED") return;

  data.authorizationProcessor.unmount();
  data.authorizationProcessor = null;
  document.body.removeChild(data.authorizationProcessorContainer);
  data.authorizationProcessorContainer = null;
};

/** 只获取资源相关数据 */
const getResourceOnly = async () => {

  const { resourceId, appMode, version } = store;
  
  const [resourceData, resourceVersionsInfo, resourceBlob] = await Promise.all([
    ResourceService.getResourceData(resourceId),
    ResourceService.getResourceVersions(resourceId, {} as { projection: string; sort: string }),
    ResourceService.getResourceFile(resourceId, version)
  ]);
  console.log(resourceData, resourceVersionsInfo, resourceBlob);

  if (!resourceData || !resourceBlob) return;

  store.resourceData = resourceData;
  store.draftData = {}
  
  const html = await importDoc({ content: resourceBlob, type: "resource", resourceId, version });

  initEditor(html);
}

/** 获取资源与草稿数据 */
const getResourceData = async () => {
  data.disabled = true;

  const { resourceId } = store;
  const [resourceData, resourceDraft] = await Promise.all([
    ResourceService.getResourceData(resourceId),
    ResourceService.getResourceDraftData(resourceId),
  ]);
  if (!resourceData || !resourceDraft) return;

  store.resourceData = resourceData;
  store.draftData = resourceDraft.draftData;

  getFileContent();
};

/** 获取文件内容 */
const getFileContent = async () => {
  data.loading = true;
  const { selectedFileInfo } = store.draftData;
  if (!selectedFileInfo || !selectedFileInfo.sha1) {
    initEditor();
    return;
  }

  const fileData = await StorageService.getStorageFile(selectedFileInfo.sha1, true);
  if (!["text/plain", "text/markdown"].includes(fileData.headers["content-type"])) {
    ElMessage({
      message: I18n("mdeditor_import_error_format"),
      type: "warning",
      duration: 1000,
    });
    setTimeout(() => {
      exit();
    }, 1500);
    return;
  }

  let content = fileData.data;

  /* txt中不符合的md语法处理 */
  // if (["text/plain"].includes(fileData.headers["content-type"])) {
  //   content = content.replaceAll("_", "\\_")
  //   content = content.replaceAll("<", "&lt;")
  //   content = content.replaceAll(">", "&gt;")
  // }

  const html = await importDoc({ content, type: "draft" });

  initEditor(html);
};

/** 初始化编辑器 */
const initEditor = async (html = "", saveNow = false) => {
  store.editor?.destroy();
  data.loading = true;
  setTimeout(() => {
    try {      
      store.editor = createEditor({
        selector: "#markdownEditorWrapper",
        html,
        config: {
          onChange(editor) {
            data.html = editor.getHtml();
          },
          onCreated() {
            setTimeout(() => {
              if (saveNow) save();
            }, 0);
          },
          onDestroyed: () => destroyEditor(),
          ...editorConfig,
          readOnly: true
        },
      });
      data.loading = false;
    } catch (error) {
      ElMessage({
        message: I18n("mdeditor_import_error_format"),
        type: "warning",
        duration: 3000,
      });
    }

    setTimeout(() => {
      data.disabled = false;
    }, 0);
  }, 500);
};

/** 销毁编辑器 */
const destroyEditor = () => {
  // 此数据必须在编辑器销毁时置空，不然销毁编辑器时无法正确销毁 toolbar
  store.editor = null;
};

/** 保存 */
const save = async () => {
  const { draftData, resourceId, resourceData, appMode } = store;
  if (!draftData || appMode === 'preview') return;

  if (data.inputTimer) {
    clearTimeout(data.inputTimer);
    data.inputTimer = null;
  }
  if (data.stopTimer) {
    clearTimeout(data.stopTimer);
    data.stopTimer = null;
  }
  data.saveType = 1;
  const saveTime = new Date().getTime();
  let fileName = draftData.selectedFileInfo?.name;
  if (!fileName) {
    // 草稿数据中没有文件名称，说明是新建文件，文件名称命名规则为{资源名称 最后保存时间}
    fileName = resourceData.resourceName.split("/")[1] + formatDate(saveTime, "YYYYMMDDhhmm").substring(2) + ".md";
  } else if (!fileName.endsWith(".md")) {
    const nameArr = fileName.split(".");
    nameArr.pop();
    fileName = nameArr.join(".") + ".md";
  }
  const res = await StorageService.uploadStorageFile({
    file: new File([store.markdown], fileName),
    extParams: { metaInfo: { WordCount: data.wordsCount } },
  });
  if (!res) return;

  store.draftData.selectedFileInfo = {
    name: fileName,
    sha1: res.sha1,
    from: `${I18n("label_last_modified_time")} ${formatDate(saveTime)}`,
  };
  const saveDraftRes = await ResourceService.saveResourceDraftData(resourceId, store.draftData);
  if (!saveDraftRes) return;

  data.saveType = 2;
  data.lastSaveTime = saveTime;
  data.edited = false;
};

/** 保存依赖 */
const saveDeps = async () => {
  const { draftData, resourceId } = store;
  ResourceService.saveResourceDraftData(resourceId, draftData);
};

/** 点击退出按钮 */
const clickExitBtn = async () => {
  if (data.edited) {
    data.exitPopupShow = true;
  } else {
    exit();
  }
};

/** 退出 */
const exit = async () => {
  if (!store.mainAppFuncs) return;

  clearTimeout(data.stopTimer);
  data.stopTimer = null;
  clearTimeout(data.inputTimer);
  data.inputTimer = null;
  store.mainAppFuncs.closeEditor();
};

/** 统计字数（以WPS规则为准） */
const countWords = (html: string) => {
  html = html
    .replace(/<br>/g, "\n")
    .replace(/<\/(p|div|td|li|pre|blockquote|h[1-6])>/g, "\n")
    .replace(/<[^>]*>/g, "");
  const ChineseWords = html.match(/[^\x00-\xff]/g);
  const ChineseWordsCount = ChineseWords?.length || 0;
  html = html.replace(/[^\x00-\xff]/g, " ");
  html = html.replace(/\s+/g, " ");
  const otherWordsCount = html.split(" ").filter((item) => !!item).length;
  data.wordsCount = ChineseWordsCount + otherWordsCount;
};

/** 识别内容 */
const identifyContent = async () => {
  const {
    markdown,
    dependencesInContent,
    resourceData,
    draftData: { directDependencies, baseUpcastResources },
  } = store;
  const dependencesByIdentify = getDependencesByContent(markdown);
  const deleteDeps: string[] = [];
  dependencesInContent.forEach((old) => {
    const isExist = dependencesByIdentify.includes(old);
    if (!isExist) deleteDeps.push(old);
  });
  if (deleteDeps.length) {
    const deps: any[] = [];
    const resources = await getResourceDataBatch(deleteDeps);
    directDependencies.forEach((dep) => {
      const deleted = deleteDeps.includes(dep.name);
      if (!deleted) deps.push(dep);
    });
    store.draftData.directDependencies = deps;
    if (resourceData.status === 0) {
      // 未发行状态下，需要删掉对应的基础上抛
      const upcasts: any[] = [];
      const deleteUpcasts: string[] = [];
      resources.forEach((item: any) => {
        deleteUpcasts.push(item.resourceId);
        item.baseUpcastResources.forEach((upcast: any) => {
          if (!deleteUpcasts.includes(upcast.resourceId)) deleteUpcasts.push(upcast.resourceId);
        });
      });
      baseUpcastResources.forEach((upcast) => {
        const deleted = deleteUpcasts.includes(upcast.resourceID);
        if (!deleted) upcasts.push(upcast);
      });
      store.draftData.baseUpcastResources = upcasts;
    }
    saveDeps();
  }

  store.dependencesInContent = dependencesByIdentify;
};

/** 批量获取资源数据 */
const getResourceDataBatch = async (names: string[]) => {
  if (names.length === 0) return [];

  const params: any = { resourceNames: names.join(), isLoadPolicyInfo: 1, isTranslate: 1 };
  const res = await ResourceService.getResourceDataBatch(params);
  if (!res) return [];

  return res;
};

initFuncs();

watch(
  () => data.html,
  (cur) => {

    if (store.appMode === 'preview') return;
    
    countWords(cur);

    const newMarkdown = html2md(cur);
    if (store.markdown !== newMarkdown) {
      store.markdown = newMarkdown;
      identifyContent();
      if (data.disabled) return;

      data.edited = true;
      if (!data.inputTimer) {
        data.inputTimer = setTimeout(() => {
          save();
          data.inputTimer = null;
        }, 15000);
      }
      if (data.stopTimer) {
        clearTimeout(data.stopTimer);
        data.stopTimer = null;
      }
      data.stopTimer = setTimeout(() => {
        save();
        data.stopTimer = null;
        if (data.inputTimer) {
          clearTimeout(data.inputTimer);
          data.inputTimer = null;
        }
      }, 3000);
    }
  }
);

watch(
  () => data.edited,
  (cur) => {
    if (store.mainAppFuncs) store.mainAppFuncs.saveEditor(!cur);
  }
);
</script>

<style lang="scss" scoped>
.creator-tools-markdown-editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  position: relative;

  .close-preview {
    position: absolute;
    right: 25px;
    top: 10px;
    z-index: 1;

    span {
      color: #222;
      opacity: 0.4;
      cursor: pointer;
      font-size: 14px;

      &:hover {
        opacity: 0.8;
      }

    }
  }

  .header {
    width: 100%;
    height: 78px;
    padding: 0 40px;
    box-sizing: border-box;
    display: flex;
    align-items: center;

    .title {
      width: 168px;
      font-size: 16px;
      font-weight: 600;
      color: #222222;
      line-height: 22px;
    }

    .article-info {
      flex: 1;
      padding: 0 20px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.2);
      line-height: 18px;

      div {
        flex: 1;
        text-align: center;

        &:last-child {
          text-align: right;
        }
      }
    }

    .btns {
      width: 168px;
      display: flex;
      align-items: center;

      .save-btn {
        padding: 6px 15px;
        background: #2784ff;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
        line-height: 20px;
        cursor: pointer;

        &.disabled {
          opacity: 0.4;
          pointer-events: none;
        }

        &:hover {
          background: #529dff;
        }

        &:active {
          background: #2376e5;
        }
      }

      .exit-btn {
        padding: 6px 15px;
        background: #ededed;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 600;
        color: #666666;
        line-height: 20px;
        margin-left: 10px;
        cursor: pointer;

        &:hover {
          background: #f5f5f5;
        }

        &:active {
          background: #e6e6e6;
        }
      }
    }
  }

  .loader-box {
    position: fixed;
    left: 0;
    right: 0;
    top: 78px;
    bottom: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;

    .fake-toolbar {
      width: 100%;
      height: 54px;
      background: rgba(0, 0, 0, 0.02);
      display: flex;
      justify-content: center;

      .fake-toolbar-box {
        width: 1100px;
        padding: 0 5px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .item {
          width: 32px;
          height: 32px;
          background: rgba(0, 0, 0, 0.06);
          border-radius: 4px;

          &.large {
            width: 56px;
          }
        }

        .divider {
          width: 1px;
          height: 16px;
          background-color: rgba(0, 0, 0, 0.2);
          margin: 0 20px;
        }
      }
    }

    .mask {
      width: 100%;
      flex: 1;
      background-color: #fff;
    }

    .loader-tip {
      position: fixed;
      left: 50%;
      top: 50%;
      width: 360px;
      height: 200px;
      border-radius: 10px;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1;
      transform: translate(-50%, -50%);

      .freelog {
        font-size: 48px;
        color: #fff;
        animation: rotate 1s linear infinite;
      }

      .tip {
        font-size: 14px;
        color: #ffffff;
        line-height: 20px;
        margin-top: 30px;
      }
    }
  }

  :deep .editor-toolbar {
    width: 100%;
    height: 54px;
    background: rgba(0, 0, 0, 0.02);
    display: flex;
    justify-content: center;

    .w-e-toolbar {
      width: 1100px;
      height: 54px;
      box-sizing: border-box;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .w-e-bar-divider {
        background-color: rgba(0, 0, 0, 0.2);
        height: 16px;
        margin: 0 20px;
      }
    }
  }

  :deep .markdown-editor {
    width: 100%;

    &.preview {
      .w-e-text-container {
        height: 100vh;
      }
    }

    .w-e-text-placeholder {
      width: fit-content;
      top: 40px;
      left: calc((100% - 800px) / 2);
      font-size: 14px;
      color: rgba(0, 0, 0, 0.2);
      line-height: 20px;
      font-style: normal;
    }

    .w-e-text-container {
      height: calc(100vh - 78px - 54px);

      & [data-slate-editor] {
        padding: 40px calc((100% - 800px) / 2);
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        color: #222;
        line-height: 1.25;
        margin-top: 50px;
        margin-bottom: 20px;
        font-weight: bold;
      }

      h1 {
        font-size: 36px;
        margin-top: 0;
      }

      h2 {
        font-size: 32px;
      }

      h3 {
        font-size: 28px;
      }

      h4 {
        font-size: 22px;
      }

      h5 {
        font-size: 16px;
      }

      h6 {
        font-size: 13.6px;
        color: #6a737d;
      }

      hr {
        height: 4px;
        padding: 0;
        margin: 50px 0;
        background-color: #e1e4e8;
        border: 0;
      }

      p {
        font-weight: normal;
        word-break: break-word;
        line-height: 1.6;
        margin-top: 0;
        margin-bottom: 16px;
      }

      strong {
        font-weight: bold;
      }

      em {
        font-style: italic;
      }

      blockquote {
        color: #6a737d;
        border-left: 3px solid #dfe2e5 !important;
        background-color: #fafafa !important;
        padding: 4px 0 4px 16px !important;
        margin-bottom: 10px !important;

        p {
          margin: 4px 0;
        }
      }

      ol,
      ul {
        padding-left: 32px;
        padding-bottom: 16px;
        line-height: 1.7;
      }

      ol {
        list-style-type: decimal;
      }

      ul {
        list-style-type: disc;
      }

      pre {
        padding: 16px;
        overflow-x: auto;
        font-size: 14px;
        line-height: 1.45;
        background-color: #323232;
        border-radius: 3px;
        font-family: sans-serif;
        letter-spacing: 0.6px;

        & + pre {
          margin-top: 30px;
        }

        ::-webkit-scrollbar {
          height: 8px;
          border-radius: 8px;
          background-color: rgba(0, 0, 0, 0.2);
        }

        ::-webkit-scrollbar-thumb {
          height: 8px;
          border-radius: 8px;
          background-color: rgba(255, 255, 255, 0.3);

          &:hover {
            background-color: rgba(255, 255, 255, 0.2);
          }
        }

        code {
          background-color: transparent !important;
          color: #fff;
          padding: 0 !important;
          text-shadow: none !important;
        }
      }

      code {
        padding: 2px 8px;
        color: rgba(0, 0, 0, 0.8);
        background-color: #f7f7f9;
        border-radius: 3px;
        border: none !important;
      }

      a {
        color: #3eaf7c;
        font-weight: 500;
        text-decoration: none;
      }

      video {
        width: 100%;
      }

      table {
        // display: block;
        word-break: initial;
        // width: 100%;
        overflow: auto;
        // margin-bottom: 30px;

        tbody tr:nth-child(2n) {
          background-color: #f6f8fa;
        }

        tr {
          background-color: #fff;
          border-top: 1px solid #c6cbd1;

          th,
          td {
            padding: 10px 13px;
            border: 1px solid #dfe2e5 !important;
          }

          th {
            font-weight: bold;
          }
        }
      }

      // 代码块语言选择器
      .w-e-select-list {
        ul {
          padding: 0;
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
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .exit-confirm-popup {
    position: fixed;
    top: 20px;
    left: 50%;
    margin-left: -230px;
    width: 460px;
    background: #ffffff;
    border-radius: 6px;
    padding: 30px 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.2);
    z-index: 2;

    .content {
      width: 100%;
      font-size: 14px;
      color: #333;
    }

    .btns-box {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      margin-top: 30px;

      .btn {
        padding: 6px 15px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;

        & + .btn {
          margin-left: 10px;
        }
      }

      .sure-btn {
        color: #fff;
        background: #2784ff;

        &:hover {
          background: #529dff;
        }

        &:active {
          background: #2376e5;
        }
      }

      .cancle-btn {
        color: #666666;
        background: #ededed;

        &:hover {
          background: #f5f5f5;
        }

        &:active {
          background: #e6e6e6;
        }
      }
    }
  }
}
</style>
