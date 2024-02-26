import { html, render, Component } from "../libs/htm.js";
import { isMobile } from "../utils.js";
import { parseUrlParams } from "../urlParams.js";
import { IconButton } from "./common.js";
import { savePanelWidth, loadPanelWidth } from "../storage.js";
import { Marks } from "./marks.js";
import { Tracks } from "./tracks.js";
// import "../libs/qrcode.js";

export const createLeftPanel = ({
  yandexMap,
  secondMap,
  markerStore,
  trackStore,
  authStore,
}) => {
  const panel = { refresh: () => {}, addItems: () => {}, addTrack: () => {} };
  const marks = new Marks(panel, markerStore);
  const tracks = new Tracks({ yandexMap, secondMap, panel, trackStore });
  panel.addItems = (items) => marks.addItems(items);
  panel.addTrack = (track) => tracks.addTrack(track);
  let authenticated = authStore.isAuthenticated();

  authStore.subscribeAuth(() => {
    authenticated = authStore.isAuthenticated();
    console.log("on auth update", authenticated);
    panel.refresh();
  });

  const { resetToken } = parseUrlParams();
  if (resetToken) {
    authStore.showPasswordReset();
  }

  const MARKS_TAB = "marks";
  const TRACKS_TAB = "tracks";
  class LeftPanel extends Component {
    componentDidMount() {
      panel.refresh = this.refresh.bind(this);
      this.setShowPanel(!isMobile());
      this.setState({
        showPanel: !isMobile(),
        refresh: Date.now(),
        mapUrl: "",
        tab: MARKS_TAB,
        panelWidth: loadPanelWidth(),
        sliderIsPressed: false,
      });
      document
        .querySelector("body")
        .addEventListener("mouseup", () =>
          this.setState({ sliderIsPressed: false })
        );
      document.querySelector("body").addEventListener("mousemove", (e) => {
        if (this.state.sliderIsPressed) {
          const panelWidth = Math.max(e.clientX - 8, 50);
          this.setState({ panelWidth });
          savePanelWidth(panelWidth);
        }
      });
    }

    refresh() {
      this.setState({ refresh: Date.now() });
    }

    setShowPanel(value) {
      this.setState({ showPanel: value });
    }

    onShowQR() {
      location.href = "/admin";
      // const typeNumber = 4;
      // const errorCorrectionLevel = 'L';
      // const qr = window.qrcode(typeNumber, errorCorrectionLevel);
      // const map = 'test'
      // const mapUrl = `${location.origin}/download/${map}`
      // qr.addData(mapUrl);
      // qr.make();
      // document.getElementById('qr').innerHTML = qr.createImgTag();
      // this.setState({ mapUrl })
    }
    onCloseQR() {
      document.getElementById("qr").innerHTML = "";
      this.setState({ mapUrl: "" });
    }

    render({}, { showPanel, mapUrl, tab, panelWidth }) {
      if (showPanel) {
        return html` <div class="placemark" style="width:${panelWidth}px">
        <div class="header">
          <button class="tab ${
            tab === MARKS_TAB ? "active" : ""
          }" onClick=${() => this.setState({ tab: MARKS_TAB })}>Метки</button>
          <button class="tab ${
            tab === TRACKS_TAB ? "active" : ""
          }" onClick=${() => this.setState({ tab: TRACKS_TAB })}>Треки</button>
          <${IconButton}
            icon="assets/backArrow.svg"
            onClick=${() => this.setShowPanel(false)}
          />
        </div>
        ${tab === MARKS_TAB ? marks.render() : tracks.render()}

        <div class="footer">
        <div class="auth-sync">
        ${
          authenticated
            ? html` <button
                  class="icon-button footer-button"
                  onClick=${() => this.onShowQR()}
                >
                  閙
                </button>
                <div class="qr">
                  ${mapUrl
                    ? html`<button
                        class="icon-button footer-button qr-close"
                        onClick=${() => this.onCloseQR()}
                      >
                        ✕
                      </button>`
                    : null}
                  <div id="qr"></div>
                </div>
                <button
                  class="icon-button footer-button"
                  onClick=${() => authStore.logout()}
                >
                  Logout
                </button>`
            : html`<button
                  class="icon-button footer-button"
                  onClick=${() => authStore.showLogin()}
                >
                  Login</button
                >/
                <button
                  class="icon-button footer-button"
                  onClick=${() => authStore.showSignUp()}
                >
                  Sign Up
                </button>`
        }
        </div>
        <a class="link" href="http://www.etomesto.ru/">карты c etomesto.ru</a>
        <a class="link" href="https://github.com/mikhail-angelov/mapnn">
        <img src="assets/github.svg"></img>исходники
        </a>
        </div>
        <div class="slider-panel"><div class="slider" onMouseDown=${() =>
          this.setState({ sliderIsPressed: true })} /></div>
      </div>`;
      }
      return html`<${IconButton}
        class="icon-button footer-button"
        icon="assets/rightArrow.svg"
        onClick=${() => this.setShowPanel(true)}
      />`;
    }
  }

  render(html`<${LeftPanel} />`, document.getElementById("left-panel"));

  return panel;
};
