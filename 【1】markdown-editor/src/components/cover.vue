<!-- 资源卡片封面 -->

<template>
  <div class="cover-wrapper" :style="{ '--width': coverWidth + 'px' }">
    <img
      v-lazy="props.src"
      :style="{
        width: data.coverStyle.width,
        height: data.coverStyle.height,
        transform: `translateX(${data.coverStyle.translateX}) translateY(${data.coverStyle.translateY})`,
      }"
      v-if="data.coverStyle"
    />
    <img class="default-cover" v-lazy="props.src" v-else-if="props.src" />
    <img class="default-cover" :src="DEFAULT_COVER" v-else />
  </div>
</template>

<script lang="ts" setup>
import { DEFAULT_COVER } from "@/assets/data";
import { CoverStyleData } from "@/typings/object";
import { reactive, watch } from "vue";

const props = defineProps(["src", "width"]);
const coverWidth = props.width || 280;

const data = reactive({
  coverStyle: null as CoverStyleData | null,
});

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

watch(
  () => props.src,
  (cur) => {
    if (!cur || typeof cur !== "string") return;

    if (!cur.includes("#")) {
      data.coverStyle = null;
    } else {
      const { x, y, w, width, height } = getUrlParams(cur);
      const scale = coverWidth / w;
      data.coverStyle = {
        width: `${width * scale}px`,
        height: `${height * scale}px`,
        translateX: `${-x * scale}px`,
        translateY: `${-y * scale}px`,
      };
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.cover-wrapper {
  width: var(--width);
  height: calc(var(--width) * 0.75);
  border-radius: 4px;
  overflow: hidden;

  .default-cover {
    width: 100%;
    height: 100%;
  }
}
</style>
