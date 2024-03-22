<!-- 列表骨架 loader -->

<template>
  <div class="list-skeleton-wrapper">
    <el-skeleton class="object-item" animated v-for="item in 5" :key="item">
      <template #template>
        <div class="object">
          <el-skeleton-item class="name" variant="p" />
          <el-skeleton-item class="info" variant="text" />
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style lang="scss" scoped>
.list-skeleton-wrapper {
  width: 100%;
  display: flex;
  flex-wrap: wrap;

  .object-item {
    .object {
      height: 70px;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .name {
        width: 300px;
        height: 20px;
      }

      .info {
        width: 150px;
        height: 17px;
        margin-top: 5px;
      }
    }
  }
}
</style>
