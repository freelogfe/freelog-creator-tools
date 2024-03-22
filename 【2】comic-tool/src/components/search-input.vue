<!-- 搜索输入框 -->

<template>
  <div class="search-input-wrapper">
    <i class="freelog fl-icon-content search-icon" />
    <input ref="searchInput" class="search-input" v-model="data.searchKey" :placeholder="props.placeholder" />
    <i class="freelog fl-icon-shibai clear-icon" v-show="data.searchKey" @click="clear" />
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "@/store";
import { ref, reactive, watch } from "vue";

const store = useStore();
const props = defineProps(["placeholder"]);

const searchInput = ref();

const data = reactive({
  searchKey: "",
  searchTimer: null as any,
});

/** 清空搜索框 */
const clear = () => {
  data.searchKey = "";
  searchInput.value.focus();
};

watch(
  () => data.searchKey,
  (cur) => {
    const searchKey = cur.trim();
    clearTimeout(data.searchTimer);
    data.searchTimer = setTimeout(() => {
      store.searchKey = searchKey;
      clearTimeout(data.searchTimer);
      data.searchTimer = null;
    }, 300);
  }
);
</script>

<style lang="scss" scoped>
.search-input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  padding-top: 2px;

  .search-input {
    width: 100%;
    height: 38px;
    border-radius: 38px;
    padding: 0 27px 0 33px;
    box-sizing: border-box;
    border: 1px solid rgba(0, 0, 0, 0.03);
    background-color: #f7f7f7;
    color: rgba(0, 0, 0, 0.85);
    font-size: 14px;
    transition: all 0.3s;

    &:hover {
      border-color: #40a9ff;
    }

    &:focus {
      border-color: #2784ff;
      background-color: #fff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }

  .search-icon {
    position: absolute;
    left: 11px;
    font-size: 18px;
    color: #8e8e93;
  }

  .clear-icon {
    position: absolute;
    right: 11px;
    color: rgba(0, 0, 0, 0.25);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s;
    animation: fade-in 0.2s ease-in-out;

    &:hover {
      color: rgba(0, 0, 0, 0.45);
    }
  }
}
</style>
