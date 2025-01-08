<!-- 抽屉存储对象列表 -->

<template>
  <div class="drawer-storage-list-wrapper">
    <div class="header">
      <div class="left-header">
        <el-select class="bucket-select" v-model="data.bucket" @change="changeBucket($event)">
          <el-option :label="I18n('posteditor_insert_label_all_buckets')" value="_all" />
          <el-option v-for="item in data.bucketList" :key="item" :label="item" :value="item" />
        </el-select>

        <el-popover :visible="data.uploadPopShow" width="fit-content" placement="bottom-start" transition="null">
          <div class="upload-bucket-selector">
            <template v-if="data.bucketList.length">
              <div class="tip">{{ I18n("msg_posteditor_upload_object") }}</div>

              <el-select
                class="selector"
                v-model="data.uploadBucket"
                :placeholder="I18n('insert_fromstorage_select_bucket_hint')"
              >
                <el-option v-for="item in data.bucketList" :key="item" :label="item" :value="item" />
                <el-option
                  class="create-bucket-btn"
                  value="create"
                  @click="openBucketCreater"
                  v-if="data.bucketList.length < 5"
                >
                  <i class="freelog fl-icon-tianjia" />
                  <div>{{ I18n("posteditor_insert_btn_createbucket") }}</div>
                </el-option>
              </el-select>

              <div class="btn-box">
                <el-upload
                  :accept="RESOURCE_TYPE_MAPPING[props.type]?.accept"
                  multiple
                  :show-file-list="false"
                  :disabled="!data.uploadBucket"
                  :before-upload="beforeUpload"
                  :http-request="() => {}"
                >
                  <div class="btn" :class="{ disabled: !data.uploadBucket }">{{ I18n("btn_done") }}</div>
                </el-upload>
              </div>
            </template>

            <div class="no-bucket-box" v-else>
              <div class="tip">{{ I18n("posteditor_insert_no_bucket") }}</div>
              <div class="btn" @click="openBucketCreater">{{ I18n("posteditor_insert_btn_createbucket02") }}</div>
            </div>
          </div>

          <template #reference>
            <div class="upload-btn" @click.stop="data.uploadPopShow = true">
              <i class="freelog fl-icon-shangchuanfengmian" />
              <div class="btn-text">{{ RESOURCE_TYPE_MAPPING[props.type]?.uploadText }}</div>
            </div>
          </template>
        </el-popover>
      </div>

      <div class="search-input">
        <SearchInput @setSearchKey="store.searchKey = $event" />
      </div>
    </div>

    <div class="skeleton-area" v-if="data.loading">
      <ListSkeleton type="object" />
    </div>

    <template v-else>
      <NoData v-if="data.objectList.length === 0 && data.noMore" />

      <el-scrollbar>
        <div class="list-area" v-infinite-scroll="getObjects" :infinite-scroll-immediate="false">
          <div class="list-item" v-for="item in uploadQueueToShow" :key="item.uid">
            <StorageObject
              :type="props.operateType"
              :data="item"
              @cancel="cancelUpload"
              @upload="againUpload"
              @update="uploadCreate"
              @select="$emit('select', item)"
            />
          </div>

          <div class="list-item" v-for="item in data.objectList" :key="item.objectId">
            <StorageObject :type="props.operateType" :data="item" @select="$emit('select', item)" />
          </div>
        </div>
      </el-scrollbar>
    </template>
  </div>

  <!-- 创建存储空间弹窗 -->
  <el-dialog
    v-model="data.createBucketShow"
    :title="I18n('create_bucket_popup_title')"
    width="640"
    destroy-on-close
    @click.stop
  >
    <div class="dialog-content">
      <div class="tip">
        <div class="tip-row" v-for="item in I18n('create_bucket_popup_msg').split('\n')" :key="item">{{ item }}</div>
      </div>
      <el-input class="bucket-input" v-model="data.newBucketName" :placeholder="I18n('enter_bucket_name')" />
      <div class="error-box">
        <template v-if="data.newBucketName">
          <template v-if="data.newBucketError === 1">
            <div v-for="item in I18n('naming_convention_bucket_name').split('\n')" :key="item">{{ item }}</div>
          </template>
          <div v-if="data.newBucketError === 2">{{ I18n("bucket_createbucket_err_bucketexists") }}</div>
        </template>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="data.createBucketShow = false">{{ I18n("btn_cancel") }}</el-button>
        <el-button type="primary" :disabled="!data.newBucketName || data.newBucketError !== 0" @click="createBucket">
          {{ I18n("btn_done") }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { StorageService } from "@/api/request";
import { useStore } from "@/store";
import { getFileSha1 } from "@/utils/common";
import { ElMessage, UploadRawFile } from "element-plus";
import { computed, nextTick, reactive, watch } from "vue";
import axios from "axios";
import { BucketObject, UploadBucketObjectData } from "@/typings/object";
import SearchInput from "@/components/search-input.vue";
import ListSkeleton from "@/components/list-skeleton.vue";
import NoData from "@/components/no-data.vue";
import StorageObject from "@/components/storage-object.vue";

const store = useStore();
const props = defineProps(["active", "from", "type", "operateType", "closeSubPopup"]);
const emit = defineEmits(["select"]);

/** 列表每页数量 */
const COUNT_PER_PAGE = 100;
/** 资源类型相关映射 */
const RESOURCE_TYPE_MAPPING: Record<string, Record<string, string>> = {
  image: {
    accept: "image/*",
    bucketTitle: I18n("posteditor_insert_label_objectlist_image"),
    uploadText: I18n("btn_upload_new_image"),
  },
  audio: {
    accept: "audio/*",
    bucketTitle: I18n("posteditor_insert_label_objectlist_audio"),
    uploadText: I18n("btn_upload_new_audio"),
  },
  video: {
    accept: "video/*",
    bucketTitle: I18n("posteditor_insert_label_objectlist_video"),
    uploadText: I18n("btn_upload_new_video"),
  },
  text: {
    accept: ".md,.txt",
    bucketTitle: I18n("posteditor_insert_label_objectlist_post"),
    uploadText: I18n("btn_upload_new_post"),
  },
};

const data = reactive({
  bucket: "_all",
  bucketList: [] as string[],
  objectList: [] as BucketObject[],
  uploadPopShow: false,
  uploadBucket: null as string | null,
  uploadQueue: [] as UploadBucketObjectData[],
  createBucketShow: false,
  newBucketName: "",
  newBucketError: -1,
  page: -1,
  noMore: false,
  loading: false,
  searchDisabled: false,
});

/** 需要显示的上传队列 */
const uploadQueueToShow = computed(() => {
  const queue = data.uploadQueue.filter((item) => data.bucket === "_all" || item.bucketName === data.bucket);
  return queue;
});

/** 重置列表数据 */
const resetData = () => {
  data.bucket = "_all";
  data.bucketList = [];
  data.objectList = [];
  data.uploadQueue = [];
  data.page = -1;
  data.noMore = false;
};

/** 切换存储空间 */
const changeBucket = (value: string) => {
  data.uploadBucket = value === '_all' ? null : value;
  getObjects(true);
};

/** 获取用户的存储空间 */
const getBuckets = async () => {
  const bucketList = await StorageService.getStorageBucketList(1);
  if (!bucketList) return;

  const bucketNameList = bucketList.map((item: { bucketName: string }) => item.bucketName);
  data.bucketList = bucketNameList;
  getObjects(true);
};

/** 获取存储空间对应桶的对应类型资源 */
const getObjects = async (init = false) => {
  if (init) {
    data.objectList = [];
    data.page = 0;
    data.noMore = false;
    data.loading = true;
  } else if (data.noMore) {
    return;
  } else {
    data.page++;
  }

  const bucketName = data.bucket;
  const params = {
    skip: data.page * COUNT_PER_PAGE,
    limit: COUNT_PER_PAGE,
    bucketName,
    mime: props.type,
    keywords: store.searchKey,
  };
  const res = await StorageService.getStorageObjectList(params);
  if (!res) return;

  const { dataList, totalItem } = res;
  dataList.forEach((item: BucketObject) => {
    item.uploadStatus = "none";
  });
  data.objectList = [...data.objectList, ...dataList];
  data.noMore = data.objectList.length === totalItem;
  data.loading = false;
};

/** 打开创建存储空间弹窗 */
const openBucketCreater = () => {
  data.uploadPopShow = false;
  data.newBucketName = "";
  data.createBucketShow = true;
};

/** 校验存储空间名称 */
const verifyBucketName = async () => {
  data.newBucketError = -1;

  const BUCKET_NAME: RegExp = /^([a-z0-9][a-z0-9-]{0,61})?[a-z0-9]$/;
  if (!BUCKET_NAME.test(data.newBucketName)) {
    // 不符合存储空间命名规范
    data.newBucketError = 1;
    return;
  }

  const isExist = await StorageService.getBucketIsExist(data.newBucketName);
  if (isExist) {
    data.newBucketError = 2;
    return;
  }

  data.newBucketError = 0;
};

/** 上传文件前整理队列 */
const beforeUpload = async (file: UploadRawFile) => {
  // 文件类型是否符合当前资源要求的文件类型
  let TYPE_ERROR;
  if (props.operateType === "insert") {
    TYPE_ERROR =
      (["image", "audio", "video"].includes(props.type) && !file.type.startsWith(props.type)) ||
      (props.type === "text" && !file.name.endsWith(".md") && !file.name.endsWith(".txt"));
  } else if (props.operateType === "import") {
    TYPE_ERROR = !file.name.endsWith(".md") && !file.name.endsWith(".txt");
  }
  if (TYPE_ERROR) {
    ElMessage.warning(I18n("mdeditor_insert_error_format"));
    return;
  }

  // 是否超过大小限制
  const OVERSIZE = file.size > 200 * 1024 * 1024;
  if (OVERSIZE) {
    ElMessage.warning(I18n("uploadobject_err_file_size"));
    return;
  }

  // 当前存储空间内存是否不足
  const bucketSpace = await StorageService.getBucketSpace();
  const { storageLimit, totalFileSize } = bucketSpace;
  if (storageLimit - totalFileSize < file.size) {
    ElMessage.warning(I18n("uploadobject_alarm_storage_full"));
    return;
  }

  data.uploadPopShow = false;
  const name = file.name.replace(/[\\|\/|:|\*|\?|"|<|>|\||\s|@|\$|#]/g, "_");
  const sha1 = await getFileSha1(file);

  // 文件名称是否存在
  const objectResult = await StorageService.searchObject(`${data.uploadBucket}/${name}`);
  const sameName = objectResult.length !== 0;

  // 整理上传任务
  const task = {
    uid: file.uid,
    sha1,
    name,
    file,
    bucketName: data.uploadBucket || "",
    uploadStatus: "uploading",
    progress: 0,
    sameName,
    cancel: null,
  };
  data.uploadQueue.unshift(task);

  uploadCreate(data.uploadQueue[0]);
};

/** 上传并创建存储对象 */
const uploadCreate = async (task: UploadBucketObjectData, reUpload = false) => {
  const { sameName, file, sha1, bucketName, name, uid } = task;

  if (sameName && !reUpload) {
    // 重名且不是重新上传
    task.uploadStatus = "repeatName";
    return;
  }

  // 上传文件
  task.uploadStatus = "uploading";
  task.progress = 0;
  const res = await StorageService.uploadStorageFile(
    { file },
    {
      onUploadProgress(progressEvent) {
        const progress = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
        task.progress = progress;
      },
      cancelToken: new axios.CancelToken((cancel) => {
        task.cancel = cancel;
      }),
    }
  );
  if (!res) {
    // 上传失败
    task.uploadStatus = "fail";
    return;
  }

  // 创建存储对象
  const createResult = await StorageService.createObject({ bucketName, objectName: name, sha1 });
  if (createResult) {
    const objectIndex = data.objectList.findIndex((item) => item.objectName === name && item.bucketName === bucketName);
    if (objectIndex !== -1) data.objectList.splice(objectIndex, 1);
    const uploadIndex = data.uploadQueue.findIndex(
      (item) => item.objectName === name && item.bucketName === bucketName && item.uploadStatus === "success"
    );
    if (uploadIndex !== -1) data.uploadQueue.splice(uploadIndex, 1);
    const object = await StorageService.searchObject(`${bucketName}/${name}`);
    const i = data.uploadQueue.findIndex((item) => item.uid === uid);
    data.uploadQueue[i] = { ...object[0], uploadStatus: "success" };
  } else {
    task.uploadStatus = "fail";
  }
};

/** 重新上传 */
const againUpload = async (task: UploadBucketObjectData) => {
  // 文件名称是否存在
  const result = await StorageService.searchObject(`${data.uploadBucket}/${task.name}`);
  const sameName = result.length !== 0;
  if (sameName) {
    task.uploadStatus = "repeatName";
  } else {
    uploadCreate(task);
  }
};

/** 取消上传 */
const cancelUpload = (task: UploadBucketObjectData) => {
  task.cancel && task.cancel();
  task.uploadStatus = "cancel";
  task.progress = 0;
};

/** 创建存储空间 */
const createBucket = async () => {
  const result = await StorageService.createBucket(data.newBucketName);
  if (!result) return;

  data.createBucketShow = false;
  data.bucketList.push(result.bucketName);
};

watch(
  () => props.active,
  (cur) => {
    data.searchDisabled = true;
    if (cur) store.searchKey = "";
    cur ? getBuckets() : resetData();
    nextTick(() => {
      data.searchDisabled = false;
    });
  }
);

watch(
  () => store.searchKey,
  () => {
    if (props.active && !data.searchDisabled) getObjects(true);
  }
);

watch(
  () => data.newBucketName,
  () => {
    verifyBucketName();
  }
);

watch(
  () => props.closeSubPopup,
  () => {
    data.uploadPopShow = false;
  }
);
</script>

<style lang="scss" scoped>
.drawer-storage-list-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    width: 100%;
    padding: 0 30px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;

    .left-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      :deep .bucket-select {
        .el-input__wrapper {
          width: 130px;
          height: 38px;
          padding: 0 11px;
          box-sizing: border-box;
          border: 1px solid #2784ff;
          border-radius: 4px;
        }

        .el-input__inner {
          color: #2784ff;
        }

        .el-icon {
          color: #2784ff;
        }
      }

      .upload-btn {
        display: flex;
        align-items: center;
        color: #2784ff;
        cursor: pointer;
        margin-left: 30px;

        &:hover {
          color: #529dff;
        }

        &:active {
          color: #2376e5;
        }

        .freelog {
          font-size: 14px;
        }

        .btn-text {
          font-size: 12px;
          color: #2784ff;
          line-height: 18px;
          margin-left: 5px;
        }
      }
    }

    .search-input {
      width: 220px;
    }
  }

  .skeleton-area {
    flex: 1;
    height: 0;
    width: 100%;
    padding: 0 30px;
    box-sizing: border-box;
  }

  :deep .no-data-wrapper {
    height: calc(100vh - 275px);

    .no-data-tip {
      margin-top: calc((100vh - 275px - 148px) / 5 * 2);
    }
  }

  .list-area {
    width: 100%;
    padding: 0 30px 30px;
    box-sizing: border-box;

    .list-item + .list-item {
      margin-top: 10px;
    }
  }
}

