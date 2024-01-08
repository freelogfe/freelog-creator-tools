<!-- 资源卡片封面 -->

<template>
  <el-tooltip effect="light" :content="I18n('check_release_details')" placement="bottom-start">
    <div class="cover-wrapper" :style="{ '--width': coverWidth + 'px' }" @click.stop>
      <img
        v-lazy="data.src"
        :style="{
          width: data.coverStyle.width,
          height: data.coverStyle.height,
          transform: `translateX(${data.coverStyle.translateX}) translateY(${data.coverStyle.translateY})`,
        }"
        v-if="data.coverStyle"
      />
      <img class="default-cover" v-lazy="data.src" v-else-if="data.src" />
      <img class="default-cover" :src="DEFAULT_COVER" v-else />

      <div class="modal" @click.stop="toDetail(props.resourceData.resourceId)">
        <i class="freelog fl-icon-chakanziyuan detail-icon" />
      </div>
    </div>
  </el-tooltip>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { DEFAULT_COVER } from "@/assets/data";
import { CoverStyleData } from "@/typings/object";
import { toDetail } from "@/utils/common";
import { reactive } from "vue";

const props = defineProps(["resourceData", "width", "hiddenTag"]);
const coverWidth = props.width || 280;

const data = reactive({
  src: "",
  coverStyle: null as CoverStyleData | null,
});

/** 初始化封面 */
const initCover = () => {
  const { coverImages } = props.resourceData;
  const src = coverImages ? coverImages[0] : "";
  if (!src) return;

  if (!src.includes("#")) {
    data.coverStyle = null;
  } else {
    const { x, y, w, width, height } = getUrlParams(src);
    const scale = coverWidth / w;
    data.coverStyle = {
      width: `${width * scale}px`,
      height: `${height * scale}px`,
      translateX: `${-x * scale}px`,
      translateY: `${-y * scale}px`,
    };
  }
  data.src = src;
};

/** 获取 url 参数 */
const getUrlParams = (str: string) => {
  const paramsPart = str.split("#")[1];
  const params = paramsPart.split("&");
  const result: { [key: string]: number } = {};
  params.forEach((item) => {
    const [key, value] = item.split("=");
    result[key] = Number(value);
  });
  if (typeof result["r"] !== "number") result["r"] = 0;
  return result;
};

initCover();
</script>

<style lang="scss" scoped>
.cover-wrapper {
  position: relative;
  width: var(--width);
  height: calc(var(--width) * 0.75);
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    .modal {
      opacity: 1;

      & ~ .error-tag {
        opacity: 0;
      }
    }
  }

  .default-cover {
    width: 100%;
    height: 100%;
  }

  .modal {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;

    .freelog {
      font-size: 15px;
      color: #fff;
    }
  }
}
</style>
