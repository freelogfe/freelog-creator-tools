<!-- 图片组件 -->

<template>
  <div class="img-card-wrapper" :class="{ dragging: store.dragging }">
    <div class="card-main">
      <!-- 主体区域 -->
      <div
        class="main-body"
        :class="{ 'drag-handle': props.data.size <= MAX_IMG_SIZE, 'no-drag': props.data.size > MAX_IMG_SIZE }"
      >
        <!-- 卡片头部 -->
        <div class="card-header" :class="{ oversize: props.data.size > MAX_IMG_SIZE }">
          <div class="order">{{ props.index + 1 }}</div>
          <div class="header-center">
            <span v-if="props.data.children && (!props.data.size || props.data.size < MAX_IMG_SIZE)">
              {{ I18n("cbformatter_slice_qty", { imageQty: props.data.children.length }) }}
            </span>
            <span v-else>{{ conversionSize(props.data.size) }}</span>
          </div>
        </div>
        <!-- 卡片身体（图片区域 -->
        <div class="card-body">
          <template v-if="!props.data.size || props.data.size <= MAX_IMG_SIZE">
            <template v-if="props.data.base64">
              <template v-if="props.data.children">
                <div class="cut-img" />
                <div class="cut-img" />
                <div class="cut-img" />
                <img class="cut-img" :src="props.data.base64" />
              </template>
              <img class="img" :src="props.data.base64" v-else />
            </template>
            <el-skeleton class="skeleton" animated v-else>
              <template #template>
                <el-skeleton-item class="skeleton" variant="image" />
              </template>
            </el-skeleton>
          </template>
          <div class="oversize-box" v-else>
            <img class="oversize-img" src="../assets/images/oversize.png" />
            <div class="oversize-tip">
              {{ I18n(props.data.children ? "cbformatter_err_filesize_sliced" : "cbformatter_err_filesize") }}
            </div>
          </div>

          <div class="cut-mark" v-if="props.data.children">
            <i class="freelog fl-icon-jiandao" />
            {{ I18n("cbformatter_slice_state_done") }}
          </div>
        </div>
      </div>

      <!-- 拖拽提示 -->
      <div class="drag-tip">{{ I18n("cbformatter_dragtoreorder_tooltips") }}</div>

      <!-- 插入按钮 -->
      <div class="insert-btn pre" @click="insertImage(index)">
        <i class="freelog fl-icon-tianjia" />
        <div class="insert-tip">{{ I18n("cbformatter_insert_tooltips") }}</div>
      </div>
      <div class="insert-btn next" @click="insertImage(index + 1)">
        <i class="freelog fl-icon-tianjia" />
        <div class="insert-tip">{{ I18n("cbformatter_insert_tooltips") }}</div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="operate-btns">
        <template
          v-if="
            store.comicMode === 1 &&
            ['png', 'jpg', 'jpeg'].includes(getExt(props.data.name)) &&
            props.data.size < MAX_IMG_SIZE
          "
        >
          <div class="btn" @click.stop="cutImage()" v-if="!props.data.children">
            <i class="freelog fl-icon-jiandao" />
            <div class="btn-name">{{ I18n("cbformatter_slice_btn") }}</div>
          </div>
          <div class="btn" @click="viewCutImages()" v-else>
            <i class="freelog fl-icon-jiandao" />
            <div class="btn-name">{{ I18n("cbformatter_slice_preview") }}</div>
          </div>
        </template>
        <div class="btn" @click.stop="deleteImg()">
          <i class="freelog fl-icon-shanchu" />
          <div class="btn-name">{{ I18n("cbformatter_delete_btn") }}</div>
        </div>
      </div>
    </div>

    <!-- 图片名称 -->
    <div class="name">{{ formatCardName(props.data.name) }}</div>
  </div>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { useStore } from "@/store";
import { MAX_IMG_SIZE } from "@/utils/assets";
import { conversionSize, formatCardName, getExt } from "@/utils/common";

const props = defineProps(["index", "data", "cut"]);

const store = useStore();

/** 删除图片 */
const deleteImg = () => {
  const { data, index } = props;
  store.deleteItem = { ...data, index };
  store.deleteConfirmShow = true;
};

/** 插入图片 */
const insertImage = (i: number) => {
  store.insertIndex = i;
  document.getElementById("uploadLocalImg")?.click();
};

/** 切图 */
const cutImage = () => {
  props.cut(props.data);
};

/** 查看切图详情 */
const viewCutImages = () => {
  store.cutImagesToView = props.data.children || [];
  store.viewCutImagesDrawerShow = true;
};
</script>

