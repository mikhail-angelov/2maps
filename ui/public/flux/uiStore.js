import { Store } from "./store.js";
import { parseUrlParams } from "../urlParams.js";
import { loadOpacity, saveOpacity } from "../storage.js";

export class UiStore extends Store {
  opacity = 50;
  leftWidth = 50;

  constructor() {
    super();
    const { opacity } = parseUrlParams();
    if (opacity) {
      this.setOpacity(+opacity);
    }else{
      this.setOpacity(loadOpacity()||100);
    }
  }

  setOpacity(value) {
    this.opacity = value;
    saveOpacity(value);
    this.refresh();
  }
  setLeftWidth(value) {
    this.leftWidth = value;
    this.refresh();
  }
}
