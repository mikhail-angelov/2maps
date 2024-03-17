import { Store } from './store.js';
import { parseUrlParams } from '../urlParams.js';
import {
  loadOpacity, saveOpacity, loadPanelWidth, savePanelWidth,
} from '../storage.js';

export const UI_EVENTS = {
  OPACITY: 'OPACITY',
  LEFT_WIDTH: 'LEFT_WIDTH',
};

export class UiStore extends Store {
  opacity = 50;

  leftWidth = 200;

  constructor() {
    super();
    const { opacity } = parseUrlParams();
    this.leftWidth = loadPanelWidth() || 200;
    if (opacity) {
      this.setOpacity(+opacity);
    } else {
      this.setOpacity(loadOpacity() || 100);
    }
  }

  setOpacity(value) {
    this.opacity = value;
    saveOpacity(value);
    this.emit(UI_EVENTS.OPACITY, value);
  }

  setLeftWidth(value) {
    this.leftWidth = value;
    savePanelWidth(value);
    this.emit(UI_EVENTS.LEFT_WIDTH, value);
  }
}