<style lang="scss" scoped>
.img-card-wrapper {
  position: relative;
  height: 298px;
  width: 200px;
  margin-right: 15px;
  margin-bottom: 20px;
  user-select: none;

  &.dragging {
    .card-main {
      box-shadow: none !important;
    }

    .drag-tip,
    .insert-btn,
    .operate-btns {
      display: none !important;
    }
  }

  .card-main {
    position: relative;
    width: 100%;
    border-radius: 6px;
    transition: all 0.1s ease-in-out;

    &:hover {
      box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.2);

      .drag-tip {
        opacity: 1;
      }

      .insert-btn {
        opacity: 1;
        transform: scale(1);
      }

      .operate-btns {
        opacity: 1;
      }
    }

    .main-body {
      &.drag-handle {
        cursor: grab;

        &:active {
          cursor: grabbing;

          & ~ .drag-tip,
          & ~ .insert-btn,
          & ~ .operate-btns {
            display: none !important;
          }
        }
      }

      &.no-drag ~ .drag-tip {
        display: none;
      }

      .card-header {
        position: relative;
        width: 100%;
        height: 30px;
        background: #f3f3f3;
        border-radius: 6px 6px 0px 0px;
        display: flex;
        align-items: center;
        color: #222222;
        transition: all 0.1s ease-in-out;

        &.oversize {
          cursor: default;

          .header-center {
            color: #ee4040;
          }
        }

        .order {
          font-size: 12px;
          line-height: 18px;
          width: 36px;
          padding-left: 10px;
          box-sizing: border-box;
        }

        .header-center {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .card-body {
        position: relative;
        width: 100%;
        height: 240px;
        background-color: #fff;
        border-radius: 0px 0px 6px 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;

        .cut-img {
          position: absolute;
          width: 120px;
          height: 136px;
          background: #fafafa;
          border-radius: 4px;
          border: 1px dashed #e1e1e1;
          object-fit: contain;
          -webkit-user-drag: none;

          &:nth-child(1) {
            left: 55px;
            top: 37px;
          }

          &:nth-child(2) {
            left: 45px;
            top: 47px;
          }

          &:nth-child(3) {
            left: 35px;
            top: 57px;
          }

          &:nth-child(4) {
            left: 25px;
            top: 67px;
          }
        }

        .img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          -webkit-user-drag: none;
        }

        .skeleton {
          width: 100%;
          height: 100%;
        }

        .oversize-box {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: default;

          .oversize-img {
            width: 110px;
            height: 80px;
            margin-top: 61px;
            -webkit-user-drag: none;
          }

          .oversize-tip {
            font-size: 12px;
            color: #ee4040;
            line-height: 18px;
            margin-top: 20px;
          }
        }

        .cut-mark {
          position: absolute;
          right: 10px;
          bottom: 10px;
          padding: 3px 8px;
          background: #42c28c;
          font-size: 12px;
          font-weight: 600;
          color: #ffffff;
          line-height: 18px;
          border-radius: 4px;
          display: flex;
          align-items: center;

          .freelog {
            font-size: 14px;
            font-weight: normal;
            margin-right: 5px;
            margin-top: 1px;
          }
        }
      }
    }

    .drag-tip {
      position: absolute;
      top: 15px;
      left: 50%;
      transform: translateX(-50%);
      padding: 7px 15px;
      background: #ffffff;
      box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      font-size: 12px;
      color: #222222;
      line-height: 18px;
      word-break: keep-all;
      opacity: 0;
      z-index: 1;
      transition: all 0.1s ease-in-out;
      cursor: grab;

      &:active {
        display: none;

        & ~ .insert-btn,
        & ~ .operate-btns {
          display: none !important;
        }
      }
    }

    .insert-btn {
      position: absolute;
      top: 115px;
      width: 40px;
      height: 40px;
      background: #ffffff;
      box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.4);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #222222;
      cursor: pointer;
      opacity: 0;
      transform: scale(0);
      transition: all 0.1s ease-in-out;
      z-index: 1;

      &:hover {
        opacity: 1;
        transform: scale(1);

        .insert-tip {
          opacity: 1;
          transform: scale(1);
        }
      }

      &:active {
        transform: scale(0.9);
      }

      &.pre {
        left: -27.5px;

        .insert-tip {
          left: 0;
        }
      }

      &.next {
        right: -27.5px;

        .insert-tip {
          right: 0;
        }
      }

      .insert-tip {
        position: absolute;
        top: -33px;
        padding: 5px 10px;
        background: #ffffff;
        box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        font-size: 12px;
        color: #222222;
        line-height: 18px;
        white-space: nowrap;
        opacity: 0;
        transform: scale(0);
        transition: all 0.1s ease-in-out;
      }
    }

    .operate-btns {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 68px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 0px 0px 6px 6px;
      backdrop-filter: blur(2px);
      display: flex;
      opacity: 0;
      transition: all 0.1s ease-in-out;

      .btn {
        position: relative;
        height: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #fff;
        cursor: pointer;

        & + .btn::before {
          position: absolute;
          left: 0;
          top: 14px;
          bottom: 14px;
          content: "";
          width: 1px;
          background: rgba(255, 255, 255, 0.4);
        }

        .freelog {
          font-size: 24px;
        }

        .btn-name {
          font-size: 12px;
          line-height: 17px;
          margin-top: 4px;
        }
      }
    }
  }

  .name {
    width: 100%;
    font-size: 12px;
    color: #666666;
    text-align: center;
    line-height: 18px;
    margin-top: 10px;
  }
}
</style>
