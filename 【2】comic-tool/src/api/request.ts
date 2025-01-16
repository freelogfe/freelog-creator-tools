/**
 * 服务器接口
 */
import { ResourceDraft } from "@/typings/object";
import Axios from "./http";
import {
  BatchContractsParams,
  CollectionResourceListParams,
  CreateObjectParams,
  ObjectListParams,
  ResourceDataBatchParams,
  ResourceListParams,
} from "@/typings/params";
import { AxiosRequestConfig } from "axios";

/** User 类接口 */
export class UserService {
  /** 获取当前登录用户数据 */
  static getUserData() {
    return Axios("/v2/users/current", { method: "GET" });
  }
}

/** OSS 类接口 */
export class OSSService {
  /** 获取 i18n 数据 */
  static getI18N() {
    const productionEnv = process.env.NODE_ENV === "production";
    const url = `https://freelog-i18n.oss-cn-shenzhen.aliyuncs.com/configs${
      productionEnv ? "" : "-test"
    }/i18n.json?timestamp=${Date.now()}`;
    return Axios(url, { method: "GET", withCredentials: false });
  }
}

/** Resource 类接口 */
export class ResourceService {
  /** 获取资源数据 */
  static getResourceData(idOrName: string) {
    return Axios(`/v2/resources/${encodeURIComponent(idOrName)}`, { method: "GET" });
  }

  /** 获取资源草稿数据 */
  static getResourceDraftData(id: string) {
    return Axios(`/v2/resources/${id}/versions/drafts`, { method: "GET" });
  }

  /** 保存资源草稿数据 */
  static saveResourceDraftData(id: string, draftData: ResourceDraft, config: AxiosRequestConfig = {}) {
    return Axios(`/v2/resources/${id}/versions/drafts`, {
      method: "POST",
      data: { resourceId: id, draftData },
      ...config,
    });
  }

  /** 获取资源版本列表 */
  static getResourceVersions(resourceId: string, params?: { projection: string; sort: string }) {
    return Axios(`/v2/resources/${resourceId}/versions`, { method: "GET", params });
  }

  /** 获取资源版本文件 */
  static getResourceFile(resourceId: string, version: string, config: AxiosRequestConfig = {}) {
    return Axios(`/v2/resources/${resourceId}/versions/${version}/download`, { method: "GET", ...config });
  }

  /** 获取资源标准属性 */
  static getAttrsByCode(params: { code: string }) {
    return Axios(`/v2/resources/types/getAttrsByCode`, { method: "GET", params });
  }

  /** 获取资源版本文件(仅admin后台可用) */
  static getResourceFileAdmin(versionId: string, config?: AxiosRequestConfig) {
    return Axios(`/v2/resources/versions/${versionId}/internalClientDownload`, { method: "GET", ...config })
  }
}

/** Storage 类接口 */
export class StorageService {
  /** 获取存储对象 */
  static getStorageFile(sha1: string, config: AxiosRequestConfig = {}, origin = false) {
    return Axios(`/v2/storages/files/${sha1}/download`, { method: "GET", ...config }, origin);
  }

  /** 上传存储对象 */
  static uploadStorageFile(fileData: { file: File; extParams?: { metaInfo: any } }, config: AxiosRequestConfig = {}) {
    const data = new FormData();
    data.append("file", fileData.file);
    if (fileData.extParams) {
      const extParams = btoa(JSON.stringify(fileData.extParams));
      data.append("extParams", extParams);
    }

    return Axios(`/v2/storages/files/upload`, {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data" },
      data,
      ...config,
    });
  }

  /** 批量上传存储对象 */
  static uploadStorageFileBatch(formData: FormData, config: AxiosRequestConfig = {}) {
    return Axios(`/v2/storages/files/uploadFileMulti`, {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data" },
      data: formData,
      ...config,
    });
  }

  /** 压缩文件 */
  static compressFiles(sha1Array: { fileName: string; sha1: string }[], config: AxiosRequestConfig = {}) {
    return Axios(`/v2/storages/files/compressFiles`, { method: "POST", data: { sha1Array }, ...config });
  }

  /** 获取存储空间列表 */
  static getStorageBucketList(bucketType: 0 | 1 | 2) {
    return Axios(`/v2/storages/buckets`, { method: "GET", params: { bucketType } });
  }

  /** 获取存储对象 */
  static getStorageObjectList(params: ObjectListParams) {
    return Axios(`/v2/storages/buckets/${params.bucketName}/objects`, { method: "GET", params });
  }

  /** 创建存储空间 */
  static createBucket(bucketName: string) {
    return Axios(`/v2/storages/buckets`, { method: "POST", data: { bucketName } });
  }

  /** 获取存储空间名称是否存在 */
  static getBucketIsExist(bucketName: string) {
    return Axios(`/v2/storages/buckets/${bucketName}/isExist`, { method: "GET" });
  }

  /** 获取存储空间内存情况 */
  static getBucketSpace() {
    return Axios(`/v2/storages/buckets/spaceStatistics`, { method: "GET" });
  }

  /** 查询存储对象 */
  static searchObject(fullObjectNames: string) {
    return Axios(`/v2/storages/objects/list`, { method: "GET", params: { fullObjectNames } });
  }

  /** 创建存储对象 */
  static createObject(data: CreateObjectParams) {
    return Axios(`/v2/storages/buckets/${data.bucketName}/objects`, { method: "POST", data });
  }

  /** 获取存储对象文件内容 */
  static getObjectFile(objectId: string, config: AxiosRequestConfig = {}) {
    return Axios(`/v2/storages/objects/${objectId}/file`, { method: "GET", ...config });
  }
}
