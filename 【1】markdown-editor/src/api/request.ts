/**
 * 服务器接口
 */
import { ResourceDraft } from "@/typings/object";
import Axios from "./http";
import {
  BatchContractsParams,
  CollectionResourceListParams,
  ContractsParams,
  CreateObjectParams,
  ListParams,
  ObjectListParams,
  PayContractParams,
  ResourceDataBatchParams,
  ResourceListParams,
  createContractBatchParams,
} from "@/typings/params";
import { AxiosRequestConfig } from "axios";

/** User 类接口 */
export class UserService {
  /** 获取当前登录用户数据 */
  static getUserData() {
    return Axios("/v2/users/current", { method: "GET" });
  }

  /** 批量获取用户数据 */
  static getUserDataBatch(userIds: string) {
    return Axios("/v2/users/list", { method: "GET", params: { userIds } });
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

  /** 批量获取资源数据 */
  static getResourceDataBatch(params: ResourceDataBatchParams) {
    return Axios(`/v2/resources/list`, { method: "GET", params });
  }

  /** 获取资源草稿数据 */
  static getResourceDraftData(id: string) {
    return Axios(`/v2/resources/${id}/versions/drafts`, { method: "GET" });
  }

  /** 保存资源草稿数据 */
  static saveResourceDraftData(id: string, draftData: ResourceDraft) {
    return Axios(`/v2/resources/${id}/versions/drafts`, { method: "POST", data: { resourceId: id, draftData } });
  }

  /** 获取资源版本数据 */
  static getResourceVersionData(id: string, version: string) {
    return Axios(`/v2/resources/${id}/versions/${version}`, { method: "GET" });
  }

  /** 获取资源授权状态 */
  static getResourceAuthBatch(resourceIds: string) {
    return Axios(`/v2/auths/resources/batchAuth/results`, { method: "GET", params: { resourceIds } });
  }

  /** 获取资源依赖树 */
  static getResourceDependencyTree(id: string, version: string) {
    return Axios(`/v2/resources/${id}/dependencyTree`, { method: "GET", params: { version } });
  }

  /** 获取资源列表 */
  static getResourceList(params: ResourceListParams) {
    return Axios(`/v2/resources`, { method: "GET", params });
  }

  /** 获取收藏资源列表 */
  static getCollectionResourceList(params: CollectionResourceListParams) {
    return Axios(`/v2/collections/resources`, { method: "GET", params });
  }

  /** 获取收藏资源列表 */
  static getResourceVersions(resourceId: string, params: { projection: string; sort: string }) {
    return Axios(`/v2/resources/${resourceId}/versions`, { method: "GET", params });
  }

  /** 获取资源版本文件 */
  static getResourceFile(resourceId: string, version: string) {
    return Axios(`/v2/resources/${resourceId}/versions/${version}/download`, { method: "GET" });
  }

  /** 检查依赖是否存在循环依赖 */
  static checkRelyCycle(resourceId: string, dependencies: { resourceId: string; versionRange: string }[]) {
    return Axios(`/v2/resources/${resourceId}/versions/cycleDependencyCheck`, {
      method: "POST",
      data: { dependencies },
    });
  }
}

/** Storage 类接口 */
export class StorageService {
  /** 获取存储对象 */
  static getStorageFile(sha1: string) {
    return Axios(`/v2/storages/files/${sha1}/download`, { method: "GET" });
  }

  /** 上传存储对象 */
  static uploadStorageFile(file: File, config: AxiosRequestConfig = {}) {
    const data = new FormData();
    data.append("file", file);

    return Axios(`/v2/storages/files/upload`, {
      method: "POST",
      headers: { "Content-Type": "multipart/form-data" },
      data,
      ...config,
    });
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
  static getObjectFile(objectId: string) {
    return Axios(`/v2/storages/objects/${objectId}/file`, { method: "GET" });
  }

  /** 获取存储对象详情 */
  static getObjectDetail(objectIdOrName: string) {
    return Axios(`/v2/storages/objects/${encodeURIComponent(objectIdOrName)}`, { method: "GET" });
  }
}

/** Contract 类接口 */
export class ContractService {
  /** 获取合约数据 */
  static getContractData(contractId: string, params?: ContractsParams) {
    return Axios(`/v2/contracts/${contractId}`, { method: "GET", params });
  }

  /** 批量查询合约列表 */
  static getContractsBatch(params: BatchContractsParams) {
    return Axios(`/v2/contracts/list`, { method: "GET", params });
  }

  /** 获取合约流转记录 */
  static getContractTransitionRecords(contractId: string, params: ListParams) {
    return Axios(`/v2/contracts/${contractId}/transitionRecords`, {
      method: "GET",
      params: { ...params, isTranslate: 1 },
    });
  }

  /** 批量获取合约最后一条流转记录 */
  static getContractTransitionRecordBatch(contractIds: string[]) {
    return Axios(`/v2/contracts/contractsTransitionRecord`, { method: "POST", data: { contractIds, isTranslate: 1 } });
  }

  /** 批量创建合约 */
  static createContractBatch(data: createContractBatchParams) {
    return Axios(`/v2/contracts/batchSign`, { method: "POST", data });
  }

  /** 支付合约 */
  static payContract(contractId: string, data: PayContractParams) {
    return Axios(`/v2/contracts/${contractId}/events/payment`, { method: "POST", data });
  }
}

/** Account 类接口 */
export class AccountService {
  /** 查询用户个人账户数据 */
  static getUserAccount(userId: number) {
    return Axios(`/v2/accounts/individualAccounts/${userId}`, { method: "GET" });
  }
}

/** Transaction 类接口 */
export class TransactionService {
  /** 查询交易记录 */
  static getTransactionRecord(recordId: number) {
    return Axios(`/v2/transactions/records/${recordId}`, { method: "GET" });
  }
}
