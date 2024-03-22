<!-- 预览组件 -->

<template>
  <transition name="fade-in">
    <div class="preview-box-wrapper" v-if="store.previewShow && data.mode[0]">
      <div class="content-paging-area" v-if="data.mode[0] === 'paging'">
        <!-- 条漫/页漫、双页模式、非跨页匹配、当前为首页时，首页左侧显示空屏 -->
        <div
          class="blank-screen"
          v-if="[1, 2].includes(data.previewMode) && data.mode[1] === 'double' && !data.amend && data.currentPage === 1"
        />
        <!-- 日漫、双页模式、页数不为1且当前为尾页/页数为1且跨页匹配时，尾页左侧显示空屏 -->
        <div
          class="blank-screen"
          v-if="
            data.previewMode === 3 &&
            data.mode[1] === 'double' &&
            ((data.previewList.length !== 1 && data.currentPage === data.previewList.length) ||
              (data.previewList.length === 1 && data.amend))
          "
        />
        <!-- 日漫、双页模式、跨页匹配/非跨页匹配且当前不为首页、当前页不为尾页时，当前页左侧显示下一页 -->
        <div
          class="content-image-box"
          v-if="
            data.previewMode === 3 &&
            data.mode[1] === 'double' &&
            (data.amend || (!data.amend && data.currentPage !== 1)) &&
            data.currentPage !== data.previewList.length
          "
        >
          <img class="content-img" :src="data.previewList[data.currentPage].base64" />
        </div>
        <!-- 当前页 -->
        <div class="content-image-box" :class="data.mode[1]">
          <img class="content-img" :src="data.previewList[data.currentPage - 1].base64" />
        </div>
        <!-- 条漫/页漫、双页模式、跨页匹配/非跨页匹配且当前不为首页、当前页不为尾页时，当前页右侧显示下一页 -->
        <div
          class="content-image-box"
          v-if="
            [1, 2].includes(data.previewMode) &&
            data.mode[1] === 'double' &&
            (data.amend || (!data.amend && data.currentPage !== 1)) &&
            data.currentPage !== data.previewList.length
          "
        >
          <img class="content-img" :src="data.previewList[data.currentPage].base64" />
        </div>
        <!-- 条漫/页漫、双页模式、页数不为1且当前为尾页/页数为1且跨页匹配时，尾页右侧显示空屏 -->
        <div
          class="blank-screen"
          v-if="
            [1, 2].includes(data.previewMode) &&
            data.mode[1] === 'double' &&
            ((data.previewList.length !== 1 && data.currentPage === data.previewList.length) ||
              (data.previewList.length === 1 && data.amend))
          "
        />
        <!-- 日漫、双页模式、非跨页匹配、当前为首页时，首页右侧显示空屏 -->
        <div
          class="blank-screen"
          v-if="data.mode[1] === 'double' && data.previewMode === 3 && !data.amend && data.currentPage === 1"
        />

        <!-- 
        普通模式下：
        - 当前页不是第一页
        日漫模式下：
        - 单页：当前页不是最后一页
        - 双页：
          - 非跨页匹配、当前页为第一页、页数大于一页时
          - 当前页不为倒数第二页时 
      -->
        <div
          class="pre-btn"
          @click="leftSwitchPage()"
          v-if="
            (data.mode[2] === 'normal' && data.currentPage !== 1) ||
            (data.mode[2] === 'manga' &&
              ((data.mode[1] === 'single' && data.currentPage < data.previewList.length) ||
                (data.mode[1] === 'double' &&
                  ((!data.amend && data.currentPage === 1 && data.previewList.length > 1) ||
                    data.currentPage + 1 < data.previewList.length))))
          "
        />

        <!-- 
        日漫模式下：
        - 当前页不是第一页
        普通模式下：
        - 单页：当前页不是最后一页
        - 双页：
          - 非跨页匹配、当前页为第一页、页数大于一页时
          - 当前页不为倒数第二页时 
      -->
        <div
          class="next-btn"
          @click="rightSwitchPage()"
          v-if="
            (data.mode[2] === 'manga' && data.currentPage !== 1) ||
            (data.mode[2] === 'normal' &&
              ((data.mode[1] === 'single' && data.currentPage < data.previewList.length) ||
                (data.mode[1] === 'double' &&
                  ((!data.amend && data.currentPage === 1 && data.previewList.length > 1) ||
                    data.currentPage + 1 < data.previewList.length))))
          "
        />
      </div>
      <div id="scrollArea" class="content-scroll-area" @scroll="scrollPage" v-else>
        <img class="scroll-img" :src="item.base64" v-for="(item, index) in data.previewList" :key="item.name + index" />
      </div>

      <div class="footer">
        <div class="pager">
          {{ I18n("cbformatter_preview_currentpage") }}
          <!-- 条漫/页漫、翻页模式、双页模式、非跨页匹配、当前为首页时，左侧显示空屏页码 -->
          <span
            class="page-number"
            v-if="
              [1, 2].includes(data.previewMode) &&
              data.mode[0] === 'paging' &&
              data.mode[1] === 'double' &&
              !data.amend &&
              data.currentPage === 1
            "
          >
            -
          </span>
          <!-- 日漫、翻页模式、双页模式、当前为尾页且不为第一页时，左侧显示空屏页码 -->
          <span
            class="page-number"
            v-if="
              data.previewMode === 3 &&
              data.mode[0] === 'paging' &&
              data.mode[1] === 'double' &&
              data.currentPage === data.previewList.length &&
              data.currentPage !== 1
            "
          >
            -
          </span>
          <!-- 日漫、翻页模式、双页模式、跨页匹配或非跨页匹配且当前不为首页时，左侧显示下一页页码 -->
          <span
            class="page-number"
            v-if="
              data.previewMode === 3 &&
              data.mode[0] === 'paging' &&
              data.mode[1] === 'double' &&
              (data.amend || (!data.amend && data.currentPage !== 1)) &&
              data.currentPage + 1 <= data.previewList.length
            "
          >
            {{ data.currentPage + 1 }}
          </span>
          <!-- 当前页页码 -->
          <span class="page-number">{{ data.currentPage }}</span>
          <!-- 条漫/页漫、翻页模式、双页模式、跨页匹配或非跨页匹配且当前不为首页时，右侧显示下一页页码 -->
          <span
            class="page-number"
            v-if="
              [1, 2].includes(data.previewMode) &&
              data.mode[0] === 'paging' &&
              data.mode[1] === 'double' &&
              (data.amend || (!data.amend && data.currentPage !== 1)) &&
              data.currentPage + 1 <= data.previewList.length
            "
          >
            {{ data.currentPage + 1 }}
          </span>
          <!-- 条漫/页漫、翻页模式、双页模式、当前为尾页且不为第一页时，右侧显示空屏页码 -->
          <span
            class="page-number"
            v-if="
              [1, 2].includes(data.previewMode) &&
              data.mode[0] === 'paging' &&
              data.mode[1] === 'double' &&
              data.currentPage === data.previewList.length &&
              data.currentPage !== 1
            "
          >
            -
          </span>
          <!-- 日漫、翻页模式、双页模式、非跨页匹配、当前为首页时，右侧显示空屏页码 -->
          <span
            class="page-number"
            v-if="
              data.previewMode === 3 &&
              data.mode[0] === 'paging' &&
              data.mode[1] === 'double' &&
              !data.amend &&
              data.currentPage === 1
            "
          >
            -
          </span>
          <!-- 翻页模式、双页模式时，显示跨页匹配按钮 -->
          <div
            class="amend ghost-btn"
            @click="switchAmend()"
            v-if="data.mode[0] === 'paging' && data.mode[1] === 'double'"
          >
            {{ I18n("cbformatter_preview_btn_changespread") }}
          </div>
        </div>
        <div class="jumper">
          <input class="page-number" v-model="data.jumpPage" @keyup="$event.key === 'Enter' && jump()" />
          <div class="page-total">/ {{ data.previewList.length }}</div>
          <div class="jump ghost-btn" @click="jump()">{{ I18n("cbformatter_preview_pagenation_jumpto") }}</div>
        </div>
        <div class="btn-box">
          <div class="mode ghost-btn" @click="data.modeMenuShow = !data.modeMenuShow">
            <i class="freelog fl-icon-shujia1" />
            {{ I18n("cbformatter_preview_changemode") }}
          </div>
          <div class="exit-btn" @click="store.previewShow = false">{{ I18n("cbformatter_preview_quit") }}</div>
        </div>

        <div class="mode-menu" v-if="data.modeMenuShow">
          <div
            class="group"
            v-for="(group, index) in data.mode[0] === 'paging' ? assetsData.modeMenu : [assetsData.modeMenu[0]]"
            :key="group.title"
          >
            <div class="title">{{ group.title }}</div>
            <div class="btns">
              <div
                class="btn"
                :class="{ active: data.mode.includes(btn.value) }"
                @click="changeMode(btn.value, index)"
                v-for="btn in group.btns"
                :key="btn.value"
              >
                {{ btn.label }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <transition name="fade-in">
        <div class="paging-tip" v-if="data.directionTipShow">
          <img class="img" src="../assets/images/left-to-right.png" v-if="data.mode[2] === 'normal'" />
          <img class="img" src="../assets/images/right-to-left.png" v-else />
          <div class="desc">{{ I18n("cbformatter_preview_fliptype_current") }}</div>
          <div class="direction">
            {{ I18n(`cbformatter_preview_${data.mode[2] === "normal" ? "normal" : "manga"}_msg`) }}
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { I18n } from "@/api/I18n";
import { useStore } from "@/store";
import { reactive, watch } from "vue";
import { ImgInComicTool } from "@/typings/object";
import { MAX_IMG_SIZE } from "@/utils/assets";

type modeType = "paging" | "scroll" | "single" | "double" | "normal" | "manga";

interface ModeMenu {
  title: string;
  btns: { label: string; value: modeType }[];
}

const store = useStore();

const assetsData = {
  /** 阅读模式菜单 */
  modeMenu: [
    {
      title: I18n("cbformatter_preview_readingmode"),
      btns: [
        { label: I18n("cbformatter_preview_readingmode_flipping"), value: "paging" },
        { label: I18n("cbformatter_preview_readingmode_scrolling"), value: "scroll" },
      ],
    },
    {
      title: I18n("cbformatter_preview_pagestyle"),
      btns: [
        { label: I18n("cbformatter_preview_pagestyle_single"), value: "single" },
        { label: I18n("cbformatter_preview_pagestyle_double"), value: "double" },
      ],
    },
    {
      title: I18n("cbformatter_preview_fliptype"),
      btns: [
        { label: I18n("cbformatter_preview_fliptype_normal"), value: "normal" },
        { label: I18n("cbformatter_preview_fliptype_manga"), value: "manga" },
      ],
    },
  ] as ModeMenu[],
};

const data = reactive({
  previewMode: 0,
  previewList: [] as ImgInComicTool[],
  currentPage: 1,
  jumpPage: 1,
  amend: false,
  mode: ["", "double", "normal"],
  modeMenuShow: false,
  directionTipShow: false,
  tipTimer: null as any,
  pagePointList: [] as number[],
});

/** 切换阅读模式 */
const changeMode = (value: modeType, index: number) => {
  if (data.mode.includes(value)) return;

  data.mode[index] = value;

  if (data.mode[0] === "paging") {
    // 页漫时，将选择的模式保存在本地
    localStorage.setItem("comicReadMode", JSON.stringify(data.mode));
  }

  if (value === "scroll") {
    getPointInScroll();
  } else if (index === 2) {
    showDirectionTip();
  }
};

/** 显示翻页方向提示 */
const showDirectionTip = () => {
  let time = 0;

  if (data.tipTimer) {
    clearTimeout(data.tipTimer);
    data.directionTipShow = false;
    time = 200;
  }

  setTimeout(() => {
    data.directionTipShow = true;
    data.tipTimer = setTimeout(() => {
      data.directionTipShow = false;
      data.tipTimer = null;
    }, 1500);
  }, time);
};

/** 左侧切换页面 */
const leftSwitchPage = () => {
  data.mode[2] === "normal" ? pageForward() : pageBackward();
};

/** 右侧切换页面 */
const rightSwitchPage = () => {
  data.mode[2] === "normal" ? pageBackward() : pageForward();
};

/** 向前翻页 */
const pageForward = () => {
  const pageType = data.mode[1];
  let offset = pageType === "single" ? 1 : 2;
  if (!data.amend && pageType === "double" && data.currentPage === 2) {
    // 非跨页匹配、双页模式、当前页为第二页时，仅向前一页
    offset = 1;
  }
  const page = data.currentPage - offset;
  data.currentPage = page;
  data.jumpPage = page;
};

/** 向后翻页 */
const pageBackward = () => {
  const pageType = data.mode[1];
  let offset = pageType === "single" ? 1 : 2;
  if (!data.amend && pageType === "double" && data.currentPage === 1) {
    // 非跨页匹配、双页模式、当前页为第一页时，仅向后一页
    offset = 1;
  }
  const page = data.currentPage + offset;
  data.currentPage = page;
  data.jumpPage = page;
};

/** 更改跨页匹配 */
const switchAmend = () => {
  data.amend = !data.amend;
  let page;
  if (data.currentPage === 1) {
    page = 1;
  } else if (data.amend) {
    page = data.currentPage === data.previewList.length ? data.currentPage - 1 : data.currentPage + 1;
  } else {
    page = data.currentPage - 1;
  }
  data.currentPage = page;
  data.jumpPage = page;
};

/** 跳转 */
const jump = () => {
  let jumpPageNum = Number(String(data.jumpPage).replace(/[^0-9]/g, ""));
  if (jumpPageNum < 1) {
    jumpPageNum = 1;
  } else if (jumpPageNum > data.previewList.length) {
    jumpPageNum = data.previewList.length;
  }
  let page = jumpPageNum;

  if (page === 1 && data.mode[0] === "paging") {
    data.currentPage = page;
    data.jumpPage = page;
    return;
  }

  if (data.mode[0] === "paging" && data.mode[1] === "double") {
    // 翻页模式、双页模式下，需对跳转页码进行修正
    if (data.amend) {
      // 跨页匹配时，页码显示双页的奇数页码
      page = jumpPageNum % 2 ? jumpPageNum : jumpPageNum - 1;
    } else {
      // 非跨页匹配时，页码显示双页的偶数页码
      page = jumpPageNum % 2 ? jumpPageNum - 1 : jumpPageNum;
    }
  } else if (data.mode[0] === "scroll") {
    const scrollArea = document.getElementById("scrollArea");
    scrollArea?.scrollTo({ top: data.pagePointList[page - 1] });
  }
  data.currentPage = page;
  data.jumpPage = page;
};

/** 滚动模式下获取每页的位置 */
const getPointInScroll = () => {
  setTimeout(() => {
    data.pagePointList = [];
    const elems = document.getElementsByClassName("scroll-img");
    [...elems].forEach((item: any) => {
      data.pagePointList.push(item.offsetTop);
    });
    jump();
  }, 0);
};

/** 滚动页面 */
const scrollPage = (e: any) => {
  const scrollArea = document.getElementById("scrollArea");
  const height = scrollArea?.clientHeight || 0;
  const offset = height * 0.3;
  let page = 1;
  const { scrollTop } = e.target;
  for (let i = 0; i < data.pagePointList.length; i++) {
    if (scrollTop + offset >= data.pagePointList[i]) {
      page = i + 1;
    } else {
      break;
    }
  }
  if (page !== data.currentPage) {
    data.currentPage = page;
    data.jumpPage = page;
  }
};

/** 打开预览 */
const openPreviewBox = () => {
  const { comicMode, imgList } = store;
  data.previewMode = comicMode || 2;

  if (comicMode === 1) {
    // 条漫时，自动选择滚动模式
    getPointInScroll();
    data.mode[0] = "scroll";
  } else {
    // 页漫/日漫/自定义漫画类型时，自动选择翻页模式（如本地有记录翻页模式的选择，优先取本地记录的模式）
    const comicReadMode = localStorage.getItem("comicReadMode");
    if (comicReadMode) {
      data.mode = JSON.parse(comicReadMode);
    } else {
      data.mode[0] = "paging";
    }
  }

  if (imgList.length === 0) {
    data.previewList = [];
    return;
  }

  const list: ImgInComicTool[] = [];
  imgList.forEach((item: ImgInComicTool) => {
    const { size, children } = item;
    if (size > MAX_IMG_SIZE) return;
    list.push(...(children ? children : [item]));
  });
  data.previewList = list;
};

/** 关闭预览 */
const closePreviewBox = () => {
  if (data.tipTimer) {
    clearTimeout(data.tipTimer);
    data.directionTipShow = false;
  }
  data.currentPage = 1;
  data.jumpPage = 1;
  data.modeMenuShow = false;
  data.mode = ["", "double", "normal"];
};

watch(
  () => store.previewShow,
  (cur) => {
    cur ? openPreviewBox() : closePreviewBox();
  }
);
</script>

<style lang="scss" scoped>
.preview-box-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  z-index: 10;

  .content-paging-area {
    position: relative;
    width: 100%;
    flex: 1;
    height: 0;
    display: flex;

    .blank-screen {
      flex: 1;
      width: 0;
      height: 100%;
    }

    .content-image-box {
      flex: 1;
      width: 0;
      height: 100%;
      display: flex;
      animation: fade-in 0.1s linear;

      &:first-child {
        justify-content: flex-end;
      }

      &:last-child {
        justify-content: flex-start;
      }

      &.single {
        justify-content: center;
      }

      .content-img {
        height: 100%;
        max-width: 100%;
        object-fit: contain;
      }
    }

    .pre-btn {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 50%;
      cursor: url(../assets/images/pre-mouse.png), auto;
    }

    .next-btn {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      right: 0;
      cursor: url(../assets/images/next-mouse.png), auto;
    }
  }

  .content-scroll-area {
    width: 100%;
    flex: 1;
    height: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-thumb {
      width: 10px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.35);

      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }

    &::-webkit-scrollbar-track {
      border-radius: 10px;
    }

    .scroll-img {
      width: 800px;
    }
  }

  .footer {
    position: relative;
    width: 100%;
    height: 70px;
    background: #4f4f4f;
    padding: 0 40px;
    box-sizing: border-box;
    display: flex;
    align-items: center;

    .pager {
      flex: 1;
      font-size: 14px;
      color: #ffffff;
      display: flex;
      align-items: center;

      .page-number {
        width: 30px;
        height: 38px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #ffffff;
        margin-left: 10px;

        & + .page-number {
          margin-left: 5px;
        }
      }

      .amend {
        margin-left: 20px;
      }
    }

    .jumper {
      display: flex;
      align-items: center;

      .page-number {
        width: 40px;
        height: 32px;
        background: #ffffff;
        border-radius: 4px;
        border: none;
        outline: none;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #222;
        margin-left: 10px;
      }

      .page-total {
        font-size: 14px;
        color: #999999;
        line-height: 20px;
        margin-left: 5px;
      }

      .jump {
        margin-left: 20px;
      }
    }

    .btn-box {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .mode {
        display: flex;
        align-items: center;

        .freelog {
          margin-right: 5px;
          font-weight: normal;
        }
      }

      .exit-btn {
        padding: 6px 15px;
        background: #2784ff;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
        line-height: 20px;
        margin-left: 20px;
        cursor: pointer;

        &.disabled {
          opacity: 0.4;
          pointer-events: none;
        }

        &:hover {
          background: #529dff;
        }

        &:active {
          background: #2376e5;
        }
      }
    }

    .mode-menu {
      position: absolute;
      right: 91px;
      bottom: 80px;
      width: 247px;
      padding: 20px;
      box-sizing: border-box;
      background: #4f4f4f;
      box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
      border-radius: 10px;

      .group {
        & + .group {
          margin-top: 25px;
        }

        .title {
          font-size: 12px;
          color: #999999;
          line-height: 17px;
        }

        .btns {
          margin-top: 15px;
          display: flex;

          .btn {
            flex: 1;
            height: 38px;
            background: transparent;
            border-radius: 4px;
            border: 1px solid #999999;
            font-size: 14px;
            font-weight: 600;
            color: #999999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.1s ease;
            cursor: pointer;

            &:hover {
              border: 1px solid #fff;
              color: #fff;
            }

            &:active,
            &.active {
              border: 1px solid #2784ff;
              color: #2784ff;
            }

            & + .btn {
              margin-left: 15px;
            }
          }
        }
      }
    }
  }

  .paging-tip {
    position: fixed;
    bottom: 150px;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    height: 220px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 10px;
    backdrop-filter: blur(2px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .img {
      width: 110px;
      height: 60px;
    }

    .desc {
      font-size: 14px;
      color: #c7c7c7;
      line-height: 20px;
      margin-top: 28px;
    }

    .direction {
      font-size: 24px;
      font-weight: 600;
      color: #ffffff;
      line-height: 33px;
      margin-top: 19px;
    }
  }

  .ghost-btn {
    padding: 6px 15px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    line-height: 20px;
    cursor: pointer;

    &:hover {
      color: rgba(255, 255, 255, 1);
      background: rgba(255, 255, 255, 0.2);
    }

    &:active {
      color: rgba(255, 255, 255, 0.7);
      background: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
