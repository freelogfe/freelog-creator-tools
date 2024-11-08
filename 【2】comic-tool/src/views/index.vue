<template>
  <div class="creator-tools-comic-tool">
    <input
      class="comic-upload-btn"
      type="file"
      id="uploadLocalImg"
      :multiple="true"
      :accept="UPLOAD_LOCAL_ACCEPT"
      @change="selectLocalImg($event, 'upload')"
    />

    <input
      class="comic-upload-btn"
      type="file"
      id="cutImages"
      :multiple="true"
      :accept="CUT_IMG_ACCEPT"
      @change="selectLocalImg($event, 'cut')"
    />

    <div class="header" v-show="store.appMode === 'normal'">
      <div class="title">{{ I18n("cbformatter_title") }}</div>

      <div class="header-right">
        <div class="article-info">
          <span v-if="data.saveTipType === 1">{{ I18n("posteditor_state_saving") }}</span>
          <span v-else-if="data.saveTipType === 2">
            {{ I18n("posteditor_state_saved", { LastEditTime: formatDate(data.lastSaveTime) }) }}
          </span>
          <span v-else-if="data.saveTipType === 3">
            {{ I18n("posteditor_state_networkabnormal", { LastEditTime: formatDate(data.lastSaveTime) }) }}
          </span>
        </div>
        <div class="save-btn" :class="{ disabled: saveDisabled }" @click="save(false)">
          {{ I18n("btn_save_post") }}
        </div>
        <div class="exit-btn" @click="clickExitBtn()">{{ I18n("cbformatter_cancel_btn") }}</div>
      </div>
    </div>

    <div class="body" v-show="store.appMode === 'normal'">
      <div class="body-box">
        <div class="btns-bar">
          <div class="bar-left">
            <div class="primary-btn btn" @click="clickBtn('uploadLocalImg')">{{ I18n("cbformatter_add_btn") }}</div>
            <div class="text-btn btn" @click="store.importDrawerShow = true">
              <i class="freelog fl-icon-daoruwendang" />
              {{ I18n("cbformatter_import_btn") }}
            </div>
            <template v-if="store.comicMode === 1">
              <div class="text-btn btn" @click="clickBtn('cutImages')">
                <i class="freelog fl-icon-jiandao" />
                {{ I18n("cbformatter_batchslice_btn") }}
              </div>
              <div class="info-box">
                <i class="freelog fl-icon-tishixinxi info-icon" />
                <div class="info-popup">
                  <div class="img-box">
                    <img class="img" src="../assets/images/cut-desc.png" />
                    <div class="line"></div>
                    <img class="scissors" src="../assets/images/blue-scissors.png" />
                  </div>
                  <div class="desc">{{ I18n("cbformatter_slice_info") }}</div>
                </div>
              </div>
            </template>
          </div>
          <div class="primary-btn" :class="{ disabled: previewDisabled }" @click="store.previewShow = true">
            {{ I18n("cbformatter_preview_btn") }}
          </div>
        </div>

        <div class="img-area" @dragover.prevent @drop.prevent="dragLocalImg($event)">
          <div class="upload-box" v-if="store.imgList.length === 0">
            <i class="freelog fl-icon-shangchuanfengmian upload-icon"></i>
            <div class="upload-desc">{{ I18n("cbformatter_add_info") }}</div>
            <div class="upload-tip">{{ I18n("cbformatter_add_info02") }}</div>
          </div>
          <div class="img-box" v-else>
            <div class="img-header">
              <div class="box-header">
                <div class="total">{{ I18n("cbformatter_image_qty", { imageQty: totalCount }) }}</div>
                <div class="clear-btn" @click="openDeleteConfirm()">
                  <i class="freelog fl-icon-shanchu delete-icon" />
                  {{ I18n("cbformatter_delete_btn_deleteall") }}
                </div>
              </div>
            </div>
            <div class="box-body">
              <div id="sortableList" class="img-list">
                <ImgCard
                  :index="index"
                  :data="item"
                  :cut="cutSingleImage"
                  v-for="(item, index) in store.imgList"
                  :key="item.name + index"
                />
                <!-- :visible="index >= data.visibleIndex[0] && index < data.visibleIndex[1]" -->
              </div>
            </div>
          </div>
        </div>

        <div class="desc-area">
          <li>{{ I18n("cbformatter_note01") }}</li>
          <li>{{ I18n("cbformatter_note02") }}</li>
          <li>{{ I18n("cbformatter_note03") }}</li>
        </div>
      </div>
    </div>

    <!-- 弹窗底层遮罩 -->
    <transition name="fade-in">
      <div
        class="modal"
        :class="{ transparent: store.loaderShow || data.exitPopupShow }"
        v-if="
          store.loaderShow ||
          data.cuttingLoaderShow ||
          data.saveLoaderShow ||
          store.deleteConfirmShow ||
          data.exitPopupShow
        "
      />
    </transition>

    <!-- 加载弹窗 -->
    <transition name="fade-in-scale">
      <div class="popup-wrapper" v-if="store.loaderShow">
        <div class="loader-box">
          <i class="freelog fl-icon-loading loader-icon" />
        </div>
      </div>
    </transition>

    <!-- 切图等待弹窗 -->
    <transition name="fade-in-scale">
      <div class="popup-wrapper" v-if="data.cuttingLoaderShow">
        <div class="cutting-loader-box">
          <div class="title">{{ I18n("cbformatter_slice_state_slicing") }}</div>
          <div class="line-box">
            <img class="scissors" src=../assets/images/black-scissors.png />
            <div class="line" />
          </div>
          <div class="desc">{{ I18n("cbformatter_slice_state_slicing_msg") }}</div>
        </div>
      </div>
    </transition>

    <!-- 保存进度弹窗 -->
    <transition name="fade-in-scale">
      <div class="popup-wrapper" v-if="data.saveLoaderShow">
        <div class="save-loader-box">
          <div class="title">{{ I18n("cbformatter_submit_state_processing") }}</div>
          <div class="progress-box">
            <div class="progress-bar" :style="{ width: data.saveProgress + '%' }" />
          </div>
          <div class="desc">
            <span>
              {{
                I18n(
                  `cbformatter_submit_state_processing_msg${
                    [2, 3, 4].includes(data.saveStep) ? "0" + data.saveStep : ""
                  }`
                )
              }}
            </span>
            <span class="desc-progress">[{{ data.saveStep }}/4]</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- 删除确认弹窗 -->
    <transition name="fade-in-scale">
      <div class="popup-wrapper" @click="store.deleteConfirmShow = false" v-if="store.deleteConfirmShow">
        <div class="delete-confirm-box" @click.stop>
          <div class="confirm-header">
            <div class="title">
              <span v-if="store.deleteItem">{{ I18n("cbformatter_delete_confirmation_title") }}</span>
              <span v-else>{{ I18n("cbformatter_deleteall_confirmation_title") }}</span>
            </div>
            <i class="freelog fl-icon-guanbi" @click="store.deleteConfirmShow = false" />
          </div>
          <div class="desc">
            <span v-if="store.deleteItem">
              {{ I18n("cbformatter_delete_confirmation_msg", { FileName: store.deleteItem.name }) }}
            </span>
            <span v-else>{{ I18n("cbformatter_deleteall_confirmation_msg") }}</span>
          </div>
          <div class="btns-box">
            <div class="btn text-btn" @click="store.deleteConfirmShow = false">
              {{ I18n("cbformatter_delete_confirmation_btn_cancel") }}
            </div>
            <div class="btn delete-btn" @click="deleteImages()">
              <span v-if="store.deleteItem">{{ I18n("cbformatter_delete_confirmation_btn_delete") }}</span>
              <span v-else>{{ I18n("cbformatter_deleteall_confirmation_btn_deleteall") }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

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

    <!-- 保存失败提示 -->
    <transition name="fade-in">
      <div class="save-fail-tip" v-if="data.saveFailTipShow">
        <div class="tip-title">{{ I18n("cbformatter_submit_err_removewrongpage") }}</div>
        <div class="tip-desc">{{ I18n("cbformatter_submit_err_removewrongpage_msg") }}</div>
      </div>
    </transition>

    <ImportDrawer />

    <CutDrawer />

    <PreviewBox />
  </div>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { ResourceService, StorageService } from "@/api/request";
import { useStore } from "@/store";
import { ImgInComicTool, ImgInOutput } from "@/typings/object";
import {
  MAX_IMG_LENGTH,
  MAX_IMG_SIZE,
  UPLOAD_LOCAL_ACCEPT,
  CUT_IMG_ACCEPT,
  MAX_CUT_IMG_LENGTH,
  MAX_HEIGHT_PER_PIECE,
  MAX_REQUEST_BATCH_COUNT,
} from "@/utils/assets";
import {
  base64ToFile,
  formatDate,
  getFileResult,
  getImage,
  getSizeByBase64,
  json2Xml,
  separateFileName,
} from "@/utils/common";
import { computed, nextTick, onBeforeMount, onBeforeUnmount, reactive, watch } from "vue";
import Sortable, { SortableEvent } from "sortablejs";
import { uncompressComicArchive } from "../core/import-comic";
import { ElMessage } from "element-plus";
import ImgCard from "@/components/img-card.vue";
import { comicModeMappings } from "@/assets/data";
import CutDrawer from "@/components/cut-drawer.vue";
import PreviewBox from "@/components/preview-box.vue";
import ImportDrawer from "@/components/import-drawer.vue";

const store = useStore();

/** 切图画布 */
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

const data = reactive({
  // comicName: "",
  saveTipType: 0,
  saveStep: 0,
  saveProgress: 0,
  lastSaveTime: 0,
  visibleIndex: [0, 0],
  cuttingLoaderShow: false,
  saveLoaderShow: false,
  saveFailTipShow: false,
  exitPopupShow: false,
  stopTimer: null as any,
  sorter: null as any,
  saveProgressList: [] as number[],
  saveTotalList: [] as number[],
  sortableList: null as any,
});

/** 禁止保存 */
const saveDisabled = computed(() => {
  return !store.edited || data.saveTipType === 1;
});

/** 预览失效 */
const previewDisabled = computed(() => {
  return store.imgList.filter((item) => item.size <= MAX_IMG_SIZE).length === 0;
});

/** 有效的图片总数量 */
const totalCount = computed(() => {
  let total = 0;
  store.imgList.forEach((item) => {
    const { children, size } = item;
    if (size > MAX_IMG_SIZE) return;

    total += children ? children.length : 1;
  });
  return total;
});

onBeforeMount(() => {
  window.addEventListener("keydown", keydown);
  window.addEventListener("beforeunload", (e) => {
    if (store.edited) e.returnValue = "";
  });
  if (store.appMode === "normal") {
    getData();
  } else {
    getResourceOnly()
  }
});

onBeforeUnmount(() => {
  restoreToolState();
});

/** 只获取资源相关数据 */
const getResourceOnly = async () => {
  store.loaderShow = true;

  const { resourceId, appMode, version } = store;
  
  const [resourceData, resourceVersionsInfo, resourceBlob] = await Promise.all([
    ResourceService.getResourceData(resourceId),
    ResourceService.getResourceVersions(resourceId),
    ResourceService.getResourceFile(resourceId, version, { responseType: "blob" })
  ]);
  console.log(resourceData, resourceVersionsInfo, resourceBlob);
  
  if (!resourceData || !resourceBlob) return;

  store.resourceData = resourceData;
  store.draftData = {}

  const { resourceType } = resourceData;

  store.comicMode = comicModeMappings[resourceType[2]] || 1;

  store.edited = false;

  store.loaderShow = false;
  
  const fileName = resourceVersionsInfo.find(ele => ele.version === version)?.filename;
  const file = new File([resourceBlob], fileName + ".zip", { type: "application/zip" });

  store.autoScroll = true;
  uncompressComicArchive(file, 1);
}

/** 获取资源与草稿数据 */
const getData = async () => {
  store.loaderShow = true;

  const { resourceId, appMode } = store;
  const [resourceData, resourceDraft] = await Promise.all([
    ResourceService.getResourceData(resourceId),
    ResourceService.getResourceDraftData(resourceId),
  ]);

  if (!resourceData || !resourceDraft) return;

  store.resourceData = resourceData;
  store.draftData = resourceDraft.draftData;

  const { resourceType } = resourceData;
  const { selectedFileInfo } = resourceDraft.draftData;

  store.comicMode = comicModeMappings[resourceType[2]] || 1;

  if (!selectedFileInfo) {
    store.edited = false;
    store.loaderShow = false;
    return;
  }

  const { name, sha1 } = selectedFileInfo;
  // data.comicName = name;
  const res = await StorageService.getStorageFile(sha1, { responseType: "blob" });
  
  store.autoScroll = true;
  const file = new File([res], name);
  uncompressComicArchive(file, 1);
};

/** 点击退出按钮 */
const clickExitBtn = async () => {
  if (store.edited) {
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
  store.mainAppFuncs.close();
};

/** 快捷键 */
const keydown = (e: KeyboardEvent) => {
  // ctrl+s 组件键，执行保存
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    // 阻止网页默认保存事件
    e.preventDefault();
    if (!saveDisabled.value) save(false);
  }

  // esc 键，关闭预览
  if (e.key === "Escape") store.previewShow = false;
};

/** 点击按钮 */
const clickBtn = (id: string) => {
  document.getElementById(id)?.click();
};

/** 打开确认删除弹窗 */
const openDeleteConfirm = () => {
  store.deleteItem = null;
  store.deleteConfirmShow = true;
};

/** 删除图片 */
const deleteImages = () => {
  store.autoScroll = false;
  if (store.deleteItem) {
    store.imgList.splice(store.deleteItem.index, 1);
    store.deleteItem = null;
  } else {
    store.imgList = [];
  }
  store.deleteConfirmShow = false;
};

/** 初始化图片区域 */
const initImageArea = () => {
  data.sortableList = document.getElementById("sortableList");
  if (!data.sortableList) return;

  // 监听滚动，实时计算图片显示/隐藏
  data.sortableList.addEventListener("scroll", () => {
    const { clientWidth, scrollTop } = data.sortableList;
    const lineNum = Math.floor(scrollTop / 318);
    const countPerLine = clientWidth === 1128 ? 5 : 6;
    const startIndex = countPerLine * (lineNum === 0 ? 0 : lineNum - 1);
    const endIndex = countPerLine * (lineNum + 3);
    if (startIndex !== data.visibleIndex[0] || endIndex !== data.visibleIndex[1]) {
      data.visibleIndex = [startIndex, endIndex];
    }
  });

  const { clientWidth, clientHeight, scrollHeight } = data.sortableList;
  if (clientHeight === scrollHeight) {
    // 没有滚动条时，显示前三行
    const countPerLine = clientWidth === 1128 ? 5 : 6;
    const startIndex = 0;
    const endIndex = countPerLine * 3;
    if (startIndex !== data.visibleIndex[0] || endIndex !== data.visibleIndex[1]) {
      data.visibleIndex = [startIndex, endIndex];
    }
  }

  initSorter();
};

/** 初始化拖动列表 */
const initSorter = () => {
  if (data.sorter || !data.sortableList) return;

  data.sorter = new Sortable(data.sortableList, {
    animation: 150,
    handle: ".drag-handle,.drag-tip",
    forceFallback: true,
    scrollSensitivity: 100,
    scrollSpeed: 50,
    onStart() {
      store.dragging = true;
    },
    onEnd(e: SortableEvent) {
      store.autoScroll = false;
      store.dragging = false;
      const { oldIndex, newIndex } = e;
      const items = store.imgList.splice(oldIndex!, 1);
      store.imgList.splice(newIndex!, 0, ...items);
    },
  });
};

/** 选择本地图片 */
const selectLocalImg = (e: any, type: "upload" | "cut") => {
  const { files } = e.target;
  if (type === "upload") {
    uploadLocalImg(files);
  } else if (type === "cut") {
    cutImages(files);
  }
  e.target.value = "";
};

/** 拖动本地图片 */
const dragLocalImg = (e: any) => {
  const { files } = e.dataTransfer;
  uploadLocalImg(files);
};

/** 上传本地图片 */
const uploadLocalImg = async (files: FileList) => {
  const list = [...files].filter((file) => ["image/png", "image/jpeg", "image/gif"].includes(file.type));

  if (list.length !== files.length) ElMessage.error(I18n("cbformatter_add_error_format"));

  if (totalCount.value + list.length > MAX_IMG_LENGTH) {
    ElMessage.error(I18n("cbformatter_add_error_qtylimitation"));
    list.splice(MAX_IMG_LENGTH - totalCount.value);
  }

  if (list.length === 0) {
    store.insertIndex = -1;
    return;
  }

  store.loaderShow = true;

  const imgs: ImgInComicTool[] = [];
  for (let i = 0; i < list.length; i++) {
    const file = list[i];
    const { name, size } = file;
    if (size > MAX_IMG_SIZE) {
      // 超过限定尺寸
      const img = { name, size, base64: "", width: 0, height: 0 };
      imgs.push(img);
    } else {
      // 正常情况
      const base64 = await getFileResult(file);
      const image = await getImage(base64);
      const { width, height } = image;
      const img = { name, size, base64, width, height };
      imgs.push(img);
    }

    if (i === list.length - 1) {
      // 全部整理完成
      const insertPoint = store.insertIndex !== -1 ? store.insertIndex : store.imgList.length;
      store.autoScroll = store.insertIndex === -1;
      store.imgList.splice(insertPoint, 0, ...imgs.filter((item) => item));
      store.loaderShow = false;
      store.insertIndex = -1;
    }
  }
};

/** 停止切图 */
const stopCutting = () => {
  canvas = null;
  ctx = null;
  data.cuttingLoaderShow = false;
};

/** 新增切图图片 */
const addCutImage = (newImage: ImgInComicTool) => {
  if (newImage.children) {
    // 切图
    const { length } = newImage.children;
    const restCount = MAX_IMG_LENGTH - totalCount.value;
    if (length > restCount) {
      newImage.children = newImage.children.slice(0, restCount);
      ElMessage.error(I18n("cbformatter_add_error_qtylimitation"));
    }
  }

  store.imgList.push(newImage);
};

/** 已有单独图片切图 */
const cutSingleImage = async (item: ImgInComicTool) => {
  if (totalCount.value === MAX_IMG_LENGTH) {
    // 数量已达到最大图片总数量
    return ElMessage.error(I18n("cbformatter_add_error_qtylimitation"));
  }

  const { name, base64, width, height } = item;
  if (height <= MAX_HEIGHT_PER_PIECE) {
    // 原图高度小于规定最小高度，不予切图
    data.cuttingLoaderShow = false;
    return ElMessage.error(I18n("cbformatter_slice_error_height"));
  }

  data.cuttingLoaderShow = true;
  store.autoScroll = false;
  // 图片信息
  const image = await getImage(base64);
  // 切图张数
  const pieceNum = Math.ceil(height / MAX_HEIGHT_PER_PIECE);
  // 每张切图的高度（根据张数平分）
  const heightPerPiece = height / pieceNum;
  // 切图画布
  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");
  if (!canvas || !ctx) return;

  canvas.width = width;
  canvas.height = heightPerPiece;
  item.children = [];

  const restCount = MAX_IMG_LENGTH - totalCount.value + 1;
  for (let i = 0; i < pieceNum; i++) {
    // 超过剩余图片数量时，不再继续切图
    if (i > restCount) {
      ElMessage.error(I18n("cbformatter_add_error_qtylimitation"));
      break;
    }

    ctx.drawImage(image, 0, heightPerPiece * i, width, heightPerPiece, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const childSize = getSizeByBase64(base64);
    if (childSize > MAX_IMG_SIZE) {
      // 尺寸大于单张最大尺寸
      item.base64 = "";
      item.children = [];
      data.cuttingLoaderShow = false;
      break;
    }

    // 切图组显示第一张切图
    if (i === 0) {
      item.base64 = base64;
      item.size = 0;
    }

    const [filename, suffix] = separateFileName(name);
    const childName = `${filename}-${String(i + 1).padStart(2, "0")}.${suffix}`;
    const childImg = { name: childName, base64, size: childSize, width, height: heightPerPiece };
    item.children.push(childImg);
  }

  stopCutting();
};

/** 批量切图 */
const cutImages = async (files: FileList) => {
  if (files.length > MAX_CUT_IMG_LENGTH) {
    // 切图数量超过最大同时切图数量
    return ElMessage.error(I18n("cbformatter_slice_error_qtylimitation"));
  }

  if (totalCount.value === MAX_IMG_LENGTH) {
    // 数量已达到最大图片总数量
    return ElMessage.error(I18n("cbformatter_add_error_qtylimitation"));
  }

  data.cuttingLoaderShow = true;
  store.autoScroll = true;
  const list = [...files];
  // 是否需要显示格式错误提示（控制在最多一个提示）
  let typeTip = true;
  // 是否需要显示切图高度小于最小指定切图高度提示（控制在最多一个提示）
  let heightTip = true;
  // 切图画布
  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");

  for (let i = 0; i < list.length; i++) {
    // 目前已经达到最大图片数量限制，之后的图片不再处理
    if (totalCount.value === MAX_IMG_LENGTH) break;

    const file = list[i];
    const { type, name, size } = file;
    if (!["image/png", "image/jpeg"].includes(type)) {
      // 切图类型非指定类型
      if (typeTip) {
        ElMessage.error(I18n("cbformatter_slice_error_format"));
        typeTip = false;
      }
      continue;
    }

    const base64 = await getFileResult(file);
    // 图片信息
    const image = await getImage(base64);
    const { width, height } = image;
    if (height <= MAX_HEIGHT_PER_PIECE) {
      // 原图高度小于规定最小高度，不予切图直接按添加图片处理
      const noCutImage = { name, size, base64, width, height };
      addCutImage(noCutImage);
      if (heightTip) {
        ElMessage.error(I18n("cbformatter_slice_error_height"));
        heightTip = false;
      }
      continue;
    }

    const imgItem: ImgInComicTool = { name, base64: "", size: 0, children: [], width: 0, height: 0 };
    // 切图张数
    const pieceNum = Math.ceil(height / MAX_HEIGHT_PER_PIECE);
    // 每张切图的高度（根据张数平分）
    const heightPerPiece = height / pieceNum;
    if (!canvas || !ctx) continue;

    canvas.width = width;
    canvas.height = heightPerPiece;

    const restCount = MAX_IMG_LENGTH - totalCount.value + 1;
    for (let j = 0; j < pieceNum; j++) {
      // 超过剩余图片数量时，不再继续切图
      if (i > restCount) {
        ElMessage.error(I18n("cbformatter_add_error_qtylimitation"));
        break;
      }

      ctx.drawImage(image, 0, heightPerPiece * j, width, heightPerPiece, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL(type);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const childSize = getSizeByBase64(base64);
      if (childSize > MAX_IMG_SIZE) {
        // 尺寸大于单张最大尺寸
        imgItem.size = size;
        addCutImage(imgItem);
        break;
      }

      // 切图组显示第一张切图
      if (j === 0) imgItem.base64 = base64;

      const [filename, suffix] = separateFileName(name);
      const childName = `${filename}-${String(j + 1).padStart(2, "0")}.${suffix}`;
      const childImg = { name: childName, base64, size: childSize, width, height: heightPerPiece };
      imgItem.children!.push(childImg);
    }
    addCutImage(imgItem);
  }

  stopCutting();
};

/** 保存 */
const save = async (auto: boolean) => {
  // 预览模式下不可保存
  if (store.appMode === 'preview') {
    return
  }

  // 是否保存失败
  let saveFail = false;

  saveFail = readyToSave(auto);
  if (saveFail) return;

  // 图片列表（用于保存）
  const list: ImgInOutput[] = [];
  // 图片列表（用于工具）
  const listInTool: any[] = [];
  // 图片名称与 sha1 映射集
  const sha1Mapping: any = {};

  /** 上传文件 */
  const uploadFilesRes = await uploadFilesOfSave(auto);
  saveFail = uploadFilesRes.saveFail;
  if (saveFail) return;

  /** 上传图片完成，整理数据 */
  const { imgResArr } = uploadFilesRes;
  dealDataOfSave({ auto, imgResArr, list, listInTool, sha1Mapping });

  /** 整理上传 json 和 xml */
  const uploadConfigFilesRes = await uploadConfigFilesOfSave({ auto, list, listInTool });
  saveFail = uploadConfigFilesRes.saveFail;
  if (saveFail) return;

  /** 打包漫画文件 */
  const { configFilesResArr } = uploadConfigFilesRes;
  const packageFilesRes = await packageFilesOfSave({ auto, configFilesResArr, list, sha1Mapping });
  saveFail = packageFilesRes.saveFail;

  /** 保存资源文件草稿 */
  const { packageRes } = packageFilesRes;
  await saveDraftsOfSave({ auto, packageRes });
};

/** 保存前的准备 */
const readyToSave = (auto: boolean) => {
  if (!store.resourceData || !store.draftData) return true;

  const existInvalidImage = store.imgList.some((item) => item.size > MAX_IMG_SIZE);
  if (existInvalidImage) {
    // 存在无效图片
    if (!data.saveFailTipShow && !auto) {
      data.saveFailTipShow = true;
      setTimeout(() => {
        data.saveFailTipShow = false;
      }, 2000);
    }
    return true;
  }

  if (data.stopTimer) {
    clearTimeout(data.stopTimer);
    data.stopTimer = null;
  }

  if (!auto) {
    data.saveLoaderShow = true;
    data.saveProgress = 0;
    data.saveStep = 1;
    data.saveProgressList = [];
    data.saveTotalList = [];
  }

  data.saveTipType = 1;

  return false;
};

/** 保存第一步：上传图片 */
const uploadFilesOfSave = async (auto: boolean) => {
  // 图片列表表单数据（用于上传提交）
  const formDataList: FormData[] = [];
  // 当前图片序号
  let currentIndex = 0;

  store.imgList.forEach((img, index) => {
    const { name, base64, children, sha1 } = img;
    if (!children && sha1) return;

    const [, suffix] = separateFileName(name);
    const newImgName = `${String(index + 1).padStart(3, "0")}.${suffix}`;
    if (!children) {
      // 非切图
      const formDataIndex = Math.floor(currentIndex / MAX_REQUEST_BATCH_COUNT);
      if (!formDataList[formDataIndex]) formDataList[formDataIndex] = new FormData();
      const file = base64ToFile(base64, newImgName);
      formDataList[formDataIndex].append("files", file);
      currentIndex++;
    } else {
      // 切图
      children.forEach((child, i) => {
        if (child.sha1) return;

        const formDataIndex = Math.floor(currentIndex / MAX_REQUEST_BATCH_COUNT);
        if (!formDataList[formDataIndex]) formDataList[formDataIndex] = new FormData();
        const { base64 } = child;
        const newName = String(i + 1).padStart(2, "0");
        const newChildName = newImgName.replace(`.${suffix}`, `_${newName}.${suffix}`);
        const file = base64ToFile(base64, newChildName);
        formDataList[formDataIndex].append("files", file);
        currentIndex++;
      });
    }
  });

  const requestArr: Promise<any>[] = [];
  formDataList.forEach((item, index) => {
    requestArr.push(uploadFiles(item, index, 0));
  });
  const res = await Promise.all(requestArr);
  const err = res.some((item) => !item);
  if (err) {
    if (!auto) {
      ElMessage.error(I18n("createversion_state_networkabnormal2"));
      data.saveTipType = 3;
      data.saveLoaderShow = false;
    }
    return { saveFail: true, imgResArr: [] };
  }

  return { saveFail: false, imgResArr: res.flat() };
};

/** 整理上传的配置文件数据 */
const dealDataOfSave = (params: {
  auto: boolean;
  imgResArr: any[];
  list: ImgInOutput[];
  listInTool: any[];
  sha1Mapping: any;
}) => {
  const { auto, imgResArr, list, listInTool, sha1Mapping } = params;

  store.imgList.forEach((img, index) => {
    const { name, size, children, sha1, width, height } = img;
    const [, suffix] = separateFileName(name);
    const newImgName = `${String(index + 1).padStart(3, "0")}.${suffix}`;
    if (children) {
      // 切图，处理子集
      const imgInTool: any = { name, children: [] };
      children.forEach((child, i) => {
        const { name, size, sha1, width, height } = child;
        const newName = String(i + 1).padStart(2, "0");
        const newChildName = newImgName.replace(`.${suffix}`, `_${newName}.${suffix}`);
        let theSha1 = sha1;
        if (!theSha1) {
          const res = imgResArr.find((res) => res.filename === newChildName);
          theSha1 = res.sha1;
          child.sha1 = res.sha1;
        }
        const childItem = { name: newChildName, size, width, height };
        const childInTool = { name, sha1: theSha1, size, width, height };
        sha1Mapping[newChildName] = theSha1;
        list.push(childItem);
        imgInTool.children.push(childInTool);
      });
      listInTool.push(imgInTool);
    } else {
      // 非切图，处理自身
      let theSha1 = sha1;
      if (!theSha1) {
        // 未上传过的图片，结合上传后得到的数据进行整理
        const res = imgResArr.find((res) => res.filename === newImgName);
        theSha1 = res.sha1;
      }
      const imgInList = { name: newImgName, size, width, height };
      const imgInTool = { name, size, width, height, sha1: theSha1 };
      sha1Mapping[newImgName] = theSha1;
      list.push(imgInList);
      listInTool.push(imgInTool);
    }
  });

  if (!auto) {
    data.saveStep = 2;
    data.saveProgressList = [];
    data.saveTotalList = [];
  }
};

/** 保存第二步：上传配置文件 */
const uploadConfigFilesOfSave = async (params: { auto: boolean; list: ImgInOutput[]; listInTool: any[] }) => {
  const { auto, list, listInTool } = params;

  const jsonFormData = new FormData();
  const json = { mode: store.comicMode, list, config: store.comicConfig, custom: { list: listInTool } };
  const jsonFile = new File([JSON.stringify(json)], "index.json", { type: "application/json" });
  jsonFormData.append("files", jsonFile);
  if (store.comicConfig) {
    const xml = json2Xml(store.comicConfig);
    const xmlFile = new File([xml], "ComicInfo.xml", { type: "text/xml" });
    jsonFormData.append("files", xmlFile);
  }

  const res = await uploadFiles(jsonFormData, 0, 25);
  if (!res) {
    if (!auto) {
      ElMessage.error(I18n("createversion_state_networkabnormal2"));
      data.saveTipType = 3;
      data.saveLoaderShow = false;
    }
    return { saveFail: false, configFilesResArr: [] };
  }

  if (!auto) data.saveStep = 3;

  return { saveFail: false, configFilesResArr: res };
};

/** 保存第三步：打包文件 */
const packageFilesOfSave = async (params: {
  auto: boolean;
  configFilesResArr: any[];
  list: ImgInOutput[];
  sha1Mapping: any;
}) => {
  const { auto, configFilesResArr, list, sha1Mapping } = params;

  const sha1Array: { fileName: string; sha1: string }[] = [];
  configFilesResArr.forEach((item: { filename: string; sha1: string }) => {
    const { filename, sha1 } = item;
    sha1Array.push({ fileName: filename, sha1 });
  });
  list.forEach((item) => {
    const { name } = item;
    const sha1Item = { fileName: name, sha1: sha1Mapping[name] };
    sha1Array.push(sha1Item);
  });
  const res = await compressFiles(sha1Array);
  if (!res) {
    if (!auto) {
      ElMessage.error(I18n("createversion_state_networkabnormal2"));
      data.saveTipType = 3;
      data.saveLoaderShow = false;
    }
    return { saveFail: true, packageRes: {} };
  }

  if (!auto) data.saveStep = 4;

  return { saveFail: false, packageRes: res };
};

/** 保存第四步：保存资源草稿 */
const saveDraftsOfSave = async (params: { auto: boolean; packageRes: any }) => {
  const { auto, packageRes } = params;

  // 保存时间
  const saveTime = Date.now();
  // 文件名称命名规则为 {资源名称+最后保存时间}
  const name = store.resourceData.resourceName.split("/")[1] + formatDate(saveTime, "YYYYMMDDhhmm").substring(2);

  store.draftData.selectedFileInfo = { name, sha1: packageRes.sha1, from: `最近编辑时间 ${formatDate(saveTime)}` };
  if (store.comicConfig) {
    const attrs = await settleAttrs();
    const { additionalProperties } = store.draftData;
    attrs.forEach((item) => {
      const index = additionalProperties.findIndex((prop: { key: string; value: string }) => prop.key === item.key);
      if (index === -1) {
        // 不存在此属性
        store.draftData.additionalProperties.push(item);
      } else {
        store.draftData.additionalProperties[index].value = item.value;
      }
    });
  }

  const res = await saveDrafts(store.resourceId, store.draftData);
  if (!res) {
    if (!auto) {
      ElMessage.error(I18n("createversion_state_networkabnormal2"));
      data.saveTipType = 3;
      data.saveLoaderShow = false;
    }
    return;
  }

  if (!auto) {
    setTimeout(() => {
      data.saveLoaderShow = false;
    }, 100);
  }
  data.saveTipType = 2;
  data.lastSaveTime = saveTime;
  store.edited = false;
};

/** 资源标准属性处理 */
const settleAttrs = async () => {
  const attrs: { key: string; value: string }[] = [];
  const { resourceTypeCode } = store.resourceData!;
  const res = await ResourceService.getAttrsByCode({ code: resourceTypeCode });
  const configs = store.comicConfig.children[0].children;
  res.forEach((item: { key: string }) => {
    const { key } = item;
    const index = configs.findIndex((config: any) => config.key === key);
    if (index !== -1) {
      // 配置没有这个属性
      const attr = { key, value: configs[index].value };
      attrs.push(attr);
    }
  });
  return attrs;
};

/** 批量上传文件 */
const uploadFiles = (formData: FormData, index: number, doneProgress: number) => {
  return StorageService.uploadStorageFileBatch(formData, {
    onUploadProgress: (progressEvent) => {
      const { loaded, total } = progressEvent;
      let loadedCount = 0;
      let totalCount = 0;
      data.saveProgressList[index] = loaded;
      data.saveTotalList[index] = total;
      for (let i = 0; i < data.saveProgressList.length; i++) {
        loadedCount += data.saveProgressList[i] || 0;
        totalCount += data.saveTotalList[i] || 0;
      }
      const progress = Math.floor((loadedCount / totalCount) * 25);
      data.saveProgress = doneProgress + progress;
    },
  });
};

/** 打包漫画文件 */
const compressFiles = (sha1Array: { fileName: string; sha1: string }[]) => {
  return StorageService.compressFiles(sha1Array, {
    onUploadProgress: (progressEvent) => {
      const { loaded, total } = progressEvent;
      const doneProgress = 50;
      const progress = Math.floor((loaded / total) * 25);
      data.saveProgress = doneProgress + progress;
    },
  });
};

/** 保存资源草稿 */
const saveDrafts = (resourceId: string, draftData: any) => {
  return ResourceService.saveResourceDraftData(resourceId, draftData, {
    onUploadProgress: (progressEvent) => {
      const { loaded, total } = progressEvent;
      const doneProgress = 75;
      const progress = Math.floor((loaded / total) * 25);
      data.saveProgress = doneProgress + progress;
    },
  });
};

/** 还原工具状态 */
const restoreToolState = () => {
  // 清除自动保存定时器
  if (data.stopTimer) {
    clearTimeout(data.stopTimer);
    data.stopTimer = null;
  }

  // 清除按键监听
  window.removeEventListener("keydown", keydown);

  // // 初始化状态
  // store.resourceData = {} as any;
  // store.draftData = {} as any;
  // store.deleteItem = null;
  // data.stopTimer = null;
  // data.sorter = null;
  // data.saveProgressList = [];
  // data.saveTotalList = [];
  // data.sortableList = null;
  // store.edited = null;
  // data.saveTipType = 0;
  // data.saveStep = 0;
  // data.saveProgress = 0;
  // data.lastSaveTime = 0;
  // // data.comicName = "";
  // store.comicMode = 0;
  // store.comicConfig = null;
  // store.imgList = [];
  // store.insertIndex = -1;
  // store.dragging = false;
  // store.autoScroll = false;
  // data.visibleIndex = [0, 0];
  // store.importDrawerShow = false;
  // store.previewShow = false;
  // store.deleteConfirmShow = false;
  // store.loaderShow = false;
  // data.cuttingLoaderShow = false;
  // data.saveLoaderShow = false;
  // data.saveFailTipShow = false;
};

watch(
  () => store.imgList,
  (cur) => {
    if (store.edited !== null) {
      store.edited = true;
      if (data.stopTimer) {
        clearTimeout(data.stopTimer);
        data.stopTimer = null;
      }
      data.stopTimer = setTimeout(() => {
        // 15 秒自动保存
        save(true);
        data.stopTimer = null;
      }, 15000);
    }

    if (cur.length === 0) {
      data.sortableList = null;
      data.sorter = null;
    } else {
      nextTick(() => {
        if (!data.sortableList) initImageArea();

        if (store.autoScroll) {
          // 开启自动滚动时，自动滚动到尾部
          data.sortableList?.scrollTo({
            top: data.sortableList.scrollHeight,
          });
        }

        if (store.appMode === 'preview' && store.imgList[0]?.base64) {
          console.log("store.imgList", store.imgList);
          store.previewShow = true
        }

      });
    }
  },
  { deep: true }
);

watch(
  () => store.loaderShow,
  (cur) => {
    if (cur && data.stopTimer) {
      clearTimeout(data.stopTimer);
      data.stopTimer = null;
    }
  }
);

watch(
  () => data.cuttingLoaderShow,
  (cur) => {
    if (cur && data.stopTimer) {
      clearTimeout(data.stopTimer);
      data.stopTimer = null;
    }
  }
);

watch(
  () => store.edited,
  (cur) => {
    if (store.mainAppFuncs) store.mainAppFuncs.save(!cur);
  }
);
</script>

<style lang="scss" scoped>
.comic-upload-btn {
  display: none;
}

.creator-tools-comic-tool {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;

  .header {
    width: 100%;
    height: 78px;
    padding: 0 40px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;

    .title {
      font-size: 16px;
      font-weight: 600;
      color: #222222;
      line-height: 22px;
    }

    .header-right {
      display: flex;
      align-items: center;

      .article-info {
        font-size: 14px;
        color: #000000;
        opacity: 0.2;
        line-height: 20px;
        margin-right: 10px;
      }

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

  .body {
    width: 100%;
    flex: 1;
    height: 0;
    background: #fafbfc;
    display: flex;
    justify-content: center;

    .body-box {
      height: 100%;
      width: 1355px;
      padding: 50px 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;

      .btns-bar {
        flex-shrink: 0;
        width: 100%;
        display: flex;
        justify-content: space-between;

        .bar-left {
          display: flex;
          align-items: center;

          .btn + .btn {
            margin-left: 30px;
          }

          .text-btn {
            font-size: 14px;
            color: #2784ff;
            line-height: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;

            &:hover {
              color: #529dff;
            }

            &:active {
              color: #2376e5;
            }

            .freelog {
              font-size: 16px;
              margin-right: 5px;
            }
          }

          .info-box {
            position: relative;
            line-height: 14px;
            margin-left: 10px;
            padding-right: 5px;

            &:hover .info-popup {
              padding: 20px;
              box-sizing: border-box;
              width: 320px;
              height: 248px;
              opacity: 1;
            }

            .info-icon {
              font-size: 14px;
              color: #999999;
            }

            .info-popup {
              position: absolute;
              left: 19px;
              top: 0;
              width: 0;
              height: 0;
              background: #ffffff;
              box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
              border-radius: 4px;
              display: flex;
              flex-direction: column;
              align-items: center;
              overflow: hidden;
              z-index: 3;
              opacity: 0;
              transition: opacity 0.2s ease;

              .img-box {
                position: relative;
                width: 140px;
                height: 120px;
                display: flex;
                justify-content: center;

                .img {
                  width: 140px;
                  height: 120px;
                }

                .line {
                  position: absolute;
                  top: 50%;
                  left: 0;
                  right: 0;
                  height: 0;
                  border-top: 1px dashed 2784ff;
                }

                .scissors {
                  position: absolute;
                  left: 10px;
                  top: 50%;
                  width: 24px;
                  height: 24px;
                  animation: blueScissors 1s linear both infinite;
                }
              }

              .desc {
                font-size: 12px;
                color: #222222;
                line-height: 17px;
                margin-top: 20px;
              }
            }
          }
        }

        .primary-btn {
          padding: 9px 20px;
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
      }

      .img-area {
        position: relative;
        width: 100%;
        flex: 1;
        height: 0;
        border-radius: 10px;
        border: 1px dashed #d5d5d5;
        box-sizing: border-box;
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;

        .upload-box {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .upload-icon {
            font-size: 64px;
            color: #666;
          }

          .upload-desc {
            font-size: 14px;
            color: #666666;
            line-height: 20px;
            margin-top: 47px;
          }

          .upload-tip {
            font-size: 12px;
            color: #999999;
            line-height: 18px;
            margin-top: 40px;
          }
        }

        .img-box {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;

          .img-header {
            width: 100%;
            height: 60px;
            display: flex;
            justify-content: center;
            background-color: #fafbfc;
            border-radius: 10px 10px 0 0;

            .box-header {
              width: 1275px;
              height: 60px;
              display: flex;
              align-items: center;
              justify-content: space-between;

              .total {
                font-size: 12px;
                color: #666666;
                line-height: 18px;
              }

              .clear-btn {
                font-size: 12px;
                color: #ee4040;
                line-height: 18px;
                display: flex;
                align-items: center;
                cursor: pointer;

                &:hover {
                  color: #f86363;
                }

                &:active {
                  color: #eb3737;
                }

                .delete-icon {
                  font-size: 14px;
                  margin-right: 6px;
                  margin-top: 1px;
                }
              }
            }
          }

          .box-body {
            flex: 1;
            height: 0;
            width: 100%;

            .img-list {
              width: 100%;
              height: 100%;
              overflow-x: hidden;
              overflow-y: auto;
              display: flex;
              flex-wrap: wrap;
              padding-left: 35px;
              box-sizing: border-box;

              .img-card-wrapper:nth-child(6n) {
                margin-right: 0;
              }

              &::-webkit-scrollbar {
                width: 10px;
              }

              &::-webkit-scrollbar-thumb {
                width: 10px;
                border-radius: 10px;
                background: rgba(0, 0, 0, 0.15);

                &:hover {
                  background: rgba(0, 0, 0, 0.35);
                }
              }

              &::-webkit-scrollbar-track {
                background-color: rgba(0, 0, 0, 0.03);
                border-radius: 10px;
                margin-bottom: 10px;
              }
            }
          }
        }
      }

      .desc-area {
        margin-top: 20px;

        li {
          font-size: 12px;
          color: #999999;
          line-height: 18px;

          & + li {
            margin-top: 10px;
          }
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
    background: rgba(0, 0, 0, 0.4);
    animation: fade-in 0.2s ease-in-out;
    z-index: 1;

    &.transparent {
      background: transparent;
    }
  }

  .popup-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;

    .loader-box {
      width: 80px;
      height: 80px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 6px;
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;

      .loader-icon {
        font-size: 30px;
        color: #fff;
        animation: loader 1s linear both infinite;
      }
    }

    .cutting-loader-box {
      width: 500px;
      height: 320px;
      background: #ffffff;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;

      .title {
        font-size: 24px;
        color: #666666;
        line-height: 33px;
        margin-top: 67px;
      }

      .line-box {
        position: relative;
        width: 280px;
        margin-top: 60px;

        .scissors {
          position: absolute;
          left: 10px;
          width: 24px;
          height: 24px;
          animation: blackScissors 1.5s linear both infinite;
        }

        .line {
          width: 100%;
          height: 0;
          border-top: 1px dashed #999;
        }
      }

      .desc {
        font-size: 12px;
        color: #999999;
        line-height: 17px;
        margin-top: 59px;
      }
    }

    .save-loader-box {
      width: 500px;
      height: 320px;
      background: #ffffff;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 2;

      .title {
        font-size: 24px;
        color: #666666;
        line-height: 33px;
        margin-top: 62px;
      }

      .progress-box {
        width: 280px;
        height: 10px;
        background: #e5e7eb;
        border-radius: 5px;
        margin-top: 60px;

        .progress-bar {
          height: 10px;
          background: #2784ff;
          border-radius: 5px;
          transition: width 0.02s linear;
        }
      }

      .desc {
        font-size: 12px;
        color: #999999;
        line-height: 17px;
        margin-top: 60px;

        .desc-progress {
          margin-left: 10px;
        }
      }
    }

    .delete-confirm-box {
      width: 460px;
      background: #ffffff;
      border-radius: 6px;
      padding: 30px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 2;

      .confirm-header {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;

        .title {
          font-size: 18px;
          color: #222222;
          line-height: 25px;
        }

        .freelog {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: #333;
          cursor: pointer;

          &:hover {
            color: #529dff;
          }

          &:active {
            color: #2376e5;
          }
        }
      }

      .desc {
        width: 100%;
        min-height: 152px;
        padding: 32px 0;
        box-sizing: border-box;
        font-size: 16px;
        color: #666666;
        line-height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        word-break: break-all;
      }

      .btns-box {
        width: 100%;
        display: flex;
        justify-content: center;

        .btn {
          padding: 9px 20px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .text-btn {
          color: #666666;
          background-color: #fff;

          &:hover {
            color: #529dff;
          }

          &:active {
            color: #2376e5;
          }
        }

        .delete-btn {
          color: #fff;
          background: #ee4040;

          &:hover {
            background: #f86363;
          }

          &:active {
            background: #eb3737;
          }
        }
      }
    }
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

  .save-fail-tip {
    position: fixed;
    top: 98px;
    left: 50%;
    margin-left: -172px;
    width: 344px;
    height: 92px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 6px;
    backdrop-filter: blur(2px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 11;

    .tip-title {
      font-size: 18px;
      color: #ffffff;
      line-height: 25px;
    }

    .tip-desc {
      font-size: 12px;
      color: #ffffff;
      line-height: 17px;
      margin-top: 10px;
    }
  }

  @media (max-width: 1600px) {
    .body-box {
      width: 1140px !important;

      .box-header {
        width: 1060px !important;
      }

      .img-list {
        .img-card-wrapper:nth-child(6n) {
          margin-right: 15px !important;
        }

        .img-card-wrapper:nth-child(5n) {
          margin-right: 0 !important;
        }
      }
    }
  }

  @keyframes blueScissors {
    from {
      transform: translateY(-50%) translateX(0);
    }
    to {
      transform: translateY(-50%) translateX(96px);
    }
  }

  @keyframes blackScissors {
    from {
      transform: translateY(-50%) translateX(0);
    }
    to {
      transform: translateY(-50%) translateX(236px);
    }
  }

  @keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
