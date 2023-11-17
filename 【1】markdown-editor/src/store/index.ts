import { defineStore } from "pinia";
import { UserService } from "@/api/request";
import { reactive, shallowRef, toRefs } from "vue";
import { I18N, ResourceDraft, User } from "@/typings/object";
import Cookie from "@/utils/cookie";
import { getI18nData } from "@/api/I18n";
import { Language } from "@/typings/type";

export const useStore = defineStore("store", () => {
  const editor = shallowRef();

  const data = reactive({
    // 资源 id
    resourceId: "",
    // 主应用方法
    mainAppFuncs: null as any,
    // 当前登录用户数据
    userData: null as User | null,
    // 当前语言
    language: "" as Language,
    // i18n 配置数据
    i18n: null as I18N | null,
    // 资源草稿数据
    draftData: {} as ResourceDraft,
    // 资源数据
    resourceData: null as any,
    // markdown 内容
    markdown: "",
    // 编辑器方法
    editorFuncs: {} as any,
    // 依赖资源
    deps: [] as any[],
    // 上抛资源
    upcasts: [] as any[],
    // 内容依赖
    contentDeps: [] as string[],
    // 自动打开依赖授权弹窗
    relyIdAutoOpen: "",
    // 是否因为依赖变动需要更新内容
    updateBecauseRely: false,
    // 抽屉搜索关键词
    searchKey: "",
  });

  const methods = {
    /** 初始化 store */
    async initStoreData(props: any) {
      const env = process.env.NODE_ENV;
      console.log(`running in ${env}`);

      const myWindow: any = window;
      const POWERED_BY_QIANKUN = myWindow.__POWERED_BY_QIANKUN__;

      if (POWERED_BY_QIANKUN) {
        // 作为子应用运行，本地开发环境下使用 638eb1b501276f002e2d16fb 资源进行测试，非本地开发环境下使用主应用传递的资源
        const { resourceID, onChange_Saved, onClose } = props;
        data.resourceId = process.env.NODE_ENV === "development" ? "638eb1b501276f002e2d16fb" : resourceID;
        data.mainAppFuncs = { saveEditor: onChange_Saved, closeEditor: onClose };
      } else {
        // 独立运行时，使用 50060 账号与 638eb1b501276f002e2d16fb 资源进行测试
        Cookie.set("locale", "zh-cn");
        Cookie.set("uid", 50060);
        Cookie.set(
          "authInfo",
          "eyJhbGciOiJSU0EtU0hBMjU2IiwidHlwIjoiSldUIn0=.eyJ1c2VySWQiOjUwMDYwLCJ1c2VybmFtZSI6IlpodUMiLCJ1c2VyVHlwZSI6MSwibW9iaWxlIjoiMTc3Mjc0OTEzMjAiLCJlbWFpbCI6IiIsImlzcyI6Imh0dHBzOi8vaWRlbnRpdHkuZnJlZWxvZy5jb20iLCJzdWIiOiI1MDA2MCIsImF1ZCI6ImZyZWVsb2ctd2Vic2l0ZSIsImV4cCI6MTY5MzM2MzkzOCwiaWF0IjoxNjkyMDY3OTM4LCJqdGkiOiI0YTA1MjUwYmNmMWQ0NDYyOTNiMjhmMGI0YTUzZmJkZiJ9.9d597718f07e3489cd9f3ab0a89eb4a260febca6b1abb8175ed336a25051707252b0ef176f396e064fadbb7086945577fb9c285cea18a7f8e13cc30b872997d98a2d2b853786f886844c454e85f0683e5c09a0fc238ad7490d51f6d9c3ce1a6ec7f5f3c880daad97f34beadc888efa7fb27c46cfa2a5dde2e355a80e0e9e4c15"
        );
        data.resourceId = "638eb1b501276f002e2d16fb";

        // Cookie.set("uid", 50151);
        // Cookie.set(
        //   "authInfo",
        //   "eyJhbGciOiJSU0EtU0hBMjU2IiwidHlwIjoiSldUIn0=.eyJ1c2VySWQiOjUwMTUxLCJ1c2VybmFtZSI6Inp5YXV0b3IiLCJ1c2VyVHlwZSI6MSwibW9iaWxlIjoiIiwiZW1haWwiOiJ6eWF1dG9yQG1haWxpbmF0b3IuY29tIiwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS5mcmVlbG9nLmNvbSIsInN1YiI6IjUwMTUxIiwiYXVkIjoiZnJlZWxvZy13ZWJzaXRlIiwiZXhwIjoxNzAxNDgzMjg1LCJpYXQiOjE3MDAxODcyODUsImp0aSI6ImYwOGFjODhjNDIwMjQzMzE4ODg3NjllNGQ5OTcwZGNkIn0=.6b00db4bc70f6e581a0792116d637b87b8f0aa5c92b0b5409787099fa967e9fc19e6090ccb945d0b1d43e6784b178e8d29edecd7ef3dade3036ef2248bbf43567b49358f621366588a4dbe43d061cdbad3cbd3ef6e97e5b1450ae50d89da4e202046881f3fb81005c446fa62f808f4be0571c59bd359415a499cfe7c1b6cd076"
        // );
        // data.resourceId = "6555d44b475698002fa3f535";
      }

      const userData = await UserService.getUserData();
      if (userData) data.userData = userData;

      await getI18nData();
    },
  };

  return { editor, ...toRefs(data), ...methods };
});
