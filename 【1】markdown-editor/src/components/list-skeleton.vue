<!-- 列表骨架 loader -->

<template>
  <div class="list-skeleton-wrapper">
    <template v-if="props.type === 'resource'">
      <el-skeleton class="resource-item" animated v-for="item in 4" :key="item">
        <template #template>
          <el-skeleton-item class="image" variant="image" />
          <el-skeleton-item class="name" variant="p" />
          <div class="info">
            <el-skeleton-item class="info-item" variant="text" />
            <el-skeleton-item class="info-item" variant="text" />
          </div>
          <el-skeleton-item class="tag" variant="text" />
        </template>
      </el-skeleton>
    </template>

    <template v-if="props.type === 'object'">
      <el-skeleton class="object-item" animated v-for="item in 5" :key="item">
        <template #template>
          <div class="object">
            <el-skeleton-item class="name" variant="p" />
            <el-skeleton-item class="info" variant="text" />
          </div>
        </template>
      </el-skeleton>
    </template>

    <template v-if="props.type === 'dep'">
      <el-skeleton class="dep-item" animated v-for="item in 8" :key="item">
        <template #template>
          <el-skeleton-item class="image" variant="image" />
          <div class="dep-info">
            <div class="info-top">
              <el-skeleton-item class="name" variant="p" />
              <el-skeleton-item class="info" variant="p" />
            </div>
            <el-skeleton-item class="policy" variant="text" />
          </div>
        </template>
      </el-skeleton>
    </template>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps(["type"]);
</script>

<style lang="scss" scoped>
.list-skeleton-wrapper {
  width: 100%;
  display: flex;
  flex-wrap: wrap;

  .resource-item {
    width: 300px;
    padding: 10px;
    box-sizing: border-box;
    margin-bottom: 30px;

    &:nth-child(2n) {
      margin-left: 40px;
    }

    .image {
      width: 280px;
      height: 210px;
    }

    .name {
      width: 80%;
      margin-top: 10px;
    }

    .info {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;

      .info-item {
        width: 50px;
      }
    }

    .tag {
      width: 100px;
      margin-top: 12px;
    }
  }

  .object-item {
    .object {
      height: 65px;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .name {
        width: 50%;
      }

      .info {
        width: 30%;
        margin-top: 5px;
      }
    }
  }

  .dep-item {
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;

    .image {
      width: 68px;
      height: 51px;
      border-radius: 4px;
    }

    .dep-info {
      width: 100%;
      display: flex;
      flex-direction: column;
      margin-left: 10px;

      .info-top {
        width: 100%;
        display: flex;
        justify-content: space-between;

        .name {
          width: 150px;
          height: 20px;
        }

        .info {
          width: 300px;
          height: 20px;
        }
      }

      .policy {
        width: 100px;
        height: 15px;
        border-radius: 4px;
        margin-top: 16px;
      }
    }
  }
}
</style>
