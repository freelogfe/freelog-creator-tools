import { useStore } from "@/store";
import { OSSService } from "./request";
import Cookie from "@/utils/cookie";
import { I18N } from "@/typings/object";
import { Language } from "@/typings/type";

/** 获取 i18n 数据 */
export const getI18nData = async () => {
  const store = useStore();

  // 默认中文
  const language = Cookie.get("locale") || "zh-cn";
  store.language = language as Language;

  const i18n: I18N = { "en-us": {}, "zh-cn": {} };
  const data = await OSSService.getI18N();
  Object.keys(data).forEach((key: string) => {
    i18n["en-us"][key] = data[key].en_US;
    i18n["zh-cn"][key] = data[key].zh_CN;
  });
  store.i18n = i18n;
};

/** 获取 i18n 相应文案 */
export const I18n = (key: string, data?: Record<string, string | undefined>) => {
  const store = useStore();
  if (store.i18n && store.i18n[store.language]) {
    let copywriting = store.i18n[store.language][key];
    if (data) {
      Object.keys(data).forEach((item) => {
        const reg = new RegExp(`{${item}}`, "g");
        copywriting = copywriting.replace(reg, data[item] || "");
      });
    }
    return copywriting;
  } else {
    return "";
  }
};
