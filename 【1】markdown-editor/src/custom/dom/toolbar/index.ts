/** 编辑器自定义元素组件-工具栏 */

import "./index.scss";
import { h, VNode } from "snabbdom";
import { I18n } from "@/api/I18n";
import { CustomResourceData } from "@/typings/object";
import { getDomain, toDetail } from "@/utils/common";
import { useStore } from "@/store";

/** 资源工具栏 */
export const ResourceToolbar = (data: CustomResourceData, editor: any): VNode => {
  const { originType, resourceName, resourceTitle, resourceId, content } = data;
  
  if (originType === 1) {
    return h("div.resource-toolbar", {}, [
      h("div.toolbar", {}, [
        h("div.type", {}, [I18n("insert_toolbar_type_resource")]),
        h(
          "div.name",
          {
            title: resourceTitle ? resourceTitle : resourceName,
            on: {
              click() {
                resourceId && toDetail(resourceId);
              },
            },
          },
          [resourceTitle ? resourceTitle : resourceName]
        ),
        AuthStatus(data, editor),
      ]),
    ]);
  } else if (originType === 2) {
    return h("div.resource-toolbar", {}, [
      h("div.toolbar", {}, [
        h("div.type", {}, [I18n("insert_toolbar_type_url")]),
        h("div.url", { title: content }, [content]),
        AuthStatus(data, editor),
      ]),
    ]);
  } else {
    return h("div");
  }
};

/** 工具栏授权状态 */
const AuthStatus = (data: CustomResourceData, editor: any): VNode => {
  if (!data.authType) {
    return h("div");
  }

  const store = useStore();

  const authStatusMapping = {
    1: h("div.toolbar-auth", {}, [
      h(
        "div.authorize-btn",
        {
          on: {
            click() {
              if (store.appMode === 'preview') return;
              store.editorFuncs.setAuthorizationProcessorDrawer(true, data);
            },
          },
        },
        [I18n("insert_toolbar_btn_getauth")]
      ),
    ]),
    2: h("div.toolbar-auth", {}, [
      h("i.freelog fl-icon-suoding"),
      h("div.auth-text unauthorized-text", {}, [I18n("mdeditor_auth_noauth")]),
      h(
        "div.authorize-btn",
        {
          on: {
            click() {
              if (store.appMode === 'preview') return;
              store.editorFuncs.setAuthorizationProcessorDrawer(true, data);
            },
          },
        },
        [I18n("insert_toolbar_btn_authmanager")]
      ),
    ]),
    3: h("div.toolbar-auth", {}, [
      h("i.freelog fl-icon-a-chenggongzhengqueduigou1"),
      h("div.auth-text authorize-text", {}, [I18n("mdeditor_auth_authorized")]),
      h(
        "div.authorize-btn",
        {
          on: {
            click() {
              if (store.appMode === 'preview') return;
              store.editorFuncs.setAuthorizationProcessorDrawer(true, data);
            },
          },
        },
        [I18n("insert_toolbar_btn_authmanager")]
      ),
    ]),
    4: h("div.toolbar-auth", {}, [
      h("i.freelog fl-icon-shangpao"),
      h("div.auth-text upcast-text", {}, [I18n("mdeditor_auth_upcasted")]),
      h(
        "div.authorize-btn",
        {
          on: {
            click() {
              if (store.appMode === 'preview') return;
              store.editorFuncs.setAuthorizationProcessorDrawer(true, data);
            },
          },
        },
        [I18n("insert_toolbar_btn_authmanager")]
      ),
    ]),
    5: h("div.toolbar-auth", {}, [
      h("div.auth-text upcast-text", {}, [I18n("mdeditor_auth_abnormal")]),
      h(
        "div.authorize-btn",
        {
          on: {
            click() {
              if (store.appMode === 'preview') return;
              store.editorFuncs.setAuthorizationProcessorDrawer(true, data);
            },
          },
        },
        [I18n("insert_toolbar_btn_authmanager")]
      ),
    ]),
    6: h("div"),
  };

  return authStatusMapping[data.authType];
};
