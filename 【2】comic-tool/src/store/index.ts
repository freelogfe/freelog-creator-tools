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
    /** 当前的模式: (默认)normal => 可创任务; preview => 仅预览(只读, 需禁用保存的相关功能) */
    appMode: "normal",
    /** 当前版本 */
    version: ""
  });

  const methods = {
    /** 初始化 store */
    async initStoreData(props: any) {
      const env = process.env.NODE_ENV;
      console.log(`comic tool running in ${env}`);
      const myWindow: any = window;
      const POWERED_BY_QIANKUN = myWindow.__POWERED_BY_QIANKUN__;
      const POWERED_BY_MICRO_APP = myWindow.__MICRO_APP_ENVIRONMENT__;

      if (POWERED_BY_QIANKUN) {
        // 作为乾坤子应用运行
        const { resourceID, onChange_Saved, onClose, appMode, onGlobalStateChange, version } = props;
        data.resourceId = resourceID;
        data.mainAppFuncs = { save: onChange_Saved, close: onClose };
        if (appMode) {
          data.version = version
          data.appMode = appMode
        }

        onGlobalStateChange((state: any, pre: any) => {
          const { appMode } = state
          data.version = version
          data.appMode = appMode
          methods.initStoreData({
            ...props,
            version,
            appMode
          })
        })
      } else if (POWERED_BY_MICRO_APP) {
        // 作为京东子应用运行
        const props = (window as any).microApp.getData()
        const { resourceID, onChange_Saved, onClose, appMode, version } = props;
        data.resourceId = resourceID;
        data.mainAppFuncs = { save: onChange_Saved, close: onClose };
        if (appMode) {
          data.version = version
          data.appMode = appMode
        }

        (window as any).microApp.addDataListener((state: any) => {
          const { appMode } = state
          data.version = version
          data.appMode = appMode
          methods.initStoreData({
            ...props,
            version,
            appMode
          })
        })
      } else {
        console.log("独立运行");
        // 独立运行
        Cookie.set("uid", 50031);
        Cookie.set(
          "authInfo",
          "eyJhbGciOiJSU0EtU0hBMjU2IiwidHlwIjoiSldUIn0=.eyJ1c2VySWQiOjUwMDMxLCJ1c2VybmFtZSI6IkZyZWVsb2ciLCJ1c2VyVHlwZSI6MSwibW9iaWxlIjoiIiwiZW1haWwiOiJzdXBwb3J0QGZyZWVsb2cuY29tIiwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5mcmVlbG9nLmNvbSIsInN1YiI6IjUwMDMxIiwiYXVkIjoiZnJlZWxvZy13ZWJzaXRlIiwiZXhwIjoxNjQ4Mjc2ODcyLCJpYXQiOjE2NDY5ODA4NzIsImp0aSI6ImVlYmViMTM1YzJmOTRkZDA4MDNmZTQxNTVjMmViNzQ5In0=.1b4db7b00a710f3b84d877485c80fc1ae7d4453bbb37a07e578b7cfc1b63b72b30db623b2b58e3b1163ac730cd554bb45017a6653f03ecda36870b4b7d252023f3e8fe4c2246a4c32174bd4da869a8c7ee22e0bddab128e5515c4a2816a48942252670a7689fff74a3fa506d673681c669ea4109315e5cd95136e84ef7e7b80b"
        );
        data.resourceId = "6498fa40c74cb3002e500306";
      }

      const userData = await UserService.getUserData();
      if (userData) data.userData = userData;

      await getI18nData();
    },
  };

  return { editor, ...toRefs(data), ...methods };
});
