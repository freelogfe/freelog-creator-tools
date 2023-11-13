/**
 * 请求封装
 */

import axios, { AxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";
import { getRequestDomain } from "@/utils/common";

const Axios = async (url: string, config: AxiosRequestConfig, origin = false) => {
  if (!url.startsWith("http")) url = getRequestDomain() + url;

  const params = {
    url,
    headers: { "Content-Type": "application/json;charset=utf-8" },
    withCredentials: true,
    timeout: 30000,
    ...config,
  };
  const res = await axios(params);
  
  if (origin) return res;

  // 读取文件内容时，直接获取文件字符串，用于解决数字 Infinity 和 Json 等文件返回数据异常的问题
  if (res.headers["accept-ranges"] === "bytes") return res.request.response;

  // 数据不是对象时，直接返回
  if (res.data.toString() !== "[object Object]") return res.data;

  const keys = Object.keys(res.data);
  if (!keys.includes("errCode")) {
    return res.data;
  } else if (res.data.errCode === 0) {
    return res.data.data;
  } else {
    ElMessage.error(res.data.msg);
  }
};

export default Axios;
