/** 编辑器自定义元素-图片 */

import "./index.scss";
import { h, VNode } from "snabbdom";
import { ResourceToolbar } from "../toolbar";
import { DEFAULT_COVER } from "@/assets/data";
import { CustomResourceData } from "@/typings/object";
import { hashImgUrl } from "@/utils/common";
import { I18n } from "@/api/I18n";
import { useStore } from "@/store";

/** 图片资源 DOM */
export const ImageResource = (data: CustomResourceData, editor: any): VNode => {
  if (data.originType === 3) {
    // 无效依赖（不存在依赖或类型错误依赖）
    const cover = (data.coverImages && data.coverImages[0]) || DEFAULT_COVER;

    return h("div.invalid-image", {}, [
      h("div.main-area", {}, [
        h("div.cover", {}, [
          h("img", { props: { src: cover }, style: getCoverStyle(cover) }),
          h("div.invalid-tip", {}, [
            I18n("posteditor_insert_error_invalid", {
              ContentInfo: data.resourceName,
            }),
          ]),
        ]),
      ]),
    ]);
  } else if ((data.originType === 1 && data.authType === 3) || data.originType === 2) {
    // 授权通过的资源或对象/url
    return h("div.authorized-image", {}, [
      ResourceToolbar(data, editor),
      // 图片
      h("div.image-area", {}, [h("img", { props: { src: data.content } })]),
    ]);
  } else {
    // 未授权通过的资源
    const cover = (data.coverImages && data.coverImages[0]) || DEFAULT_COVER;

    return h("div.unauthorized-image", {}, [
      ResourceToolbar(data, editor),
      h("div.main-area", {}, [
        // 封面
        h("div.cover", {}, [
          h("img", { props: { src: cover }, style: getCoverStyle(cover) }),
          AuthStatus(data, editor),
        ]),
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
    1: h("div.image-auth", {}, [
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
    2: h("div.image-auth", {}, [
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
    4: h("div.image-auth", {}, [
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
    5: h("div.image-auth", {}, [
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
    6: h("div.image-auth", {}, [
      h("div.auth-text", {}, [I18n("posteditor_import_addrely_msg")]),
      h(
        "div.auth-btn",
        {
          on: {
            click() {
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

/** 通过封面图 url 获取封面图片样式 */
const getCoverStyle = (cover: string) => {
  let coverStyle = { width: "100%", height: "100%", transform: "none" };
  if (cover.includes("#")) {
    const { x, y, w, width: wh, height: ht } = hashImgUrl(cover);
    const scale: number = 400 / w;
    coverStyle = {
      width: wh * scale + "px",
      height: ht * scale + "px",
      transform: `translateX(${-x * scale}px) translateY(${-y * scale}px)`,
    };
  }

  return coverStyle;
};
