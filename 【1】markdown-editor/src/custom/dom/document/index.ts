/** 编辑器自定义元素-文档 */

import "./index.scss";
import { h, VNode } from "snabbdom";
import { ResourceToolbar } from "../toolbar";
import { CustomResourceData } from "@/typings/object";
import { I18n } from "@/api/I18n";
import { useStore } from "@/store";

/** 文档资源 DOM */
export const DocumentResource = (data: CustomResourceData, editor: any): VNode => {
  if (data.originType === 3) {
    // 无效依赖（不存在依赖或类型错误依赖）
    return h("div.invalid-document", {}, [
      h("div.main-area", {}, [
        // 默认 ui
        h("div.row", {}, [h("div.mini"), h("div.mini")]),
        h("div.row", {}, [h("div.small"), h("div.small"), h("div.small")]),
        h("div.row", {}, [h("div.large"), h("div.large")]),
        h("div.row", {}, [h("div.middle")]),
      ]),
      h("div.invalid-tip", {}, [
        I18n("posteditor_insert_error_invalid", {
          ContentInfo: data.resourceName,
        }),
      ]),
    ]);
  } else if (data.authType === 3) {
    // 已授权通过
    return h("div.authorized-document", {}, [
      ResourceToolbar(data, editor),
      // 文档
      h("div.document-area", { props: { innerHTML: data.content } }, [h("div#docContent")]),
    ]);
  } else {
    // 未授权通过
    return h("div.unauthorized-document", {}, [
      ResourceToolbar(data, editor),
      h("div.main-area", {}, [
        // 默认 ui
        h("div.row", {}, [h("div.mini"), h("div.mini")]),
        h("div.row", {}, [h("div.small"), h("div.small"), h("div.small")]),
        h("div.row", {}, [h("div.large"), h("div.large")]),
        h("div.row", {}, [h("div.middle")]),
        AuthStatus(data, editor),
      ]),
    ]);
  }
};

/** 授权状态遮罩 */
const AuthStatus = (data: CustomResourceData, editor: any): VNode => {
  if (!data.authType) {
    return h("div");
  }

  const store = useStore();
  
  const authStatusMapping = {
    1: h("div.document-auth", {}, [
      h("div.tip", {}, [h("i.freelog fl-icon-suoding"), h("div.auth-text", {}, [I18n("insert_msg_getauth")])]),
      h(
        "div.auth-btn",
        {
          on: {
            click() {
              store.editorFuncs.setPolicyDrawer(true, data);
            },
          },
        },
        [I18n("insert_toolbar_btn_getauth")]
      ),
    ]),
    2: h("div.document-auth", {}, [
      h("div.tip", {}, [h("i.freelog fl-icon-suoding"), h("div.auth-text", {}, [I18n("insert_msg_noauth")])]),
      h(
        "div.auth-btn",
        {
          on: {
            click() {
              store.editorFuncs.setPolicyDrawer(true, data);
            },
          },
        },
        [I18n("insert_toolbar_btn_authmanager")]
      ),
    ]),
    3: h("div"),
    4: h("div.document-auth", {}, [
      h("div.tip upcast", {}, [h("i.freelog fl-icon-shangpao"), h("div.auth-text", {}, [I18n("insert_msg_upcasted")])]),
      h(
        "div.auth-btn",
        {
          on: {
            click() {
              store.editorFuncs.setPolicyDrawer(true, data);
            },
          },
        },
        [I18n("insert_toolbar_btn_authmanager")]
      ),
    ]),
    5: h("div.document-auth", {}, [
      h("div.tip upcast", {}, [h("div.auth-text", {}, [I18n("mdeditor_auth_abnormal")])]),
      h(
        "div.auth-btn",
        {
          on: {
            click() {
              store.editorFuncs.setPolicyDrawer(true, data);
            },
          },
        },
        [I18n("insert_toolbar_btn_authmanager")]
      ),
    ]),
    6: h("div.document-auth", {}, [
      h("div.tip upcast", {}, [h("div.auth-text", {}, [I18n("posteditor_import_addrely_msg")])]),
      h(
        "div.auth-btn",
        {
          on: {
            click() {
              const target = {
                id: data.resourceId,
                name: data.resourceName,
                type: "resource",
                versionRange: data.version || data.latestVersion,
              };
              store.editorFuncs.addRely(target);
              store.editorFuncs.setPolicyDrawer(true, data);
            },
          },
        },
        [I18n("posteditor_import_addrely_btn")]
      ),
    ]),
  };

  return authStatusMapping[data.authType];
};
