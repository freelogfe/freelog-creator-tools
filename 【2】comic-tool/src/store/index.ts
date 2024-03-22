import { defineStore } from "pinia";
import { UserService } from "@/api/request";
import { reactive, shallowRef, toRefs } from "vue";
import { I18N, ImgInComicTool, Resource, ResourceDraft, User } from "@/typings/object";
import Cookie from "@/utils/cookie";
import { getI18nData } from "@/api/I18n";
import { Language } from "@/typings/type";

export const useStore = defineStore("store", () => {
  const editor = shallowRef();

  const data = reactive({
    /** 主应用方法 */
    mainAppFuncs: null as any,
    /** 当前语言 */
    language: "" as Language,
    /** i18n 配置数据 */
    i18n: null as I18N | null,
    /** 当前登录用户数据 */
    userData: null as User | null,
    /** 资源 id */
    resourceId: "",
    /** 资源数据 */
    resourceData: {} as Resource,
    /** 资源草稿数据 */
    draftData: {} as ResourceDraft,
    /** 漫画类型 1-条漫 2-页漫 3-日漫 */
    comicMode: 0,
    /** 加载 loader */
    loaderShow: false,
    /** 是否已编辑未保存 */
    edited: null as boolean | null,
    /** 图片列表 */
    imgList: [] as ImgInComicTool[],
    /** 漫画配置 */
    comicConfig: null as any,
    /** 拖动图片中 */
    dragging: false,
    /** 图片区域自动滚动到底部 */
    autoScroll: false,
    /** 待删除图片 */
    deleteItem: null as any,
    /** 删除确认弹窗显示 */
    deleteConfirmShow: false,
    /** 插入图片索引 */
    insertIndex: -1,
    /** 切图详情弹窗显示 */
    viewCutImagesDrawerShow: false,
    /** 切图详情图片组数据 */
    cutImagesToView: [] as ImgInComicTool[],
    /** 预览弹窗显示 */
    previewShow: false,
    /** 导入弹窗显示 */
    importDrawerShow: false,
    /** 抽屉搜索关键词 */
    searchKey: "",
  });

  const methods = {
    /** 初始化 store */
    async initStoreData(props: any) {
      const env = process.env.NODE_ENV;
      console.log(`comic tool running in ${env}`);

      const myWindow: any = window;
      const POWERED_BY_QIANKUN = myWindow.__POWERED_BY_QIANKUN__;

      if (POWERED_BY_QIANKUN) {
        // 作为子应用运行
        const { resourceID, onChange_Saved, onClose } = props;
        data.resourceId = resourceID;
        data.mainAppFuncs = { save: onChange_Saved, close: onClose };
      } else {
        // 独立运行
        Cookie.set("uid", 50060);
        Cookie.set(
          "authInfo",
          "eyJhbGciOiJSU0EtU0hBMjU2IiwidHlwIjoiSldUIn0=.eyJ1c2VySWQiOjUwMDYwLCJ1c2VybmFtZSI6IlpodUMiLCJ1c2VyVHlwZSI6MSwibW9iaWxlIjoiMTc3Mjc0OTEzMjAiLCJlbWFpbCI6IiIsImlzcyI6Imh0dHBzOi8vaWRlbnRpdHkuZnJlZWxvZy5jb20iLCJzdWIiOiI1MDA2MCIsImF1ZCI6ImZyZWVsb2ctd2Vic2l0ZSIsImV4cCI6MTY5MzM2MzkzOCwiaWF0IjoxNjkyMDY3OTM4LCJqdGkiOiI0YTA1MjUwYmNmMWQ0NDYyOTNiMjhmMGI0YTUzZmJkZiJ9.9d597718f07e3489cd9f3ab0a89eb4a260febca6b1abb8175ed336a25051707252b0ef176f396e064fadbb7086945577fb9c285cea18a7f8e13cc30b872997d98a2d2b853786f886844c454e85f0683e5c09a0fc238ad7490d51f6d9c3ce1a6ec7f5f3c880daad97f34beadc888efa7fb27c46cfa2a5dde2e355a80e0e9e4c15"
        );
        data.resourceId = "659ba8b34d1119002edfa548";
      }

      const userData = await UserService.getUserData();
      if (userData) data.userData = userData;

      await getI18nData();
    },
  };

  return { editor, ...toRefs(data), ...methods };
});