.upload-bucket-selector {
  width: 300px;
  margin: 4px 3px;

  .tip {
    font-size: 14px;
    font-weight: 600;
    color: #7a869a;
    line-height: 20px;
  }

  :deep .selector {
    width: 100%;
    margin-top: 10px;

    .el-input__wrapper {
      height: 38px;
      padding: 0 11px;
      box-sizing: border-box;
      border: 1px solid #2784ff;
      border-radius: 4px;
    }

    .el-input__inner {
      color: #2784ff;
    }

    .el-icon {
      color: #2784ff;
    }
  }

  .btn-box {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;

    .btn {
      padding: 9px 20px;
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

  .no-bucket-box {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .tip {
      margin-top: 20px;
    }

    .btn {
      margin-top: 40px;
      margin-bottom: 10px;
    }
  }
}

.create-bucket-btn {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #ccc;
  font-size: 14px;
  font-weight: 600;
  color: #2784ff;
  padding-top: 5px !important;
  cursor: pointer;

  &:hover {
    color: #529dff;
    background-color: #fff;
  }

  &:active {
    color: #2376e5;
  }

  .freelog {
    font-size: 16px;
    margin-right: 10px;
  }
}

.dialog-content {
  width: 100%;
  padding: 0 100px;
  box-sizing: border-box;

  .tip {
    margin-top: 20px;
    font-size: 12px;
    color: #666;

    .tip-row + .tip-row {
      margin-top: 10px;
    }
  }

  .bucket-input {
    width: 100%;
    height: 38px;
    margin-top: 20px;
  }

  .error-box {
    width: 100%;
    height: 100px;
    padding: 5px 10px;
    box-sizing: border-box;
    color: #ee4040;
    line-height: 22px;
  }
}

.el-select-dropdown__item.create-bucket-btn {
  padding: 0;
}
</style>
