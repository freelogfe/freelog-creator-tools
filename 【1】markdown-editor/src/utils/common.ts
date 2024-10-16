/** 公共方法 */

import * as CryptoJS from "crypto-js";

/**
 * 格式化日期
 * @param time 时间戳、字符串日期等等
 * @param format 自定义输出结果格式（YYYY:年，MM:月，DD:日，hh:时，mm:分，ss:秒）
 */
export const formatDate = (time: number | string, format = "YYYY-MM-DD hh:mm:ss") => {
  if (!time) return "";

  const date = new Date(time);

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const result = format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("hh", hour)
    .replace("mm", minutes)
    .replace("ss", seconds);

  return result;
};

/** 解析资源文件路径参数 */
export const hashImgUrl = (str: string) => {
  let params = str.split("#")[1];
  let param = params.split("&");
  let obj: { [key: string]: number } = {};
  for (const kv of param) {
    let [key, value] = kv.split("=");
    obj[key] = Number(value);
  }
  if (typeof obj["r"] !== "number") {
    obj["r"] = 0;
  }

  return obj;
};

/** 获取请求域名 */
export const getRequestDomain = () => {
  const env = process.env.VUE_APP_ENV;
  const domain = env === "development" ? "/api" : process.env.VUE_APP_BASE_API;

  return domain;
};

/** 获取对应环境域名 */
export const getDomain = (firstDomain?: string) => {
  const env = process.env.NODE_ENV;
  let domain = env === "production" ? "//console.freelog.com" : "//console.testfreelog.com";
  if (firstDomain) domain = domain.replace("console", firstDomain);

  return domain;
};

/** 数组转字符串 */
export const arr2Str = (arr: string[], divider = ",") => {
  const result = arr.join(divider);

  return result;
};

/** 格式化大小 */
export function formatSize(bytes: number): string {
  if (bytes <= 0) return "0 B";

  const unitArr = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = Math.round((bytes / Math.pow(1024, index)) * 100) / 100;

  return size + " " + unitArr[index];
}

/** 根据 File 获取 Sha1 */
export const getFileSha1 = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader: FileReader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      if (!reader.result) {
        resolve("");
        return "";
      }
      if (typeof reader.result === "string") {
        resolve("");
        return "";
      }
      const sha1: string = await self.crypto.subtle.digest("SHA-1", <any>reader.result).then((a) =>
        Array.from(new Uint8Array(a))
          .map((a) => a.toString(16).padStart(2, "0"))
          .join("")
      );
      resolve(sha1);
      return "";
    };
  });
};

/** 跳转详情页 */
export const toDetail = (id: string) => {
  window.open(`${getDomain()}/resource/details/${id}`);
};

/** 休眠 */
export const sleep = (time: number = 300): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};
