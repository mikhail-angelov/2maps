const STORE_REFRESH = "STORE_REFRESH";
export class Store {
  subscribers = {};

  on(event, handler) {
    const handlers = this.subscribers[event] || [];
    this.subscribers[event] = [...handlers, handler];
    return () => {
      this.subscribers[event] = this.subscribers[event].filter(
        (item) => item !== handler
      );
    };
  }
  off(event, handler) {
    const handlers = this.subscribers[event] || [];
    this.subscribers[event] = handlers.filter((item) => item !== handler);
  }
  emit(event, data) {
    const handlers = this.subscribers[event] || [];
    handlers.forEach((handler) => handler(event, data));
  }
  onRefresh(handler) {
    this.on(STORE_REFRESH, handler);
  }
  refresh() {
    this.emit(STORE_REFRESH, null);
  }
}
