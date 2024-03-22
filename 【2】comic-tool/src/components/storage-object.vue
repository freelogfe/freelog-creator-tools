<!-- 存储对象 -->

<template>
  <div class="storage-object-wrapper">
    <div class="info-area" v-if="['none', 'success'].includes(data.uploadStatus)">
      <div class="object-name" :title="`${data.bucketName}/${data.objectName}`">
        {{ `${data.bucketName}/${data.objectName}` }}
      </div>
      <div class="other-info">
        {{ `${I18n("label_last_updated")} ${formatDate(data.updateDate, "YYYY-MM-DD hh:mm")}` }}
      </div>
    </div>
    <div class="info-area" v-else>
      <div class="object-name" :title="data.file.name">{{ data.file.name }}</div>
      <div class="other-info">{{ formatSize(data.file.size) }}</div>
    </div>

    <template v-if="data.uploadStatus !== 'none'">
      <div class="status" v-if="data.uploadStatus === 'uploading'">
        <div class="percent">{{ data.progress }}%</div>
        <el-progress :percentage="data.progress" :show-text="false" />
      </div>
      <div class="status" :class="data.uploadStatus" v-else>
        {{ I18n(STATUS_MAPPING[data.uploadStatus]?.statusTip) }}
      </div>
    </template>

    <div class="other-btn" @click.stop="operate" v-if="!['none', 'success'].includes(data.uploadStatus)">
      <el-tooltip
        :content="STATUS_MAPPING[data.uploadStatus]?.tooltipTitle"
        placement="bottom-end"
        effect="light"
        :show-arrow="false"
      >
        <i
          class="freelog"
          :class="STATUS_MAPPING[data.uploadStatus]?.icon"
          v-if="STATUS_MAPPING[data.uploadStatus]?.icon"
        />
        <div class="update-btn">{{ STATUS_MAPPING[data.uploadStatus]?.btn }}</div>
      </el-tooltip>
    </div>

    <el-popconfirm
      :title="I18n('cbformatter_import_confirmation')"
      :confirm-button-text="I18n('btn_import_post')"
      :cancel-button-text="I18n('btn_cancel')"
      @confirm="onSelect(data)"
      teleported
      width="500"
    >
      <template #reference>
        <div class="mask" @click.stop v-if="['none', 'success'].includes(data.uploadStatus)" />
      </template>
    </el-popconfirm>
  </div>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { formatDate, formatSize } from "@/utils/common";

const props = defineProps(["data", "onCancel", "onUpload", "onUpdate", "onSelect"]);
const { data, onCancel, onUpload, onUpdate, onSelect } = props;

/** 状态映射 */
const STATUS_MAPPING: any = {
  uploading: {
    tooltipTitle: I18n("uploadobject_tooltip_cancel_uploading"),
    icon: "fl-icon-guanbi",
  },
  success: {
    statusTip: "uploadobject_msg_uploaded_successfully",
  },
  cancel: {
    statusTip: "uploadobject_msg_canceled",
    tooltipTitle: I18n("uploadobject_tooltip_resume_uploading"),
    icon: "fl-icon-zhongzhi",
  },
  fail: {
    statusTip: "uploadobject_msg_upload_failed",
    tooltipTitle: I18n("uploadobject_tooltip_resume_uploading"),
    icon: "fl-icon-zhongzhi",
  },
  repeatName: {
    statusTip: "uploadobject_msg_object_exist",
    tooltipTitle: I18n("uploadobject_tooltip_update"),
    btn: I18n("uploadobject_btn_update"),
  },
};

/** 操作 */
const operate = () => {
  const { uploadStatus } = data;
  if (uploadStatus === "uploading") {
    // 正在上传，进行取消上传操作
    onCancel(data);
  } else if (["cancel", "fail"].includes(uploadStatus)) {
    // 取消上传/上传失败，进行重新上传操作
    onUpload(data);
  } else if (uploadStatus === "repeatName") {
    // 存在同名对象，进行更新操作
    onUpdate(data, true);
  }
};
</script>

<style lang="scss" scoped>
.storage-object-wrapper {
  position: relative;
  width: 100%;
  padding: 15px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    background: #edf6ff;
  }

  .info-area {
    width: 0;
    flex: 1;

    .object-name {
      font-size: 14px;
      font-weight: 600;
      color: #222222;
      line-height: 20px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .other-info {
      font-size: 12px;
      font-weight: 400;
      color: #999999;
      line-height: 17px;
      margin-top: 5px;
    }
  }

  .status {
    width: 141px;
    display: flex;
    align-items: center;
    margin-left: 24px;
    font-size: 14px;

    &.success {
      color: #44c28c;
    }

    &.cancel {
      color: #222;
    }

    &.fail {
      color: #ee4040;
    }

    &.repeatName {
      color: #e9a923;
    }

    .percent {
      color: #222222;
      line-height: 20px;
    }

    .el-progress--line {
      width: 100px;
      margin-left: 10px;
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
    margin-left: 24px;
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

  .other-btn {
    width: 58px;
    display: flex;
    justify-content: flex-end;
    margin-left: 24px;

    .freelog {
      font-size: 16px;
      color: #333;

      &.fl-icon-guanbi {
        font-size: 12px;
      }
    }

    .update-btn {
      font-size: 14px;
      color: #2784ff;
      line-height: 20px;
    }

    .freelog,
    .update-btn {
      cursor: pointer;

      &:hover {
        color: #529dff;
      }

      &:active {
        color: #2376e5;
      }
    }
  }

  .mask {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }
}
</style>
