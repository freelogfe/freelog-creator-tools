<!-- 抽屉资源列表 -->

<template>
  <div class="drawer-resource-list-wrapper">
    <div class="input-area">
      <SearchInput :placeholder="I18n('insert_frommarket_searchbar_hint')" />
    </div>

    <ListSkeleton class="skeleton" type="resource" v-if="data.loading" />

    <template v-else>
      <el-scrollbar v-if="data.list.length !== 0">
        <div class="resource-list" v-infinite-scroll="getResourceList" :infinite-scroll-immediate="false">
          <ResourceCard class="list-item" :data="item" v-for="item in data.list" :key="item.resourceId" />
        </div>
      </el-scrollbar>

      <NoData v-else-if="data.noMore" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { ResourceService } from "@/api/request";
import { useStore } from "@/store";
import { Resource } from "@/typings/object";
import { nextTick, reactive, watch } from "vue";
import SearchInput from "@/components/search-input.vue";
import ListSkeleton from "@/components/list-skeleton.vue";
import NoData from "@/components/no-data.vue";
import ResourceCard from "@/components/resource-card.vue";

const store = useStore();
const props = defineProps(["active", "from", "type"]);

/** 列表每页数量 */
const COUNT_PER_PAGE = 20;
/** 资源请求类型映射 */
const REQUEST_TYPE_MAPPING: Record<string, string> = { image: "照片,插画", audio: "音频", video: "视频", text: "文章" };

const data = reactive({
  list: [] as Resource[],
  page: -1,
  noMore: false,
  loading: false,
  searchDisabled: false,
});

/** 重置列表数据 */
const resetData = () => {
  data.list = [];
  data.page = -1;
  data.noMore = false;
};

/** 获取资源列表 */
const getResourceList = (init = false) => {
  if (init) {
    data.list = [];
    data.page = 0;
    data.noMore = false;
    data.loading = true;
  } else if (data.noMore) {
    return;
  } else {
    data.page++;
  }

  const REQUEST_FUNC_MAPPING: Record<string, Function> = {
    market: getFromMarket,
    mine: getFromMine,
    collection: getFromCollection,
  };
  const func = REQUEST_FUNC_MAPPING[props.from];
  func();
};

/** 获取资源市场 */
const getFromMarket = async () => {
  const params = {
    skip: data.page * COUNT_PER_PAGE,
    limit: COUNT_PER_PAGE,
    keywords: store.searchKey,
    resourceType: REQUEST_TYPE_MAPPING[props.type],
    status: 1,
  };
  const res = await ResourceService.getResourceList(params);
  if (!res) return;

  const { dataList, totalItem } = res;
  data.list = [...data.list, ...dataList];
  data.noMore = data.list.length === totalItem;
  data.loading = false;
};

/** 获取我的资源 */
const getFromMine = async () => {
  const params = {
    skip: data.page * COUNT_PER_PAGE,
    limit: COUNT_PER_PAGE,
    keywords: store.searchKey,
    resourceType: REQUEST_TYPE_MAPPING[props.type],
    isSelf: 1,
    status: 1,
  };
  const res = await ResourceService.getResourceList(params);
  if (!res) return;

  const { dataList, totalItem } = res;
  data.list = [...data.list, ...dataList];
  data.noMore = data.list.length === totalItem;
  data.loading = false;
};

/** 获取我的收藏 */
const getFromCollection = async () => {
  const collectionParams = {
    skip: data.page * COUNT_PER_PAGE,
    limit: COUNT_PER_PAGE,
    keywords: store.searchKey,
    resourceType: REQUEST_TYPE_MAPPING[props.type],
    resourceStatus: 1,
  };
  const collectionRes = await ResourceService.getCollectionResourceList(collectionParams);
  if (!collectionRes) return;

  const { dataList, totalItem } = collectionRes;
  if (dataList.length) {
    const resourceParams = {
      resourceIds: dataList.map((item: { resourceId: string }) => item.resourceId).join(),
    };
    const resourceRes = await ResourceService.getResourceDataBatch(resourceParams);
    if (!resourceRes) return;

    data.list = [...data.list, ...resourceRes];
  }
  data.noMore = data.list.length === totalItem;
  data.loading = false;
};

watch(
  () => props.active,
  (cur) => {
    data.searchDisabled = true;
    if (cur) store.searchKey = "";
    cur ? getResourceList(true) : resetData();
    nextTick(() => {
      data.searchDisabled = false;
    });
  },
  { immediate: true }
);

watch(
  () => store.searchKey,
  () => {
    if (props.active && !data.searchDisabled) getResourceList(true);
  }
);
</script>

<style lang="scss" scoped>
.drawer-resource-list-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep .no-data-wrapper {
    height: calc(100vh - 220px);

    .no-data-tip {
      margin-top: calc((100vh - 220px - 148px) / 5 * 2);
    }
  }

  .input-area {
    width: 100%;
    padding: 0 30px;
    box-sizing: border-box;
    margin-bottom: 30px;
  }

  .skeleton {
    width: 100%;
    padding: 0 30px;
    box-sizing: border-box;
  }

  .resource-list {
    flex: 1;
    width: 100%;
    padding: 0 30px 30px;
    box-sizing: border-box;

    .list-item + .list-item {
      margin-top: 10px;
    }
  }
}
</style>
