import { defineStore } from "pinia";
import { UserService } from "@/api/request";
import { reactive, shallowRef, toRefs, version } from "vue";
import { I18N, ResourceDraft, User } from "@/typings/object";
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
    resourceData: null as any,
    /** 资源草稿数据 */
    draftData: {} as ResourceDraft,
    /** 编辑器方法 */
    editorFuncs: {} as any,
    /** markdown 内容 */
    markdown: "",
    /** 内容依赖 */
    dependencesInContent: [] as string[],
    /** 是否因为依赖变动需要更新内容 */
    updateBecauseRely: false,
    /** 抽屉搜索关键词 */
    searchKey: "",
    /** 授权处理子应用 */
    authorizationProcessor: null as any,
    /** 当前的模式: (默认)normal => 可创任务; preview => 仅预览(只读, 需禁用保存的相关功能) */
    appMode: "normal",
    /** 当前版本 */
    version: ""
  });

  const methods = {
    /** 初始化 store */
    async initStoreData(props: any) {
      const env = process.env.NODE_ENV;
      console.log(`markdown editor running in ${env}`);

      const myWindow: any = window;
      const POWERED_BY_QIANKUN = myWindow.__POWERED_BY_QIANKUN__;

      if (POWERED_BY_QIANKUN) {
        // 作为子应用运行
        const { resourceID, onChange_Saved, onClose, appMode, version } = props;
        data.resourceId = resourceID;
        data.mainAppFuncs = { saveEditor: onChange_Saved, closeEditor: onClose };
        if (appMode) {
          data.appMode = appMode
          data.version = version
        }
      } else {
        // 独立运行
        Cookie.set("uid", 50060);
        Cookie.set(
          "authInfo",
          "eyJhbGciOiJSU0EtU0hBMjU2IiwidHlwIjoiSldUIn0=.eyJ1c2VySWQiOjUwMDYwLCJ1c2VybmFtZSI6IlpodUMiLCJ1c2VyVHlwZSI6MSwibW9iaWxlIjoiMTc3Mjc0OTEzMjAiLCJlbWFpbCI6IiIsImlzcyI6Imh0dHBzOi8vaWRlbnRpdHkuZnJlZWxvZy5jb20iLCJzdWIiOiI1MDA2MCIsImF1ZCI6ImZyZWVsb2ctd2Vic2l0ZSIsImV4cCI6MTY5MzM2MzkzOCwiaWF0IjoxNjkyMDY3OTM4LCJqdGkiOiI0YTA1MjUwYmNmMWQ0NDYyOTNiMjhmMGI0YTUzZmJkZiJ9.9d597718f07e3489cd9f3ab0a89eb4a260febca6b1abb8175ed336a25051707252b0ef176f396e064fadbb7086945577fb9c285cea18a7f8e13cc30b872997d98a2d2b853786f886844c454e85f0683e5c09a0fc238ad7490d51f6d9c3ce1a6ec7f5f3c880daad97f34beadc888efa7fb27c46cfa2a5dde2e355a80e0e9e4c15"
        );
        data.resourceId = "655dba385ecea7002f3fb81f";
      }

      const userData = await UserService.getUserData();
      if (userData) data.userData = userData;

      await getI18nData();
    },
  };

  return { editor, ...toRefs(data), ...methods };
});
