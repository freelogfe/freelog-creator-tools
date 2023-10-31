/**
 * 普通对象类型接口
 */

import { UploadRawFile } from "element-plus";
import { AuthStatus, FsmRunningStatus } from "./type";

/** i18n */
export interface I18N {
  'en-us': Record<string, string>;
  'zh-cn': Record<string, string>;
}

/** 用户数据 */
export interface User {
  email: string;
  mobile: string;
  headImage: string;
  userType: number;
  status: number;
  username: string;
  userId: number;
  tokenSn: string;
  createDate: string;
  userDetail: {
    sex: number;
    birthday: string;
    occupation: string;
    areaCode: string;
    areaName: string;
    latestLoginDate: string;
    latestLoginIp: string;
    reason: string;
    remark: string;
    intro: string;
    statusChangeRemark: string;
    createDate: string;
    updateDate: string;
  };
}

/** 资源数据 */
export interface Resource {
  resourceId: string;
  resourceType: string[];
  latestVersion: string;
  subjectType: number;
  intro: string;
  coverImages: string[];
  tags: string[];
  status: number;
  latestVersionReleaseDate: string;
  resourceName: string;
  resourceTypeCode: string;
  userId: number;
  username: string;
  resourceVersions: { version: string; versionId: string; createDate: string }[];
  baseUpcastResources: string[];
  policies: { policyId: string; policyName: string; status: number }[];
  createDate: string;
  updateDate: string;
  resourceTitle: string;
  version: string;
  description: string;
  fileSha1: string;
  filename: string;
  dependencies: { resourceId: string; versionRange: string; resourceName: string }[];
  resolveResources: {
    resourceId: string;
    contracts: { policyId: string; contractId: string }[];
    resourceName: string;
  }[];
  upcastResources: any[];
  versionId: string;
  systemProperty: Record<string, unknown>;
  systemPropertyDescriptors: any[];
  customProperty: Record<string, unknown>;
  customPropertyDescriptors: any[];
}

/** 资源草稿基础属性数据 */
export interface BaseProperties {
  key: string;
  value: string;
  description: string;
}

/** 资源草稿自定义选项数据 */
export interface CustomOptions {
  key: string;
  description: string;
  custom: string;
  defaultValue: string;
  customOption: string;
}

/** 资源草稿数据 */
export interface ResourceDraft {
  versionInput: string;
  selectedFileInfo: { name: string; sha1?: string; from?: string } | null;
  additionalProperties: { key: string; value: string }[];
  customProperties: { key: string; name: string; value: string; description: string }[];
  customConfigurations: {
    key: string;
    name: string;
    description: string;
    type: "input" | "select";
    input: string;
    select: string[];
  }[];
  directDependencies: { id: string; name: string; type: string; versionRange?: string }[];
  baseUpcastResources: { resourceID: string; resourceName: string }[];
  descriptionEditorInput: string;
  baseProperties?: BaseProperties[];
  customOptionsData?: CustomOptions[];
}

/** 存储对象数据 */
export interface BucketObject {
  resourceType: string[];
  resourceTypeCode: string;
  sha1: string;
  objectName: string;
  bucketId: string;
  bucketName: string;
  userId: number;
  systemProperty: Record<string, unknown>;
  systemPropertyDescriptors: any[];
  customPropertyDescriptors: any[];
  dependencies: { name: string; type: string }[];
  createDate: string;
  updateDate: string;
  objectId: string;
  customProperty: Record<string, unknown>;
  uploadStatus: string;
}

/** 合约流转记录事件数据 */
export interface TransitionRecordsEvent {
  content: string;
  origin: {
    args: { amount: number; account: string };
    code: string;
    description: string;
    id: string;
    isSingleton: boolean;
    name: string;
    service: string;
    toState: string;
  };
}

/** 合约流转记录数据 */
export interface TransitionRecord {
  id: string;
  serviceStates: AuthStatus;
  time: string;
  stateStr: string;
  stateInfoStr: string;
  eventStr: string;
  eventSelectStr: string;
  eventSectionStrs: string[];
  eventSectionEntities: TransitionRecordsEvent[];
  contractId?: string;
  total?: number;
}

