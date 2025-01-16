import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import { useStore } from "@/store";
import lazyPlugin from "vue3-lazy";
import { start } from "qiankun";

const myWindow: any = window;

const pinia = createPinia();
let instance: any = null;

if (myWindow.__POWERED_BY_QIANKUN__) {
  start({ sandbox: { strictStyleIsolation: true } });
}

async function render(props: any = {}) {
  const { container } = props;
  instance = createApp(App);
  instance = createApp(App).use(pinia).use(ElementPlus).use(lazyPlugin, {});
    const store = useStore();
  await store.initStoreData(props);
  instance.mount(container ? container.querySelector("#app") : "#app");
}

if (!myWindow.__POWERED_BY_QIANKUN__ && !myWindow.__MICRO_APP_ENVIRONMENT__) {
  // 独立运行
  render();
}

export async function bootstrap() {
  console.log("[comic tool] bootstraped");
}

export async function mount(props: any) {
  console.log("[comic tool] mounted");
  render(props);
}

export async function unmount() {
  console.log("[comic tool] unmounted");
  instance.unmount();
  instance._container.innerHTML = "";
  instance = null;
}

// 京东 mount
(window as any).mount = () => {
  console.log("[comic tool in microApp] mounted");
  render();
}


// 京东 卸载
(window as any).unmount = () => {
  console.log("[comic tool in microApp] unmounted");
  instance.unmount()
  instance._container.innerHTML = "";
  instance = null;
}