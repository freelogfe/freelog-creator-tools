/** 编辑器自定义元素-音频 */

import "./index.scss";
import { h, VNode } from "snabbdom";
import { ResourceToolbar } from "../toolbar";
import { CustomResourceData } from "@/typings/object";
import { I18n } from "@/api/I18n";
import { useStore } from "@/store";

/** 音频资源 DOM */
export const AudioResource = (data: CustomResourceData, editor: any): VNode => {
  const { originType, content, resourceName, authType } = data;
  if (originType === 3) {
    // 无效依赖（不存在依赖或类型错误依赖）
    return h("div.invalid-audio", {}, [
      h("div.audio-area", {}, [
        h("audio", {
          props: {
            src: content,
            controls: true,
            controlsList: "nodownload",
          },
        }),
        h("div.invalid-tip", {}, [
          I18n("posteditor_insert_error_invalid", {
            ContentInfo: resourceName,
          }),
        ]),
      ]),
    ]);
  } else {
    return h("div.audio-wrapper", {}, [
      ResourceToolbar(data, editor),
      // 音频
      h("div.audio-area", {}, [
        h("audio", {
          props: {
            src: authType === 3 || originType === 2 ? content : "",
            controls: true,
            controlsList: "nodownload",
          },
        }),
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
    1: h("div.audio-auth", {}, [
      h("i.freelog fl-icon-suoding"),
      h("div.auth-text", {}, [I18n("insert_msg_getauth")]),
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
    2: h("div.audio-auth", {}, [
      h("i.freelog fl-icon-suoding"),
      h("div.auth-text", {}, [I18n("insert_msg_noauth")]),
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
    4: h("div.audio-auth upcast", {}, [
      h("i.freelog fl-icon-shangpao"),
      h("div.auth-text", {}, [I18n("insert_msg_upcasted")]),
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
    5: h("div.audio-auth upcast", {}, [
      h("div.auth-text", {}, [I18n("mdeditor_auth_abnormal")]),
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
    6: h("div.audio-auth upcast", {}, [
      h("div.auth-text", {}, [I18n("posteditor_import_addrely_msg")]),
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