/** 策略数据 */
export interface Policy {
  status: number;
  policyId: string;
  subjectType: number;
  policyText: string;
  fsmDeclarationInfo: {
    serviceStates: { name: string; type: string }[];
    symbolArgs: { envArgs: string[] };
    audiences: { name: string; type: string }[];
  };
  fsmDescriptionInfo: {
    initial: {
      transitions: {
        toState: string;
        service: string;
        name: string;
        args: { amount: number; account: string };
        code: string;
        isSingleton: boolean;
        eventId: string;
      }[];
      serviceStates: [];
      isInitial: boolean;
      isAuth: boolean;
      isTestAuth: boolean;
    };
    auth: {
      transitions: {
        toState: string;
        service: string;
        name: string;
        args: { amount: number; account: string };
        code: string;
        isSingleton: boolean;
        eventId: string;
      }[];
      serviceStates: [];
      isAuth: boolean;
      isTestAuth: boolean;
    };
  };
  createDate: string;
  updateDate: string;
  translateInfo: { content: string };
}

/** 合约数据 */
export interface Contract {
  contractId: string;
  fsmCurrentState: string;
  fsmCurrentStateColors: unknown[];
  fsmRunningStatus: FsmRunningStatus;
  authStatus: AuthStatus;
  status: number;
  licensorId: string;
  licensorName: string;
  licensorOwnerId: number;
  licensorOwnerName: string;
  licenseeId: string;
  licenseeName: string;
  licenseeOwnerId: number;
  licenseeOwnerName: string;
  licenseeIdentityType: number;
  subjectId: string;
  subjectName: string;
  subjectType: number;
  contractName: string;
  policyId: string;
  createDate: string;
  fsmDeclarations: { envArgs: { name: string; accountId: string; ownerName: string }[] };
  updateDate: string;
  isDefault: boolean;
  isAuth: boolean;
  isTestAuth: boolean;
  policyInfo: Policy;
  transitionRecord: TransitionRecord;
}

/** 资源版本数据 */
export interface ResourceVersion {
  version: string;
  versionId: string;
  createDate: string;
  filename: string;
  updateDate: string;
}

/** 依赖数据 */
export interface Dep {
  resourceId: string;
  resourceType: string[];
  latestVersion: string;
  subjectType: number;
  intro: string;
  coverImages: string[];
  tags: string[];
  status: number;
  latestVersionReleaseDate: string;
  resourceName: string;
  resourceTypeCode: string;
  userId: number;
  username: string;
  resourceVersions: ResourceVersion[];
  baseUpcastResources: string[];
  policies: Policy[];
  createDate: string;
  updateDate: string;
  resourceTitle: string;
  versionRange: string;
  activeContracts: Contract[];
  terminatedContracts: Contract[];
  enabledPolicies: Policy[];
  selectPolicies: Policy[];
  upcastList: Dep[];
  error: string;
  warning: string;
}

/** 自定义 - 封面样式数据 */
export interface CoverStyleData {
  width: string;
  height: string;
  translateX: string;
  translateY: string;
}

/** 自定义 - 资源 dom 数据 */
export interface CustomResourceData {
  originType: 1 | 2 | 3; // 来源类型 1-资源 2-对象/url（这两种都输出 url） 3-无效依赖（不存在依赖或类型错误依赖）
  resourceId?: string;
  resourceName?: string;
  coverImages?: string[];
  resourceType: string[];
  latestVersion?: string;
  version?: string;
  authType?: 1 | 2 | 3 | 4 | 5 | 6; // 1-未签约；2-已签约未授权；3-已授权；4-上抛；5-授权链异常；6-未加入依赖队列
  content: string; // url（媒体资源）/ 内容（文本资源）
  type?: "resource";
  children?: any[];
}

/** 自定义 - 上传文件数据 */
export interface UploadFileData {
  name: string;
  content: string;
}

/** 自定义 - 存储对象上传数据 */
export interface UploadBucketObjectData {
  uid: number;
  sha1: string;
  name: string;
  file: UploadRawFile;
  bucketName: string;
  uploadStatus: string;
  progress: number;
  sameName: boolean;
  cancel: null | (() => void);
}

/** 自定义 - 支付数据 */
export interface PayData {
  id: string;
  amount: number;
  subjectName: string;
  contractId: string;
  contractName: string;
  licensorOwnerName: string;
  userId: number;
}
