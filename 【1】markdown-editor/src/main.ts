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

start({ sandbox: { strictStyleIsolation: false } });

async function render(props: any = {}) {
  const { container } = props;
  instance = createApp(App).use(pinia).use(ElementPlus).use(lazyPlugin, {});
  const store = useStore();
  await store.initStoreData(props);
  instance.mount(container ? container.querySelector("#app") : "#app");
}

if (!myWindow.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {
  console.log("[markdown editor] bootstraped");
}

export async function mount(props: any) {
  console.log("[markdown editor] mounted");
  render(props);
}

export async function unmount() {
  console.log("[markdown editor] unmounted");
  instance.unmount();
  instance._container.innerHTML = "";
  instance = null;
}
