<!-- 切图详情弹窗组件 -->

<template>
  <el-drawer
    class="cut-drawer-wrapper"
    v-model="store.viewCutImagesDrawerShow"
    :with-header="false"
    :size="700"
    :before-close="close"
  >
    <div class="drawer">
      <div class="drawer-header">
        <div class="title">{{ I18n("cbformatter_slice_preview_title") }}</div>
        <i class="freelog fl-icon-guanbi close-btn" @click="close()" />
      </div>
      <div class="drawer-body">
        <div class="cut-img-box" v-for="item in store.cutImagesToView" :key="item.name">
          <div class="cut-mark">
            <i class="freelog fl-icon-jiandao"></i>
            <div class="line"></div>
          </div>
          <div class="name-size">
            <span>{{ item.name }}</span>
            <span>{{ conversionSize(item.size) }}</span>
          </div>
          <img class="cut-img" :src="item.base64" />
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { conversionSize } from "@/utils/common";
import { useStore } from "@/store";

const store = useStore();

/** 关闭弹窗 */
const close = () => {
  store.cutImagesToView = [];
  store.viewCutImagesDrawerShow = false;
};
</script>

<style lang="scss" scoped>
.cut-drawer-wrapper {
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
      padding: 30px 20px;
      box-sizing: border-box;
      overflow-y: auto;

      .cut-img-box {
        position: relative;
        width: 100%;
        padding: 0 30px;
        box-sizing: border-box;

        &:first-child .cut-mark {
          display: none;
        }

        .cut-mark {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          display: flex;

          .freelog {
            font-size: 14px;
            transform: translateY(-50%) rotate(90deg);
            color: #666;
          }

          .line {
            flex: 1;
            height: 0;
            margin-left: 5px;
            border-top: 1px dashed #999999;
          }
        }

        .name-size {
          position: absolute;
          left: 40px;
          top: 10px;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 4px;
          backdrop-filter: blur(2px);
          padding: 3px 5px;
          font-size: 12px;
          font-weight: 600;
          color: #d2d2d2;
          line-height: 18px;

          span + span {
            margin-left: 10px;
          }
        }

        .cut-img {
          width: 100%;
          -webkit-user-drag: none;
        }
      }

      .close-btn {
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
</style>
